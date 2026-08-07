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

const FAQS = [
  {
    question: 'What is CAGR and how is it different from average annual return?',
    answer: 'CAGR (Compound Annual Growth Rate) is the single constant annual rate that would grow an investment from its start value to its end value over the given period. Average annual return simply averages the yearly percentage changes. These differ because of compounding: if an investment falls 50% then rises 100%, the average return is 25% but the CAGR is 0%  -  you are back to where you started. CAGR is a more accurate measure of actual investment performance.',
  },
  {
    question: 'How do I calculate CAGR manually?',
    answer: 'CAGR = (end value / start value)^(1 / years) − 1. For example, £10,000 growing to £18,000 over 8 years: (18,000 / 10,000)^(1/8) − 1 = 1.8^0.125 − 1 ≈ 0.0764 = 7.64% per year. Enter any two values and the number of years in the CAGR mode above and the calculator will do this automatically.',
  },
  {
    question: 'What is a good CAGR for an investment?',
    answer: 'It depends on the asset class and time period. Global equity indices have delivered roughly 7–10% CAGR over long periods in nominal terms. After inflation, real returns are typically 4–7%. Individual stocks can be higher or lower. For property, long-run nominal CAGR has been 4–6% in most developed markets. Anything above 15% CAGR consistently over 10+ years is exceptional  -  benchmark against the relevant index, not an absolute number.',
  },
  {
    question: 'Does CAGR include dividends or only price appreciation?',
    answer: 'It depends on the values you enter. If you enter a start and end value that include dividends reinvested, CAGR captures total return. If you enter only the price movement, CAGR reflects only the capital gain. For most investment comparisons, total return CAGR  -  including dividends reinvested  -  is the relevant measure. Check whether your platform reports a total return value or a price-only value.',
  },
  {
    question: 'How does CAGR compare to IRR?',
    answer: 'CAGR measures the annualised rate of return between two points in time with a single start and end value. IRR (Internal Rate of Return) handles multiple cash flows at different times  -  making it more useful for investments with ongoing contributions or withdrawals. Use CAGR for a simple lump-sum investment. Use IRR (or XIRR in a spreadsheet) for evaluating an investment portfolio with contributions over time.',
  },
];

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

  let fxResult = null;
  if (country.currency !== 'EUR') {
    try { fxResult = await fetchFxRates(country.currency); } catch { /* hide conversion */ }
  }

  return (
    <>
      <BreadcrumbSchema items={[
        { name: 'Home', href: '/' },
        { name: 'Savings', href: `/${cc}/savings` },
        { name: h1, href: `/${cc}/savings/investment-return` },
      ]} />
      <FAQSchema faqs={FAQS} />
      <CalculatorSchema
        name="Investment Return Calculator"
        description="Calculate CAGR or project investment growth. Find the annualised return between two values, or forecast a future portfolio value from a starting amount and rate."
        url={`https://reckoner.tools/${cc}/savings/investment-return`}
      />
      <Header currentCountry={country} allCountries={allCountries} currentTool="savings/investment-return" />
      <main id="main">
        <div className="page-outer">
          <div className="calc-grid">
            <div>
              <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 12px' }}>
                {h1}
              </h1>
              <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px', maxWidth: '72ch' }}>{intro}</p>
              <InvestmentReturnCalculator
                country={country}
                defaultInitialValue={defaults.initialValue}
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
          <TrustDisclosures context={{ type: 'investment-return' }} />
        </div>
        <div className="page-section-flush">
          <div style={{ maxWidth: '72ch', padding: '32px 0 0' }}>
            <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '0 0 10px' }}>How CAGR is calculated</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>In CAGR mode, the calculator solves for the constant annual rate that transforms the start value into the end value over the stated number of years: CAGR = (end / start)^(1 / years) − 1. In projection mode, it reverses this: final value = start × (1 + rate)^years. Both are exact closed-form calculations with no approximations. The result represents a smoothed single-rate equivalent  -  the actual path of returns year to year may have been very different.</p>

            <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '0 0 10px' }}>What this doesn&apos;t include</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>CAGR is a backward-looking or assumption-based metric. It does not account for tax on capital gains or dividend income, ongoing investment fees (which can reduce effective CAGR by 0.3–2.0% annually for managed funds), or the volatility and sequence of returns along the way. Two investments with identical CAGR can have very different risk profiles. A stock that doubles every other year and halves in between has the same CAGR as one that grows steadily  -  but is far more stressful to hold.</p>

            <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '0 0 10px' }}>Why your platform&apos;s return figure may look different</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>Investment platforms may show time-weighted return, money-weighted return (IRR), or simple return depending on the context. Time-weighted return removes the effect of cash flows, making it suitable for comparing fund performance. Money-weighted return (IRR) captures the investor&apos;s actual experience including the timing of contributions and withdrawals. CAGR between two specific dates is a special case of time-weighted return for a single lump sum. If you have made contributions along the way, CAGR between start and end values overstates your actual return.</p>

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
