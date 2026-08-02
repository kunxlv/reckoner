/**
 * Payment frequency tests: monthly (12), fortnightly (26), weekly (52).
 *
 * Key insight: with a pure annuity (no extra payments), all three frequencies
 * pay off in EXACTLY the stated term. The annuity formula sets the periodic
 * payment to clear the loan in termYears regardless of frequency.
 *
 * The benefit of more-frequent payments is a *slightly* lower total interest,
 * because each payment retires principal sooner, reducing the average balance
 * on which interest accrues. The savings are modest (hundreds, not thousands)
 * for a standard 30yr mortgage.
 *
 * The payment amount is NOT simply monthly/2 or monthly/4 — the annuity
 * formula uses the correct periodic rate for each frequency, which scales
 * non-linearly.
 */
import { describe, it, expect } from 'vitest';
import { calculate } from '../src/engine';

const BASE_STD = {
  principal: 600_000,
  annualRate: 0.06,
  termYears: 30,
  convention: 'standardMonthly' as const,
};

const BASE_CA = {
  principal: 560_000,
  annualRate: 0.05,
  termYears: 25,
  convention: 'canadianSemiAnnual' as const,
};

describe('standardMonthly — payment ordering by frequency', () => {
  const monthly = calculate({ ...BASE_STD, periodsPerYear: 12 });
  const fortnightly = calculate({ ...BASE_STD, periodsPerYear: 26 });
  const weekly = calculate({ ...BASE_STD, periodsPerYear: 52 });

  it('periodic payment decreases as frequency increases', () => {
    expect(weekly.payment).toBeLessThan(fortnightly.payment);
    expect(fortnightly.payment).toBeLessThan(monthly.payment);
  });

  it('all frequencies retire the loan in exactly 30 years', () => {
    expect(monthly.payoffPeriod / 12).toBeCloseTo(30, 1);
    expect(fortnightly.payoffPeriod / 26).toBeCloseTo(30, 1);
    expect(weekly.payoffPeriod / 52).toBeCloseTo(30, 1);
  });

  it('more-frequent payments accrue slightly less total interest', () => {
    expect(fortnightly.totalInterest).toBeLessThan(monthly.totalInterest);
    expect(weekly.totalInterest).toBeLessThan(fortnightly.totalInterest);
  });

  it('fortnightly saves a positive but modest amount vs monthly', () => {
    const savings = monthly.totalInterest - fortnightly.totalInterest;
    expect(savings).toBeGreaterThan(0);
    expect(savings).toBeLessThan(5_000); // savings are real but modest
  });

  it('weekly saves more than fortnightly vs monthly', () => {
    expect(monthly.totalInterest - weekly.totalInterest).toBeGreaterThan(
      monthly.totalInterest - fortnightly.totalInterest
    );
  });
});

describe('canadianSemiAnnual — payment frequency ordering', () => {
  const monthly = calculate({ ...BASE_CA, periodsPerYear: 12 });
  const fortnightly = calculate({ ...BASE_CA, periodsPerYear: 26 });
  const weekly = calculate({ ...BASE_CA, periodsPerYear: 52 });

  it('more-frequent payments accrue slightly less total interest', () => {
    expect(fortnightly.totalInterest).toBeLessThan(monthly.totalInterest);
    expect(weekly.totalInterest).toBeLessThan(fortnightly.totalInterest);
  });

  it('canadianSemiAnnual gives lower payment than standardMonthly at every frequency', () => {
    const stdMonthly = calculate({ ...BASE_CA, periodsPerYear: 12, convention: 'standardMonthly' });
    const stdFortnightly = calculate({ ...BASE_CA, periodsPerYear: 26, convention: 'standardMonthly' });
    expect(monthly.payment).toBeLessThan(stdMonthly.payment);
    expect(fortnightly.payment).toBeLessThan(stdFortnightly.payment);
  });

  it('fortnightly periodic rate uses semi-annual compounding formula', () => {
    // i = (1 + 0.05/2)^(2/26) - 1
    const expected = Math.pow(1.025, 2 / 26) - 1;
    const row1 = fortnightly.rows[0]!;
    const impliedRate = row1.interest / BASE_CA.principal;
    expect(Math.abs(impliedRate - expected)).toBeLessThan(1e-10);
  });
});

describe('extra payments — interaction with frequency', () => {
  it('extra $500/period reduces total interest for monthly schedule', () => {
    const base = calculate({ ...BASE_STD, periodsPerYear: 12 });
    const withExtra = calculate({ ...BASE_STD, periodsPerYear: 12, extraPaymentPerPeriod: 500 });
    expect(withExtra.totalInterest).toBeLessThan(base.totalInterest);
    expect(withExtra.payoffPeriod).toBeLessThan(base.payoffPeriod);
  });

  it('extra $250/fortnight reduces total interest for fortnightly schedule', () => {
    const base = calculate({ ...BASE_STD, periodsPerYear: 26 });
    const withExtra = calculate({ ...BASE_STD, periodsPerYear: 26, extraPaymentPerPeriod: 250 });
    expect(withExtra.totalInterest).toBeLessThan(base.totalInterest);
    expect(withExtra.payoffPeriod).toBeLessThan(base.payoffPeriod);
  });
});
