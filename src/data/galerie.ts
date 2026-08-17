/**
 * The photographs, in one place.
 *
 * ---------------------------------------------------------------------------
 * ⚠ THERE ARE NINE PHOTOGRAPHS OF THIS PROPERTY AND THAT IS THE WHOLE SUPPLY.
 *
 * Eight of the cottage plus the aerial of the valley, and one of Dolní Morava,
 * which is not the cottage. Every one of them is empty of people, and
 * docs/01-content.md §10 asks for that to be fixed at source: "The audience is a
 * group of twelve; show a table with twelve people at it."
 *
 * What that means for `/galerie`: every tile in the gallery is either a real
 * photograph or an explicitly labelled PLACEHOLDER saying which photograph is
 * still missing. The placeholders are listed in `PLACEHOLDERY` below, they are
 * never links, and they never enter the lightbox sequence, so the counter in the
 * lightbox stays honest. When a photograph arrives, it replaces its placeholder
 * and the entry here is deleted.
 *
 * TODO(client) do docs/01-content.md §10: bedrooms, a kitchen, a winter exterior,
 * an interior with the fire lit, and photography with people in it. Each of those
 * is a labelled hole on the gallery page right now.
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
import sauna from '@img/DSC_5204-scaled-1.jpg';
import terasa from '@img/zastrwsena-veranda-krb-14e3-.jpeg';
import exterier from '@img/header-bg-02.webp';
import udoli from '@img/situace1-1.webp';
import dolniMorava from '@img/dolnimorava.webp';

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
  /** Short label under the tile in the lightbox caption. */
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
    src: exterier,
    alt: 'Chalupa Heřmanka zvenku: bílý dvoupodlažní objekt se strmou sedlovou střechou a krytou terasou, kolem dokola les',
    skupina: 'chalupa',
    popisek: 'Chalupa a zahrada',
  },
  {
    src: terasa,
    alt: 'Krytá terasa chalupy s venkovním zděným krbem, dřevěným stolem a proutěnými křesly, v pozadí les',
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
];

/**
 * The holes, named. One tile each, and each one is a photograph the client owes
 * the site. Order inside a group follows this array.
 */
export const PLACEHOLDERY: Placeholder[] = [
  {
    skupina: 'chalupa',
    popisek: 'Chalupa v zimě',
    poznamka: 'Zimní snímek připravujeme',
  },
  {
    skupina: 'interier',
    popisek: 'Ložnice',
    poznamka: 'Fotografie ložnic připravujeme',
  },
  {
    skupina: 'interier',
    popisek: 'Kuchyň',
    poznamka: 'Fotografii kuchyně připravujeme',
  },
  {
    skupina: 'wellness',
    popisek: 'Sauna v zimě',
    poznamka: 'Zimní snímek připravujeme',
  },
  {
    skupina: 'okoli',
    popisek: 'Králický Sněžník',
    poznamka: 'Fotografii z hřebene připravujeme',
  },
];

/** The photographs of one group, in file order. */
export function fotkySkupiny(skupina: GalerieSkupina): Fotka[] {
  return FOTKY.filter((f) => f.skupina === skupina);
}

/** The labelled holes of one group, in file order. */
export function placeholderySkupiny(skupina: GalerieSkupina): Placeholder[] {
  return PLACEHOLDERY.filter((p) => p.skupina === skupina);
}
