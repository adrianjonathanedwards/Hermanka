# 03   Stack and conventions

Everything in this document is a rule, not a preference. Where a rule has a reason
that is not obvious, the reason is given   those are the ones most likely to be
argued with later.

---

## 1. Stack

| | |
| --- | --- |
| **Framework** | Astro 7, **static output** (`output: 'static'`) |
| **Styling** | Tailwind CSS v4 via `@tailwindcss/vite`   tokens in `@theme` |
| **Hosting** | Cloudflare Pages |
| **Forms** | Cloudflare Worker + Resend |
| **Availability** | Cloudflare Worker reading an iCal feed, cached in KV |
| **Images** | WebP only, through `astro:assets` |
| **Node** | ≥ 20.3 |

No React, no Vue, no Svelte, no client-side router, no state library. If a component
seems to need one, it is the wrong component   this is a six-page brochure site whose
job is to collect an email address.

`@astrojs/tailwind` is **not** used; it is the v3-era integration. Tailwind v4 is
wired as a Vite plugin, and every token is declared in `@theme` in
[`src/styles/global.css`](../src/styles/global.css). Tailwind's default colour,
type-scale, weight and breakpoint namespaces are reset to `initial` there, so
`bg-blue-500`, `text-4xl` and `font-bold` do not exist. That is deliberate: it makes
the design system the only way to reach a value.

---

## 2. Forms

The inquiry form posts to a Cloudflare Worker, which sends mail via **Resend**.

**It must work with JavaScript disabled.** This is a hard requirement, not a nice-to-
have.

- A native `<form method="POST" action="https://…workers.dev/poptavka">`. No
  `fetch`, no `preventDefault`, no framework form library.
- The Worker responds with a 303 redirect to `/kontakt/dekujeme` on success and back
  to the form with an error parameter on failure. A no-JS browser follows both.
- Progressive enhancement on top is allowed   inline validation messages, a
  submitting state   but only ever as an *addition* to a form that already works
  without it. If the enhancement is removed, nothing may break.
- Server-side validation is the only validation that counts. `required` and
  `type="email"` are hints to the browser, not a security boundary.

### Fields

Defined in [01-content.md](01-content.md) §8.2. The date field is a **free-text
input**, not a date-range picker:

> The site's single job is an inquiry with dates attached. A picker that rejects
> `20.-27.9.` because it wanted `20. 9. 2026 – 27. 9. 2026` costs us the inquiry.
> Accept anything, parse leniently on the Worker, and pass the raw string through to
> the email so the owner can read what the guest actually typed.

### Spam

In order of preference:

1. A honeypot field, visually hidden and `tabindex="-1"`, `autocomplete="off"`.
2. A minimum time-to-submit check (a signed timestamp in a hidden field; reject
   under ~3 seconds).
3. Cloudflare Turnstile **only if 1 and 2 prove insufficient**, and only in its
   invisible mode.

No reCAPTCHA. It is a third-party script, it is a GDPR problem for a Czech site, and
it punishes exactly the older, less confident users who are most likely to be booking
a cottage for fifteen people.

### Secrets and delivery

- `RESEND_API_KEY`, `INQUIRY_TO`, `INQUIRY_FROM` are Worker secrets
  (`wrangler secret put`). They never appear in the Astro build, in `public/`, or in
  any committed file.
- `INQUIRY_FROM` must be a verified domain sender, and the domain needs SPF, DKIM
  and DMARC records or inquiries land in spam. Confirm this is done before launch  
  a form that silently fails is worse than no form.
- The `poslat mi na email kopii` checkbox sends a second copy to the guest. Reply-To
  on the owner's copy is set to the guest's address so the owner can just hit reply.
- Log nothing containing personal data. Not to the console, not to KV, not to an
  analytics event.

> **Migration note.** The inquiry form on the current site is a third-party iframe
> from `e-chalupy.cz` (property id `2096`). Submissions go to them, not to the owner
> directly. Moving to our own Worker changes who receives leads and how   confirm
> with the owner that they are not relying on an e-chalupy inbox or CRM before
> cutting over, and keep the old flow alive until the first real inquiry arrives
> through the new one.

---

## 3. Availability calendar

The calendar reads an **iCal feed via a Worker, cached in KV**.

```
iCal source ──▶ Worker (fetch, parse VEVENTs) ──▶ KV (cached) ──▶ JSON ──▶ calendar
```

