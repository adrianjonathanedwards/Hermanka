import { DEFAULT_LOCALE, LOCALES, type Locale } from './config';

/**
 * The locale a URL belongs to. Czech is unprefixed, so anything that is not
 * `/<locale>/…` is Czech.
 */
export function getLocaleFromUrl(url: URL): Locale {
  const [, first] = url.pathname.split('/');
  return (LOCALES as readonly string[]).includes(first) && first !== DEFAULT_LOCALE
    ? (first as Locale)
    : DEFAULT_LOCALE;
}

/**
 * Prefixes a site-root path with the locale. The default locale is never
 * prefixed, matching `routing.prefixDefaultLocale: false` in astro.config.mjs.
 *
 *   localePath('/ubytovani', 'cs') → '/ubytovani'
 *   localePath('/ubytovani', 'de') → '/de/ubytovani'
 */
export function localePath(path: string, locale: Locale = DEFAULT_LOCALE): string {
  const clean = '/' + path.replace(/^\/+/, '').replace(/\/+$/, '');
  if (locale === DEFAULT_LOCALE) return clean === '/' ? '/' : clean;
  return clean === '/' ? `/${locale}` : `/${locale}${clean}`;
}

/** Strips the locale prefix, giving the path as it would be in the default locale. */
export function stripLocale(pathname: string): string {
  const [, first, ...rest] = pathname.split('/');
  if ((LOCALES as readonly string[]).includes(first) && first !== DEFAULT_LOCALE) {
    return '/' + rest.join('/');
  }
  return pathname;
}
