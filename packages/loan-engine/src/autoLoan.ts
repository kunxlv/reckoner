import { calculate } from '@reckoner/mortgage-engine';
import { computeAPR } from './apr';
import type { AutoLoanInput, AutoLoanResult } from './types';

export function calculateAutoLoan(input: AutoLoanInput): AutoLoanResult {
  const {
    vehiclePrice,
    downPayment,
    tradeInValue,
    salesTaxRate,
    annualRate,
    termMonths,
    docFee = 0,
  } = input;

  const salesTaxAmount = vehiclePrice * salesTaxRate;
  const financedAmount = Math.max(
    0,
    vehiclePrice + salesTaxAmount - downPayment - tradeInValue + docFee,
  );

  if (financedAmount === 0) {
    return {
      financedAmount: 0,
      monthlyPayment: 0,
      totalInterest: 0,
      totalCost: vehiclePrice + salesTaxAmount,
      apr: annualRate,
      schedule: [],
    };
  }

  const engineResult = calculate({
    principal: financedAmount,
    annualRate,
    termYears: termMonths / 12,
    periodsPerYear: 12,
    convention: 'standardMonthly',
  });

  const monthlyPayment = engineResult.payment;
  const totalInterest = engineResult.totalInterest;
  const totalCost = monthlyPayment * termMonths + downPayment + tradeInValue;

  const netAmount = financedAmount - docFee;
  const apr = docFee > 0
    ? computeAPR(netAmount, monthlyPayment, termMonths)
    : annualRate;

  return {
    financedAmount,
    monthlyPayment,
    totalInterest,
    totalCost,
    apr,
    schedule: engineResult.rows,
  };
}
