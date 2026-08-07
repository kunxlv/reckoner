import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCountry, getAllCountries, COUNTRY_CODES, fetchRate, fetchFxRates } from '@reckoner/finance-data';
import type { CountryCode } from '@reckoner/finance-data';
import { AdSlot } from '@reckoner/analytics';
import { getToolMetadata } from '@reckoner/seo';
import { BreadcrumbSchema } from '../../../../src/components/BreadcrumbSchema';
import { CalculatorSchema } from '../../../../src/components/CalculatorSchema';
import { FAQSchema } from '../../../../src/components/FAQSchema';
import { Header } from '../../../../src/components/Header';
import { Footer } from '../../../../src/components/Footer';
import { RentVsBuyCalculator } from '../../../../src/components/RentVsBuyCalculator';
import { TrustDisclosures } from '../../../../src/components/TrustDisclosures';

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return COUNTRY_CODES.map((cc) => ({ cc }));
}

export async function generateMetadata({ params }: { params: Promise<{ cc: string }> }): Promise<Metadata> {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) return {};
  const country = getCountry(cc as CountryCode);
  return getToolMetadata(
    cc as CountryCode,
    'property',
    'rent-vs-buy',
    `Rent vs Buy Calculator ${country.code.toUpperCase()} | Reckoner`,
    `Compare the 10-year financial outcome of renting versus buying a home in ${country.code.toUpperCase()}. Free, no signup.`,
  );
}

const COUNTRY_H1: Record<string, string> = {
  us: 'Rent vs Buy Calculator',
  uk: 'Rent vs Buy Property Calculator',
  ca: 'Rent vs Buy Calculator (Canada)',
  au: 'Rent vs Buy Property Calculator (Australia)',
  ie: 'Rent vs Buy Calculator (Ireland)',
  de: 'Mieten oder Kaufen Calculator',
  nl: 'Huren of Kopen Calculator',
  nz: 'Rent vs Buy Calculator (New Zealand)',
  fr: 'Louer ou Acheter Calculator',
  es: 'Alquilar vs Comprar Calculator',
  sg: 'Rent vs Buy Calculator (Singapore)',
  in: 'Rent vs Buy Property Calculator (India)',
};

const ANSWER_FIRST: Record<string, string> = {
  us: 'Compare the 10-year financial outcome of renting versus buying. The calculator weighs your mortgage payment and the opportunity cost of your down payment against total rent paid and the equity you build through appreciation and principal paydown. In high-property-tax US states, the effective cost of ownership often significantly exceeds the mortgage payment alone.',
  uk: 'Compare the 10-year financial outcome of renting versus buying in the UK. Stamp Duty, legal fees, and survey costs add roughly 3-5% to the purchase price upfront. UK property has appreciated at roughly 4-5% per year over long periods, but regional variation is wide. The result depends heavily on which city and which decade you are in.',
  ca: 'Compare renting versus buying over 10 years in Canada. Canadian mortgage terms (typically 5 years) mean you will refinance at least once during the projection period at an unknown future rate. Land transfer tax of 1-2% of the price adds to the true cost of entry and is not included in the default inputs.',
  au: 'Compare the 10-year outcome of renting versus buying in Australia. Stamp duty (roughly 3-5% of the price) plus conveyancing costs are a significant upfront investment not captured in the default calculator. Negative gearing allows investors to offset rental losses against other income, which changes the calculus for investor buyers relative to owner-occupiers.',
  ie: 'Compare renting versus buying over 10 years in Ireland. With Dublin rents among the highest in Europe and a chronic housing undersupply, the rent vs buy equation is unusually sensitive to the assumed rent growth rate. Stamp duty (1-2%) and legal costs add roughly 2-3% upfront and are not included in the default calculation.',
  de: 'Compare renting versus buying in Germany over 10 years. Germany has historically been a renting nation, with homeownership rates around 50%. Purchase costs (Grunderwerbsteuer, Notar, Makler) typically add 10-15% to the price, a much higher barrier than most countries. Enter these in the refinancing costs field for a realistic comparison.',
  nl: 'Compare renting versus buying in the Netherlands. Dutch purchase costs add roughly 4-6% to the price. Mortgage interest is tax-deductible under hypotheekrenteaftrek, reducing the net cost of borrowing by about 37% of the interest paid. Strong price growth in the Randstad from 2016 to 2022 has made the buying case compelling, but the market moderated through 2023-2024.',
  nz: 'Compare renting versus buying in New Zealand. New Zealand has no stamp duty, but legal fees, a LIM report, and building inspections add NZD 3,000-7,000 upfront. Property prices have corrected from the 2021 peak and the appreciation outlook is more uncertain. Use conservative appreciation assumptions in the current environment.',
  fr: 'Compare louer ou acheter sur 10 ans en France. French purchase costs (droits de mutation plus notary fees) total 7-8% for existing properties. This means you need significant appreciation or a long holding period to break even against renting. The traditional French rule of thumb is: buy if you plan to stay more than 7 years.',
  es: "Compare alquilar vs comprar en España a 10 años. ITP (6-11%) plus agency fees make purchase costs substantial. Spain's rental market has tightened sharply since 2022, with rents rising faster than prices in major cities. The comparison is sensitive to both the rent growth assumption and the appreciation assumption.",
  sg: 'Compare renting versus buying in Singapore. BSD plus ABSD (if applicable) plus legal fees can make purchase costs very high, especially for permanent residents and foreigners. Public housing (HDB) resale flats and private property have very different price dynamics. The calculator works for both; adjust the property price to reflect your target market.',
  in: 'Compare renting versus buying in India. Stamp duty (5-8%) and registration fees (1-2%) add 6-10% to the purchase price in most states. Indian housing appreciates at 5-10% per year in tier-1 cities, but rental yields are low at 2-3%. EMI tax benefits under Section 24(b) and Section 80C reduce the effective cost of ownership but are not included in the default calculation.',
};

