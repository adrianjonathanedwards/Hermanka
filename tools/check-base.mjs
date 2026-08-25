/**
 * Guard for the GitHub Pages preview build.
 *
 * A site served from a subdirectory fails in a nasty way: `href="/galerie"`
 * resolves to the GitHub Pages ROOT, not to the project, so the reader gets
 * someone else's 404 while our build stays green. tools/gh-pages.mjs rewrites
 * the absolute paths that exist today; this checks that it caught all of them,
 * so the day somebody adds `<link href="/something">` to a component the build
 * says so instead of the client finding it.
 *
 *   BASE_PATH=/Hermanka node tools/check-base.mjs
 *
 * Exits non-zero and prints every offender. No-ops when BASE_PATH is unset,
 * which is every production build.
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const base = process.env.BASE_PATH || '/';
if (base === '/') {
  console.log('check-base: BASE_PATH not set, nothing to check (production build)');
  process.exit(0);
}

const b = base.replace(/\/$/, '');
const DIST = 'dist';

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? walk(full) : [full];
  });
}

/* A URL that starts with a single slash and is not already under the base.
   `//host` is protocol-relative and external, so it is not one of ours. */
const offending = (u) => u.startsWith('/') && !u.startsWith('//') && !u.startsWith(b + '/') && u !== b;

const problems = [];
const doubled = [];

for (const file of walk(DIST).filter((f) => /\.(html|css)$/.test(f))) {
  const text = readFileSync(file, 'utf8');
  const where = file.split(path.sep).join('/').replace(/^dist/, '');

  for (const m of text.matchAll(/(?:href|src|action|data-lightbox|imagesrcset|srcset)="([^"]*)"/g)) {
    for (const candidate of m[1].split(',')) {
      const u = candidate.trim().split(/\s+/)[0];
      if (u && offending(u)) problems.push(`${where}  ${u}`);
    }
  }
  for (const m of text.matchAll(/url\((['"]?)(\/[^)'"]*)/g)) {
    if (offending(m[2])) problems.push(`${where}  url(${m[2]})`);
  }
  /* The rewrite running twice is just as broken, and much easier to miss. */
  if (text.includes(`${b}${b}/`)) doubled.push(where);
}

if (problems.length || doubled.length) {
  console.error(`\ncheck-base: build is NOT servable from ${b}/\n`);
  if (problems.length) {
    console.error(`${problems.length} path(s) still pointing at the domain root:`);
    for (const p of [...new Set(problems)].slice(0, 40)) console.error('  ' + p);
    console.error('\nFix: add the pattern to rewrite() in tools/gh-pages.mjs.');
  }
  if (doubled.length) {
    console.error(`\nbase applied twice in: ${[...new Set(doubled)].join(', ')}`);
    console.error('Fix: the negative lookahead in tools/gh-pages.mjs rewrite().');
  }
  process.exit(1);
}

console.log(`check-base: every internal path is under ${b}/ ✓`);
