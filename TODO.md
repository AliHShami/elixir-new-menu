# TODO — placeholders and missing assets

Each item is a real code path with a placeholder behind it. Replacing the file
listed is all that is needed, unless a JSON edit is noted.

## 1. Two pour photos do not exist

| Needs creating | Used by |
|---|---|
| `assets/formats/frappe.png` | Performance → Frappe |
| `assets/formats/matcha.png` | Performance → Matcha |

Both paths are already referenced from the `formats` map in `data/menu.json`.
While the files 404, the card falls back to `assets/placeholder.png`
(`CONFIG.placeholderImage` in `js/app.js`). **No other pour's photo is ever
substituted.** Dropping the real files in fixes the cards with no code change.

## 2. `assets/formats/coffee.png` backs two different pours — and is iced

`Hot Coffee` and `Iced Coffee` both point at the same photo in `data/menu.json`,
and the photo is an iced latte, so **the Hot Coffee card shows a cold drink**.
Only visible under The Classic.

Fix: add `assets/formats/coffee-hot.png`, then repoint the `Hot Coffee` entry:

```json
"Hot Coffee": { "name_en": "Hot Coffee", "name_ar": "قهوة ساخنة", "color": "#5C3A21", "image": "assets/formats/coffee-hot.png" },
```

## 3. `assets/formats/hot.png` is a matcha latte in a black cup

It reads oddly for the "Hot" pour (herbal infusions and lattes) and duplicates
the look of the Matcha card once `matcha.png` exists. Wants a re-shoot.

## 4. Category icons are the ELIXIR starburst

Every category in `data/menu.json` points its `icon` at
`assets/brand/elixir-icon-white.png`, tinted to that category's `color`. It is
the only icon artwork in the repo. A real per-category icon set is a data
change only — repoint each `icon` field. Replacements must be **white on
transparent**, since the colour comes from a CSS mask; a coloured or black
icon will not tint.

## 5. Arabic has one weight only

`fonts/forma-djr-arabic.woff2` is a single static cut, declared across
`font-weight: 300 400` so the browser cannot synthesise a fake weight. English
has a real Light/Regular contrast; Arabic renders at one weight throughout. A
Light cut of Forma DJR Arabic would let the two match.

## 6. Arabic UI strings are drafts

The Arabic column in `STRINGS` in `js/app.js` has not been reviewed by a native
speaker. The category, pour and drink names in `data/menu.json` are the existing
approved copy and were not touched.

## 7. Drink colours are not set yet

Screen 03 gives each drink its own card colour, seeded from the flavour in its
name. Those `color` fields are not in `data/menu.json` yet — they land with
screen 03.

## 8. Brand PNGs are far larger than they need to be

| File | Pixels | Decoded in memory |
|---|---|---|
| `assets/brand/elixir-text-white.png` | 32767 × 1260 | ~165 MB |
| `assets/brand/elixir-logo-white.png` | 17241 × 5129 | ~354 MB |

Both are used as CSS masks on the intro at roughly 90vw and 70vw. Re-exporting
each at about 1600px wide would cut memory by ~99% and remove a likely cause of
the intro failing to paint on a low-RAM Android panel. Straight file swap.