- Cache in KV with a TTL of 15–30 minutes and serve stale on upstream failure. An
  owner-managed calendar does not change minute to minute, and a guest seeing
  25-minute-old availability is fine. A guest seeing a spinner is not.
- The Worker returns a **compact JSON array of booked date ranges**   never raw
  iCal to the browser. Parsing iCal client-side would mean shipping a parser to a
  phone to render a table of coloured squares.
- The calendar renders **server-side at build time** from the last known good data,
  then refreshes from the Worker on load. So the page is useful before any
  JavaScript runs, and correct shortly after. If the Worker is down, the guest sees
  build-time availability and the form still works.
- Four states, carried over from the widget being replaced:
  `Volno` · `Obsazeno` · `Den příjezdu` · `Den odjezdu`. **State must never be
  conveyed by colour alone**   pattern or glyph as well (§7).
- Clicking a free range should prefill the inquiry form's date field. This is the
  single highest-value interaction on the site: it is the difference between an
  inquiry with dates and an inquiry without.

> ### ⚠️ There is no iCal feed yet   this is the project's largest unknown.
>
> The current site does not use iCal. Availability is an iframe from
> `obsazenost.e-chalupy.cz/kalendar.php?id=2096`, an HTML table with no `.ics`
> export exposed anywhere in the widget. So the architecture above has no source to
> read from today.
>
> Three options, in order of preference:
>
> 1. **Google Calendar as the source of truth.** The owner maintains a private
>    calendar; we read its secret `.ics` address. Matches "owner-managed
>    availability" exactly, gives the owner a phone app they already know how to
>    use, and gives us a stable, documented format. **This is the recommendation.**
> 2. **An iCal export from e-chalupy.** Many Czech listing portals expose one from
>    the owner's admin area even when it is not in the public widget. Worth one
>    email before building anything.
> 3. **Scraping the e-chalupy HTML widget from the Worker.** Works today, breaks
>    without warning on any markup change, and leaves the site dependent on a
>    competitor's listing portal to display its own availability. Fallback only.
>
> Whichever is chosen, the site must keep working when the feed is unreachable:
> build-time data, a clear "ověřte prosím dostupnost" note, and a form that submits
> regardless. **Do not start building the calendar until this is answered**
> ([01-content.md](01-content.md) §9, item 15).

---

## 4. Images

**WebP only. Every image goes through `astro:assets`.**

```astro
---
import { Image } from 'astro:assets';
import terasa from '../assets/img/terasa.jpg';
---
<Image src={terasa} alt="Krytá terasa s venkovním krbem" width={1280} height={853}
       format="webp" loading="lazy" />
```

Rules:

- **Explicit `width` and `height` on every `<img>`.** No exceptions. This is what
  stops the page reflowing as photographs arrive, which is both a CLS score and a
  guest losing their place mid-sentence.
- **`loading="lazy"` on everything except the hero.** The hero gets
  `loading="eager"`, `fetchpriority="high"` and a `<link rel="preload">`   and it is
  the *only* image on the page allowed any of those three. More than one high-
  priority image means none of them is high priority.
- **Czech `alt` on every content image.** Not `alt="chalupa"` on eleven photographs;
  describe what is in the picture, in Czech, the way you would to someone on the
  phone (§7).
- Source photography lives in `/img` at the repo root (originals, mixed JPEG and
  WebP, not processed). Images used in the build are imported from
  `src/assets/img/` so that Astro fingerprints and optimises them. `public/` is for
  files that must keep their exact path   fonts, favicon, `_redirects`, `robots.txt`
    and images placed there are **not** optimised.
- No `<picture>` art direction unless a crop genuinely differs between breakpoints.
  `astro:assets` `widths` + `sizes` covers the normal case.

### Decorative graphics

**Inline SVG. `aria-hidden="true"`. `pointer-events: none`. Never WebP for
decoration.**

The hand-drawn spruces, owl and map line work are drawings, not photographs. As
inline SVG they scale to any viewport, recolour with the palette, cost a few hundred
bytes, and stay crisp on a 3�  display. As WebP they are a blurry raster that has to
be re-exported at three sizes and cannot be restyled.

`pointer-events: none` is set globally for `svg[aria-hidden="true"]` in
`global.css`; a decorative graphic must never intercept a tap meant for the button
underneath it.

**Map labels are content, not decoration.** The two illustrated maps get real
`<text>` in the SVG, inside the accessibility tree, with a `<title>` and a text
alternative on the figure. See [02-design-system.md](02-design-system.md) §4  
today those labels are baked into a raster and are invisible to both search and
screen readers.

