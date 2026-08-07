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
    slug: 'mortgage-calculator',
    label: 'Mortgage Calculator',
    description: "Monthly payment, full amortisation schedule, and total interest. Uses your country's official compounding convention.",
  },
  {
    slug: 'stamp-duty',
    label: 'Stamp Duty / Transfer Tax',
    description: "Progressive banding calculation using official government rates. Includes first-time buyer relief and surcharges where applicable.",
  },
  {
    slug: 'affordability',
    label: 'Affordability Calculator',
    description: "Maximum borrowing under your country's regulatory limits  -  income multiples, LTV caps, or debt servicing ratios.",
  },
  {
    slug: 'refinance',
    label: 'Refinance Break-Even',
    description: 'How many months until a lower rate recovers your closing costs. Shows cumulative saving over the remaining term.',
  },
  {
    slug: 'rent-vs-buy',
    label: 'Rent vs Buy',
    description: 'Ten-year projection of the financial outcome of each option, accounting for equity build-up and deposit opportunity cost.',
  },
];

const PROPERTY_FAQS = [
  {
    question: 'What does LTV mean?',
    answer: 'Loan-to-Value (LTV) is the mortgage amount as a percentage of the property value. An 80% LTV means you are borrowing 80% and putting in a 20% deposit. Higher LTV typically means higher interest rates and a requirement for mortgage insurance in some countries.',
  },
  {
    question: 'What is stamp duty?',
    answer: 'Stamp duty (or transfer tax) is a government tax on property purchases. It is calculated in progressive bands in most countries  -  the rate rises as the purchase price increases. First-time buyers receive relief in many jurisdictions.',
  },
  {
    question: 'How much can I borrow for a mortgage?',
    answer: 'Most lenders use an income multiple (typically 3–4.5 times gross annual income) combined with a loan-to-value limit. Regulators in many countries cap the multiple to prevent over-lending. Use the affordability calculator to see the limits that apply in your country.',
  },
  {
    question: 'What is the difference between a fixed and variable rate mortgage?',
    answer: 'A fixed rate is locked for a set period (commonly 2–10 years), giving payment certainty. A variable rate tracks a benchmark rate (such as a central bank rate or EURIBOR) and can rise or fall. Fixed rates suit those who want certainty; variable rates can be cheaper when benchmark rates are falling.',
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
    'property',
    `Property Calculators for ${countryName} | Reckoner`,
    `Mortgage, stamp duty, affordability, refinance, and rent vs buy calculators for ${countryName}, each using official local rules. Free, no signup.`,
  );
}

export default async function PropertyHubPage({
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
              { name: 'Property', href: `/${cc}/property` },
            ]),
            faqSchema(PROPERTY_FAQS),
          ]),
        }}
      />
      <Header currentCountry={country} allCountries={allCountries} currentTool="property" />
      <main id="main">
        <div className="page-outer" style={{ paddingBottom: 64 }}>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 400,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              margin: '0 0 12px',
            }}
          >
            Property calculators for {countryName}
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
            Each calculator applies {countryName}&apos;s actual rules  -  the compounding convention,
            regulatory limits, and official tax bands in force today.
          </p>

          <div style={{ display: 'grid', gap: 2 }}>
            {TOOLS.map((tool) => (
              <a
                key={tool.slug}
                href={`/${cc}/property/${tool.slug}`}
                className="hub-tool-link"
              >
                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
                  {tool.label}
                </div>
                <div style={{ fontSize: 14, color: 'var(--color-ink-mid)', lineHeight: 1.5 }}>
                  {tool.description}
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>
      <Footer currentCc={cc} />
    </>
  );
}
