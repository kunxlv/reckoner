import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCountry, getAllCountries, COUNTRY_CODES } from '@reckoner/finance-data';
import type { CountryCode } from '@reckoner/finance-data';
import { getToolMetadata } from '@reckoner/seo';
import { AdSlot } from '@reckoner/analytics';
import { CalculatorSchema } from '../../../../src/components/CalculatorSchema';
import { Header } from '../../../../src/components/Header';
import { Footer } from '../../../../src/components/Footer';
import { PersonalLoanCalculator } from '../../../../src/components/PersonalLoanCalculator';
import { TrustDisclosures } from '../../../../src/components/TrustDisclosures';

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return COUNTRY_CODES.map((cc) => ({ cc }));
}

const H1: Record<string, string> = {
  us: 'Personal Loan Calculator',
  uk: 'Personal Loan Calculator',
  ca: 'Personal Loan Calculator',
  au: 'Personal Loan Calculator',
  ie: 'Personal Loan Calculator',
  de: 'Privatkredit Rechner',
  nl: 'Persoonlijke Lening Berekenen',
  nz: 'Personal Loan Calculator',
  fr: 'Calculateur de Prêt Personnel',
  es: 'Calculadora de Préstamo Personal',
  sg: 'Personal Loan Calculator',
  in: 'Personal Loan EMI Calculator',
};

const INTRO: Record<string, string> = {
  us: 'Enter your loan amount, interest rate and term to see your monthly payment, total interest, and full repayment schedule. If your lender charges an origination fee, add it to see your true APR.',
  uk: 'Enter your loan amount, interest rate and term to see your monthly payment, total interest, and full repayment schedule. Adding a fee shows your true APR.',
  ca: 'Enter your loan amount, interest rate and term. Canadian personal loans typically use monthly compounding on the stated rate.',
  au: 'Enter your loan amount, interest rate and term. Australian personal loan rates are quoted as comparison rates — use the actual interest rate for this calculator.',
  ie: 'Enter your loan amount, interest rate and term. If your lender quotes an APR, use the underlying interest rate to see how the payment is built up.',
  de: 'Geben Sie Darlehensbetrag, Zinssatz und Laufzeit ein, um Ihre monatliche Rate zu berechnen.',
  nl: 'Voer het leenbedrag, de rente en de looptijd in om uw maandelijkse betaling te berekenen.',
  nz: 'Enter your loan amount, interest rate and term to see your monthly payment and full repayment schedule.',
  fr: 'Entrez le montant, le taux et la durée pour voir votre mensualité et le coût total du crédit.',
  es: 'Introduzca el importe, el tipo de interés y el plazo para ver su cuota mensual y el coste total.',
  sg: 'Enter your loan amount, interest rate and term. Singapore personal loan rates are quoted as flat rates by some lenders — use the effective interest rate (EIR) here.',
  in: 'Enter your loan amount, interest rate and term to see your EMI, total interest, and full repayment schedule.',
};

const DEFAULTS: Record<string, { amount: number; rate: number; termMonths: number }> = {
  us: { amount: 10000, rate: 0.12, termMonths: 36 },
  uk: { amount: 8000, rate: 0.09, termMonths: 36 },
  ca: { amount: 12000, rate: 0.10, termMonths: 36 },
  au: { amount: 15000, rate: 0.12, termMonths: 36 },
  ie: { amount: 10000, rate: 0.09, termMonths: 36 },
  de: { amount: 10000, rate: 0.07, termMonths: 36 },
  nl: { amount: 10000, rate: 0.06, termMonths: 36 },
  nz: { amount: 15000, rate: 0.13, termMonths: 36 },
  fr: { amount: 10000, rate: 0.07, termMonths: 36 },
  es: { amount: 10000, rate: 0.08, termMonths: 36 },
  sg: { amount: 20000, rate: 0.07, termMonths: 36 },
  in: { amount: 500000, rate: 0.13, termMonths: 36 },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cc: string }>;
}): Promise<Metadata> {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) return {};
  const h1 = H1[cc] ?? 'Personal Loan Calculator';
  return getToolMetadata(
    cc as CountryCode,
    'loans',
    'personal-loan',
    `${h1} | Reckoner`,
    `Calculate monthly payments, total interest, and APR for a personal loan. Free, no signup.`,
  );
}

export default async function PersonalLoanPage({
  params,
}: {
  params: Promise<{ cc: string }>;
}) {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) notFound();

  const country = getCountry(cc as CountryCode);
  const allCountries = getAllCountries();
  const defaults = DEFAULTS[cc] ?? DEFAULTS.us!;
  const h1 = H1[cc] ?? 'Personal Loan Calculator';
  const intro = INTRO[cc] ?? INTRO.us!;

  return (
    <>
      <CalculatorSchema
        name="Personal Loan Calculator"
        description="Calculate monthly payment, total interest, and true APR on a personal loan."
        url={`https://reckoner.tools/${cc}/loans/personal-loan`}
      />
      <Header
        currentCountry={country}
        allCountries={allCountries}
        currentTool="loans/personal-loan"
      />
      <main id="main">
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '48px 24px 0' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 300px',
              gap: 48,
              alignItems: 'start',
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 40,
                  fontWeight: 400,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.1,
                  margin: '0 0 12px',
                }}
              >
                {h1}
              </h1>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.6,
                  margin: '0 0 32px',
                  maxWidth: '72ch',
                }}
              >
                {intro}
              </p>
              <PersonalLoanCalculator
                country={country}
                defaultRate={defaults.rate}
                defaultAmount={defaults.amount}
                defaultTermMonths={defaults.termMonths}
              />
            </div>
            <div style={{ position: 'sticky', top: 72 }}>
              <AdSlot width={300} height={600} />
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1160, margin: '32px auto 0', padding: '0 24px' }}>
          <AdSlot width={728} height={90} style={{ margin: '0 0 32px' }} />
          <TrustDisclosures context={{ type: 'personal-loan' }} />
        </div>
      </main>
      <Footer countries={allCountries} currentCc={cc} />
    </>
  );
}
