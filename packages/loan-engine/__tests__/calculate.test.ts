import { describe, it, expect } from 'vitest';
import { calculateLoan } from '../src/calculate';

describe('calculateLoan', () => {
  it('computes monthly payment for a 36-month 10% loan', () => {
    // PMT = 10000 × (0.10/12) / (1 − (1 + 0.10/12)^−36) ≈ 322.67
    const result = calculateLoan({ principal: 10000, annualRate: 0.10, termMonths: 36 });
    expect(result.monthlyPayment).toBeCloseTo(322.67, 1);
  });

  it('total interest is positive for non-zero rate', () => {
    const result = calculateLoan({ principal: 10000, annualRate: 0.10, termMonths: 36 });
    expect(result.totalInterest).toBeGreaterThan(0);
    expect(result.totalInterest).toBeCloseTo(1616, 0);
  });

  it('totalCost = monthlyPayment × termMonths', () => {
    const result = calculateLoan({ principal: 10000, annualRate: 0.10, termMonths: 36 });
    expect(result.totalCost).toBeCloseTo(result.monthlyPayment * 36, 2);
  });

  it('APR equals annualRate when no origination fee', () => {
    const result = calculateLoan({ principal: 10000, annualRate: 0.10, termMonths: 36 });
    expect(result.apr).toBe(0.10);
  });

  it('APR > annualRate when origination fee is charged', () => {
    const noFee = calculateLoan({ principal: 10000, annualRate: 0.10, termMonths: 36 });
    const withFee = calculateLoan({ principal: 10000, annualRate: 0.10, termMonths: 36, originationFee: 300 });
    expect(withFee.apr).toBeGreaterThan(noFee.apr);
    expect(withFee.monthlyPayment).toBeCloseTo(noFee.monthlyPayment, 4);
  });

  it('zero rate produces zero interest', () => {
    const result = calculateLoan({ principal: 6000, annualRate: 0, termMonths: 12 });
    expect(result.totalInterest).toBeCloseTo(0, 4);
    expect(result.monthlyPayment).toBeCloseTo(500, 2);
    expect(result.apr).toBe(0);
  });

  it('schedule has termMonths rows', () => {
    const result = calculateLoan({ principal: 10000, annualRate: 0.08, termMonths: 60 });
    expect(result.schedule).toHaveLength(60);
  });

  it('final schedule balance is approximately zero', () => {
    const result = calculateLoan({ principal: 10000, annualRate: 0.08, termMonths: 60 });
    expect(result.schedule[59]!.balance).toBeCloseTo(0, 4);
  });
});
