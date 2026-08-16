/**
 * The amenity checklist, as data.
 *
 * docs/01-content.md §5.9 asks for the old site's five bullet lists to ship "as
 * structured data rather than five bullet lists". This is that: five groups,
 * every item typed, three of them carrying a flag that stops them being printed
 * as a plain tick.
 *
 * ---------------------------------------------------------------------------
 * ⚠ THE `overit` FLAG IS A SAFETY MECHANISM, NOT A STYLE CHOICE.
 *
 * Three items on the old list cannot be reproduced as bare ticks:
 *
 *   - `bezbariérové ubytování` — LAUNCH-BLOCKING (docs/01-content.md §9 item 2).
 *     A two-storey cottage on a forested slope with two mezzanine bedrooms is
 *     claiming step-free access. If that is wrong, the wrong ends with a
 *     wheelchair user at a door they cannot get through. The ground floor does
 *     have a bedroom, a WC and a shower, so a narrower claim may well be true —
 *     but it has to be stated precisely, and nobody has stated it yet.
 *   - `domácí mazlíček povolen` — the amenity list says yes and the terms are
 *     silent on charges or limits (§9 item 12).
 *   - `sauna nebo infrasauna` — "sauna or infrared sauna" reads as though we do
 *     not know which one we own. It is an outdoor wood-fired sauna; §5.9 says to
 *     say so, and this file does.
 *
 * An item with `overit` renders with its caveat next to it, never as a tick on
 * its own. A page that drops the caveat has reintroduced the problem.
 * ---------------------------------------------------------------------------
 *
 * The old `Možnosti zábavy v okolí` group — bike hire, riding school, tennis
 * courts, golf course — is NOT here. It is third-party, undated, distance-free
 * and last verified in 2019 (§5.9, §9 item 20): "A bare list with no distances is
 * close to useless anyway; give each a distance or drop it." Dropped from the
 * cottage's own amenity list, where it never belonged; what survives of it lives
 * in src/data/okoli.ts with the rest of the surroundings.
 */
import type { LucideName } from '../components/IconLucide.astro';

export interface VybaveniPolozka {
  nazev: string;
  /**
   * Present only where the item is not simply true. Renders as a caveat beside
   * the item — never suppressed, never turned back into a plain tick.
   */
  overit?: string;
}

export interface VybaveniSkupina {
  klic: string;
  nazev: string;
  icon: LucideName;
  polozky: VybaveniPolozka[];
}

export const VYBAVENI: VybaveniSkupina[] = [
  {
    klic: 'obecne',
    nazev: 'Obecně',
    icon: 'info',
    polozky: [
      { nazev: 'Wi-Fi a internet' },
      { nazev: 'Nekuřácký objekt' },
      { nazev: 'Společenská místnost' },
      {
        nazev: 'Domácí mazlíček po domluvě',
        // TODO(client) — docs/01-content.md §9 item 12.
        overit: 'Napište nám předem, jaké zvíře a kolik jich bude.',
      },
      {
        nazev: 'Přízemí bez schodů',
        // TODO(client) — LAUNCH-BLOCKING, docs/01-content.md §9 item 2.
        overit:
          'V přízemí je ložnice, WC i sprchový kout. Bezbariérovost celého objektu zatím nepotvrzujeme — ozvěte se a domluvíme se konkrétně.',
      },
    ],
  },
  {
    klic: 'vnitrni',
    nazev: 'Uvnitř',
    icon: 'sofa',
    polozky: [
      { nazev: 'Krb a krbová kamna' },
      { nazev: 'Televize se satelitním příjmem' },
      { nazev: 'Plně vybavená kuchyně' },
      { nazev: 'Trouba a varná deska' },
      { nazev: 'Lednice' },
      { nazev: 'Myčka nádobí' },
      { nazev: 'Mikrovlnná trouba' },
      { nazev: 'Kávovar a rychlovarná konvice' },
      { nazev: 'Pračka a sušička' },
      { nazev: 'Sprchový kout' },
      { nazev: 'Vana' },
    ],
  },
  {
    klic: 'venkovni',
    nazev: 'Venku',
    icon: 'tent-tree',
    polozky: [
      { nazev: 'Krytá terasa s venkovním krbem' },
      { nazev: 'Horní otevřená terasa' },
      {
        nazev: 'Venkovní dřevem vytápěná sauna',
        // §5.9 REWRITE: `sauna nebo infrasauna` reads as not knowing which we own.
        overit: 'Za poplatek — 1 000 Kč/den nebo 3 000 Kč/týden, společně s vířivkou.',
      },
      { nazev: 'Vířivka pod širým nebem' },
      { nazev: 'Jezírko' },
      { nazev: 'Ohniště a gril' },
      { nazev: 'Zahradní nábytek' },
      { nazev: 'Houpačky a skluzavka' },
    ],
  },
  {
    klic: 'okoli',
    nazev: 'Pozemek a okolí',
    icon: 'trees',
    polozky: [
      { nazev: 'Parkování u objektu pro 4 auta' },
      { nazev: 'Vlastní příjezdová cesta' },
      { nazev: 'Zahrada a travnatá plocha' },
      { nazev: 'Potok podél pozemku' },
      { nazev: 'Les 10 metrů za chalupou' },
    ],
  },
  {
    klic: 'vytapeni',
    nazev: 'Vytápění',
    icon: 'thermometer-sun',
    polozky: [
      { nazev: 'Peletkový kotel' },
      { nazev: 'Krbová vložka na dřevo' },
      { nazev: 'Akumulační nádrž s elektrickými spirálami' },
      { nazev: 'Horkovzdušné rozvody do horních ložnic' },
    ],
  },
];

