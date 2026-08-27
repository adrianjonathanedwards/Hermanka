/**
 * The photographs, in one place.
 *
 * ---------------------------------------------------------------------------
 * ⚠ UPDATE: A SECOND BATCH OF PHOTOGRAPHS ARRIVED. THE "NINE PHOTOGRAPHS"
 * ERA OF THIS FILE IS OVER.
 *
 * The original nine (eight of the cottage plus the aerial of the valley, and
 * one of Dolní Morava, which is not the cottage) are all still here. The
 * client supplied a second, much larger batch on top of them, and most of
 * docs/01-content.md §10's list is now answered from it: bedrooms, a kitchen's
 * absence aside, a winter exterior, and a sauna in winter all now have real
 * photographs, so their placeholders are deleted below (the rule two
 * paragraphs down is followed, not overridden). `Chalupa a sauna za soumraku`
 * even carries a person in it, walking to the cottage through snow, so
 * "photography with people in it" is no longer flatly zero, if still far from
 * "a table with twelve people at it."
 *
 * UPDATE 3: `kralicky-sneznik.png` fills the Sněžník hole   the client supplied
 * a URL to it and confirmed it is the right mountain (see the note on
 * `Vylet.foto` in src/data/okoli.ts, including the one open item it carries:
 * usage rights have not been separately confirmed, unlike every other
 * photograph on the site, which is the client's own). One hole remains and is
 * not invented: a kitchen, which nobody has photographed yet.
 *
 * The new batch also supplied a much larger `terasa` (the covered terrace with
 * its outdoor fireplace): 3096 x 2064 against the old file's 1000 x 667. That
 * was, in so many words, "the single most valuable new photograph this site
 * could be given" (src/data/hero.ts, src/components/pages/ubytovani/Vybaveni.astro).
 * It now replaces the old file everywhere on the site, not only here. `sauna`
 * gets the same treatment for the same reason: `DSC_5204.webp` is the same
 * shot as the old `DSC_5204-scaled-1.jpg` at 2064 x 3096 against 1280 x 1920,
 * so it replaces the scaled file rather than sitting beside it as a duplicate
 * tile.
 *
 * ⚠ CORRECTION: `83698096...webp` was captioned as Dolní Morava/Sky Bridge in
 * an earlier pass. The client has since confirmed it is the lookout tower ON
 * KLEPÁČ, a different place entirely (see src/data/okoli.ts). It has been
 * moved out of the Dolní Morava figures and captioned correctly below.
 *
 * UPDATE 2: every remaining photograph from the batch was used somewhere on
 * the site at one point. Nothing was left unused for being merely similar to
 * another shot   each one got its own honest caption for what was actually
 * different in its frame (an angle, a time of day, a detail). One has since
 * been removed anyway (see UPDATE 4): "not literally a duplicate" turned out
 * not to be the bar once the client looked at the gallery in a browser.
 *
 * UPDATE 4: two corrections after seeing the built page.
 *
 *   1. The opener   the big tile at the top of `chalupa` a bento always needs
 *      one   used to be `exterier` (`header-bg-02.webp`). That file carries a
 *      dark gradient baked into the pixels, put there deliberately for the
 *      white text laid over it in the hero and every page header (see
 *      src/data/hero.ts, src/data/pageHero.ts, where it stays). With no text
 *      on top of it here, the same gradient just reads as a grey, oddly lit
 *      photograph next to the gallery's other bright, naturally lit ones   an
 *      artifact of reuse, not a property of the room. `DSC_5228.webp`
 *      (`chalupaOdLesa`) is the same three-quarter angle of the house, shot
 *      undarkened, so it replaces `exterier` as the opener and the plain
 *      `header-bg-02.webp` is no longer imported by this file at all.
 *
 *   2. `chalupaCP28` (`IMG_20240113_163631.webp`) is gone. It was one of three
 *      near-identical winter dusk shots of the house and sauna together
 *      (`chalupaSoumrak`, `chalupaVecerSnih` are the other two); on the built
 *      page the tiles crowded rather than varied, and it was the weakest of
 *      the three. The file is still in img/ but no longer imported here.
 *
 * UPDATE 5: `skyBridge` (`sky-bridge-721.webp`) and `klasterHedec`
 * (`klaster-hedec.webp`) join the `okoli` group   real, correctly identified
 * shots of two of the third-party places in src/data/okoli.ts's `VYLETY`
 * (see the note on `Vylet.foto` there). A third file supplied alongside them,
 * `vojenske-muzeum-kraliky.webp`, was NOT used at the time: it showed an
 * industrial building with solar panels and grain silos, not the 1930s
 * fortification the filename claimed.
 *
 * UPDATE 6: the client re-supplied `vojenske-muzeum-kraliky.webp` under the
 * same filename, this time the right subject   a concrete fortification bunker
 * with two gun turrets and its wartime slogans still painted on. `vojenskeMuzeum`
 * now joins the `okoli` group alongside the other three. Same usage-rights
 * caveat as `kralicky-sneznik.png` applies to all four.
 *
 * What all this means for `/galerie`: every tile in the gallery is either a
 * real photograph or an explicitly labelled PLACEHOLDER saying which
 * photograph is still missing. The placeholders are listed in `PLACEHOLDERY`
 * below, they are never links, and they never enter the lightbox sequence, so
 * the counter in the lightbox stays honest. When a photograph arrives, it
 * replaces its placeholder and the entry here is deleted.
 * ---------------------------------------------------------------------------
 *
 * `alt` is Czech and describes the PHOTOGRAPH, what is in the frame, not the
 * room's function. The lightbox reads it back out of the thumbnail, so it is
 * written once here and never twice (see Lightbox.astro).
 *
 * No em dash appears in any string in this file. The site renders these.
 */
