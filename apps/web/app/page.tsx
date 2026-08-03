import { getAllCountries } from '@reckoner/finance-data';
import { websiteSchema, faqSchema, jsonLdScript } from '@reckoner/seo';
import { Header } from '../src/components/Header';
import { Footer } from '../src/components/Footer';

const FLAG_MAP: Record<string, string> = {
  us: '🇺🇸', uk: '🇬🇧', ca: '🇨🇦', au: '🇦🇺', ie: '🇮🇪',
  de: '🇩🇪', nl: '🇳🇱', nz: '🇳🇿', fr: '🇫🇷', es: '🇪🇸',
  sg: '🇸🇬', in: '🇮🇳',
};

const NAME_MAP: Record<string, string> = {
  us: 'United States', uk: 'United Kingdom', ca: 'Canada', au: 'Australia',
  ie: 'Ireland', de: 'Germany', nl: 'Netherlands', nz: 'New Zealand',
  fr: 'France', es: 'Spain', sg: 'Singapore', in: 'India',
};

interface LandingTool {
  slug: string;
  label: string;
  description: string;
  comingSoon?: boolean;
}

const PROPERTY_TOOLS: LandingTool[] = [
  { slug: 'mortgage-calculator', label: 'Mortgage Calculator', description: 'Monthly payment, full amortisation schedule, and total interest.' },
  { slug: 'stamp-duty', label: 'Stamp Duty / Transfer Tax', description: 'Progressive tax calculation using official government rates.' },
  { slug: 'affordability', label: 'Affordability Calculator', description: "Maximum borrowing under your country's regulatory limits." },
  { slug: 'refinance', label: 'Refinance Break-Even', description: 'How many months until a lower rate recovers your closing costs.' },
  { slug: 'rent-vs-buy', label: 'Rent vs Buy', description: 'Ten-year projection of the financial outcome of renting versus buying.' },
];

const LOANS_TOOLS: LandingTool[] = [
  { slug: 'personal-loan', label: 'Personal Loan', description: 'Monthly payment, amortisation schedule, and true APR.' },
  { slug: 'auto-loan', label: 'Auto Loan', description: 'Financed amount, monthly payment, and total interest with tax and fees.' },
  { slug: 'credit-card-payoff', label: 'Credit Card Payoff', description: 'Time to pay off your balance and savings from extra payments.', comingSoon: true },
  { slug: 'debt-strategy', label: 'Debt Strategy', description: 'Compare snowball, avalanche, and minimum-payment strategies.', comingSoon: true },
];

