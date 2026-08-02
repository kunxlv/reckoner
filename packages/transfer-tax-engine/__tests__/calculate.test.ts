import { describe, it, expect } from 'vitest';
import { calculateTransferTax } from '../src/calculate';
import { calculateTransferTax as calculateFromIndex } from '../src/index';
import { TEST_VECTORS } from '../vectors/index';

describe('progressiveTax', () => {
  it('HMRC £500k standard — £15,000', () => {
    const v = TEST_VECTORS.sdlt_standard_500k;
    const result = calculateTransferTax(v.input, v.ruleset);
    expect(result.tax).toBe(v.expected.tax);
  });

  it('HMRC FTB £400k — £5,000', () => {
    const v = TEST_VECTORS.sdlt_ftb_400k;
    const result = calculateTransferTax(v.input, v.ruleset);
    expect(result.tax).toBe(v.expected.tax);
  });

  it('FTB £550k over cap — full rates apply, £17,500', () => {
    const v = TEST_VECTORS.sdlt_ftb_550k;
    const result = calculateTransferTax(v.input, v.ruleset);
    expect(result.tax).toBe(v.expected.tax);
  });

  it('Additional property surcharge on £500k — £40,000', () => {
    const v = TEST_VECTORS.sdlt_additional_property;
    const result = calculateTransferTax(v.input, v.ruleset);
    expect(result.tax).toBe(v.expected.tax);
  });

  it('zero price returns zero tax', () => {
    const v = TEST_VECTORS.sdlt_standard_500k;
    const result = calculateTransferTax({ price: 0, surcharges: [], relief: null }, v.ruleset);
    expect(result.tax).toBe(0);
  });

  it('effectiveRate is tax divided by price', () => {
    const v = TEST_VECTORS.sdlt_standard_500k;
    const result = calculateTransferTax(v.input, v.ruleset);
    expect(result.effectiveRate).toBeCloseTo(15_000 / 500_000);
  });

  it('breakdown includes a Stamp duty line item', () => {
    const v = TEST_VECTORS.sdlt_standard_500k;
    const result = calculateTransferTax(v.input, v.ruleset);
    expect(result.breakdown[0]?.label).toBe('Stamp duty');
    expect(result.breakdown[0]?.amount).toBe(15_000);
  });

  it('breakdown includes surcharge line item', () => {
    const v = TEST_VECTORS.sdlt_additional_property;
    const result = calculateTransferTax(v.input, v.ruleset);
    expect(result.breakdown).toHaveLength(2);
    expect(result.breakdown[1]?.label).toBe('additional property');
    expect(result.breakdown[1]?.amount).toBe(25_000);
  });

  it('unknown surcharge ID is ignored', () => {
    const v = TEST_VECTORS.sdlt_standard_500k;
    const result = calculateTransferTax(
      { price: 500_000, surcharges: ['unknown_surcharge'], relief: null },
      v.ruleset,
    );
    expect(result.tax).toBe(15_000);
    expect(result.breakdown).toHaveLength(1);
  });

  it('unknown relief ID falls back to standard bands', () => {
    const v = TEST_VECTORS.sdlt_standard_500k;
    const result = calculateTransferTax(
      { price: 500_000, surcharges: [], relief: 'unknown_relief' },
      v.ruleset,
    );
    expect(result.tax).toBe(15_000);
  });

  it('relief with null cap always applies relief bands', () => {
    const baseRuleset = TEST_VECTORS.sdlt_standard_500k.ruleset;
    // Build a ruleset with a relief that has no cap
    const rulesetWithNullCap: typeof baseRuleset = {
      ...baseRuleset,
      reliefs: [
        {
          id: 'no_cap_relief',
          bands: [{ upTo: null, rate: 0 as const }],
          cap: null,
        },
      ],
    };
    const result = calculateTransferTax(
      { price: 1_000_000, surcharges: [], relief: 'no_cap_relief' },
      rulesetWithNullCap,
    );
    expect(result.tax).toBe(0);
  });

  it('zero price breakdown is empty', () => {
    const v = TEST_VECTORS.sdlt_standard_500k;
    const result = calculateTransferTax({ price: 0, surcharges: [], relief: null }, v.ruleset);
    expect(result.breakdown).toHaveLength(0);
    expect(result.effectiveRate).toBe(0);
  });

  it('FTB £550k breakdown shows over-cap label', () => {
    const v = TEST_VECTORS.sdlt_ftb_550k;
    const result = calculateTransferTax(v.input, v.ruleset);
    expect(result.breakdown[0]?.label).toBe('Stamp duty (standard rates, relief not applied: over price cap)');
  });

  it('re-export from src/index matches direct import', () => {
    const v = TEST_VECTORS.sdlt_standard_500k;
    const result = calculateFromIndex(v.input, v.ruleset);
    expect(result.tax).toBe(15_000);
  });
});
