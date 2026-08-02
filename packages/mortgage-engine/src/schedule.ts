import type { AmortizationRow, LoanInput, ScheduleResult } from './types';

/**
 * Builds an amortization schedule given a pre-computed periodic rate.
 * Computes at full floating-point precision. Rounding is the display layer's job.
 */
export function buildSchedule(input: LoanInput, periodicRate: number): ScheduleResult {
  const { principal, annualRate, termYears, periodsPerYear, extraPaymentPerPeriod = 0 } = input;
  const n = termYears * periodsPerYear;

  // Scheduled payment (annuity formula)
  let payment: number;
  if (annualRate === 0) {
    payment = principal / n;
  } else {
    const pow = Math.pow(1 + periodicRate, n);
    payment = (principal * periodicRate * pow) / (pow - 1);
  }

  const rows: AmortizationRow[] = [];
  let balance = principal;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;
  let crossoverPeriod: number | null = null;

  const now = new Date();
  const startDate = input.startDate ?? new Date(now.getFullYear(), now.getMonth(), 1);

  for (let period = 1; period <= n; period++) {
    const interestComponent = balance * periodicRate;
    // Final period: clear remaining balance exactly (avoids floating-point penny error)
    const scheduledPrincipal =
      period === n
        ? balance
        : Math.min(payment - interestComponent + extraPaymentPerPeriod, balance);

    const totalPrincipal = Math.min(scheduledPrincipal, balance);
    const actualPayment = interestComponent + totalPrincipal;

    balance -= totalPrincipal;
    cumulativeInterest += interestComponent;
    cumulativePrincipal += totalPrincipal;

    if (crossoverPeriod === null && totalPrincipal > interestComponent) {
      crossoverPeriod = period;
    }

    rows.push({
      period,
      payment: actualPayment,
      principal: totalPrincipal,
      interest: interestComponent,
      balance,
      cumulativeInterest,
      cumulativePrincipal,
    });

    if (balance <= 0) break;
  }

  const payoffPeriod = rows.length;

  // Compute payoff date
  const payoffDate = new Date(startDate);
  if (periodsPerYear === 12) {
    payoffDate.setMonth(payoffDate.getMonth() + payoffPeriod);
  } else if (periodsPerYear === 26) {
    payoffDate.setDate(payoffDate.getDate() + payoffPeriod * 14);
  } else {
    payoffDate.setDate(payoffDate.getDate() + payoffPeriod * 7);
  }

  const lastRow = rows[rows.length - 1];
  const totalInterest = lastRow?.cumulativeInterest ?? 0;

  return {
    payment,
    rows,
    totalInterest,
    totalPaid: principal + totalInterest,
    payoffPeriod,
    payoffDate,
    crossoverPeriod: annualRate === 0 ? null : crossoverPeriod,
  };
}
