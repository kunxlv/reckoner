import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCountry, getAllCountries, COUNTRY_CODES, fetchFxRates } from '@reckoner/finance-data';
import type { CountryCode } from '@reckoner/finance-data';
import { getToolMetadata } from '@reckoner/seo';
import { AdSlot } from '@reckoner/analytics';
import { BreadcrumbSchema } from '../../../../src/components/BreadcrumbSchema';
import { FAQSchema } from '../../../../src/components/FAQSchema';
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
  au: 'Enter your loan amount, interest rate and term. Australian personal loan rates are quoted as comparison rates  -  use the actual interest rate for this calculator.',
  ie: 'Enter your loan amount, interest rate and term. If your lender quotes an APR, use the underlying interest rate to see how the payment is built up.',
  de: 'Geben Sie Darlehensbetrag, Zinssatz und Laufzeit ein, um Ihre monatliche Rate zu berechnen.',
  nl: 'Voer het leenbedrag, de rente en de looptijd in om uw maandelijkse betaling te berekenen.',
  nz: 'Enter your loan amount, interest rate and term to see your monthly payment and full repayment schedule.',
  fr: 'Entrez le montant, le taux et la durée pour voir votre mensualité et le coût total du crédit.',
  es: 'Introduzca el importe, el tipo de interés y el plazo para ver su cuota mensual y el coste total.',
  sg: 'Enter your loan amount, interest rate and term. Singapore personal loan rates are quoted as flat rates by some lenders  -  use the effective interest rate (EIR) here.',
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

const PERSONAL_LOAN_FAQS = [
  {
    question: 'What is an origination fee?',
    answer: 'An origination fee is a one-off charge deducted from the loan proceeds at disbursement, typically 1–8% of the loan amount. It raises the effective APR above the stated interest rate. Enter it in the fee field above to see the true APR.',
  },
  {
    question: 'How is my monthly payment calculated?',
    answer: 'Using the standard annuity formula: payment = principal × r / (1 − (1 + r)^−n), where r is the monthly interest rate (annual rate ÷ 12) and n is the number of monthly payments. This is the same formula used by banks.',
  },
  {
    question: 'Should I use a personal loan or a credit card?',
    answer: 'Personal loans have fixed terms and typically lower rates, making them better for large, one-off purchases you will repay over 1–5 years. Credit cards are better for smaller amounts you can clear each month, since many offer interest-free periods. For large balances carried month-to-month, a personal loan is almost always cheaper.',
  },
  {
    question: 'Does early repayment save money?',
    answer: 'Yes  -  you stop accruing interest from the day of repayment. However, some lenders charge an early repayment fee of one to two months of interest. Check your loan agreement first, then use the calculator to confirm the net saving after any fee.',
  },
];

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

  let fxResult = null;
  if (country.currency !== 'EUR') {
    try { fxResult = await fetchFxRates(country.currency); } catch { /* hide conversion */ }
  }

  return (
    <>
      <BreadcrumbSchema items={[
        { name: 'Home', href: '/' },
        { name: 'Loans', href: `/${cc}/loans` },
        { name: h1, href: `/${cc}/loans/personal-loan` },
      ]} />
      <FAQSchema faqs={PERSONAL_LOAN_FAQS} />
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
        <div className="page-outer">
          <div className="calc-grid">
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
                fxResult={fxResult}
              />
            </div>
            <div className="ad-sidebar">
              <AdSlot width={300} height={600} />
            </div>
          </div>
        </div>

        <div className="page-section">
          <AdSlot width={728} height={90} style={{ margin: '0 0 32px' }} />
          <TrustDisclosures context={{ type: 'personal-loan' }} />
        </div>

        <div className="page-section-flush">
          <div style={{ maxWidth: '72ch', padding: '48px 0 0' }}>
            <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '0 0 10px' }}>How your monthly payment is calculated</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>Your monthly payment is fixed using the standard annuity formula, which keeps payments equal throughout the term. Each payment covers that month&apos;s interest on the outstanding balance first, with the remainder reducing the principal. In the early months, most of each payment is interest. By the final months, almost all of it is principal. The balance chart below the calculator shows this progression month by month.</p>

            <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '0 0 10px' }}>What this doesn&apos;t include</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>This calculator covers principal and interest only. Your actual loan cost may also include an origination or arrangement fee (add it in the field above to see the true APR), optional payment protection insurance, and any early repayment charge if you pay off early. Some lenders quote a flat rate rather than an APR  -  flat rates produce a higher effective cost than they appear. Always compare loans using the APR or effective interest rate.</p>

            <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '0 0 10px' }}>Why your lender&apos;s quote may show a different figure</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>Lenders quote rates based on your credit score, income, and existing debt level. The rate you see advertised is typically the representative APR, which only 51% of applicants need to receive. If your credit profile is weaker, you may be offered a higher rate. Conversely, strong applicants sometimes receive a better rate than advertised. Always get a personalised quote, which will not affect your credit file if done as a soft search.</p>

            <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '16px 0 6px' }}>Frequently asked questions</h2>
            {PERSONAL_LOAN_FAQS.map(({ question, answer }) => (
              <div key={question} style={{ borderTop: '1px solid var(--color-hairline)', padding: '16px 0' }}>
                <h3 style={{ fontSize: 16, fontWeight: 500, margin: '0 0 6px' }}>{question}</h3>
                <p style={{ fontSize: 16, lineHeight: 1.6, margin: 0 }}>{answer}</p>
              </div>
            ))}

            {/* Embed section */}
            <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '48px 0 10px' }}>Add this calculator to your site</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 16px' }}>Free to use. The embed is under 40KB, carries no ads and no tracking, and inherits your page&apos;s background. The code includes a link back to this page.</p>
            <button type="button" style={{ fontSize: 14, fontWeight: 500, background: 'var(--color-ink)', color: 'var(--color-canvas)', borderRadius: 0, padding: '9px 18px', border: 'none', cursor: 'pointer' }}>
              Copy embed code
            </button>

            {/* Author box */}
            <div style={{ background: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 0, padding: '20px 24px', margin: '48px 0' }}>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>Written and maintained by the Reckoner team</div>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--color-ink-mid)', margin: 0 }}>
                The repayment engines behind this site are tested against worked examples published by FRED, the Bank of Canada, the Bank of England and the Reserve Bank of Australia.{' '}
                Found an error? <a href="/contact">Contact us</a>
              </p>
              <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginTop: 8 }}>Last reviewed {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            </div>
          </div>
        </div>
      </main>
      <Footer currentCc={cc} />
    </>
  );
}
