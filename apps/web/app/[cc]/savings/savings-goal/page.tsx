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

const FAQS = [
  {
    question: 'How does compound interest help me reach my savings goal faster?',
    answer: 'With compound interest, the interest you earn in each period is added to your balance and earns interest itself in subsequent periods. Over time, this acceleration becomes substantial. £10,000 at 5% grows to £16,289 after 10 years with compound interest  -  compared to £15,000 with simple interest. The longer your timeline, the larger this difference becomes. Regular monthly contributions amplify the effect because each contribution starts earning interest from the day it is deposited.',
  },
  {
    question: 'What savings rate should I use?',
    answer: 'Use the rate your savings account, ISA, GIC, or investment account will actually pay. For a savings account or fixed-term deposit, use the AER (Annual Equivalent Rate) or effective rate, not the nominal rate. For an investment goal, a long-run average of 5–7% is commonly used for globally diversified equity portfolios, though this is speculative and involves risk that a savings account does not.',
  },
  {
    question: 'What if I miss a monthly contribution?',
    answer: 'Missing one contribution delays your goal slightly. The calculator assumes consistent monthly contributions  -  if you skip a month, your actual timeline will be a month or so longer than shown. The most important thing is consistency over time, not perfection. A missed month matters far less than permanently reducing your monthly savings amount.',
  },
  {
    question: 'Can I use this to plan for a house deposit?',
    answer: 'Yes. Set the goal amount to your target deposit, enter any existing savings, set the expected savings rate (use a high-interest savings account or ISA rate), and enter your monthly savings amount. The timeline shows when you will reach the deposit target. Note that if property prices are rising, your target may also increase  -  adjust the goal periodically to reflect current prices.',
  },
  {
    question: 'How is the monthly contribution calculated if I set the goal and timeline?',
    answer: 'If you know the goal and timeline but not the required monthly savings, use the annuity formula in reverse: the required monthly payment = (goal − current balance × (1 + r)^n) × r / ((1 + r)^n − 1), where r is the monthly rate and n is the number of months. This calculator takes the contribution as an input and shows the resulting timeline  -  you can adjust the contribution until the timeline matches your target date.',
  },
];

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

  let fxResult = null;
  if (country.currency !== 'EUR') {
    try { fxResult = await fetchFxRates(country.currency); } catch { /* hide conversion */ }
  }

  return (
    <>
      <BreadcrumbSchema items={[
        { name: 'Home', href: '/' },
        { name: 'Savings', href: `/${cc}/savings` },
        { name: h1, href: `/${cc}/savings/savings-goal` },
      ]} />
      <FAQSchema faqs={FAQS} />
      <CalculatorSchema
        name="Savings Goal Calculator"
        description="Calculate how long it will take to reach your savings goal with compound interest and regular monthly contributions."
        url={`https://reckoner.tools/${cc}/savings/savings-goal`}
      />
      <Header currentCountry={country} allCountries={allCountries} currentTool="savings/savings-goal" />
      <main id="main">
        <div className="page-outer">
          <div className="calc-grid">
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
          <TrustDisclosures context={{ type: 'savings-goal' }} />
        </div>
        <div className="page-section-flush">
          <div style={{ maxWidth: '72ch', padding: '32px 0 0' }}>
            <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '0 0 10px' }}>How the savings goal timeline is calculated</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>The calculator projects your balance month by month, adding your monthly contribution and applying interest at the stated rate. Interest is credited at the end of each month on the opening balance. This continues until the projected balance reaches or exceeds your goal. The result is the number of months until you hit the target, shown as years and months.</p>

            <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '0 0 10px' }}>What this doesn&apos;t include</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>The projection assumes a fixed rate, fixed monthly contribution, and no withdrawals. In practice, savings rates change  -  particularly for variable-rate accounts. Tax on interest is also not included: in many countries, savings interest above a threshold is subject to income tax, which reduces the effective rate. Check whether a tax-sheltered account (ISA in the UK, TFSA in Canada, offset account in Australia) is available for your goal  -  the tax saving can meaningfully accelerate your timeline.</p>

            <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '0 0 10px' }}>Why your bank&apos;s projection may show a different date</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>Banks calculate interest based on the daily balance in most countries, applying the daily rate (annual rate ÷ 365) to each day&apos;s balance. This can produce slightly different results than monthly compounding at the same stated rate. For standard savings accounts, the difference over typical goal timelines is small  -  usually less than one month. For longer timelines with larger balances, the difference grows.</p>

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
