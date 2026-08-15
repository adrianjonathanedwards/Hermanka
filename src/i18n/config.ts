/**
 * Locale configuration. Mirrors the `i18n` block in astro.config.mjs — if you
 * change one, change the other.
 *
 * Czech is the default and is unprefixed: cs lives at `/`, de will live at `/de/`.
 */

export const DEFAULT_LOCALE = 'cs' as const;

/** Every locale the routing knows about. */
export const LOCALES = ['cs', 'de'] as const;
export type Locale = (typeof LOCALES)[number];

/**
 * Locales that actually have content and may be advertised to users and to search
 * engines. Only these get a language switcher entry and an hreflang tag.
 *
 * `de` is configured but NOT live: German copy does not exist yet
 * (docs/01-content.md §10). Add it here on the day the translations land, and not
 * before — an hreflang pointing at a Czech page claiming to be German is worse
 * than no hreflang at all.
 */
export const LIVE_LOCALES: readonly Locale[] = ['cs'];

/** `lang` attribute + `hreflang` value for each locale. */
export const HTML_LANG: Record<Locale, string> = {
  cs: 'cs',
  de: 'de',
};

/** Language switcher labels, each written in its own language. */
export const LOCALE_LABEL: Record<Locale, string> = {
  cs: 'Česky',
  de: 'Deutsch',
};
