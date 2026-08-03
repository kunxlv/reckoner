import { describe, it, expect } from 'vitest';
import { calcRefinance } from '../src/lib/refinance';

describe('calcRefinance', () => {
  it('zero balance returns zero payments and no break-even', () => {
    const result = calcRefinance({ balance: 0, currentRate: 0.06, newRate: 0.05, remainingYears: 25, closingCosts: 3000 });
    expect(result.currentPayment).toBe(0);
    expect(result.newPayment).toBe(0);
    expect(result.monthlySavings).toBe(0);
    expect(result.breakEvenMonths).toBeNull();
  });

  it('equal rates produce zero saving and no break-even', () => {
    const result = calcRefinance({ balance: 300_000, currentRate: 0.05, newRate: 0.05, remainingYears: 20, closingCosts: 2000 });
    expect(result.monthlySavings).toBeCloseTo(0, 5);
    expect(result.breakEvenMonths).toBeNull();
  });

  it('new rate higher than current produces negative saving and no break-even', () => {
    const result = calcRefinance({ balance: 300_000, currentRate: 0.04, newRate: 0.06, remainingYears: 20, closingCosts: 1000 });
    expect(result.monthlySavings).toBeLessThan(0);
    expect(result.breakEvenMonths).toBeNull();
  });

  it('zero closing costs means break-even is 0 months when there is a saving', () => {
    const result = calcRefinance({ balance: 400_000, currentRate: 0.065, newRate: 0.055, remainingYears: 25, closingCosts: 0 });
    expect(result.monthlySavings).toBeGreaterThan(0);
    expect(result.breakEvenMonths).toBe(0);
  });

  it('calculates correct break-even months (ceiling)', () => {
    // Closing costs 3000, monthly saving ~250 → ceil(3000/250) = 12
    const result = calcRefinance({ balance: 400_000, currentRate: 0.065, newRate: 0.055, remainingYears: 25, closingCosts: 3000 });
    expect(result.breakEvenMonths).toBeGreaterThan(0);
    expect(typeof result.breakEvenMonths).toBe('number');
    // break-even = ceil(closingCosts / monthlySavings)
    expect(result.breakEvenMonths).toBe(Math.ceil(3000 / result.monthlySavings));
  });

  it('totalSavingOverTerm accounts for closing costs', () => {
    const result = calcRefinance({ balance: 400_000, currentRate: 0.065, newRate: 0.055, remainingYears: 25, closingCosts: 3000 });
    const expected = result.monthlySavings * 25 * 12 - 3000;
    expect(result.totalSavingOverTerm).toBeCloseTo(expected, 2);
  });

  it('zero interest rate: payment is principal / n', () => {
    const result = calcRefinance({ balance: 120_000, currentRate: 0, newRate: 0, remainingYears: 10, closingCosts: 0 });
    expect(result.currentPayment).toBeCloseTo(1000, 2); // 120000 / 120
    expect(result.newPayment).toBeCloseTo(1000, 2);
  });
});
