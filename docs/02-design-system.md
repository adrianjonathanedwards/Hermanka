# 02   Design system

Tokens and rules. Everything here is enforced in
[`src/styles/global.css`](../src/styles/global.css) via Tailwind v4's `@theme`, so
the token is the only way to reach the value. If you find yourself writing a hex
code or a raw px in a component, the system is missing something   add it here
first.

The subject is a wooden cottage in a wet green valley below a 1423 m ridge. The
design should feel like the place: dark timber, cold light, brass, and a great deal
of photograph. Restraint is the brief.

---

## 1. Palette

Six colours. Not five, not nine.

```css
--les        #16241C   /* deep spruce    dark ground, footer, scrims        */
--kura       #3E3226   /* bark brown     secondary dark                     */
--omitka     #FBFAF8   /* render white   page background                    */
--kamen      #E8E6E0   /* stone          alternating bands, card fills      */
--mosaz      #8C6318   /* brass          CTAs, rules, active states         */
--jinovatka  #D6E2E4   /* frost          winter accent only                 */
```

`--mosaz` is the existing brand colour and is not up for negotiation.
`--jinovatka` is a **winter accent only**   snow, ski content, the cold months of
the calendar. It must never appear in summer photography sections, and it must never
become a generic "light blue" for links or focus rings.

### 1.1 Measured contrast

All ratios below are computed, not estimated. The accessibility floor for this
project is **4.5:1 for all text** ([03-tech.md](03-tech.md) §Accessibility).

| Foreground | Background | Ratio | Verdict |
| --- | --- | ---: | --- |
| `--les` | `--omitka` | 15.45 | AAA   **the default body pairing** |
| `--les` | `--kamen` | 12.91 | AAA |
| `--kura` | `--omitka` | 11.92 | AAA |
| `--kura` | `--kamen` | 9.96 | AAA |
| `--omitka` | `--les` | 15.45 | AAA   **the default inverse pairing** |
| `--omitka` | `--kura` | 11.92 | AAA |
| `--kamen` | `--les` | 12.91 | AAA |
| `--jinovatka` | `--les` | 12.17 | AAA |
| `--jinovatka` | `--kura` | 9.39 | AAA |
| `--omitka` | `--mosaz` | 5.14 | AA   **the primary button** |
| `#FFFFFF` | `--mosaz` | 5.37 | AA |
| `--mosaz` | `--omitka` | 5.14 | AA   smallest passing brass-as-text case |
| `--mosaz` | `--kamen` | **4.30** | ❌ **FAILS** |
| `--mosaz` | `--les` | **3.00** | ❌ **FAILS for text** |

### 1.2 Two failures you will walk into

Both of these are combinations a designer reaches for naturally. Both are banned for
text, and both have a fix.

**Brass text on a stone band   4.30:1, fails.** A brass heading on a `--kamen`
alternating band is the most obvious thing in the world to draw and it is not
readable enough. **Brass on the dark ground   3.00:1, fails.** Brass links in the
`--les` footer are the specific case that will bite.

So two derived steps, both computed from `--mosaz` itself so they stay in family:

```css
--mosaz-tmava   #7E5916   /* brass, 90%   brass AS TEXT on light surfaces */
--mosaz-svetla  #D29524   /* brass, 150%   brass AS TEXT on dark surfaces */
```

| Foreground | Background | Ratio |
| --- | --- | ---: |
| `--mosaz-tmava` | `--kamen` | 5.06 ✅ |
| `--mosaz-tmava` | `--omitka` | 6.05 ✅ |
| `--mosaz-svetla` | `--les` | 6.19 ✅ |
| `--mosaz-svetla` | `--kura` | 4.77 ✅ |

**The rule, in one line:** `--mosaz` is a *fill*, never a text colour. Text that
wants to be brass uses `--mosaz-tmava` on light and `--mosaz-svetla` on dark.

