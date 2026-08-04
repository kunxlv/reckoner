export interface AccumulationInput {
  principal: number;
  annualRate: number;
  compoundingFrequency: 'monthly' | 'quarterly' | 'annually' | 'continuous';
  monthlyContribution?: number;
  years: number;
  inflationRate?: number;
}

export interface AccumulationRow {
  year: number;
  balance: number;
  contributed: number;
  interest: number;
  realBalance?: number;
}

export interface AccumulationResult {
  finalBalance: number;
  totalContributed: number;
  totalInterest: number;
  realFinalBalance?: number;
  schedule: AccumulationRow[];
}

export interface DrawdownInput {
  portfolioValue: number;
  annualWithdrawal: number;
  annualReturn: number;
  inflationRate?: number;
  maxYears?: number;
}

export interface DrawdownRow {
  year: number;
  portfolioValue: number;
  withdrawal: number;
  growth: number;
  realPortfolioValue?: number;
}

export interface DrawdownResult {
  yearsToDepletion: number;
  schedule: DrawdownRow[];
}

export interface CAGRInput {
  initialValue: number;
  finalValue: number;
  years: number;
}

export interface CAGRResult {
  cagr: number;
  totalReturnPercent: number;
  absoluteGain: number;
}
