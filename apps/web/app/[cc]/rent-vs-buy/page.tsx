import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCountry, getAllCountries, COUNTRY_CODES, fetchRate } from '@reckoner/finance-data';
import type { CountryCode } from '@reckoner/finance-data';
import { AdSlot } from '@reckoner/analytics';
import { Header } from '../../../src/components/Header';
import { Footer } from '../../../src/components/Footer';
import { RentVsBuyCalculator } from '../../../src/components/RentVsBuyCalculator';
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
    title: `Rent vs Buy Calculator ${country.code.toUpperCase()} | Reckoner`,
    description: `Compare the 10-year financial outcome of renting versus buying a home in ${country.code.toUpperCase()}. Accounts for mortgage payments, deposit opportunity cost, and property appreciation. Free, no signup.`,
    robots: { index: true, follow: true },
  };
}

export default async function RentVsBuyPage({ params }: { params: Promise<{ cc: string }> }) {
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
                Rent vs Buy Calculator
              </h1>
              <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 24px', maxWidth: '72ch' }}>
                Compare the 10-year financial outcome of renting versus buying. The calculator weighs your mortgage
                payment and the opportunity cost of tying up a deposit against total rent paid and the equity you
                accumulate through property appreciation. The result is highly sensitive to assumptions.
              </p>
              <div
                style={{
                  border: '1px solid var(--color-hairline)',
                  padding: '16px 20px',
                  marginBottom: 32,
                  maxWidth: '72ch',
                }}
              >
                <p style={{ fontSize: 15, lineHeight: 1.6, margin: 0, color: 'var(--color-ink-deep)' }}>
                  The result is highly sensitive to the assumed appreciation rate and investment return. Small changes
                  to these inputs significantly change the outcome. Use this as a starting point, not a conclusion.
                </p>
              </div>
              <RentVsBuyCalculator country={country} defaultRate={defaultRate} />
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
