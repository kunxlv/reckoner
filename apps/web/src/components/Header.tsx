import type { CountryData } from '@reckoner/finance-data';
import { CountrySelector } from '@reckoner/ui';
import type { Country } from '@reckoner/ui';
import Link from 'next/link';
import { PropertyNav } from './PropertyNav';

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
  currentTool?: string;
}

export function Header({ currentCountry, allCountries, currentTool = 'mortgage-calculator' }: HeaderProps) {
  const countries: Country[] = allCountries.map((c) => ({
    code: c.code,
    name: NAME_MAP[c.code] ?? c.code.toUpperCase(),
    currency: c.currency,
    flag: FLAG_MAP[c.code] ?? '🌍',
    href: `/${c.code}/${currentTool}`,
    tier: c.tier,
  }));

  const current: Country = currentCountry
    ? {
        code: currentCountry.code,
        name: NAME_MAP[currentCountry.code] ?? currentCountry.code.toUpperCase(),
        currency: currentCountry.currency,
        flag: FLAG_MAP[currentCountry.code] ?? '🌍',
        href: `/${currentCountry.code}/${currentTool}`,
        tier: currentCountry.tier,
      }
    : countries[0]!;

  return (
    <header style={{
      height: 56,
      borderBottom: '1px solid var(--color-hairline)',
      display: 'flex',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      background: 'var(--color-canvas)',
      zIndex: 40,
      transition: 'background 200ms, border-color 200ms',
    }}>
      <a href="#main" className="skip-nav">Skip to calculator</a>
      <div style={{
        width: '100%', maxWidth: 1160, margin: '0 auto', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'var(--color-ink)', fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
            reckoner.
          </Link>
          <PropertyNav currentCc={current.code} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <CountrySelector current={current} countries={countries} />
        </div>
      </div>
    </header>
  );
}
