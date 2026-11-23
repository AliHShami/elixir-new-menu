# TODO — open items

## 1. The Seasons is a DEMO licence — blocking for launch

`fonts/Fontspring-DEMO-theseasons-bd.woff2` and `-bdit.woff2` are Fontspring
**demo** cuts. Two consequences:

- **Licensing.** Fontspring demo fonts are for evaluation only. Running them on
  a live in-store screen needs the real licensed webfont. This is the one item
  that should block going live.
- **Coverage.** 95 codepoints, basic ASCII only. No em dash (`—`), no curly
  apostrophe (`'`). The app avoids both in display copy for that reason — if the
  licensed cut arrives with a fuller charset, that constraint lifts.

Everything else about them is fine: A–Z, a–z, 0–9 and `.` are all present, which
covers every heading in the app.

## 2. Photo mapping — 59 of 70 done

Photos come from `D:\Elixir\Product Images\Elixir Products Images` (`Cold Drinks`,
`Hot Drinks`, `Shots`). They are converted to WebP in `assets/drinks/`, named by
the price-list code: `sm-02.webp`, `sh-10.webp`, and so on. 59 photos, 8.7 MB.

Files named `Image NN.png` were skipped as instructed — those are drinks that
aren't on the current menu.

**11 drinks still have no photo.** Each renders a dashed placeholder:

| Category | Missing |
|---|---|
| Hot Herbal | HH-02 Turmeric |
| Iced Tea | IT-04 Passion Fruit |
| Milkshakes | MS-02 Crocant Anise |
| Specialty Coffee | SC-02 Lungo, SC-04 American Filter, SC-05 Cappuccino, SC-06 Latte, SC-10 Hot Chocolate |
| Iced Coffee | IC-01 Iced Coffee, IC-05 Iced Mocha, IC-06 Iced V60 |

**Smoothies, Spirulina and Shots are complete.** Of the eleven gaps left,
eight are coffee — five Specialty and three Iced — and the other three are one
each in Hot Herbal, Iced Tea and Milkshakes.

**Five judgement calls to confirm** — the filename didn't match the menu name exactly:

- `SM-04 Cantaloupe Ginger` ← `smoothie-melon-ginger.png`
- `SM-12 Kiwi Rosemary` ← `smoothie-green-apple-kiwi-rosemary.png` (also mentions green apple)
- `HH-01 Berry Herbal` ← `herbal-raspberry.png`
- `SP-04 Spirulina Mixed Berry` ← `milkshake-mixed-berries.png` (filename says neither spirulina nor lavender)
- `SP-05 Spirulina Strawberry` ← `smoothie-strawberry-spirulina.png` (a smoothie file for a Spirulina-category drink)

**Nine more arrived 23 Nov 2026**, from
`D:\Elixir\Product Images\Elixir Products Images\Cold Drinks 23-11`. Every
filename there names exactly one drink that had no photo, so none of these was
a judgement call: SM-01, HH-04, HH-05, HH-06, IT-01, IT-02, IT-03, MS-12,
IC-07. 12.4 MB of PNG became 1.27 MB of WebP.

Three of them are worth a second look before go-live:

- **The three new French presses face the other way.** Ginkgo, Peach and
  Oregano have the handle on the right; Berry, Lemon Balm and the rest have it
  on the left, so Hot Herbal now shows handles pointing both ways down the
  grid. They cannot simply be flipped — see the next point.
- **The new presses carry a visible `DUKA` logo** on the glass, which the older
  three do not. It is another brand's name on an ELIXIR screen, and it is what
  rules out mirroring them to match. Retouching or a re-shoot are the options.
- **The two hibiscus-tamarind photos are styled with strawberries.** `SM-01
  Hibiscus Tamarind` now looks almost identical to `SM-10 Strawberry Rosemary`
  beside it, and `MS-12 Hibiscus & Tamarind` close to `MS-10 Strawberry
  Rosemary`. The filenames are unambiguous, so they are wired as supplied — but
  given `mango-ice-tea.png` turned out to be lemon, the files are worth
  confirming. (SM-01 was renamed from *Pomegranate Hibiscus Tamarind* to
  *Hibiscus Tamarind* on 23 Nov 2026, dropping `رمان` from the Arabic too, so
  the drink and its photo now agree on the name at least.)

