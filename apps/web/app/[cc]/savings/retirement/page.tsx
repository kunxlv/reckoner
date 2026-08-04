import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCountry, getAllCountries, COUNTRY_CODES } from '@reckoner/finance-data';
import type { CountryCode } from '@reckoner/finance-data';
import { getToolMetadata } from '@reckoner/seo';
import { AdSlot } from '@reckoner/analytics';
import { CalculatorSchema } from '../../../../src/components/CalculatorSchema';
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
