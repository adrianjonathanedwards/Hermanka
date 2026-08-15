/**
 * The character set every self-hosted face on this site is subset to.
 *
 * Read docs/02-design-system.md §2.2 before changing anything here. The short
 * version: Google's `latin-ext` subset does NOT contain the whole Czech alphabet.
 * á é í ó ú ý live in `latin`; č ď ě ň ř š ť ů ž live in `latin-ext`. Subsetting to
 * one or the other renders "Heřmanka" in two different fonts. This file spans both
 * deliberately, as one unified range.
 */

/** Contiguous ranges, inclusive. */
const RANGES = [
  [0x0020, 0x007e], // basic Latin
  [0x00a0, 0x00a0], // no-break space — required, Czech binds v/k/s/z/a/i/o + numerals
  [0x00ad, 0x00ad], // soft hyphen
];

/** Everything else, grouped by why it is here. */
const GROUPS = {
  czechLower: 'áčďéěíňóřšťúůýž',
  czechUpper: 'ÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ',
  german: 'äöüßÄÖÜ', //          for the planned /de/ locale
  polish: 'ężźłńśćŁ', //         one word: Międzygórze, on the regional map
  punctuation: '–—‘’‚“„…•§', //  Czech quotes are „low“ high; § for the terms page
  symbols: '©°×€', //            Kč needs nothing special — it is K + č
};

/** The 30 Czech accented characters. Used by the coverage verifier. */
export const CZECH_REQUIRED = GROUPS.czechLower + GROUPS.czechUpper;

export const CHARSET = (() => {
  const set = new Set();
  for (const [a, b] of RANGES) for (let c = a; c <= b; c++) set.add(String.fromCodePoint(c));
  for (const group of Object.values(GROUPS)) for (const ch of group) set.add(ch);
  return [...set].join('');
})();
