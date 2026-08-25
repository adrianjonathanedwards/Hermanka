/**
 * Makes the build servable from a subdirectory, for the GitHub Pages preview
 * the client is shown before launch.
 *
 * ⚠ THIS RUNS ONLY WHEN `BASE_PATH` IS SET, AND NOTHING SETS IT EXCEPT
 * .github/workflows/preview.yml. With the variable absent the whole integration
 * returns without doing anything and the production build is byte for byte what
 * it was before this file existed. Never set BASE_PATH on Cloudflare.
 *
 * WHY A POST-BUILD REWRITE RATHER THAN BASE-AWARE COMPONENTS
 * ----------------------------------------------------------
 * Astro's `base` handles everything Astro emits: the fingerprinted files under
 * _a/, every responsive image srcset, the stylesheet and module tags. What it
 * does not touch, because it cannot know they are internal, are the paths
 * written by hand in the source   `href="/ubytovani"`, the two font preloads,
 * the favicon, `url('/fonts/…')` in global.css. There are about twenty.
 *
 * Rewriting those twenty in the source would mean threading `import.meta.env.BASE_URL`
 * through a dozen components, changing production code that is already correct,
 * to serve a preview that is thrown away at launch. This does it at the edge
 * instead: one file, no source touched, and deleting it plus the two lines in
 * astro.config.mjs removes the whole mechanism.
 *
 * THE PREVIEW IS DELIBERATELY NOT INDEXABLE
 * -----------------------------------------
 * It is a copy of the real site on a different hostname. Left crawlable it would
 * compete with chalupahermanka.cz for the client's own search terms, which is a
 * real cost for a link that exists to be looked at once. robots.txt is replaced
 * with a blanket disallow and the sitemap is dropped from the artifact.
 */
import { readFileSync, writeFileSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? walk(full) : [full];
  });
}

/**
 * Root-absolute internal paths, minus the ones already carrying the base.
 *
 * The negative lookahead is what makes this safe to think about: Astro has
 * already rewritten its own URLs to `/Hermanka/_a/…` by the time this runs, and
 * without the guard a second pass would produce `/Hermanka/Hermanka/_a/…`. Two
 * slashes are excluded as well   `//fonts.example.com` is protocol-relative and
 * external, not a root path.
 */
function rewrite(text, base) {
  const b = base.replace(/\/$/, '');
  const notAlreadyBased = `(?!${b.slice(1)}/)(?!/)`;

  return text
    /* href / src / action on any element. */
    .replace(
      new RegExp(`\\b(href|src|action)="/${notAlreadyBased}`, 'g'),
      (_m, attr) => `${attr}="${b}/`,
    )
    /* CSS: the two @font-face sources in global.css. */
    .replace(
      new RegExp(`url\\((['"]?)/${notAlreadyBased}`, 'g'),
      (_m, q) => `url(${q}${b}/`,
    )
    /* The lightbox reads its large variant out of this attribute. */
    .replace(
      new RegExp(`\\bdata-lightbox="/${notAlreadyBased}`, 'g'),
      `data-lightbox="${b}/`,
    );
}

export default function ghPages() {
  return {
    name: 'hermanka:gh-pages',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const base = process.env.BASE_PATH || '/';
        if (base === '/') return;

        const out = fileURLToPath(dir);
        const files = walk(out);

        let touched = 0;
        for (const file of files) {
          if (!/\.(html|css)$/.test(file)) continue;
          const before = readFileSync(file, 'utf8');
          const after = rewrite(before, base);
          if (after !== before) {
            writeFileSync(file, after);
            touched++;
          }
        }

        /*
         * Astro's asset directory is `_a`. Jekyll   which GitHub Pages runs by
         * default on a branch deploy   skips every path beginning with an
         * underscore, which would 404 the entire stylesheet, script and image
         * set. The Actions artifact deploy this repo uses does not run Jekyll,
         * so this file is belt and braces; it costs nothing and it is exactly
         * what someone switching to a branch deploy would forget.
         */
        writeFileSync(path.join(out, '.nojekyll'), '');

        /* Not a search result. See the header note. */
        writeFileSync(
          path.join(out, 'robots.txt'),
          '# Preview build. The real site is https://www.chalupahermanka.cz/\nUser-agent: *\nDisallow: /\n',
        );
        for (const stale of ['sitemap-index.xml', 'sitemap-0.xml']) {
          const f = path.join(out, stale);
          if (existsSync(f)) rmSync(f);
        }

        /*
         * `_headers` and `_redirects` are Cloudflare Pages features. GitHub
         * Pages ignores both, so the preview has none of the security headers
         * and none of the 301s from the old WordPress URLs. Removing them says
         * so honestly rather than shipping two files that look like they work.
         */
        for (const cf of ['_headers', '_redirects']) {
          const f = path.join(out, cf);
          if (existsSync(f)) rmSync(f);
        }

        logger.info(`preview build for ${base} (${touched} files rewritten, robots.txt set to disallow)`);
      },
    },
  };
}
