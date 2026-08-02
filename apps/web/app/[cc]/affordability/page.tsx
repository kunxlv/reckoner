import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCountry, getAllCountries, COUNTRY_CODES, fetchRate, loadAffordabilityRules } from '@reckoner/finance-data';
import type { CountryCode } from '@reckoner/finance-data';
import { asOf } from '@reckoner/rules-core';
import { AdSlot } from '@reckoner/analytics';
import { Header } from '../../../src/components/Header';
import { Footer } from '../../../src/components/Footer';
import { AffordabilityCalculator } from '../../../src/components/AffordabilityCalculator';
import { TrustDisclosures } from '../../../src/components/TrustDisclosures';

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return COUNTRY_CODES.map((cc) => ({ cc }));
}

export async function generateMetadata({ params }: { params: Promise<{ cc: string }> }): Promise<Metadata> {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) return {};
  return {
    title: `Affordability Calculator — How Much Can I Borrow? | Reckoner`,
    description: `Find out how much you can borrow based on your income and the official lending rules in ${cc.toUpperCase()}. Free, no signup.`,
    robots: { index: true, follow: true },
  };
}

export default async function AffordabilityPage({ params }: { params: Promise<{ cc: string }> }) {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) notFound();

  const country = getCountry(cc as CountryCode);
  const allCountries = getAllCountries();

  const versions = await loadAffordabilityRules(cc as CountryCode);
  const ruleset = asOf(versions);

  let rateResult = null;
  try { rateResult = await fetchRate(cc as CountryCode); } catch { /* use default */ }

  const defaultRate = rateResult?.value ?? country.defaults.rate;

  return (
    <>
      <Header currentCountry={country} allCountries={allCountries} />
      <main id="main">
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '48px 24px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 48, alignItems: 'start' }}>
            <div>
              <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 12px' }}>
                How Much Can I Borrow?
              </h1>
              <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px', maxWidth: '72ch' }}>
                Enter your income and the calculator applies the official lending rules for {country.code.toUpperCase()} to estimate your maximum borrowing.
              </p>
              {country.tier > 1 && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-ink-mid)', border: '1px solid var(--color-hairline)', borderRadius: 100, padding: '3px 10px', marginBottom: 16 }}>
                  Standard model
                </div>
              )}
              <AffordabilityCalculator country={country} ruleset={ruleset} defaultRate={defaultRate} />
            </div>
            <div style={{ position: 'sticky', top: 72 }}>
              <AdSlot width={300} height={600} />
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1160, margin: '32px auto 0', padding: '0 24px' }}>
          <AdSlot width={728} height={90} style={{ margin: '32px 0' }} />
          <TrustDisclosures convention={country.convention} rateResult={rateResult} />
          <div style={{ maxWidth: '72ch', padding: '48px 0 32px' }}>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-ink-mid)', margin: 0 }}>
              Rules sourced from {ruleset.provenance.source}. Last reviewed {ruleset.provenance.lastReviewed}.
            </p>
          </div>
        </div>
      </main>
      <Footer countries={allCountries} />
    </>
  );
}
