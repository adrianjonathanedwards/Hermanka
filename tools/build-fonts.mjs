#!/usr/bin/env node
/**
 * Generates the self-hosted woff2 subsets in public/fonts/.
 *
 *   npm run build:fonts     # download sources, subset, then verify
 *
 * Sources are the upstream variable fonts from google/fonts (OFL). They are cached
 * in .cache/fonts/ and are not committed; the generated woff2 files in public/fonts/
 * ARE committed, so a normal build and a normal deploy need no network access.
 *
 * Read docs/02-design-system.md §2.2–2.3 before changing the axes or the charset.
 */
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import subsetFont from 'subset-font';
import { CHARSET } from './charset.mjs';

const CACHE = '.cache/fonts';
const OUT = 'public/fonts';

const SOURCES = {
  'Fraunces-var.ttf':
    'https://github.com/google/fonts/raw/main/ofl/fraunces/Fraunces%5BSOFT%2CWONK%2Copsz%2Cwght%5D.ttf',
  'PublicSans-var.ttf':
    'https://github.com/google/fonts/raw/main/ofl/publicsans/PublicSans%5Bwght%5D.ttf',
};

const FACES = [
  {
    out: 'fraunces-var.woff2',
    src: 'Fraunces-var.ttf',
    // wght stays an axis (400–600, the only two weights the system allows).
    //
    // opsz is pinned LOW, at 24, not at the 144 display end. Fraunces at 144 is a
    // high-contrast fashion face: the thins go hairline and the Czech carons on
    // ě š č ř ž turn spindly at exactly the sizes we set headings. At 24 the face
    // is sturdier, lower-contrast and warmer, which both suits a timber cottage
    // and holds the diacritics together. Verified side by side at 49px.
    //
    // Keeping opsz as a live axis instead would cost 44.6 kB against 23.7 kB
    // pinned   nearly double, for a nuance CSS would never need to vary.
    //
    // SOFT and WONK are pinned to 0; the wonky forms are not the brand.
    variationAxes: { wght: { min: 400, max: 600 }, opsz: 24, SOFT: 0, WONK: 0 },
  },
  {
    out: 'public-sans-var.woff2',
    src: 'PublicSans-var.ttf',
    variationAxes: { wght: { min: 400, max: 600 } },
  },
];

/** Fonts are preloaded, so a regression here is a regression in first paint. */
const BUDGET_BYTES = 28 * 1024;

mkdirSync(CACHE, { recursive: true });
mkdirSync(OUT, { recursive: true });

for (const [file, url] of Object.entries(SOURCES)) {
  const path = `${CACHE}/${file}`;
  if (existsSync(path)) continue;
  console.log(`↓ ${file}`);
  execFileSync('curl', ['-sL', '--fail', '-o', path, url], { stdio: 'inherit' });
}

console.log(`\ncharset: ${[...CHARSET].length} codepoints\n`);

let over = false;
for (const face of FACES) {
  const buf = await subsetFont(readFileSync(`${CACHE}/${face.src}`), CHARSET, {
    targetFormat: 'woff2',
    variationAxes: face.variationAxes,
  });
  writeFileSync(`${OUT}/${face.out}`, buf);
  const kb = (buf.length / 1024).toFixed(1);
  const ok = buf.length <= BUDGET_BYTES;
  if (!ok) over = true;
  console.log(
    `${ok ? '✓' : '� '} ${face.out.padEnd(24)} ${kb.padStart(6)} kB  (budget ${BUDGET_BYTES / 1024} kB)`
  );
}

if (over) {
  console.error('\nA face is over budget. Trim the charset or an axis before committing.');
  process.exit(1);
}

console.log('');
execFileSync(
  process.execPath,
  ['tools/verify-font-coverage.mjs', `${OUT}/fraunces-var.woff2`, `${OUT}/public-sans-var.woff2`],
  { stdio: 'inherit' }
);
