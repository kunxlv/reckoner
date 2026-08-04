import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCountry, getAllCountries, COUNTRY_CODES } from '@reckoner/finance-data';
import type { CountryCode } from '@reckoner/finance-data';
import { getToolMetadata } from '@reckoner/seo';
import { AdSlot } from '@reckoner/analytics';
import { CalculatorSchema } from '../../../../src/components/CalculatorSchema';
import { Header } from '../../../../src/components/Header';
import { Footer } from '../../../../src/components/Footer';
import { FireNumberCalculator } from '../../../../src/components/FireNumberCalculator';
import { TrustDisclosures } from '../../../../src/components/TrustDisclosures';

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return COUNTRY_CODES.map((cc) => ({ cc }));
}

const H1: Record<string, string> = {
  us: 'FIRE Number Calculator',
  uk: 'FIRE Number Calculator',
  ca: 'FIRE Number Calculator',
  au: 'FIRE Number Calculator',
  ie: 'FIRE Number Calculator',
  de: 'FIRE Number Calculator',
  nl: 'FIRE Number Calculator',
  nz: 'FIRE Number Calculator',
  fr: 'FIRE Number Calculator',
  es: 'FIRE Number Calculator',
  sg: 'FIRE Number Calculator',
  in: 'FIRE Number Calculator',
};

const INTRO: Record<string, string> = {
  us: 'Calculate how much you need to retire early. Enter your annual expenses and expected withdrawal rate to find your FIRE number, then see how long it will take to get there.',
  uk: 'Work out the portfolio size you need to achieve financial independence. Enter your annual expenses and withdrawal rate to find your FIRE number and projected timeline.',
  ca: 'Find your FIRE number — the portfolio size needed to cover your annual expenses indefinitely. Enter your expenses, withdrawal rate, and current savings to project your path.',
  au: 'Calculate the portfolio you need to retire early. Enter your annual expenses and withdrawal rate to find your FIRE number, then project how long it will take to reach it.',
  ie: 'Find out how much you need to achieve financial independence. Enter your annual expenses and withdrawal rate to calculate your FIRE number and savings timeline.',
  de: 'Berechnen Sie Ihre FIRE-Zahl — das Portfolioziel für finanzielle Unabhängigkeit. Geben Sie Ihre jährlichen Ausgaben und die Entnahmerate ein.',
  nl: 'Bereken uw FIRE-getal — het benodigde portfolio voor financiële onafhankelijkheid. Voer uw jaarlijkse uitgaven en opnamepercentage in.',
  nz: 'Calculate your FIRE number and see how long it will take to reach financial independence. Enter your annual expenses, withdrawal rate, and savings details.',
  fr: 'Calculez votre chiffre FIRE — le portefeuille nécessaire à l\'indépendance financière. Entrez vos dépenses annuelles et le taux de retrait.',
  es: 'Calcule su número FIRE — el patrimonio necesario para la independencia financiera. Introduzca sus gastos anuales y la tasa de retiro.',
  sg: 'Calculate your FIRE number and project how long it will take to achieve financial independence. Enter your annual expenses, withdrawal rate, and investment details.',
  in: 'Calculate your FIRE corpus — the investment needed to cover your annual expenses indefinitely. Enter your annual spending and withdrawal rate to find your target.',
};

const DEFAULTS: Record<string, { currentSavings: number; annualRate: number }> = {
  us: { currentSavings: 50000, annualRate: 0.07 },
  uk: { currentSavings: 50000, annualRate: 0.06 },
  ca: { currentSavings: 50000, annualRate: 0.06 },
  au: { currentSavings: 50000, annualRate: 0.07 },
  ie: { currentSavings: 50000, annualRate: 0.06 },
  de: { currentSavings: 50000, annualRate: 0.05 },
  nl: { currentSavings: 50000, annualRate: 0.05 },
  nz: { currentSavings: 50000, annualRate: 0.06 },
  fr: { currentSavings: 50000, annualRate: 0.05 },
  es: { currentSavings: 50000, annualRate: 0.05 },
  sg: { currentSavings: 50000, annualRate: 0.05 },
  in: { currentSavings: 500000, annualRate: 0.10 },
};

export async function generateMetadata({ params }: { params: Promise<{ cc: string }> }): Promise<Metadata> {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) return {};
  const h1 = H1[cc] ?? 'FIRE Number Calculator';
  return getToolMetadata(
    cc as CountryCode, 'savings', 'fire-number',
    `${h1} | Reckoner`,
    'Calculate the portfolio size you need to retire early and achieve financial independence using the FIRE method.',
  );
}

export default async function FireNumberPage({ params }: { params: Promise<{ cc: string }> }) {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) notFound();

  const country = getCountry(cc as CountryCode);
  const allCountries = getAllCountries();
  const defaults = DEFAULTS[cc] ?? DEFAULTS.us!;
  const h1 = H1[cc] ?? 'FIRE Number Calculator';
  const intro = INTRO[cc] ?? INTRO.us!;

  return (
    <>
      <CalculatorSchema
        name="FIRE Number Calculator"
        description="Calculate the portfolio size needed to retire early and achieve financial independence. Uses the 4% rule and customisable withdrawal rates."
        url={`https://reckoner.tools/${cc}/savings/fire-number`}
      />
      <Header currentCountry={country} allCountries={allCountries} currentTool="savings/fire-number" />
      <main id="main">
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '48px 24px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 48, alignItems: 'start' }}>
            <div>
              <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 12px' }}>
                {h1}
              </h1>
              <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px', maxWidth: '72ch' }}>{intro}</p>
              <FireNumberCalculator
                country={country}
                defaultCurrentSavings={defaults.currentSavings}
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
          <TrustDisclosures context={{ type: 'fire-number' }} />
        </div>
      </main>
      <Footer countries={allCountries} currentCc={cc} />
    </>
  );
}
