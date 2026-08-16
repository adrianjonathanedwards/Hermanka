/**
 * The photographs, in one place.
 *
 * ---------------------------------------------------------------------------
 * ⚠ THERE ARE NINE PHOTOGRAPHS OF THIS PROPERTY AND THAT IS THE WHOLE SUPPLY.
 *
 * Eight of the cottage plus one of Dolní Morava, which is not the cottage. Every
 * one of them is empty of people, and docs/01-content.md §10 asks for that to be
 * fixed at source: "The audience is a group of twelve; show a table with twelve
 * people at it."
 *
 * What that means for `/galerie`: the gallery is EIGHT TILES, not a grid padded
 * out to look full. docs/04-pages.md groups it as interiér · ložnice · terasa
 * a krb · wellness · okolí · zima — six groups the current asset set cannot
 * fill; there is no bedroom shot and no winter shot at all. So the groups here
 * are the ones the photographs actually support, and a group is added when a
 * photograph arrives to go in it. An empty category heading is worse than no
 * category heading.
 *
 * TODO(client) — docs/01-content.md §10: bedrooms, a winter exterior, an interior
 * with the fire lit, and photography with people in it.
 * ---------------------------------------------------------------------------
 *
 * `alt` is Czech and describes the PHOTOGRAPH — what is in the frame — not the
 * room's function. The lightbox reads it back out of the thumbnail, so it is
 * written once here and never twice (see Lightbox.astro).
 */
import type { ImageMetadata } from 'astro';

import obyvak from '@img/DSC_4579-scaled-1-1.jpg';
import jidelna from '@img/DSC_5123-scaled-1-1.jpg';
import virivka from '@img/DSC_4684-scaled-1.jpg';
import houpacky from '@img/DSC_5166-scaled-1-1.jpg';
import sauna from '@img/DSC_5204-scaled-1.jpg';
import terasa from '@img/zastrwsena-veranda-krb-14e3-.jpeg';
import exterier from '@img/header-bg-02.webp';
import okoli from '@img/situace1-1.webp';

export type GalerieSkupina = 'chalupa' | 'interier' | 'wellness' | 'zahrada';

export interface Fotka {
  src: ImageMetadata;
  alt: string;
  skupina: GalerieSkupina;
  /** Short label under the tile in the lightbox caption. */
  popisek: string;
}

export const SKUPINY: { klic: GalerieSkupina; nazev: string }[] = [
  { klic: 'chalupa', nazev: 'Chalupa zvenku' },
  { klic: 'interier', nazev: 'Interiér' },
  { klic: 'wellness', nazev: 'Sauna a vířivka' },
  { klic: 'zahrada', nazev: 'Zahrada a okolí' },
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
    src: houpacky,
    alt: 'Dřevěná houpačka se dvěma sedátky a zelenou skluzavkou na zatravněné zahradě',
    skupina: 'zahrada',
    popisek: 'Houpačky na zahradě',
  },
  {
    src: okoli,
    alt: 'Letecký snímek údolí Heřmanic u Králík s chalupou, potokem a okolními lesy',
    skupina: 'zahrada',
    popisek: 'Údolí pod Sněžníkem',
  },
];

/** The photographs of one group, in file order. */
export function fotkySkupiny(skupina: GalerieSkupina): Fotka[] {
  return FOTKY.filter((f) => f.skupina === skupina);
}
