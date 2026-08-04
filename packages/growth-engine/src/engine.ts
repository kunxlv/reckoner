import type {
  AccumulationInput, AccumulationResult, AccumulationRow,
  DrawdownInput, DrawdownResult, DrawdownRow,
  CAGRInput, CAGRResult,
} from './types';

export function calculateAccumulation(input: AccumulationInput): AccumulationResult {
  const { principal, annualRate, compoundingFrequency, monthlyContribution = 0, years, inflationRate } = input;

  let balance = principal;
  let totalContributed = principal;
  const schedule: AccumulationRow[] = [];

  for (let year = 1; year <= years; year++) {
    if (compoundingFrequency === 'monthly') {
      const monthlyRate = annualRate / 12;
      for (let m = 0; m < 12; m++) {
        balance = balance * (1 + monthlyRate) + monthlyContribution;
      }
    } else if (compoundingFrequency === 'quarterly') {
      const quarterlyRate = annualRate / 4;
      for (let q = 0; q < 4; q++) {
        balance = balance * (1 + quarterlyRate) + monthlyContribution * 3;
      }
    } else if (compoundingFrequency === 'annually') {
      // Annual compounding: principal compounds annually, contributions added as lump sum
      const annualContrib = monthlyContribution * 12;
      balance = balance * (1 + annualRate) + annualContrib;
    } else {
      // continuous: FV = P*e^r + PMT_annual*(e^r - 1)/r
      const er = Math.exp(annualRate);
      const annualContrib = monthlyContribution * 12;
      balance = annualRate > 0
        ? balance * er + annualContrib * (er - 1) / annualRate
        : balance + annualContrib;
    }

    totalContributed += monthlyContribution * 12;
    const interest = balance - totalContributed;

    const row: AccumulationRow = {
      year,
      balance,
      contributed: totalContributed,
      interest,
      ...(inflationRate !== undefined
        ? { realBalance: balance / Math.pow(1 + inflationRate, year) }
        : {}),
    };
    schedule.push(row);
  }

  const lastRow = schedule[schedule.length - 1]!;
  return {
    finalBalance: balance,
    totalContributed,
    totalInterest: balance - totalContributed,
    ...(inflationRate !== undefined ? { realFinalBalance: lastRow.realBalance! } : {}),
    schedule,
  };
}

export function calculateDrawdown(input: DrawdownInput): DrawdownResult {
  const { portfolioValue: initialValue, annualWithdrawal, annualReturn, inflationRate, maxYears = 100 } = input;

  let portfolio = initialValue;
  let withdrawal = annualWithdrawal;
  const schedule: DrawdownRow[] = [];

  for (let year = 1; year <= maxYears; year++) {
    const actualWithdrawal = Math.min(withdrawal, portfolio);
    const remaining = portfolio - actualWithdrawal;
    const growth = remaining * annualReturn;
    portfolio = remaining + growth;

    const row: DrawdownRow = {
      year,
      portfolioValue: portfolio,
      withdrawal: actualWithdrawal,
      growth,
      ...(inflationRate !== undefined
        ? { realPortfolioValue: portfolio / Math.pow(1 + inflationRate, year) }
        : {}),
    };
    schedule.push(row);

    if (portfolio <= 0) {
      return { yearsToDepletion: year, schedule };
    }

    if (inflationRate !== undefined) {
      withdrawal *= 1 + inflationRate;
    }
  }

  return { yearsToDepletion: maxYears, schedule };
}

export function calculateCAGR(input: CAGRInput): CAGRResult {
  const { initialValue, finalValue, years } = input;
  const cagr = Math.pow(finalValue / initialValue, 1 / years) - 1;
  return {
    cagr,
    totalReturnPercent: (finalValue - initialValue) / initialValue,
    absoluteGain: finalValue - initialValue,
  };
}
