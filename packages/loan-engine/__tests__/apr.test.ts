import { describe, it, expect } from 'vitest';
import { computeAPR } from '../src/apr';

describe('computeAPR', () => {
  it('returns 0 for zero netAmount', () => {
    expect(computeAPR(0, 212.47, 60)).toBe(0);
  });

  it('returns 0 for zero payment', () => {
    expect(computeAPR(10000, 0, 60)).toBe(0);
  });

  it('returns 0 for zero termMonths', () => {
    expect(computeAPR(10000, 212.47, 0)).toBe(0);
  });

  it('recovers 10% annual rate from matching payment', () => {
    // At 10% annual: PMT for $10,000 over 60 months ≈ 212.47
    const apr = computeAPR(10000, 212.47, 60);
    expect(apr).toBeCloseTo(0.10, 4);
  });

  it('APR > annualRate when net amount is less than principal', () => {
    // $10,000 loan at 10%, but consumer receives only $9,500 (=$500 fee)
    // Payment stays at $212.47 (same as 10% loan on $10,000)
    const apr = computeAPR(9500, 212.47, 60);
    expect(apr).toBeGreaterThan(0.10);
    expect(apr).toBeLessThan(0.14); // sanity bound
  });

  it('converges for small rates', () => {
    // 3% annual: PMT for $5,000 over 36 months ≈ 145.4060
    const apr = computeAPR(5000, 145.4060, 36);
    expect(apr).toBeCloseTo(0.03, 4);
  });

  it('handles degenerate single-period case without crashing', () => {
    // payment ≈ netAmount over 1 month triggers the r < 1e-12 clamp guard;
    // result is a valid (non-NaN) number
    const apr = computeAPR(1000, 999, 1);
    expect(Number.isFinite(apr)).toBe(true);
  });
});
