import type { CountryCode, HreflangEntry } from './types';

const BASE = 'https://reckoner.tools';

const LOCALE_MAP: Record<CountryCode, string> = {
  us: 'en-US', uk: 'en-GB', ca: 'en-CA', au: 'en-AU',
  ie: 'en-IE', de: 'de-DE', nl: 'nl-NL', nz: 'en-NZ',
  fr: 'fr-FR', es: 'es-ES', sg: 'en-SG', in: 'en-IN',
};

export const COUNTRY_CODES: CountryCode[] = [
  'us', 'uk', 'ca', 'au', 'ie', 'de', 'nl', 'nz', 'fr', 'es', 'sg', 'in',
];

export function getMortgagePath(cc: CountryCode): string {
  return `/${cc}/mortgage-calculator`;
}

/** Full reciprocal hreflang cluster for a mortgage calculator page */
export function getMortgageHreflang(current: CountryCode): HreflangEntry[] {
  const entries: HreflangEntry[] = COUNTRY_CODES.map((cc) => ({
    hrefLang: LOCALE_MAP[cc],
    href: `${BASE}${getMortgagePath(cc)}`,
  }));
  entries.push({ hrefLang: 'x-default', href: `${BASE}/us/mortgage-calculator` });
  return entries;
}

export function getCanonical(cc: CountryCode): string {
  return `${BASE}${getMortgagePath(cc)}`;
}
