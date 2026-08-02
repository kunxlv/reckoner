import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCountry, getAllCountries, COUNTRY_CODES, fetchRate } from '@reckoner/finance-data';
import type { CountryCode } from '@reckoner/finance-data';
import { AdSlot } from '@reckoner/analytics';
import { Header } from '../../../src/components/Header';
import { Footer } from '../../../src/components/Footer';
import { RefinanceCalculator } from '../../../src/components/RefinanceCalculator';
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
    title: `Refinance / Remortgage Break-Even Calculator ${country.code.toUpperCase()} | Reckoner`,
    description: `Calculate how many months it takes to recover refinancing costs through lower monthly payments in ${country.code.toUpperCase()}. Free, no signup.`,
    robots: { index: true, follow: true },
  };
}

export default async function RefinancePage({ params }: { params: Promise<{ cc: string }> }) {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) notFound();

  const country = getCountry(cc as CountryCode);
  const allCountries = getAllCountries();

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
                Refinance / Remortgage Break-Even Calculator
              </h1>
              <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px', maxWidth: '72ch' }}>
                Enter your current loan details and the new rate on offer. The calculator works out your monthly saving
                and how many months it takes to recover the upfront refinancing costs -- your break-even point. Refinancing
                only makes sense if you plan to stay in the property long enough to pass it.
              </p>
              <RefinanceCalculator country={country} defaultRate={defaultRate} />

              <div
                style={{
                  border: '1px solid var(--color-hairline)',
                  padding: '16px 20px',
                  marginTop: 32,
                  maxWidth: '72ch',
                }}
              >
                <h2 style={{ fontSize: 15, fontWeight: 500, margin: '0 0 6px' }}>
                  End of fixed term versus mid-term refinancing
                </h2>
                <p style={{ fontSize: 15, lineHeight: 1.6, margin: 0, color: 'var(--color-ink-deep)' }}>
                  Refinancing at the end of a fixed-rate period typically carries no early repayment charge.
                  Breaking a fixed term early usually does -- often one to five percent of the outstanding balance.
                  Add any early repayment charge to the refinancing costs field to see the true break-even.
                </p>
              </div>
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
              Reference rate sourced from official central bank or national statistics body data where available.
              This is an estimate for illustrative purposes only. Confirm costs and rates with your lender before
              proceeding.
            </p>
          </div>
        </div>
      </main>
      <Footer countries={allCountries} />
    </>
  );
}
