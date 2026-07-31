import type { LoanInput, MortgageConvention, PeriodsPerYear, ScheduleResult } from '../types.js';
import { buildSchedule } from '../schedule.js';

export const standardMonthly: MortgageConvention = {
  periodicRate(annualNominal: number, periodsPerYear: PeriodsPerYear): number {
    return annualNominal / periodsPerYear;
  },

  schedule(input: LoanInput): ScheduleResult {
    const i = this.periodicRate(input.annualRate, input.periodsPerYear);
    return buildSchedule(input, i);
  },
};
