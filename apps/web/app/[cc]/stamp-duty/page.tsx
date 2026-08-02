import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCountry, getAllCountries, COUNTRY_CODES, loadStampDutyRules } from '@reckoner/finance-data';
import type { CountryCode } from '@reckoner/finance-data';
import { asOf } from '@reckoner/rules-core';
import { AdSlot } from '@reckoner/analytics';
import { Header } from '../../../src/components/Header';
import { Footer } from '../../../src/components/Footer';
import { StampDutyCalculator } from '../../../src/components/StampDutyCalculator';
import { TrustDisclosures } from '../../../src/components/TrustDisclosures';

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return COUNTRY_CODES.map((cc) => ({ cc }));
}

export async function generateMetadata({ params }: { params: Promise<{ cc: string }> }): Promise<Metadata> {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) return {};
  const country = getCountry(cc as CountryCode);
  return {
    title: `Stamp Duty / Transfer Tax Calculator ${country.code.toUpperCase()} | Reckoner`,
    description: `Calculate stamp duty or transfer tax for a property purchase in ${country.code.toUpperCase()}. Free, sourced from official government rates.`,
    robots: { index: true, follow: true },
  };
}

const H1: Record<string, string> = {
  us: 'US Property Transfer Tax',
  uk: 'Stamp Duty Calculator (England and Northern Ireland)',
  ca: 'Canadian Land Transfer Tax Calculator',
  au: 'Australian Stamp Duty Calculator',
  ie: 'Irish Stamp Duty Calculator',
  de: 'German Grunderwerbsteuer Calculator',
  nl: 'Dutch Transfer Tax Calculator',
  nz: 'New Zealand Property Transfer',
  fr: 'French Droits de Mutation Calculator',
  es: 'Spanish ITP Calculator',
  sg: 'Singapore Buyer Stamp Duty Calculator',
  in: 'Indian Stamp Duty Calculator',
};

export default async function StampDutyPage({ params }: { params: Promise<{ cc: string }> }) {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) notFound();

  const country = getCountry(cc as CountryCode);
  const allCountries = getAllCountries();

  const versions = await loadStampDutyRules(cc as CountryCode);
  const ruleset = asOf(versions);

  const h1 = H1[cc] ?? 'Stamp Duty / Transfer Tax Calculator';

  return (
    <>
      <Header currentCountry={country} allCountries={allCountries} />
      <main id="main">
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '48px 24px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 48, alignItems: 'start' }}>
            <div>
              <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 12px' }}>
                {h1}
              </h1>
              {ruleset.tier > 1 && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-ink-mid)', border: '1px solid var(--color-hairline)', borderRadius: 100, padding: '3px 10px', marginBottom: 16 }}>
                  Standard model
                </div>
              )}
              <StampDutyCalculator country={country} ruleset={ruleset} />
            </div>
            <div style={{ position: 'sticky', top: 72 }}>
              <AdSlot width={300} height={600} />
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1160, margin: '32px auto 0', padding: '0 24px' }}>
          <AdSlot width={728} height={90} style={{ margin: '32px 0' }} />
          <TrustDisclosures convention={country.convention} rateResult={null} />

          <div style={{ maxWidth: '72ch', padding: '48px 0 32px' }}>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-ink-mid)', margin: 0 }}>
              Rates sourced from {ruleset.provenance.source}. Last reviewed {ruleset.provenance.lastReviewed}. Effective from {ruleset.provenance.effectiveFrom}. This is an estimate for illustrative purposes only. Confirm with your solicitor or conveyancer before completion.
            </p>
          </div>
        </div>
      </main>
      <Footer countries={allCountries} />
    </>
  );
}
