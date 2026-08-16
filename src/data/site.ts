/**
 * Contact and identity constants. One source of truth — nothing below may be
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
   * explicit that one must never end a line — a Czech line ending in `u` reads
   * as an error, not as a typographic nicety. This string is set in the footer
   * and in a narrow contact card, both of which wrap on a phone, so it is one of
   * the few places on the site where the break would actually happen.
   */
  obec: 'Heřmanice u Králík',

  /** Displayed in Czech convention; `telHref` is the dialable form. */
  telefon: '+420 603 285 524',
  telHref: '+420603285524',

  /**
   * TODO(client): there is NO published email address anywhere on the current
   * site — only a third-party form. Launch-blocking, docs/01-content.md §9 item 13.
   */
  email: null as string | null,

  gps: {
    label: '50.13088N, 16.75827E',
    lat: 50.13088,
    lon: 16.75827,
  },
} as const;

/** Map link for the GPS coordinates. Opens a map, embeds nothing. */
export const mapyUrl = `https://mapy.com/zakladni?q=${SITE.gps.lat}%2C${SITE.gps.lon}`;

/**
 * TODO(worker): the inquiry form posts here. The Worker is not written yet —
 * see worker/README.md and docs/03-tech.md §2. Until it exists the form will
 * fail to submit; the markup, labels and no-JS behaviour are what this pass
 * delivers.
 */
export const POPTAVKA_ENDPOINT = '/api/poptavka';

/** Primary navigation. Used by both the header and the footer. */
export const NAV = [
  { href: '/chalupa', label: 'Chalupa' },
  { href: '/terminy-a-ceny', label: 'Termíny a ceny' },
  { href: '/okoli', label: 'Okolí' },
  { href: '/galerie', label: 'Galerie' },
  { href: '/kontakt', label: 'Kontakt' },
] as const;