import type { ImageMetadata } from 'astro';
import type { IconName } from '../components/Icon.astro';

import obyvak from '@img/DSC_4579-scaled-1-1.jpg';
import jidelna from '@img/DSC_5123-scaled-1-1.jpg';
import virivka from '@img/DSC_4684-scaled-1.jpg';
import houpacky from '@img/DSC_5166-scaled-1-1.jpg';
import sauna from '@img/DSC_5204.webp';
import terasa from '@img/DSC_5192.webp';
import udoli from '@img/situace1-1.webp';
import dolniMorava from '@img/dolnimorava.webp';

/* ---- Second batch ------------------------------------------------------- */
import chalupaVZime from '@img/130166198_400963927690742_6965117673572395367_n.webp';
import chalupaSoumrak from '@img/IMG_20240113_163624.webp';
import jezirko from '@img/DSC00852-1.webp';
import posezeniZahrada from '@img/DSC_5189.webp';
import chalupaZeZahrady from '@img/DSC_5173.webp';
import verandaVchod from '@img/7H6A0113.jpg';
import chalupaStit from '@img/DSC_4678.webp';
import kvetinyZahrada from '@img/DSC_5106.webp';
import chalupaOdLesa from '@img/DSC_5228.webp';
import chalupaMeziStromy from '@img/DSC_5233.webp';
import chalupaVecerSnih from '@img/IMG_20240113_163558.webp';
import chalupaZimniRano from '@img/IMG_20240114_095211.webp';

import obyvakZelenaSedacka from '@img/DSC_4556.webp';
import loznice from '@img/DSC_4552.webp';
import loznicePatro from '@img/DSC_4554.webp';
import loznicePodkrovi from '@img/DSC_4614.webp';
import loznicePodkroviStit from '@img/DSC_4638.webp';
import podkrovniPokoj from '@img/DSC_4656.webp';
import koupelna from '@img/DSC_4621.webp';
import loznicePodkroviDvere from '@img/DSC_4600.webp';
import sedaciKoutPodkrovi from '@img/DSC_4612.webp';

import saunaZvenku from '@img/DSC_5151.webp';
import virivkaShora from '@img/DSC_4677.webp';
import saunaVZime from '@img/IMG_20240107_160007.webp';
import saunaZevnitr from '@img/IMG_20240107_161001.webp';
import saunaKamna from '@img/IMG_20240107_161130.webp';
import saunaSoumrak from '@img/IMG_20240107_160927.webp';

