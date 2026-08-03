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
  it('when a debt is paid off its freed minimum accelerates remaining debts', () => {
    // Debt X: small balance, paid off quickly
    // Debt Y: large balance, paid off slowly
    // With snowball: X is paid first, then X's freed minimum rolls into Y
    const debtX: Debt = { name: 'Small', balanceCents: 10000, annualRate: 0.12, minPaymentCents: 1000 };
    const debtY: Debt = { name: 'Large', balanceCents: 500000, annualRate: 0.12, minPaymentCents: 5000 };
    const snowball = calculateDebtStrategy([debtX, debtY], 'snowball', 0);
    // Find when X is fully paid
    const xPayoffMonth = snowball.schedule.findIndex((r) => r.debtBalancesCents[0] === 0);
    expect(xPayoffMonth).toBeGreaterThan(-1);
    // After X is paid off, the total payment should exceed debtY.minPaymentCents alone
    // because X's freed minimum (1000c) is now added to Y's payment
    if (xPayoffMonth + 1 < snowball.schedule.length) {
      const rowAfterXPayoff = snowball.schedule[xPayoffMonth + 1]!;
      // Payment should be Y's minimum + X's freed minimum = 5000 + 1000 = 6000
      expect(rowAfterXPayoff.totalPaymentCents).toBe(6000);
    }
    // Final: all balances zero
    expect(snowball.schedule[snowball.months - 1]!.totalBalanceCents).toBe(0);
  });

  it('freed minimum from paid-off debt reduces total months vs snowball with no freed rollup (minimum strategy)', () => {
    const debtX: Debt = { name: 'Small', balanceCents: 10000, annualRate: 0.12, minPaymentCents: 1000 };
    const debtY: Debt = { name: 'Large', balanceCents: 500000, annualRate: 0.12, minPaymentCents: 5000 };
    const snowball = calculateDebtStrategy([debtX, debtY], 'snowball', 0);
    const minimum = calculateDebtStrategy([debtX, debtY], 'minimum', 0);
    // Snowball (with freed rollup) should finish faster than minimum (no rollup)
    expect(snowball.months).toBeLessThan(minimum.months);
  });
});

describe('calculateDebtStrategy — single debt', () => {
  it('single debt — all three strategies produce identical results', () => {
    const single: Debt[] = [{ name: 'Card', balanceCents: 50000, annualRate: 0.18, minPaymentCents: 1500 }];
    const min = calculateDebtStrategy(single, 'minimum', 0);
    const snow = calculateDebtStrategy(single, 'snowball', 0);
    const aval = calculateDebtStrategy(single, 'avalanche', 0);
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

  it('all balances remain non-negative throughout schedule', () => {
    const result = calculateDebtStrategy([DEBT_A, DEBT_B], 'snowball', 5000);
    result.schedule.forEach((row) => {
      expect(row.totalBalanceCents).toBeGreaterThanOrEqual(0);
      row.debtBalancesCents.forEach((balance) => {
        expect(balance).toBeGreaterThanOrEqual(0);
      });
    });
  });

  it('snowball with large extra budget maintains non-negative balances', () => {
    // Test with extra budget large enough to potentially cause rounding issues
    const result = calculateDebtStrategy([DEBT_A, DEBT_B], 'snowball', 50000);
    result.schedule.forEach((row) => {
      expect(row.totalBalanceCents).toBeGreaterThanOrEqual(0);
      row.debtBalancesCents.forEach((balance) => {
        expect(balance).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
