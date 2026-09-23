/**
 * The amenity checklist and the room descriptions for /ubytovani.
 *
 * ---------------------------------------------------------------------------
 * ⚠ THIS IS THE OLD SITE'S CONTENT, ON PURPOSE. DO NOT "IMPROVE" IT.
 *
 * An earlier pass rewrote these lists to follow docs/01-content.md §5.9  
 * regrouped, reworded, entries dropped for being unverifiable. That was
 * reverted by decision: **this rebuild changes the design, not the copy.** The
 * five groups below, their order, and the wording of every entry are the ones
 * from the 2019 `/ubytovani/` page. If an entry reads oddly, that is the
 * client's own voice and it stays until the client asks otherwise.
 *
 * Three things WERE changed, and each is a typo fix rather than an edit:
 * `poskutuje` → `poskytuje`, `koupena` → `koupelna` (twice). They are listed in
 * docs/01-content.md §1 as spelling errors on the live site.
 *
 * The one substantive departure is `overit` on the accessibility entry, and it
 * is argued in place below.
 *
 * Client edits (September 2026): `domácí mazlíček povolen` removed from
 * Obecně (pets are covered on /terminy-a-ceny), and the sauna and hot tub moved
 * from Vnitřní to Venkovní vybavení, where they actually stand.
 * ---------------------------------------------------------------------------
 */
import type { LucideName } from '../components/IconLucide.astro';

export interface VybaveniPolozka {
  nazev: string;
  /**
   * Present only where the entry cannot stand as a bare tick. Renders as a
   * caveat beside the item   never suppressed, never turned back into a tick.
   */
  overit?: string;
}

export interface VybaveniSkupina {
  klic: string;
  /** The old site's own group heading, verbatim. */
  nazev: string;
  icon: LucideName;
  polozky: VybaveniPolozka[];
}

/**
 * `Přehled vybavení`   the five lists from the old `/ubytovani/`, in the old
 * order, with the old wording.
 *
 * Design note: they were five bulleted columns of plain text and they are still
 * five columns here. The change is typographic   a tick glyph, a group icon,
 * real columns instead of a three-across float   not editorial.
 */
export const VYBAVENI: VybaveniSkupina[] = [
  {
    klic: 'obecne',
    nazev: 'Obecně',
    icon: 'info',
    polozky: [
      { nazev: 'wifi, internet' },
      { nazev: 'nekuřácký objekt' },
      { nazev: 'společenská místnost' },
      {
        nazev: 'bezbariérové ubytování',
        /*
         * ⚠ THE ONE ENTRY THAT IS NOT REPRODUCED AS A BARE TICK, AND THE ONLY
         * DEPARTURE FROM "COPY THE OLD SITE" IN THIS FILE.
         *
         * docs/01-content.md §9 item 2 lists it as launch-blocking, and the
         * reason is not editorial. This is a two-storey building on a forested
         * slope whose two upper bedrooms are mezzanines reached by a ladder
         * stair. If the blanket claim is wrong, the way that goes wrong is a
         * wheelchair user arriving at a door they cannot get through, having
         * driven three hours on the strength of one word on this page.
         *
         * The ground floor genuinely does have a bedroom, a WC and a shower, so
         * a narrower claim is probably true   but nobody has yet said which. So
         * the entry stays, with one sentence next to it inviting the question.
         * Delete the sentence the day the client answers, not before.
         */
        overit: 'Ozvěte se nám prosím předem, domluvíme se podle vašich potřeb.',
      },
    ],
  },
  {
    klic: 'vnitrni',
    nazev: 'Vnitřní vybavení',
    icon: 'sofa',
    polozky: [
      { nazev: 'krb / krbová kamna' },
      { nazev: 'televize' },
      { nazev: 'přehrávač' },
      { nazev: 'satelitní příjem' },
      { nazev: 'rychlovarná konvice' },
      { nazev: 'lednička' },
      { nazev: 'myčka nádobí' },
      { nazev: 'mikrovlnná trouba' },
      { nazev: 'pračka' },
      { nazev: 'sprchový kout' },
      { nazev: 'vana' },
    ],
  },
  {
    klic: 'venkovni',
    nazev: 'Venkovní vybavení',
    icon: 'tent-tree',
    polozky: [
      { nazev: 'terasa' },
      { nazev: 'krb' },
      { nazev: 'zahradní nábytek' },
      { nazev: 'ohniště' },
      { nazev: 'gril' },
      { nazev: 'sauna nebo infrasauna' },
      { nazev: 'hot tube' },
    ],
  },
  {
    klic: 'okoli',
    nazev: 'Okolí chalupy',
    icon: 'trees',
    polozky: [
      { nazev: 's parkováním' },
      { nazev: 'se zahradou' },
      { nazev: 'travnatá plocha' },
      { nazev: 'u potoku' },
      { nazev: 'u lesa' },
    ],
  },
  {
    klic: 'zabava',
    nazev: 'Možnosti zábavy v okolí',
    icon: 'bike',
    polozky: [
      { nazev: 'půjčovna kol' },
      { nazev: 'přírodní koupání' },
      { nazev: 'koupaliště nebo bazén' },
      { nazev: 'cykloturistika' },
      { nazev: 'jízdárna' },
      { nazev: 'tenisové kurty' },
      { nazev: 'golfové hřiště' },
      { nazev: 'rybaření' },
    ],
  },
];

/* ---- Bathrooms ---------------------------------------------------------- */

export interface Zarizeni {
  patro: string;
  polozky: string[];
}

/**
 * `Sociální zařízení`, from the old page's own paragraph:
 *
 *   "V prvním patře je jedno samostatné WC, dále koupelna se sprchovým koutem,
 *    umyvadlem a zrcadlem a žebříkovým topením. V druhém patře je opět
 *    samostatné WC, koupelna s prostornou vanou, umyvadlem a žebříkovým
 *    topením."
 *
 * Split into two labelled lists rather than reworded. Every noun below appears
 * in that sentence; nothing has been added and nothing dropped. A reader
 * comparing two floors should not have to hold a 40-word sentence in their head
 * to do it   that is a layout problem, and this is the layout fix.
 *
 * `koupena` → `koupelna` in both places (docs/01-content.md §1 error #8).
 */
export const SOCIALNI_ZARIZENI: Zarizeni[] = [
  {
    patro: 'První patro',
    polozky: [
      'Samostatné WC',
      'Koupelna se sprchovým koutem, umyvadlem a zrcadlem',
      'Žebříkové topení',
    ],
  },
  {
    patro: 'Druhé patro',
    polozky: [
      'Samostatné WC',
      'Koupelna s prostornou vanou a umyvadlem',
      'Žebříkové topení',
    ],
  },
];
