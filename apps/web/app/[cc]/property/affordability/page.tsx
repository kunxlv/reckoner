import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCountry, getAllCountries, COUNTRY_CODES, fetchRate, loadAffordabilityRules } from '@reckoner/finance-data';
import type { CountryCode } from '@reckoner/finance-data';
import { asOf } from '@reckoner/rules-core';
import { AdSlot } from '@reckoner/analytics';
import { getToolMetadata } from '@reckoner/seo';
import { Header } from '../../../../src/components/Header';
import { Footer } from '../../../../src/components/Footer';
import { AffordabilityCalculator } from '../../../../src/components/AffordabilityCalculator';
import { TrustDisclosures } from '../../../../src/components/TrustDisclosures';

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return COUNTRY_CODES.map((cc) => ({ cc }));
}

export async function generateMetadata({ params }: { params: Promise<{ cc: string }> }): Promise<Metadata> {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) return {};
  const country = getCountry(cc as CountryCode);
  const h1 = COUNTRY_H1[cc] ?? 'Affordability Calculator';
  return getToolMetadata(
    cc as CountryCode,
    'property',
    'affordability',
    `${h1} | Reckoner`,
    `Calculate how much you can borrow in ${country.code.toUpperCase()} using official affordability rules. Free, no signup.`,
  );
}

const COUNTRY_H1: Record<string, string> = {
  us: 'How Much Can I Borrow? (US Mortgage)',
  uk: 'UK Mortgage Affordability Calculator',
  ca: 'Canadian Mortgage Affordability Calculator',
  au: 'Australian Borrowing Capacity Calculator',
  ie: 'Irish Mortgage Affordability Calculator',
  de: 'German Mortgage Affordability Calculator',
  nl: 'Dutch Mortgage Affordability Calculator',
  nz: 'New Zealand Borrowing Capacity Calculator',
  fr: 'French Mortgage Affordability Calculator',
  es: 'Spanish Mortgage Affordability Calculator',
  sg: 'Singapore Home Loan Affordability Calculator',
  in: 'Home Loan Eligibility Calculator (India)',
};

const ANSWER_FIRST: Record<string, string> = {
  us: 'US lenders use debt-to-income (DTI) ratios rather than income multiples. The conventional limit is 28% of gross monthly income for housing costs and 36-43% for total debt. A household earning $120,000 a year can typically borrow around $400,000-$450,000 on a 30-year mortgage at current rates.',
  uk: 'UK lenders typically cap borrowing at 4.0 to 4.5 times gross income, though some will stretch to 5.5 times for high earners. The FCA requires affordability to be stress-tested at a rate 3% above the revert rate, so your actual limit is set by whichever binds first: the income multiple or the stressed payment capacity.',
  ca: 'Canadian lenders apply the Mortgage Qualification Rate (MQR), the higher of your contract rate plus 2% or 5.25%. A household earning CA$120,000 qualifying at the stress rate can borrow approximately CA$480,000 on a 25-year amortization. The stress test applies to both insured and uninsured mortgages.',
  au: 'Australian lenders must assess affordability at your contract rate plus a 3% APRA buffer. A household earning AU$120,000 can typically borrow approximately AU$480,000. The buffer is why lenders quote a lower figure than the rate you pay would suggest.',
  ie: 'Central Bank rules cap first-time buyers at 4 times gross income and 90% LTV. Subsequent buyers are limited to 3.5 times income and 90% LTV. Buy-to-let investors face a 70% LTV limit. Select your buyer type below to see which constraint binds for your situation.',
  de: 'German lenders typically allow up to 30-35% of net income for mortgage repayments. Unlike Ireland or Australia, there is no formal regulatory cap. Individual banks set their own criteria. This calculator uses a 32% net-income coverage ratio as a representative estimate.',
  nl: 'Dutch lenders use the Loan-to-Income (LTI) ratio from the Nationale Hypotheekgarantie (NHG) table, which adjusts by income bracket and interest rate. Energy-efficient homes can borrow up to €9,000 more than the standard cap. This calculator applies the representative LTI multiple for your income band.',
  nz: 'New Zealand banks assess affordability using a stress-tested rate typically 2-3% above the contract rate. LVR restrictions limit most owner-occupiers to 80% LVR, requiring a 20% deposit. First-home buyers with Kiwisaver can sometimes access 90% LVR products.',
  fr: "French lenders cap total monthly debt repayments at 35% of gross income (taux d'endettement), including the mortgage and any existing loans. Banks use gross income before tax. The 35% cap is set by the HCSF, and banks may grant exceptions for up to 20% of their production, prioritised for primary residence purchases.",
  es: 'Spanish lenders typically limit monthly mortgage payments to 30-40% of net income. Since 2022, the mortgage law requires stress testing for variable-rate loans. Most borrowers in Spain take variable-rate mortgages, which introduces refinancing risk over the term.',
  sg: 'MAS rules cap the Total Debt Servicing Ratio at 55% of gross monthly income. All monthly debt commitments combined, including mortgage, car, personal, and credit card minimums, cannot exceed 55%. HDB loans carry a stricter 30% Mortgage Servicing Ratio cap. Enter your existing debts below to see the binding constraint.',
  in: 'Indian banks typically lend up to 5-6 times annual income, with monthly EMI limited to 40-50% of net monthly income. The exact limit depends on the lender and your credit score. Floating-rate home loans carry no prepayment penalty for individual borrowers under RBI rules.',
};

