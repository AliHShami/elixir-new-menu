/* ============================================================
   ELIXIR in-store menu — kiosk app
   Plain vanilla JS. No framework, no build step, no router.
   ============================================================ */

/* ---------- Everything tweakable lives here ---------- */

const CONFIG = {
  arabicEnabled: true,   // false → English only: no RTL, no Arabic font
  idleTimeoutMs: 60_000,
  defaultLang: "en",
  placeholderImage: "assets/placeholder.png",   // stands in for a missing photo
};


/* ---------- All UI copy. Never inline a user-facing string in markup.
              The Arabic column is a draft, pending review. ---------- */

const STRINGS = {
  tagline:    { en: "Where wellbeing is a", ar: "حيث العافية" },
  tagline_em: { en: "full experience", ar: "تجربة متكاملة" },
  start:      { en: "Click to start your journey", ar: "اضغط لتبدأ رحلتك" },
  brand:      { en: "ELIXIR", ar: "ELIXIR" },
  back:       { en: "Back", ar: "رجوع" },

  s1_head: { en: "Pick your function.", ar: "اختر هدفك." },
  s1_sub: {
    en: "Start with what you need most. Choose a function that fits how you want to feel today.",
    ar: "ابدأ بما تحتاجه أكثر. اختر ما يناسب شعورك اليوم.",
  },

  s2_head: { en: "Pick your pour.", ar: "اختر شكل مشروبك." },
  s2_sub: {
    en: "Now choose how you'd like to enjoy your ELIXIR. Pick the format that suits your mood.",
    ar: "الآن اختر الطريقة التي تحب أن تستمتع بها بمشروب ELIXIR. اختر الشكل الذي يناسب مزاجك.",
  },

  s3_head: { en: "Pick your taste.", ar: "اختر نكهتك." },
  s3_sub: {
    en: "Explore our ready-made flavours and find the one that suits your taste best.",
    ar: "اكتشف نكهاتنا الجاهزة واختر ما يناسب ذوقك.",
  },

  restart:  { en: "Back to the start", ar: "العودة إلى البداية" },
  currency: { en: "JOD", ar: "JOD" },
};


/* ---------- State ---------- */

const state = {
  lang: CONFIG.arabicEnabled ? CONFIG.defaultLang : "en",
  screen: "intro",
  category: null,
  format: null,
};

let menu = null;

const els = {
  body: document.body,
  root: document.documentElement,
  live: document.getElementById("live-region"),
  backBtn: document.getElementById("back-btn"),
  introHit: document.getElementById("intro-hit"),
  categoryGrid: document.getElementById("category-grid"),
  formatGrid: document.getElementById("format-grid"),
  drinkGrid: document.getElementById("drink-grid"),
  restartBtn: document.getElementById("restart-btn"),
};


/* ---------- Helpers ---------- */

function t(key) {
  const entry = STRINGS[key];
  if (!entry) return "";
  return entry[state.lang] ?? entry.en;
}

/** Picks the field for the current language off any menu.json record. */
function localised(record, field) {
  return record[`${field}_${state.lang}`] || record[`${field}_en`] || "";
}

function el(tag, className, attrs) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (attrs) for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

/** White-PNG tinting via CSS mask, driven by --src and --tint.
 *
 *  The url() ends up in a custom property that css/styles.css substitutes into
 *  `mask:`, and browsers resolve it against the *stylesheet's* base URL — so a
 *  plain "assets/brand/x.png" gets fetched as "css/assets/brand/x.png" and
 *  404s. Resolving against document.baseURI first removes the ambiguity.
 *  Authored paths stay relative; only what reaches the mask is absolute, so
 *  this still works from a project sub-path like user.github.io/repo/. */
function tint(node, src, colour) {
  const resolved = new URL(src, document.baseURI).href;
  node.style.setProperty("--src", `url("${resolved}")`);
  node.style.setProperty("--tint", colour);
}

/** Applies the tint declared by data-tint-src / data-tint in the markup. */
function tintFromMarkup(root = document) {
  root.querySelectorAll("[data-tint-src]").forEach((node) => {
    tint(node, node.dataset.tintSrc, node.dataset.tint);
  });
}


/* ---------- Language ---------- */

function applyStrings(root = document) {
  root.querySelectorAll("[data-str]").forEach((node) => {
    node.textContent = t(node.dataset.str);
  });
  root.querySelectorAll("[data-str-aria]").forEach((node) => {
    node.setAttribute("aria-label", t(node.dataset.strAria));
  });
}

function applyLanguage() {
  els.root.lang = state.lang;
  els.root.dir = CONFIG.arabicEnabled && state.lang === "ar" ? "rtl" : "ltr";
  applyStrings();
  renderCurrentScreen();
}


/* ---------- Navigation ---------- */

const SCREEN_HEADINGS = { s1: "s1_head", s2: "s2_head", s3: "s3_head" };

function goTo(screen) {
  state.screen = screen;
  els.body.dataset.screen = screen;
  window.scrollTo(0, 0);
  renderCurrentScreen();
  announce(screen === "intro" ? t("start") : t(SCREEN_HEADINGS[screen]));
  resetIdleTimer();
}

