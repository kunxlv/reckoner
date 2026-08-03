import { monthlyPayment } from './mortgage';

export interface RefinanceInput {
  balance: number;
  currentRate: number;
  newRate: number;
  remainingYears: number;
  closingCosts: number;
}

export interface RefinanceResult {
  currentPayment: number;
  newPayment: number;
  monthlySavings: number;
  breakEvenMonths: number | null;
  totalSavingOverTerm: number;
}

export function calcRefinance(input: RefinanceInput): RefinanceResult {
  const { balance, currentRate, newRate, remainingYears, closingCosts } = input;
  const currentPayment = monthlyPayment(balance, currentRate, remainingYears);
  const newPayment = monthlyPayment(balance, newRate, remainingYears);
  const monthlySavings = currentPayment - newPayment;
  const breakEvenMonths = monthlySavings > 0 ? Math.ceil(closingCosts / monthlySavings) : null;
  const totalSavingOverTerm = monthlySavings * remainingYears * 12 - closingCosts;
  return { currentPayment, newPayment, monthlySavings, breakEvenMonths, totalSavingOverTerm };
}
