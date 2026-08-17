/**
 * The hero slides, in one place.
 *
 * ---------------------------------------------------------------------------
 * ⚠ THIS IS A CAROUSEL, AND THE PROJECT DOCUMENTATION SAYS NOT TO BUILD ONE.
 *
 * docs/01-content.md §4.1 is explicit   "DROP the carousel itself", on the
 * grounds that five auto-rotating slides on the highest-value screen on the site
 * are five chances to show a guest the one thing they did not want, and cost a
 * hero-sized image download per slide. docs/02-design-system.md §5.3 lists
 * carousels among the banned patterns. Both were overruled by the client.
 *
 * The two real costs are mitigated rather than ignored, and the mitigations are
 * the part to be careful with:
 *
 *  1. **Only slide one is on the critical path.** It alone is preloaded from
 *     <head>, eager and `fetchpriority="high"`; it is the LCP element and the
 *     performance budget in docs/03-tech.md §5 is measured against it. The other
 *     four are lazy and `fetchpriority="low"`, so the browser fetches them behind
 *     everything that matters. Do not "fix" that by making them eager.
 *  2. **It does not rotate under `prefers-reduced-motion`**, and pointer or
 *     keyboard focus anywhere in the hero holds it.
 *
 *     ⚠ It no longer carries a pause control. That was the WCAG 2.2.2 mechanism
 *       the success criterion asks for a way to stop anything moving on its own
 *     for more than five seconds and does not accept hover/focus as one   and it
 *     was removed by request in favour of plain autoplay. Recorded here rather
 *     than quietly dropped, same as the carousel itself. The markup and the
 *     `setPaused` half of src/scripts/motion.ts are both in git.
 *
 * ---------------------------------------------------------------------------
 * `SLIDE_IMAGE_PROPS` is spread into BOTH the <Image> in Hero.astro and the
 * getImage() call that feeds the <link rel="preload"> in index.astro. They must
 * describe *exactly* the same transform   any divergence produces a different
 * file hash, and the browser then preloads one file and renders another,
 * downloading the hero twice. That is the worst possible outcome for the one
 * image we are trying to make fast, so the options live here and are never
 * retyped.
 *
 * `layout: 'none'` opts out of Astro's responsive sizing machinery: these are
 * `object-fit: cover` backdrops sized entirely by CSS, and the extra `fit` and
 * `position` parameters the constrained layout adds would only be one more thing
 * to keep in sync.
 */
import type { ImageMetadata } from 'astro';

import exterier from '@img/header-bg-02.webp';
import terasa from '@img/zastrwsena-veranda-krb-14e3-.jpeg';
import obyvak from '@img/DSC_4579-scaled-1-1.jpg';
import virivka from '@img/DSC_4684-scaled-1.jpg';
import zahrada from '@img/DSC_5166-scaled-1-1.jpg';

export const HERO_SIZES = '100vw';

/**
 * Shared transform. Quality is held against the 150 kB per-image hero budget
 * (docs/03-tech.md §5)   measure the largest variant after any change here, not
 * just the visual result.
 */
export const SLIDE_IMAGE_PROPS = {
  widths: [640, 960, 1280, 1600, 1920],
  sizes: HERO_SIZES,
  format: 'webp' as const,
  quality: 72,
  layout: 'none' as const,
};

export interface HeroSlide {
  src: ImageMetadata;
  /** Czech alt text. Every one of these describes the photograph, not the room. */
  alt: string;
  /** Shown beside the slide controls. Short   it is a label, not a sentence. */
  caption: string;
  /**
   * `object-position`. Each photograph has a different subject in a different
   * part of the frame, and a portrait viewport keeps about a quarter of the
   * width   so the crop is a per-slide decision, not a global one.
   */
  position: string;
}

/**
 * Five landscape photographs. The other four the client supplied are portrait
 * (`DSC_5123`, `DSC_5204`) or are not of the property (`dolnimorava`), and a
 * portrait frame cropped to a full-bleed 16:9 hero loses its subject.
 *
 * Order is an argument, made once: the exterior first because the headline
 * promises a cottage in a valley and slide one has to be the cottage in the
 * valley; then the terrace and the living room, which are what a group of twelve
 * is actually buying; then the hot tub and the garden, which are what the
 * children are.
 *
 * TODO(client): `zastrwsena-veranda` is only 1000 �  667, so slide two is soft on
 * a large screen   Astro will not upscale, and it should not. A replacement
 * shot of the covered terrace at 1920 wide is the single most valuable new
 * photograph this site could be given. docs/01-content.md §10.
 */
export const HERO_SLIDES: HeroSlide[] = [
  {
    src: exterier,
    alt: 'Chalupa Heřmanka zvenku: bílý dvoupodlažní objekt se strmou sedlovou střechou, krytou terasou s venkovním krbem a zatravněnou zahradou, kolem dokola les',
    caption: 'Chalupa a zahrada',
    position: '55% center',
  },
  {
    src: terasa,
    alt: 'Krytá terasa s venkovním zděným krbem a posezením pro celou skupinu, za zábradlím les',
    caption: 'Krytá terasa s krbem',
    position: 'center 60%',
  },
  {
    src: obyvak,
    alt: 'Obývací pokoj s krbem a dlouhým jídelním stolem pod dřevěným trámovým stropem',
    caption: 'Obývák a jídelna',
    position: '58% center',
  },
  {
    src: virivka,
    alt: 'Dřevěná vířivka na terase obklopená lesem',
    caption: 'Vířivka v lese',
    position: 'center 55%',
  },
  {
    src: zahrada,
    alt: 'Dřevěná houpačka se dvěma sedátky a zelenou skluzavkou na zatravněné zahradě',
    caption: 'Houpačky a zahrada',
    position: 'center 60%',
  },
];

/** The LCP slide. Preloaded from <head>; see the warning at the top of this file. */
export const HERO_PRELOAD_PROPS = {
  ...SLIDE_IMAGE_PROPS,
  src: HERO_SLIDES[0].src,
};
