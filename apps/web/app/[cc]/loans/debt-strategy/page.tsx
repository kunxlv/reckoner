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
import { DebtStrategyCalculator } from '../../../../src/components/DebtStrategyCalculator';
import { TrustDisclosures } from '../../../../src/components/TrustDisclosures';
import type { Debt } from '@reckoner/debt-strategy-engine';

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return COUNTRY_CODES.map((cc) => ({ cc }));
}

const H1: Record<string, string> = {
  us: 'Debt Strategy Calculator',
  uk: 'Debt Strategy Calculator',
  ca: 'Debt Strategy Calculator',
  au: 'Debt Strategy Calculator',
  ie: 'Debt Strategy Calculator',
  de: 'Schulden-Strategie-Rechner',
  nl: 'Schuldenaflosstrategie Berekenen',
  nz: 'Debt Strategy Calculator',
  fr: 'Calculateur de Stratégie de Remboursement',
  es: 'Calculadora de Estrategia de Deuda',
  sg: 'Debt Strategy Calculator',
  in: 'Debt Repayment Strategy Calculator',
};

const INTRO: Record<string, string> = {
  us: 'Enter up to 5 debts and an extra monthly budget to compare the snowball, avalanche, and minimum-payment strategies side by side.',
  uk: 'Enter up to 5 debts and an extra monthly budget to compare which repayment strategy pays off your debts fastest and cheapest.',
  ca: 'Compare the debt snowball and avalanche strategies to see which saves the most interest and pays off your debts soonest.',
  au: 'Enter your debts and extra monthly budget to compare the snowball, avalanche, and minimum-payment strategies.',
  ie: 'Compare snowball, avalanche, and minimum-payment strategies across up to 5 debts to find the best approach for your situation.',
  de: 'Vergleichen Sie Schneeball-, Lawinen- und Mindestzahlungsstrategie für bis zu 5 Schulden.',
  nl: 'Vergelijk sneeuwbal-, lawine- en minimale betalingsstrategie voor maximaal 5 schulden.',
  nz: 'Compare debt snowball and avalanche strategies across up to 5 debts with any extra monthly budget.',
  fr: "Comparez les stratégies boule de neige, avalanche et paiement minimum pour jusqu'à 5 dettes.",
  es: 'Compare las estrategias bola de nieve, avalancha y pago mínimo para hasta 5 deudas.',
  sg: 'Compare debt repayment strategies across up to 5 debts. Enter an extra monthly budget to see the saving from snowball and avalanche methods.',
  in: 'Compare snowball, avalanche, and minimum-payment strategies for up to 5 loans or credit card balances.',
};

// Default debts in local currency
const DEFAULT_DEBTS: Record<string, Debt[]> = {
  us: [
    { name: 'Credit card', balanceCents: 500000, annualRate: 0.22, minPaymentCents: 1500 },
    { name: 'Personal loan', balanceCents: 1000000, annualRate: 0.14, minPaymentCents: 23000 },
  ],
  uk: [
    { name: 'Credit card', balanceCents: 300000, annualRate: 0.22, minPaymentCents: 900 },
    { name: 'Personal loan', balanceCents: 700000, annualRate: 0.14, minPaymentCents: 16000 },
  ],
  ca: [
    { name: 'Credit card', balanceCents: 500000, annualRate: 0.20, minPaymentCents: 1500 },
    { name: 'Line of credit', balanceCents: 1000000, annualRate: 0.10, minPaymentCents: 20000 },
  ],
  au: [
    { name: 'Credit card', balanceCents: 500000, annualRate: 0.20, minPaymentCents: 1500 },
    { name: 'Personal loan', balanceCents: 1000000, annualRate: 0.12, minPaymentCents: 23000 },
  ],
  ie: [
    { name: 'Credit card', balanceCents: 300000, annualRate: 0.22, minPaymentCents: 900 },
    { name: 'Personal loan', balanceCents: 700000, annualRate: 0.12, minPaymentCents: 16000 },
  ],
  de: [
    { name: 'Kreditkarte', balanceCents: 300000, annualRate: 0.18, minPaymentCents: 900 },
    { name: 'Privatkredit', balanceCents: 700000, annualRate: 0.10, minPaymentCents: 16000 },
  ],
  nl: [
    { name: 'Creditcard', balanceCents: 300000, annualRate: 0.18, minPaymentCents: 900 },
    { name: 'Persoonlijke lening', balanceCents: 700000, annualRate: 0.10, minPaymentCents: 16000 },
  ],
  nz: [
    { name: 'Credit card', balanceCents: 500000, annualRate: 0.22, minPaymentCents: 1500 },
    { name: 'Personal loan', balanceCents: 1000000, annualRate: 0.14, minPaymentCents: 23000 },
  ],
  fr: [
    { name: 'Carte de crédit', balanceCents: 300000, annualRate: 0.18, minPaymentCents: 900 },
    { name: 'Prêt personnel', balanceCents: 700000, annualRate: 0.10, minPaymentCents: 16000 },
  ],
  es: [
    { name: 'Tarjeta de crédito', balanceCents: 300000, annualRate: 0.18, minPaymentCents: 900 },
    { name: 'Préstamo personal', balanceCents: 700000, annualRate: 0.10, minPaymentCents: 16000 },
  ],
  sg: [
    { name: 'Credit card', balanceCents: 600000, annualRate: 0.26, minPaymentCents: 1800 },
    { name: 'Personal loan', balanceCents: 1500000, annualRate: 0.08, minPaymentCents: 30000 },
  ],
  in: [
    { name: 'Credit card', balanceCents: 5000000, annualRate: 0.36, minPaymentCents: 15000 },
    { name: 'Personal loan', balanceCents: 10000000, annualRate: 0.14, minPaymentCents: 225000 },
  ],
};

