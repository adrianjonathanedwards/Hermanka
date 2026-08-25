# Chalupa Heřmanka

Website for **Chalupa Heřmanka**, a holiday cottage in Heřmanice u Králík below the
Králický Sněžník. Replaces the 2019 site at <https://www.chalupahermanka.cz/>.

The site has one job: **get an inquiry with dates attached.** Everything else is in
service of that. Read [docs/00-brief.md](docs/00-brief.md) before writing anything.

> **Status: documentation and scaffold only. No pages are built.**
> `src/pages/` is empty on purpose. `npm run build` succeeds and produces zero
> pages   that is the expected result at this stage.

---

## Requirements

- **Node ≥ 20.3**
- npm

## Running it

```bash
npm install
npm run dev          # http://localhost:4321
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Static build into `dist/` |
| `npm run preview` | Serve `dist/` locally   closest thing to production |
| `npm run check` | `astro check`   types and templates. Must be clean before a PR. |
| `npm run build:fonts` | Regenerate the self-hosted font subsets (needs network) |
| `npm run verify:fonts` | Verify the committed fonts cover the Czech alphabet |

Before opening a pull request:

```bash
npm run check && npm run build
```

Plus the component checklist in [docs/02-design-system.md](docs/02-design-system.md)
§7.

## Deploying

**Cloudflare Pages**, building from the repository.

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | from [`.nvmrc`](.nvmrc)   see below |
| Production branch | `main` |

### Node version

`.nvmrc` pins it, and it is not optional. Astro 7 requires **Node 22.12 or
later** and hard-fails below that. Cloudflare Pages does **not** read `engines`
from `package.json`; left to itself it builds on its own default, which has been
Node 18 for projects created before it changed   so without the pin the build
does not merely warn, it fails.

`.nvmrc` pins **22.12.0**: Astro's own declared floor, an LTS, and a version
every Cloudflare Pages build image offers. Pinning the newest Node instead would
be the riskier choice here, not the safer one   an older Pages build image may
not carry it, and that is the same failed build by another route. Local
development on a newer Node is fine; `engines` is what decides that, and both
satisfy it.

If you would rather set the version in the dashboard, the variable is
`NODE_VERSION`   but the file is better, because a dashboard setting is lost the
day someone recreates the project and nobody remembers it existed.

Every pull request gets a preview URL. **Review on the preview, not locally**   it
is the only place `_redirects` and the real security and cache headers apply.
`dist/_headers` is generated at build time by
[`tools/headers.mjs`](tools/headers.mjs) and is not in `public/`; see the note at
the top of that file for why.

### The client preview on GitHub Pages

A second, throwaway copy of the site is published to GitHub Pages so the client
can look at it before the domain is switched over:

**https://adrianjonathanedwards.github.io/Hermanka/**

[`.github/workflows/preview.yml`](.github/workflows/preview.yml) rebuilds it on
every push to `main`, or on demand from the Actions tab. It is **not** the
production deploy and differs from it deliberately:

| | Production (Cloudflare) | Preview (GitHub Pages) |
| --- | --- | --- |
| Served from | the domain root | the `/Hermanka/` subdirectory |
| `_headers` (CSP, HSTS…) | applied | **ignored by GitHub Pages**, so deleted from the artifact |
| `_redirects` (the old WordPress URLs) | applied | **ignored**, so deleted |
| robots.txt | `Allow: /` | `Disallow: /`, and the sitemap is dropped |

That last row matters: the preview is a copy of the site on a different
hostname, and left crawlable it would compete with chalupahermanka.cz for the
client's own search terms.

**One-time setup, in the repository settings:** Settings → Pages → Build and
deployment → Source → **GitHub Actions**. Until that is set, GitHub serves this
README through Jekyll instead of the site.

Serving from a subdirectory is the whole difficulty. Astro's `base` prefixes
everything Astro emits, but not the paths written by hand in components
(`href="/galerie"`, the font preloads, the favicon). Those are rewritten after
the build by [`tools/gh-pages.mjs`](tools/gh-pages.mjs), and
[`tools/check-base.mjs`](tools/check-base.mjs) fails the build if it ever misses
one   on a subpath a stray `/…` is a 404 for the reader and a green build for
us. Reproduce it locally with `npm run build:preview`.

Neither file does anything unless `BASE_PATH` is set, and nothing sets it except
that workflow. **Never set `BASE_PATH` or `SITE_URL` on Cloudflare.**

Two Cloudflare Workers (inquiry form, availability feed) deploy **separately** with
`wrangler` from [`worker/`](worker/). They are not part of the Pages build and
neither is written yet. Their secrets   `RESEND_API_KEY`, `INQUIRY_TO`,
`INQUIRY_FROM`   are set with `wrangler secret put` and never committed.

---

## Directory conventions

```
/img                    Source photography. Originals, mixed JPEG and WebP.
                        NOT processed by the build   see below.
/docs                   Project documentation. Start at 00-brief.md.
/tools                  Build-time scripts (font subsetting and verification).
/worker                 Cloudflare Workers. Placeholder   nothing built yet.

/public                 Served verbatim at the site root. Never optimised.
  /fonts                Generated woff2 subsets + OFL licence. Do not hand-edit.
  favicon.svg           Placeholder mark   awaiting the real logo vector.
  robots.txt
  _redirects            301s from the old 2019 URLs. Do not delete these.

