import { describe, it, expect } from 'vitest';
import { calculateCardPayoff } from '../src/engine';

describe('calculateCardPayoff', () => {
  // Test 1: fixed minimum, no extra payment
  // Balance $100 (10000c), APR 24%, fixed $25/month (2500c)
  // Month 1: interest=floor(10000*0.02)=200, payment=min(2500,10200)=2500, principal=2300, balance=7700
  // Month 2: interest=floor(7700*0.02)=154, payment=2500, principal=2346, balance=5354
  // Month 3: interest=floor(5354*0.02)=107, payment=2500, principal=2393, balance=2961
  // Month 4: interest=floor(2961*0.02)=59, payment=2500, principal=2441, balance=520
  // Month 5: interest=floor(520*0.02)=10, payment=min(2500,530)=530, principal=520, balance=0
  // totalInterest=200+154+107+59+10=530, totalPaid=2500*4+530=10530
  it('fixed minimum, no extra payment — correct months and totals', () => {
    const result = calculateCardPayoff({
      balanceCents: 10000,
      annualRate: 0.24,
      minPaymentRule: { type: 'fixed', amountCents: 2500 },
    });
    expect(result.months).toBe(5);
    expect(result.totalInterestCents).toBe(530);
    expect(result.totalPaidCents).toBe(10530);
    expect(result.schedule).toHaveLength(5);
    expect(result.schedule[0]).toMatchObject({
      month: 1, paymentCents: 2500, interestCents: 200, principalCents: 2300, balanceCents: 7700,
    });
    expect(result.schedule[4]!.balanceCents).toBe(0);
  });

  // Test 2: percent minimum — covers percent branch and the floor kicking in
  // Balance $10000 (1000000c), APR 18%, 2% min with $2500c floor
  // Month 1: interest=floor(1000000*0.015)=15000, min=max(floor(1000000*0.02),2500)=max(20000,2500)=20000
  // payment=min(20000,1015000)=20000, principal=5000, balance=995000
  it('percent minimum — floor does not kick in when percent > floor', () => {
    const result = calculateCardPayoff({
      balanceCents: 1000000,
      annualRate: 0.18,
      minPaymentRule: { type: 'percent', rate: 0.02, floorCents: 2500 },
    });
    expect(result.schedule[0]).toMatchObject({
      month: 1, interestCents: 15000, paymentCents: 20000, principalCents: 5000, balanceCents: 995000,
    });
    expect(result.schedule[result.months - 1]!.balanceCents).toBe(0);
  });

  // Test 3: percent minimum — floor kicks in on small balance
  // Balance $100 (10000c), APR 24%, 2% min with $2500c floor
  // 2% of 10000=200 < 2500 floor, so min=2500. Same as test 1.
  it('percent minimum — floor kicks in when percent < floor', () => {
    const result = calculateCardPayoff({
      balanceCents: 10000,
      annualRate: 0.24,
      minPaymentRule: { type: 'percent', rate: 0.02, floorCents: 2500 },
    });
    expect(result.months).toBe(5);
    expect(result.schedule[0]!.paymentCents).toBe(2500);
    expect(result.schedule[result.months - 1]!.balanceCents).toBe(0);
  });

  // Test 4: extra monthly payment reduces months
  // Balance $100 (10000c), APR 24%, fixed $25 + $25 extra = $50 total (5000c)
  // Month 1: interest=200, payment=min(5000,10200)=5000, principal=4800, balance=5200
  // Month 2: interest=floor(5200*0.02)=104, payment=min(5000,5304)=5000, principal=4896, balance=304
  // Month 3: interest=floor(304*0.02)=6, payment=min(5000,310)=310, principal=304, balance=0
  // months=3, totalInterest=200+104+6=310, totalPaid=5000+5000+310=10310
  it('extra monthly payment reduces months and total interest', () => {
    const result = calculateCardPayoff({
      balanceCents: 10000,
      annualRate: 0.24,
      minPaymentRule: { type: 'fixed', amountCents: 2500 },
      extraMonthlyCents: 2500,
    });
    expect(result.months).toBe(3);
    expect(result.totalInterestCents).toBe(310);
    expect(result.totalPaidCents).toBe(10310);
    expect(result.schedule[2]!.balanceCents).toBe(0);
  });

  // Test 5: extraMonthlyCents = 0 is identical to undefined (minimum-only path)
  it('extraMonthlyCents = 0 produces same result as omitting extraMonthlyCents', () => {
    const withZero = calculateCardPayoff({
      balanceCents: 10000,
      annualRate: 0.24,
      minPaymentRule: { type: 'fixed', amountCents: 2500 },
      extraMonthlyCents: 0,
    });
    const withUndefined = calculateCardPayoff({
      balanceCents: 10000,
      annualRate: 0.24,
      minPaymentRule: { type: 'fixed', amountCents: 2500 },
    });
    expect(withZero.months).toBe(withUndefined.months);
    expect(withZero.totalInterestCents).toBe(withUndefined.totalInterestCents);
    expect(withZero.totalPaidCents).toBe(withUndefined.totalPaidCents);
  });

  // Test 6: schedule rows have correct cumulative structure
  it('each schedule row has month=index+1 and balanceCents=0 on final row', () => {
    const result = calculateCardPayoff({
      balanceCents: 10000,
      annualRate: 0.24,
      minPaymentRule: { type: 'fixed', amountCents: 2500 },
    });
    result.schedule.forEach((row, i) => {
      expect(row.month).toBe(i + 1);
    });
    expect(result.schedule[result.months - 1]!.balanceCents).toBe(0);
  });

  // Test 7: very small balance pays off in one month
  // Balance $1 (100c), APR 24%, fixed $25/month (2500c)
  // Month 1: interest=floor(100*0.02)=2, payment=min(2500,102)=102, principal=100, balance=0
  it('very small balance pays off in final month', () => {
    const result = calculateCardPayoff({
      balanceCents: 100,
      annualRate: 0.24,
      minPaymentRule: { type: 'fixed', amountCents: 2500 },
    });
    expect(result.months).toBe(1);
    expect(result.schedule[0]).toMatchObject({
      month: 1, interestCents: 2, paymentCents: 102, principalCents: 100, balanceCents: 0,
    });
  });
});
