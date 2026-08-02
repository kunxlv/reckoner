import { describe, it, expect } from 'vitest';
import { calculate } from '../src/engine';
import { TEST_VECTORS } from '../vectors/index';

describe('standardMonthly — US vector (FRED MORTGAGE30US)', () => {
  const { input, expected, tolerance } = TEST_VECTORS.us;

  it('payment matches to within $0.01', () => {
    const result = calculate(input);
    expect(Math.abs(result.payment - expected.payment)).toBeLessThanOrEqual(tolerance);
  });

  it('total interest matches to within $1', () => {
    const result = calculate(input);
    expect(Math.abs(result.totalInterest - expected.totalInterest)).toBeLessThanOrEqual(1);
  });

  it('payoff period is exactly 360', () => {
    const result = calculate(input);
    expect(result.payoffPeriod).toBe(360);
  });

  it('final balance is zero (within $0.01)', () => {
    const result = calculate(input);
    const lastRow = result.rows[result.rows.length - 1]!;
    expect(Math.abs(lastRow.balance)).toBeLessThanOrEqual(0.01);
  });

  it('crossoverPeriod is at period 233 (≈ year 19.4 for 6.5% 30yr)', () => {
    // Derivation: crossover when balance = payment / (2i)
    // t = n − ln(2) / ln(1+i) = 360 − ln(2)/ln(1.00541667) ≈ 231.7 → period 232/233 boundary
    const result = calculate(input);
    expect(result.crossoverPeriod).toBe(233);
  });
});

describe('standardMonthly — UK vector (BoE)', () => {
  const { input, expected, tolerance } = TEST_VECTORS.uk;

  it('payment matches to within $0.02', () => {
    const result = calculate(input);
    expect(Math.abs(result.payment - expected.payment)).toBeLessThanOrEqual(tolerance);
  });
});

describe('standardMonthly — AU vector (RBA)', () => {
  const { input, expected, tolerance } = TEST_VECTORS.au;

  it('payment matches to within $0.02', () => {
    const result = calculate(input);
    expect(Math.abs(result.payment - expected.payment)).toBeLessThanOrEqual(tolerance);
  });
});

describe('standardMonthly — fortnightly frequency (AU/NZ)', () => {
  it('26 fortnightly payments per year pays slightly less total interest than monthly', () => {
    const monthly = calculate({
      principal: 600_000, annualRate: 0.06, termYears: 30,
      periodsPerYear: 12, convention: 'standardMonthly',
    });
    const fortnightly = calculate({
      principal: 600_000, annualRate: 0.06, termYears: 30,
      periodsPerYear: 26, convention: 'standardMonthly',
    });
    // Both terms are 30 years so payoffPeriod is the same duration,
    // just expressed in different units (780 fortnights vs 360 months).
    // The annuity sets payments to clear the loan in exactly the stated term.
    expect(fortnightly.totalInterest).toBeLessThan(monthly.totalInterest);
    expect(fortnightly.payoffPeriod / 26).toBeCloseTo(monthly.payoffPeriod / 12, 1);
  });
});
