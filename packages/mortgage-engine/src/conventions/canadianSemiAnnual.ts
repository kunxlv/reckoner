import type { LoanInput, MortgageConvention, PeriodsPerYear, ScheduleResult } from '../types.js';
import { buildSchedule } from '../schedule.js';

export const canadianSemiAnnual: MortgageConvention = {
  periodicRate(annualNominal: number, periodsPerYear: PeriodsPerYear): number {
    // Semi-annual compounding: (1 + r/2)^2 = effective annual rate
    // For periodsPerYear payment periods: i = (1 + r/2)^(2/periodsPerYear) - 1
    return Math.pow(1 + annualNominal / 2, 2 / periodsPerYear) - 1;
  },

  schedule(input: LoanInput): ScheduleResult {
    const i = this.periodicRate(input.annualRate, input.periodsPerYear);
    return buildSchedule(input, i);
  },
};
