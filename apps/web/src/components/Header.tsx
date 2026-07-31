import type { CountryData } from '@reckoner/finance-data';
import { CountrySelector } from '@reckoner/ui';
import type { Country } from '@reckoner/ui';
import Link from 'next/link';

const FLAG_MAP: Record<string, string> = {
  us: '🇺🇸', uk: '🇬🇧', ca: '🇨🇦', au: '🇦🇺', ie: '🇮🇪',
  de: '🇩🇪', nl: '🇳🇱', nz: '🇳🇿', fr: '🇫🇷', es: '🇪🇸',
  sg: '🇸🇬', in: '🇮🇳',
};

const NAME_MAP: Record<string, string> = {
  us: 'United States', uk: 'United Kingdom', ca: 'Canada', au: 'Australia',
  ie: 'Ireland', de: 'Germany', nl: 'Netherlands', nz: 'New Zealand',
  fr: 'France', es: 'Spain', sg: 'Singapore', in: 'India',
};

interface HeaderProps {
  currentCountry?: CountryData;
  allCountries: CountryData[];
}

export function Header({ currentCountry, allCountries }: HeaderProps) {
  const countries: Country[] = allCountries.map((c) => ({
    code: c.code,
    name: NAME_MAP[c.code] ?? c.code.toUpperCase(),
    currency: c.currency,
    flag: FLAG_MAP[c.code] ?? '🌍',
    href: `/${c.code}/mortgage-calculator`,
    tier: c.tier,
  }));

  const current: Country = currentCountry
    ? {
        code: currentCountry.code,
        name: NAME_MAP[currentCountry.code] ?? currentCountry.code.toUpperCase(),
        currency: currentCountry.currency,
        flag: FLAG_MAP[currentCountry.code] ?? '🌍',
        href: `/${currentCountry.code}/mortgage-calculator`,
        tier: currentCountry.tier,
      }
    : countries[0]!;

  return (
    <header style={{ height: 56, borderBottom: '1px solid #dddddd', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, background: '#ffffff', zIndex: 40 }}>
      <a href="#main" className="skip-nav">
        Skip to calculator
      </a>
      <div style={{ width: '100%', maxWidth: 1160, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#000000', fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
            reckoner.
          </Link>
          <span style={{ fontSize: 14, color: '#5a5a5a', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            Tools
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
              <path d="M1 1l4 4 4-4" stroke="#5a5a5a" strokeWidth="1.5" />
            </svg>
          </span>
        </div>
        <CountrySelector current={current} countries={countries} />
      </div>
    </header>
  );
}
