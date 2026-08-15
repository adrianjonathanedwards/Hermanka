# public/fonts

Two files, both generated. **Do not edit them, do not download replacements by
hand, and do not add a third face.**

```
fraunces-var.woff2      22.5 kB   display — Fraunces, wght 400–600 axis
public-sans-var.woff2   18.2 kB   body    — Public Sans, wght 400–600 axis
```

Both are committed, so a normal `npm run build` and a Cloudflare Pages deploy need
no network access.

## Regenerating

```bash
npm run build:fonts
```

That downloads the upstream variable fonts from `google/fonts` into `.cache/fonts/`
(gitignored), subsets them to the Czech charset in
[`tools/charset.mjs`](../../tools/charset.mjs), writes the two woff2 files here,
enforces the 28 kB per-face budget, and then verifies glyph coverage. It fails
rather than writing a font that is over budget or missing a character.

To check the committed files without regenerating:

```bash
npm run verify:fonts
```

## Why it is done this way

**Google's `latin-ext` subset does not contain the Czech alphabet.** `á é í ó ú ý`
are in `latin`; `č ď ě ň ř š ť ů ž` are in `latin-ext`. Serving Google's
`latin-ext` slice alone renders `Heřmanka` in two different fonts. Our subset spans
both as one unified range. Full reasoning in
[docs/02-design-system.md](../../docs/02-design-system.md) §2.2.

**Variable beats static here.** Two static instances per family would be 25.9 kB
(Fraunces) and 22.0 kB (Public Sans) against 22.5 kB and 18.2 kB for one variable
file each — smaller *and* two fewer requests, while keeping the whole 400–600 range.

**Axes are pinned.** Fraunces ships with four axes; `opsz` is pinned to 144, and
`SOFT` and `WONK` to 0. The wonky forms are not the brand, and shipping unused axes
costs bytes.

## Licence

Both faces are SIL Open Font License 1.1. Fraunces © Undercase Type; Public Sans is
a US Government / USWDS work. The OFL requires the licence to travel with the font,
including with subsets — keep [`OFL.txt`](OFL.txt) here and do not rename the
families.
