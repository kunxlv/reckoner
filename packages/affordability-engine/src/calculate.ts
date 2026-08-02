// packages/affordability-engine/src/calculate.ts
import type { AffordabilityRuleSet } from '@reckoner/rules-core';
import type { AffordabilityInput, AffordabilityResult } from './types';

function monthlyPaymentForLoan(principal: number, annualRate: number, termYears: number): number {
  if (principal <= 0) return 0;
  const i = annualRate / 12;
  const n = termYears * 12;
  if (i === 0) return principal / n;
  return (principal * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
}

function maxLoanFromPayment(monthlyPayment: number, annualRate: number, termYears: number): number {
  if (monthlyPayment <= 0) return 0;
  const i = annualRate / 12;
  const n = termYears * 12;
  if (i === 0) return monthlyPayment * n;
  return (monthlyPayment * (Math.pow(1 + i, n) - 1)) / (i * Math.pow(1 + i, n));
}

export function calculateAffordability(
  input: AffordabilityInput,
  ruleset: AffordabilityRuleSet,
): AffordabilityResult {
  const { grossAnnualIncome, monthlyDebts, propertyPrice, annualRate, termYears, buyerType } = input;
  const monthlyIncome = grossAnnualIncome / 12;
  const p = ruleset.params;

  switch (ruleset.method) {
    case 'lti_ltv': {
      const ltiMultiplier =
        buyerType === 'first_time_buyer' ? (p['ltiFtb'] ?? 4) :
        buyerType === 'buy_to_let' ? 0 :
        (p['ltiSsb'] ?? 3.5);
      const ltvRatio =
        buyerType === 'first_time_buyer' ? (p['ltvFtb'] ?? 0.9) :
        buyerType === 'buy_to_let' ? (p['ltvBtl'] ?? 0.7) :
        (p['ltvSsb'] ?? 0.9);

      const maxByLti = grossAnnualIncome * ltiMultiplier;
      const maxByLtv = propertyPrice * ltvRatio;
      const maxBorrow = Math.min(maxByLti, maxByLtv);
      const bindingConstraint = maxByLti < maxByLtv ? 'lti' : 'ltv';
      const maxMonthlyPayment = monthlyPaymentForLoan(maxBorrow, annualRate, termYears);

      return {
        maxBorrow: Math.round(maxBorrow),
        assessmentRate: annualRate,
        availableForMortgage: Math.max(0, monthlyIncome * 0.4 - monthlyDebts),
        bindingConstraint,
        maxMonthlyPayment: Math.round(maxMonthlyPayment * 100) / 100,
      };
    }

    case 'serviceability_buffer': {
      const buffer = p['buffer'] ?? 0.03;
      const assessmentRate = annualRate + buffer;
      // No hard DTI cap in APRA rules — lenders set their own
      // Use 35% of gross income as a conservative representative cap
      const availableForMortgage = Math.max(0, monthlyIncome * 0.35 - monthlyDebts);
      const maxBorrow = maxLoanFromPayment(availableForMortgage, assessmentRate, termYears);
      const maxMonthlyPayment = monthlyPaymentForLoan(maxBorrow, annualRate, termYears);

      return {
        maxBorrow: Math.round(maxBorrow),
        assessmentRate,
        availableForMortgage: Math.round(availableForMortgage * 100) / 100,
        bindingConstraint: 'payment_capacity',
        maxMonthlyPayment: Math.round(maxMonthlyPayment * 100) / 100,
      };
    }

    case 'tdsr_msr': {
      const tdsr = p['tdsr'] ?? 0.55;
      const rateFloor = p['rateFloor'] ?? 0.04;
      const assessmentRate = Math.max(annualRate, rateFloor);
      const maxTotalDebtService = monthlyIncome * tdsr;
      const availableForMortgage = Math.max(0, maxTotalDebtService - monthlyDebts);
      const maxBorrow = maxLoanFromPayment(availableForMortgage, assessmentRate, termYears);
      const maxMonthlyPayment = monthlyPaymentForLoan(maxBorrow, annualRate, termYears);

      return {
        maxBorrow: Math.round(maxBorrow),
        assessmentRate,
        availableForMortgage: Math.round(availableForMortgage * 100) / 100,
        bindingConstraint: 'dti',
        maxMonthlyPayment: Math.round(maxMonthlyPayment * 100) / 100,
      };
    }

    case 'dti_stress': {
      // Canada MQR: max(contract+2%, 5.25%)
      const stressFloor = p['stressFloor'] ?? 0.0525;
      const assessmentRate = Math.max(annualRate + 0.02, stressFloor);
      const availableForMortgage = Math.max(0, monthlyIncome * 0.39 - monthlyDebts);
      const maxBorrow = maxLoanFromPayment(availableForMortgage, assessmentRate, termYears);
      const maxMonthlyPayment = monthlyPaymentForLoan(maxBorrow, annualRate, termYears);

      return {
        maxBorrow: Math.round(maxBorrow),
        assessmentRate,
        availableForMortgage: Math.round(availableForMortgage * 100) / 100,
        bindingConstraint: 'payment_capacity',
        maxMonthlyPayment: Math.round(maxMonthlyPayment * 100) / 100,
      };
    }
  }
}