const SAVINGS_TOOLS: LandingTool[] = [
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

const FAQS = [
  {
    group: 'Mortgage & Property',
    items: [
      {
        question: 'How do I calculate my monthly mortgage payment?',
        answer: 'Divide the annual interest rate by 12 to get the monthly rate, then apply the amortisation formula: M = P × r(1+r)^n / ((1+r)^n − 1), where P is the principal, r the monthly rate, and n the number of monthly payments. For a $300,000 loan at 6% over 30 years, this gives $1,799 per month. Different countries use different compounding conventions: Canadian fixed-rate mortgages compound semi-annually, which changes the effective monthly rate.',
      },
      {
        question: 'What is the difference between fixed and variable rate mortgages?',
        answer: 'A fixed-rate mortgage locks your interest rate for a set period — typically 2–30 years depending on the country — so your monthly payment stays the same. A variable rate moves with a reference rate such as the Bank of England base rate or US SOFR, so your payment can rise or fall. Fixed rates provide payment certainty; variable rates are often lower initially but carry repricing risk.',
      },
      {
        question: 'How much deposit do I need to buy a house?',
        answer: "The minimum deposit depends on the country and lender. In the US, conventional loans typically require 3–20%, while FHA loans allow 3.5%. In the UK, lenders usually want at least 5–10%, and Ireland's Central Bank caps most loans at 90% of the purchase price for first-time buyers. A larger deposit reduces the loan-to-value ratio and usually results in a lower interest rate.",
      },
      {
        question: 'What is loan-to-value (LTV) and why does it matter?',
        answer: "Loan-to-value is the mortgage amount as a percentage of the property's purchase price or appraised value, whichever is lower. A $280,000 mortgage on a $350,000 home has an 80% LTV. Lenders use LTV to price risk: a lower LTV usually means a lower interest rate and no requirement for mortgage insurance (PMI in the US). Most countries have regulatory LTV caps for certain borrower types.",
      },
      {
        question: 'How does remortgaging work and when does it make sense?',
        answer: "Remortgaging means replacing your current mortgage with a new one, either with your existing lender or a new one, usually to secure a lower interest rate or release equity. It makes financial sense when the monthly saving exceeds the combined exit fees, valuation, and legal costs within two to three years. In the UK, most borrowers remortgage when their fixed period ends to avoid reverting to the lender's standard variable rate.",
      },
      {
        question: 'Should I rent or buy — how do I decide?',
        answer: 'The key financial comparison is the opportunity cost of the deposit and the monthly difference between owning costs (mortgage, maintenance, property tax) and rent. Buying is financially better when the price-to-rent ratio is low or when you plan to stay for many years. Renting preserves capital flexibility and avoids maintenance costs. The rent vs buy calculator computes the ten-year financial outcome of each option.',
      },
    ],
  },
  {
    group: 'Loans & Debt',
    items: [
      {
        question: 'How do I calculate the monthly payment on a personal loan?',
        answer: 'Personal loans use the standard amortisation formula: M = P × r(1+r)^n / ((1+r)^n − 1), where P is the loan amount, r is the monthly interest rate (annual rate ÷ 12), and n is the number of months. A $10,000 loan at 8% APR over 48 months gives a monthly payment of $244. Unlike mortgages, personal loans are unsecured and have no compounding convention differences across countries.',
      },
      {
        question: 'What is APR and how is it different from the interest rate?',
        answer: 'APR (Annual Percentage Rate) is the total cost of borrowing expressed as a yearly rate, including both the interest rate and mandatory fees such as origination fees. The interest rate only covers the cost of the money itself. If a lender charges 6% interest plus a 2% origination fee on a three-year loan, the APR is higher than 6% — often around 7.5–8% — because the fee is amortised over the loan term.',
      },
      {
        question: 'How is an auto loan different from a personal loan?',
        answer: 'Auto loans are secured against the vehicle, which the lender can repossess if you default, while personal loans are typically unsecured. Because the lender holds collateral, auto loan rates are generally lower for the same borrower. Auto loans also factor in the vehicle purchase price, down payment, trade-in value, and in many US states, sales tax added to the financed amount.',
      },
      {
        question: 'What is the minimum payment trap on a credit card?',
        answer: 'Credit card minimum payments are typically set at 1–3% of the outstanding balance or a small fixed amount, whichever is greater. Paying only the minimum keeps the balance high for years because most of each payment covers interest, not principal. On a $5,000 balance at 20% APR with a 2% minimum payment, paying only the minimum takes over 30 years to clear and costs roughly $6,000 in interest — more than the original balance.',
      },
      {
        question: 'What is the difference between the debt snowball and debt avalanche?',
        answer: 'The debt snowball method pays off debts from smallest balance to largest, freeing up monthly cash flow quickly and providing psychological momentum. The debt avalanche pays from highest interest rate to lowest, minimising total interest paid over time. The avalanche saves more money mathematically, while the snowball may work better for people who need early visible progress to stay motivated.',
      },
      {
        question: 'How do I compare two loans with different rates and terms?',
        answer: 'The clearest comparison is total cost: multiply the monthly payment by the number of months and add any upfront fees for each loan. APR standardises this into a single annual rate, but total cost is more useful when terms differ significantly. A loan with a lower APR and a much longer term can cost more overall than one with a higher rate and shorter term.',
      },
    ],
  },
  {
    group: 'Savings & Investing',
    items: [
      {
        question: 'How does compound interest work?',
        answer: 'Compound interest means you earn interest not just on your initial principal but also on previously accumulated interest. With annual compounding, $10,000 at 5% becomes $10,500 after one year and $11,025 after two years — the second year earns interest on $10,500, not just $10,000. More frequent compounding (monthly, daily) produces slightly higher returns. The formula is A = P(1 + r/n)^(nt), where P is principal, r the annual rate, n compounding periods per year, and t years.',
      },
      {
        question: 'What is the difference between nominal and real returns?',
        answer: 'Nominal return is the raw percentage gain on an investment. Real return adjusts for inflation, showing how much purchasing power actually increased. If a portfolio earns 7% in a year when inflation is 3%, the real return is approximately 4%. The precise calculation uses the Fisher equation: real return = (1 + nominal) / (1 + inflation) − 1. Real returns matter more for long-term planning because they reflect actual purchasing power, not just dollar amounts.',
      },
      {
        question: 'How much do I need to retire?',
        answer: 'A common starting point is the 4% rule: multiply your expected annual spending in retirement by 25. To sustain $60,000 per year, you would need approximately $1,500,000. This assumes a diversified portfolio, a 30-year retirement horizon, and historical market returns. The right multiple depends on your planned retirement duration, risk tolerance, and whether you have other income sources such as a pension or social security.',
      },
      {
        question: 'What is the FIRE number and how is it calculated?',
        answer: 'The FIRE (Financial Independence, Retire Early) number is the portfolio size at which investment returns can sustain your spending indefinitely. It is calculated as annual expenses divided by your planned withdrawal rate — typically 4%, based on the Trinity Study. For $50,000 in annual spending at a 4% withdrawal rate, the FIRE number is $1,250,000. A lower withdrawal rate (such as 3%) produces a larger but safer target.',
      },
      {
        question: 'What is CAGR and how do I use it to compare investments?',
        answer: 'CAGR (Compound Annual Growth Rate) is the annualised rate at which an investment grew from its initial to its final value over a set period. The formula is CAGR = (Final Value / Initial Value)^(1 / years) − 1. If $10,000 grew to $17,000 over six years, the CAGR is approximately 9.2%. CAGR removes the effect of year-to-year volatility, making it useful for comparing investments of different sizes and durations on a like-for-like basis.',
      },
      {
        question: 'How long will my savings last in retirement?',
        answer: 'The duration depends on your portfolio value, annual withdrawal amount, investment return, and inflation rate. If your portfolio earns more than your inflation-adjusted withdrawal rate, it can last indefinitely. At a 4% withdrawal rate on a diversified portfolio, historical data suggests a 95% or higher chance of surviving a 30-year retirement. You can estimate the depletion year by modelling annual growth minus annual withdrawals until the balance reaches zero.',
      },
    ],
  },
];

const ALL_FAQS = FAQS.flatMap((g) => g.items);

export const metadata = {
  title: "Financial Calculators for 12 Countries | Reckoner",
  description: 'Mortgage, loan, and savings calculators for the US, UK, Canada, Australia, and 8 more countries — each applying official local rules. Free, no signup.',
};

export default function HubPage() {
  const countries = getAllCountries();

  const jsonLdData = [
    websiteSchema(),
    faqSchema(ALL_FAQS.map((f) => ({ question: f.question, answer: f.answer }))),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLdData) }}
      />
      <Header allCountries={countries} />
      <main id="main">
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '64px 24px 0' }}>

          {/* Hero */}
          <h1
            style={{
              fontSize: 40,
              fontWeight: 400,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              margin: '0 0 16px',
              maxWidth: '20ch',
            }}
          >
            Financial calculators that use your country&apos;s actual rules
          </h1>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              margin: '0 0 64px',
              maxWidth: '60ch',
              color: 'var(--color-ink-deep)',
            }}
          >
            Most calculators run one formula and change the currency symbol. Ours apply each
            country&apos;s compounding convention, regulatory limits, and local costs. Choose a
            calculator below — or pick your country to see everything available.
          </p>

          {/* Tool grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 32,
              marginBottom: 80,
            }}
          >
            {CATEGORIES.map((category) => (
              <div key={category.path}>
                <h2
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--color-ink-mid)',
                    margin: '0 0 12px',
                  }}
                >
                  {category.label}
                </h2>
                <div style={{ display: 'grid', gap: 0 }}>
                  {category.tools.map((tool) =>
                    tool.comingSoon ? (
                      <div
                        key={tool.slug}
                        style={{
                          padding: '10px 0',
                          borderTop: '1px solid var(--color-hairline)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          opacity: 0.5,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>
                            {tool.label}
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', lineHeight: 1.4 }}>
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
                            marginLeft: 12,
                            paddingTop: 3,
                          }}
                        >
                          Soon
                        </span>
                      </div>
                    ) : (
                      <a
                        key={tool.slug}
                        href={`/us/${category.path}/${tool.slug}`}
                        style={{
                          display: 'block',
                          padding: '10px 0',
                          borderTop: '1px solid var(--color-hairline)',
                          textDecoration: 'none',
                          color: 'var(--color-ink)',
                        }}
                      >
                        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>
                          {tool.label}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', lineHeight: 1.4 }}>
                          {tool.description}
                        </div>
                      </a>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Country grid */}
          <h2 style={{ fontSize: 20, fontWeight: 500, margin: '0 0 8px' }}>Choose your country</h2>
          <p style={{ fontSize: 14, color: 'var(--color-ink-mid)', margin: '0 0 24px' }}>
            Calculators adjust to each country&apos;s rules — compounding conventions, regulatory
            caps, and local costs.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 2,
              marginBottom: 80,
            }}
          >
            {countries.map((c) => (
              <a
                key={c.code}
                href={`/${c.code}`}
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  color: 'var(--color-ink)',
                  border: '1px solid var(--color-hairline)',
                  padding: '16px 20px',
                  fontSize: 15,
                }}
              >
                <span style={{ marginRight: 8 }}>{FLAG_MAP[c.code]}</span>
                <strong style={{ fontWeight: 500 }}>{NAME_MAP[c.code]}</strong>
                <span
                  style={{
                    fontSize: 13,
                    color: 'var(--color-ink-mid)',
                    display: 'block',
                    marginTop: 2,
                  }}
                >
                  {c.currency} · Property · Loans · Savings
                </span>
              </a>
            ))}
          </div>

          {/* FAQ */}
          <div style={{ borderTop: '1px solid var(--color-hairline)', paddingTop: 48, marginBottom: 80 }}>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 400,
                margin: '0 0 40px',
                letterSpacing: '-0.02em',
              }}
            >
              Frequently asked questions
            </h2>
            {FAQS.map((group) => (
              <div key={group.group} style={{ marginBottom: 48 }}>
                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--color-ink-mid)',
                    margin: '0 0 16px',
                  }}
                >
                  {group.group}
                </h3>
                {group.items.map((faq) => (
                  <details
                    key={faq.question}
                    style={{ borderTop: '1px solid var(--color-hairline)' }}
                  >
                    <summary
                      style={{
                        padding: '16px 0',
                        fontSize: 15,
                        fontWeight: 500,
                        cursor: 'pointer',
                        listStyle: 'none',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      {faq.question}
                      <span
                        aria-hidden="true"
                        style={{ fontSize: 20, fontWeight: 300, marginLeft: 16, flexShrink: 0 }}
                      >
                        +
                      </span>
                    </summary>
                    <p
                      style={{
                        margin: '0 0 16px',
                        fontSize: 15,
                        lineHeight: 1.65,
                        color: 'var(--color-ink-deep)',
                        maxWidth: '70ch',
                      }}
                    >
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer countries={countries} />
    </>
  );
}
