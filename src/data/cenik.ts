/**
 * The price list, and every figure derived from it.
 *
 * This module exists so that no price is ever written into markup. The current
 * site hardcodes "311 Kč na noc za osobu" in the homepage, and that number stopped
 * matching the price list some years ago   against the rates below it should be
 * 285,71 Kč. Full post-mortem in docs/01-content.md §2.
 *
 * Rule: if a number about money appears on a page, it is computed here.
 *
 * TODO(client): several inputs are still unconfirmed  
 *   - what `víkend` means (2 nights? Fri–Sun? 3 on a bank holiday?)
 *   - exact season boundaries; `půlka března` / `půlka září` are not dates
 *   - current electricity rate and municipal recreation fee
 * docs/01-content.md §9, items 5, 6 and 7.
 */

import type { LucideName } from '../components/IconLucide.astro';

/** Maximum occupancy. Authoritative figure   see docs/00-brief.md. */
export const KAPACITA = 15;

/** Nights in a weekly booking, used to derive per-night figures. */
export const NOCI_V_TYDNU = 7;

/** Whole-cottage rates in Kč. Transcribed from /volne-terminy-a-ceny/. */
export const CENIK = {
  tyden: { zimni: 30_000, letni: 30_000, mimo: 26_000 },
  vikend: { zimni: 15_000, letni: 15_000, mimo: 13_000 },
} as const;

/** Cheapest weekend for the whole cottage   the honest "od" figure. */
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

/* ==========================================================================
   Everything below `formatKc` was added for /terminy-a-ceny.

   docs/01-content.md §6.6 is the rule it exists to satisfy: "Everything in
   §6.2–§6.4 must land in a typed content collection, not in page markup:
   seasons with real start/end dates, weekly and weekend rates, holiday blocks
   with explicit dates and an expiry, and the fee schedule. Pages compute from
   it. That way a stale date is a build-time problem rather than something a
   guest finds first."

   The `23.-26.12.2024` still sitting on the live site next to the word `letos`
   is what happens without this file.
   ========================================================================== */

/**
 * Czech currency formatting with hard spaces, so `30 000 Kč` can never break
 * across two lines (docs/02-design-system.md §2.6).
 */
export function formatKc(value: number): string {
  const NBSP = ' ';
  return `${value.toLocaleString('cs-CZ').replace(/\s/g, NBSP)}${NBSP}Kč`;
}

/* ---- Seasons ------------------------------------------------------------ */

/**
 * U+00A0. Interpolated as `${NBSP}` rather than typed into each string, because
 * a literal hard space in source looks exactly like an ordinary one   which is
 * how they go missing in review and in edits.
 *
 * docs/02-design-system.md §2.6 requires one between a numeral and its unit and
 * after a single-letter preposition: `30 000 Kč`, `2 noci`, `v nich`. A Czech
 * line ending in `v` reads as an error, not as a typographic nicety.
 */
const NBSP = ' ';

export interface Sezona {
  klic: 'zimni' | 'letni' | 'mimo';
  nazev: string;
  /** Human-readable span. NOT a date, deliberately   see `PRESNE_HRANICE_CHYBI`. */
  obdobi: string;
  tyden: number;
  vikend: number;
}

/**
 * ⚠ `obdobi` is prose because the underlying dates DO NOT EXIST YET.
 *
 * The price list says `prosinec-půlka března` and `červen-půlka září`. "Half of
 * March" is not a date, and the season boundary decides the price   15. 3. and
 * 31. 3. are 4 000 Kč apart for the same week. docs/01-content.md §9 item 5
 * lists it as launch-blocking.
 *
 * When the client answers, these strings become real `od`/`do` month-day pairs
 * and this module gains a `sezonaProDatum(d: Date)`. Nothing that renders them
 * has to change; that is the point of them living here.
 */
export const PRESNE_HRANICE_CHYBI = true;

export const SEZONY: Sezona[] = [
  {
    klic: 'zimni',
    nazev: 'Zimní sezona',
    obdobi: 'prosinec – půlka března',
    tyden: CENIK.tyden.zimni,
    vikend: CENIK.vikend.zimni,
  },
  {
    klic: 'letni',
    nazev: 'Letní sezona',
    obdobi: 'červen – půlka září',
    tyden: CENIK.tyden.letni,
    vikend: CENIK.vikend.letni,
  },
  {
    klic: 'mimo',
    nazev: 'Mimo sezonu',
    obdobi: 'zbytek roku',
    tyden: CENIK.tyden.mimo,
    vikend: CENIK.vikend.mimo,
  },
];

