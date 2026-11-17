# ELIXIR HOUSE menu app

An in-store menu kiosk for ELIXIR HOUSE — *functional phyto blends*. It runs on a portrait Android screen mounted near the counter and is hosted on GitHub Pages. A customer taps through: intro → the nine functions → the eight categories → one category's drinks.

It is a **standard menu**, not a configurator. The customer browses; they don't build a drink on screen.

## Non-negotiables

- **No build step.** Plain HTML, CSS and vanilla JS. No npm, no bundler, no framework in the repo. What's in the repo is what GitHub Pages serves. (Image conversion tooling may be installed *outside* the repo — see "Images".)
- **Relative paths only.** The site lives at a subpath, so `assets/x.webp`, never `/assets/x.webp`.
- **Lowercase-hyphenated filenames.** GitHub Pages is case-sensitive; macOS is not.
- **Portrait design.** Drawn for roughly 9:16. See "The stage".
- **Touch only.** No hover states anywhere. Interactive elements get `:active` feedback and hold a 72px minimum touch target.
- **Never delete or rewrite `CNAME`.** It holds `menu.elixirhousemena.com`. If it disappears from a commit, GitHub Pages unsets the custom domain and the store screen goes down.

## The functions

Nine functions, each a hydrosol added to a drink:

| id | Name | Description |
|---|---|---|
| `vitality` | Vitality — For Him | Strength by nature |
| `eve` | Eve — For Her | Eve rhythm |
| `nour` | Nour | Nourish your skin |
| `gut-reset` | Gut Reset | Gut feeling restored |
| `relax` | Relax | Calm your center |
| `hb-plus` | Hb Plus | Blood support |
| `spark` | Spark | Rise and spark |
| `focus` | Focus | Clear mind |
| `season` | Season | Your seasonal shield |

**Most drinks take any function the customer picks. Twelve have theirs fixed** — the nine shots (one per function, a clean 1:1) plus three Hot Herbals: Turmeric → Nour, Peach → Nour, Oregano → Season.

A fixed-function drink carries a **tag** on its photo. Untagged drinks carry nothing, and a **legend** at the top of the category explains the difference. The legend only renders where that category actually contains a tagged drink.

**Never invent health or clinical claims.** The nine descriptions above are the approved copy; nothing beyond them goes on screen.

## The stage

Designed for a 9:16 portrait panel. On anything wider it is letterboxed into a portrait column and centred, never stretched:

```css
--stage-w: min(100vw, calc(100dvh * 9 / 16));
```

Every width measures against `--stage-w` rather than the viewport — the root type scale and the screens themselves. On the kiosk and on phones the two are identical; only wider windows letterbox, giving the same layout scaled down rather than a second design. Fixed chrome uses `--stage-inset` so it tracks the column instead of the window edge.

## Brand

| Token | Hex | Used for |
|---|---|---|
| Ivory | `#E8E3DE` | Page background on all three list screens |
| Botanical Taupe | `#816C59` | Secondary text, strokes, prices |
| Deep Brown | `#615143` | Body copy |
| Dark Olive | `#3D4127` | Intro background; headings; pressed fills |
| Olive Green | `#636B2F` | Function names and the function tag |
| Refined Gold | `#C6B990` → `#D9D0AD` | Intro start line; accents |

Gold is a **gradient**, not a flat colour — paint it with the `.u-gold` helper, which clips a `linear-gradient` to the text. A flat hex is not the brand gold.

The palette is five colours plus gold, and the guidelines list "recolor freely" as incorrect usage. So **the nine functions do not get nine colours** — every function tag is Olive Green, and typography carries the distinction. Colour lives in CSS tokens, not in `menu.json`.

## Typography

Four self-hosted families in `/fonts`. Never load fonts from a CDN — a shop with flaky wifi should never lose its type.

- **The Seasons** (`--font-display`) — primary display. Page titles and category names. Bold and Bold Italic. **Currently a Fontspring DEMO cut: evaluation licence, 95 glyphs, no em dash or curly apostrophe.** Display copy avoids both. See `TODO.md`.
- **Cormorant Garamond** (`--font-editorial`) — subheads, intro text, body paragraphs, drink names. A true variable font, declared `font-weight: 300 700`.
- **Goldplay** (`--font-support`) — labels, prices, counts, buttons. Medium only.
- **Forma DJR Arabic** — Arabic. Single static cut, declared across the range so no fake weight is ever synthesised. It is the only family with Arabic coverage, so under `:root[lang="ar"]` all three type roles — display, editorial and support — are redefined to it. A Latin serif would otherwise hand Arabic to whatever the device happened to have.

Small labels — function names, counts, buttons, tags — are set in **capitals with `0.1em` tracking** via `.u-caps`. Latin only: the rule switches off under `:root[lang="ar"]`, because Arabic has no uppercase forms and letter-spacing breaks the joins between its letters.

## The logo

