import { describe, it, expect } from 'vitest';
import { calculateAccumulation, calculateDrawdown, calculateCAGR } from '../src/engine';

describe('calculateAccumulation', () => {
  it('monthly compounding, no contributions, known result', () => {
    const result = calculateAccumulation({
      principal: 1000,
      annualRate: 0.12,
      compoundingFrequency: 'monthly',
      years: 1,
    });
    // 1000 * (1.01)^12 ≈ 1126.83
    expect(result.finalBalance).toBeCloseTo(1126.83, 1);
    expect(result.schedule).toHaveLength(1);
    expect(result.totalContributed).toBe(1000);
    expect(result.schedule[0]!.realBalance).toBeUndefined();
    expect(result.realFinalBalance).toBeUndefined();
  });

  it('monthly compounding, with contributions, 2 years', () => {
    const result = calculateAccumulation({
      principal: 0,
      annualRate: 0.12,
      compoundingFrequency: 'monthly',
      monthlyContribution: 100,
      years: 2,
    });
    expect(result.totalContributed).toBe(2400);
    expect(result.finalBalance).toBeGreaterThan(2400);
    expect(result.schedule).toHaveLength(2);
  });

  it('quarterly compounding, with contributions', () => {
    const result = calculateAccumulation({
      principal: 0,
      annualRate: 0.08,
      compoundingFrequency: 'quarterly',
      monthlyContribution: 100,
      years: 2,
    });
    expect(result.totalContributed).toBe(2400);
    expect(result.finalBalance).toBeGreaterThan(2400);
  });

  it('annually compounding, known result', () => {
    const result = calculateAccumulation({
      principal: 1000,
      annualRate: 0.10,
      compoundingFrequency: 'annually',
      years: 2,
    });
    // 1000 * 1.1^2 = 1210
    expect(result.finalBalance).toBeCloseTo(1210, 4);
    expect(result.totalInterest).toBeCloseTo(210, 4);
  });

  it('annually compounding, with contributions', () => {
    const result = calculateAccumulation({
      principal: 0,
      annualRate: 0.10,
      compoundingFrequency: 'annually',
      monthlyContribution: 100,
      years: 1,
    });
    expect(result.totalContributed).toBe(1200);
    expect(result.finalBalance).toBeGreaterThan(1200);
  });

  it('continuous compounding, no contributions', () => {
    const result = calculateAccumulation({
      principal: 1000,
      annualRate: 0.12,
      compoundingFrequency: 'continuous',
      years: 1,
    });
    // 1000 * e^0.12 ≈ 1127.50
    expect(result.finalBalance).toBeCloseTo(1127.50, 1);
  });

  it('continuous compounding, zero rate avoids divide-by-zero', () => {
    const result = calculateAccumulation({
      principal: 1000,
      annualRate: 0,
      compoundingFrequency: 'continuous',
      monthlyContribution: 100,
      years: 2,
    });
    // No growth, no interest: balance = 1000 + 100*12*2 = 3400
    expect(result.finalBalance).toBeCloseTo(3400, 4);
    expect(result.totalInterest).toBeCloseTo(0, 4);
  });

  it('continuous compounding, with contributions and positive rate', () => {
    const result = calculateAccumulation({
      principal: 0,
      annualRate: 0.06,
      compoundingFrequency: 'continuous',
      monthlyContribution: 100,
      years: 2,
    });
    expect(result.totalContributed).toBe(2400);
    expect(result.finalBalance).toBeGreaterThan(2400);
  });

  it('with inflationRate provides realFinalBalance and realBalance on each row', () => {
    const result = calculateAccumulation({
      principal: 1000,
      annualRate: 0.10,
      compoundingFrequency: 'annually',
      years: 1,
      inflationRate: 0.03,
    });
    // finalBalance ≈ 1100, realFinalBalance ≈ 1100/1.03 ≈ 1067.96
    expect(result.realFinalBalance).toBeCloseTo(1100 / 1.03, 1);
    expect(result.schedule[0]!.realBalance).toBeCloseTo(1100 / 1.03, 1);
  });

  it('schedule interest = balance - contributed', () => {
    const result = calculateAccumulation({
      principal: 0,
      annualRate: 0,
      compoundingFrequency: 'annually',
      monthlyContribution: 100,
      years: 3,
    });
    expect(result.totalInterest).toBeCloseTo(0, 5);
    for (const row of result.schedule) {
      expect(row.interest).toBeCloseTo(row.balance - row.contributed, 5);
    }
  });
});

