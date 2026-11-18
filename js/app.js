/* ============================================================
   ELIXIR HOUSE — in-store menu kiosk
   Plain vanilla JS. No framework, no build step, no router.
   ============================================================ */

/* ---------- Everything tweakable lives here ---------- */

const CONFIG = {
  // Arabic is live. Setting this to false collapses the app back to English
  // only: the intro stops offering a choice and the chrome toggle disappears,
  // with no other change needed.
  arabicEnabled: true,
  idleTimeoutMs: 60_000,
  defaultLang: "en",
  placeholderImage: "assets/placeholder.png",
};


/* ---------- All UI copy. Never inline a user-facing string in markup. ---------- */

const STRINGS = {
  // Announced when the intro appears. The screen no longer takes a tap
  // anywhere — the two language buttons are the way in.
  start: { en: "Choose your language to begin", ar: "اختر لغتك للبدء" },
  back:  { en: "Back", ar: "رجوع" },

  // The two names a language calls itself. They never translate, so both
  // columns carry the same value — they live here only because no
  // user-facing string belongs in the markup.
  lang_en: { en: "English", ar: "English" },
  lang_ar: { en: "عربي", ar: "عربي" },
  // The chrome toggle is a circle, so its face is one short mark, not a word.
  lang_short_en: { en: "EN", ar: "EN" },
  lang_short_ar: { en: "ع", ar: "ع" },
  // Always describes the language being switched TO, in the language in use.
  lang_switch: { en: "Switch to Arabic", ar: "التبديل إلى الإنجليزية" },

  fn_head: { en: "Our functions", ar: "وظائفنا" },
  fn_sub:  { en: "Nine blends, each with its own purpose.", ar: "تسع خلطات، لكل واحدة غايتها." },
  fn_note: {
    en: "Add any function to any drink on the menu. A few drinks come with theirs already chosen.",
    ar: "أضف أي وظيفة إلى أي مشروب في المنيو. وبعض المشروبات تأتي بوظيفتها جاهزة.",
  },
  see_menu: { en: "See the menu", ar: "شاهد المنيو" },
  functions_open: { en: "About our functions", ar: "عن وظائفنا" },

  menu_head: { en: "The menu", ar: "المنيو" },
  menu_sub:  { en: "Eight ways to take it.", ar: "ثماني طرق لتستمتع بها." },

  legend_some: {
    en: "Drinks without a tag take any function you choose. Tagged drinks come with theirs set.",
    ar: "المشروبات بدون علامة تقبل أي وظيفة تختارها. والمشروبات التي تحمل علامة تأتي بوظيفتها محددة.",
  },
  legend_none: {
    en: "Every drink here takes any function you choose.",
    ar: "كل مشروب هنا يقبل أي وظيفة تختارها.",
  },

  // {n} is the number of drinks. Arabic counts a noun by the size of the
  // number, so the two forms are separate keys — see drinksCount().
  drinks_count:      { en: "{n} drinks", ar: "{n} مشروبات" },
  drinks_count_many: { en: "{n} drinks", ar: "{n} مشروباً" },

  currency: { en: "JOD", ar: "JOD" },
};


/* ---------- State ---------- */

const state = {
  lang: CONFIG.arabicEnabled ? CONFIG.defaultLang : "en",
  screen: "intro",
  category: null,
};

let menu = null;

const els = {
  body: document.body,
  root: document.documentElement,
  live: document.getElementById("live-region"),
  backBtn: document.getElementById("back-btn"),
  infoBtn: document.getElementById("info-btn"),
  langEn: document.getElementById("lang-en"),
  langAr: document.getElementById("lang-ar"),
  langBtn: document.getElementById("lang-btn"),
  langBtnFace: document.getElementById("lang-btn-face"),
  functionList: document.getElementById("function-list"),
  toMenuBtn: document.getElementById("to-menu-btn"),
  categoryList: document.getElementById("category-list"),
  categoryHead: document.getElementById("cat-head"),
  categoryLegend: document.getElementById("category-legend"),
  drinkGrid: document.getElementById("drink-grid"),
};


