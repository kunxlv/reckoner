import type { TransferTaxRuleSet } from '@reckoner/rules-core';

const PROVENANCE = {
  source: 'HMRC',
  sourceUrl: 'https://www.gov.uk/stamp-duty-land-tax/residential-property-rates',
  lastReviewed: '2026-08-01',
  effectiveFrom: '2025-04-01',
};

// SDLT England/NI from 1 April 2025
const SDLT_BANDS = [
  { upTo: 125_000, rate: 0 },
  { upTo: 250_000, rate: 0.02 },
  { upTo: 925_000, rate: 0.05 },
  { upTo: 1_500_000, rate: 0.10 },
  { upTo: null, rate: 0.12 },
];

export const SDLT_RULESET: TransferTaxRuleSet = {
  calculator: 'transfer-tax',
  jurisdiction: 'GB-ENG',
  currency: 'GBP',
  tier: 1,
  provenance: PROVENANCE,
  bands: SDLT_BANDS,
  surcharges: [
    { id: 'additional_property', kind: 'flat_rate', value: 0.05, appliesWhen: 'additional_property' },
    { id: 'non_resident', kind: 'flat_rate', value: 0.02, appliesWhen: 'non_resident' },
  ],
  reliefs: [
    {
      id: 'first_time_buyer',
      bands: [
        { upTo: 300_000, rate: 0 },
        { upTo: 500_000, rate: 0.05 },
        { upTo: null, rate: 0.05 },  // relief lost above 500k; engine handles cap
      ],
      cap: 500_000,
    },
  ],
};

export const TEST_VECTORS = {
  sdlt_standard_500k: {
    description: 'HMRC worked example: £500,000 standard purchase',
    source: 'HMRC SDLT calculator, confirmed 2026-08-01',
    sourceUrl: 'https://www.gov.uk/stamp-duty-land-tax/residential-property-rates',
    input: { price: 500_000, surcharges: [] as string[], relief: null as string | null },
    ruleset: SDLT_RULESET,
    expected: {
      // 0% on £0-125k = £0
      // 2% on £125k-250k = £2,500
      // 5% on £250k-500k = £12,500
      // Total = £15,000
      tax: 15_000,
    },
  },
  sdlt_ftb_400k: {
    description: 'HMRC first-time buyer: £400,000 — FTB relief applies (under £500k cap)',
    source: 'HMRC SDLT first-time buyer guidance',
    sourceUrl: 'https://www.gov.uk/guidance/sdlt-first-time-buyers-relief',
    input: { price: 400_000, surcharges: [] as string[], relief: 'first_time_buyer' as string | null },
    ruleset: SDLT_RULESET,
    expected: {
      // 0% on £0-300k = £0
      // 5% on £300k-400k = £5,000
      tax: 5_000,
    },
  },
  sdlt_ftb_550k: {
    description: 'FTB purchase at £550,000 — over £500k cap so full rates apply',
    source: 'HMRC SDLT first-time buyer guidance',
    sourceUrl: 'https://www.gov.uk/guidance/sdlt-first-time-buyers-relief',
    input: { price: 550_000, surcharges: [] as string[], relief: 'first_time_buyer' as string | null },
    ruleset: SDLT_RULESET,
    expected: {
      // Relief lost (over 500k cap) — standard rates apply
      // 0% on 0-125k = 0
      // 2% on 125k-250k = 2500
      // 5% on 250k-550k = 15000
      // Total = 17500
      tax: 17_500,
    },
  },
  sdlt_additional_property: {
    description: 'Additional property surcharge on £500k purchase',
    source: 'HMRC SDLT additional property',
    sourceUrl: 'https://www.gov.uk/guidance/sdlt-transactions-involving-more-than-one-property',
    input: { price: 500_000, surcharges: ['additional_property'], relief: null as string | null },
    ruleset: SDLT_RULESET,
    expected: {
      // 15000 (standard) + 5% × 500000 (surcharge) = 15000 + 25000 = 40000
      tax: 40_000,
    },
  },
} as const;