describe('calculateDrawdown', () => {
  it('depletes in exact years when return is 0', () => {
    const result = calculateDrawdown({
      portfolioValue: 12000,
      annualWithdrawal: 2000,
      annualReturn: 0,
    });
    expect(result.yearsToDepletion).toBe(6);
    expect(result.schedule).toHaveLength(6);
  });

  it('caps at maxYears when portfolio is sustainable', () => {
    const result = calculateDrawdown({
      portfolioValue: 1_000_000,
      annualWithdrawal: 10_000,
      annualReturn: 0.07,
    });
    expect(result.yearsToDepletion).toBe(100);
    expect(result.schedule).toHaveLength(100);
  });

  it('respects custom maxYears', () => {
    const result = calculateDrawdown({
      portfolioValue: 1_000_000,
      annualWithdrawal: 10_000,
      annualReturn: 0.07,
      maxYears: 30,
    });
    expect(result.yearsToDepletion).toBe(30);
    expect(result.schedule).toHaveLength(30);
  });

  it('cannot withdraw more than portfolio in final year', () => {
    const result = calculateDrawdown({
      portfolioValue: 1000,
      annualWithdrawal: 5000,
      annualReturn: 0,
    });
    expect(result.yearsToDepletion).toBe(1);
    expect(result.schedule[0]!.withdrawal).toBe(1000);
  });

  it('with inflationRate, withdrawal grows each year', () => {
    const result = calculateDrawdown({
      portfolioValue: 1_000_000,
      annualWithdrawal: 10_000,
      annualReturn: 0.07,
      inflationRate: 0.02,
      maxYears: 5,
    });
    // Year 2 withdrawal = 10000 * 1.02 = 10200
    expect(result.schedule[1]!.withdrawal).toBeCloseTo(10_200, 0);
  });

  it('with inflationRate, provides realPortfolioValue on each row', () => {
    const result = calculateDrawdown({
      portfolioValue: 100_000,
      annualWithdrawal: 4_000,
      annualReturn: 0.06,
      inflationRate: 0.03,
      maxYears: 5,
    });
    expect(result.schedule[0]!.realPortfolioValue).toBeDefined();
    // realPortfolioValue = portfolioValue / (1+0.03)^1
    expect(result.schedule[0]!.realPortfolioValue).toBeCloseTo(
      result.schedule[0]!.portfolioValue / 1.03,
      1,
    );
  });

  it('without inflationRate, realPortfolioValue is undefined', () => {
    const result = calculateDrawdown({
      portfolioValue: 100_000,
      annualWithdrawal: 4_000,
      annualReturn: 0.06,
      maxYears: 5,
    });
    expect(result.schedule[0]!.realPortfolioValue).toBeUndefined();
  });
});

describe('calculateCAGR', () => {
  it('computes correct CAGR for 2-year growth', () => {
    // 10000 → 12100 in 2 years: sqrt(1.21) - 1 = 0.10
    const result = calculateCAGR({ initialValue: 10_000, finalValue: 12_100, years: 2 });
    expect(result.cagr).toBeCloseTo(0.10, 4);
    expect(result.totalReturnPercent).toBeCloseTo(0.21, 4);
    expect(result.absoluteGain).toBeCloseTo(2_100, 4);
  });

  it('handles 1-year period', () => {
    const result = calculateCAGR({ initialValue: 1_000, finalValue: 1_100, years: 1 });
    expect(result.cagr).toBeCloseTo(0.10, 4);
  });

  it('handles decline (finalValue < initialValue)', () => {
    const result = calculateCAGR({ initialValue: 1_000, finalValue: 900, years: 1 });
    expect(result.cagr).toBeCloseTo(-0.10, 4);
    expect(result.absoluteGain).toBeCloseTo(-100, 4);
  });
});
