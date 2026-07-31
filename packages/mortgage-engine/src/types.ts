export type ConventionId = 'standardMonthly' | 'canadianSemiAnnual';
export type PeriodsPerYear = 12 | 26 | 52;

export interface LoanInput {
  /** Loan amount (property price minus deposit), in local currency units */
  principal: number;
  /** Annual nominal rate as decimal: 0.065 = 6.5% */
  annualRate: number;
  termYears: number;
  periodsPerYear: PeriodsPerYear;
  convention: ConventionId;
  /** Additional payment applied each period on top of scheduled payment */
  extraPaymentPerPeriod?: number;
  /** Used to compute payoffDate. Defaults to start of current month. */
  startDate?: Date;
}

export interface AmortizationRow {
  /** 1-based period number */
  period: number;
  /** Scheduled payment amount (before extra) */
  payment: number;
  /** Principal component of this payment */
  principal: number;
  /** Interest component of this payment */
  interest: number;
  /** Remaining balance after this payment */
  balance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

export interface ScheduleResult {
  /** Periodic payment amount at full precision (no rounding) */
  payment: number;
  rows: AmortizationRow[];
  totalInterest: number;
  totalPaid: number;
  /** Actual number of periods (may be less than termYears*periodsPerYear with extra payments) */
  payoffPeriod: number;
  payoffDate: Date;
  /** First period (1-based) where principal component exceeds interest component. Null if never (0% rate). */
  crossoverPeriod: number | null;
}

export interface MortgageConvention {
  /** Returns the effective periodic rate given annual nominal rate and payment frequency */
  periodicRate(annualNominal: number, periodsPerYear: PeriodsPerYear): number;
  schedule(input: LoanInput): ScheduleResult;
}