`--mosaz` remains correct for: button and CTA backgrounds (with `--omitka` text,
5.14:1), horizontal rules, underlines, active-state indicators, and the focus ring  
all non-text uses, which need 3:1 under WCAG 1.4.11 and clear it.

### 1.3 Surface roles

| Role | Token | Notes |
| --- | --- | --- |
| Page background | `--omitka` | the default |
| Alternating band | `--kamen` | breaks long pages into sections; never two in a row |
| Dark ground | `--les` | footer, the pricing band, full-bleed statement sections |
| Secondary dark | `--kura` | cards on `--les`, the mobile nav drawer |
| Scrim over photography | `--les` at 55–70 % | see §5.3 |
| Winter accent | `--jinovatka` | ski/snow content and winter calendar states only |

There is no white. `--omitka` is the lightest surface on the site. `#FFFFFF` appears
in exactly one place   inside the hand-drawn illustration line work over
photography (§4).

---

## 2. Typography

**Display   Fraunces (variable). Body   Public Sans.** Both self-hosted as woff2.
Fallback display face if Fraunces fails review: **Bitter**.

### 2.1 Czech coverage   verified

The brief required verifying that the chosen faces actually carry the Czech
diacritics before committing to them. **This was done, and all three faces pass.**

Method: the upstream TTFs were downloaded and their `cmap` tables parsed directly for
all 30 Czech accented codepoints (`á č ď é ě í ň ó ř š ť ú ů ý ž` plus capitals) and
the Czech typographic punctuation set (`„ “ ‚ ‘ –   … § �  °`). The script is
committed at [`tools/verify-font-coverage.mjs`](../tools/verify-font-coverage.mjs)
and is wired to `npm run verify:fonts`.

| Face | Glyphs | Czech set | Punctuation |
| --- | ---: | --- | --- |
| Fraunces 400 | 624 | **all 30 present** | complete |
| Fraunces 600 | 624 | **all 30 present** | complete |
| Public Sans 400 | 565 | **all 30 present** | complete |
| Public Sans 600 | 565 | **all 30 present** | complete |
| Bitter 400 / 600 (fallback) | 977 | **all 30 present** | complete |

Two glyphs to look at with your eyes, not a script, once the faces are in the page:
**ě** and **ů**. The caron over a round-shouldered `e` and the ring over `u` are
where a Latin-first display face usually shows its seams   collisions with the
ascender line, or a ring that reads as an `°`. Fraunces at 49 px is where this will
show. If either looks wrong, that is what Bitter is the fallback for.

### 2.2 ⚠️ `latin-ext` alone is not enough for Czech

This is the trap in the brief and it needs stating plainly, because it is the kind of
mistake that ships and is only noticed by a Czech reader.

Google Fonts splits its Latin coverage into two subsets, and **the Czech alphabet
straddles the boundary**:

- `latin` (`U+0000–00FF`, …) contains **á é í ó ú ý**
- `latin-ext` (`U+0100–02BA`, …) contains **č ď ě ň ř š ť ů ž**

Subsetting to `latin-ext` *only*, as "subset to latin-ext" would literally instruct,
produces a font that renders `Chalupa Heřmanka` with the `ř` from Fraunces and the
`a` from a system fallback. **Our subsets must span latin + latin-ext as one
unified range**   a single file per face, not Google's two-file split.

### 2.3 Subsetting and the budget

Measured, real transfer sizes for Google's own latin + latin-ext woff2 pair:

| Face | latin + latin-ext |
| --- | ---: |
| Fraunces variable (`wght` 400–600) | 126.7 kB |
| Fraunces static 400 + 600 | 65.9 kB |
| Public Sans static 400 + 600 | 50.2 kB |
| Bitter static 400 | 36.5 kB |

Four faces at Google's subsetting is **116 kB**   the entire 100 kB first-load budget
spent on fonts before a single byte of HTML. Google's `latin-ext` slice carries
IPA extensions, Latin Extended Additional and Latin Extended-D, none of which this
site will ever render.

