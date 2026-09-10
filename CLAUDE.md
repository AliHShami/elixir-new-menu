# ELIXIR menu app

An in-store menu kiosk for ELIXIR, a wellbeing drinks brand. It runs on a portrait Android screen mounted near the counter and is hosted on GitHub Pages. A customer taps through four screens: intro → pick a function → pick a pour → see the drinks.

## Non-negotiables

- **No build step.** Plain HTML, CSS and vanilla JS. No npm, no bundler, no framework. What's in the repo is what GitHub Pages serves.
- **Relative paths only.** The site lives at a subpath, so `assets/x.png`, never `/assets/x.png`.
- **Lowercase-hyphenated filenames.** GitHub Pages is case-sensitive; macOS is not. A wrong case works locally and 404s live.
- **Portrait only.** Roughly 9:16. No desktop or landscape layout.
- **Touch only.** No hover states anywhere. Interactive elements get `:active` feedback and a minimum 72px touch target.
- **Never delete or rewrite `CNAME`.** It holds `menu.elixirhousemena.com`. If it disappears from a commit, GitHub Pages unsets the custom domain and the store screen goes down.
- **All colour data lives in `data/menu.json`.** Category and drink colours are never hardcoded in CSS or JS.

## Brand

| Token | Hex | Used for |
|---|---|---|
| Forest | `#163118` | Intro background |
| Moss | `#586C30` | Wordmark and logo tint on the intro |
| Cream | `#E8D4BE` | Screen 01 background; body text on all dark screens |
| Sand | `#D0BC94` | The `01` background numeral |
| Deep green | `#1C3D1E` | Text and button strokes on cream |
| Rose | `#C14D6F` | Screen 02 background |
| Deep rose | `#B13B5A` | The `02` background numeral |
| Rust | `#A74A2B` | Screen 03 background; prices on white |
| Deep rust | `#993823` | The `03` background numeral |

Each screen owns one background colour and its step numeral is a darker shade of that same background — the numeral is scenery, never a label.

## Typography

Coolvetica throughout, two weights only: Light (300) for body and the big numerals, Regular (400) for headings, buttons and emphasis. Self-hosted `.woff2` in `/fonts`. Forma DJR Arabic carries Arabic — a single static weight, declared as `font-weight: 300 400` so the browser never synthesises a fake cut. Never load fonts from a CDN — a shop with flaky wifi should never lose its type. Never substitute a different family.

Headings are sentence case with a full stop ("Pick your pour."). No all-caps labels, no eyebrows above headings.

## Bilingual

English and Arabic, toggled in-app. Arabic sets `dir="rtl"` and the whole layout mirrors. Use CSS logical properties (`margin-inline-start`, `inset-inline-end`) rather than left/right so mirroring is automatic. Prices stay in Latin numerals in both languages: `3.75 JD` / `3.75 د.أ`. All UI copy lives in the `STRINGS` object in `js/app.js` — never inline a user-facing string in markup.

## Tinting white PNGs

All brand marks and category icons are white on transparent and get their colour from a CSS mask, never a `filter`, so the hex is exact:

```css
.tinted {
  background-color: var(--tint);
  -webkit-mask: var(--src) center / contain no-repeat;
          mask: var(--src) center / contain no-repeat;
}
```

## Data

`data/menu.json` is the single source of truth for content:

- `formats` — the pour types on screen 02, with bilingual names and image paths. Render order comes from this map.
- `elixir_categories[]` — each has `slug`, `color`, `icon`, bilingual name and description, `herbs`, and a `drinks` object keyed by format name.
- Each drink has `name_en`, `name_ar`, `price` (a number, in JOD) and `color` (its card colour on screen 03, chosen from its flavour rather than its category).

Screen 02 shows only the formats present as keys in the selected category's `drinks` object. A missing format means no button, not a disabled one.

## Behaviour

- The intro screen is one big tap target. No visible button on it.
- Back arrow on screens 01–03; a "Back to the start" pill at the bottom of screen 03.
- Idle reset after 60 seconds of no input: return to the intro, clear the selection, reset the language to English. The constant lives at the top of `js/app.js`.
- Screen 03 is the only screen that scrolls. Everything else is fixed at `100dvh`.
- Drink cards are the end of the journey and are not tappable — but keep the markup ready for a detail view to be added later.

## Motion

One ambient effect in the entire app: the slow opacity pulse on the intro's start line. Everything else moves only in response to a touch. Respect `prefers-reduced-motion`.

## When something is missing

Build the real code path, drop in an obvious placeholder, and add a line to `TODO.md` with the exact path that needs replacing. Never substitute a different drink's photo for a missing one, and never swap the typeface.