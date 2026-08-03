import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCountry, getAllCountries, COUNTRY_CODES } from '@reckoner/finance-data';
import type { CountryCode } from '@reckoner/finance-data';
import { Header } from '../../src/components/Header';
import { Footer } from '../../src/components/Footer';

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return COUNTRY_CODES.map((cc) => ({ cc }));
}

const NAME_MAP: Record<string, string> = {
  us: 'United States', uk: 'United Kingdom', ca: 'Canada', au: 'Australia',
  ie: 'Ireland', de: 'Germany', nl: 'Netherlands', nz: 'New Zealand',
  fr: 'France', es: 'Spain', sg: 'Singapore', in: 'India',
};

const FLAG_MAP: Record<string, string> = {
  us: '🇺🇸', uk: '🇬🇧', ca: '🇨🇦', au: '🇦🇺', ie: '🇮🇪',
  de: '🇩🇪', nl: '🇳🇱', nz: '🇳🇿', fr: '🇫🇷', es: '🇪🇸',
  sg: '🇸🇬', in: '🇮🇳',
};

const COUNTRY_INTRO: Record<string, string> = {
  us: "US mortgage rates are published weekly by Freddie Mac, and standard loans compound monthly. Stamp duty — called transfer tax — varies by state, as do income multiples and debt-to-income limits. The calculators below use federal conventions and current published average rates.",
  uk: "UK mortgages typically run on fixed periods of 2–5 years before reverting to the lender's standard variable rate. Stamp duty applies in progressive bands, with first-time buyer relief. Interest is calculated monthly on the outstanding balance.",
  ca: "Canadian fixed-rate mortgages compound semi-annually by law, not monthly, which makes the effective rate slightly lower than a US-style calculation implies. CMHC mortgage insurance is required when the down payment is under 20% of the purchase price.",
  au: "Australian home loans are quoted as annual rates and calculated monthly. Most lenders offer fortnightly repayments at no extra cost, which shortens the term by the equivalent of one extra monthly payment per year. The RBA cash rate drives variable mortgage pricing.",
  ie: "Irish mortgages are regulated by the Central Bank, which caps most loans at 3.5 times gross income and 90% loan-to-value for first-time buyers. Rates are ECB-influenced, and stamp duty applies at 1% on residential properties up to €1m.",
  de: "German mortgages (Annuitätendarlehen) fix the rate for a set period — typically 10–15 years — but the loan is not fully repaid by then. The outstanding balance at the end of the fixed period is the Restschuld, which must be refinanced at prevailing rates.",
  nl: "Dutch mortgages can be taken as annuity (annuïteiten, flat monthly payment) or linear (lineaire hypotheek, falling monthly payment). The Netherlands has a mortgage interest deduction (hypotheekrenteaftrek) that reduces the effective annual cost.",
  nz: "New Zealand home loans are quoted as annual rates. Weekly and fortnightly repayment options are widely available and reduce total interest paid. The RBNZ sets loan-to-value speed limits that restrict high-LTV lending.",
  fr: "French mortgages require borrower's insurance (assurance emprunteur) in practice, which adds meaningfully to the total annual cost (TAEG). Most French mortgages are fixed-rate with full amortisation over the term.",
  es: "Spanish mortgages can be fixed or variable (tied to Euribor). Non-resident buyers are typically limited to 70% loan-to-value versus 80% for residents, and purchase costs including taxes and notary fees add roughly 10–14% to the total outlay.",
  sg: "Singapore home loans are subject to the Total Debt Servicing Ratio (TDSR), which caps monthly debt repayments at 55% of gross income. Vehicle prices include a Certificate of Entitlement (COE) bought at auction, which adds significantly to vehicle financing costs.",
  in: "Indian home loans (EMI) are typically floating-rate, linked to the lender's MCLR or repo rate. Floating-rate loans for individual borrowers carry no prepayment penalty. EMI is calculated monthly on the reducing balance.",
};

interface Tool {
  slug: string;
  label: string;
  description: string;
  comingSoon?: boolean;
}

const PROPERTY_TOOLS: Tool[] = [
  { slug: 'mortgage-calculator', label: 'Mortgage Calculator', description: 'Monthly payment, full amortisation schedule, and total interest.' },
  { slug: 'stamp-duty', label: 'Stamp Duty / Transfer Tax', description: 'Progressive tax calculation using official government rates, including first-time buyer relief.' },
  { slug: 'affordability', label: 'Affordability Calculator', description: "Maximum borrowing under your country's regulatory limits — income multiples, LTV caps, or debt servicing ratios." },
  { slug: 'refinance', label: 'Refinance Break-Even', description: 'How many months until a lower rate recovers your closing costs.' },
  { slug: 'rent-vs-buy', label: 'Rent vs Buy', description: 'Ten-year projection of the financial outcome of renting versus buying.' },
];

