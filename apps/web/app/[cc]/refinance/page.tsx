import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCountry, getAllCountries, COUNTRY_CODES, fetchRate } from '@reckoner/finance-data';
import type { CountryCode } from '@reckoner/finance-data';
import { AdSlot } from '@reckoner/analytics';
import { Header } from '../../../src/components/Header';
import { Footer } from '../../../src/components/Footer';
import { RefinanceCalculator } from '../../../src/components/RefinanceCalculator';
import { TrustDisclosures } from '../../../src/components/TrustDisclosures';

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return COUNTRY_CODES.map((cc) => ({ cc }));
}

export async function generateMetadata({ params }: { params: Promise<{ cc: string }> }): Promise<Metadata> {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) return {};
  const country = getCountry(cc as CountryCode);
  return {
    title: `Refinance / Remortgage Break-Even Calculator ${country.code.toUpperCase()} | Reckoner`,
    description: `Calculate how many months it takes to recover refinancing costs through lower monthly payments in ${country.code.toUpperCase()}. Free, no signup.`,
    robots: { index: true, follow: true },
  };
}

const COUNTRY_H1: Record<string, string> = {
  us: 'Mortgage Refinance Break-Even Calculator',
  uk: 'Remortgage Break-Even Calculator',
  ca: 'Canadian Mortgage Refinance Calculator',
  au: 'Home Loan Refinance Calculator',
  ie: 'Irish Remortgage Calculator',
  de: 'Anschlussfinanzierung Break-Even Calculator',
  nl: 'Dutch Mortgage Refinancing Calculator',
  nz: 'New Zealand Mortgage Refinance Calculator',
  fr: 'French Mortgage Renegotiation Calculator',
  es: 'Spanish Mortgage Subrogation Calculator',
  sg: 'Singapore Home Loan Refinancing Calculator',
  in: 'Home Loan Balance Transfer Calculator',
};

const ANSWER_FIRST: Record<string, string> = {
  us: 'Enter your outstanding balance, remaining term, and the new rate on offer. The calculator works out your monthly saving and how many months it takes to recover closing costs through lower payments. US refinancing typically costs $2,000-5,000 in closing costs. If you plan to move before the break-even point, refinancing loses money.',
  uk: 'Remortgaging at the end of a fixed-rate deal typically incurs no early repayment charges. Main costs are a product fee (often £999-£2,000), a valuation fee (£150-£500), and legal fees if switching lenders (often offered free by the new lender). Enter total upfront costs in the refinancing costs field.',
  ca: 'Canadian refinancing within a fixed term typically incurs an Interest Rate Differential (IRD) penalty, which can reach $10,000-20,000 on a $500,000 mortgage with several years remaining. At maturity, no penalty applies. Enter any IRD as part of the refinancing costs to see the true break-even.',
  au: 'Australian fixed-rate break fees can be large if rates have fallen since you fixed. The bank calculates the loss on re-lending your balance at current market rates. Variable-rate loans carry no early exit fee. Enter total costs including break fees, discharge fees ($150-$350), and new loan application fees.',
  ie: 'Irish remortgaging is less common than in the UK because most mortgages are variable rate, so lenders adjust your rate without requiring a switch. Switching lender (called switching in Ireland) is still possible. Some lenders offer cashback of 2-3% to switchers, which can offset legal and valuation costs.',
  de: 'Anschlussfinanzierung is the process of refinancing when your Zinsbindung (fixed-rate period) ends and your Restschuld (remaining balance) needs to be refinanced at a new rate. Breaking a fixed-rate period early carries a Vorfälligkeitsentschädigung (prepayment penalty). At the end of your Zinsbindung, no penalty applies.',
  nl: 'Dutch mortgage refinancing (oversluiten) carries boeterente (penalty interest) if done during a fixed period. At the end of your rentevaste periode, you can refinance penalty-free. NHG-backed mortgages can be transferred without penalty when moving home. Enter the boeterente in the refinancing costs field.',
  nz: "New Zealand fixed-rate mortgages carry a break fee if you refinance mid-term. The fee reflects the bank's cost of re-lending your balance at the lower rate for the remaining fixed period and can reach thousands of dollars. Variable (floating) rate loans carry no break fee. At the end of your fixed term, refinancing is fee-free.",
  fr: 'French law caps the early repayment penalty at 3% of the outstanding capital or 6 months\' interest, whichever is lower. You can renegotiate with your current lender (renégociation) or switch via subrogation de prêt. Legal costs for a subrogation are typically €500-€1,500. Enter total costs to find your break-even.',
  es: "Spanish subrogación hipotecaria lets you transfer your mortgage to a new lender at a capped fee: 0.05% for the first 3 years, nothing after that for variable-rate loans (since the 2019 Ley de Crédito Inmobiliario). Fixed-rate mortgages: 2% in years 1-10, 1.5% after. Enter the applicable fee as part of refinancing costs.",
  sg: 'Singapore home loan refinancing typically happens at the end of a lock-in period of 2-3 years. Repricing with your existing bank costs around S$800-1,000. Refinancing to a new bank costs more (legal fees of S$2,000-3,000) but usually offers better rates. Most loans have a clawback clause if you exit within 3 years of taking cashback or subsidised legal fees.',
  in: 'Home loan balance transfers are free of prepayment penalty on floating-rate loans under RBI rules for individual borrowers. The main cost is the new lender\'s processing fee, typically 0.5-1% of the outstanding amount. The break-even is usually less than one year when the rate difference exceeds 50 basis points.',
};

