import { describe, it, expect } from 'vitest';
import { calculate } from '../src/engine';

describe('edge cases', () => {
  it('zero termYears produces an empty schedule with zero interest', () => {
    const result = calculate({
      principal: 100_000,
      annualRate: 0.05,
      termYears: 0,
      periodsPerYear: 12,
      convention: 'standardMonthly',
    });
    expect(result.rows).toHaveLength(0);
    expect(result.totalInterest).toBe(0);
    expect(result.payoffPeriod).toBe(0);
  });

  it('zero annualRate amortises principal evenly with no interest', () => {
    const result = calculate({
      principal: 12_000,
      annualRate: 0,
      termYears: 1,
      periodsPerYear: 12,
      convention: 'standardMonthly',
    });
    expect(result.payment).toBeCloseTo(1_000, 4);
    expect(result.totalInterest).toBeCloseTo(0, 4);
    expect(result.rows).toHaveLength(12);
    expect(result.crossoverPeriod).toBeNull();
  });
});
