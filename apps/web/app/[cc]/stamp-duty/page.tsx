import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCountry, getAllCountries, COUNTRY_CODES, loadStampDutyRules } from '@reckoner/finance-data';
import type { CountryCode } from '@reckoner/finance-data';
import { asOf } from '@reckoner/rules-core';
import { AdSlot } from '@reckoner/analytics';
import { Header } from '../../../src/components/Header';
import { Footer } from '../../../src/components/Footer';
import { StampDutyCalculator } from '../../../src/components/StampDutyCalculator';
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
    title: `Stamp Duty / Transfer Tax Calculator ${country.code.toUpperCase()} | Reckoner`,
    description: `Calculate stamp duty or transfer tax for a property purchase in ${country.code.toUpperCase()}. Free, sourced from official government rates.`,
    robots: { index: true, follow: true },
  };
}

const H1: Record<string, string> = {
  us: 'US Property Transfer Tax',
  uk: 'Stamp Duty Calculator (England and Northern Ireland)',
  ca: 'Canadian Land Transfer Tax Calculator',
  au: 'Australian Stamp Duty Calculator',
  ie: 'Irish Stamp Duty Calculator',
  de: 'German Grunderwerbsteuer Calculator',
  nl: 'Dutch Transfer Tax Calculator',
  nz: 'New Zealand Property Transfer',
  fr: 'French Droits de Mutation Calculator',
  es: 'Spanish ITP Calculator',
  sg: 'Singapore Buyer Stamp Duty Calculator',
  in: 'Indian Stamp Duty Calculator',
};

const ANSWER_FIRST: Record<string, string> = {
  us: 'Property transfer tax in the US is set by individual states and counties. Rates vary widely: some states charge nothing, others charge up to 2% of the purchase price. Enter the rate you have been quoted by your title company or attorney.',
  uk: 'A £400,000 purchase in England pays £10,000 in Stamp Duty Land Tax: 0% on the first £250,000, then 5% on the remaining £150,000. From 1 April 2025, the nil-rate band returned to £125,000 and the first-time buyer relief threshold is £500,000 (0% to £300,000, then 5% up to £500,000). Scotland and Wales have their own taxes (LBTT and LTT) with different bands.',
  ca: 'Land transfer tax is collected by provinces, not the federal government. Ontario charges graduated rates from 0.5% to 2.5%; British Columbia charges 1-3%. Toronto buyers also pay a separate municipal land transfer tax on top of the provincial one. The rates above reflect a representative provincial calculation.',
  au: 'Stamp duty rates vary by state. NSW charges 1.25-5.5%, Victoria 1.4-5.5% with thresholds indexed annually. The figure above uses representative Australian rates. Many states offer first home buyer concessions or exemptions below a price threshold.',
  ie: "Irish Stamp Duty is straightforward: 1% on the first €1,000,000 and 2% above that. There is no graduated band structure like the UK, and no first-time buyer exemption. The Central Bank's income and loan-to-value limits operate on the mortgage side, not the stamp duty side.",
  de: 'Grunderwerbsteuer is set at the state (Bundesland) level, ranging from 3.5% in Bavaria and Saxony to 6.5% in Brandenburg, North Rhine-Westphalia, and Thuringia. A €400,000 purchase in Bavaria pays €14,000; in NRW, €26,000. Use the rate for the state the property is in.',
  nl: 'The Netherlands charges 2% for owner-occupiers and 10.4% for investors or second-property buyers. First-time buyers under 35 buying a property under €510,000 pay 0%. A €400,000 purchase as owner-occupier pays €8,000; as an investor, €41,600.',
  nz: 'New Zealand does not charge stamp duty or transfer tax on residential property. The figure above will always be zero. Main transaction costs are legal fees (NZD 1,500-3,000) and a Land Information Memorandum (LIM) report from the council.',
  fr: 'French droits de mutation for existing properties are approximately 5.8% of the purchase price in most departments. New-build properties are exempt from transfer tax but subject to VAT at 20%. A €350,000 existing property incurs roughly €20,000 in transfer tax, plus €5,000-8,000 in notary fees.',
  es: "Spain's Impuesto de Transmisiones Patrimoniales (ITP) is set by each autonomous community, ranging from 6% in Madrid to 11% in some regions. Most communities charge 7-10%. New developments are exempt from ITP but subject to VAT (IVA) at 10% instead.",
  sg: 'Singapore Buyer Stamp Duty (BSD) is charged on all buyers at graduated rates. Additional Buyer Stamp Duty (ABSD) is charged on top: Singapore Citizens pay 0% ABSD on their first property, 20% on a second, and 30% on third and beyond. Foreigners pay 60% flat.',
  in: 'Stamp duty in India is set by each state and typically ranges from 5-8% of the property value, plus a registration fee of 1-2%. Maharashtra charges 5-6%, Delhi 4-6%, Karnataka 5%. Several states offer lower rates when the property is registered in a woman\'s name.',
};

