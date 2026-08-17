/**
 * UI strings   chrome only. Navigation, buttons, form labels, anything that is not
 * page content.
 *
 * Page CONTENT does not belong here; it belongs in content collections, so that a
 * price or a season date has one source of truth (docs/01-content.md §6.6).
 *
 * Czech copy is authoritative. Every string below is transcribed from the current
 * site or specified in docs/01-content.md   check there before inventing wording,
 * and note which strings are still NEEDS CLIENT INPUT.
 */

import { DEFAULT_LOCALE, type Locale } from './config';

export const ui = {
  cs: {
    'site.name': 'Chalupa Heřmanka',

    'nav.chalupa': 'Chalupa',
    'nav.terminy': 'Termíny a ceny',
    'nav.okoli': 'Okolí',
    'nav.galerie': 'Galerie',
    'nav.kontakt': 'Kontakt',
    'nav.skipToContent': 'Přeskočit na obsah',
    'nav.menu': 'Menu',
    'nav.close': 'Zavřít',

    // NEEDS CLIENT INPUT   final CTA wording (docs/01-content.md §3.1)
    'cta.inquiry': 'Nezávazná poptávka',

    // Availability calendar legend   the four states carried over from the
    // e-chalupy widget being replaced (docs/01-content.md §6.5)
    'calendar.free': 'Volno',
    'calendar.booked': 'Obsazeno',
    'calendar.arrival': 'Den příjezdu',
    'calendar.departure': 'Den odjezdu',
    'calendar.legend': 'Legenda',

    // Inquiry form (docs/01-content.md §8.2)
    'form.email': 'Váš email',
    'form.name': 'Vaše jméno',
    'form.phone': 'Telefon',
    'form.dates': 'Požadovaný termín',
    'form.datesHint': 'např. 20.–27. 9. 2026',
    'form.adults': 'Počet dospělých',
    'form.children': 'Počet dětí',
    'form.message': 'Text zprávy',
    'form.copyToMe': 'Poslat mi na email kopii',
    'form.required': 'povinná položka',
    // NEEDS CLIENT INPUT   final wording. The old button said "ODESLAT EMAIL",
    // which names the transport rather than the outcome.
    'form.submit': 'Odeslat poptávku',
    'form.success': 'Děkujeme, poptávku jsme přijali. Ozveme se vám co nejdříve.',
    'form.error': 'Poptávku se nepodařilo odeslat. Zavolejte nám prosím na +420 603 285 524.',

    'footer.rights': 'Všechna práva vyhrazena',
  },

  /**
   * German is a stub. `LIVE_LOCALES` does not include `de`, so nothing here is
   * reachable yet   the keys exist so that adding the locale is a translation job
   * with a visible checklist, not a hunt through components.
   */
  de: {
    'site.name': 'Chalupa Heřmanka',
  },
} as const;

type UiKey = keyof (typeof ui)[typeof DEFAULT_LOCALE];

/**
 * Returns a lookup for the given locale, falling back to Czech for any key that
 * has not been translated yet.
 */
export function useTranslations(locale: Locale) {
  return function t(key: UiKey): string {
    const dict = ui[locale] as Partial<Record<UiKey, string>>;
    return dict[key] ?? ui[DEFAULT_LOCALE][key];
  };
}
