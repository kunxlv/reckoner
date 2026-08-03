import { describe, it, expect } from 'vitest';
import { calculateAutoLoan } from '../src/autoLoan';

describe('calculateAutoLoan', () => {
  it('computes financed amount correctly', () => {
    // 25000 + 25000×0.07 − 5000 − 3000 = 18750
    const result = calculateAutoLoan({
      vehiclePrice: 25000, downPayment: 5000, tradeInValue: 3000,
      salesTaxRate: 0.07, annualRate: 0.06, termMonths: 60,
    });
    expect(result.financedAmount).toBeCloseTo(18750, 2);
  });

  it('computes monthly payment on financed amount', () => {
    // PMT for 18750 at 6% over 60 months ≈ 362.45
    const result = calculateAutoLoan({
      vehiclePrice: 25000, downPayment: 5000, tradeInValue: 3000,
      salesTaxRate: 0.07, annualRate: 0.06, termMonths: 60,
    });
    expect(result.monthlyPayment).toBeCloseTo(362.45, 0);
  });

  it('totalCost includes down payment and trade-in', () => {
    const result = calculateAutoLoan({
      vehiclePrice: 25000, downPayment: 5000, tradeInValue: 3000,
      salesTaxRate: 0.07, annualRate: 0.06, termMonths: 60,
    });
    const expectedPayments = result.monthlyPayment * 60;
    expect(result.totalCost).toBeCloseTo(expectedPayments + 5000 + 3000, 0);
  });

  it('clamps financed amount to zero when down+trade-in exceeds price+tax', () => {
    const result = calculateAutoLoan({
      vehiclePrice: 20000, downPayment: 15000, tradeInValue: 10000,
      salesTaxRate: 0, annualRate: 0.05, termMonths: 48,
    });
    expect(result.financedAmount).toBe(0);
    expect(result.monthlyPayment).toBe(0);
    expect(result.schedule).toHaveLength(0);
    expect(result.totalCost).toBe(15000 + 10000); // downPayment + tradeInValue
  });

  it('APR equals annualRate when no doc fee', () => {
    const result = calculateAutoLoan({
      vehiclePrice: 25000, downPayment: 5000, tradeInValue: 0,
      salesTaxRate: 0, annualRate: 0.05, termMonths: 60,
    });
    expect(result.apr).toBe(0.05);
  });

  it('APR > annualRate when doc fee is charged', () => {
    const noDee = calculateAutoLoan({
      vehiclePrice: 25000, downPayment: 5000, tradeInValue: 0,
      salesTaxRate: 0, annualRate: 0.05, termMonths: 60,
    });
    const withFee = calculateAutoLoan({
      vehiclePrice: 25000, downPayment: 5000, tradeInValue: 0,
      salesTaxRate: 0, annualRate: 0.05, termMonths: 60, docFee: 500,
    });
    expect(withFee.apr).toBeGreaterThan(noDee.apr);
  });

  it('zero salesTaxRate: financed = price - down - tradeIn + docFee', () => {
    const result = calculateAutoLoan({
      vehiclePrice: 30000, downPayment: 6000, tradeInValue: 2000,
      salesTaxRate: 0, annualRate: 0.07, termMonths: 48, docFee: 300,
    });
    expect(result.financedAmount).toBeCloseTo(22300, 2);
  });

  it('schedule length equals termMonths', () => {
    const result = calculateAutoLoan({
      vehiclePrice: 25000, downPayment: 5000, tradeInValue: 0,
      salesTaxRate: 0, annualRate: 0.06, termMonths: 48,
    });
    expect(result.schedule).toHaveLength(48);
  });
});
