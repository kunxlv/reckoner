export interface Debt {
  name: string;
  balanceCents: number;
  annualRate: number;
  minPaymentCents: number;
}

export type Strategy = 'minimum' | 'snowball' | 'avalanche';

export interface DebtScheduleRow {
  month: number;
  totalPaymentCents: number;
  totalInterestCents: number;
  totalPrincipalCents: number;
  totalBalanceCents: number;
  debtBalancesCents: number[]; // same length as input debts; 0 for fully paid debts
}

export interface DebtStrategyResult {
  strategy: Strategy;
  months: number;
  totalInterestCents: number;
  totalPaidCents: number;
  schedule: DebtScheduleRow[];
}
