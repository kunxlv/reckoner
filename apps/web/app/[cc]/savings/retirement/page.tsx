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
    answer: "The 4% rule  -  withdraw 4% of your initial portfolio in year one, then adjust for inflation annually  -  has historically sustained a 30-year US retirement in most market scenarios. 3.5% is more conservative for longer retirements or non-US portfolios. Use the drawdown phase of this calculator to model your specific horizon.",
  },
  {
    question: 'How does inflation affect a retirement portfolio?',
    answer: 'At 3% annual inflation, purchasing power halves in roughly 24 years. If you withdraw a fixed nominal amount, inflation silently erodes what it can buy. Toggle the real balance view to see your portfolio in today\'s purchasing power  -  a more honest picture of retirement security.',
  },
  {
    question: 'What is sequence-of-returns risk?',
    answer: 'If markets fall sharply in your early retirement years, you sell more units to fund withdrawals  -  permanently reducing the portfolio\'s ability to recover in better years. The same average return over 30 years produces very different outcomes depending on whether the bad years come first or last. This is why holding some cash or bonds in early retirement is often recommended.',
  },
  {
    question: 'Should I include pension or Social Security income in this calculator?',
    answer: 'Yes  -  subtract any guaranteed annual income (pension, Social Security, annuity) from your planned annual expenses to find how much your investment portfolio needs to supply. A £15,000/year pension on £30,000 annual expenses means your portfolio only needs to fund £15,000 per year.',
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

  let fxResult = null;
  if (country.currency !== 'EUR') {
    try { fxResult = await fetchFxRates(country.currency); } catch { /* hide conversion */ }
  }

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
        <div className="page-outer">
          <div className="calc-grid">
            <div>
              <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 12px' }}>
                {h1}
              </h1>
              <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px', maxWidth: '72ch' }}>{intro}</p>
              <RetirementCalculator
                country={country}
                defaultSavings={defaults.savings}
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
          <TrustDisclosures context={{ type: 'retirement' }} />
        </div>
        <div className="page-section-flush">
          <div style={{ maxWidth: '72ch', padding: '32px 0 0' }}>
            <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '0 0 10px' }}>How the retirement projection works</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>The calculator runs two phases. In the accumulation phase, your current savings grow at the stated annual return with your monthly contributions added each month  -  using the compound interest formula. When the retirement phase begins, the drawdown phase starts: the portfolio earns the same return but annual expenses are deducted monthly. The calculation tracks month by month until the portfolio either reaches the end of your retirement horizon or depletes to zero, whichever comes first.</p>

            <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '0 0 10px' }}>What this doesn&apos;t include</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>This is a deterministic projection using a fixed annual return. It does not model sequence-of-returns risk  -  the risk that poor returns in the early years of retirement permanently damage the portfolio. State pension, Social Security, or annuity income is also not included. Subtract any guaranteed annual income from your planned annual expenses to find the portfolio&apos;s actual burden. Tax on withdrawals and investment management fees are also excluded.</p>

            <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '0 0 10px' }}>Why your pension provider&apos;s figure may differ</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>Pension providers and financial advisers typically use a range of projected returns (low, medium, and high) under regulatory guidance, not a single rate. These projections are also adjusted for charges, which can reduce the effective annual return by 0.5–2%. If the calculator&apos;s result looks higher than your provider&apos;s projection, the most likely explanation is fees or a lower assumed return. Check the assumed growth rate in your provider&apos;s projection and enter the same rate here to compare.</p>

            <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '16px 0 6px' }}>Frequently asked questions</h2>
            {RETIREMENT_FAQS.map(({ question, answer }) => (
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