const LOCAL_CALLOUT: Record<string, { heading: string; body: string } | null> = {
  us: { heading: 'US uses DTI, not income multiples', body: 'The conventional front-end DTI limit is 28% of gross monthly income for housing costs. The back-end DTI limit (all debt combined) should not exceed 36-43% depending on loan type and lender. Fannie Mae conforming loans allow up to 45% with compensating factors such as large reserves or a strong credit score.' },
  uk: { heading: 'The stress test sets the real limit', body: "UK lenders must stress test affordability at approximately 3% above the revert rate, not the initial fixed rate. If your lender's standard variable rate is 8% and you're taking a 2-year fix at 5%, the stress test runs at 11%. This is why FCA affordability checks can produce a lower figure than a simple income multiple suggests." },
  ca: { heading: 'The stress test applies to all lenders', body: "OSFI's B-20 guideline requires the MQR stress test for all uninsured mortgages, and CMHC requires it for insured mortgages. Credit unions and some provincially regulated lenders have historically been exempted but have largely adopted similar standards. Any lender advertising a bypass of the stress test warrants scrutiny." },
  au: { heading: "APRA's buffer is why you can borrow less than you think", body: 'APRA requires banks to add 3 percentage points to the loan rate for serviceability assessment. At a 6% contract rate, the bank assesses you at 9%. The buffer was raised from 2.5% to 3.0% in October 2021 and has not been reduced since, even as rates stabilised. It is the primary reason borrowing capacity is lower than the rate alone would suggest.' },
  ie: { heading: 'Exceptions exist but are rationed', body: 'Central Bank rules allow lenders to grant a limited number of exceptions each year. Up to 15% of new first-time buyer lending can exceed the 4x cap, and up to 5% can exceed the 3.5x cap for subsequent buyers. Banks ration these: expect to need a strong financial profile, stable income, and substantial savings history.' },
  de: { heading: 'Eigenkapital (equity) matters as much as income', body: 'German lenders place as much weight on your down payment as on income. Bringing 20-30% equity typically unlocks better rates and higher loan amounts. The Nebenkosten (purchase costs) of 7-12% are expected to come from savings, not the loan. Most German lenders will not advance more than 80-90% LTV for standard borrowers.' },
  nl: { heading: 'Energy label can increase your maximum borrowing', body: 'Dutch lenders allow up to €9,000 additional borrowing for energy-efficient homes (label A or above). The NHG guarantee allows lenders to advance up to 100% LTV on homes up to €435,000 (2025), which also reduces the interest rate by 0.5-0.7%. These factors can meaningfully shift your borrowing capacity on a Dutch property.' },
  nz: { heading: 'LVR restrictions cap most buyers at 80%', body: 'Reserve Bank LVR rules limit most owner-occupiers to 80% LVR (20% deposit). First-home buyers can access 90% LVR products. Investors face a stricter 65% LVR limit. Kiwisaver withdrawals and the First Home Grant can supplement deposits but do not override the LVR caps set by the Reserve Bank.' },
  fr: { heading: "The 35% taux d'endettement is a hard cap", body: 'The HCSF limits total monthly debt repayments to 35% of gross income with a maximum 25-year term (27 years for new builds). Banks may grant exceptions for up to 20% of production, prioritised for primary residence purchases. Unlike Australian or UK stress tests, the 35% cap uses the actual contract rate, not a stressed rate.' },
  es: { heading: 'Variable rates dominate the Spanish market', body: 'Most Spanish mortgages are variable rate, benchmarked to the 12-month Euribor plus a spread. The Ley de Crédito Inmobiliario (2019) introduced mandatory stress testing for variable-rate loans. Borrowers should model repayments at Euribor + 2-3% above current levels to assess worst-case affordability over the term.' },
  sg: { heading: 'TDSR and MSR work together', body: 'The Total Debt Servicing Ratio (55%) covers all loans: mortgage, car, personal, and credit card minimum payments. The Mortgage Servicing Ratio (30%) applies separately to HDB loans and covers only the mortgage. Private property buyers face only TDSR. Existing car loans and personal loans reduce what you can borrow before reaching the mortgage limit.' },
  in: { heading: 'Prepayment is where the real saving is', body: 'Floating-rate home loans in India carry no prepayment penalty for individual borrowers under RBI rules. A lump-sum prepayment of Rs 5 lakh in year 3 on a Rs 80 lakh, 20-year loan at 8.5% removes approximately Rs 27 lakh from the total interest bill. Early lump-sum prepayments are particularly effective because almost all of each EMI in the early years is interest.' },
};

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

  const h1 = COUNTRY_H1[cc] ?? 'How Much Can I Borrow?';
  const answerFirst = ANSWER_FIRST[cc] ?? '';
  const callout = LOCAL_CALLOUT[cc] ?? null;

  return (
    <>
      <Header currentCountry={country} allCountries={allCountries} currentTool="property/affordability" />
      <main id="main">
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '48px 24px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 48, alignItems: 'start' }}>
            <div>
              <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 12px' }}>
                {h1}
              </h1>
              <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px', maxWidth: '72ch' }}>
                {answerFirst}
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
          <TrustDisclosures context={{ type: 'affordability', method: ruleset.method }} rateResult={rateResult} />
          <div style={{ maxWidth: '72ch', padding: '48px 0 32px' }}>
            {callout && (
              <div style={{ border: '1px solid var(--color-hairline)', padding: '16px 20px', marginBottom: 32 }}>
                <h2 style={{ fontSize: 15, fontWeight: 500, margin: '0 0 6px' }}>{callout.heading}</h2>
                <p style={{ fontSize: 15, lineHeight: 1.6, margin: 0, color: 'var(--color-ink-deep)' }}>{callout.body}</p>
              </div>
            )}
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-ink-mid)', margin: 0 }}>
              Rules sourced from {ruleset.provenance.source}. Last reviewed {ruleset.provenance.lastReviewed}.
            </p>
          </div>
        </div>
      </main>
      <Footer countries={allCountries} currentCc={cc} />
    </>
  );
}