const LOCAL_CALLOUT: Record<string, { heading: string; body: string }> = {
  us: { heading: 'Property tax tips the balance in many markets', body: 'US property tax ranges from near-zero to over 2% of assessed value per year in states like New Jersey and Illinois. At 1.5% property tax on a $500,000 home, that is $7,500 per year or $625 per month on top of the mortgage payment. In high-tax states, the true effective cost of ownership often exceeds a simple mortgage payment comparison. Factor your local rate into the decision.' },
  uk: { heading: 'Transaction costs reset the break-even clock', body: 'Buying in England involves Stamp Duty (up to £15,000 on a £400,000 property), solicitor fees, a survey, and moving costs: roughly 3-5% of the purchase price before you make a single mortgage payment. Historically, UK buyers have needed around 3-5 years to recover these costs through appreciation and equity build-up before breaking even versus renting.' },
  ca: { heading: 'Land transfer tax adds to the true entry cost', body: 'Ontario charges 0.5-2.5% land transfer tax, and Toronto adds its own municipal tax on top. On a CA$700,000 Toronto purchase, combined land transfer tax can reach CA$21,000. British Columbia charges 1-3% plus a 20% foreign buyer tax where applicable. Factor these into the deposit when comparing the total investment in buying versus renting.' },
  au: { heading: 'Stamp duty is the biggest barrier to entry in Australia', body: 'Australian stamp duty ranges from roughly 3.5-5.5% of the purchase price depending on state. On a AU$700,000 home, that is AU$25,000-38,000 before settlement. The combination of stamp duty, conveyancing, and building inspections typically adds 4-6% to the true cost of entry, which the default calculator does not include.' },
  ie: { heading: "Ireland's undersupply supports the appreciation assumption", body: 'Ireland has consistently underbuilt relative to household formation for more than a decade. This structural imbalance has supported prices even through higher interest rates. When setting your appreciation rate, note that Irish prices have outperformed most European markets and are forecast to remain supply-constrained for at least several more years.' },
  de: { heading: 'High purchase costs mean you need a long horizon', body: 'German purchase costs (Grunderwerbsteuer 3.5-6.5%, Notar around 1.5%, Makler around 3.57%) total 10-15% of the purchase price depending on state. German price appreciation was modest for most of the last 30 years, with a sharp rise from 2012 to 2022 followed by a correction. With high upfront costs and uncertain appreciation, buying makes more financial sense with a horizon of 10 years or more.' },
  nl: { heading: 'Hypotheekrenteaftrek reduces the effective mortgage cost', body: 'Mortgage interest is tax-deductible in the Netherlands under hypotheekrenteaftrek, currently available for annuity or linear repayment mortgages. At a marginal tax rate of 37.1%, a 4% mortgage effectively costs around 2.5% after tax. This meaningfully improves the buy case versus renting but is not captured in the base calculator.' },
  nz: { heading: 'The correction since 2021 changes the appreciation assumption', body: 'New Zealand house prices fell 15-20% from their 2021 peak by 2023 and have partially recovered since. Long-run real appreciation is more modest than the headlines from the 2010s suggest. New Zealand\'s price-to-income ratios remain among the highest globally, which limits the appreciation upside without commensurate income growth.' },
  fr: { heading: 'High purchase costs mean you need 5 or more years to break even', body: 'French purchase costs of 7-8% mean that even with modest appreciation, a buyer needs 5-7 years to recover transaction costs before breaking even versus a renter who invested the same amount. The traditional French bank rule of thumb is: buy if you plan to stay more than 7 years, rent otherwise.' },
  es: { heading: 'Rent controls are reshaping the rental market', body: "Spain's Ley de Vivienda (2023) introduced rent controls in stressed market zones, particularly Barcelona and parts of Madrid. This limits landlords' ability to raise rents, which can compress rental yields and change the rent vs buy calculation in controlled zones. For renters, controls offer stability. For buyers, they reduce the relative advantage of ownership over the medium term." },
  sg: { heading: 'ABSD for second properties changes the calculus sharply', body: 'For Singapore Citizens, a second property attracts 20% ABSD and a third attracts 30%. These taxes dramatically increase the break-even period for investment purchases. This calculator works best for primary residence comparisons. For investment property scenarios, add ABSD explicitly to the purchase cost field alongside BSD.' },
  in: { heading: 'EMI tax benefits reduce the effective cost of ownership', body: 'Under Section 24(b), you can deduct up to Rs 2 lakh per year of home loan interest from taxable income on a self-occupied property. Under Section 80C, up to Rs 1.5 lakh per year of principal repayment is deductible. At a 30% tax bracket, these deductions can reduce the net cost of your EMI by Rs 1-1.5 lakh per year, which meaningfully shifts the buy case.' },
};

