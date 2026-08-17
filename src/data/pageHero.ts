/**
 * The subpage header photograph, in one place.
 *
 * Same contract as src/data/hero.ts: `PAGE_HERO_IMAGE_PROPS` is spread into BOTH
 * the <Image> in PageHero.astro and the `getImage()` call each page makes to feed
 * `heroPreload` on BaseLayout. They must describe *exactly* the same transform  
 * any divergence produces a different file hash, and the browser then preloads
 * one file and renders another, downloading the header image twice.
 *
 * `layout: 'none'` opts out of Astro's responsive sizing machinery: this is an
 * `object-fit: cover` backdrop sized entirely by CSS, and the extra `fit` and
 * `position` parameters the constrained layout adds would only be one more thing
 * to keep in sync.
 *
 * It is the same exterior the homepage hero opens on, which is deliberate: the
 * five subpages of the old site all shared one header crop and there is no reason
 * to spend five more photographs on a title band. A page with a better photograph
 * of its own subject passes it to <PageHero image=… alt=… /> instead.
 */
import exterier from '@img/header-bg-02.webp';

export const PAGE_HERO_SIZES = '100vw';

export const PAGE_HERO_IMAGE_PROPS = {
  widths: [640, 960, 1280, 1600, 1920],
  sizes: PAGE_HERO_SIZES,
  format: 'webp' as const,
  quality: 70,
  layout: 'none' as const,
  loading: 'eager' as const,
  fetchpriority: 'high' as const,
};

export const PAGE_HERO_IMAGE = exterier;

export const PAGE_HERO_ALT =
  'Chalupa Heřmanka zvenku: bílý dvoupodlažní objekt se strmou sedlovou střechou a krytou terasou, kolem dokola les';

/** Spread into `getImage()` in a page's frontmatter to resolve the preload. */
export const PAGE_HERO_PRELOAD_PROPS = {
  src: PAGE_HERO_IMAGE,
  ...PAGE_HERO_IMAGE_PROPS,
};
