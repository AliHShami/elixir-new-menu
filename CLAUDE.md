# ELIXIR menu app

An in-store menu kiosk for ELIXIR, a wellbeing drinks brand. It runs on a portrait Android screen mounted near the counter and is hosted on GitHub Pages. A customer taps through four screens: intro → pick a function → pick a pour → see the drinks.

## Non-negotiables

- **No build step.** Plain HTML, CSS and vanilla JS. No npm, no bundler, no framework. What's in the repo is what GitHub Pages serves.
- **Relative paths only.** The site lives at a subpath, so `assets/x.png`, never `/assets/x.png`.
- **Lowercase-hyphenated filenames.** GitHub Pages is case-sensitive; macOS is not. A wrong case works locally and 404s live.
- **Portrait design.** Drawn for roughly 9:16. See "The stage" for what happens on a wider window.
- **Touch only.** No hover states anywhere. Interactive elements get `:active` feedback, and the category pills hold a 72px minimum touch target.
- **Never delete or rewrite `CNAME`.** It holds `menu.elixirhousemena.com`. If it disappears from a commit, GitHub Pages unsets the custom domain and the store screen goes down.
- **All colour data lives in `data/menu.json`.** Category, pour and drink colours are never hardcoded in CSS or JS.

## The stage

The app is designed for a 9:16 portrait panel. On anything wider it is letterboxed into a portrait column and centred, never stretched:

```css
--stage-w: min(100vw, calc(100dvh * 9 / 16));
```

Every width measures against `--stage-w` rather than the viewport — the root type scale, the intro's brand marks, and the screens themselves. On the kiosk and on phones the two are identical and nothing changes; only wider windows letterbox, and there the result is the same layout scaled down rather than a second design. Fixed chrome uses `--stage-inset` so it tracks the column instead of the window edge.

## Brand

| Token | Hex | Used for |
|---|---|---|
| Forest | `#163118` | Intro background |
| Moss | `#586C30` | Intro text strip and logo tint |
| Gold | `#C9BE7B` | Intro starburst, tagline and start line |
| Cream | `#E8D4BE` | Screen 01 background; body text on all dark screens |
| Sand | `#D0BC94` | The `01` numeral |
| Deep green | `#1C3D1E` | Text and button strokes on cream; card names |
| Rose | `#C14D6F` | Screen 02 background |
| Deep rose | `#B13B5A` | The `02` numeral |
| Rust | `#A74A2B` | Screen 03 background; prices on white |
| Deep rust | `#993823` | The `03` numeral |

Each step screen owns one background colour and its numeral is a darker shade of that same background. The numeral is scenery, never a label: `45dvh`, top-anchored and centred at `opacity: 0.5`, with the heading layered over it and `pointer-events: none`.

## Typography

Three self-hosted families in `/fonts`. Never load fonts from a CDN — a shop with flaky wifi should never lose its type.

- **Coolvetica** (`--font-body`) carries everything by default. Two weights only: Light (300) and Regular (400). There is no bold cut, so emphasis is the step from 300 to 400.
- **Awesome Serif VAR** (`--font-display`) is used in exactly two places: the step numerals and the three step headings. It is a true variable font, declared `font-weight: 100 900` so the browser clamps to its real axis; both usages currently sit at 300. Both point at the one token, so swapping the display face is a single line. Declare it `format("woff2")` — the older `woff2-variations` keyword is unrecognised by current browsers, which drops the source silently.
- **Forma DJR Arabic** carries Arabic. A single static cut, declared `font-weight: 300 400` so the browser never synthesises a fake weight.

Step headings are Light; their subtexts are Regular. Headings are sentence case with a full stop ("Pick your pour.").

Labels on the buttons and cards — category names, pour names, drink names and the "Back to the start" pill — are set in **capitals with `0.04em` tracking**. This is Latin only: the rule is switched off under `:root[lang="ar"]`, because Arabic has no uppercase forms and letter-spacing breaks the joins between its letters. Prices and the intro copy are not capitalised.

## Bilingual

All UI copy lives in the `STRINGS` object in `js/app.js` — never inline a user-facing string in markup. Every entry has an `en` and an `ar`, and `CONFIG.arabicEnabled` gates the whole Arabic path: with it off, `dir="rtl"` is never set and the language is forced to English, but nothing on the Arabic path is deleted, only skipped.

Use CSS logical properties (`margin-inline-start`, `inset-inline-end`) rather than left/right so mirroring is automatic.

Prices render as the number followed by `JOD`, trailing zeros stripped — `3 JOD`, `3.75 JOD`, `2.5 JOD` — in Latin numerals in both languages.

