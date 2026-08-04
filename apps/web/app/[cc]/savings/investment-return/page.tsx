import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCountry, getAllCountries, COUNTRY_CODES } from '@reckoner/finance-data';
import type { CountryCode } from '@reckoner/finance-data';
import { getToolMetadata } from '@reckoner/seo';
import { AdSlot } from '@reckoner/analytics';
import { CalculatorSchema } from '../../../../src/components/CalculatorSchema';
import { Header } from '../../../../src/components/Header';
import { Footer } from '../../../../src/components/Footer';
import { InvestmentReturnCalculator } from '../../../../src/components/InvestmentReturnCalculator';
import { TrustDisclosures } from '../../../../src/components/TrustDisclosures';

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return COUNTRY_CODES.map((cc) => ({ cc }));
}

const H1: Record<string, string> = {
  us: 'Investment Return Calculator',
  uk: 'Investment Return Calculator',
  ca: 'Investment Return Calculator',
  au: 'Investment Return Calculator',
  ie: 'Investment Return Calculator',
  de: 'Investitionsrendite-Rechner',
  nl: 'Beleggingsrendement Calculator',
  nz: 'Investment Return Calculator',
  fr: 'Calculateur de Rendement d\'Investissement',
  es: 'Calculadora de Rentabilidad de Inversión',
  sg: 'Investment Return Calculator',
  in: 'Investment Return Calculator',
};

const INTRO: Record<string, string> = {
  us: 'Calculate the CAGR of any investment or project future growth. Enter an initial and final value to find the annualised return, or provide a CAGR to project how your investment grows over time.',
  uk: 'Find the compound annual growth rate of any investment or project future value. Enter start and end values to calculate CAGR, or enter a rate to project growth over your chosen timeframe.',
  ca: 'Calculate investment CAGR or project future portfolio value. Enter initial and final values to find your annualised return, or use a known rate to see how your investment compounds over time.',
  au: 'Find your investment\'s compound annual growth rate or project how it grows. Enter start and end values to calculate CAGR, or provide a rate to forecast your future balance.',
  ie: 'Calculate the CAGR of any investment or project its future value. Enter initial and final values to find the annualised return, or use a rate to see projected growth over time.',
  de: 'Berechnen Sie die CAGR einer Investition oder prognostizieren Sie das zukünftige Wachstum. Geben Sie Anfangs- und Endwert ein, um die jährliche Rendite zu ermitteln.',
  nl: 'Bereken de CAGR van een investering of projecteer toekomstige groei. Voer begin- en eindwaarde in om het jaarlijkse rendement te berekenen, of gebruik een bekend percentage.',
  nz: 'Calculate investment CAGR or project future value. Enter start and end values to find the annualised return, or provide a rate to see how your investment grows over time.',
  fr: 'Calculez le TCAC d\'un investissement ou projetez sa valeur future. Entrez les valeurs initiale et finale pour obtenir le rendement annualisé, ou saisissez un taux pour projeter la croissance.',
  es: 'Calcule la TCAC de una inversión o proyecte su valor futuro. Introduzca los valores inicial y final para obtener el rendimiento anualizado, o use una tasa para proyectar el crecimiento.',
  sg: 'Calculate investment CAGR or project future value. Enter start and end values to find the annualised return, or provide a rate to see how your investment compounds over time.',
  in: 'Calculate the CAGR of any investment or project future corpus value. Enter initial and final values to find the annualised return, or use a rate to project growth over your investment horizon.',
};

const DEFAULTS: Record<string, { initialValue: number; annualRate: number }> = {
  us: { initialValue: 10000, annualRate: 0.07 },
  uk: { initialValue: 10000, annualRate: 0.06 },
  ca: { initialValue: 10000, annualRate: 0.06 },
  au: { initialValue: 10000, annualRate: 0.07 },
  ie: { initialValue: 10000, annualRate: 0.06 },
  de: { initialValue: 10000, annualRate: 0.06 },
  nl: { initialValue: 10000, annualRate: 0.06 },
  nz: { initialValue: 10000, annualRate: 0.06 },
  fr: { initialValue: 10000, annualRate: 0.06 },
  es: { initialValue: 10000, annualRate: 0.06 },
  sg: { initialValue: 10000, annualRate: 0.05 },
  in: { initialValue: 100000, annualRate: 0.12 },
};

export async function generateMetadata({ params }: { params: Promise<{ cc: string }> }): Promise<Metadata> {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) return {};
  const h1 = H1[cc] ?? 'Investment Return Calculator';
  return getToolMetadata(
    cc as CountryCode, 'savings', 'investment-return',
    `${h1} | Reckoner`,
    'Calculate CAGR or project investment growth. Find the annualised return between two values, or forecast a future portfolio value from a starting amount and rate.',
  );
}

export default async function InvestmentReturnPage({ params }: { params: Promise<{ cc: string }> }) {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) notFound();

  const country = getCountry(cc as CountryCode);
  const allCountries = getAllCountries();
  const defaults = DEFAULTS[cc] ?? DEFAULTS.us!;
  const h1 = H1[cc] ?? 'Investment Return Calculator';
  const intro = INTRO[cc] ?? INTRO.us!;

  return (
    <>
      <CalculatorSchema
        name="Investment Return Calculator"
        description="Calculate CAGR or project investment growth. Find the annualised return between two values, or forecast a future portfolio value from a starting amount and rate."
        url={`https://reckoner.tools/${cc}/savings/investment-return`}
      />
      <Header currentCountry={country} allCountries={allCountries} currentTool="savings/investment-return" />
      <main id="main">
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '48px 24px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 48, alignItems: 'start' }}>
            <div>
              <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 12px' }}>
                {h1}
              </h1>
              <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px', maxWidth: '72ch' }}>{intro}</p>
              <InvestmentReturnCalculator
                country={country}
                defaultInitialValue={defaults.initialValue}
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
          <TrustDisclosures context={{ type: 'investment-return' }} />
        </div>
      </main>
      <Footer countries={allCountries} currentCc={cc} />
    </>
  );
}