/* ---- The rooms ---------------------------------------------------------- */

export interface Loznice {
  nazev: string;
  patro: string;
  kapacita: string;
  /** Number of people, for the total. */
  osob: number;
  poznamka?: string;
}

/**
 * ⚠ THE CAPACITY CONFLICT, AND WHY THESE NUMBERS AND NOT THE OTHER ONES.
 *
 * The old `/ubytovani/` prose gives per-room ranges that total up to NINETEEN
 * against a stated house maximum of fifteen (docs/01-content.md §5.3, §9 item 1 —
 * launch-blocking). The site plan graphic gives 2 / 2+3 / 6+2 = 15, which agrees
 * with the brief and with every other page.
 *
 * Fifteen is authoritative until the client says otherwise. These are the site
 * plan's numbers. Do not "restore" the ranges from the old prose; they are the
 * source of the conflict, not a second opinion on it.
 *
 * Floor naming: `přízemí` / `patro` throughout. The old site used `1. NP`/`2. NP`
 * in one section and `prvním patře`/`druhém patře` in the next for the same two
 * floors (§5.4). One scheme, and this is it.
 */
export const LOZNICE: Loznice[] = [
  {
    nazev: 'Ložnice v přízemí',
    patro: 'Přízemí',
    kapacita: '2 osoby',
    osob: 2,
    poznamka: 'Sousedí přímo s krytou terasou.',
  },
  {
    nazev: 'Menší mezonetová ložnice',
    patro: 'Patro',
    kapacita: '2 + 3 osoby',
    osob: 5,
    poznamka: 'Má vlastní vstup na otevřenou terasu.',
  },
  {
    nazev: 'Větší mezonetová ložnice',
    patro: 'Patro',
    kapacita: '6 + 2 osoby',
    osob: 8,
  },
];

export const LUZEK_CELKEM = LOZNICE.reduce((n, l) => n + l.osob, 0);

/* ---- Bathrooms ---------------------------------------------------------- */

export interface Zarizeni {
  patro: string;
  polozky: string[];
}

/** §5.4, with `koupena` → `koupelna` fixed twice (error #8). */
export const SOCIALNI_ZARIZENI: Zarizeni[] = [
  {
    patro: 'Přízemí',
    polozky: ['Samostatné WC', 'Koupelna se sprchovým koutem, umyvadlem a žebříkovým topením'],
  },
  {
    patro: 'Patro',
    polozky: [
      'Samostatné WC',
      'Koupelna s prostornou vanou, umyvadlem a žebříkovým topením',
      'Prací a sušicí kout',
    ],
  },
];