So we cut our own subsets to a Czech-shaped charset:

```
U+0020-007E   basic Latin
U+00A0        no-break space   (required   Czech typography binds v/k/s/z/a/i/o + numerals)
U+00AD        soft hyphen
U+00E1 00E9 00ED 00F3 00FA 00FD   á é í ó ú ý
U+00C1 00C9 00CD 00D3 00DA 00DD   Á É Í Ó Ú Ý
U+010D 010F 011B 0148 0159 0161 0165 016F 017E   č ď ě ň ř š ť ů ž
U+010C 010E 011A 0147 0158 0160 0164 016E 017D   Č Ď Ě Ň Ř Š Ť Ů Ž
U+00E4 00F6 00FC 00DF 00C4 00D6 00DC             ä ö ü ß Ä Ö Ü   (for /de/)
U+0119 00F3 017C 017A 0142 0144 015B 0107 0141   ę ó ż ź ł ń ś ć Ł  (Międzygórze)
U+2013 2014 2018 2019 201A 201C 201E 2026        –   ‘ ’ ‚ “ „ …
U+00A9 00B0 00D7 20AC                            © ° �  €
```

German is included now rather than later because `/de/` is planned and the glyphs
cost almost nothing. Polish is included for one word   `Międzygórze`, which appears
in the regional map   because a single word falling back to a system font is more
visible than seven glyphs are expensive.

`Kč` needs no special provision; it is `K` + `č`.

**What actually shipped**, generated by `npm run build:fonts` and measured:

| File | Size | Budget | Preloaded |
| --- | ---: | ---: | --- |
| `fraunces-var.woff2`   `wght` 400–600, `opsz` pinned 144, SOFT/WONK 0 | **22.5 kB** | 28 kB | yes |
| `public-sans-var.woff2`   `wght` 400–600 | **18.2 kB** | 28 kB | yes |
| **Total** | **40.7 kB** | | both |

156 codepoints per face, all 30 Czech characters verified present in the generated
files, not just in the sources.

**Variable beat static, so both faces ship as one variable file each.** Two static
instances would have been 25.9 kB for Fraunces and 22.0 kB for Public Sans   larger
*and* two more requests, for less. Pinning Fraunces' unused axes is most of the
saving: it ships with four (`opsz`, `wght`, `SOFT`, `WONK`), and three of them are
fixed here.

Both files are preloaded, and the whole type system costs 40.7 kB of the 100 kB
first-load budget ([03-tech.md](03-tech.md) §5).

The pipeline is committed:
[`tools/build-fonts.mjs`](../tools/build-fonts.mjs) downloads, subsets, enforces the
per-face budget and verifies; [`tools/charset.mjs`](../tools/charset.mjs) holds the
charset; [`tools/verify-font-coverage.mjs`](../tools/verify-font-coverage.mjs)
parses the `cmap` of the generated woff2 and **exits non-zero if a Czech glyph is
missing**. Run `npm run verify:fonts` before committing a font change. The
generated files are committed, so a normal build needs no network.

### 2.4 Scale

1.25 ratio, from a 16 px base. **These are the only sizes.**

| Token | Utility | px | rem | Use |
| --- | --- | ---: | ---: | --- |
| `--text-caption` | `text-caption` | 14 | 0.875 | captions, helper text, `povinná položka` |
| `--text-body` | `text-body` | 16 | 1 | **body default** |
| `--text-lead` | `text-lead` | 20 | 1.25 | lead paragraphs, intro copy |
| `--text-title-s` | `text-title-s` | 25 | 1.5625 | card headings, `h4` |
| `--text-title-m` | `text-title-m` | 31 | 1.9375 | `h3` |
| `--text-title-l` | `text-title-l` | 39 | 2.4375 | `h2`, section headings |
| `--text-display` | `text-display` | 49 | 3.0625 | `h1`, hero |