`assets/brand/elixir-logo.svg` is the supplied vector lockup — leaf, ripples, ELIXIR wordmark and the FUNCTIONAL PHYTO BLENDS descriptor, in the brand's gold-taupe.

**Use it as a file. Never rebuild the wordmark with live type, never recolour it, never distort it.** It is placed with `<img>` and sized by width only, so its aspect ratio is fixed by the artwork. The original viewBox is kept untouched, padding included — size it up to compensate rather than re-cropping it.

There is no white-on-transparent mark any more, so the old CSS-mask tinting is gone with it.

## Data

`data/menu.json` is the single source of truth for content — generated from the supplied price list. **8 categories, 70 drinks, 9 functions.**

- `functions[]` — `id`, `name_en`, `name_ar`, `description_en`, `description_ar`.
- `categories[]` — `id`, `name_en`, `name_ar`, and a `drinks` array.
- Each drink — `id` (the price-list code, e.g. `SM-01`), `name_en`, `name_ar`, `price` (a number, in JOD), `function` (a function `id`, or `null` for customer's choice) and `image`.

Prices render as the number followed by `JOD`, trailing zeros stripped — `3 JOD`, `4.25 JOD`, `3.5 JOD` — in Latin numerals in both languages.

`image` is `null` until a photo is mapped; the card then renders a dashed placeholder. See `TODO.md`.

## Images

Drink photos live in `assets/drinks/` as WebP. The source PNGs were ~95 MB; at kiosk size (800×1100 max, quality 82) they are **6 MB, a 94% saving**. All are transparent cutouts, so they sit on any background.

Conversion uses `sharp` installed **into the scratchpad, never the repo** — only the finished `.webp` files are committed, so the no-build-step rule holds. There is no WebP encoder on the machine otherwise.

Any image that 404s falls back to `CONFIG.placeholderImage`, guarded so a missing placeholder cannot loop.

## Bilingual

All UI copy lives in `STRINGS` in `js/app.js` — never inline a user-facing string in markup. `t()` supports `{n}` interpolation.

**The app is bilingual and Arabic is live.** `CONFIG.arabicEnabled` is `true`, every `name_ar` is filled, and the language can be set two ways:

- **On the intro**, two buttons — ENGLISH and عربي — are the only way in. Each sets the language and enters, so no session can slip past the choice into a default.
- **A toggle in the fixed chrome**, beside the (i), switches language on any list screen without losing the customer's place. Its face shows the language it switches *to* (`ع` / `EN`), never the one in use.

The idle reset returns to the intro and to `CONFIG.defaultLang`, so the next customer chooses again.

Arabic counts a noun by the size of the number — 3–10 take the plural, 11 and up the accusative singular — and the categories span both. `drinksCount()` picks the form; the two are separate `STRINGS` keys rather than one string with a guessed ending.

Drink and function Arabic came from the client as text. The price-list **PDF's** Arabic layer is unusable and must never be the source — see `TODO.md`.

Use CSS logical properties (`margin-inline-start`, `inset-inline-end`) rather than left/right so mirroring is automatic.

## Screens

All four are sibling `<section>` elements in one `index.html`, shown and hidden by a `data-screen` attribute on `<body>`. No router, no hash navigation.

- **Intro** — the logo on dark olive, centred, above the two language buttons. They are the entry point; there is no whole-screen tap target.
- **Functions** — the nine, each a name and its description, then a note that any function goes with any drink, and a button through to the menu.
- **Menu** — the eight categories as full-width rows with a drink count.
- **Category** — the legend, then a 2-column grid of drink cards: photo on top at `aspect-ratio: 3/4`, name and price beneath, function tag on the photo where one is fixed.

The intro is fixed at `100dvh` and never scrolls (`.screen--fixed`). The other three scroll.

Drink cards are the end of the journey and are **not tappable** — they are `<article>`, not `<button>`, but structured so a detail view could be added later without a rewrite.

## Behaviour

- Back arrow on the three list screens, fixed, tracking the stage column. Never on the intro.
- An **(i)** button, also fixed, returns to the functions screen from anywhere — so a customer can re-read them without restarting. It hides on the functions screen itself.
- A **language toggle**, outermost on the end side of the chrome so it keeps its position when the (i) hides. Switching re-renders in place rather than navigating.
- Idle reset after 60 seconds of no input: back to the intro, selection cleared, language reset. Constants live in `CONFIG` at the top of `js/app.js`.

## Motion

**There is no ambient motion.** Nothing moves except in response to a touch — `:active` feedback and nothing more. The intro's pulsing start line was the single exception and went when the language buttons replaced it. Anything reintroduced has to respect `prefers-reduced-motion`.

## When something is missing

Build the real code path, drop in an obvious placeholder, and add a line to `TODO.md` with the exact path that needs replacing. Never substitute a different drink's photo for a missing one, and never invent copy — least of all anything that reads as a health claim.
