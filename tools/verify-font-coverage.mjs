#!/usr/bin/env node
/**
 * Fails if any self-hosted font is missing a Czech character.
 *
 * Parses the font's `cmap` table directly rather than trusting the subsetter's
 * report — the point is to check the bytes we are about to ship. Accepts .ttf/.otf
 * and .woff2 (decompressed first).
 *
 *   npm run verify:fonts
 *   node tools/verify-font-coverage.mjs public/fonts/some-face.woff2
 *
 * Why this exists: "subset to latin-ext" sounds like it covers Czech and does not.
 * See docs/02-design-system.md §2.2.
 */
import { readFileSync } from 'node:fs';
import { CZECH_REQUIRED } from './charset.mjs';

const PUNCTUATION_REQUIRED = '–—‘’‚“„…§';

function readTableDirectory(buf) {
  const numTables = buf.readUInt16BE(4);
  const tables = {};
  for (let i = 0; i < numTables; i++) {
    const o = 12 + i * 16;
    tables[buf.toString('ascii', o, o + 4)] = {
      offset: buf.readUInt32BE(o + 8),
      length: buf.readUInt32BE(o + 12),
    };
  }
  return tables;
}

/** Every codepoint the font maps to a non-zero glyph id. */
function mappedCodepoints(buf) {
  const cmap = readTableDirectory(buf).cmap;
  if (!cmap) throw new Error('font has no cmap table');
  const base = cmap.offset;

  let chosen = null;
  const numSubtables = buf.readUInt16BE(base + 2);
  for (let i = 0; i < numSubtables; i++) {
    const rec = base + 4 + i * 8;
    const platform = buf.readUInt16BE(rec);
    const encoding = buf.readUInt16BE(rec + 2);
    const sub = base + buf.readUInt32BE(rec + 4);
    const format = buf.readUInt16BE(sub);
    const isUnicode = platform === 0 || (platform === 3 && (encoding === 1 || encoding === 10));
    if (!isUnicode) continue;
    // Prefer format 12 (full Unicode) over format 4 (BMP only).
    if (format === 12) chosen = { sub, format };
    else if (format === 4 && chosen?.format !== 12) chosen = { sub, format };
  }
  if (!chosen) throw new Error('font has no Unicode cmap subtable');

  const found = new Set();

  if (chosen.format === 4) {
    const s = chosen.sub;
    const segCountX2 = buf.readUInt16BE(s + 6);
    const segCount = segCountX2 / 2;
    const endsAt = s + 14;
    const startsAt = endsAt + segCountX2 + 2;
    const deltasAt = startsAt + segCountX2;
    const rangesAt = deltasAt + segCountX2;
    for (let i = 0; i < segCount; i++) {
      const end = buf.readUInt16BE(endsAt + i * 2);
      const start = buf.readUInt16BE(startsAt + i * 2);
      const delta = buf.readInt16BE(deltasAt + i * 2);
      const rangeOffset = buf.readUInt16BE(rangesAt + i * 2);
      if (start === 0xffff) continue;
      for (let c = start; c <= end && c !== 0x10000; c++) {
        let glyph;
        if (rangeOffset === 0) {
          glyph = (c + delta) & 0xffff;
        } else {
          const at = rangesAt + i * 2 + rangeOffset + (c - start) * 2;
          if (at + 1 >= buf.length) continue;
          glyph = buf.readUInt16BE(at);
          if (glyph !== 0) glyph = (glyph + delta) & 0xffff;
        }
        if (glyph !== 0) found.add(c);
      }
    }
  } else {
    const s = chosen.sub;
    const numGroups = buf.readUInt32BE(s + 12);
    for (let i = 0; i < numGroups; i++) {
      const g = s + 16 + i * 12;
      const start = buf.readUInt32BE(g);
      const end = buf.readUInt32BE(g + 4);
      if (buf.readUInt32BE(g + 8) === 0) continue;
      for (let c = start; c <= end; c++) found.add(c);
    }
  }

  return found;
}

async function loadFont(path) {
  const raw = readFileSync(path);
  const isWoff2 = raw.toString('ascii', 0, 4) === 'wOF2';
  if (!isWoff2) return raw;
  let wawoff2;
  try {
    wawoff2 = await import('wawoff2');
  } catch {
    throw new Error(
      'woff2 input needs the `wawoff2` dev dependency — run `npm install` (or pass a .ttf)'
    );
  }
  return Buffer.from(await wawoff2.decompress(raw));
}

const files = process.argv.slice(2).filter((f) => /\.(woff2|ttf|otf)$/i.test(f));

if (files.length === 0) {
  console.error(
    'No font files given.\n' +
      'Fonts are generated, not committed by hand — run `npm run build:fonts` first.\n' +
      'See public/fonts/README.md.'
  );
  process.exit(1);
}

let failed = false;

for (const file of files) {
  const name = file.split(/[\\/]/).pop();
  let mapped;
  try {
    mapped = mappedCodepoints(await loadFont(file));
  } catch (err) {
    console.error(`✗ ${name} — could not read: ${err.message}`);
    failed = true;
    continue;
  }

  const missingCzech = [...CZECH_REQUIRED].filter((c) => !mapped.has(c.codePointAt(0)));
  const missingPunct = [...PUNCTUATION_REQUIRED].filter((c) => !mapped.has(c.codePointAt(0)));

  if (missingCzech.length === 0 && missingPunct.length === 0) {
    console.log(`✓ ${name.padEnd(24)} ${String(mapped.size).padStart(4)} glyphs — Czech complete`);
  } else {
    failed = true;
    console.error(`✗ ${name.padEnd(24)} ${String(mapped.size).padStart(4)} glyphs`);
    if (missingCzech.length) console.error(`    missing Czech:       ${missingCzech.join(' ')}`);
    if (missingPunct.length) console.error(`    missing punctuation: ${missingPunct.join(' ')}`);
  }
}

if (failed) {
  console.error(
    '\nA font is missing characters this site renders. Do not commit it.\n' +
      'Check tools/charset.mjs and docs/02-design-system.md §2.2.'
  );
  process.exit(1);
}