const FAQS = [
  {
    question: 'Is buying always better than renting long-term?',
    answer: 'Not necessarily. The outcome depends on local property appreciation, the opportunity cost of your deposit, how long you stay, and what you pay in transaction costs upfront. In high-cost cities where prices are stretched relative to rents, renting and investing the saved capital has historically kept pace with buying over 10-year horizons. The calculator lets you model your specific assumptions.',
  },
  {
    question: 'What appreciation rate should I use?',
    answer: 'Use a long-run real (inflation-adjusted) appreciation rate for the specific market. UK-wide average has been roughly 4-5% nominal over long periods, but London has been higher and some northern cities lower. Australian capital cities have averaged 6-7% nominal since the 1990s. For a conservative base case, use 3% nominal. The calculator is sensitive to this input  -  try a range.',
  },
  {
    question: 'Does the calculator include stamp duty, legal fees, and other purchase costs?',
    answer: 'The default calculation does not include transaction costs  -  they are not added to the deposit or effective cost of ownership automatically. For a realistic comparison, you should factor these in by increasing your effective deposit amount by the transaction costs (typically 3-8% of the property price depending on country). This extends the break-even period significantly.',
  },
  {
    question: 'What is the opportunity cost of a deposit?',
    answer: 'Your deposit cannot be invested once it is used to buy a property. The opportunity cost is what that capital could have earned if invested in shares or bonds instead. The deposit return field represents this: the annual return you could realistically achieve in an alternative investment. Using a 7% equity return is common for long-run projections, but it is speculative  -  equity returns are highly variable year to year.',
  },
  {
    question: 'How is the net buy advantage calculated?',
    answer: 'The calculator computes the total cash paid as a buyer (mortgage payments plus the opportunity cost of the deposit) versus the total rent paid over 10 years. It then adds the equity built through appreciation and principal paydown. The net buy advantage is the difference: positive means buying produced more total wealth, negative means renting and investing the deposit ahead.',
  },
];

