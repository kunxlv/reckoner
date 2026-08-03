import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCountry, getAllCountries, COUNTRY_CODES } from '@reckoner/finance-data';
import type { CountryCode } from '@reckoner/finance-data';
import { getToolMetadata } from '@reckoner/seo';
import { AdSlot } from '@reckoner/analytics';
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

  return (
    <>
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
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '48px 24px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 48, alignItems: 'start' }}>
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
              />
            </div>
            <div style={{ position: 'sticky', top: 72 }}>
              <AdSlot width={300} height={600} />
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1160, margin: '32px auto 0', padding: '0 24px' }}>
          <AdSlot width={728} height={90} style={{ margin: '0 0 32px' }} />
          <TrustDisclosures context={{ type: 'debt-strategy' }} />
        </div>
      </main>
      <Footer countries={allCountries} currentCc={cc} />
    </>
  );
}
