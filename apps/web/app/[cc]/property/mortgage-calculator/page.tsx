import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCountry, getAllCountries, fetchRate, fetchFxRates, COUNTRY_CODES } from '@reckoner/finance-data';
import type { CountryCode } from '@reckoner/finance-data';
import { webApplicationSchema, faqSchema, breadcrumbSchema, jsonLdScript, getToolMetadata } from '@reckoner/seo';
import { AdSlot } from '@reckoner/analytics';
import { Header } from '../../../../src/components/Header';
import { Footer } from '../../../../src/components/Footer';
import { Calculator } from '../../../../src/components/Calculator/index';
import { CrossoverChart } from '../../../../src/components/CrossoverChart';
import { TrustDisclosures } from '../../../../src/components/TrustDisclosures';
import { calculate } from '@reckoner/mortgage-engine';

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return COUNTRY_CODES.map((cc) => ({ cc }));
}

const TITLES: Record<string, string> = {
  us: 'Mortgage Calculator with Amortization Schedule | Reckoner',
  uk: 'Mortgage Calculator UK:Monthly Repayments & Overpayments | Reckoner',
  ca: 'Canadian Mortgage Calculator:Semi-Annual Compounding | Reckoner',
  au: 'Home Loan Repayment Calculator Australia | Reckoner',
  ie: 'Mortgage Calculator Ireland:Repayments & LTV Limits | Reckoner',
  de: 'Baufinanzierung Calculator:Rate, Tilgung & Restschuld | Reckoner',
  nl: 'Dutch Mortgage Calculator:Annuïteiten vs Lineair | Reckoner',
  nz: 'Home Loan Calculator NZ:Weekly, Fortnightly, Monthly | Reckoner',
  fr: 'French Mortgage Calculator:Mensualité and Coût Total | Reckoner',
  es: 'Spanish Mortgage Calculator:Resident and Non-Resident | Reckoner',
  sg: 'Home Loan Calculator Singapore:TDSR and Monthly Instalment | Reckoner',
  in: 'Home Loan EMI Calculator:Schedule and Prepayment Savings | Reckoner',
};

const DESCRIPTIONS: Record<string, string> = {
  us: 'Work out your monthly mortgage payment, total interest and full amortization schedule. Prefilled with this week\'s Freddie Mac 30-year average. Free, no signup.',
  uk: 'Work out UK mortgage repayments, total interest and overpayment savings. Shows what happens when your fixed period ends. Free, no signup.',
  ca: 'Canadian mortgage payments calculated with proper semi-annual compounding, not the US monthly shortcut. Bank of Canada posted rates. Free.',
  au: 'Australian home loan repayments with monthly, fortnightly and weekly options. See how much fortnightly repayments save. RBA rate data.',
  ie: 'Irish mortgage repayments with Central Bank loan-to-income and loan-to-value limits built in. ECB-sourced rates. Free, no signup.',
  de: 'Calculate your Annuitätendarlehen monthly rate and the Restschuld left at the end of your Zinsbindung. ECB-sourced rates. Free.',
  nl: 'Compare annuity and linear Dutch mortgage repayments side by side, with full amortisation schedule. ECB-sourced rates. Free.',
  nz: 'New Zealand home loan repayments across weekly, fortnightly and monthly schedules, with total interest and payoff date. Free.',
  fr: 'French mortgage repayments including assurance emprunteur, with total cost of credit and full schedule. ECB-sourced rates. Free.',
  es: 'Spanish mortgage repayments for residents and non-resident buyers, with LTV limits and purchase costs. ECB-sourced rates. Free.',
  sg: 'Singapore home loan instalments with TDSR and MSR limits, total interest and full repayment schedule. Free, no signup.',
  in: 'Calculate your home loan EMI, full amortisation schedule, and how much a prepayment saves in interest. Free, no signup.',
};

