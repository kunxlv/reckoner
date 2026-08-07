import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCountry, getAllCountries, COUNTRY_CODES } from '@reckoner/finance-data';
import type { CountryCode } from '@reckoner/finance-data';
import { getToolMetadata } from '@reckoner/seo';
import { AdSlot } from '@reckoner/analytics';
import { BreadcrumbSchema } from '../../../../src/components/BreadcrumbSchema';
import { FAQSchema } from '../../../../src/components/FAQSchema';
import { CalculatorSchema } from '../../../../src/components/CalculatorSchema';
import { Header } from '../../../../src/components/Header';
import { Footer } from '../../../../src/components/Footer';
import { CreditCardPayoffCalculator } from '../../../../src/components/CreditCardPayoffCalculator';
import { TrustDisclosures } from '../../../../src/components/TrustDisclosures';

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return COUNTRY_CODES.map((cc) => ({ cc }));
}

const H1: Record<string, string> = {
  us: 'Credit Card Payoff Calculator',
  uk: 'Credit Card Payoff Calculator',
  ca: 'Credit Card Payoff Calculator',
  au: 'Credit Card Payoff Calculator',
  ie: 'Credit Card Payoff Calculator',
  de: 'Kreditkarten-Rückzahlungsrechner',
  nl: 'Creditcard Aflossingsberekening',
  nz: 'Credit Card Payoff Calculator',
  fr: 'Calculateur de Remboursement de Carte de Crédit',
  es: 'Calculadora de Pago de Tarjeta de Crédito',
  sg: 'Credit Card Payoff Calculator',
  in: 'Credit Card Payoff Calculator',
};

const INTRO: Record<string, string> = {
  us: 'Enter your balance and APR to see how long minimum payments will take to clear your card — and how much you can save by paying extra each month.',
  uk: 'Enter your balance and APR to see the payoff timeline and total interest under minimum payments, then add an extra monthly amount to see the saving.',
  ca: 'Enter your balance and annual interest rate to see how long minimum payments take, and how much you save by paying more each month.',
  au: 'Enter your balance and the purchase rate APR to see your payoff timeline. Adding extra payments shows the saving in months and total interest.',
  ie: 'Enter your balance and purchase rate to see how long minimum payments take and how much interest you will pay in total.',
  de: 'Geben Sie Ihren Saldo und den Jahreszins ein, um die Rückzahlungsdauer und die Gesamtzinsen zu berechnen.',
  nl: 'Voer uw saldo en de jaarlijkse rente in om de aflossingstijd en totale rentekosten te berekenen.',
  nz: 'Enter your balance and APR to see your payoff timeline and total interest paid at minimum payments.',
  fr: 'Entrez votre solde et le taux annuel pour voir la durée de remboursement et les intérêts totaux.',
  es: 'Introduzca su saldo y la TAE para ver el plazo de amortización y los intereses totales.',
  sg: 'Enter your balance and the effective interest rate (EIR) to see your payoff timeline and total interest.',
  in: 'Enter your outstanding balance and interest rate to see how long minimum payments will take to clear your card.',
};

// Default balance in local currency (approximate $3,000–$5,000 equivalent)
const DEFAULTS: Record<string, { balanceCents: number; annualRate: number }> = {
  us: { balanceCents: 500000, annualRate: 0.22 },   // $5,000 at 22%
  uk: { balanceCents: 300000, annualRate: 0.22 },   // £3,000 at 22%
  ca: { balanceCents: 500000, annualRate: 0.20 },   // CAD 5,000 at 20%
  au: { balanceCents: 500000, annualRate: 0.20 },   // AUD 5,000 at 20%
  ie: { balanceCents: 300000, annualRate: 0.22 },   // €3,000 at 22%
  de: { balanceCents: 300000, annualRate: 0.18 },   // €3,000 at 18%
  nl: { balanceCents: 300000, annualRate: 0.18 },   // €3,000 at 18%
  nz: { balanceCents: 500000, annualRate: 0.22 },   // NZD 5,000 at 22%
  fr: { balanceCents: 300000, annualRate: 0.18 },   // €3,000 at 18%
  es: { balanceCents: 300000, annualRate: 0.18 },   // €3,000 at 18%
  sg: { balanceCents: 600000, annualRate: 0.26 },   // SGD 6,000 at 26%
  in: { balanceCents: 5000000, annualRate: 0.36 },  // INR 50,000 at 36%
};

