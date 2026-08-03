export interface CardPayoffInput {
  balanceCents: number;
  annualRate: number;
  minPaymentRule:
    | { type: 'percent'; rate: number; floorCents: number }
    | { type: 'fixed'; amountCents: number };
  extraMonthlyCents?: number;
}

export interface CardPayoffRow {
  month: number;
  paymentCents: number;
  interestCents: number;
  principalCents: number;
  balanceCents: number; // balance after this month's payment
}

export interface CardPayoffResult {
  months: number;
  totalInterestCents: number;
  totalPaidCents: number;
  schedule: CardPayoffRow[];
}