const LOCAL_CALLOUT: Record<string, { heading: string; body: string } | null> = {
  us: null,
  uk: { heading: 'Additional property surcharge', body: 'Buying a second home or investment property carries a 5% surcharge on the full purchase price, added in the Autumn 2024 Budget. Toggle "Additional property" above to see how it affects your figure. The surcharge applies from the first pound, not just the portion above a threshold.' },
  ca: { heading: 'Toronto adds a second layer of tax', body: "Buyers in Toronto pay both Ontario land transfer tax and Toronto's municipal land transfer tax. The two use identical brackets, so the combined bill is roughly double the provincial figure alone. First-time buyers in Ontario can claim a rebate of up to $4,000 on provincial tax and up to $4,475 on Toronto's tax." },
  au: { heading: 'First home buyer concessions vary by state', body: 'NSW offers a stamp duty exemption for first home buyers on properties under $800,000 and a concession up to $1,000,000. Victoria offers an exemption under $600,000 and a concession to $750,000. Queensland has its own thresholds. Check with your state revenue office before completion.' },
  ie: { heading: 'Stamp duty is simple; the mortgage rules are not', body: "Ireland's stamp duty structure is one of the simplest in Europe. The complexity is on the lending side: first-time buyers are capped at 4 times gross income and 90% LTV. Stamp duty is the same rate for everyone, including investors, with no surcharge for buy-to-let purchases." },
  de: { heading: 'Rate depends on which state the property is in', body: 'Bavaria and Saxony: 3.5%. Baden-Württemberg, Bremen, Lower Saxony, Rhineland-Palatinate: 5%. Hamburg: 5.5%. Berlin, Hesse, Mecklenburg-Vorpommern, Saxony-Anhalt: 6%. Brandenburg, NRW, Saarland, Schleswig-Holstein, Thuringia: 6.5%. Look up the exact rate for your specific state before proceeding.' },
  nl: { heading: 'Starter vrijstelling for first-time buyers under 35', body: 'First-time buyers under age 35 pay 0% transfer tax on properties up to €510,000 (2025 threshold). Above that price, the full 2% applies to the entire price. This exemption applies once per lifetime, only for a property you will actually live in as your primary residence.' },
  nz: { heading: 'No stamp duty, but the bright-line test applies to disposals', body: 'New Zealand has no stamp duty on purchase. However, investment property sold within the bright-line period can trigger income tax on any gain. The period is 2 years for properties acquired after 1 July 2024, and longer for earlier purchases. This is an income tax on disposal, not a transaction tax on purchase.' },
  fr: { heading: 'Existing vs new-build tax treatment differs sharply', body: 'For resale (ancien) properties: droits de mutation of roughly 5.8%, plus notary fees, totaling 7-8%. For new-build (neuf): no transfer tax, but 20% VAT is embedded in the price. If you are buying off-plan, check whether the purchase price is VAT-inclusive. It normally is.' },
  es: { heading: 'ITP rate depends on the autonomous community', body: "Madrid 6%, Navarre 6%, Aragon 6.5%, Canary Islands 6.5%. Most other communities charge 8-10%, with Catalonia and Extremadura reaching 10-11% for higher-value properties. The rate for the property's location applies, not where you are tax-resident." },
  sg: { heading: 'ABSD makes Singapore the highest-tax market for foreign buyers', body: 'Singapore Citizens pay 0% ABSD on their first property, 20% on a second, 30% on third and beyond. Permanent Residents pay 5% on their first, 30% on subsequent purchases. Foreign buyers pay 60% flat. For a S$1.2M property, a foreign buyer pays roughly S$720,000 in ABSD on top of BSD.' },
  in: { heading: 'Women buyers get a concession in many states', body: "Several states charge lower stamp duty when the property is registered in a woman's name. Maharashtra charges 5% for women versus 6% for men. Delhi charges 4% for women versus 6% for men. Karnataka and UP also offer concessions. Registering in a woman's name can save several lakh rupees on a typical purchase." },
};

export default async function StampDutyPage({ params }: { params: Promise<{ cc: string }> }) {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) notFound();

  const country = getCountry(cc as CountryCode);
  const allCountries = getAllCountries();

  const versions = await loadStampDutyRules(cc as CountryCode);
  const ruleset = asOf(versions);

  const h1 = H1[cc] ?? 'Stamp Duty / Transfer Tax Calculator';
  const answerFirst = ANSWER_FIRST[cc] ?? '';
  const callout = LOCAL_CALLOUT[cc] ?? null;

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
              {ruleset.tier > 1 && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-ink-mid)', border: '1px solid var(--color-hairline)', borderRadius: 100, padding: '3px 10px', marginBottom: 16 }}>
                  Standard model
                </div>
              )}
              <StampDutyCalculator country={country} ruleset={ruleset} />
            </div>
            <div style={{ position: 'sticky', top: 72 }}>
              <AdSlot width={300} height={600} />
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1160, margin: '32px auto 0', padding: '0 24px' }}>
          <AdSlot width={728} height={90} style={{ margin: '32px 0' }} />
          <TrustDisclosures convention={country.convention} rateResult={null} />

          <div style={{ maxWidth: '72ch', padding: '48px 0 32px' }}>
            {callout && (
              <div style={{ border: '1px solid var(--color-hairline)', padding: '16px 20px', marginBottom: 32 }}>
                <h2 style={{ fontSize: 15, fontWeight: 500, margin: '0 0 6px' }}>{callout.heading}</h2>
                <p style={{ fontSize: 15, lineHeight: 1.6, margin: 0, color: 'var(--color-ink-deep)' }}>{callout.body}</p>
              </div>
            )}
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-ink-mid)', margin: 0 }}>
              Rates sourced from {ruleset.provenance.source}. Last reviewed {ruleset.provenance.lastReviewed}. Effective from {ruleset.provenance.effectiveFrom}. This is an estimate for illustrative purposes only. Confirm with your solicitor or conveyancer before completion.
            </p>
          </div>
        </div>
      </main>
      <Footer countries={allCountries} />
    </>
  );
}
