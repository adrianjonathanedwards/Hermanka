/**
 * The surroundings, as data   for `/okoli` and for the distance list in the
 * `Okolí` section of the homepage.
 *
 * ---------------------------------------------------------------------------
 * THE RULE THIS FILE EXISTS TO ENFORCE
 *
 * docs/04-pages.md, `/okoli`: "Every entry needs a distance and a travel time.
 * A list of eleven place names with neither, which is what exists today, is not
 * information."
 *
 * So `vzdalenost` is `string | null` and null is not a formatting problem to be
 * papered over   it is the honest state of an entry the client has never given a
 * distance for. A page renders a null entry WITHOUT a chip, in a clearly
 * secondary group. It must never invent a figure. Half of the old
 * `Koupání v okolí` list is eleven place names across three okresy with no
 * numbers attached to any of them; guessing at them would be fabricating facts
 * about third parties.
 *
 * TODO(client)   docs/01-content.md §9 items 18, 20 and 21: distances for the
 * swimming and skiing lists, whether the bike hire / riding school / tennis
 * courts / golf course still exist, and 14 km vs 17 km to the Sněžník summit.
 * ---------------------------------------------------------------------------
 */
import type { ImageMetadata } from 'astro';
import type { LucideName } from '../components/IconLucide.astro';
import dolniMoravaFoto from '@img/dolnimorava.webp';

const NBSP = ' ';

/* ---- V okolí naleznete   the distance table ------------------------------ */

export interface Dostupnost {
  icon: LucideName;
  co: string;
  kde: string;
}

/**
 * docs/01-content.md §5.2, KEEP in full: "This is quietly the most useful content
 * on the site."
 *
 * `Les   10 metrů, hned za chalupou` is, per the same audit, "the best line on
 * the entire website". It is first in this list on purpose. Give it room.
 *
 * ⚠ Králíky is 3 km here and 7 km on the illustrated regional map. The conflict
 * is unresolved (docs/01-content.md §9), and the distance table is the source
 * that is internally consistent, so it wins. If a page shows both this list and
 * that map, it must not draw attention to the pair.
 */
export const DOSTUPNOST: Dostupnost[] = [
  { icon: 'trees', co: 'Les', kde: `10${NBSP}metrů, hned za chalupou` },
  { icon: 'bus', co: 'Autobus', kde: `Heřmanice (500${NBSP}m)` },
  { icon: 'utensils', co: 'Restaurace', kde: `Penzion Heřmanice (500${NBSP}m), Králíky (3${NBSP}km)` },
  { icon: 'train-front', co: 'Vlak', kde: `Prostřední Lipka (2${NBSP}km)` },
  { icon: 'store', co: 'Obchod', kde: `Prostřední Lipka (2${NBSP}km), Králíky (3${NBSP}km)` },
  { icon: 'cable-car', co: 'Lyžařský vlek', kde: `Ski areál Dolní Morava, vzdušnou čarou 3${NBSP}km` },
  { icon: 'waves', co: 'Koupání', kde: `Bazén Králíky 3${NBSP}km, přehrada Pastviny 17${NBSP}km` },
  { icon: 'shopping-cart', co: 'Nákupní centrum', kde: `Penny market Králíky (3${NBSP}km)` },
  { icon: 'mail', co: 'Pošta', kde: `Králíky, 3${NBSP}km` },
  { icon: 'banknote', co: 'Bankomat', kde: `Králíky, 3${NBSP}km` },
];

/* ---- Trips and attractions ---------------------------------------------- */

export type Sezonnost = 'zima' | 'leto' | 'celoročně';

/**
 * How you get there, and it is NOT a presentation detail.
 *
 * `/okoli` groups the trips by this rather than showing six of them in one grid,
 * because "the marked trail starts at the front door" and "twelve minutes in the
 * car" are two different offers to two different readers, and the first one is
 * the thing this cottage actually has that its competitors do not
 * (docs/01-content.md §5.2 calls the walking distances "quietly the most useful
 * content on the site").
 *
 * It is derived from nothing   do not compute it from `icon` or by looking for
 * `pěšky` in `cas`. Vojenské muzeum Králíky has no `cas` at all and is still
 * plainly a drive.
 */
