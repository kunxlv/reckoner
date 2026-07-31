import { describe, it, expect } from 'vitest';
import { calculate } from '../src/engine.js';
import { TEST_VECTORS } from '../vectors/index.js';

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

  it('crossoverPeriod is around year 18 (period ~216)', () => {
    const result = calculate(input);
    expect(result.crossoverPeriod).not.toBeNull();
    // For 6.5% 30yr, crossover is around period 214-220
    expect(result.crossoverPeriod!).toBeGreaterThan(200);
    expect(result.crossoverPeriod!).toBeLessThan(230);
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
  it('26 fortnightly payments per year saves interest vs monthly', () => {
    const monthly = calculate({
      principal: 600_000, annualRate: 0.06, termYears: 30,
      periodsPerYear: 12, convention: 'standardMonthly',
    });
    const fortnightly = calculate({
      principal: 600_000, annualRate: 0.06, termYears: 30,
      periodsPerYear: 26, convention: 'standardMonthly',
    });
    expect(fortnightly.totalInterest).toBeLessThan(monthly.totalInterest);
    expect(fortnightly.payoffPeriod).toBeLessThan(monthly.payoffPeriod);
  });
});
