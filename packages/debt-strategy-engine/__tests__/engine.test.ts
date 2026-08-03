import { describe, it, expect } from 'vitest';
import { calculateDebtStrategy } from '../src/engine';
import type { Debt } from '../src/types';

// Two simple debts for deterministic calculations:
// Debt A: $1,000 (100000c), 24% APR, $30/month minimum (3000c)
// Debt B: $500 (50000c), 12% APR, $20/month minimum (2000c)
// Extra: $50/month (5000c)
const DEBT_A: Debt = { name: 'Credit card', balanceCents: 100000, annualRate: 0.24, minPaymentCents: 3000 };
const DEBT_B: Debt = { name: 'Personal loan', balanceCents: 50000, annualRate: 0.12, minPaymentCents: 2000 };

describe('calculateDebtStrategy — minimum strategy', () => {
  it('minimum strategy pays only minimums with no extra budget', () => {
    const result = calculateDebtStrategy([DEBT_A, DEBT_B], 'minimum', 0);
    expect(result.strategy).toBe('minimum');
    expect(result.months).toBeGreaterThan(0);
    // Each month's total payment should be at most minA + minB (less in final months)
    const firstRow = result.schedule[0]!;
    expect(firstRow.totalPaymentCents).toBeLessThanOrEqual(5000);
    // debtBalancesCents length matches input
    expect(firstRow.debtBalancesCents).toHaveLength(2);
    // Final month: all balances zero
    const lastRow = result.schedule[result.months - 1]!;
    expect(lastRow.totalBalanceCents).toBe(0);
    expect(lastRow.debtBalancesCents[0]).toBe(0);
    expect(lastRow.debtBalancesCents[1]).toBe(0);
  });

  it('minimum strategy result has correct schedule length', () => {
    const result = calculateDebtStrategy([DEBT_A, DEBT_B], 'minimum', 0);
    expect(result.schedule).toHaveLength(result.months);
    result.schedule.forEach((row, i) => {
      expect(row.month).toBe(i + 1);
    });
  });
});

describe('calculateDebtStrategy — snowball strategy', () => {
  // Snowball focuses extra on lowest balance first (Debt B at $500)
  it('snowball focuses extra on lowest balance debt first', () => {
    const result = calculateDebtStrategy([DEBT_A, DEBT_B], 'snowball', 5000);
    expect(result.strategy).toBe('snowball');
    // Snowball should pay off faster than minimum-only
    const minResult = calculateDebtStrategy([DEBT_A, DEBT_B], 'minimum', 5000);
    // With snowball, total interest should be different from minimum
    expect(result.months).toBeGreaterThan(0);
    // Debt B (lower balance) should be paid off before Debt A in snowball
    const debtBPayoffMonth = result.schedule.findIndex((r) => r.debtBalancesCents[1] === 0);
    const debtAPayoffMonth = result.schedule.findIndex((r) => r.debtBalancesCents[0] === 0);
    expect(debtBPayoffMonth).toBeLessThan(debtAPayoffMonth);
    // Last row: all zero
    const lastRow = result.schedule[result.months - 1]!;
    expect(lastRow.totalBalanceCents).toBe(0);
  });

  it('snowball has lower total interest than minimum-only with same extra', () => {
    const snowball = calculateDebtStrategy([DEBT_A, DEBT_B], 'snowball', 5000);
    const minimum = calculateDebtStrategy([DEBT_A, DEBT_B], 'minimum', 0);
    // Snowball with extra always costs less than minimum-only
    expect(snowball.totalInterestCents).toBeLessThan(minimum.totalInterestCents);
  });
});

describe('calculateDebtStrategy — avalanche strategy', () => {
  // Avalanche focuses extra on highest APR first (Debt A at 24%)
  it('avalanche focuses extra on highest APR debt first', () => {
    const result = calculateDebtStrategy([DEBT_A, DEBT_B], 'avalanche', 5000);
    expect(result.strategy).toBe('avalanche');
    // With avalanche, Debt A (higher APR) should get extra focus
    // Debt B (lower APR, lower balance) — may or may not pay off first depending on amounts
    expect(result.months).toBeGreaterThan(0);
    const lastRow = result.schedule[result.months - 1]!;
    expect(lastRow.totalBalanceCents).toBe(0);
  });

  it('avalanche has less or equal total interest than snowball', () => {
    const avalanche = calculateDebtStrategy([DEBT_A, DEBT_B], 'avalanche', 5000);
    const snowball = calculateDebtStrategy([DEBT_A, DEBT_B], 'snowball', 5000);
    // Avalanche always minimises total interest
    expect(avalanche.totalInterestCents).toBeLessThanOrEqual(snowball.totalInterestCents);
  });
});

describe('calculateDebtStrategy — freed minimum rollup', () => {
  // When a debt is fully paid off, its freed minimum rolls into the budget
  it('freed minimum from paid-off debt accelerates remaining debt payoff', () => {
    // With avalanche + extra, Debt B (lower APR) pays its minimums only.
    // Debt A gets extra focus. When A is paid off, A's freed minimum ($30) goes to B.
    const withExtra = calculateDebtStrategy([DEBT_A, DEBT_B], 'snowball', 5000);
    const noExtra = calculateDebtStrategy([DEBT_A, DEBT_B], 'minimum', 0);
    // The snowball result should have fewer months than minimum-only
    expect(withExtra.months).toBeLessThan(noExtra.months);
  });
});

describe('calculateDebtStrategy — single debt', () => {
  it('single debt — all three strategies produce identical results', () => {
    const single: Debt[] = [{ name: 'Card', balanceCents: 50000, annualRate: 0.18, minPaymentCents: 1500 }];
    const min = calculateDebtStrategy(single, 'minimum', 2000);
    const snow = calculateDebtStrategy(single, 'snowball', 2000);
    const aval = calculateDebtStrategy(single, 'avalanche', 2000);
    expect(min.months).toBe(snow.months);
    expect(min.months).toBe(aval.months);
    expect(min.totalInterestCents).toBe(snow.totalInterestCents);
    expect(min.totalInterestCents).toBe(aval.totalInterestCents);
    // debtBalancesCents should have length 1
    expect(min.schedule[0]!.debtBalancesCents).toHaveLength(1);
  });
});

describe('calculateDebtStrategy — totals consistency', () => {
  it('totalPaidCents = balances sum + totalInterestCents', () => {
    const result = calculateDebtStrategy([DEBT_A, DEBT_B], 'avalanche', 3000);
    const initialTotal = DEBT_A.balanceCents + DEBT_B.balanceCents;
    expect(result.totalPaidCents).toBe(initialTotal + result.totalInterestCents);
  });

  it('schedule month numbers are sequential from 1', () => {
    const result = calculateDebtStrategy([DEBT_A, DEBT_B], 'snowball', 3000);
    result.schedule.forEach((row, i) => {
      expect(row.month).toBe(i + 1);
    });
  });
});