/* ---- Booking rules ------------------------------------------------------ */

export interface Pravidlo {
  icon: LucideName;
  nazev: string;
  popis: string;
}

/**
 * The two rules that decide whether a stay is possible at all.
 *
 * docs/04-pages.md: "Two rules that are currently buried and must be visible
 * next to the calendar: minimum stay two nights, and January/February and
 * July/August are whole weeks only. Somebody is about to try to book a weekend
 * in July."
 */
export const PRAVIDLA: Pravidlo[] = [
  {
    icon: 'moon',
    nazev: `Minimálně 2${NBSP}noci`,
    popis: 'Kratší pobyt než dvě noci nenabízíme, ani mimo sezonu.',
  },
  {
    icon: 'calendar-days',
    nazev: 'V lednu, únoru, červenci a srpnu jen celé týdny',
    popis: `V těchto čtyřech měsících přijímáme objednávky pouze na celé týdny${NBSP}  víkend v${NBSP}nich rezervovat nejde.`,
  },
];

/* ---- Holidays ----------------------------------------------------------- */

export interface Svatek {
  klic: string;
  nazev: string;
  cena: number | null;
  /** e.g. `3 noci`. Null when the client has not said which nights. */
  delka: string | null;
  /**
   * Explicit dates, ISO. **Null means "not supplied for the coming season".**
   * A block with null dates renders as an enquiry, never as an offer with a
   * stale year on it.
   */
  od: string | null;
  do: string | null;
  text: string;
}

/**
 * ⚠ THE DATES ARE NULL ON PURPOSE AND MUST NOT BE FILLED IN WITH A GUESS.
 *
 * The live site advertises `Vánoce 23.-26.12.2024` under the word `letos`   two
 * years stale at the time of writing, and the single clearest signal a visitor
 * gets that nobody is minding the site (docs/01-content.md §1 error #5, §6.3).
 * The fix is not to type in this year's dates; it is to make an absent date
 * *impossible to render as a current one*. `jeAktualni()` below enforces that:
 * no dates, no date shown.
 *
 * TODO(client)   LAUNCH-BLOCKING, docs/01-content.md §9 items 3 and 4: which
 * three nights is Silvestr, and which nights are the Christmas block, for the
 * coming season.
 */
export const SVATKY: Svatek[] = [
  {
    klic: 'silvestr',
    nazev: 'Silvestr',
    cena: 35_000,
    delka: `3${NBSP}noci`,
    od: null,
    do: null,
    text: 'Srdečně vás zveme, abyste s námi oslavili příchod nového roku v pohodlném, rodinném a pohodovém prostředí.',
  },
  {
    klic: 'vanoce',
    nazev: 'Vánoce',
    cena: 18_000,
    delka: null,
    od: null,
    do: null,
    text: 'Vánoce jsou obdobím radosti a pohody. Strávit svátky v příjemném prostředí, obklopeni přírodou, je to nejlepší, co Heřmanka nabízí.',
  },
];

/**
 * Whether a holiday block has dates that have not yet passed. A block with no
 * dates is never "current"   it renders as "termín upřesníme", which is true,
 * instead of as an offer for a year that has been and gone.
 *
 * Called at BUILD time. The site is static, so "today" is the day of the last
 * deploy; that is accurate enough for a block whose dates move once a year, and
 * it is the same trade-off the footer's copyright year already makes.
 */
export function jeAktualni(s: Svatek, dnes: Date = new Date()): boolean {
  if (!s.do) return false;
  return new Date(s.do) >= dnes;
}

/* ---- Fees on top of the rate -------------------------------------------- */

export interface Poplatek {
  icon: LucideName;
  nazev: string;
  /** Pre-formatted: some are per person, some per kWh, one is a flat deposit. */
  castka: string;
  popis: string;
  /** True when the figure is unconfirmed and must be shown as approximate. */
  nepotvrzeno?: boolean;
}

