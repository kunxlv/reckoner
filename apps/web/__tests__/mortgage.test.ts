import { describe, it, expect } from 'vitest';
import { monthlyPayment } from '../src/lib/mortgage';

describe('monthlyPayment', () => {
  it('returns 0 for zero principal', () => {
    expect(monthlyPayment(0, 0.06, 30)).toBe(0);
  });

  it('returns 0 for zero term', () => {
    expect(monthlyPayment(300_000, 0.06, 0)).toBe(0);
  });

  it('zero rate: payment is principal / (termYears * 12)', () => {
    expect(monthlyPayment(120_000, 0, 10)).toBeCloseTo(1000, 5);
  });

  it('standard 30-year US mortgage: $300k at 6%', () => {
    // Known result: ~$1798.65
    expect(monthlyPayment(300_000, 0.06, 30)).toBeCloseTo(1798.65, 0);
  });

  it('standard 25-year UK mortgage: £300k at 4.5%', () => {
    // Known result: ~£1667.50
    expect(monthlyPayment(300_000, 0.045, 25)).toBeCloseTo(1667.50, 0);
  });
});