---

## 5. Performance budget

| | Budget |
| --- | ---: |
| **First load, excluding the hero image** | **≤ 100 kB** |
| Hero WebP | ≤ 150 kB |
| Third-party bytes above the fold | **0** |
| JavaScript on `/`, `/chalupa`, `/okoli`, `/galerie`, `/kontakt` | 0 kB |
| JavaScript on `/terminy-a-ceny` (calendar) | ≤ 10 kB |
| Lighthouse performance, mobile | ≥ 95 |
| LCP, mobile 4G | < 2.0 s |
| CLS | < 0.05 |

Where the 100 kB goes. The first two rows are measured from the committed files; the
rest are budgets, with the scaffold's actual figure alongside.

| | Budget | Measured on the scaffold |
| --- | ---: | ---: |
| `fraunces-var.woff2`, preloaded | 22.5 kB | **22.5 kB** (already compressed) |
| `public-sans-var.woff2`, preloaded | 18.2 kB | **18.2 kB** (already compressed) |
| CSS, brotli | ≤ 12 kB | **2.9 kB** (11.4 kB raw) |
| HTML, brotli, per page | ≤ 12 kB | 0.5 kB (near-empty page) |
| Inline decorative SVG | ≤ 6 kB |   counted inside HTML |
| JavaScript, static pages | **0 kB** | **0 kB** |
| **Total** | **≤ 71 kB** | **~44 kB** |
| Headroom | ~29 kB | |

Twenty-nine kilobytes of headroom is not spare change; it is the entire allowance for
everything nobody has thought of yet. Anything that wants a slice of it needs an
argument.

**Astro's `prefetch` is switched off** in `astro.config.mjs`, and this is the reason
why: enabling it in any mode injects a ~2.5 kB runtime into every page. That is the
site's entire JavaScript payload, spent on speculative navigation that a phone user
  the primary audience   barely benefits from. Zero is a budget you can verify at a
glance; 2.5 kB is a budget you have to argue about every sprint.

**Zero third-party embeds above the fold.** No exceptions   not analytics, not a
map, not a review widget, not a chat bubble.

> The current site loads Google Tag Manager (`GTM-KN4B4K4`) on every page, plus a
> YouTube iframe and two `e-chalupy.cz` iframes on the homepage. All four are
> third-party requests before the guest has read a sentence. GTM's future is a
> client decision ([01-content.md](01-content.md) §9, item 24); if analytics are
> wanted, use a lightweight cookieless option loaded after paint, and note that GTM
> plus Google Analytics on a Czech site brings a cookie-consent obligation the
> current site does not appear to honour.

### Video

**No YouTube iframe at all**   not on page load, and not injected on click
either. A single embed is roughly 500 kB and several third-party connections,
five times the entire page budget, for a video most visitors will not play.

**Link out instead.** A poster image (WebP, lazy, correct dimensions) inside an
`<a href="https://www.youtube.com/watch?v=…&autoplay=1" target="_blank"
rel="noopener noreferrer">` with a play button drawn over it. Third-party weight
stays at zero, it needs no JavaScript so it works with scripting off, and the
guest gets the real player   captions, quality, full screen   rather than a
stripped one bolted into a section that is not about video.

The facade pattern (inject the iframe on click) was built and then removed: it
carried the embed's full cost the moment anyone pressed play, needed JavaScript
to work at all, and gave a worse player than the one a tap already opens on a
phone. If a future page genuinely needs inline playback, that is the point to
revisit it   not before.

Accessibility: the link's name must carry both the poster's `alt` and the visible
label, with the new-window warning appended for screen readers.

Video `-U_w_kwtzjI`; see [01-content.md](01-content.md) §5.10.

---

## 6. i18n

Routing is configured from day one. **Czech only at launch; `/de/` is the likely
next locale.**

- `astro.config.mjs` declares `defaultLocale: 'cs'`, `locales: ['cs', 'de']`,
  `prefixDefaultLocale: false`. Czech lives at `/`, German will live at `/de/`.
- **No `fallback` is configured.** A fallback would generate `/de/*` pages full of
  Czech content the moment the locale exists   publishing untranslated pages and
  getting them indexed. German pages appear when German copy exists, not before.