The names are semantic rather than `xs…3xl` on purpose. Tailwind's own `--text-*`
scale is reset to `initial` in `global.css`, so `text-sm` and `text-base` no longer
exist   and if we had reused those names, `text-base` would silently have meant
20 px to anyone who has used Tailwind before. Distinct names make that impossible.

14 px is deliberately off the ratio   a true 1.25 step below 16 is 12.8 px, which is
too small for helper text next to a form field. Do not "correct" it.

Mobile: the top two steps clamp down   49 → 39 and 39 → 31 below 640 px. Everything
else holds. Body text never drops below 16 px, on any viewport, for any reason.

### 2.5 Weights

**400 and 600. Two weights, no others.** No 300, no 500, no 700, and never a
browser-synthesised bold   `font-synthesis: none` is set globally so that a missing
weight fails visibly in review instead of quietly rendering a smeared fake.

Fraunces is variable on `wght`; the axis is clamped to 400–600 in the subset so an
out-of-range value is impossible.

### 2.6 Rules

- Fraunces is for headings and pull quotes. **Never** for body copy, never for UI
  labels, never below 20 px.
- Public Sans is for everything else, including all numerals   prices, dates,
  capacities, distances. Tabular figures (`font-variant-numeric: tabular-nums`) in
  the price table and the calendar.
- Body line height 1.6. Headings 1.15. Display at 49 px: 1.05.
- Headings take `text-wrap: balance`; body paragraphs take `text-wrap: pretty`.
- Czech hard-space rule: single-letter prepositions and conjunctions
  (`v k s z o u a i`) must never end a line, and neither may a numeral be split from
  its unit. Use `&nbsp;`   `2&nbsp;až&nbsp;15 osob`, `30 000&nbsp;Kč`,
  `9&nbsp;km`. This is not optional politeness in Czech typesetting; a line ending
  in `v` reads as an error. Content authors get this wrong, so bake it into the
  content pipeline where possible.
- Czech quotation marks are `„low“ high`, not `"straight"` and not `“English”`.
- No letter-spacing on body copy. Small caps and tracked-out capitals are permitted
  on buttons and eyebrow labels only, at `0.08em`.

---

## 3. Layout

- **12 columns, max width 1280 px.** Gutter 24 px mobile, 32 px from 768 px up.
- **Body text sits in columns 2–7 and never exceeds 65ch.** Not centred, not full
  width   left of centre, with the right third open. The open space is where the
  photography breathes.
- **Photography bleeds full width.** Full-bleed images escape the 1280 px container
  entirely and run edge to edge.
- Vertical rhythm on an 8 px base. Section padding: 64 px mobile, 96 px tablet,
  128 px desktop.
- **Asymmetry is intentional.** The current site centres everything, which is why it
  reads as a template. Text left, image right; then image left, text right; and the
  measure stays narrow while the pictures stay wide. If a layout looks accidentally
  lopsided, it is probably correct   check it against this paragraph before
  centring it.
- Alternating bands: `--omitka` → `--kamen` → `--omitka`, with occasional full-bleed
  `--les` for statement sections. Never two identical bands adjacent.

### 3.1 Breakpoints

| | | |
| --- | ---: | --- |
| `sm` | 640 px | large phone |
| `md` | 768 px | tablet, 12-column grid engages |
| `lg` | 1024 px | laptop |
| `xl` | 1280 px | container max   no wider breakpoint exists |

Design mobile-first and check 360 px. The primary audience arrives on a phone.

---

## 4. Illustration language

The existing brand mark is **hand-drawn white line work**   spruces and an owl   and
it is used over photography on the site's two illustrated maps (`img/situace1-1.webp`,
`img/situace2.webp` and the regional map on `/okoli`). It is the only genuinely
distinctive thing the 2019 site has. It is being kept, and everything drawn from now
on must belong to the same hand.