export async function generateMetadata({ params }: { params: Promise<{ cc: string }> }): Promise<Metadata> {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) return {};
  const country = getCountry(cc as CountryCode);
  const h1 = COUNTRY_H1[cc] ?? 'Mortgage Calculator';
  return getToolMetadata(
    cc as CountryCode,
    'property',
    'mortgage-calculator',
    TITLES[cc as CountryCode] ?? `${h1} | Reckoner`,
    DESCRIPTIONS[cc as CountryCode] ?? '',
  );
}

const COUNTRY_H1: Record<string, string> = {
  us: 'Mortgage Calculator',
  uk: 'UK Mortgage Calculator',
  ca: 'Canadian Mortgage Calculator',
  au: 'Australian Home Loan Repayment Calculator',
  ie: 'Irish Mortgage Calculator',
  de: 'German Mortgage Calculator',
  nl: 'Dutch Mortgage Calculator',
  nz: 'New Zealand Home Loan Calculator',
  fr: 'French Mortgage Calculator',
  es: 'Spanish Mortgage Calculator',
  sg: 'Singapore Home Loan Calculator',
  in: 'Home Loan EMI Calculator',
};

const ANSWER_FIRST: Record<string, string> = {
  us: 'A $400,000 mortgage at 6.5% over 30 years costs about $2,528 a month in principal and interest, and roughly $510,000 in total interest over the full term. Change the figures below to see your own numbers, a month-by-month schedule, and what a single extra payment would save you.',
  uk: 'A £300,000 mortgage at 4.5% over 25 years costs about £1,667 a month, with roughly £200,000 in total interest. Enter your own figures below, including what happens when your fixed period ends.',
  ca: 'A $500,000 mortgage at 5.0% over 25 years costs about $2,908 a month in Canada. Canadian fixed-rate mortgages compound semi-annually rather than monthly, which is why this is slightly lower than a US-style calculator would tell you.',
  au: 'A $600,000 home loan at 6.0% over 30 years costs about $3,597 a month. Switching to fortnightly repayments cuts roughly four years off the loan and saves around $150,000 in interest.',
  ie: 'A €350,000 mortgage at 3.9% over 30 years costs about €1,651 a month, with roughly €244,000 in total interest.',
  de: 'A €400,000 mortgage at 3.6% over 25 years costs about €1,987 a month. This edition uses the standard annuity model. The full Annuitätendarlehen calculator with Zinsbindung and Restschuld is coming.',
  nl: 'A €400,000 mortgage at 3.8% over 30 years costs about €1,865 a month on an annuity repayment.',
  nz: 'A $750,000 home loan at 6.2% over 30 years costs about $4,584 a month. Most New Zealand lenders offer weekly and fortnightly repayments at no extra cost.',
  fr: "A €350,000 mortgage at 3.7% over 25 years costs about €1,785 a month. Borrower's insurance (assurance emprunteur) is required in practice and adds to your total cost.",
  es: 'A €300,000 mortgage at 3.8% over 30 years costs about €1,397 a month.',
  sg: 'A S$1,200,000 home loan at 3.8% over 25 years costs about S$6,204 a month. The Total Debt Servicing Ratio limits your combined monthly debt repayments to 55% of gross income.',
  in: 'A ₹80,00,000 home loan at 8.5% over 20 years costs about ₹69,484 a month (EMI). Floating-rate home loans in India carry no prepayment penalty for individual borrowers.',
};

