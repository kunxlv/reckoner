/**
 * Row-level mathematical invariants.
 * These tests verify that EVERY row of EVERY schedule satisfies the
 * fundamental identities of an amortization schedule.
 * If any of these fail, the engine formula is wrong — not the test.
 */
import { describe, it, expect } from 'vitest';
import { calculate } from '../src/engine';
import type { LoanInput } from '../src/types';

const CASES: Array<{ label: string; input: LoanInput }> = [
  {
    label: 'US standard 30yr monthly',
    input: { principal: 400_000, annualRate: 0.065, termYears: 30, periodsPerYear: 12, convention: 'standardMonthly' },
  },
  {
    label: 'CA semi-annual 25yr monthly',
    input: { principal: 560_000, annualRate: 0.05, termYears: 25, periodsPerYear: 12, convention: 'canadianSemiAnnual' },
  },
  {
    label: 'AU standard 30yr fortnightly',
    input: { principal: 600_000, annualRate: 0.06, termYears: 30, periodsPerYear: 26, convention: 'standardMonthly' },
  },
  {
    label: 'NZ standard 30yr weekly',
    input: { principal: 600_000, annualRate: 0.062, termYears: 30, periodsPerYear: 52, convention: 'standardMonthly' },
  },
  {
    label: 'US standard with extra payment',
    input: { principal: 400_000, annualRate: 0.065, termYears: 30, periodsPerYear: 12, convention: 'standardMonthly', extraPaymentPerPeriod: 300 },
  },
  {
    label: 'CA semi-annual fortnightly',
    input: { principal: 560_000, annualRate: 0.05, termYears: 25, periodsPerYear: 26, convention: 'canadianSemiAnnual' },
  },
];

function periodicRate(input: LoanInput): number {
  if (input.convention === 'canadianSemiAnnual') {
    return Math.pow(1 + input.annualRate / 2, 2 / input.periodsPerYear) - 1;
  }
  return input.annualRate / input.periodsPerYear;
}

for (const { label, input } of CASES) {
  describe(`invariants — ${label}`, () => {
    const result = calculate(input);
    const i = periodicRate(input);

    it('interest on each row equals previous balance × periodic rate', () => {
      let prevBalance = input.principal;
      for (const row of result.rows) {
        const expectedInterest = prevBalance * i;
        expect(row.interest).toBeCloseTo(expectedInterest, 6);
        prevBalance = row.balance;
      }
    });

    it('balance on each row equals previous balance minus principal paid', () => {
      let prevBalance = input.principal;
      for (const row of result.rows) {
        expect(row.balance).toBeCloseTo(prevBalance - row.principal, 6);
        prevBalance = row.balance;
      }
    });

    it('payment equals interest + principal on every non-final row', () => {
      const nonFinal = result.rows.slice(0, -1);
      for (const row of nonFinal) {
        expect(row.payment).toBeCloseTo(row.interest + row.principal, 4);
      }
    });

    it('final balance is zero within one cent', () => {
      const last = result.rows[result.rows.length - 1]!;
      expect(Math.abs(last.balance)).toBeLessThanOrEqual(0.01);
    });

    it('cumulative principal equals original principal at payoff', () => {
      const last = result.rows[result.rows.length - 1]!;
      expect(last.cumulativePrincipal).toBeCloseTo(input.principal, 1);
    });

    it('cumulativePrincipal + cumulativeInterest equals sum of actual payments', () => {
      let runningPayments = 0;
      for (const row of result.rows) {
        runningPayments += row.payment;
        expect(row.cumulativePrincipal + row.cumulativeInterest).toBeCloseTo(runningPayments, 4);
      }
    });

    it('totalPaid equals principal plus totalInterest', () => {
      expect(result.totalPaid).toBeCloseTo(input.principal + result.totalInterest, 1);
    });

    it('balance is strictly decreasing', () => {
      for (let i = 1; i < result.rows.length; i++) {
        expect(result.rows[i]!.balance).toBeLessThan(result.rows[i - 1]!.balance);
      }
    });

    it('crossoverPeriod is the first period where principal exceeds interest', () => {
      const firstCrossover = result.rows.findIndex((r) => r.principal > r.interest);
      if (firstCrossover === -1) {
        expect(result.crossoverPeriod).toBeNull();
      } else {
        expect(result.crossoverPeriod).toBe(firstCrossover + 1);
      }
    });

    it('payoffPeriod matches rows length', () => {
      expect(result.payoffPeriod).toBe(result.rows.length);
    });
  });
}
