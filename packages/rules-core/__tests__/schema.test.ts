import { describe, it, expect } from 'vitest';
import { TransferTaxRuleSetSchema, AffordabilityRuleSetSchema } from '../src/schema';

const validProvenance = {
  source: 'HMRC',
  sourceUrl: 'https://www.gov.uk/stamp-duty-land-tax',
  lastReviewed: '2025-01-01',
  effectiveFrom: '2024-04-01',
};

describe('TransferTaxRuleSetSchema', () => {
  it('accepts a valid TransferTaxRuleSet', () => {
    const input = {
      calculator: 'transfer-tax' as const,
      jurisdiction: 'England',
      currency: 'GBP',
      tier: 1 as const,
      provenance: validProvenance,
      bands: [
        { upTo: 250000, rate: 0 },
        { upTo: 925000, rate: 0.05 },
        { upTo: null, rate: 0.12 },
      ],
    };
    expect(() => TransferTaxRuleSetSchema.parse(input)).not.toThrow();
  });

  it('rejects when bands is empty', () => {
    const input = {
      calculator: 'transfer-tax' as const,
      jurisdiction: 'England',
      currency: 'GBP',
      tier: 1 as const,
      provenance: validProvenance,
      bands: [],
    };
    const result = TransferTaxRuleSetSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe('AffordabilityRuleSetSchema', () => {
  it('accepts a valid AffordabilityRuleSet', () => {
    const input = {
      calculator: 'affordability' as const,
      jurisdiction: 'England',
      provenance: validProvenance,
      method: 'lti_ltv' as const,
      params: { maxLti: 4.5, maxLtv: 0.9 },
    };
    expect(() => AffordabilityRuleSetSchema.parse(input)).not.toThrow();
  });
});