- [`src/i18n/config.ts`](../src/i18n/config.ts) distinguishes `LOCALES` (what
  routing knows about) from `LIVE_LOCALES` (what has content and may be advertised).
  Only live locales get an `hreflang` tag and a language-switcher entry. Today that
  is Czech alone.
- UI chrome strings live in [`src/i18n/ui.ts`](../src/i18n/ui.ts). **Page content
  does not**   it belongs in content collections, so a price or a season date has
  one source of truth ([01-content.md](01-content.md) §6.6).
- Never concatenate translated fragments to build a sentence. Czech inflects; the
  case of a noun depends on the preposition in front of it, and a string built from
  parts will be grammatically wrong in a way no English-speaking developer will
  notice.
- Prices and dates format per locale. `30 000 Kč` uses a narrow no-break space in
  Czech convention; do not let a price wrap across two lines.

---

## 7. Accessibility floor

A floor, not a target. Nothing ships below it.

- **Visible keyboard focus** on every interactive element. A 2 px `--mosaz` outline
  at 2 px offset, set globally in `global.css`, checked on both the light and dark
  grounds. `outline: none` without a replacement is a review failure.
- **Real `<label>` on every form field**, associated by `for`/`id`. Not a
  placeholder, not an `aria-label` standing in for a visible one, not a floating
  label that vanishes when the field has content.
- **Contrast ≥ 4.5:1 for all text**, measured. The full table is in
  [02-design-system.md](02-design-system.md) §1.1, including the two brand
  combinations that fail (`--mosaz` on `--kamen` at 4.30:1, `--mosaz` on `--les` at
  3.00:1) and the derived tokens that fix them.
- **Czech `alt` text on every content image.** Decorative graphics get
  `aria-hidden="true"` and no alt.
- Skip link to `#obsah`, first in the tab order, on every page   already in
  `BaseLayout`.
- One `<h1>` per page; headings in order with no levels skipped.
- **Never colour alone** to carry meaning. This matters most in the availability
  calendar: `Volno` and `Obsazeno` need a pattern or glyph as well as a fill, and
  each cell needs an accessible name giving the date and its state.
- `prefers-reduced-motion` respected globally; with it on, the page must be
  complete and readable, nothing faded out and nothing missing.
- Keyboard-test the mobile navigation and the calendar specifically. Those are the
  two components where a keyboard trap will appear if one is going to.
- Do not claim accessibility the building does not have. See the
  `bezbariérové ubytování` question in [01-content.md](01-content.md) §5.9   a
  wrong access claim on a booking site is a person arriving at a door they cannot
  get through.

---

## 8. Deployment

Cloudflare Pages, building from the repository.

| | |
| --- | --- |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 20 or later (`engines` in `package.json`) |
| Production branch | `main` |

- Every pull request gets a Pages preview URL. Review on the preview, not locally  
  it is the only place `_redirects` and the real headers apply.
- `public/_redirects` carries the 301s from the old URL structure. They are indexed
  routes with years of history; do not remove them and do not downgrade them to
  302s.
- The two Workers deploy separately with `wrangler`, from `worker/`. They are not
  part of the Pages build.
- Set a cache rule for `/fonts/*` and `/_a/*` (hashed assets) of one year,
  immutable. HTML stays short-lived.
- DNS cutover last, after the preview has been checked on a phone, on a real
  connection, in Czech.

---

## 9. Conventions

**Files**

- Components `PascalCase.astro`, everything else `kebab-case`.
- Astro pages define the route; there is no separate router.
- Path alias `@/*` → `src/*` (`tsconfig.json`).

**CSS**

- Tokens or nothing. A hex code or a raw px in a component means a missing token  
  add it to `@theme` and reference it.
- Tailwind utilities for layout and spacing; a component `<style>` block when a
  rule is genuinely component-scoped. No global stylesheet other than
  `global.css`.
- No `!important` outside the `prefers-reduced-motion` reset.

**HTML**

- Real elements. `<button>` for actions, `<a>` for navigation, `<table>` for tabular
  data   the price list and the calendar are both tables and should be marked up as
  such.
- Czech `lang` is set on `<html>` by `BaseLayout`. If a fragment is in another
  language, mark it   `<span lang="de">`.

**Commits**

- Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`).
- One concern per commit. Font regeneration commits the two woff2 files and nothing
  else.

**Before a pull request**

```bash
npm run check          # astro check   types and templates
npm run build          # must succeed
npm run verify:fonts   # only needed if fonts changed
```

Plus the component checklist in [02-design-system.md](02-design-system.md) §7.
