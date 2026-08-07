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
import { RetirementCalculator } from '../../../../src/components/RetirementCalculator';
import { TrustDisclosures } from '../../../../src/components/TrustDisclosures';

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return COUNTRY_CODES.map((cc) => ({ cc }));
}

const H1: Record<string, string> = {
  us: 'Retirement Projection Calculator',
  uk: 'Retirement Projection Calculator',
  ca: 'Retirement Projection Calculator',
  au: 'Retirement Projection Calculator',
  ie: 'Retirement Projection Calculator',
  de: 'Rentenrechner',
  nl: 'Pensioenberekening',
  nz: 'Retirement Projection Calculator',
  fr: 'Calculateur de Retraite',
  es: 'Calculadora de Jubilación',
  sg: 'Retirement Projection Calculator',
  in: 'Retirement Projection Calculator',
};

const INTRO: Record<string, string> = {
  us: 'Project when your savings will support retirement. Enter your current balance, monthly contributions, and expected expenses to see your accumulation and drawdown over time.',
  uk: 'Plan your retirement with confidence. Enter your current pension pot, monthly savings, and expected spending to see how long your money will last.',
  ca: 'Project your retirement savings through accumulation and drawdown. Factor in your RRSP or TFSA balance, monthly contributions, and expected retirement expenses.',
  au: 'See how your super and savings will support your retirement. Enter your current balance, contributions, and expected annual expenses to project your financial future.',
  ie: 'Plan your retirement finances. Enter your current savings, monthly contributions, and expected annual expenses to project your balance through accumulation and drawdown.',
  de: 'Planen Sie Ihre Altersvorsorge. Geben Sie Ihr aktuelles Erspartes, monatliche Beiträge und geplante Ausgaben ein, um Ihre Rentenphase zu projizieren.',
  nl: 'Plan uw pensioen. Voer uw huidige spaargeld, maandelijkse inleg en verwachte uitgaven in om uw pensioenopbouw en -uitkering te berekenen.',
  nz: 'Project your retirement savings through accumulation and drawdown. Enter your KiwiSaver balance, contributions, and expected expenses to plan your retirement.',
  fr: 'Planifiez votre retraite. Saisissez votre épargne actuelle, vos versements mensuels et vos dépenses prévues pour projeter votre accumulation et vos retraits.',
  es: 'Planifique su jubilación. Introduzca sus ahorros actuales, aportaciones mensuales y gastos previstos para proyectar su fase de acumulación y retirada.',
  sg: 'Plan your retirement with your CPF and personal savings. Enter your current balance, monthly contributions, and expected expenses to project your financial future.',
  in: 'Project your retirement corpus through accumulation and drawdown. Enter your current savings, monthly SIP, and expected annual expenses to plan your retirement.',
};

const DEFAULTS: Record<string, { savings: number; annualRate: number }> = {
  us: { savings: 50000, annualRate: 0.07 },
  uk: { savings: 50000, annualRate: 0.06 },
  ca: { savings: 50000, annualRate: 0.06 },
  au: { savings: 50000, annualRate: 0.07 },
  ie: { savings: 50000, annualRate: 0.06 },
  de: { savings: 50000, annualRate: 0.05 },
  nl: { savings: 50000, annualRate: 0.05 },
  nz: { savings: 50000, annualRate: 0.06 },
  fr: { savings: 50000, annualRate: 0.05 },
  es: { savings: 50000, annualRate: 0.05 },
  sg: { savings: 50000, annualRate: 0.05 },
  in: { savings: 500000, annualRate: 0.10 },
};

const RETIREMENT_FAQS = [
  {
    question: 'What withdrawal rate is sustainable in retirement?',
    answer: "The 4% rule — withdraw 4% of your initial portfolio in year one, then adjust for inflation annually — has historically sustained a 30-year US retirement in most market scenarios. 3.5% is more conservative for longer retirements or non-US portfolios. Use the drawdown phase of this calculator to model your specific horizon.",
  },
  {
    question: 'How does inflation affect a retirement portfolio?',
    answer: 'At 3% annual inflation, purchasing power halves in roughly 24 years. If you withdraw a fixed nominal amount, inflation silently erodes what it can buy. Toggle the real balance view to see your portfolio in today\'s purchasing power — a more honest picture of retirement security.',
  },
  {
    question: 'What is sequence-of-returns risk?',
    answer: 'If markets fall sharply in your early retirement years, you sell more units to fund withdrawals — permanently reducing the portfolio\'s ability to recover in better years. The same average return over 30 years produces very different outcomes depending on whether the bad years come first or last. This is why holding some cash or bonds in early retirement is often recommended.',
  },
  {
    question: 'Should I include pension or Social Security income in this calculator?',
    answer: 'Yes — subtract any guaranteed annual income (pension, Social Security, annuity) from your planned annual expenses to find how much your investment portfolio needs to supply. A £15,000/year pension on £30,000 annual expenses means your portfolio only needs to fund £15,000 per year.',
  },
];

export async function generateMetadata({ params }: { params: Promise<{ cc: string }> }): Promise<Metadata> {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) return {};
  const h1 = H1[cc] ?? 'Retirement Projection Calculator';
  return getToolMetadata(
    cc as CountryCode, 'savings', 'retirement',
    `${h1} | Reckoner`,
    'Project retirement savings through accumulation and drawdown phases, with inflation adjustment and real vs nominal balance comparison.',
  );
}

export default async function RetirementPage({ params }: { params: Promise<{ cc: string }> }) {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) notFound();

  const country = getCountry(cc as CountryCode);
  const allCountries = getAllCountries();
  const defaults = DEFAULTS[cc] ?? DEFAULTS.us!;
  const h1 = H1[cc] ?? 'Retirement Projection Calculator';
  const intro = INTRO[cc] ?? INTRO.us!;

  return (
    <>
      <BreadcrumbSchema items={[
        { name: 'Home', href: '/' },
        { name: 'Savings', href: `/${cc}/savings` },
        { name: h1, href: `/${cc}/savings/retirement` },
      ]} />
      <FAQSchema faqs={RETIREMENT_FAQS} />
      <CalculatorSchema
        name="Retirement Projection Calculator"
        description="Project retirement savings through accumulation and drawdown phases, with inflation adjustment and real vs nominal balance comparison."
        url={`https://reckoner.tools/${cc}/savings/retirement`}
      />
      <Header currentCountry={country} allCountries={allCountries} currentTool="savings/retirement" />
      <main id="main">
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '48px 24px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 48, alignItems: 'start' }}>
            <div>
              <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 12px' }}>
                {h1}
              </h1>
              <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px', maxWidth: '72ch' }}>{intro}</p>
              <RetirementCalculator
                country={country}
                defaultSavings={defaults.savings}
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
          <TrustDisclosures context={{ type: 'retirement' }} />
        </div>
      </main>
      <Footer countries={allCountries} currentCc={cc} />
    </>
  );
}