const LOCAL_CALLOUT: Record<string, { heading: string; body: string }> = {
  us: { heading: 'No-closing-cost refinances trade rate for fees', body: 'Lenders sometimes offer a no-closing-cost refinance where fees are rolled into the loan balance or offset by a higher interest rate. Enter zero in the refinancing costs field to see the immediate saving, then enter the true costs to check whether a standard or no-cost refinance serves you better over your expected remaining term.' },
  uk: { heading: 'Product fee versus rate: check both', body: "A mortgage with a £999 product fee and a lower rate can beat a fee-free deal even after accounting for the upfront cost. The break-even on the fee is typically six to eighteen months. Enter the full product fee plus any valuation cost in the refinancing costs field. If your new lender offers free legals, enter just the product fee and valuation." },
  ca: { heading: 'The IRD penalty can wipe out years of saving', body: "Canadian banks calculate the IRD as: (current rate minus posted rate for equivalent term) multiplied by outstanding balance multiplied by remaining months. On a $600,000 balance at 5.5% with 3 years remaining and current 3-year rates at 4.5%, the IRD can reach $18,000. Always get the exact penalty from your lender before deciding." },
  au: { heading: 'Fixed-rate break fees can be large and variable', body: 'Australian banks calculate fixed-rate break fees as the economic cost to the bank of re-lending your balance at current market rates. When rates have fallen since you locked in, this fee can be tens of thousands of dollars. Variable-rate loans carry no break fee and can be refinanced at any time. Always call your lender for an exact break fee before shopping around.' },
  ie: { heading: 'Cashback offers: read the clawback clause', body: 'Several Irish lenders offer 2-3% cashback on the mortgage amount when you switch to them. This is attractive but often subject to a clawback if you leave within three to five years. Check the clawback conditions before factoring cashback into your decision. The refinancing costs field accepts negative values if you want to model cashback as an offset.' },
  de: { heading: 'Lock in your next rate up to 3 months early', body: 'German lenders allow you to arrange your Anschlussfinanzierung up to 3 months before your Zinsbindung ends without a penalty, using a Forwardkredit. If rates are rising, locking early can save thousands. If rates are falling, waiting for the expiry date maximises your saving. Enter zero refinancing costs for the end-of-term scenario.' },
  nl: { heading: 'NHG borrowers can move penalty-free', body: 'If your mortgage carries the Nationale Hypotheekgarantie (NHG), you can transfer it to a new property without paying boeterente when moving home. If refinancing without moving, the penalty still applies during a fixed period. The NHG guarantee typically reduces your interest rate by 0.5-0.7%, which may make staying on an NHG loan more attractive than refinancing off it.' },
  nz: { heading: 'Shop during your fixed-period window', body: 'New Zealand banks typically allow you to lock in a new fixed rate up to 60 days before your current fixed period expires. This lets you secure your next rate without paying a break fee. If you wait until expiry, you have a brief window before your loan reverts to the floating rate, which is typically 1-2% higher than the best fixed rates.' },
  fr: { heading: 'Rachat de crédit vs renégociation', body: "Renégociation means renegotiating with your current lender. It is faster and cheaper but may not produce the best market rate. Subrogation means transferring to a new lender, which opens up the full market but involves legal costs and possibly a penalty. For differences under 0.5%, renégociation is usually sufficient. For larger differences, the cost of subrogation is typically recovered within two years." },
  es: { heading: 'Subrogación is almost always cheaper than novación', body: "Spain offers two routes: novación (renegotiating with your own bank) and subrogación (switching to a new lender). Since the 2019 mortgage law, your current lender must match any competing offer within 15 days. This gives you genuine negotiating leverage when you shop around. In practice, subrogación forces novación at market rate without completing the transfer." },
  sg: { heading: 'Reprice vs refinance: check the spread', body: 'Repricing with your existing bank costs S$800-1,000 and is done in days. Refinancing to a new bank takes 3-6 weeks and costs more in legal fees, though these are often subsidised by the new bank. The rate difference between repricing and refinancing is typically 0.1-0.3%. On a S$500,000 loan, each 0.1% saves about S$500 per year.' },
  in: { heading: 'The processing fee is the main cost', body: "Since RBI prohibits prepayment penalties on floating-rate loans for individual borrowers, the main cost of a balance transfer is the new lender's processing fee, typically 0.5-1% of the outstanding loan. On a Rs 50 lakh balance that is Rs 25,000-50,000. A 50 basis point rate saving covers that within about one year on the same balance." },
};

