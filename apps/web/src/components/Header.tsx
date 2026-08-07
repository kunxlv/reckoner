'use client';
import { useState } from 'react';
import type { CountryData } from '@reckoner/finance-data';
import { CountrySelector } from '@reckoner/ui';
import type { Country } from '@reckoner/ui';
import Link from 'next/link';
import { CategoryNav } from './CategoryNav';
import type { NavTool } from './CategoryNav';

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

/* ─── Icons ───────────────────────────────────────────────────────────────── */
const icn = (children: React.ReactNode) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const IconHome = () => icn(<><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9,22 9,12 15,12 15,22" /></>);
const IconFile = () => icn(<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></>);
const IconScale = () => icn(<><path d="M12 3v18" /><path d="M5 21h14" /><path d="M5 9L2 14h6L5 9z" /><path d="M19 7l-3 5h6l-3-5z" /><path d="M5 9h7" /><path d="M12 7h7" /></>);
const IconRefresh = () => icn(<><polyline points="23,4 23,10 17,10" /><polyline points="1,20 1,14 7,14" /><path d="M3.5 9a9 9 0 0114.15-4.36L23 10M1 14l5.35 5.36A9 9 0 0020.5 15" /></>);
const IconSplit = () => icn(<><rect x="3" y="3" width="7" height="18" /><rect x="14" y="3" width="7" height="18" /></>);
const IconDollar = () => icn(<><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></>);
const IconCar = () => icn(<><path d="M5 17H3v-5l2-5h14l2 5v5h-2" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></>);
const IconCard = () => icn(<><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></>);
const IconLayers = () => icn(<><polygon points="12,2 2,7 12,12 22,7" /><polyline points="2,17 12,22 22,17" /><polyline points="2,12 12,17 22,12" /></>);
const IconTrendUp = () => icn(<><polyline points="23,6 13.5,15.5 8.5,10.5 1,18" /><polyline points="17,6 23,6 23,12" /></>);
const IconUmbrella = () => icn(<><path d="M23 12a11.05 11.05 0 00-22 0zm-5 7a3 3 0 01-6 0v-7" /></>);
const IconTarget = () => icn(<><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>);
const IconZap = () => icn(<><polygon points="13,2 3,14 12,14 11,22 21,10 12,10" /></>);
const IconBarChart = () => icn(<><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>);

/* ─── Tool lists ──────────────────────────────────────────────────────────── */
const PROPERTY_TOOLS: NavTool[] = [
  { slug: 'mortgage-calculator', label: 'Mortgage Calculator', description: 'Monthly repayment on any loan size', icon: <IconHome /> },
  { slug: 'stamp-duty', label: 'Stamp Duty', description: 'Transfer tax on your property purchase', icon: <IconFile /> },
  { slug: 'affordability', label: 'Affordability', description: 'Find the home price you can afford', icon: <IconScale /> },
  { slug: 'refinance', label: 'Refinance Break-Even', description: 'When a lower rate starts saving you money', icon: <IconRefresh /> },
  { slug: 'rent-vs-buy', label: 'Rent vs Buy', description: 'Compare the true cost over time', icon: <IconSplit /> },
];

const LOANS_TOOLS: NavTool[] = [
  { slug: 'personal-loan', label: 'Personal Loan', description: 'Repayment and total cost for any loan', icon: <IconDollar /> },
  { slug: 'auto-loan', label: 'Auto Loan', description: 'Monthly payment on a car purchase', icon: <IconCar /> },
  { slug: 'credit-card-payoff', label: 'Credit Card Payoff', description: 'Time and interest to clear your balance', icon: <IconCard /> },
  { slug: 'debt-strategy', label: 'Debt Strategy', description: 'Avalanche or snowball payoff planner', icon: <IconLayers /> },
];

const SAVINGS_TOOLS: NavTool[] = [
  { slug: 'compound-interest', label: 'Compound Interest', description: 'Watch savings grow with compounding', icon: <IconTrendUp /> },
  { slug: 'retirement', label: 'Retirement Projection', description: 'Is your nest egg on track?', icon: <IconUmbrella /> },
  { slug: 'savings-goal', label: 'Savings Goal', description: 'How long to reach your target amount', icon: <IconTarget /> },
  { slug: 'fire-number', label: 'FIRE Number', description: 'The portfolio size to retire early', icon: <IconZap /> },
  { slug: 'investment-return', label: 'Investment Return', description: 'Annualised return on any investment', icon: <IconBarChart /> },
];

const MOBILE_SECTIONS = [
  { label: 'Mortgages & Property', path: 'property', tools: PROPERTY_TOOLS },
  { label: 'Loans & Debt', path: 'loans', tools: LOANS_TOOLS },
  { label: 'Savings & Investing', path: 'savings', tools: SAVINGS_TOOLS },
];

interface HeaderProps {
  currentCountry?: CountryData;
  allCountries: CountryData[];
  currentTool?: string;
}

export function Header({ currentCountry, allCountries, currentTool = '' }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const countries: Country[] = allCountries.map((c) => ({
    code: c.code,
    name: NAME_MAP[c.code] ?? c.code.toUpperCase(),
    currency: c.currency,
    flag: FLAG_MAP[c.code] ?? '🌍',
    href: currentTool ? `/${c.code}/${currentTool}` : `/${c.code}`,
    tier: c.tier,
  }));

  const current: Country = currentCountry
    ? {
        code: currentCountry.code,
        name: NAME_MAP[currentCountry.code] ?? currentCountry.code.toUpperCase(),
        currency: currentCountry.currency,
        flag: FLAG_MAP[currentCountry.code] ?? '🌍',
        href: currentTool
          ? `/${currentCountry.code}/${currentTool}`
          : `/${currentCountry.code}`,
        tier: currentCountry.tier,
      }
    : countries[0]!;

  return (
    <>
      <header
        style={{
          height: 56,
          borderBottom: '1px solid var(--color-hairline)',
          display: 'flex',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: 'var(--color-canvas)',
          zIndex: 40,
          transition: 'background 200ms, border-color 200ms',
        }}
      >
        <a href="#main" className="skip-nav">Skip to calculator</a>
        <div
          style={{
            width: '100%',
            maxWidth: 1160,
            margin: '0 auto',
            padding: '0 24px',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            alignItems: 'center',
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              textDecoration: 'none',
              color: 'var(--color-ink)',
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            reckoner.
          </Link>

          {/* Desktop nav — centred */}
          <div className="header-desktop-nav">
            <CategoryNav
              label="Mortgages & Property"
              categoryPath="property"
              tools={PROPERTY_TOOLS}
              currentCc={current.code}
            />
            <CategoryNav
              label="Loans & Debt"
              categoryPath="loans"
              tools={LOANS_TOOLS}
              currentCc={current.code}
            />
            <CategoryNav
              label="Savings & Investing"
              categoryPath="savings"
              tools={SAVINGS_TOOLS}
              currentCc={current.code}
            />
          </div>

          {/* Right side: country selector + hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
            <CountrySelector current={current} countries={countries} />
            <button
              type="button"
              className="header-hamburger"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`mobile-menu${mobileOpen ? ' open' : ''}`} aria-hidden={!mobileOpen}>
        {MOBILE_SECTIONS.map((section) => (
          <div key={section.path} style={{ borderBottom: '1px solid var(--color-hairline)' }}>
            <div style={{
              fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--color-ink-mid)',
              padding: '16px 24px 8px',
            }}>
              {section.label}
            </div>
            {section.tools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/${current.code}/${section.path}/${tool.slug}`}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 24px',
                  textDecoration: 'none',
                  borderTop: '1px solid var(--color-hairline-subtle)',
                }}
              >
                <div style={{
                  width: 36, height: 36, flexShrink: 0,
                  background: 'var(--color-ink-deep)',
                  color: 'var(--color-canvas)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {tool.icon}
                </div>
                <div>
                  <div style={{ fontSize: 15, color: 'var(--color-ink)', fontWeight: 500 }}>{tool.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-ink-mute)', marginTop: 2 }}>{tool.description}</div>
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