export default async function RentVsBuyPage({ params }: { params: Promise<{ cc: string }> }) {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) notFound();

  const country = getCountry(cc as CountryCode);
  const allCountries = getAllCountries();

  let rateResult = null;
  try { rateResult = await fetchRate(cc as CountryCode); } catch { /* use default */ }

  const defaultRate = rateResult?.value ?? country.defaults.rate;

  let fxResult = null;
  if (country.currency !== 'EUR') {
    try { fxResult = await fetchFxRates(country.currency); } catch { /* hide conversion */ }
  }

  const h1 = COUNTRY_H1[cc] ?? 'Rent vs Buy Calculator';
  const answerFirst = ANSWER_FIRST[cc] ?? '';
  const callout = LOCAL_CALLOUT[cc] ?? { heading: 'The result is highly sensitive to assumptions', body: 'Small changes to the appreciation rate and investment return significantly change the outcome. Use this as a starting point, not a conclusion.' };

  return (
    <>
      <FAQSchema faqs={FAQS} />
      <BreadcrumbSchema items={[
        { name: 'Home', href: '/' },
        { name: 'Property', href: `/${cc}/property` },
        { name: h1, href: `/${cc}/property/rent-vs-buy` },
      ]} />
      <CalculatorSchema
        name="Rent vs Buy Calculator"
        description="Compare the ten-year financial outcome of renting versus buying a home."
        url={`https://reckoner.tools/${cc}/property/rent-vs-buy`}
      />
      <Header currentCountry={country} allCountries={allCountries} currentTool="property/rent-vs-buy" />
      <main id="main">
        <div className="page-outer">
          <div className="calc-grid">
            <div>
              <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 12px' }}>
                {h1}
              </h1>
              <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 24px', maxWidth: '72ch' }}>
                {answerFirst}
              </p>
              <div
                style={{
                  border: '1px solid var(--color-hairline)',
                  padding: '16px 20px',
                  marginBottom: 32,
                  maxWidth: '72ch',
                }}
              >
                <h2 style={{ fontSize: 15, fontWeight: 500, margin: '0 0 6px' }}>{callout.heading}</h2>
                <p style={{ fontSize: 15, lineHeight: 1.6, margin: 0, color: 'var(--color-ink-deep)' }}>{callout.body}</p>
              </div>
              <RentVsBuyCalculator country={country} defaultRate={defaultRate} fxResult={fxResult} />
            </div>
            <div className="ad-sidebar">
              <AdSlot width={300} height={600} />
            </div>
          </div>
        </div>

        <div className="page-section">
          <AdSlot width={728} height={90} style={{ margin: '32px 0' }} />
          <TrustDisclosures context={{ type: 'rent-vs-buy' }} rateResult={rateResult} />
          <div style={{ maxWidth: '72ch', padding: '48px 0 32px' }}>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-ink-mid)', margin: 0 }}>
              Reference rate sourced from official central bank or national statistics body data where available.
              This is an estimate for illustrative purposes only. Confirm costs and rates with your lender before
              proceeding.
            </p>

            <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '0 0 10px' }}>How the rent vs buy comparison works</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>Buying and renting are not directly comparable because buyers build equity while renters do not. The calculator accounts for this by computing the deposit&apos;s opportunity cost  -  what it would have earned if invested. Mortgage payments are split into interest (a cost, like rent) and principal (equity you keep). Appreciation adds to the buyer&apos;s net worth. The result shows which option produced more total wealth over 10 years given your assumptions.</p>

            <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '0 0 10px' }}>What this doesn&apos;t include</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>This is a simplified financial model. It does not include property maintenance costs (typically 1–2% of value per year), buildings and contents insurance, property taxes or council tax, or the transaction costs of eventually selling (estate agent fees, legal costs). These favour renting in the short run and erode the buy advantage, especially for shorter holding periods.</p>

            <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '0 0 10px' }}>Why the result is sensitive to assumptions</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>Small changes to the appreciation rate or the deposit return assumption can flip the result. At 3% appreciation and 7% investment return, renting often wins over 10 years in expensive markets. At 6% appreciation and 4% investment return, buying typically wins. Neither assumption is guaranteed. Use this to understand the range of outcomes, not to reach a definitive answer. The non-financial factors  -  stability, school catchments, flexibility  -  are real and matter.</p>

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