const LOCAL_CALLOUT: Record<string, { heading: string; body: string } | null> = {
  us: null,
  uk: { heading: 'Remember the revert rate', body: "Most UK mortgages are fixed for two or five years, then move to the lender's standard variable rate, often several points higher. This shows your payment during the fixed period. Budget for the jump, or plan to remortgage before it lands." },
  ca: { heading: 'Why other calculators get Canada wrong', body: 'By law, Canadian fixed-rate mortgages compound semi-annually, not in advance. Most international calculators just divide the annual rate by twelve, which overstates your payment by a few dollars a month and thousands over the term. We convert the rate properly. The formula is on our methodology page.' },
  au: { heading: 'Fortnightly repayments do more than they look like they should', body: "Paying half your monthly amount every fortnight means 26 half-payments a year, the equivalent of thirteen monthly payments instead of twelve. That extra month goes almost entirely to principal. Switch the frequency above to see it." },
  ie: { heading: 'Loan-to-income limits', body: 'Central Bank rules cap most borrowing at four times gross income for first-time buyers and three and a half times for others, with loan-to-value limits on top. If your figures exceed those, a lender will need an exception, which is rationed.' },
  de: { heading: "German mortgages don't end when the fixed period does", body: "You fix your rate for a set period, usually ten or fifteen years, but the loan isn't repaid by then. What's left is your Restschuld, and you refinance it at whatever rates exist at that point. The full Zinsbindung calculator is on the way." },
  nl: { heading: 'Annuïteiten or lineair', body: 'Annuity repayments stay flat; linear repayments start higher and fall every month. Linear costs less in total interest but demands more up front.' },
  nz: { heading: 'Weekly and fortnightly repayments', body: 'Most New Zealand lenders let you repay weekly or fortnightly at no extra cost, which shortens the term without you noticing the difference month to month.' },
  fr: { heading: "Assurance emprunteur isn't optional", body: "Borrower's insurance is required in practice and is usually quoted on the initial capital rather than the outstanding balance. It's why the TAEG is meaningfully higher than the headline rate." },
  es: { heading: 'Buying as a non-resident', body: 'Non-resident buyers are typically capped at around 70% loan-to-value against 80% for residents, and purchase costs run roughly 10–14% of the price on top of the deposit.' },
  sg: { heading: 'TDSR caps what you can borrow', body: 'Total Debt Servicing Ratio limits your combined monthly debt repayments to 55% of gross income, and the Mortgage Servicing Ratio caps HDB loans at 30%. Those usually bind before the repayment maths does.' },
  in: { heading: 'Prepayment is where the money is', body: 'Floating-rate home loans in India carry no prepayment penalty for individual borrowers. A single annual lump sum in the early years removes far more interest than the same amount later.' },
};

const FAQS = [
  { question: 'Is this free?', answer: 'Yes. No account, no email, no quote request. The site is supported by advertising.' },
  { question: 'How accurate is it?', answer: "The maths is exact for the figures you enter. We test every formula against worked examples published by the relevant central bank or regulator, and those tests are on the methodology page. What we can't know is your lender's specific fees, so treat the result as principal and interest unless you've filled in the optional fields." },
  { question: 'Where do the interest rates come from?', answer: 'Each country page prefills a reference rate from an official source (a central bank or national statistics body) and shows the source and publication date next to the field. These are averages, not offers.' },
  { question: "Why is this different from my bank's calculator?", answer: 'Usually the bank is including tax and insurance, adding its own fees, or using a different compounding convention. Ours is documented on the methodology page.' },
  { question: 'Can I use this for a property in another country?', answer: "Yes. Choose the country the property is in, not where you live. The mortgage follows the property's rules and currency." },
  { question: 'Can I put this calculator on my own site?', answer: 'Yes, free. The embed code is at the bottom of every country page and includes a link back to us.' },
];