**There is no in-app language toggle yet.** The language comes from `CONFIG.defaultLang` at boot. The strings, the font, the `dir` handling and the logical-property CSS are all in place for one; only the control is missing.

## Tinting white PNGs

All brand marks and category icons are white on transparent and get their colour from a CSS mask, never a `filter`, so the hex is exact:

```css
.tinted {
  background-color: var(--tint);
  -webkit-mask: var(--src) center / contain no-repeat;
          mask: var(--src) center / contain no-repeat;
}
```

`--src` and `--tint` are set per element by `tint()` in `js/app.js`, from `data-tint-src` / `data-tint` in the markup or from `menu.json`.

**`tint()` resolves the path against `document.baseURI` first, and must keep doing so.** A relative `url()` inside a custom property is re-based against the *stylesheet*, so a bare `assets/brand/x.png` gets fetched as `css/assets/brand/x.png`, 404s, and every tinted mark renders as a solid filled rectangle. Authored paths stay relative; only what reaches the mask is absolute, so a project sub-path still works.

## Data

`data/menu.json` is the single source of truth for content. It is generated from `data/new-menu.json`, which stays as the untouched source copy — 7 categories, 10 pours, 76 drinks.

- `formats` — the pour types on screen 02. Each has `name_en`, `name_ar`, `color` (the card's upper panel) and `image`. **Render order comes from this map**, not from the order keys happen to appear inside a category.
- `elixir_categories[]` — each has `name_en`, `name_ar`, `slug`, `color` (its starburst tint), `icon`, `description_en`, `description_ar`, `herbs`, and a `drinks` object keyed by format name.
- Each drink has `name_en`, `name_ar`, `price` (a number, in JOD) and `color` — its card colour on screen 03, chosen from its flavour rather than its category.

Screen 02 shows only the formats present as keys in the selected category's `drinks` object. A missing format means no card, not a disabled one.

There is no drink photography yet, so **every drink card borrows its pour's image**. Any image that 404s falls back to `CONFIG.placeholderImage` (`assets/placeholder.png`), guarded so a missing placeholder cannot loop.

## Screens

All four are sibling `<section>` elements in one `index.html`, shown and hidden by a `data-screen` attribute on `<body>`. No router, no hash navigation.

- **Intro** — one big tap target, no visible button on it. Three anchored zones: the text strip at the top and the ELIXIR logo at the bottom share one width (`--brand-w`) so they start and end on the same line; the starburst, tagline and start line sit in the middle.
- **01 Pick your function** — one page read as two halves (`1fr 1fr`), fixed at `100dvh`. Category pills in a 2-column grid: no fill, `1.5px` stroke, pill radius, name at the inline-start, starburst at the inline-end tinted to the category's colour.
- **02 Pick your pour** — `50dvh auto`, scrolls. Portrait cards (`aspect-ratio: 3/4`) in 2 columns: the pour's colour fills the top two thirds with the photo oversized and overlapping onto the white band, which takes the bottom third and carries the name at the inline-start.
- **03 Pick your taste** — `50dvh auto`, scrolls. The same card, plus the price at the inline-end in rust.

Screens 02 and 03 scroll; the intro and 01 are fixed at `100dvh`. On the scrolling screens the top half is pinned at `50dvh` rather than `1fr`, so the numeral holds its position as the grid grows.

Offsets below the anchored numeral use **padding, never margin**. Those screens set `overflow: visible` in order to scroll, which removes the block formatting context, and a top margin on the section's first in-flow child then collapses straight through the section — pushing the whole page down and dragging the numeral and heading behind the cards.

## Behaviour

- Back arrow on screens 01–03, fixed, tracking the stage column. Never on the intro.
- A "Back to the start" pill at the bottom of screen 03.
- Idle reset after 60 seconds of no input: return to the intro, clear the selection, reset the language. The constants live in `CONFIG` at the top of `js/app.js`.
- Drink cards are the end of the journey and are not tappable — they are `<article>`, not `<button>`, but structured exactly like a pour card so a detail view can be added later without a rewrite.

## Motion

One ambient effect in the entire app: the slow opacity pulse on the intro's start line. Everything else moves only in response to a touch — the `:active` scale on the cards. Respect `prefers-reduced-motion`.

## Not built yet

`manifest.webmanifest`, `sw.js` and `README.md` exist but are empty. The manifest is deliberately not linked from `index.html` rather than pointing at an empty file. Kiosk hardening (a fullscreen portrait manifest, a cache-first service worker) and the deploy notes still need writing.

## When something is missing

Build the real code path, drop in an obvious placeholder, and add a line to `TODO.md` with the exact path that needs replacing. Never substitute a different drink's photo for a missing one.
