import type { LoanInput, ScheduleResult } from './types';
import { standardMonthly } from './conventions/standardMonthly';
import { canadianSemiAnnual } from './conventions/canadianSemiAnnual';

const conventions = {
  standardMonthly,
  canadianSemiAnnual,
} as const;

export function calculate(input: LoanInput): ScheduleResult {
  const convention = conventions[input.convention];
  return convention.schedule(input);
}