export default async function MortgageCalculatorPage({ params }: { params: Promise<{ cc: string }> }) {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) notFound();

  const country = getCountry(cc as CountryCode);
  const allCountries = getAllCountries();

  // Fetch rate and FX server-side
  let rateResult = null;
  try { rateResult = await fetchRate(cc as CountryCode); } catch { /* show empty rate */ }

  let fxResult = null;
  if (country.currency !== 'EUR') {
    try { fxResult = await fetchFxRates(country.currency); } catch { /* hide conversion */ }
  }

  // Pre-compute prefilled result for SSR
  const defaultRate = rateResult?.value ?? country.defaults.rate;
  const loanAmount = country.defaults.price - country.defaults.deposit;
  const prefillResult = loanAmount > 0 ? calculate({
    principal: loanAmount,
    annualRate: defaultRate,
    termYears: country.defaults.termYears,
    periodsPerYear: country.defaults.periodsPerYear,
    convention: country.convention,
  }) : null;

  const callout = LOCAL_CALLOUT[cc] ?? null;
  const h1 = COUNTRY_H1[cc] ?? 'Mortgage Calculator';
  const answerFirst = ANSWER_FIRST[cc] ?? '';

  const jsonLdData = [
    webApplicationSchema(cc as CountryCode, h1, `${h1}: free, no signup.`),
    faqSchema(FAQS),
    breadcrumbSchema([
      { name: 'Home', href: '/' },
      { name: h1, href: `/${cc}/property/mortgage-calculator` },
    ]),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLdData) }} />
      <Header currentCountry={country} allCountries={allCountries} currentTool="property/mortgage-calculator" />
      <main id="main">
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '48px 24px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 48, alignItems: 'start' }}>
            <div>
              <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 12px' }}>
                {h1}
              </h1>
              <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px', maxWidth: '72ch' }}>
                {answerFirst}
              </p>

              {country.tier > 1 && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-ink-mid)', border: '1px solid var(--color-hairline)', borderRadius: 100, padding: '3px 10px', marginBottom: 16 }}>
                  Standard model
                </div>
              )}

              <Calculator
                country={country}
                rateResult={rateResult}
                fxResult={fxResult}
              />
            </div>
            <div style={{ position: 'sticky', top: 72 }}>
              <AdSlot width={300} height={600} />
            </div>
          </div>
        </div>

        {/* Chart section */}
        {prefillResult && (
          <div style={{ maxWidth: 1160, margin: '32px auto 0', padding: '0 24px' }}>
            <div style={{ background: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 0, padding: '28px 32px' }}>
              <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>Where your money goes</div>
              <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 16 }}>Cumulative payments over the life of the loan</div>
              <CrossoverChart
                rows={prefillResult.rows}
                crossoverPeriod={prefillResult.crossoverPeriod}
                currency={country.currency}
                locale={country.locale}
                periodsPerYear={country.defaults.periodsPerYear}
              />
            </div>

            <AdSlot width={728} height={90} style={{ margin: '32px 0' }} />

            {/* Trust disclosures */}
            <TrustDisclosures context={{ type: 'mortgage', convention: country.convention }} rateResult={rateResult} />

            {/* Prose */}
            <div style={{ maxWidth: '72ch', padding: '48px 0 0' }}>
              {callout && (
                <div style={{ border: '1px solid var(--color-hairline)', borderRadius: 0, padding: '16px 20px', marginBottom: 32 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 500, margin: '0 0 6px' }}>{callout.heading}</h2>
                  <p style={{ fontSize: 15, lineHeight: 1.6, margin: 0, color: 'var(--color-ink-deep)' }}>{callout.body}</p>
                </div>
              )}

              <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '0 0 10px' }}>How your payment is worked out</h2>
              <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>Your payment is fixed so the loan reaches zero at the end of the term. Early payments are mostly interest because interest is charged on a bigger balance. As the balance falls, more of each payment goes to principal. The chart above shows exactly where that flips for your loan.</p>

              <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '0 0 10px' }}>What this doesn&apos;t include</h2>
              <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>This is principal and interest only unless you fill in the optional fields. Your actual monthly cost will also include property tax, homeowners insurance, and private mortgage insurance if your down payment is under 20%. All three vary by state and lender.</p>

              <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '0 0 10px' }}>Why our number may differ from your bank&apos;s</h2>
              <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>Usually one of three things: your bank is bundling tax and insurance into the figure, it&apos;s adding its own fees, or it&apos;s using a different compounding convention. Ours is published on the methodology page, with worked examples you can check.</p>

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
        )}
      </main>
      <Footer countries={allCountries} currentCc={cc} />
    </>
  );
}
