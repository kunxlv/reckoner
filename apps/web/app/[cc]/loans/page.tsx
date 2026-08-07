import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCountry, getAllCountries, COUNTRY_CODES } from '@reckoner/finance-data';
import type { CountryCode } from '@reckoner/finance-data';
import { getHubMetadata, breadcrumbSchema, faqSchema, jsonLdScript } from '@reckoner/seo';
import { Header } from '../../../src/components/Header';
import { Footer } from '../../../src/components/Footer';

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

const TOOLS: Array<{ slug: string; label: string; description: string }> = [
  {
    slug: 'personal-loan',
    label: 'Personal Loan Calculator',
    description: 'Monthly payment, total interest, and full repayment schedule. Enter an origination fee to see how it raises your APR.',
  },
  {
    slug: 'auto-loan',
    label: 'Auto Loan Calculator',
    description: 'Finance amount after down payment, trade-in, and sales tax. Monthly payment, APR, and total out-of-pocket cost.',
  },
  {
    slug: 'credit-card-payoff',
    label: 'Credit Card Payoff Calculator',
    description: 'How long minimum payments take to clear your balance, and how much you save by paying extra each month.',
  },
  {
    slug: 'debt-strategy',
    label: 'Debt Strategy Calculator',
    description: 'Compare snowball, avalanche, and minimum-payment strategies across up to 5 debts. Total interest and months to payoff for each.',
  },
];

const LOANS_FAQS = [
  {
    question: 'What is APR?',
    answer: 'Annual Percentage Rate (APR) is the total yearly cost of borrowing, expressed as a percentage. Unlike the headline interest rate, APR includes fees such as origination charges, so it is a more accurate measure of what you will actually pay.',
  },
  {
    question: 'What is the difference between a personal loan and a credit card?',
    answer: 'Personal loans have a fixed loan amount, fixed repayment schedule, and typically lower interest rates. Credit cards are revolving credit: you can borrow repeatedly up to a limit, but if you do not clear the balance monthly you pay high interest on the outstanding amount.',
  },
  {
    question: 'What is the debt avalanche strategy?',
    answer: 'Pay the minimum on all debts, then direct every extra pound or dollar toward the debt with the highest interest rate first. Once that is cleared, move to the next highest rate. This approach minimises total interest paid compared to any other ordering.',
  },
  {
    question: 'Does paying off a loan early save money?',
    answer: 'Yes — you stop accruing interest from the day of repayment. However, some lenders charge an early repayment fee (sometimes one to two months of interest). Check your loan agreement before making a lump-sum payment to confirm the net saving.',
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cc: string }>;
}): Promise<Metadata> {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) return {};
  const countryName = NAME_MAP[cc] ?? cc.toUpperCase();
  return getHubMetadata(
    cc as CountryCode,
    'loans',
    `Loan Calculators for ${countryName} | Reckoner`,
    `Loan and debt calculators for ${countryName}: personal loan, auto loan, credit card payoff, and debt strategy comparison. Free, no signup.`,
  );
}

export default async function LoansHubPage({
  params,
}: {
  params: Promise<{ cc: string }>;
}) {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) notFound();

  const country = getCountry(cc as CountryCode);
  const allCountries = getAllCountries();
  const countryName = NAME_MAP[cc] ?? cc.toUpperCase();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            breadcrumbSchema([
              { name: 'Home', href: '/' },
              { name: 'Loans', href: `/${cc}/loans` },
            ]),
            faqSchema(LOANS_FAQS),
          ]),
        }}
      />
      <Header currentCountry={country} allCountries={allCountries} currentTool="loans" />
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
            Loan calculators for {countryName}
          </h1>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              margin: '0 0 48px',
              maxWidth: '60ch',
              color: 'var(--color-ink-deep)',
            }}
          >
            Monthly payments, total interest, and APR — calculated with exact annuity maths, not rule-of-thumb estimates.
          </p>

          <div style={{ display: 'grid', gap: 2 }}>
            {TOOLS.map((tool) => (
              <a
                key={tool.slug}
                href={`/${cc}/loans/${tool.slug}`}
                className="hub-tool-link"
              >
                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
                  {tool.label}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: 'var(--color-ink-mid)',
                    lineHeight: 1.5,
                  }}
                >
                  {tool.description}
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>
      <Footer countries={allCountries} currentCc={cc} />
    </>
  );
}