function goBack() {
  if (state.screen === "s1") goTo("intro");
  else if (state.screen === "s2") goTo("s1");
  else if (state.screen === "s3") goTo("s2");
}

function restart() {
  // Leave the screen before clearing the selection it was rendered from.
  goTo("intro");
  state.category = null;
  state.format = null;
  if (CONFIG.arabicEnabled) state.lang = CONFIG.defaultLang;
  applyLanguage();
}

function announce(message) {
  if (!message) return;
  els.live.textContent = "";
  // A beat of empty content makes repeat announcements fire reliably.
  window.setTimeout(() => { els.live.textContent = message; }, 60);
}


/* ---------- Rendering ---------- */

function renderCurrentScreen() {
  if (!menu) return;
  if (state.screen === "s1") renderCategories();
  if (state.screen === "s2" && state.category) renderFormats();
  if (state.screen === "s3" && state.category && state.format) renderDrinks();
}

function renderCategories() {
  const grid = els.categoryGrid;
  grid.textContent = "";

  menu.elixir_categories.forEach((category) => {
    const pill = el("button", "cat-pill", { type: "button" });
    pill.dataset.slug = category.slug;
    // Drives the pressed fill; the star below is tinted the same colour.
    pill.style.setProperty("--cat", category.color);

    const name = el("span", "cat-pill__name");
    name.textContent = localised(category, "name");

    const icon = el("span", "cat-pill__icon tinted", { "aria-hidden": "true" });
    tint(icon, category.icon, category.color);

    pill.append(name, icon);
    pill.addEventListener("click", () => selectCategory(category));
    grid.append(pill);
  });
}

function selectCategory(category) {
  state.category = category;
  state.format = null;
  goTo("s2");
}


/** The pour's photo, falling back to the placeholder when the file is not on
    disk — frappe.png and matcha.png, see TODO.md. The guard stops an endless
    loop if the placeholder itself ever goes missing. */
function photoFor(format) {
  const photo = el("img", "card__photo", { src: format.image, alt: "" });
  photo.addEventListener("error", () => {
    if (photo.dataset.fallback) return;
    photo.dataset.fallback = "true";
    photo.src = CONFIG.placeholderImage;
  });
  return photo;
}


/* --- 02: only the pours this category actually has, in formats-map order --- */

function renderFormats() {
  const grid = els.formatGrid;
  grid.textContent = "";

  const available = Object.keys(menu.formats)
    .filter((key) => Array.isArray(state.category.drinks[key]));

  available.forEach((key) => {
    const format = menu.formats[key];

    const card = el("button", "card", { type: "button" });
    card.dataset.format = key;

    const panel = el("span", "card__panel");
    panel.style.setProperty("--panel", format.color);

    panel.append(photoFor(format));

    const band = el("span", "card__band");
    const name = el("span", "card__name");
    name.textContent = localised(format, "name");
    band.append(name);

    card.append(panel, band);
    card.addEventListener("click", () => selectFormat(key));
    grid.append(card);
  });
}

function selectFormat(key) {
  state.format = key;
  goTo("s3");
}


/* --- 03: the drinks for the chosen category and pour --- */

/** "3 JOD", "3.75 JOD" — Latin numerals in both languages, no trailing zeros. */
function priceLabel(price) {
  return `${Number(price)} ${t("currency")}`;
}

function renderDrinks() {
  const grid = els.drinkGrid;
  grid.textContent = "";

  // No drink photography yet, so every drink borrows its pour's image.
  const format = menu.formats[state.format];

  (state.category.drinks[state.format] || []).forEach((drink) => {
    // The end of the journey: an <article>, not a <button>. Same structure as
    // a pour card, so a detail view can be added without a rewrite.
    const card = el("article", "card");

    const panel = el("span", "card__panel");
    panel.style.setProperty("--panel", drink.color);
    panel.append(photoFor(format));

    const band = el("span", "card__band");
    const name = el("span", "card__name");
    name.textContent = localised(drink, "name");
    const price = el("span", "card__price", { dir: "ltr" });
    price.textContent = priceLabel(drink.price);
    band.append(name, price);

    card.append(panel, band);
    grid.append(card);
  });
}


/* ---------- Idle reset ---------- */

let idleTimer = null;

function resetIdleTimer() {
  window.clearTimeout(idleTimer);
  if (state.screen === "intro") return;   // never fire on the intro itself
  idleTimer = window.setTimeout(restart, CONFIG.idleTimeoutMs);
}


/* ---------- Boot ---------- */

function wireEvents() {
  els.introHit.addEventListener("click", () => goTo("s1"));
  els.backBtn.addEventListener("click", goBack);
  els.restartBtn.addEventListener("click", restart);

  ["pointerdown", "touchstart", "keydown"].forEach((evt) => {
    window.addEventListener(evt, resetIdleTimer, { passive: true });
  });
}

async function init() {
  wireEvents();
  tintFromMarkup();
  applyLanguage();

  const response = await fetch("data/menu.json");
  menu = await response.json();

  renderCurrentScreen();
}

init();
