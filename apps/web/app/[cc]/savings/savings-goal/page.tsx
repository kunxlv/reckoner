import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCountry, getAllCountries, COUNTRY_CODES } from '@reckoner/finance-data';
import type { CountryCode } from '@reckoner/finance-data';
import { getToolMetadata } from '@reckoner/seo';
import { AdSlot } from '@reckoner/analytics';
import { CalculatorSchema } from '../../../../src/components/CalculatorSchema';
import { BreadcrumbSchema } from '../../../../src/components/BreadcrumbSchema';
import { Header } from '../../../../src/components/Header';
import { Footer } from '../../../../src/components/Footer';
import { SavingsGoalCalculator } from '../../../../src/components/SavingsGoalCalculator';
import { TrustDisclosures } from '../../../../src/components/TrustDisclosures';

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return COUNTRY_CODES.map((cc) => ({ cc }));
}

const H1: Record<string, string> = {
  us: 'Savings Goal Calculator',
  uk: 'Savings Goal Calculator',
  ca: 'Savings Goal Calculator',
  au: 'Savings Goal Calculator',
  ie: 'Savings Goal Calculator',
  de: 'Sparzielrechner',
  nl: 'Spaardoelcalculator',
  nz: 'Savings Goal Calculator',
  fr: 'Calculateur d\'Objectif d\'Épargne',
  es: 'Calculadora de Meta de Ahorro',
  sg: 'Savings Goal Calculator',
  in: 'Savings Goal Calculator',
};

const INTRO: Record<string, string> = {
  us: 'Find out how long it will take to reach your savings target. Enter your starting balance, goal amount, interest rate, and monthly contributions to see when you\'ll hit your milestone.',
  uk: 'Calculate how long it will take to reach your savings goal. Enter your current balance, target amount, interest rate, and regular contributions to project your timeline.',
  ca: 'See how long it takes to reach your savings goal. Add your starting balance, target, rate, and monthly contributions to find out when you\'ll get there.',
  au: 'Work out when you\'ll reach your savings target. Enter your current balance, goal, interest rate, and monthly contributions to project your savings timeline.',
  ie: 'Find out how long it will take to reach your savings goal. Enter your starting balance, target amount, interest rate, and monthly contributions.',
  de: 'Berechnen Sie, wie lange es dauert, Ihr Sparziel zu erreichen. Geben Sie Startguthaben, Zielbetrag, Zinssatz und monatliche Einzahlungen ein.',
  nl: 'Bereken hoe lang het duurt om uw spaardoel te bereiken. Voer uw beginsaldo, doelbedrag, rente en maandelijkse inleg in.',
  nz: 'Find out how long it will take to reach your savings goal. Enter your starting balance, target, interest rate, and monthly contributions.',
  fr: 'Calculez le temps nécessaire pour atteindre votre objectif d\'épargne. Entrez votre solde de départ, le montant cible, le taux d\'intérêt et vos versements mensuels.',
  es: 'Calcule cuánto tiempo tardará en alcanzar su meta de ahorro. Introduzca su saldo inicial, el importe objetivo, el tipo de interés y las aportaciones mensuales.',
  sg: 'Find out how long it will take to reach your savings goal. Enter your starting balance, target amount, interest rate, and monthly contributions.',
  in: 'Calculate how long it will take to reach your savings goal. Enter your starting corpus, target amount, interest rate, and monthly SIP contributions.',
};

const DEFAULTS: Record<string, { principal: number; goal: number; annualRate: number }> = {
  us: { principal: 5000, goal: 50000, annualRate: 0.05 },
  uk: { principal: 5000, goal: 50000, annualRate: 0.045 },
  ca: { principal: 5000, goal: 50000, annualRate: 0.045 },
  au: { principal: 5000, goal: 50000, annualRate: 0.045 },
  ie: { principal: 5000, goal: 50000, annualRate: 0.04 },
  de: { principal: 5000, goal: 50000, annualRate: 0.04 },
  nl: { principal: 5000, goal: 50000, annualRate: 0.04 },
  nz: { principal: 5000, goal: 50000, annualRate: 0.05 },
  fr: { principal: 5000, goal: 50000, annualRate: 0.04 },
  es: { principal: 5000, goal: 50000, annualRate: 0.04 },
  sg: { principal: 5000, goal: 50000, annualRate: 0.03 },
  in: { principal: 50000, goal: 500000, annualRate: 0.07 },
};

export async function generateMetadata({ params }: { params: Promise<{ cc: string }> }): Promise<Metadata> {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) return {};
  const h1 = H1[cc] ?? 'Savings Goal Calculator';
  return getToolMetadata(
    cc as CountryCode, 'savings', 'savings-goal',
    `${h1} | Reckoner`,
    'Calculate how long it will take to reach your savings goal with compound interest and regular contributions.',
  );
}

export default async function SavingsGoalPage({ params }: { params: Promise<{ cc: string }> }) {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) notFound();

  const country = getCountry(cc as CountryCode);
  const allCountries = getAllCountries();
  const defaults = DEFAULTS[cc] ?? DEFAULTS.us!;
  const h1 = H1[cc] ?? 'Savings Goal Calculator';
  const intro = INTRO[cc] ?? INTRO.us!;

  return (
    <>
      <BreadcrumbSchema items={[
        { name: 'Home', href: '/' },
        { name: 'Savings', href: `/${cc}/savings` },
        { name: h1, href: `/${cc}/savings/savings-goal` },
      ]} />
      <CalculatorSchema
        name="Savings Goal Calculator"
        description="Calculate how long it will take to reach your savings goal with compound interest and regular monthly contributions."
        url={`https://reckoner.tools/${cc}/savings/savings-goal`}
      />
      <Header currentCountry={country} allCountries={allCountries} currentTool="savings/savings-goal" />
      <main id="main">
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '48px 24px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 48, alignItems: 'start' }}>
            <div>
              <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 12px' }}>
                {h1}
              </h1>
              <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px', maxWidth: '72ch' }}>{intro}</p>
              <SavingsGoalCalculator
                country={country}
                defaultPrincipal={defaults.principal}
                defaultGoal={defaults.goal}
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
          <TrustDisclosures context={{ type: 'savings-goal' }} />
        </div>
      </main>
      <Footer countries={allCountries} currentCc={cc} />
    </>
  );
}
