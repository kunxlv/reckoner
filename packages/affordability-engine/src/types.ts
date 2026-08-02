// packages/affordability-engine/src/types.ts
export interface AffordabilityInput {
  grossAnnualIncome: number;
  monthlyDebts: number;          // existing monthly debt obligations
  propertyPrice: number;
  annualRate: number;             // current product rate as decimal
  termYears: number;
  buyerType: 'first_time_buyer' | 'subsequent_buyer' | 'buy_to_let';
}

export interface AffordabilityResult {
  maxBorrow: number;
  assessmentRate: number;         // rate used for stress test
  availableForMortgage: number;   // monthly cash available for mortgage payment
  bindingConstraint: 'lti' | 'ltv' | 'dti' | 'payment_capacity';
  maxMonthlyPayment: number;
}