import klepacRozhledna from '@img/83698096_2495795774008675_6681197929793507424_n.webp';
import kralickySneznik from '@img/kralicky-sneznik.png';
import skyBridge from '@img/sky-bridge-721.webp';
import klasterHedec from '@img/klaster-hedec.webp';
import vojenskeMuzeum from '@img/vojenske-muzeum-kraliky.webp';

export type GalerieSkupina = 'chalupa' | 'interier' | 'wellness' | 'okoli';

/**
 * How a group lays its tiles out.
 *
 * `bento`  a four tile mosaic with one large opener. Used once, at the top of
 *          the page, because a page that opens on a horizontal strip gives the
 *          reader nothing to look at until they interact with it.
 * `pas`    a horizontally scrollable filmstrip with prev/next controls. Every
 *          photograph keeps its own aspect ratio and nothing is cropped.
 */
export type GalerieRozvrzeni = 'bento' | 'pas';

export interface Fotka {
  src: ImageMetadata;
  alt: string;
  skupina: GalerieSkupina;
  /**
   * A short internal label for the photograph, distinct from `alt`. Not
   * rendered anywhere on the page: the lightbox shows no caption text at all
   * (only `alt`, on the `<img>` itself, and the position counter), by
   * decision   the description lives once, for assistive tech, not twice.
   */
  popisek: string;
}

/**
 * A tile for a photograph that does not exist yet.
 *
 * It says what is missing rather than padding the grid with a repeat or a blur.
 * `popisek` is the subject, `poznamka` is the one line under it.
 */
export interface Placeholder {
  skupina: GalerieSkupina;
  popisek: string;
  poznamka: string;
}

/**
 * A big, faint background mark behind a group's heading. Purely decorative
 * texture, not the hand-drawn brand illustration language (docs/02-design-system.md
 * §4   that system is reserved for spruce/fir/owl subjects and is banned outright
 * as floating decoration on a light band). This is the opposite kind of mark: one
 * of the plain functional line icons from Icon.astro, blown up far past its normal
 * size, held to single-digit opacity, and let bleed off the section's own edge so
 * it reads as texture behind the copy rather than as a second icon competing with
 * the photographs.
 *
 * `strana` decides which edge it bleeds off   alternating left/right down the page
 * so four in a row do not all lean the same way.
 */
export interface Vodoznak {
  /**
   * `'strecha'` is a special case handled in galerie.astro: it renders the brand
   * roof mark (RoofMark.astro, the same shape as the header logo and the section
   * dividers) instead of an Icon.astro glyph. There is no "cottage" or "garden" line
   * icon in the functional set, and the roof mark is the one shape on the whole site
   * that already means "this cottage"   a closer fit than borrowing an unrelated
   * glyph.
   */
  ikona: IconName | 'strecha';
  /** Degrees. A few degrees off true is what keeps it from reading as a stamped logo. */
  rotace: number;
  strana: 'leva' | 'prava';
}

export interface Skupina {
  klic: GalerieSkupina;
  nazev: string;
  /**
   * One line under the heading. It is also the group's search copy: the page has
   * no intro paragraph any more, so this is where the words a guest actually
   * types (sauna, vířivka, ložnice, Dolní Morava) live in body text.
   */
  popis: string;
  rozvrzeni: GalerieRozvrzeni;
  vodoznak: Vodoznak;
  /**
   * Explicit background. Most groups alternate `omitka`/`kamen` (see
   * `skupinaBand` in galerie.astro); `okoli` is pinned to `zadne` so the group
   * closing the page sits directly on the page ground with nothing framing it,
   * which is what lets the mountain watermark and the aerial photograph read as
   * one continuous view rather than a photograph inside a grey card. Because that
   * makes it read the same as the CtaBand's own `omitka`, the CtaBand switches to
   * `kamen` to keep the two apart   see the note beside it in galerie.astro.
   */
  pozadi?: 'zadne';
}

