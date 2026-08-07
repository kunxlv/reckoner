import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCountry, getAllCountries, COUNTRY_CODES, fetchFxRates } from '@reckoner/finance-data';
import type { CountryCode } from '@reckoner/finance-data';
import { getToolMetadata } from '@reckoner/seo';
import { AdSlot } from '@reckoner/analytics';
import { CalculatorSchema } from '../../../../src/components/CalculatorSchema';
import { BreadcrumbSchema } from '../../../../src/components/BreadcrumbSchema';
import { FAQSchema } from '../../../../src/components/FAQSchema';
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
  ca: 'Find your FIRE number  -  the portfolio size needed to cover your annual expenses indefinitely. Enter your expenses, withdrawal rate, and current savings to project your path.',
  au: 'Calculate the portfolio you need to retire early. Enter your annual expenses and withdrawal rate to find your FIRE number, then project how long it will take to reach it.',
  ie: 'Find out how much you need to achieve financial independence. Enter your annual expenses and withdrawal rate to calculate your FIRE number and savings timeline.',
  de: 'Berechnen Sie Ihre FIRE-Zahl  -  das Portfolioziel für finanzielle Unabhängigkeit. Geben Sie Ihre jährlichen Ausgaben und die Entnahmerate ein.',
  nl: 'Bereken uw FIRE-getal  -  het benodigde portfolio voor financiële onafhankelijkheid. Voer uw jaarlijkse uitgaven en opnamepercentage in.',
  nz: 'Calculate your FIRE number and see how long it will take to reach financial independence. Enter your annual expenses, withdrawal rate, and savings details.',
  fr: 'Calculez votre chiffre FIRE  -  le portefeuille nécessaire à l\'indépendance financière. Entrez vos dépenses annuelles et le taux de retrait.',
  es: 'Calcule su número FIRE  -  el patrimonio necesario para la independencia financiera. Introduzca sus gastos anuales y la tasa de retiro.',
  sg: 'Calculate your FIRE number and project how long it will take to achieve financial independence. Enter your annual expenses, withdrawal rate, and investment details.',
  in: 'Calculate your FIRE corpus  -  the investment needed to cover your annual expenses indefinitely. Enter your annual spending and withdrawal rate to find your target.',
};

const FAQS = [
  {
    question: 'What is the FIRE number?',
    answer: 'Your FIRE number is the investment portfolio size that can sustain your annual expenses indefinitely, assuming a safe withdrawal rate. At a 4% withdrawal rate, the formula is: FIRE number = annual expenses × 25. At 3.5%, it is annual expenses × 28.6. The concept comes from the FIRE movement (Financial Independence, Retire Early), which popularised the 4% rule from the 1994 Trinity Study.',
  },
  {
    question: 'Is the 4% rule safe?',
    answer: 'The 4% rule has historically supported a 30-year retirement in US market conditions. For longer retirements (40+ years), international portfolios, or low-return environments, 3–3.5% is more conservative. The rule is a starting point, not a guarantee. Sequence-of-returns risk  -  poor markets in the first 5 years of retirement  -  is the main threat. Some FIRE adherents use a lower withdrawal rate or maintain flexible spending to manage this.',
  },
  {
    question: 'What is lean FIRE versus fat FIRE?',
    answer: 'Lean FIRE means retiring early on a minimal budget  -  typically annual expenses of £20,000–30,000 or $25,000–40,000. Fat FIRE means retiring with a larger portfolio to support higher annual spending. Barista FIRE or Coast FIRE are hybrid approaches where you reach a partial milestone and supplement with part-time income. The calculator works for any version: just enter your target annual expenses.',
  },
  {
    question: 'Does the FIRE number account for inflation?',
    answer: 'The 4% rule was designed assuming annual inflation adjustments to your withdrawal amount  -  so you maintain the same purchasing power each year. If you withdraw a fixed nominal amount without inflation adjustments, your real purchasing power erodes over time. Enable the inflation adjustment field to see the portfolio in today\'s purchasing power, which gives a more conservative and realistic picture.',
  },
  {
    question: 'Should I include a state pension or Social Security in my FIRE calculation?',
    answer: 'Yes. If you will receive a state pension, Social Security, or other guaranteed income at some point, subtract that annual amount from your expected annual expenses. This reduces the FIRE number you need to accumulate from investments alone. A $20,000/year Social Security benefit on $50,000 annual expenses means your portfolio only needs to fund $30,000/year  -  reducing your FIRE number by roughly $500,000 at a 4% withdrawal rate.',
  },
];

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

  let fxResult = null;
  if (country.currency !== 'EUR') {
    try { fxResult = await fetchFxRates(country.currency); } catch { /* hide conversion */ }
  }

  return (
    <>
      <BreadcrumbSchema items={[
        { name: 'Home', href: '/' },
        { name: 'Savings', href: `/${cc}/savings` },
        { name: h1, href: `/${cc}/savings/fire-number` },
      ]} />
      <FAQSchema faqs={FAQS} />
      <CalculatorSchema
        name="FIRE Number Calculator"
        description="Calculate the portfolio size needed to retire early and achieve financial independence. Uses the 4% rule and customisable withdrawal rates."
        url={`https://reckoner.tools/${cc}/savings/fire-number`}
      />
      <Header currentCountry={country} allCountries={allCountries} currentTool="savings/fire-number" />
      <main id="main">
        <div className="page-outer">
          <div className="calc-grid">
            <div>
              <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 12px' }}>
                {h1}
              </h1>
              <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px', maxWidth: '72ch' }}>{intro}</p>
              <FireNumberCalculator
                country={country}
                defaultCurrentSavings={defaults.currentSavings}
                defaultAnnualRate={defaults.annualRate}
                fxResult={fxResult}
              />
            </div>
            <div className="ad-sidebar">
              <AdSlot width={300} height={600} />
            </div>
          </div>
        </div>
        <div className="page-section">
          <AdSlot width={728} height={90} style={{ margin: '0 0 32px' }} />
          <TrustDisclosures context={{ type: 'fire-number' }} />
        </div>
        <div className="page-section-flush">
          <div style={{ maxWidth: '72ch', padding: '32px 0 0' }}>
            <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '0 0 10px' }}>How your FIRE number is calculated</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>Your FIRE number equals your annual expenses divided by your withdrawal rate. At 4%, this is your expenses multiplied by 25. The calculator also shows how long it will take to reach that target from your current savings, at your expected investment return and monthly contribution. The timeline uses the compound interest formula, adding contributions monthly and growing the balance at the stated return until it equals the FIRE number.</p>

            <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '0 0 10px' }}>What this doesn&apos;t include</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>The FIRE number is a portfolio target  -  it does not include the impact of tax on investment income or withdrawals (which varies significantly by country and account type), healthcare costs that may be higher in early retirement, or the risk that returns are lower than assumed over your accumulation period. Nor does it model what happens if you continue to earn some income after reaching FIRE  -  which many people do, and which can meaningfully extend how long the portfolio lasts.</p>

            <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '0 0 10px' }}>Why your FIRE timeline may feel unrealistic</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>The timeline is mechanically correct given the inputs, but small changes in assumptions make large differences. Increasing the annual return from 5% to 7% can shorten a 20-year timeline to 16 years. Increasing your monthly contribution by 20% can shorten it by 3–4 years. The most powerful lever is your savings rate  -  the percentage of income you save  -  rather than the investment return. Use the calculator to find which input has the biggest impact for your situation.</p>

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