**The misnamed iced tea is resolved.** `Cold Drinks/mango-ice-tea.png` was
actually the **lemon** photo; it has since been renamed to `lemon-ice-tea.png`
at source, and it is the file behind `IT-05 Lemon Iced Tea`
(`assets/drinks/it-05.webp`) — verified by re-encoding it and comparing pixels.
`IT-01 Mango Iced Tea` has its own photo from the 23-11 folder, and it is
plainly mango rather than a second lemon. Nothing further to do here.

**The nine shots were re-shot.** They now come from
`D:\Elixir\Product Images\Shots New\Bottles finals`, where each file names its
own function (`nour-shot.png`, `gut-reset-shot.png`, …), so the mapping is exact
rather than inferred. All nine are in, SH-01 Vitality included — it was the last
shot without a photo. 8.2 MB of PNG became 0.81 MB of WebP.

That folder holds a tenth bottle, **`NA.png`** — a caramel-coloured shot with no
function in its name. It is not on the price list and is not wired to anything.
Worth asking whether it is the missing **SH-02** (see section 4).

**`SM-13 Mango Spirulina` came from the original `Cold Drinks` folder**, not
the 23-11 one — `smoothie-spirulina-mango.png` had been sitting there unmapped
all along. It was missed because `SP-02 Spirulina Mango` takes the *milkshake*
cut of the same flavour (`milkshake-spirulina-mango.png`), so the pair reads as
one drink at a glance. They are two: SP-02 is the milkshake, SM-13 the
smoothie, and each now has its own photo.

**Five named files are still unused**, in case any belongs to a drink above:
`Cold Drinks/pina-colada-patterson.png`,
`Cold Drinks/smoothie-green-apple-kiwi-rosemary (2).png`,
`Hot Drinks/dark-mocha-hot.png`, `Hot Drinks/matcha-hot.png`,
`Hot Drinks/spirulina-hot.png`. Everything else named in those folders is
wired to a drink.

To add a photo: drop the file in the source folder, and it converts to
`assets/drinks/<price-list-code>.webp` with the `image` field set in
`data/menu.json`.

## 2b. Drink photo sizing

Photos are **trimmed to the glass** on conversion. The source files each carried a
different amount of transparent margin — the subject filled anywhere from 54% to
95% of its canvas, a 1.8x spread — which is why some drinks (the spirulina ones
especially) looked far larger than others, and why they sat at different heights.
Trimming removes both problems at once: every drink now shares a baseline.

Size is then tuned per drink by a **`scale`** field in `data/menu.json`:

```json
{ "id": "SP-06", "name_en": "Spirulina Classic", "price": 4.25, "scale": 0.84 }
```

`1` fills the card; lower is smaller. Current values are computed from each
photo's shape — `0.66` for tall glasses, `0.75`–`0.78` for the wide
cup-and-saucer coffee shots, which fill the card's width rather than its height.
**Hand-edit any value** and only that drink changes; the CSS reads it as
`--photo-scale` and scales from the bottom, so the baseline stays put.

A tall glass renders about 364px on a 1080x1920 panel. To move them all at once,
rescale against `TARGET_H` / `TARGET_W` (0.66 / 0.78) rather than editing 48
values — every `scale` is `min(TARGET_H / fh, TARGET_W / fw)` where `fh`/`fw` are
how much of the card the trimmed photo fills in each axis.

## 3. Arabic — live, two lists still need sign-off

`CONFIG.arabicEnabled` is `true` and every `name_ar` is filled. Sources, in
order of how much they can be trusted:

- **The nine functions and the nine shots** — supplied by the client as typed
  text. Clean: no Urdu heh, no Farsi yeh, no presentation forms, correct word
  order. This is the authoritative copy. The two sets are deliberately locked
  together: each shot is `جرعة` plus its function's name, so a change to one
  has to be made to the other. The descriptions are the client's original set
  and were not revised alongside the names.
- **61 of the 70 drinks** — the `Arabic Name` column of
  `D:\Elixir\ELIXIR_Price_List.xlsx`. Also clean, and every drink name and
  price in that sheet was checked against `data/menu.json` before use: they
  agree exactly. (The one divergence is SC-10 Hot Chocolate, whose price cell
  reads `Not listed` — see section 4.)
- **The eight category names — NEEDS SIGN-OFF.** No Arabic for these exists in
  any supplied file. They are plain translations of the section labels, in the
  register the spreadsheet already uses: سموذي، أعشاب ساخنة، شاي مثلج،
  ميلك شيك، سبيرولينا، قهوة مختصة، قهوة مثلجة، شوتس.