**This is a rule, not a mood board.** All decorative vegetation and map ornament
added to this site must match the existing mark on:

1. **Line weight**   a single consistent stroke, matched to the existing spruces.
   Nominal 2 px at 1�  on a 1280 px-wide canvas; scale proportionally, and set
   `vector-effect: non-scaling-stroke` so a scaled SVG does not thin out or fatten
   up. No variable-width strokes, no tapered ends, no calligraphic modulation.
2. **The slightly irregular hand-drawn quality**   the existing lines wobble. Keep
   the wobble. A geometrically perfect spruce drawn in Illustrator with the pen tool
   will read as a different brand standing next to the original, and the mismatch is
   more visible than the illustration itself. Draw by hand, or perturb the path
   nodes; do not use a symmetrical primitive.

   **The spruce silhouette is a narrow spike leader over three to five boldly
   notched tiers.** Each tier runs out-and-down to a point, then the outline cuts
   back up and in before the next tier reaches further. The notch is the whole
   signature and it has to be deep   roughly a third of the tier's reach. A first
   attempt at the footer treeline used shallow 10 % notches and read as generic
   vector clip-art at every size; the same trees with deep notches read as drawn.
   Left and right flanks must never mirror: differing tier counts and spacings on
   each side is what stops a treeline looking stamped.

   Below about 0.42 of the nominal 112-unit height the notches close up and the
   tree reverts to a plain triangle. That is the floor for any placement   check a
   scale ramp before setting scales.
3. **Colour**   white line only, over photography or over `--les`. Never frost, never
   a decorative fill. The line is always unfilled: it is drawing, not iconography.

   **Two exceptions, both shipped on the homepage and both deliberate:**

   - **Brass line on a light ground, for the section dividers.** Rule 5 forbids white
     line work on `--omitka` and `--kamen` because it is invisible there. The two
     sprig dividers sit on exactly those bands, so the sprig takes `--mosaz`, the
     colour of the rule it interrupts, and the three marks read as one ornament.
     The *hand* carries the brand here   irregular needle lengths, forward rake, no
     mirrored pairs   not the colour.
   - **Filled silhouette, for the standing wood.** The footer treeline and the two
     stands in the O nás clearing are masses the layout rises out of, not ornaments
     laid over a photograph. They are filled (`--les` and `--kamen` respectively) and
     layered at two opacities for depth. The stepped, notched spruce geometry is what
     keeps them in the same hand as the outline mark.

     There was a third   a treeline along the hero's lower edge   removed by request:
     the hero is now the photograph and the copy on it, and it ends on a clean
     horizontal. The pale mist gradient at the foot of the hero scrim went with it,
     since its only job was to give those trees something their own value to stand in.

   Anything that is *ornament over photography* still follows the rule as written:
   white, unfilled, line only.
4. **Subject**   spruce, fir, owl, stream, path, contour, hand-lettered label,
   simple arrow, brace. Nothing that is not from this place. No generic leaves, no
   pine cones borrowed from a stock set, no seasonal flourishes.
5. **Where it is allowed**   over photography, in the two maps, as a section divider
   over `--les`. Never over `--omitka` or `--kamen` as a floating decoration; white
   line work on a near-white ground is invisible, and someone will "fix" it by
   colouring it in, which breaks rule 3.

Both illustrated maps are currently raster with the labels baked in   which means
`Hot Tube`, `Mezonetová ložnice 2+3 os.` and the rest are invisible to search and to
screen readers, and unfixable when a label changes.
**Rebuild them as photograph + inline SVG:** the aerial photo stays a raster
`<img>`, and the line work and every label become live `<svg>` sitting over it.
Label text becomes real `<text>`. See [01-content.md](01-content.md) §4.5 and §7.4
for the complete label copy.

