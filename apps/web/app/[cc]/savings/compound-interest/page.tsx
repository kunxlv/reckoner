import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCountry, getAllCountries, COUNTRY_CODES } from '@reckoner/finance-data';
import type { CountryCode } from '@reckoner/finance-data';
import { getToolMetadata } from '@reckoner/seo';
import { AdSlot } from '@reckoner/analytics';
import { CalculatorSchema } from '../../../../src/components/CalculatorSchema';
import { BreadcrumbSchema } from '../../../../src/components/BreadcrumbSchema';
import { FAQSchema } from '../../../../src/components/FAQSchema';
import { Header } from '../../../../src/components/Header';
import { Footer } from '../../../../src/components/Footer';
import { CompoundInterestCalculator } from '../../../../src/components/CompoundInterestCalculator';
import { TrustDisclosures } from '../../../../src/components/TrustDisclosures';

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return COUNTRY_CODES.map((cc) => ({ cc }));
}

const H1: Record<string, string> = {
  us: 'Compound Interest Calculator',
  uk: 'Compound Interest Calculator',
  ca: 'Compound Interest Calculator',
  au: 'Compound Interest Calculator',
  ie: 'Compound Interest Calculator',
  de: 'Zinseszinsrechner',
  nl: 'Samengestelde Rente Calculator',
  nz: 'Compound Interest Calculator',
  fr: 'Calculateur d\'Intérêts Composés',
  es: 'Calculadora de Interés Compuesto',
  sg: 'Compound Interest Calculator',
  in: 'Compound Interest Calculator',
};

const INTRO: Record<string, string> = {
  us: 'See how your savings grow with compound interest. Enter a starting amount, interest rate, and optional monthly contributions to project your balance over time.',
  uk: 'Project your savings with compound interest. Choose monthly, quarterly, or annual compounding and add regular contributions to see your balance grow.',
  ca: 'Calculate how compound interest grows your savings over time. Add monthly contributions to see the full picture including GIC and TFSA-style projections.',
  au: 'See how compounding grows your savings or term deposit. Choose your compounding frequency and add regular contributions to project your final balance.',
  ie: 'Project your savings with compound interest. Enter your deposit, rate, and monthly contributions to see how your balance grows over time.',
  de: 'Berechnen Sie das Wachstum Ihrer Ersparnisse mit Zinseszins. Wählen Sie die Zinszahlungsfrequenz und fügen Sie monatliche Einzahlungen hinzu.',
  nl: 'Bereken hoe uw spaargeld groeit met samengestelde rente. Kies de rentefrequentie en voeg maandelijkse inleg toe.',
  nz: 'Project your savings with compound interest. Enter your starting balance, rate, and contributions to see your balance over time.',
  fr: 'Calculez la croissance de votre épargne avec les intérêts composés. Choisissez la fréquence de capitalisation et ajoutez des versements mensuels.',
  es: 'Calcule el crecimiento de sus ahorros con interés compuesto. Elija la frecuencia de capitalización y añada aportaciones mensuales.',
  sg: 'Project how compound interest grows your savings or fixed deposit. Choose monthly or quarterly compounding and add regular contributions.',
  in: 'Calculate how compound interest grows your savings. Enter your principal, rate, and SIP-style monthly contributions to project your corpus.',
};

const DEFAULTS: Record<string, { principal: number; annualRate: number }> = {
  us: { principal: 10000, annualRate: 0.05 },
  uk: { principal: 10000, annualRate: 0.045 },
  ca: { principal: 10000, annualRate: 0.045 },
  au: { principal: 10000, annualRate: 0.045 },
  ie: { principal: 10000, annualRate: 0.04 },
  de: { principal: 10000, annualRate: 0.04 },
  nl: { principal: 10000, annualRate: 0.04 },
  nz: { principal: 10000, annualRate: 0.05 },
  fr: { principal: 10000, annualRate: 0.04 },
  es: { principal: 10000, annualRate: 0.04 },
  sg: { principal: 10000, annualRate: 0.03 },
  in: { principal: 100000, annualRate: 0.07 },
};

const COMPOUND_INTEREST_FAQS = [
  {
    question: 'How does compounding frequency affect returns?',
    answer: 'More frequent compounding produces slightly higher returns because interest starts earning interest sooner. Monthly compounding at 6% produces an effective annual rate of about 6.17%, versus exactly 6% for annual compounding. Over long periods this difference compounds into a meaningful amount.',
  },
  {
    question: 'What is the difference between real and nominal returns?',
    answer: 'A nominal return is the stated rate before adjusting for inflation. A real return subtracts inflation, showing actual purchasing-power growth. At 6% nominal and 3% inflation, your real return is roughly 3% — your money grows in quantity but less in what it can buy.',
  },
  {
    question: 'Do regular monthly contributions matter much?',
    answer: 'Dramatically. Each monthly contribution immediately starts earning compound interest for the rest of the investment horizon. Over 30 years at 7%, contributing £500/$500 a month on top of an initial lump sum can generate far more from the contributions alone than from the starting principal.',
  },
  {
    question: 'What is the Rule of 72?',
    answer: 'Divide 72 by the annual interest rate to estimate how many years it takes to double your money. At 6% per year, your money doubles in approximately 72 ÷ 6 = 12 years. It is a useful mental shortcut, though the calculator gives exact figures for any inputs.',
  },
];

export async function generateMetadata({ params }: { params: Promise<{ cc: string }> }): Promise<Metadata> {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) return {};
  const h1 = H1[cc] ?? 'Compound Interest Calculator';
  return getToolMetadata(
    cc as CountryCode, 'savings', 'compound-interest',
    `${h1} | Reckoner`,
    'Project how your savings grow with compound interest. Choose monthly, quarterly, annual, or continuous compounding with optional monthly contributions.',
  );
}

export default async function CompoundInterestPage({ params }: { params: Promise<{ cc: string }> }) {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) notFound();

  const country = getCountry(cc as CountryCode);
  const allCountries = getAllCountries();
  const defaults = DEFAULTS[cc] ?? DEFAULTS.us!;
  const h1 = H1[cc] ?? 'Compound Interest Calculator';
  const intro = INTRO[cc] ?? INTRO.us!;

  return (
    <>
      <BreadcrumbSchema items={[
        { name: 'Home', href: '/' },
        { name: 'Savings', href: `/${cc}/savings` },
        { name: h1, href: `/${cc}/savings/compound-interest` },
      ]} />
      <FAQSchema faqs={COMPOUND_INTEREST_FAQS} />
      <CalculatorSchema
        name="Compound Interest Calculator"
        description="Project savings growth with compound interest across four compounding frequencies, with optional monthly contributions and inflation adjustment."
        url={`https://reckoner.tools/${cc}/savings/compound-interest`}
      />
      <Header currentCountry={country} allCountries={allCountries} currentTool="savings/compound-interest" />
      <main id="main">
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '48px 24px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 48, alignItems: 'start' }}>
            <div>
              <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 12px' }}>
                {h1}
              </h1>
              <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px', maxWidth: '72ch' }}>{intro}</p>
              <CompoundInterestCalculator
                country={country}
                defaultPrincipal={defaults.principal}
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
          <TrustDisclosures context={{ type: 'compound-interest' }} />
        </div>
      </main>
      <Footer countries={allCountries} currentCc={cc} />
    </>
  );
}
