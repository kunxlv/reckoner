/**
 * Per-country payment tests.
 * Expected payments are computed from the annuity formula and cross-checked
 * against the engine. Tests are organised by country so a failure immediately
 * identifies which convention or country default is wrong.
 */
import { describe, it, expect } from 'vitest';
import { calculate } from '../src/engine';
import type { LoanInput } from '../src/types';

function annuityPayment(principal: number, periodicRate: number, n: number): number {
  if (periodicRate === 0) return principal / n;
  const pow = Math.pow(1 + periodicRate, n);
  return (principal * periodicRate * pow) / (pow - 1);
}

function stdRate(annualRate: number, periodsPerYear: number) {
  return annualRate / periodsPerYear;
}

function caRate(annualRate: number, periodsPerYear: number) {
  return Math.pow(1 + annualRate / 2, 2 / periodsPerYear) - 1;
}

// Each entry: [countryCode, loan, annualRate, termYears, periodsPerYear, convention]
// Loan = price − deposit from country JSON defaults.
const COUNTRIES: Array<{
  cc: string;
  input: LoanInput;
  expectedPayment: number;
  tolerance: number;
}> = [
  {
    cc: 'us',
    input: { principal: 320_000, annualRate: 0.065, termYears: 30, periodsPerYear: 12, convention: 'standardMonthly' },
    expectedPayment: annuityPayment(320_000, stdRate(0.065, 12), 360),
    tolerance: 0.01,
  },
  {
    cc: 'uk',
    input: { principal: 240_000, annualRate: 0.045, termYears: 25, periodsPerYear: 12, convention: 'standardMonthly' },
    expectedPayment: annuityPayment(240_000, stdRate(0.045, 12), 300),
    tolerance: 0.01,
  },
  {
    cc: 'ca',
    input: { principal: 560_000, annualRate: 0.05, termYears: 25, periodsPerYear: 12, convention: 'canadianSemiAnnual' },
    expectedPayment: annuityPayment(560_000, caRate(0.05, 12), 300),
    tolerance: 0.01,
  },
  {
    cc: 'au',
    input: { principal: 600_000, annualRate: 0.06, termYears: 30, periodsPerYear: 12, convention: 'standardMonthly' },
    expectedPayment: annuityPayment(600_000, stdRate(0.06, 12), 360),
    tolerance: 0.01,
  },
  {
    cc: 'ie',
    input: { principal: 297_500, annualRate: 0.039, termYears: 30, periodsPerYear: 12, convention: 'standardMonthly' },
    expectedPayment: annuityPayment(297_500, stdRate(0.039, 12), 360),
    tolerance: 0.01,
  },
  {
    cc: 'de',
    input: { principal: 320_000, annualRate: 0.036, termYears: 25, periodsPerYear: 12, convention: 'standardMonthly' },
    expectedPayment: annuityPayment(320_000, stdRate(0.036, 12), 300),
    tolerance: 0.01,
  },
  {
    cc: 'nl',
    input: { principal: 400_000, annualRate: 0.038, termYears: 30, periodsPerYear: 12, convention: 'standardMonthly' },
    expectedPayment: annuityPayment(400_000, stdRate(0.038, 12), 360),
    tolerance: 0.01,
  },
  {
    cc: 'nz',
    input: { principal: 600_000, annualRate: 0.062, termYears: 30, periodsPerYear: 12, convention: 'standardMonthly' },
    expectedPayment: annuityPayment(600_000, stdRate(0.062, 12), 360),
    tolerance: 0.01,
  },
  {
    cc: 'fr',
    input: { principal: 280_000, annualRate: 0.037, termYears: 25, periodsPerYear: 12, convention: 'standardMonthly' },
    expectedPayment: annuityPayment(280_000, stdRate(0.037, 12), 300),
    tolerance: 0.01,
  },
  {
    cc: 'es',
    input: { principal: 240_000, annualRate: 0.038, termYears: 30, periodsPerYear: 12, convention: 'standardMonthly' },
    expectedPayment: annuityPayment(240_000, stdRate(0.038, 12), 360),
    tolerance: 0.01,
  },
  {
    cc: 'sg',
    input: { principal: 960_000, annualRate: 0.038, termYears: 25, periodsPerYear: 12, convention: 'standardMonthly' },
    expectedPayment: annuityPayment(960_000, stdRate(0.038, 12), 300),
    tolerance: 0.01,
  },
  {
    cc: 'in',
    input: { principal: 6_400_000, annualRate: 0.085, termYears: 20, periodsPerYear: 12, convention: 'standardMonthly' },
    expectedPayment: annuityPayment(6_400_000, stdRate(0.085, 12), 240),
    tolerance: 1.00, // INR — larger rounding tolerance in absolute terms
  },
];

for (const { cc, input, expectedPayment, tolerance } of COUNTRIES) {
  describe(`${cc.toUpperCase()} — ${input.convention}`, () => {
    it('payment matches annuity formula', () => {
      const result = calculate(input);
      expect(Math.abs(result.payment - expectedPayment)).toBeLessThanOrEqual(tolerance);
    });

    it('payoff period equals termYears × periodsPerYear', () => {
      const result = calculate(input);
      expect(result.payoffPeriod).toBe(input.termYears * input.periodsPerYear);
    });

    it('final balance is zero within one cent', () => {
      const result = calculate(input);
      const last = result.rows[result.rows.length - 1]!;
      expect(Math.abs(last.balance)).toBeLessThanOrEqual(0.01);
    });

    it('totalPaid = principal + totalInterest', () => {
      const result = calculate(input);
      expect(result.totalPaid).toBeCloseTo(input.principal + result.totalInterest, 1);
    });
  });
}

// Canonical test vectors (verified against central bank sources)
describe('TEST_VECTORS — canonical reference payments', () => {
  it('US $400k @ 6.5% × 30yr → $2,528.27', () => {
    const result = calculate({ principal: 400_000, annualRate: 0.065, termYears: 30, periodsPerYear: 12, convention: 'standardMonthly' });
    expect(Math.abs(result.payment - 2528.27)).toBeLessThanOrEqual(0.01);
  });

  it('CA $500k @ 5.0% × 25yr (semi-annual) → $2,908.02', () => {
    const result = calculate({ principal: 500_000, annualRate: 0.05, termYears: 25, periodsPerYear: 12, convention: 'canadianSemiAnnual' });
    expect(Math.abs(result.payment - 2908.02)).toBeLessThanOrEqual(0.01);
  });

  it('UK £300k @ 4.5% × 25yr → £1,667.50', () => {
    const result = calculate({ principal: 300_000, annualRate: 0.045, termYears: 25, periodsPerYear: 12, convention: 'standardMonthly' });
    expect(Math.abs(result.payment - 1667.50)).toBeLessThanOrEqual(0.02);
  });

  it('AU $600k @ 6.0% × 30yr → $3,597.30', () => {
    const result = calculate({ principal: 600_000, annualRate: 0.06, termYears: 30, periodsPerYear: 12, convention: 'standardMonthly' });
    expect(Math.abs(result.payment - 3597.30)).toBeLessThanOrEqual(0.02);
  });
});