const LOANS_TOOLS: Tool[] = [
  { slug: 'personal-loan', label: 'Personal Loan', description: 'Monthly payment, amortisation schedule, and true APR.' },
  { slug: 'auto-loan', label: 'Auto Loan', description: 'Financed amount, monthly payment, and total interest with tax and fees.' },
  { slug: 'credit-card-payoff', label: 'Credit Card Payoff', description: 'Time to pay off your balance, total interest, and savings from extra payments.' },
  { slug: 'debt-strategy', label: 'Debt Strategy', description: 'Compare snowball, avalanche, and minimum-payment strategies side by side.' },
];

const SAVINGS_TOOLS: Tool[] = [
  { slug: 'compound-interest', label: 'Compound Interest', description: 'Final balance, total contributions, and interest earned over time.', comingSoon: true },
  { slug: 'retirement', label: 'Retirement Projection', description: 'How long your savings last in retirement, with inflation adjustment.', comingSoon: true },
  { slug: 'savings-goal', label: 'Savings Goal', description: 'How long to reach a target amount with regular contributions.', comingSoon: true },
  { slug: 'fire-number', label: 'FIRE Number', description: "The portfolio size you need to retire early, and when you'll reach it.", comingSoon: true },
  { slug: 'investment-return', label: 'Investment Return / CAGR', description: 'Compound annual growth rate between any two values.', comingSoon: true },
];

const CATEGORIES = [
  { label: 'Mortgages & Property', path: 'property', tools: PROPERTY_TOOLS },
  { label: 'Loans & Debt', path: 'loans', tools: LOANS_TOOLS },
  { label: 'Savings & Investing', path: 'savings', tools: SAVINGS_TOOLS },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cc: string }>;
}): Promise<Metadata> {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) return {};
  const countryName = NAME_MAP[cc] ?? cc.toUpperCase();
  return {
    title: `Financial Calculators for ${countryName} | Reckoner`,
    description: `Mortgage, loans, and savings calculators for ${countryName}, each using official local rules and current rates. Free, no signup.`,
    alternates: { canonical: `https://reckoner.tools/${cc}` },
    robots: { index: true, follow: true },
  };
}

export default async function CountryHubPage({
  params,
}: {
  params: Promise<{ cc: string }>;
}) {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) notFound();

  const country = getCountry(cc as CountryCode);
  const allCountries = getAllCountries();
  const countryName = NAME_MAP[cc] ?? cc.toUpperCase();
  const flag = FLAG_MAP[cc] ?? '🌍';
  const intro = COUNTRY_INTRO[cc] ?? `Financial calculators for ${countryName}, each applying local rules.`;

  return (
    <>
      <Header currentCountry={country} allCountries={allCountries} />
      <main id="main">
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '64px 24px' }}>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 400,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              margin: '0 0 12px',
            }}
          >
            {flag} {countryName}
          </h1>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              margin: '0 0 56px',
              maxWidth: '65ch',
              color: 'var(--color-ink-deep)',
            }}
          >
            {intro}
          </p>

          {CATEGORIES.map((category) => (
            <section key={category.path} style={{ marginBottom: 48 }}>
              <h2 style={{ fontSize: 20, fontWeight: 500, margin: '0 0 12px' }}>
                {category.label}
              </h2>
              <div style={{ display: 'grid', gap: 2 }}>
                {category.tools.map((tool) =>
                  tool.comingSoon ? (
                    <div
                      key={tool.slug}
                      style={{
                        padding: '14px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        border: '1px solid var(--color-hairline)',
                        opacity: 0.5,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
                          {tool.label}
                        </div>
                        <div style={{ fontSize: 14, color: 'var(--color-ink-mid)', lineHeight: 1.5 }}>
                          {tool.description}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          color: 'var(--color-ink-mute)',
                          flexShrink: 0,
                          marginLeft: 16,
                          marginTop: 4,
                        }}
                      >
                        Soon
                      </span>
                    </div>
                  ) : (
                    <a
                      key={tool.slug}
                      href={`/${cc}/${category.path}/${tool.slug}`}
                      className="hub-tool-link"
                    >
                      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
                        {tool.label}
                      </div>
                      <div style={{ fontSize: 14, color: 'var(--color-ink-mid)', lineHeight: 1.5 }}>
                        {tool.description}
                      </div>
                    </a>
                  ),
                )}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer countries={allCountries} currentCc={cc} />
    </>
  );
}