const CREDIT_CARD_FAQS = [
  {
    question: 'Why do minimum payments take so long to pay off a balance?',
    answer: 'Minimum payments are typically set at 1–2% of the outstanding balance, which barely covers the monthly interest charge. The principal falls very slowly, so interest continues to compound on nearly the full balance. Even a small fixed extra payment each month dramatically accelerates payoff.',
  },
  {
    question: 'How much does paying an extra £50 or $50 a month help?',
    answer: 'On a typical balance of £3,000 or $5,000 at 20–22% APR, an extra £50/$50 per month can cut several years off the payoff period and save hundreds in total interest. Use the calculator above to see the exact impact for your balance and rate.',
  },
  {
    question: 'What is EIR and why does Singapore quote it?',
    answer: "Singapore and some other markets quote credit card rates as a flat monthly rate (e.g. 1.5% per month). The Effective Interest Rate (EIR) converts this to a true annualised basis — the equivalent APR — which is typically around 26% for a 1.5% monthly flat rate. EIR allows accurate comparison across loan products.",
  },
  {
    question: 'Should I use the avalanche or snowball method for multiple credit cards?',
    answer: 'The avalanche method (pay the highest-rate card first) minimises total interest paid and is mathematically optimal. The snowball method (pay the lowest balance first) is slower but gives earlier wins, which some people find motivating. Use the debt strategy calculator to compare both for your specific debts.',
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cc: string }>;
}): Promise<Metadata> {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) return {};
  const h1 = H1[cc] ?? 'Credit Card Payoff Calculator';
  return getToolMetadata(
    cc as CountryCode,
    'loans',
    'credit-card-payoff',
    `${h1} | Reckoner`,
    'Calculate how long minimum payments take to pay off your credit card, and how much you save by paying extra each month.',
  );
}

export default async function CreditCardPayoffPage({
  params,
}: {
  params: Promise<{ cc: string }>;
}) {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) notFound();

  const country = getCountry(cc as CountryCode);
  const allCountries = getAllCountries();
  const defaults = DEFAULTS[cc] ?? DEFAULTS.us!;
  const h1 = H1[cc] ?? 'Credit Card Payoff Calculator';
  const intro = INTRO[cc] ?? INTRO.us!;

  return (
    <>
      <BreadcrumbSchema items={[
        { name: 'Home', href: '/' },
        { name: 'Loans', href: `/${cc}/loans` },
        { name: h1, href: `/${cc}/loans/credit-card-payoff` },
      ]} />
      <FAQSchema faqs={CREDIT_CARD_FAQS} />
      <CalculatorSchema
        name="Credit Card Payoff Calculator"
        description="Calculate how long minimum payments take and how much interest you pay, with optional extra payment comparison."
        url={`https://reckoner.tools/${cc}/loans/credit-card-payoff`}
      />
      <Header
        currentCountry={country}
        allCountries={allCountries}
        currentTool="loans/credit-card-payoff"
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
              <CreditCardPayoffCalculator
                country={country}
                defaultBalanceCents={defaults.balanceCents}
                defaultAnnualRate={defaults.annualRate}
              />
            </div>
            <div style={{ position: 'sticky', top: 72 }}>
              <AdSlot width={300} height={600} />
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1160, margin: '32px auto 0', padding: '0 24px' }}>
          <AdSlot width={728} height={90} style={{ margin: '0 0 32px' }} />
          <TrustDisclosures context={{ type: 'credit-card-payoff' }} />
        </div>
      </main>
      <Footer countries={allCountries} currentCc={cc} />
    </>
  );
}