- **The UI copy** in `STRINGS` — written, not supplied. The client chose
  **الوظائف** as the word for "function"; the surrounding sentences are ours
  and deserve a read-through.

**Four functions now repeat themselves on screen.** The Arabic function names
were revised into descriptive phrases, which moved them onto the ground the
descriptions already held. The functions screen stacks name above description,
so these four read as near-duplicates:

| Function | Name | Description |
|---|---|---|
| Relax | الهدوء والاسترخاء | هدوء |
| Season | الدرع الموسمي | درعك الموسمي |
| Focus | التركيز | قوة التركيز |
| Hb Plus | قوة الدم | لقوة الدم |

The English does not have this problem — `Season` / `Your seasonal shield`
reads fine because the name is a single word. Needs either shorter Arabic
names or fresh Arabic descriptions; both are client copy, so neither was
changed here.

**Shot ingredients** were supplied as typed text, English and Arabic, and
are in `data/menu.json` on the nine shots only. Word choices and spellings are
the client's; the one thing changed was the **casing of the English items**,
regularised to the sentence case their own list already used in most places,
so a single card does not mix `Chia seeds` with `sage`.

**Four spellings were supplied wrong and have been corrected**, each one
confirmed by the client rather than changed silently:

| Supplied | Now | Where |
|---|---|---|
| `إكليل الحبل` | `إكليل الجبل` | Focus Shot ingredients — rosemary is mountain's crown, not rope |
| `إنوثتك` | `أنوثتك` | Eve's description — hamza above, and it now matches the function name `الأنوثة` |
| `غذي` | `غذّي` | Nour's description — the shadda, nothing else |
| `Chlorophyl` | `Chlorophyll` | Focus Shot ingredients |

`غذّي بشرتك` is the only diacritic in the Arabic copy apart from the
tanween on `مشروباً`. Forma DJR Arabic carries the shadda (U+0651) and sets it
over the `ذ` correctly — checked on the rendered functions screen, not just in
the font's character map.

That spelling keeps Nour's line in the feminine imperative, which Spark's
`ابدأ يومك بشرارة` does not match — Spark addresses a man. **The client chose
to leave it that way**, so the two imperatives disagree by decision, not by
oversight. Seven of the nine descriptions have no verb at all and so carry no
gender; only these two do.

**Never take Arabic from the price-list PDF.** Its text layer reverses word
order (`رمان كركديه تمر هندي` comes out as `ھندي تمر كركدیھ رمان`), uses the
Urdu `ھ` (U+06BE) for `ه` (U+0647) and the Farsi `ی` (U+06CC) for `ي`
(U+064A), and puts parentheses on the wrong sides. The spreadsheet is the
source; the PDF is not.

## 4. Price-list queries, still unanswered

- **SH-02 does not exist.** The shots run SH-01 then jump to SH-03. Missing shot,
  or a retired ID?
- **Nour Shot (SH-03)** is marked *"No hydrosol"* yet carries the Nour category.
  It is currently tagged Nour. Correct?
- **Spirulina Classic is 4.25** where the rest of Spirulina is 4.75.
- **Hot Chocolate** is written "3.5 JD" where everything else uses two decimals.
  It renders as `3.5 JOD`.
- **JD or JOD on screen.** The PDF cells say JD, the column header says JOD. The
  app renders **JOD**.

## 5. Superseded files still in the repo

The rebrand orphaned these. I tried to delete them and the permission prompt
declined, so they are still on disk — unused, but adding weight:

```
assets/brand/elixir-icon-white.png     assets/formats/   (7 photos)
assets/brand/elixir-logo-white.png     fonts/awesome-serif-var.woff2
assets/brand/elixir-text-white.png     fonts/coolvetica-light.woff2
data/new-menu.json                     fonts/coolvetica-regular.woff2
```

All are in the initial commit, so `git checkout HEAD -- <path>` restores any of
them if a deletion turns out to be wrong.

`assets/placeholder.png` and `fonts/forma-djr-arabic.woff2` are still in use —
keep those.

## 6. Not built yet

`manifest.webmanifest`, `sw.js` and `README.md` are empty. The manifest is
deliberately not linked from `index.html` rather than pointing at an empty file.
Kiosk hardening (fullscreen portrait manifest, cache-first service worker) and
the deploy notes still need writing.
