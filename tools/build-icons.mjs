/**
 * Generates the two fixed images in public/ that astro:assets cannot make:
 *
 *   public/apple-touch-icon.png   180x180 home-screen icon
 *   public/og-default.jpg         1200x630 social share card
 *
 * Both must live at a stable, un-fingerprinted URL. A share card is fetched by a
 * scraper that never runs our HTML through a build, and iOS asks for
 * /apple-touch-icon.png by convention even when the <link> is present. So these
 * are committed outputs, not build artefacts   this script is run by hand when
 * the source photograph or the mark changes, and the results are committed.
 *
 *   node tools/build-icons.mjs
 *
 * sharp comes in with Astro; there is no extra dependency here.
 *
 * ⚠ NOT WIRED INTO `npm run build` on purpose. It would add a sharp SVG render
 * to every CI build to reproduce two files that change perhaps twice a year, and
 * a Pages build that silently regenerates committed assets is a build that can
 * differ from what was reviewed.
 */
import sharp from 'sharp';
import { statSync } from 'node:fs';

/* The deep-spruce ground, --color-les in src/styles/global.css. iOS composites a
   transparent icon onto black, so the icon has to carry its own background. */
const GROUND = '#16241C';

/* The mark, kept in sync with src/components/decor/RoofMark.astro   same three
   paths, same coordinates. Not in public/: it is a source, not a served file. */
const MARK = 'src/assets/icon/roof-mark.svg';

/* Slide one of the hero (src/data/hero.ts). The share card should be the picture
   someone is about to see, not a different one. Already 16:9, so 1200x630 is
   very nearly a straight resize. */
const OG_SOURCE = 'img/header-bg-02.webp';

async function main() {
  /* density: sharp rasterises SVG at 72dpi by default, which renders this
     32-unit viewBox at 32px and then upscales it to 180. 600 renders it large
     and scales down instead. */
  await sharp(MARK, { density: 600 })
    .resize(180, 180)
    .flatten({ background: GROUND })
    .png({ compressionLevel: 9 })
    .toFile('public/apple-touch-icon.png');

  /* JPEG, not WebP. Facebook, X, LinkedIn, Slack and Discord all read WebP now;
     WhatsApp still does not reliably, and that is the channel a Czech guest is
     most likely to share in. mozjpeg buys ~15% at the same quality. */
  await sharp(OG_SOURCE)
    .resize(1200, 630, { fit: 'cover', position: 'attention' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile('public/og-default.jpg');

  for (const f of ['public/apple-touch-icon.png', 'public/og-default.jpg']) {
    console.log(`${f}  ${(statSync(f).size / 1024).toFixed(1)} kB`);
  }
}

main();