export const SKUPINY: Skupina[] = [
  {
    klic: 'chalupa',
    nazev: 'Chalupa a zahrada',
    popis:
      'Celá chalupa jen pro vás: bílý dvoupodlažní objekt v Heřmanicích u Králík, krytá terasa s venkovním krbem a zatravněná zahrada s houpačkami. Les začíná deset metrů za plotem.',
    rozvrzeni: 'bento',
    vodoznak: { ikona: 'strecha', rotace: -6, strana: 'prava' },
  },
  {
    klic: 'interier',
    nazev: 'Interiér',
    popis:
      'Obývák s krbem a dlouhý jídelní stůl pod dřevěným trámovým stropem. Tři ložnice s kapacitou 2 až 15 osob.',
    rozvrzeni: 'pas',
    /* The obývák photo is captioned "s krbem"   the fireplace is the one fixed
       piece of furniture in this group's own copy, not a borrowed subject. */
    vodoznak: { ikona: 'krb', rotace: 5, strana: 'leva' },
  },
  {
    klic: 'wellness',
    nazev: 'Sauna a vířivka',
    popis:
      'Venkovní finská sauna a dřevěná vířivka s vyhřívanými schody, obojí pár kroků od terasy a se vzrostlým lesem kolem dokola.',
    rozvrzeni: 'pas',
    vodoznak: { ikona: 'virivka', rotace: -6, strana: 'prava' },
  },
  {
    klic: 'okoli',
    nazev: 'Okolí a Dolní Morava',
    popis:
      'Údolí pod Králickým Sněžníkem. Lyžařské středisko Dolní Morava se Stezkou v oblacích a bobovou dráhou je 12 minut autem.',
    rozvrzeni: 'pas',
    vodoznak: { ikona: 'hora', rotace: 4, strana: 'leva' },
    pozadi: 'zadne',
  },
];

