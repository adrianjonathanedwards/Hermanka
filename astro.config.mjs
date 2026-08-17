// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.chalupahermanka.cz',

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

  // Emits /sitemap-index.xml, referenced from public/robots.txt.
  // `i18n` here is intentionally omitted until a second locale is live   see the
  // note on LIVE_LOCALES in src/i18n/config.ts.
  integrations: [sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },
});