/src
  /assets/img           Images the build imports. Optimised, fingerprinted, WebP.
  /components           Astro components. Empty   see docs/02-design-system.md §6.
  /i18n                 Locale config, UI strings, path helpers.
  /layouts              BaseLayout.astro   owns <head>. The only layout.
  /pages                Routes. Empty by design in this phase.
  /styles/global.css    Tailwind v4 @theme   every design token lives here.
```

### Where images live

Two places, and the difference matters.

**`/img` at the repo root** holds the **source photography**   the originals as
supplied by the client. Nothing in `/img` is served or processed. It is the archive.

**`src/assets/img/`** holds images the site actually uses. They are imported into
components and go through `astro:assets`, which converts them to WebP, generates the
widths the layout needs, and fingerprints the filenames for long-lived caching:

```astro
---
import { Image } from 'astro:assets';
import terasa from '../assets/img/terasa.jpg';
---
<Image src={terasa} alt="Krytá terasa s venkovním krbem" width={1280} height={853}
       format="webp" loading="lazy" />
```

**Do not put content images in `public/`.** Files there are copied byte-for-byte
with no optimisation and no fingerprint. `public/` is for things that must keep an
exact path: fonts, the favicon, `robots.txt`, `_redirects`.

Every `<img>` needs explicit `width` and `height` and Czech `alt` text. Everything
is `loading="lazy"` except the hero. Full rules in
[docs/03-tech.md](docs/03-tech.md) §4.

### Fonts

Two self-hosted variable woff2 files, 40.7 kB together, subset to a Czech charset and
**committed**   so a build needs no network. Regenerate with `npm run build:fonts`.

There is a real trap here: Google's `latin-ext` subset does **not** contain the whole
Czech alphabet, and subsetting to it alone renders `Heřmanka` in two different fonts.
See [docs/02-design-system.md](docs/02-design-system.md) §2.2 and
[public/fonts/README.md](public/fonts/README.md).

### Styling

Tailwind v4, with every token declared in `@theme` in
[`src/styles/global.css`](src/styles/global.css). Tailwind's default colour,
type-scale, weight and breakpoint namespaces are reset to `initial`, so
`bg-blue-500`, `text-4xl` and `font-bold` **do not exist**. That is intentional: the
design system is the only way to reach a value. If a utility is missing, add the
token and say why.

### Third-party artwork

Two sets of drawings on this site were made by other people, and both carry
licence conditions. Keep the credits with the code.

| What | Where | Licence |
| --- | --- | --- |
| **Lucide** icons   the facts strip | `lucide-static`, inlined by [`src/components/IconLucide.astro`](src/components/IconLucide.astro) | ISC |
| **"Pine tree"** by **Lorc**, [game-icons.net](https://game-icons.net/1x1/lorc/pine-tree.html)   the stands in the O nás clearing | [`src/components/decor/pine-tree.ts`](src/components/decor/pine-tree.ts) | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |

CC BY requires the attribution above to stay published. If the spruce is ever
replaced, change this table in the same commit.

Everything else drawn on the site   the footer treeline, the sprig dividers, the
roof mark, the form icons   was made for it and is generated or hand-authored in
[`src/components/decor/`](src/components/decor/).

---

## Documentation

| | |
| --- | --- |
| [docs/00-brief.md](docs/00-brief.md) | Client, property, audience, the single job, booking model, what success looks like |
| [docs/01-content.md](docs/01-content.md) | Czech content inventory page by page, KEEP / REWRITE / NEEDS CLIENT INPUT, and the copy errors on the current site |
| [docs/02-design-system.md](docs/02-design-system.md) | Palette with measured contrast, type, layout, the illustration rule, motion |
| [docs/03-tech.md](docs/03-tech.md) | Stack, forms, availability, images, performance budget, i18n, accessibility, deployment |
| [docs/04-pages.md](docs/04-pages.md) | Sitemap and the section list for each page |

### Two things to read before building anything

1. **[docs/01-content.md](docs/01-content.md) §9**   twenty-four questions the
   client has to answer. Fifteen of them block launch, including the room-by-room
   capacity (the old site's prose totals up to 19 people against a stated maximum of
   15) and an unverified `bezbariérové ubytování` accessibility claim.
2. **[docs/03-tech.md](docs/03-tech.md) §3**   **there is no iCal feed yet.**
   Availability on the current site is a third-party HTML iframe from `e-chalupy.cz`
   with no `.ics` export. The calendar cannot be built until a source is agreed;
   the recommendation is a private Google Calendar owned by the client.

---

## What exists right now

Created in this first phase:

**Documentation**   `docs/00-brief.md`, `docs/01-content.md`,
`docs/02-design-system.md`, `docs/03-tech.md`, `docs/04-pages.md`, this README.

**Scaffold**   `astro.config.mjs` (static output, i18n routing for `cs`/`de`,
sitemap, prefetch off), `tsconfig.json`, `package.json`, `.gitignore`,
`src/styles/global.css` (all tokens in `@theme`), `src/layouts/BaseLayout.astro`,
`src/i18n/{config,ui,utils}.ts`, `public/_redirects`, `public/robots.txt`,
`public/favicon.svg`, `worker/README.md`.

**Font pipeline**   `tools/charset.mjs`, `tools/build-fonts.mjs`,
`tools/verify-font-coverage.mjs`, and the two generated woff2 files in
`public/fonts/`.

Verified: `npm run build` succeeds, `npm run check` reports 0 errors,
`npm run verify:fonts` passes, and the build emits **0 kB of JavaScript**.

**Not** created: any page, any component, either Worker.
