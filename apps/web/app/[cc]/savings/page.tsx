import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCountry, getAllCountries, COUNTRY_CODES } from '@reckoner/finance-data';
import type { CountryCode } from '@reckoner/finance-data';
import { Header } from '../../../src/components/Header';
import { Footer } from '../../../src/components/Footer';

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return COUNTRY_CODES.map((cc) => ({ cc }));
}

const NAME_MAP: Record<string, string> = {
  us: 'United States', uk: 'United Kingdom', ca: 'Canada', au: 'Australia',
  ie: 'Ireland', de: 'Germany', nl: 'Netherlands', nz: 'New Zealand',
  fr: 'France', es: 'Spain', sg: 'Singapore', in: 'India',
};

const TOOLS: Array<{ slug: string; label: string; description: string }> = [
  {
    slug: 'compound-interest',
    label: 'Compound Interest Calculator',
    description: 'Project how your savings grow across monthly, quarterly, annual, or continuous compounding, with optional regular contributions and inflation adjustment.',
  },
  {
    slug: 'retirement',
    label: 'Retirement Projection Calculator',
    description: 'Accumulate savings through your working years and model how long your portfolio lasts in retirement, with real vs nominal balance comparison.',
  },
  {
    slug: 'savings-goal',
    label: 'Savings Goal Calculator',
    description: 'How many years until your balance reaches a target amount with regular contributions. Shows surplus or shortfall at your chosen horizon.',
  },
  {
    slug: 'fire-number',
    label: 'FIRE Number Calculator',
    description: 'Calculate the portfolio size that funds your annual expenses at your chosen withdrawal rate, and project when your savings will reach that target.',
  },
  {
    slug: 'investment-return',
    label: 'Investment Return / CAGR Calculator',
    description: 'Find the compound annual growth rate between any two values, or project how an investment grows at a given CAGR over time.',
  },
];

export async function generateMetadata({ params }: { params: Promise<{ cc: string }> }): Promise<Metadata> {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) return {};
  const countryName = NAME_MAP[cc] ?? cc.toUpperCase();
  return {
    title: `Savings & Investing Calculators for ${countryName} | Reckoner`,
    description: `Compound interest, retirement, savings goal, FIRE number, and investment return calculators for ${countryName}. Free, no signup.`,
    alternates: { canonical: `https://reckoner.tools/${cc}/savings` },
    robots: { index: true, follow: true },
  };
}

export default async function SavingsHubPage({ params }: { params: Promise<{ cc: string }> }) {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) notFound();

  const country = getCountry(cc as CountryCode);
  const allCountries = getAllCountries();
  const countryName = NAME_MAP[cc] ?? cc.toUpperCase();

  return (
    <>
      <Header currentCountry={country} allCountries={allCountries} currentTool="savings" />
      <main id="main">
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '64px 24px' }}>
          <h1
            style={{
              fontSize: 36, fontWeight: 400, letterSpacing: '-0.03em',
              lineHeight: 1.1, margin: '0 0 12px',
            }}
          >
            Savings & investing calculators for {countryName}
          </h1>
          <p
            style={{
              fontSize: 16, lineHeight: 1.6, margin: '0 0 48px',
              maxWidth: '60ch', color: 'var(--color-ink-deep)',
            }}
          >
            Compound interest, retirement projections, and investment return — each using standard financial maths with no approximations.
          </p>

          <div style={{ display: 'grid', gap: 2 }}>
            {TOOLS.map((tool) => (
              <a
                key={tool.slug}
                href={`/${cc}/savings/${tool.slug}`}
                className="hub-tool-link"
              >
                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
                  {tool.label}
                </div>
                <div style={{ fontSize: 14, color: 'var(--color-ink-mid)', lineHeight: 1.5 }}>
                  {tool.description}
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>
      <Footer countries={allCountries} currentCc={cc} />
    </>
  );
}
