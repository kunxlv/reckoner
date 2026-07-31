import type { LoanInput, ScheduleResult } from './types.js';
import { standardMonthly } from './conventions/standardMonthly.js';
import { canadianSemiAnnual } from './conventions/canadianSemiAnnual.js';

const conventions = {
  standardMonthly,
  canadianSemiAnnual,
} as const;

export function calculate(input: LoanInput): ScheduleResult {
  const convention = conventions[input.convention];
  return convention.schedule(input);
}