/* ---------- Helpers ---------- */

function t(key, vars) {
  const entry = STRINGS[key];
  if (!entry) return "";
  let s = entry[state.lang] || entry.en;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
  return s;
}

/** Picks the field for the current language off any menu.json record, falling
    back to English wherever a translation has not been supplied yet. */
function localised(record, field) {
  return record[`${field}_${state.lang}`] || record[`${field}_en`] || "";
}

function el(tag, className, attrs) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (attrs) for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

/** "3 JOD", "4.25 JOD" — trailing zeros stripped, Latin numerals in both
    languages. 3.5 renders as "3.5 JOD", matching the price list. */
function priceLabel(price) {
  return `${Number(price)} ${t("currency")}`;
}

/** Ingredients are stored as a list per language rather than one pre-joined
    string, so the separator is decided here and only here: Arabic takes the
    Arabic comma (U+060C), not the Latin one. Only the nine shots carry a list
    — every other drink's name already says what is in it, so a card without
    ingredients is the norm, not a gap. */
function ingredientsLabel(drink) {
  const list = localised(drink, "ingredients");
  if (!Array.isArray(list) || list.length === 0) return "";
  return list.join(state.lang === "ar" ? "، " : ", ");
}

/** Arabic counts a noun by the size of the number: 3–10 take the plural
    (مشروبات), 11 and up take the accusative singular (مشروباً). The menu's
    categories span both. English has a single form, so both keys match. */
function drinksCount(n) {
  return t(n >= 11 ? "drinks_count_many" : "drinks_count", { n });
}

/** The nine functions, by id, for tag lookups. */
let functionsById = {};


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
  // The toggle always offers the other language, never the one in use.
  els.langBtnFace.textContent =
    state.lang === "ar" ? t("lang_short_en") : t("lang_short_ar");
  applyStrings();
  renderCurrentScreen();
}

function setLanguage(lang) {
  if (lang === "ar" && !CONFIG.arabicEnabled) return;
  if (lang === state.lang) return;
  state.lang = lang;
  applyLanguage();
}

/** The intro's two buttons are the only way in: pick a language, then enter.
    That way no session can slip past the choice into a default. */
function startIn(lang) {
  setLanguage(lang);
  goTo("functions");
}


/* ---------- Navigation ---------- */

const SCREEN_HEADINGS = {
  functions: "fn_head",
  menu: "menu_head",
};

function goTo(screen) {
  state.screen = screen;
  els.body.dataset.screen = screen;
  window.scrollTo(0, 0);
  renderCurrentScreen();
  announce(
    screen === "intro" ? t("start")
    : screen === "category" ? localised(state.category, "name")
    : t(SCREEN_HEADINGS[screen])
  );
  resetIdleTimer();
}

function goBack() {
  if (state.screen === "functions") goTo("intro");
  else if (state.screen === "menu") goTo("functions");
  else if (state.screen === "category") goTo("menu");
}

function restart() {
  // Leave the screen before clearing the selection it was rendered from.
  goTo("intro");
  state.category = null;
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
  if (state.screen === "functions") renderFunctions();
  if (state.screen === "menu") renderCategories();
  if (state.screen === "category" && state.category) renderDrinks();
}

function renderFunctions() {
  const list = els.functionList;
  list.textContent = "";

  menu.functions.forEach((fn) => {
    const row = el("div", "fn");
    row.dataset.fn = fn.id;

    const name = el("span", "fn__name u-caps");
    name.textContent = localised(fn, "name");

    const desc = el("span", "fn__desc");
    desc.textContent = localised(fn, "description");

    row.append(name, desc);
    list.append(row);
  });
}

function renderCategories() {
  const list = els.categoryList;
  list.textContent = "";

  menu.categories.forEach((category) => {
    const button = el("button", "cat", { type: "button" });
    button.dataset.category = category.id;

    const name = el("span", "cat__name");
    name.textContent = localised(category, "name");

    const count = el("span", "cat__count u-caps");
    count.textContent = drinksCount(category.drinks.length);

    button.append(name, count);
    button.addEventListener("click", () => selectCategory(category));
    list.append(button);
  });
}

