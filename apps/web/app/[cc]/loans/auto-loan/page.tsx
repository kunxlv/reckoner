import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCountry, getAllCountries, COUNTRY_CODES } from '@reckoner/finance-data';
import type { CountryCode } from '@reckoner/finance-data';
import { getToolMetadata } from '@reckoner/seo';
import { AdSlot } from '@reckoner/analytics';
import { BreadcrumbSchema } from '../../../../src/components/BreadcrumbSchema';
import { CalculatorSchema } from '../../../../src/components/CalculatorSchema';
import { Header } from '../../../../src/components/Header';
import { Footer } from '../../../../src/components/Footer';
import { AutoLoanCalculator } from '../../../../src/components/AutoLoanCalculator';
import type { AutoLoanDefaults } from '../../../../src/components/AutoLoanCalculator';
import { TrustDisclosures } from '../../../../src/components/TrustDisclosures';

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return COUNTRY_CODES.map((cc) => ({ cc }));
}

const H1: Record<string, string> = {
  us: 'Auto Loan Calculator',
  uk: 'Car Finance Calculator',
  ca: 'Auto Loan Calculator',
  au: 'Car Loan Calculator',
  ie: 'Car Finance Calculator',
  de: 'Autokredit Rechner',
  nl: 'Autolening Berekenen',
  nz: 'Car Loan Calculator',
  fr: 'Calculateur de Prêt Auto',
  es: 'Calculadora de Préstamo de Auto',
  sg: 'Car Loan Calculator',
  in: 'Car Loan EMI Calculator',
};

const INTRO: Record<string, string> = {
  us: 'Enter your vehicle price, down payment, trade-in, tax rate, and loan terms to see your monthly payment, total interest, and APR. Add the dealer doc fee to see how it raises your APR.',
  uk: 'Enter the vehicle price, deposit, and finance terms to see your monthly payment. UK car prices include VAT, so set the tax field to 0.',
  ca: 'Enter vehicle price, down payment, and trade-in to see your financed amount and monthly payment. Provincial sales tax varies — enter the rate for your province.',
  au: 'Enter vehicle price, deposit, and loan terms. Australian car purchases attract GST (10%) on top of the listed price in some scenarios — confirm with your dealer.',
  ie: 'Enter the vehicle price and finance terms to see your monthly payment. Irish car prices include VAT; set the tax field to 0.',
  de: 'Fahrzeugpreis, Anzahlung und Zinssatz eingeben, um die Monatsrate zu berechnen.',
  nl: 'Voer de aanschafprijs, aanbetaling en rente in om uw maandlast te berekenen.',
  nz: 'Enter vehicle price, deposit, and loan terms. New Zealand has GST (15%) — if the price is GST-inclusive, set the tax field to 0.',
  fr: "Entrez le prix du véhicule, l'apport et les conditions du prêt pour calculer votre mensualité.",
  es: 'Introduzca el precio del vehículo, la entrada y las condiciones del préstamo para calcular su cuota mensual.',
  sg: 'Enter vehicle price, loan amount, and terms. Singapore has a COE system — enter the OMV + COE as the vehicle price.',
  in: 'Enter vehicle ex-showroom price plus road tax and insurance for the on-road price. Enter your down payment and loan terms.',
};

const DEFAULTS: Record<string, AutoLoanDefaults> = {
  us: { vehiclePrice: 35000, downPayment: 5000, tradeInValue: 0, salesTaxRate: 0.06, annualRate: 0.07, termMonths: 60 },
  uk: { vehiclePrice: 25000, downPayment: 3000, tradeInValue: 0, salesTaxRate: 0, annualRate: 0.08, termMonths: 48 },
  ca: { vehiclePrice: 40000, downPayment: 5000, tradeInValue: 0, salesTaxRate: 0.13, annualRate: 0.08, termMonths: 60 },
  au: { vehiclePrice: 40000, downPayment: 5000, tradeInValue: 0, salesTaxRate: 0.10, annualRate: 0.09, termMonths: 60 },
  ie: { vehiclePrice: 25000, downPayment: 5000, tradeInValue: 0, salesTaxRate: 0, annualRate: 0.07, termMonths: 48 },
  de: { vehiclePrice: 30000, downPayment: 5000, tradeInValue: 0, salesTaxRate: 0, annualRate: 0.06, termMonths: 48 },
  nl: { vehiclePrice: 30000, downPayment: 5000, tradeInValue: 0, salesTaxRate: 0, annualRate: 0.06, termMonths: 48 },
  nz: { vehiclePrice: 35000, downPayment: 5000, tradeInValue: 0, salesTaxRate: 0, annualRate: 0.09, termMonths: 60 },
  fr: { vehiclePrice: 25000, downPayment: 5000, tradeInValue: 0, salesTaxRate: 0, annualRate: 0.06, termMonths: 48 },
  es: { vehiclePrice: 25000, downPayment: 5000, tradeInValue: 0, salesTaxRate: 0, annualRate: 0.07, termMonths: 48 },
  sg: { vehiclePrice: 100000, downPayment: 30000, tradeInValue: 0, salesTaxRate: 0.09, annualRate: 0.07, termMonths: 60 },
  in: { vehiclePrice: 1200000, downPayment: 200000, tradeInValue: 0, salesTaxRate: 0.12, annualRate: 0.09, termMonths: 60 },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cc: string }>;
}): Promise<Metadata> {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) return {};
  const h1 = H1[cc] ?? 'Auto Loan Calculator';
  return getToolMetadata(
    cc as CountryCode,
    'loans',
    'auto-loan',
    `${h1} | Reckoner`,
    `Calculate monthly car finance payments, total interest, APR, and trade-in impact. Free, no signup.`,
  );
}

export default async function AutoLoanPage({
  params,
}: {
  params: Promise<{ cc: string }>;
}) {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) notFound();

  const country = getCountry(cc as CountryCode);
  const allCountries = getAllCountries();
  const defaults = DEFAULTS[cc] ?? DEFAULTS.us!;
  const h1 = H1[cc] ?? 'Auto Loan Calculator';
  const intro = INTRO[cc] ?? INTRO.us!;

  return (
    <>
      <BreadcrumbSchema items={[
        { name: 'Home', href: '/' },
        { name: 'Loans', href: `/${cc}/loans` },
        { name: h1, href: `/${cc}/loans/auto-loan` },
      ]} />
      <CalculatorSchema
        name="Auto Loan Calculator"
        description="Calculate your financed amount, monthly payment, and total interest on a vehicle loan."
        url={`https://reckoner.tools/${cc}/loans/auto-loan`}
      />
      <Header
        currentCountry={country}
        allCountries={allCountries}
        currentTool="loans/auto-loan"
      />
      <main id="main">
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '48px 24px 0' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 300px',
              gap: 48,
              alignItems: 'start',
            }}
          >
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
              <AutoLoanCalculator country={country} defaults={defaults} />
            </div>
            <div style={{ position: 'sticky', top: 72 }}>
              <AdSlot width={300} height={600} />
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1160, margin: '32px auto 0', padding: '0 24px' }}>
          <AdSlot width={728} height={90} style={{ margin: '0 0 32px' }} />
          <TrustDisclosures context={{ type: 'auto-loan' }} />
        </div>
      </main>
      <Footer countries={allCountries} currentCc={cc} />
    </>
  );
}
