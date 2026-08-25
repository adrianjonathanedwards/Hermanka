// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import headers from './tools/headers.mjs';
import ghPages from './tools/gh-pages.mjs';

/*
 * PRODUCTION IS THE DEFAULT AND IS UNCONDITIONAL.
 *
 * With neither variable set   which is every local build and every Cloudflare
 * Pages build   this resolves to the live site at the domain root, exactly as
 * it did before these two lines existed. The overrides exist for one purpose:
 * the client-preview deploy to GitHub Pages, which serves the site from a
 * subdirectory (/Hermanka/) rather than a domain of its own.
 *
 * Do NOT set these in the Cloudflare project. See the note in tools/gh-pages.mjs.
 */
const SITE = process.env.SITE_URL || 'https://www.chalupahermanka.cz';
const BASE = process.env.BASE_PATH || '/';

// https://astro.build/config
export default defineConfig({
  site: SITE,

  /*
   * '/' everywhere except the GitHub Pages preview. Astro prefixes everything it
   * generates itself   the fingerprinted assets in _a/, every image srcset, the
   * stylesheet and script tags   with this. It does NOT touch hrefs written by
   * hand in a component, which is what tools/gh-pages.mjs is for.
   */
  base: BASE,

  // Static output. There is no server runtime on Cloudflare Pages for this project  
  // the two dynamic things (inquiry form, availability feed) are separate Workers.
  // See docs/03-tech.md.
  output: 'static',

  // Clean URLs: /chalupa, not /chalupa/. build.format 'directory' still emits
  // chalupa/index.html, which Cloudflare Pages serves at both   trailingSlash
  // 'never' makes our own generated links consistent.
  trailingSlash: 'never',
  build: {
    format: 'directory',
    assets: '_a',
  },

  // i18n routing is configured from day one so that adding /de/ is a content task,
  // not a rebuild. Czech is the default locale and is NOT prefixed: the Czech site
  // lives at /, German will live at /de/.
  //
  // Deliberately NO `fallback`   a fallback would generate /de/* pages filled with
  // Czech content the moment the locale exists, publishing untranslated pages and
  // getting them indexed. German pages appear when German copy exists, not before.
  i18n: {
    defaultLocale: 'cs',
    locales: ['cs', 'de'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  image: {
    // WebP only. Every image goes through astro:assets   see docs/03-tech.md.
    // Widths kept to the set the layout actually uses; do not add more without a
    // reason, each one is another file in the build.
    responsiveStyles: true,
    layout: 'constrained',
  },

  // Prefetch is deliberately OFF. Enabling it in any mode injects a ~2.5 kB
  // runtime into every page, which is the entire JavaScript payload of this site
  // spent on speculative navigation the primary audience   on a phone   barely
  // benefits from. Six static pages under the budget in docs/03-tech.md §5 ship
  // 0 kB of JavaScript, and that is worth more than a warm cache on hover.
  prefetch: false,

  // sitemap: emits /sitemap-index.xml, referenced from public/robots.txt.
  // `i18n` here is intentionally omitted until a second locale is live   see the
  // note on LIVE_LOCALES in src/i18n/config.ts.
  //
  // The filter keeps /kontakt/dekujeme out. That page sends `noindex` (it is a
  // form receipt, and one indexed is one people arrive on having sent nothing),
  // and listing a noindex URL in a sitemap is a contradiction Search Console
  // reports back as an error. A page is in one or the other, never both.
  //
  // headers: writes dist/_headers   the CSP, the transport-security set and the
  // cache policy for Cloudflare Pages. Generated rather than committed because
  // the CSP pins the one inline script by hash; see tools/headers.mjs.
  integrations: [
    sitemap({ filter: (page) => !page.includes('/kontakt/dekujeme') }),
    headers(),
    /* No-ops entirely unless BASE_PATH is set. Production never runs it. */
    ghPages(),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