Decorative SVG carries `aria-hidden="true"` and `pointer-events: none`
([03-tech.md](03-tech.md)). Map *labels* are content, not decoration   they stay in
the accessibility tree, and the map as a whole gets a `<title>` and a text
alternative listing what it shows.

---

## 5. Motion

**CSS only. No animation library, no JavaScript-driven scroll.**

### 5.1 Scroll reveals

Via `animation-timeline: view()`. This is the entire scroll-animation system.

```css
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .reveal {
      /* Longhands only   see the warning below. */
      animation-name: reveal;
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: view();
      animation-range: entry 10% cover 30%;
    }
  }
}
@keyframes reveal {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: none; }
}
```

> ### ⚠ Never write scroll-driven animations with the `animation` shorthand
>
> This bit us once already, in the site header, and it fails in the nastiest
> possible way: **silently, and only in the production build.**
>
> Write this  
>
> ```css
> animation: reveal linear both;
> animation-timeline: view();
> ```
>
>   and the CSS minifier helpfully folds the timeline into the shorthand, emitting
> `animation: linear both reveal view()`. That grammar is not what Chromium
> implements, so the whole declaration is invalid, `animation-name` computes to
> `none`, and the effect does nothing. It works perfectly in `astro dev`, where the
> CSS is not minified, and dies on deploy.
>
> **Always use the five longhands**: `animation-name`, `animation-timing-function`,
> `animation-fill-mode`, `animation-timeline`, `animation-range`. Kept apart, the
> minifier leaves them alone. Verify by grepping the built CSS in `dist/_a/` for
> `animation-name:`   if you find `animation:` followed by a timeline function
> instead, the rule is dead.

**Graceful skip is mandatory and it is the default state.** The animated properties
are declared *only* inside the `@supports` block, so a browser without
`animation-timeline`   currently including Safari and Firefox   renders the element
in its final state with no opacity applied. Never author a reveal as
`opacity: 0` in the base rule with the animation restoring it; that is how content
becomes permanently invisible on an unsupported browser, and on this site invisible
content means a lost inquiry.

Reveals are for section entrances only. Not every card, not every paragraph, and
never more than one element at a time in a viewport.

### 5.2 Hover

Image scale **1.02 over 300 ms**, `ease-out`. That is the hover vocabulary.
Implemented as `transform: scale()` on the image inside an `overflow: hidden`
wrapper, so the frame stays still and the picture moves inside it. Buttons get a
background-colour transition over 150 ms, nothing else. Hover effects apply under
`@media (hover: hover)` only   a touch device must never be left holding a hover
state.

### 5.3 Banned

- **No parallax**, with one named exception below. Not on the hero, not on the
  maps, not "just a little" on a background.
- **No counting-up numbers.** Not on capacity, not on prices, not on distances.
  A price that animates is a price that cannot be read.
- **No hero entrance animation.** The hero is the largest contentful paint; animating
  it delays the one thing the guest came for and hurts the LCP metric we are
  budgeted against.
- No carousels (see [01-content.md](01-content.md) §4.1), no auto-playing video, no
  marquees, no cursor followers, no page transitions, no skeleton shimmer.

#### The one exception: `[data-drift]`

There is exactly one sanctioned parallax on this site and it is a **primitive in
`global.css`, not a per-section effect**. It exists on the homepage's Dolní Morava
split and on the `/okoli` opener, and nowhere else.

It was allowed back in on four conditions, all of which are enforced by the rule
itself rather than by review:

1. **No JavaScript.** It runs off `animation-timeline: view()`. No scroll
   listener, nothing on the main thread.
2. **Bounded.** `--drift-shift` is a percentage of the element's own box and
   nothing goes past 6 %.
3. **Still by default.** The transform is declared *only* inside `@supports`, so
   a browser with no scroll timeline gets a correctly framed, motionless
   photograph   the same graceful-skip contract as §5.1.