export type Doprava = 'pesky' | 'autem';

export interface Vylet {
  nazev: string;
  popis: string;
  /** Null where no verified figure exists. Never guess one. */
  vzdalenost: string | null;
  /** Driving or walking time. Null on the same terms. */
  cas: string | null;
  sezona: Sezonnost;
  doprava: Doprava;
  /**
   * Always present   every entry gets a visual, real or not. `icon` is what
   * renders when `foto` is absent, so it is never optional itself.
   */
  icon: LucideName;
  /**
   * A real photograph, where one exists. `dolnimorava.webp` is the only usable
   * photograph of any place in this file   it is a shot OF the resort, so it is
   * true for the two entries that are literally that resort and not for anything
   * else. Nine photographs exist for this whole property (src/data/galerie.ts);
   * none of the others show a third-party place, and inventing a crop that LOOKS
   * like Klepáč or Klášter Hedeč would be showing the reader a lie. Absent
   * everywhere else on purpose   the component falls back to `icon`, not to a
   * stock photo of a mountain that is not this one.
   */
  foto?: ImageMetadata;
}

/**
 * §7.1, rewritten from one long run-on paragraph into entries with a distance
 * and a season each. `Sky Bridge 721` is the attraction's real name   the old
 * site spells it three different ways across three pages (§7.4). One spelling.
 *
 * `bobová dráha`, not `bobový` (error #9). `Červená Voda`, both words capitalised
 *   it is a place name (§7.1).
 */
export const VYLETY: Vylet[] = [
  {
    nazev: 'Ski areál Dolní Morava',
    popis:
      'Sjezdovky, v zimě na lyže a snowboard, v létě na sjezdy kol. Bobová dráha pro boby na kolečkách a zábavní areály pro děti: Mamutíkův vodní park, Lesní zážitkový park a Pískový svět.',
    vzdalenost: `9${NBSP}km`,
    cas: `12${NBSP}min autem`,
    sezona: 'celoročně',
    doprava: 'autem',
    icon: 'cable-car',
    foto: dolniMoravaFoto,
  },
  {
    nazev: 'Stezka v oblacích a Sky Bridge 721',
    popis:
      'Dvě dominanty Dolní Moravy: vyhlídková stezka nad korunami stromů a nejdelší visutý most pro pěší na světě.',
    vzdalenost: `9${NBSP}km`,
    cas: `12${NBSP}min autem`,
    sezona: 'celoročně',
    doprava: 'autem',
    icon: 'mountain-snow',
    foto: dolniMoravaFoto,
  },
  {
    nazev: 'Králický Sněžník',
    popis:
      'Turistická značka se dá chytit přímo u chalupy a dovede vás až na vrchol, pod kterým vyvěrá pramen řeky Moravy.',
    // TODO(client)   docs/01-content.md §9 item 18: the old copy says 14 km, the
    // regional map says 17 km / 4 h 15 min. Naming either next to a map that
    // contradicts it is worse than naming neither.
    vzdalenost: null,
    cas: null,
    sezona: 'leto',
    doprava: 'pesky',
    icon: 'footprints',
  },
  {
    nazev: 'Klášter Hedeč',
    popis:
      'Mariánské poutní místo nad Králíky s monumentálním barokním klášterem a kostelem Nanebevzetí Panny Marie.',
    vzdalenost: `11${NBSP}km`,
    cas: `17${NBSP}min autem`,
    sezona: 'celoročně',
    doprava: 'autem',
    icon: 'landmark',
  },
  {
    nazev: 'Vojenské muzeum Králíky',
    popis:
      'Opevnění z třicátých let a expozice československé armády, kousek za městem.',
    vzdalenost: `3${NBSP}km`,
    cas: null,
    sezona: 'celoročně',
    doprava: 'autem',
    icon: 'landmark',
  },
  {
    nazev: 'Klepáč',
    popis:
      'Vrchol Klepý, 1 145 m n. m., je rozvodím do trojice evropských moří. Značka vede z údolí pod chalupou.',
    vzdalenost: `8${NBSP}km`,
    cas: `2${NBSP}h 15${NBSP}min pěšky`,
    sezona: 'leto',
    doprava: 'pesky',
    icon: 'footprints',
  },
];

