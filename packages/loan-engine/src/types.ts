import type { AmortizationRow } from '@reckoner/mortgage-engine';
export type { AmortizationRow };

export interface LoanCalcInput {
  /** Loan principal in local currency units */
  principal: number;
  /** Annual nominal rate as decimal: 0.12 = 12% */
  annualRate: number;
  /** Loan term in months */
  termMonths: number;
  /** Flat origination fee deducted from disbursed amount (affects APR) */
  originationFee?: number;
}

export interface LoanCalcResult {
  monthlyPayment: number;
  totalInterest: number;
  /** monthlyPayment × termMonths */
  totalCost: number;
  /** annualRate when no fee; IRR-based APR when originationFee > 0 */
  apr: number;
  schedule: AmortizationRow[];
}

export interface AutoLoanInput {
  vehiclePrice: number;
  /** Cash down payment (not financed) */
  downPayment: number;
  /** Trade-in value (not financed) */
  tradeInValue: number;
  /** Sales tax as decimal: 0.07 = 7%. Use 0 where tax is included in listed price. */
  salesTaxRate: number;
  annualRate: number;
  termMonths: number;
  /** Dealer documentation fee rolled into the loan (affects APR) */
  docFee?: number;
}

export interface AutoLoanResult {
  /** vehicle price + tax − down payment − trade-in + doc fee (clamped to 0) */
  financedAmount: number;
  monthlyPayment: number;
  totalInterest: number;
  /** Total out-of-pocket = monthlyPayment × termMonths + downPayment + tradeInValue */
  totalCost: number;
  apr: number;
  schedule: AmortizationRow[];
}
