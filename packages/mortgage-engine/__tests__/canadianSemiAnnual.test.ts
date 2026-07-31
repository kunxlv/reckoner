import { describe, it, expect } from 'vitest';
import { calculate } from '../src/engine.js';
import { canadianSemiAnnual } from '../src/conventions/canadianSemiAnnual.js';
import { TEST_VECTORS } from '../vectors/index.js';

describe('canadianSemiAnnual — Bank of Canada vector', () => {
  const { input, expected, tolerance } = TEST_VECTORS.ca;

  it('payment matches to within $0.01', () => {
    const result = calculate(input);
    expect(Math.abs(result.payment - expected.payment)).toBeLessThanOrEqual(tolerance);
  });

  it('is lower than standardMonthly for the same inputs (CA semi-annual costs less)', () => {
    const canadian = calculate(input);
    const standard = calculate({ ...input, convention: 'standardMonthly' });
    // Semi-annual compounding produces a slightly lower effective periodic rate
    expect(canadian.payment).toBeLessThan(standard.payment);
  });

  it('periodic rate formula is correct: i = (1 + r/2)^(1/6) - 1 for monthly', () => {
    // r = 5%, semi-annual: (1.025)^(1/6) - 1
    const expected_i = Math.pow(1.025, 1 / 6) - 1;
    const actual_i = canadianSemiAnnual.periodicRate(0.05, 12);
    expect(Math.abs(actual_i - expected_i)).toBeLessThan(1e-12);
  });
});