/* ---- Skiing -------------------------------------------------------------- */

export interface Stredisko {
  nazev: string;
  vzdalenost: string | null;
  cas: string | null;
  /** A real photograph, where one exists   see the note on `Vylet.foto`. */
  foto?: ImageMetadata;
}

/**
 * §7.3. Only the first has a verified figure   it is the one in the distance
 * table (§5.2). The rest are the old comma-separated run with no numbers, and
 * they keep no numbers until the client supplies them.
 *
 * TODO(client)   docs/01-content.md §9 item 21.
 */
export const LYZOVANI: Stredisko[] = [
  {
    nazev: 'Dolní Morava – Sněžník a Větrný vrch',
    vzdalenost: `9${NBSP}km`,
    cas: `12${NBSP}min`,
    foto: dolniMoravaFoto,
  },
  { nazev: 'Červená Voda – Buková hora', vzdalenost: null, cas: null },
  { nazev: 'Čenkovice', vzdalenost: null, cas: null },
  { nazev: 'Hynčice – Kraličák', vzdalenost: null, cas: null },
  { nazev: 'Malá Morava – Vysoká', vzdalenost: null, cas: null },
  { nazev: 'Mladkov – Petrovičky', vzdalenost: null, cas: null },
  { nazev: 'Šanov', vzdalenost: null, cas: null },
];

/* ---- Swimming ------------------------------------------------------------ */

export interface Koupani {
  nazev: string;
  vzdalenost: string | null;
}

/**
 * §7.2 asks for this eleven-name run to be sorted by distance "or cut to the
 * nearest four". Neither is possible without distances, so it is SPLIT: the two
 * that appear in the verified distance table, and then the rest as a plain list
 * of names with no numbers pretended.
 *
 * TODO(client)   docs/01-content.md §9 item 21. When the distances arrive, merge
 * the two arrays, sort, and cut at four.
 */
export const KOUPANI_BLIZKO: Koupani[] = [
  { nazev: 'Bazén Králíky', vzdalenost: `3${NBSP}km` },
  { nazev: 'Přehrada Pastviny', vzdalenost: `17${NBSP}km` },
];

export const KOUPANI_DALSI: string[] = [
  'Koupaliště Králíky',
  'Bazén Mezilesí',
  'Rybník Úžas, Hynčice pod Sušinou',
  'Koupaliště Jablonné nad Orlicí',
  'Koupaliště Kunvald',
  'Acrobat Park Štíty',
  'Koupaliště Ruda nad Moravou',
  'Aquapark Žamberk',
  'Koupaliště Rokytnice v Orlických horách',
  'Koupaliště Letohrad',
];

/* ---- Eating -------------------------------------------------------------- */

export interface Stravovani {
  nazev: string;
  popis: string;
  vzdalenost: string | null;
  icon: LucideName;
}

/**
 * §5.7. Three third-party businesses in three sentences, on a page last touched
 * in 2019   TODO(client), docs/01-content.md §9 item 19: is the farm still
 * selling, is the penzion still cooking, is Kačenka still open?
 *
 * They are kept because a guest cooking for twelve genuinely wants to know, and
 * the copy avoids the present tense where it can't be verified.
 */
export const STRAVOVANI: Stravovani[] = [
  {
    nazev: 'Farma v obci',
    popis: 'Čerstvé mléko a sýry, denní prodej.',
    vzdalenost: `5${NBSP}min pěšky`,
    icon: 'store',
  },
  {
    nazev: 'Penzion Heřmanice',
    popis: 'Nejbližší kuchyně, hned v obci.',
    vzdalenost: `500${NBSP}m`,
    icon: 'utensils',
  },
  {
    nazev: 'Restaurace Kačenka',
    popis: 'U Kláštera Hedeč, domácí kuchyně. Doporučujeme.',
    vzdalenost: `11${NBSP}km`,
    icon: 'utensils',
  },
];