4. **More than one layer, or don't bother.** A single photograph moving inside
   its own frame with nothing beside it standing still is not depth; it is a
   picture that will not sit down. Two layers is a moving picture. The `/okoli`
   opener has three (photograph, wood, copy panel) and the front one travels in
   the *opposite* direction   that separation is the whole effect.

> #### ⚠ The clipping frame must be `overflow: clip`, never `overflow: hidden`
>
> `overflow: hidden` **creates a scroll container**, and `view()` resolves against
> the nearest ancestor scroll container. A drifting layer inside an
> `overflow: hidden` frame therefore takes its timeline from a box it exactly
> fills and which never scrolls: progress pins at **0.500** and stays there.
>
> 0.500 is the *middle* of the range, so the result renders correctly framed,
> correctly oversized and perfectly still. Nothing errors, nothing logs, the CSS
> validates, `@supports` passes, and `getAnimations()` returns a live animation.
> The site's only parallax shipped like that and never moved once.
>
> `overflow: clip` clips identically without creating a scroll container. If a
> drift ever looks static, walk the ancestors for a computed `overflow` other
> than `visible` before touching anything else. The same warning applies to
> `.photo-frame`, which is `overflow: hidden` under `@media (hover: hover)`.

The same primitive family drives the route line in `OkoliVylety.astro`, which
ties a `scaleY` to scroll position rather than to a clock. Same four conditions,
same `@supports` gate.

### 5.4 `prefers-reduced-motion`

Respected globally, not per-component:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Reduced motion means *reduced*, not *broken*: with the rule above every element still
arrives at its final state instantly. Verify this by toggling the OS setting and
reloading   the page must be complete and readable, with nothing faded out and
nothing missing.

---

## 6. Components   the shape of them

Not built yet. Recorded here so that when they are built they are built once.

| Component | Notes |
| --- | --- |
| **Primary CTA** | `--mosaz` fill, `--omitka` text (5.14:1), 4 px radius, tracked caps at 14 px. One per section, maximum. |
| **Secondary CTA** | 1 px `--mosaz` outline, `--mosaz-tmava` text on light / `--mosaz-svetla` on dark. |
| **Focus ring** | 2 px `--mosaz` outline, 2 px offset, on **every** interactive element. Never removed. Visible on both light and dark grounds   check it against `--les` as well as `--omitka`. |
| **Section band** | Full-bleed background, inner 1280 px container, text in columns 2–7. |
| **Photo figure** | Full-bleed or column 7–12. Always `width`/`height`, always Czech `alt`. Hover 1.02. |
| **Fact strip** | Capacity, bedrooms, distance to the ski lift, distance to the forest. Tabular numerals. |
| **Price table** | One table, seasons as rows, tabular numerals, fees below it   not six cards. |
| **Calendar** | Four states from the old widget: `Volno`, `Obsazeno`, `Den příjezdu`, `Den odjezdu`. State must never be conveyed by colour alone   pattern or glyph as well. Winter months may use `--jinovatka`. |
| **Inquiry form** | Real `<label>` on every field, errors in text next to the field, works with JavaScript off. The most important component on the site. |

---

## 7. Checklist before any component is merged

- [ ] No hex codes and no raw px in the component   tokens only
- [ ] Text contrast ≥ 4.5:1, checked against the table in §1.1
- [ ] `--mosaz` used as a fill, never as text
- [ ] Type sizes are from the scale in §2.4; weights are 400 or 600
- [ ] Body copy is within 65ch and inside columns 2–7
- [ ] Every `<img>` has explicit `width`, `height` and Czech `alt`
- [ ] Decorative SVG is `aria-hidden="true"` + `pointer-events: none`
- [ ] Keyboard focus is visible on both light and dark grounds
- [ ] Reveals skip gracefully with `animation-timeline` unsupported
- [ ] Page is complete and readable with `prefers-reduced-motion: reduce`
- [ ] Czech hard spaces after single-letter prepositions and in numeral + unit pairs
- [ ] Renders correctly at 360 px
