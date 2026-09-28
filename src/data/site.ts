/**
 * Contact and identity constants. One source of truth   nothing below may be
 * retyped into a component.
 *
 * Everything here is transcribed from the current site's /kontakt/ page
 * (docs/01-content.md §8.1).
 */

export const SITE = {
  name: 'Chalupa Heřmanka',
  /**
   * ⚠ The space before `Králík` below is a HARD space, U+00A0, and it is
   * invisible in every editor. Do not retype the line.
   *
   * `u` is a single-letter preposition, and docs/02-design-system.md §2.6 is
   * explicit that one must never end a line   a Czech line ending in `u` reads
   * as an error, not as a typographic nicety. This string is set in the footer
   * and in a narrow contact card, both of which wrap on a phone, so it is one of
   * the few places on the site where the break would actually happen.
   */
  obec: 'Heřmanice u Králík',

  /** Displayed in Czech convention; `telHref` is the dialable form. */
  telefon: '+420 603 285 524',
  telHref: '+420603285524',

  email: 'nemeh@seznam.cz' as string | null,

  gps: {
    label: '50.13088N, 16.75827E',
    lat: 50.13088,
    lon: 16.75827,
  },
} as const;

/** Map link for the GPS coordinates. Opens a map, embeds nothing. */
export const mapyUrl = `https://mapy.com/zakladni?q=${SITE.gps.lat}%2C${SITE.gps.lon}`;

/**
 * The cottage on YouTube. Every "Přehrát video" on the site opens `aktualni`;
 * `dalsi`, `treti` and `puvodni` are shown on /galerie only, beside it.
 *
 * LINKS, NEVER EMBEDS   same as the map above. tools/headers.mjs ships
 * `frame-src 'none'`, so an iframe would not even render, and the reasons it
 * is set that way are in docs/03-tech.md "Video".
 */
export const VIDEO = {
  /** "Chalupa Heřmanka | Chalupa k pronájmu pod Kralickým Sněžníkem", September 2026. */
  aktualni: 'iQHyvmK9ld0',
  /** "Chalupa Heřmanka 🌲 Heřmanice u Králík, Orlické hory", September 2026,
      same channel. A walk through the rooms rather than a captioned promo. */
  dalsi: 'Pwx0PrVQfWI',
  /** "Heřmanka", September 2026, same channel again   a third, shorter cut,
      largely the same footage as `dalsi` (the mezonetová ložnice with its
      ladder and balcony door recurs in both). Kept as its own tile rather
      than folded into `dalsi`: the client supplied it separately and it is
      not our call to decide one of the two is redundant. */
  treti: '4H2-jrfoPjE',
  /** "Chalupa Heřmanka", the 2019 site's video. */
  puvodni: '-U_w_kwtzjI',
} as const;

export const videoUrl = (id: string) => `https://www.youtube.com/watch?v=${id}&autoplay=1`;

/**
 * The 360° walkthrough: a separate Pannellum site, 33 panoramas. Linked and
 * opened in a new window, not framed   for the same `frame-src 'none'`, and
 * because a panorama viewer wants the whole screen and its own full-screen
 * button, not a box inside a section.
 */
export const PROHLIDKA_URL = 'https://prohlidka-hermanka.netlify.app/';

/**
 * The inquiry form posts straight to Web3Forms   https://web3forms.com   rather
 * than the Cloudflare Worker described in worker/README.md and docs/03-tech.md
 * §2. Web3Forms accepts a plain `<form method="POST">` submission and performs
 * the redirect itself, so the no-JS requirement in docs/03-tech.md §2 still
 * holds without us writing or hosting anything.
 *
 * If the Worker + Resend path is ever built, repoint this at it and remove the
 * `form-action` entry for api.web3forms.com in tools/headers.mjs.
 */
export const POPTAVKA_ENDPOINT = 'https://api.web3forms.com/submit';

/**
 * Web3Forms access key   identifies which Web3Forms account/inbox receives the
 * submission. Not a bearer secret: it is designed to sit in public HTML (it
 * only authorises a form to submit, not to read anything back), so it is safe
 * here alongside the other public site constants.
 */
export const WEB3FORMS_ACCESS_KEY = 'a9d14851-597f-4e30-82fa-57f01dff3801';

/** Primary navigation. Used by both the header and the footer. */
export const NAV = [
  { href: '/ubytovani', label: 'Ubytování' },
  { href: '/terminy-a-ceny', label: 'Termíny a ceny' },
  { href: '/okoli', label: 'Okolí' },
  { href: '/galerie', label: 'Galerie' },
  { href: '/kontakt', label: 'Kontakt' },
] as const;