export const FOTKY: Fotka[] = [
  {
    src: chalupaOdLesa,
    alt: 'Chalupa Heřmanka zvenku: bílý dvoupodlažní objekt se strmou sedlovou střechou, kolem dokola les, v popředí piknikový stůl',
    skupina: 'chalupa',
    popisek: 'Chalupa a zahrada',
  },
  {
    src: terasa,
    alt: 'Krytá terasa chalupy s venkovním zděným krbem, skleněným stolem a proutěnými křesly, v pozadí les',
    skupina: 'chalupa',
    popisek: 'Krytá terasa s krbem',
  },
  {
    src: houpacky,
    alt: 'Dřevěná houpačka se dvěma sedátky a zelenou skluzavkou na zatravněné zahradě',
    skupina: 'chalupa',
    popisek: 'Houpačky na zahradě',
  },
  {
    src: chalupaVZime,
    alt: 'Chalupa Heřmanka v zimě, pohled přes zasněženou jehličnanovou větev na bílý dům se zasněženou střechou a komínem',
    skupina: 'chalupa',
    popisek: 'Chalupa v zimě',
  },
  {
    src: jezirko,
    alt: 'Chalupa Heřmanka v létě, v popředí přírodní koupací jezírko s kamenným obložením a odrazem domu na hladině',
    skupina: 'chalupa',
    popisek: 'Jezírko u chalupy',
  },
  {
    src: chalupaZeZahrady,
    alt: 'Chalupa Heřmanka ze zahrady, vidět je horní nekrytá terasa s balkonem a štěrková cesta k domu',
    skupina: 'chalupa',
    popisek: 'Chalupa a horní terasa',
  },
  {
    src: posezeniZahrada,
    alt: 'Dřevěný piknikový stůl s lavicemi na zatravněné zahradě, kolem vzrostlé stromy a kamenná cesta',
    skupina: 'chalupa',
    popisek: 'Posezení na zahradě',
  },
  {
    src: chalupaSoumrak,
    alt: 'Chalupa Heřmanka a venkovní sauna za zimního večera, sníh na střeše i na zamrzlém jezírku, v popředí osoba jde ke chalupě',
    skupina: 'chalupa',
    popisek: 'Chalupa a sauna za soumraku',
  },
  {
    src: verandaVchod,
    alt: 'Prosklená krytá veranda vedoucí ke vchodu chalupy, v pozadí bílé patro s balkonem',
    skupina: 'chalupa',
    popisek: 'Krytá veranda u vchodu',
  },
  {
    src: chalupaStit,
    alt: 'Chalupa Heřmanka, pohled na štítovou stranu s bílou fasádou a lesem v pozadí',
    skupina: 'chalupa',
    popisek: 'Chalupa, štítová strana',
  },
  {
    src: kvetinyZahrada,
    alt: 'Fialové květiny na zahradě, v pozadí rozostřená bílá chalupa',
    skupina: 'chalupa',
    popisek: 'Květiny na zahradě',
  },
  {
    src: chalupaMeziStromy,
    alt: 'Chalupa Heřmanka mezi stromy, v popředí piknikový stůl na zahradě',
    skupina: 'chalupa',
    popisek: 'Chalupa mezi stromy',
  },
  {
    src: chalupaVecerSnih,
    alt: 'Chalupa Heřmanka a venkovní sauna za zimního večera se zasněženými střechami a zamrzlým jezírkem',
    skupina: 'chalupa',
    popisek: 'Chalupa a sauna, zimní večer',
  },
  {
    src: chalupaZimniRano,
    alt: 'Chalupa Heřmanka a venkovní sauna zasněženým zimním ránem',
    skupina: 'chalupa',
    popisek: 'Chalupa v zimě, ráno',
  },
  {
    src: obyvak,
    alt: 'Obývací pokoj s krbem a dlouhým jídelním stolem pod dřevěným trámovým stropem',
    skupina: 'interier',
    popisek: 'Obývák s krbem',
  },
  {
    src: jidelna,
    alt: 'Jídelní stůl se sušenou kyticí, v pozadí zelená kožená sedačka a okna do zahrady',
    skupina: 'interier',
    popisek: 'Jídelní stůl',
  },
  {
    src: obyvakZelenaSedacka,
    alt: 'Obývací pokoj s velkou rohovou koženou sedačkou v zelené barvě, dřevěným trámovým stropem a okny do zahrady',
    skupina: 'interier',
    popisek: 'Obývací pokoj',
  },
  {
    src: loznice,
    alt: 'Ložnice se dvěma spojenými postelemi a dřevěnou skříní, obložena světlým dřevem',
    skupina: 'interier',
    popisek: 'Ložnice',
  },
  {
    src: loznicePatro,
    alt: 'Ložnice se dvěma spojenými postelemi a velkou dřevěnou skříní se zásuvkami',
    skupina: 'interier',
    popisek: 'Ložnice v patře',
  },
  {
    src: loznicePodkrovi,
    alt: 'Podkrovní ložnice s trámovým stropem, žebříkem k patrové posteli, televizí a dveřmi na terasu',
    skupina: 'interier',
    popisek: 'Mezonetová ložnice',
  },
  {
    src: loznicePodkroviStit,
    alt: 'Podkrovní ložnice s postelí pod šikmým trámovým stropem ve tvaru štítu a oknem s výhledem do lesa',
    skupina: 'interier',
    popisek: 'Ložnice ve štítu',
  },
  {
    src: podkrovniPokoj,
    alt: 'Podkrovní pokoj s manželskou postelí, kulatým jídelním stolem se židlemi a žebříkem do dalšího patra',
    skupina: 'interier',
    popisek: 'Podkrovní pokoj',
  },
  {
    src: koupelna,
    alt: 'Koupelna v podkroví s prostornou vanou, umyvadlem a dřevěnou stoličkou',
    skupina: 'interier',
    popisek: 'Koupelna s vanou',
  },
  {
    src: loznicePodkroviDvere,
    alt: 'Podkrovní ložnice od dveří, s patrovou postelí po žebříku a televizí',
    skupina: 'interier',
    popisek: 'Podkrovní ložnice od dveří',
  },
  {
    src: sedaciKoutPodkrovi,
    alt: 'Sedací kout v podkroví s křesílky, komodou a žebříkem k patrové posteli',
    skupina: 'interier',
    popisek: 'Sedací kout v podkroví',
  },
  {
    src: sauna,
    alt: 'Otevřené dveře do venkovní finské sauny s dřevěnými lavicemi',
    skupina: 'wellness',
    popisek: 'Venkovní sauna',
  },
  {
    src: virivka,
    alt: 'Dřevěná vířivka s vyhřívanými schody na terase, kolem dokola vzrostlý les',
    skupina: 'wellness',
    popisek: 'Vířivka v lese',
  },
  {
    src: saunaZvenku,
    alt: 'Venkovní finská sauna jako samostatný dřevěný domek u lesního jezírka, obklopený vzrostlými stromy',
    skupina: 'wellness',
    popisek: 'Sauna u jezírka',
  },
  {
    src: virivkaShora,
    alt: 'Dřevěná vířivka s bublinkovou lázní, pohled shora přes větve stromů',
    skupina: 'wellness',
    popisek: 'Vířivka shora',
  },
  {
    src: saunaVZime,
    alt: 'Venkovní sauna a zakrytá vířivka v zimě u zamrzlého jezírka, za soumraku',
    skupina: 'wellness',
    popisek: 'Sauna v zimě',
  },
  {
    src: saunaZevnitr,
    alt: 'Interiér venkovní sauny s dřevěnými lavicemi a rozsvíceným svítidlem',
    skupina: 'wellness',
    popisek: 'Uvnitř sauny',
  },
  {
    src: saunaKamna,
    alt: 'Kamna Harvia uvnitř sauny, na okenním parapetu svíčky, za oknem zasněžená zahrada',
    skupina: 'wellness',
    popisek: 'Kamna v sauně',
  },
  {
    src: saunaSoumrak,
    alt: 'Venkovní sauna za zimního soumraku, okno sauny svítí teplým světlem, vedle zakrytá vířivka',
    skupina: 'wellness',
    popisek: 'Sauna za soumraku',
  },
  {
    src: udoli,
    alt: 'Letecký snímek údolí Heřmanic u Králík s vyznačenou polohou chalupy a vzdálenostmi na Klepáč, Králický Sněžník a Dolní Moravu',
    skupina: 'okoli',
    popisek: 'Údolí pod Sněžníkem',
  },
  {
    src: dolniMorava,
    alt: 'Zimní letecký pohled na sjezdovky lyžařského střediska Dolní Morava se Stezkou v oblacích a bobovou dráhou',
    skupina: 'okoli',
    popisek: 'Dolní Morava v zimě',
  },
  {
    src: klepacRozhledna,
    alt: 'Rozhledna na vrcholu Klepáče při východu slunce nad mraky',
    skupina: 'okoli',
    popisek: 'Rozhledna na Klepáči',
  },
  {
    src: kralickySneznik,
    alt: 'Králický Sněžník s rozhlednou na vrcholu, v popředí zalesněné kopce',
    skupina: 'okoli',
    popisek: 'Králický Sněžník',
  },
  {
    src: skyBridge,
    alt: 'Visutý most Sky Bridge 721 nad zalesněným údolím, pod ním moře mraků',
    skupina: 'okoli',
    popisek: 'Sky Bridge 721',
  },
  {
    src: klasterHedec,
    alt: 'Letecký pohled na barokní klášter Hedeč s kostelem a zahradami uprostřed polí',
    skupina: 'okoli',
    popisek: 'Klášter Hedeč',
  },
  {
    src: vojenskeMuzeum,
    alt: 'Betonový pevnostní srub s dělovými věžemi a dobovými nápisy Byli jsme a budem, vytrváme',
    skupina: 'okoli',
    popisek: 'Vojenské muzeum Králíky',
  },
];

/**
 * The holes, named. One tile each, and each one is a photograph the client owes
 * the site. Order inside a group follows this array.
 */
export const PLACEHOLDERY: Placeholder[] = [];

/** The photographs of one group, in file order. */
export function fotkySkupiny(skupina: GalerieSkupina): Fotka[] {
  return FOTKY.filter((f) => f.skupina === skupina);
}

/** The labelled holes of one group, in file order. */
export function placeholderySkupiny(skupina: GalerieSkupina): Placeholder[] {
  return PLACEHOLDERY.filter((p) => p.skupina === skupina);
}
