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
  ca: 'Enter vehicle price, down payment, and trade-in to see your financed amount and monthly payment. Provincial sales tax varies  -  enter the rate for your province.',
  au: 'Enter vehicle price, deposit, and loan terms. Australian car purchases attract GST (10%) on top of the listed price in some scenarios  -  confirm with your dealer.',
  ie: 'Enter the vehicle price and finance terms to see your monthly payment. Irish car prices include VAT; set the tax field to 0.',
  de: 'Fahrzeugpreis, Anzahlung und Zinssatz eingeben, um die Monatsrate zu berechnen.',
  nl: 'Voer de aanschafprijs, aanbetaling en rente in om uw maandlast te berekenen.',
  nz: 'Enter vehicle price, deposit, and loan terms. New Zealand has GST (15%)  -  if the price is GST-inclusive, set the tax field to 0.',
  fr: "Entrez le prix du véhicule, l'apport et les conditions du prêt pour calculer votre mensualité.",
  es: 'Introduzca el precio del vehículo, la entrada y las condiciones del préstamo para calcular su cuota mensual.',
  sg: 'Enter vehicle price, loan amount, and terms. Singapore has a COE system  -  enter the OMV + COE as the vehicle price.',
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

const FAQS = [
  {
    question: 'What is APR on a car loan and why does it differ from the interest rate?',
    answer: 'APR (Annual Percentage Rate) is the total cost of the loan expressed as an annual rate, including the interest rate and any mandatory fees such as origination or documentation fees. If there are no fees, APR equals the interest rate. Adding a documentation fee increases the APR even if the stated interest rate stays the same  -  which is why comparing APR across lenders is more informative than comparing headline rates.',
  },
  {
    question: 'How does a trade-in reduce my monthly payment?',
    answer: 'Your trade-in value is credited against the purchase price before calculating the financed amount. If you buy a $35,000 car with a $5,000 trade-in, you finance $30,000 before the down payment. This directly reduces the loan principal, monthly payment, and total interest paid. Some dealers inflate the trade-in value and raise the selling price  -  check both figures independently.',
  },
  {
    question: 'How much should I put down on a car?',
    answer: 'A down payment of at least 10–20% is generally recommended. This keeps your monthly payment manageable and reduces the risk of going "upside down" (owing more than the car is worth) early in the loan term. Cars depreciate quickly  -  a new car loses roughly 20% of its value in the first year. A small or zero down payment can leave you owing more than the car is worth for the first 1–2 years.',
  },
  {
    question: 'Should I take a longer loan term to get a lower monthly payment?',
    answer: 'Longer terms (72–84 months) lower the monthly payment but significantly increase total interest paid and the risk of negative equity. At 7% interest, a $30,000 loan over 48 months costs roughly $1,700 in total interest; over 72 months it costs roughly $2,600. If you need a lower payment, a larger down payment is preferable to extending the term.',
  },
  {
    question: 'What does the documentation fee do to my APR?',
    answer: 'The doc fee is a fixed charge added to the financed amount. On a small loan over a short term, it can meaningfully raise the effective APR. A $500 doc fee on a $15,000 loan over 36 months adds roughly 0.4% to the effective APR. Add it in the optional field above to see your true cost of borrowing.',
  },
];

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

  let fxResult = null;
  if (country.currency !== 'EUR') {
    try { fxResult = await fetchFxRates(country.currency); } catch { /* hide conversion */ }
  }

  return (
    <>
      <BreadcrumbSchema items={[
        { name: 'Home', href: '/' },
        { name: 'Loans', href: `/${cc}/loans` },
        { name: h1, href: `/${cc}/loans/auto-loan` },
      ]} />
      <FAQSchema faqs={FAQS} />
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
              <AutoLoanCalculator country={country} defaults={defaults} fxResult={fxResult} />
            </div>
            <div className="ad-sidebar">
              <AdSlot width={300} height={600} />
            </div>
          </div>
        </div>

        <div className="page-section">
          <AdSlot width={728} height={90} style={{ margin: '0 0 32px' }} />
          <TrustDisclosures context={{ type: 'auto-loan' }} />
        </div>

        <div className="page-section-flush">
          <div style={{ maxWidth: '72ch', padding: '32px 0 0' }}>
            <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '0 0 10px' }}>How your auto loan payment is calculated</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>The financed amount is the vehicle price minus your down payment and trade-in value, plus any sales tax rolled into the loan. The monthly payment uses the standard annuity formula, spreading equal payments across the term. Each payment covers that month&apos;s interest on the outstanding balance, with the rest reducing principal. The amortisation chart shows how the balance falls over time.</p>

            <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '0 0 10px' }}>What this doesn&apos;t include</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>This calculator covers the loan only. Your true monthly cost of ownership will also include car insurance, fuel, maintenance and servicing, road tax or registration fees, and possibly GAP insurance if your lender requires it. GAP insurance covers the difference between what you owe and what the car is worth if it is written off or stolen  -  particularly relevant if you have a small or zero deposit.</p>

            <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '0 0 10px' }}>Why your dealer&apos;s figures may look different</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>Dealer finance quotes sometimes bundle optional products  -  extended warranties, GAP insurance, paint protection  -  into the monthly payment without itemising them. They may also quote a flat rate (common in some markets) rather than the effective APR. Flat rates make loans look cheaper than they are. Always ask for the total amount payable and the APR before agreeing to finance.</p>

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