const FAQS = [
  {
    question: 'What is the difference between the avalanche and snowball methods?',
    answer: 'The avalanche method directs extra payments to the highest-interest debt first, minimising total interest paid  -  the mathematically optimal approach. The snowball method pays the lowest balance first, producing quicker wins that some people find motivating. The calculator above shows the total interest and months to payoff for both, so you can see the actual cost difference for your specific debts.',
  },
  {
    question: 'How much extra should I pay each month?',
    answer: 'Any amount above the minimums accelerates payoff and reduces total interest. Even an extra £50 or $50 per month can cut years off a debt with a high interest rate. Enter different extra monthly amounts in the field above to see the impact on each strategy. The optimal extra payment is the maximum you can sustain consistently  -  irregular large payments are less efficient than smaller consistent ones.',
  },
  {
    question: 'Should I consolidate my debts before using this calculator?',
    answer: 'Debt consolidation  -  combining multiple debts into one loan at a lower rate  -  can reduce total interest paid and simplify repayment. However, it only helps if the consolidation rate is genuinely lower than your weighted average rate across the existing debts. Use this calculator to find your current total interest, then compare it against a consolidation loan quote to see if the switch is worthwhile.',
  },
  {
    question: 'What if I cannot afford the minimums?',
    answer: 'If your minimum payments already exceed your income or cash flow, this calculator may not reflect your actual situation. Contact a non-profit debt advice service in your country  -  Citizens Advice in the UK, NFCC in the US, or the National Debt Helpline in Australia  -  for free, regulated advice. Many options exist (payment plans, debt management plans) that this calculator does not model.',
  },
  {
    question: 'Does the order of paying off debts affect my credit score?',
    answer: 'Yes, indirectly. Paying off a credit card reduces your credit utilisation ratio (balance divided by credit limit), which is a significant factor in most credit scoring models. Fully closing a card account can temporarily reduce your score by shortening your average account age. The avalanche approach tends to pay off high-rate cards quickly, which usually improves your credit utilisation and score over time.',
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cc: string }>;
}): Promise<Metadata> {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) return {};
  const h1 = H1[cc] ?? 'Debt Strategy Calculator';
  return getToolMetadata(
    cc as CountryCode,
    'loans',
    'debt-strategy',
    `${h1} | Reckoner`,
    'Compare snowball, avalanche, and minimum-payment strategies for up to 5 debts. See total interest and months to payoff for each.',
  );
}

export default async function DebtStrategyPage({
  params,
}: {
  params: Promise<{ cc: string }>;
}) {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) notFound();

  const country = getCountry(cc as CountryCode);
  const allCountries = getAllCountries();
  const defaultDebts = DEFAULT_DEBTS[cc] ?? DEFAULT_DEBTS.us!;
  const h1 = H1[cc] ?? 'Debt Strategy Calculator';
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
        { name: h1, href: `/${cc}/loans/debt-strategy` },
      ]} />
      <FAQSchema faqs={FAQS} />
      <CalculatorSchema
        name="Debt Strategy Calculator"
        description="Compare snowball, avalanche, and minimum-payment strategies for up to 5 debts."
        url={`https://reckoner.tools/${cc}/loans/debt-strategy`}
      />
      <Header
        currentCountry={country}
        allCountries={allCountries}
        currentTool="loans/debt-strategy"
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
              <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px', maxWidth: '72ch' }}>
                {intro}
              </p>
              <DebtStrategyCalculator
                country={country}
                defaultDebts={defaultDebts}
                defaultExtraMonthlyCents={10000}
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
          <TrustDisclosures context={{ type: 'debt-strategy' }} />
        </div>

        <div className="page-section-flush">
          <div style={{ maxWidth: '72ch', padding: '32px 0 0' }}>
            <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '0 0 10px' }}>How each repayment strategy is calculated</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>Each strategy applies the same total monthly budget (minimums plus any extra). In the avalanche method, the extra goes to the highest-APR debt; in the snowball, to the lowest balance. Each month, interest is charged at the monthly rate for each debt, the minimum is paid, and the extra is applied. When one debt is cleared, its minimum payment is redirected to the next target. The calculator runs this simulation until all debts reach zero.</p>

            <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '0 0 10px' }}>What this doesn&apos;t include</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>This models fixed debts with fixed minimum payments. It does not account for variable minimum payments (where the minimum is a percentage of the balance), interest rate changes, new borrowing, or balance transfer offers. If your credit card minimum is set as a percentage rather than a fixed amount, the actual minimum will fall as the balance does  -  enter the current month&apos;s minimum as a fixed amount for the closest approximation.</p>

            <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '0 0 10px' }}>Why the total interest figures may differ from your statements</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>The calculator charges interest on the opening balance each month using a simple monthly rate (APR ÷ 12). Some lenders compound daily, some charge interest on the average daily balance, and some apply interest before the minimum is deducted rather than after. These differences can produce small variations in total interest. The calculator gives a reliable estimate for comparison purposes  -  the relative ranking of strategies will be correct even if the absolute figure differs slightly.</p>

            <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '16px 0 6px' }}>Frequently asked questions</h2>
            {FAQS.map(({ question, answer }) => (
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
