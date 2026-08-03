import { calculate } from '@reckoner/mortgage-engine';
import { computeAPR } from './apr';
import type { LoanCalcInput, LoanCalcResult } from './types';

export function calculateLoan(input: LoanCalcInput): LoanCalcResult {
  const { principal, annualRate, termMonths, originationFee = 0 } = input;

  const engineResult = calculate({
    principal,
    annualRate,
    termYears: termMonths / 12,
    periodsPerYear: 12,
    convention: 'standardMonthly',
  });

  const monthlyPayment = engineResult.payment;
  const totalInterest = engineResult.totalInterest;
  const totalCost = monthlyPayment * termMonths;

  const apr = originationFee > 0
    ? computeAPR(principal - originationFee, monthlyPayment, termMonths)
    : annualRate;

  return {
    monthlyPayment,
    totalInterest,
    totalCost,
    apr,
    schedule: engineResult.rows,
  };
}