function selectCategory(category) {
  state.category = category;
  goTo("category");
}

function renderDrinks() {
  const category = state.category;
  els.categoryHead.textContent = localised(category, "name");

  // The legend only earns its place where a tagged drink actually appears.
  const hasTagged = category.drinks.some((d) => d.function);
  els.categoryLegend.textContent = t(hasTagged ? "legend_some" : "legend_none");

  const grid = els.drinkGrid;
  grid.textContent = "";

  category.drinks.forEach((drink) => {
    // Not tappable: the menu is the end of the journey. An <article>, not a
    // <button>, but structured so a detail view could be added later.
    const card = el("article", "drink");
    card.dataset.drink = drink.id;

    const figure = el("div", "drink__figure");

    if (drink.image) {
      const photo = el("img", "drink__photo", {
        src: drink.image, alt: "", loading: "lazy", decoding: "async",
      });
      // The guard stops an endless loop if the placeholder itself goes missing.
      photo.addEventListener("error", () => {
        if (photo.dataset.fallback) return;
        photo.dataset.fallback = "true";
        photo.src = CONFIG.placeholderImage;
      });
      // Per-drink sizing, so one oversized glass can be dialled back on its
      // own without touching the others. Absent or 1 means "as supplied".
      if (drink.scale) photo.style.setProperty("--photo-scale", drink.scale);
      figure.append(photo);
    } else {
      // No photo mapped to this drink yet — see TODO.md.
      figure.append(el("div", "drink__ghost", { "aria-hidden": "true" }));
    }

    // A drink whose function is fixed carries its tag; the rest carry none,
    // which the legend above explains.
    if (drink.function) {
      const fn = functionsById[drink.function];
      const tag = el("span", "drink__tag u-caps");
      tag.textContent = fn ? localised(fn, "name") : drink.function;
      figure.append(tag);
    }

    const meta = el("div", "drink__meta");

    // Name and price share a baseline on one line; anything else stacks under
    // them, so the row keeps its shape whether or not ingredients follow.
    const line = el("div", "drink__line");
    const name = el("span", "drink__name");
    name.textContent = localised(drink, "name");
    const price = el("span", "drink__price", { dir: "ltr" });
    price.textContent = priceLabel(drink.price);
    line.append(name, price);
    meta.append(line);

    // Only the shots carry these — see ingredientsLabel().
    const ingredients = ingredientsLabel(drink);
    if (ingredients) {
      const list = el("p", "drink__ingredients");
      list.textContent = ingredients;
      meta.append(list);
    }

    card.append(figure, meta);
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
  els.langEn.addEventListener("click", () => startIn("en"));
  els.langAr.addEventListener("click", () => startIn("ar"));
  els.toMenuBtn.addEventListener("click", () => goTo("menu"));
  els.backBtn.addEventListener("click", goBack);
  els.infoBtn.addEventListener("click", () => goTo("functions"));
  // Switching mid-browse re-renders in place; the customer keeps their screen.
  els.langBtn.addEventListener("click", () => {
    setLanguage(state.lang === "ar" ? "en" : "ar");
    resetIdleTimer();
  });

  ["pointerdown", "touchstart", "keydown"].forEach((evt) => {
    window.addEventListener(evt, resetIdleTimer, { passive: true });
  });
}

async function init() {
  // With Arabic off the app collapses to one language: no chrome toggle, and
  // the intro offers only the English way in — which still enters.
  if (!CONFIG.arabicEnabled) {
    els.langBtn.hidden = true;
    els.langAr.hidden = true;
  }

  wireEvents();
  applyLanguage();

  const response = await fetch("data/menu.json");
  menu = await response.json();
  functionsById = Object.fromEntries(menu.functions.map((f) => [f.id, f]));

  renderCurrentScreen();
}

init();