export default async function RefinancePage({ params }: { params: Promise<{ cc: string }> }) {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) notFound();

  const country = getCountry(cc as CountryCode);
  const allCountries = getAllCountries();

  let rateResult = null;
  try { rateResult = await fetchRate(cc as CountryCode); } catch { /* use default */ }

  const defaultRate = rateResult?.value ?? country.defaults.rate;

  const h1 = COUNTRY_H1[cc] ?? 'Refinance / Remortgage Break-Even Calculator';
  const answerFirst = ANSWER_FIRST[cc] ?? '';
  const callout = LOCAL_CALLOUT[cc] ?? { heading: 'End of fixed term versus mid-term refinancing', body: 'Refinancing at the end of a fixed-rate period typically carries no early repayment charge. Breaking a fixed term early usually does. Often one to five percent of the outstanding balance. Add any early repayment charge to the refinancing costs field to see the true break-even.' };

  return (
    <>
      <Header currentCountry={country} allCountries={allCountries} />
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
              <RefinanceCalculator country={country} defaultRate={defaultRate} />

              <div
                style={{
                  border: '1px solid var(--color-hairline)',
                  padding: '16px 20px',
                  marginTop: 32,
                  maxWidth: '72ch',
                }}
              >
                <h2 style={{ fontSize: 15, fontWeight: 500, margin: '0 0 6px' }}>
                  {callout.heading}
                </h2>
                <p style={{ fontSize: 15, lineHeight: 1.6, margin: 0, color: 'var(--color-ink-deep)' }}>
                  {callout.body}
                </p>
              </div>
            </div>
            <div style={{ position: 'sticky', top: 72 }}>
              <AdSlot width={300} height={600} />
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1160, margin: '32px auto 0', padding: '0 24px' }}>
          <AdSlot width={728} height={90} style={{ margin: '32px 0' }} />
          <TrustDisclosures convention={country.convention} rateResult={rateResult} />
          <div style={{ maxWidth: '72ch', padding: '48px 0 32px' }}>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-ink-mid)', margin: 0 }}>
              Reference rate sourced from official central bank or national statistics body data where available.
              This is an estimate for illustrative purposes only. Confirm costs and rates with your lender before
              proceeding.
            </p>
          </div>
        </div>
      </main>
      <Footer countries={allCountries} />
    </>
  );
}
