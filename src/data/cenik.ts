/**
 * The price list, and every figure derived from it.
 *
 * This module exists so that no price is ever written into markup. The current
 * site hardcodes "311 Kč na noc za osobu" in the homepage, and that number stopped
 * matching the price list some years ago — against the rates below it should be
 * 285,71 Kč. Full post-mortem in docs/01-content.md §2.
 *
 * Rule: if a number about money appears on a page, it is computed here.
 *
 * TODO(client): several inputs are still unconfirmed —
 *   - what `víkend` means (2 nights? Fri–Sun? 3 on a bank holiday?)
 *   - exact season boundaries; `půlka března` / `půlka září` are not dates
 *   - current electricity rate and municipal recreation fee
 * docs/01-content.md §9, items 5, 6 and 7.
 */

/** Maximum occupancy. Authoritative figure — see docs/00-brief.md. */
export const KAPACITA = 15;

/** Nights in a weekly booking, used to derive per-night figures. */
export const NOCI_V_TYDNU = 7;

/** Whole-cottage rates in Kč. Transcribed from /volne-terminy-a-ceny/. */
export const CENIK = {
  tyden: { zimni: 30_000, letni: 30_000, mimo: 26_000 },
  vikend: { zimni: 15_000, letni: 15_000, mimo: 13_000 },
} as const;

/** Cheapest weekend for the whole cottage — the honest "od" figure. */
export const OD_VIKEND = Math.min(...Object.values(CENIK.vikend));

/** Cheapest week for the whole cottage. */
export const OD_TYDEN = Math.min(...Object.values(CENIK.tyden));

/**
 * Per person per night at full occupancy, in-season week, rounded to the nearest
 * 50 Kč so it reads as the approximation it is.
 *
 * 30 000 / 7 / 15 = 285,71 → "zhruba 300 Kč". Derived, so it cannot go stale the
 * way the hardcoded 311 Kč did. It excludes metered electricity, the water charge
 * and the municipal fee, which is why it is only ever shown next to that caveat.
 */
export const ZA_OSOBU_NOC = Math.round(Math.max(...Object.values(CENIK.tyden)) / NOCI_V_TYDNU / KAPACITA / 50) * 50;

/**
 * Czech currency formatting with hard spaces, so `30 000 Kč` can never break
 * across two lines (docs/02-design-system.md §2.6).
 */
export function formatKc(value: number): string {
  const NBSP = ' ';
  return `${value.toLocaleString('cs-CZ').replace(/\s/g, NBSP)}${NBSP}Kč`;
}