/**
 * What is added to the rate. The old site had all of this as one 120-word
 * paragraph in the middle of the payment terms, which is where a guest finds out
 * about the electricity meter after they have already decided
 * (docs/01-content.md §6.4).
 */
export const POPLATKY: Poplatek[] = [
  {
    icon: 'zap',
    nazev: 'Elektřina',
    castka: `7${NBSP}Kč/kWh`,
    popis: 'Podle skutečné spotřeby, odečteno na konci pobytu.',
    // TODO(client)   docs/01-content.md §9 item 7. The rate is from 2019 and the
    // word on the old site is `momentálně`, which is not a price.
    nepotvrzeno: true,
  },
  {
    icon: 'droplets',
    nazev: 'Voda',
    castka: `100${NBSP}Kč za osobu a pobyt`,
    popis: 'Jednorázově za osobu, bez ohledu na délku pobytu.',
  },
  {
    icon: 'receipt',
    nazev: 'Rekreační poplatek obci',
    castka: `4${NBSP}Kč za osobu a noc`,
    popis: 'Poplatek z pobytu, který odvádíme obci.',
    // TODO(client)   docs/01-content.md §9 item 7. Set by local ordinance; 4 Kč
    // is low for 2026 and needs confirming with the obec.
    nepotvrzeno: true,
  },
  {
    icon: 'flame-kindling',
    nazev: 'Sauna a vířivka',
    castka: `1 000${NBSP}Kč/den · 3 000${NBSP}Kč/týden`,
    popis: 'Volitelné. Bez objednání se neúčtují.',
  },
  {
    icon: 'wallet',
    nazev: 'Vratná kauce',
    castka: `2 000${NBSP}Kč`,
    popis:
      'Skládá se před příjezdem a dá se z ní zaplatit elektřina a voda. Při nepoškozeném objektu se vrací.',
  },
];

/* ---- Payment terms ------------------------------------------------------ */

export interface Podminka {
  icon: LucideName;
  nazev: string;
  popis: string;
}

/**
 * The terms that ARE known. Everything the old site says about payment,
 * rewritten as steps instead of a wall of text   no facts changed.
 *
 * ⚠ `CHYBEJICI_PODMINKY` below is the other half of this, and it is the more
 * important half. Do not delete it because the page looks tidier without it.
 */
export const PODMINKY: Podminka[] = [
  {
    icon: 'calendar-days',
    nazev: 'Rezervace',
    popis:
      'Termín potvrdíme e-mailem nebo telefonicky. Objekt je v provozu celoročně, mimo dobu údržbových prací.',
  },
  {
    icon: 'credit-card',
    nazev: 'Záloha 50 %',
    popis:
      'Převodem na účet nejpozději dva týdny před začátkem pobytu. Záloha je z ceny nájmu a vody.',
  },
  {
    icon: 'banknote',
    nazev: 'Doplatek',
    popis: 'Převodem s připsáním nejpozději v den příjezdu, nebo osobně při předání objektu.',
  },
  {
    icon: 'users',
    nazev: 'Menší skupina',
    popis: 'Při obsazení pod 10 osob je možná sleva. Napište nám, kolik vás bude.',
    // TODO(client)   docs/01-content.md §9 item 8. The old homepage promises a
    // flat 10 %; the old price list says a discount "is possible". One of the
    // two is wrong and only the client knows which, so neither number is here.
  },
];

/**
 * What the terms do not say, and a guest will ask.
 *
 * ⚠ THIS LIST IS NOT DECORATION AND NOT A PLACEHOLDER. Every line is a real
 * question the old site answers nowhere (docs/01-content.md §6.4), and bed linen
 * in particular is "the single most-asked question for a Czech chalupa let".
 * They are shown as *ask us* rather than silently omitted, because a guest who
 * cannot find the answer writes to us   which is the entire job of this site  
 * whereas a guest who does not know the question was askable books elsewhere.
 *
 * TODO(client)   docs/01-content.md §9 items 9–12. Each answer received deletes
 * one line here and adds one to PODMINKY above.
 */
export const CHYBEJICI_PODMINKY: string[] = [
  'Čas příjezdu a odjezdu',
  'Storno podmínky',
  'Co je v ceně   povlečení, ručníky, dřevo, pelety',
  'Domácí mazlíčci   za jakých podmínek',
];
