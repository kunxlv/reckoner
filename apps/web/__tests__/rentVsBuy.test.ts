import { describe, it, expect } from 'vitest';
import { calcRentVsBuy } from '../src/lib/rentVsBuy';

describe('calcRentVsBuy', () => {
  it('zero deposit: no opportunity cost', () => {
    const result = calcRentVsBuy({
      propertyPrice: 500_000, deposit: 0, annualRate: 0.06, termYears: 30,
      monthlyRent: 2000, annualAppreciation: 0.04, annualInvestmentReturn: 0.07,
    });
    expect(result.monthlyOpportunityCost).toBe(0);
    expect(result.effectiveBuyCost).toBeCloseTo(result.mortgagePayment, 5);
  });

  it('opportunity cost equals deposit times monthly investment return', () => {
    const deposit = 100_000;
    const annualInvestmentReturn = 0.07;
    const result = calcRentVsBuy({
      propertyPrice: 500_000, deposit, annualRate: 0.06, termYears: 30,
      monthlyRent: 2000, annualAppreciation: 0.04, annualInvestmentReturn,
    });
    expect(result.monthlyOpportunityCost).toBeCloseTo(deposit * (annualInvestmentReturn / 12), 5);
  });

  it('futurePropertyValue uses compound growth over 10 years', () => {
    const result = calcRentVsBuy({
      propertyPrice: 500_000, deposit: 100_000, annualRate: 0.06, termYears: 30,
      monthlyRent: 2000, annualAppreciation: 0.04, annualInvestmentReturn: 0.07,
    });
    expect(result.futurePropertyValue).toBeCloseTo(500_000 * Math.pow(1.04, 10), 2);
  });

  it('netBuyAdvantage = rentTotal - buyTotal + (equity - deposit)', () => {
    const input = {
      propertyPrice: 500_000, deposit: 100_000, annualRate: 0.06, termYears: 30,
      monthlyRent: 2000, annualAppreciation: 0.04, annualInvestmentReturn: 0.07,
    };
    const result = calcRentVsBuy(input);
    const expected = result.rentTotal - result.buyTotal + (result.equity - input.deposit);
    expect(result.netBuyAdvantage).toBeCloseTo(expected, 2);
  });

  it('high appreciation pushes netBuyAdvantage positive', () => {
    const result = calcRentVsBuy({
      propertyPrice: 500_000, deposit: 100_000, annualRate: 0.05, termYears: 30,
      monthlyRent: 2500, annualAppreciation: 0.08, annualInvestmentReturn: 0.04,
    });
    expect(result.netBuyAdvantage).toBeGreaterThan(0);
  });

  it('high investment return pushes netBuyAdvantage negative (renting ahead)', () => {
    const result = calcRentVsBuy({
      propertyPrice: 500_000, deposit: 100_000, annualRate: 0.07, termYears: 30,
      monthlyRent: 1500, annualAppreciation: 0.01, annualInvestmentReturn: 0.12,
    });
    expect(result.netBuyAdvantage).toBeLessThan(0);
  });

  it('rentTotal = monthlyRent × 10 × 12', () => {
    const monthlyRent = 2500;
    const result = calcRentVsBuy({
      propertyPrice: 500_000, deposit: 100_000, annualRate: 0.06, termYears: 30,
      monthlyRent, annualAppreciation: 0.04, annualInvestmentReturn: 0.07,
    });
    expect(result.rentTotal).toBe(monthlyRent * 10 * 12);
  });
});
