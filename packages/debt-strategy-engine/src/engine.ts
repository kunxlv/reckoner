import type { Debt, Strategy, DebtStrategyResult, DebtScheduleRow } from './types';

// Only called when strategy is 'snowball' or 'avalanche' — not for 'minimum'
function getFocusIndex(debts: Debt[], balances: number[], strategy: 'snowball' | 'avalanche'): number {
  if (strategy === 'snowball') {
    // Lowest non-zero balance
    let minBal = Infinity;
    let minIdx = -1;
    for (let i = 0; i < debts.length; i++) {
      if (balances[i]! > 0 && balances[i]! < minBal) {
        minBal = balances[i]!;
        minIdx = i;
      }
    }
    return minIdx;
  }
  // avalanche: highest APR among non-zero balance debts
  let maxRate = -1;
  let maxIdx = -1;
  for (let i = 0; i < debts.length; i++) {
    if (balances[i]! > 0 && debts[i]!.annualRate > maxRate) {
      maxRate = debts[i]!.annualRate;
      maxIdx = i;
    }
  }
  return maxIdx;
}

export function calculateDebtStrategy(
  debts: Debt[],
  strategy: Strategy,
  extraMonthlyCents: number,
): DebtStrategyResult {
  const balances = debts.map((d) => d.balanceCents);
  const schedule: DebtScheduleRow[] = [];
  let totalInterestCents = 0;
  let totalPaidCents = 0;
  let month = 0;

  while (balances.some((b) => b > 0) && month < 1200) {
    month++;

    // Track which debts were already paid off before this month (to compute freed minimums)
    const alreadyPaid = balances.map((b) => b === 0);

    // 1. Accrue interest on active debts
    const interests = balances.map((b, i) =>
      b > 0 ? Math.floor(b * (debts[i]!.annualRate / 12)) : 0,
    );

    // 2. Pay minimums on active debts
    let rowTotalPayment = 0;
    let rowTotalInterest = 0;
    let rowTotalPrincipal = 0;

    for (let i = 0; i < debts.length; i++) {
      if (balances[i]! <= 0) continue;
      const interest = interests[i]!;
      const outstanding = balances[i]! + interest;
      const minPay = Math.min(debts[i]!.minPaymentCents, outstanding);
      const principal = Math.max(0, minPay - interest);
      balances[i]! -= principal;
      /* c8 ignore next */
      if (balances[i]! < 0) balances[i] = 0;

      rowTotalInterest += interest;
      rowTotalPrincipal += principal;
      rowTotalPayment += minPay;
      totalInterestCents += interest;
      totalPaidCents += minPay;
    }

    // 3. Apply extra budget
    // Apply extra budget to focus debt (snowball/avalanche only)
    if (strategy !== 'minimum') {
      const freedMinimums = debts.reduce(
        (sum, d, i) => (alreadyPaid[i] ? sum + d.minPaymentCents : sum),
        0,
      );
      let remaining = extraMonthlyCents + freedMinimums;
      while (remaining > 0) {
        const focusIdx = getFocusIndex(debts, balances, strategy as 'snowball' | 'avalanche');
        if (focusIdx === -1) break;
        const pay = Math.min(remaining, balances[focusIdx]!);
        balances[focusIdx]! -= pay;
        /* c8 ignore next */
        if (balances[focusIdx]! < 0) balances[focusIdx] = 0;
        remaining -= pay;
        rowTotalPrincipal += pay;
        rowTotalPayment += pay;
        totalPaidCents += pay;
      }
    }

    schedule.push({
      month,
      totalPaymentCents: rowTotalPayment,
      totalInterestCents: rowTotalInterest,
      totalPrincipalCents: rowTotalPrincipal,
      totalBalanceCents: balances.reduce((a, b) => a + b, 0),
      debtBalancesCents: [...balances],
    });
  }

  return { strategy, months: month, totalInterestCents, totalPaidCents, schedule };
}
