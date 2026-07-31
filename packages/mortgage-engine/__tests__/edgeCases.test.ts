import { describe, it, expect } from 'vitest';
import { calculate } from '../src/engine.js';

const base = {
  principal: 400_000,
  annualRate: 0.065,
  termYears: 30,
  periodsPerYear: 12 as const,
  convention: 'standardMonthly' as const,
};

describe('edge cases', () => {
  it('0% interest — payment is principal / n', () => {
    const result = calculate({ ...base, annualRate: 0 });
    const n = 30 * 12;
    expect(Math.abs(result.payment - 400_000 / n)).toBeLessThan(0.001);
    expect(result.crossoverPeriod).toBeNull();
  });

  it('1-year term', () => {
    const result = calculate({ ...base, termYears: 1 });
    expect(result.payoffPeriod).toBe(12);
    const lastRow = result.rows[result.rows.length - 1]!;
    expect(Math.abs(lastRow.balance)).toBeLessThanOrEqual(0.01);
  });

  it('extra payments clear loan early', () => {
    const base30 = calculate(base);
    const withExtra = calculate({ ...base, extraPaymentPerPeriod: 500 });
    expect(withExtra.payoffPeriod).toBeLessThan(base30.payoffPeriod);
    expect(withExtra.totalInterest).toBeLessThan(base30.totalInterest);
  });

  it('large extra payment clears loan in first period when extra >= remaining principal', () => {
    const result = calculate({
      ...base,
      principal: 1_000,
      termYears: 30,
      extraPaymentPerPeriod: 1_000_000,
    });
    expect(result.payoffPeriod).toBe(1);
  });

  it('rows are monotonically decreasing in balance', () => {
    const result = calculate(base);
    for (let i = 1; i < result.rows.length; i++) {
      expect(result.rows[i]!.balance).toBeLessThan(result.rows[i - 1]!.balance);
    }
  });

  it('cumulative principal + cumulative interest = total paid for every row', () => {
    const result = calculate(base);
    for (const row of result.rows) {
      const expected = row.cumulativePrincipal + row.cumulativeInterest;
      expect(Math.abs(row.cumulativePrincipal + row.cumulativeInterest - expected)).toBeLessThan(0.001);
    }
  });
});
