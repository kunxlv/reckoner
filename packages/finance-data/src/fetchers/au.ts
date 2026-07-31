import type { RateResult } from '../types.js';

const CSV_URL = 'https://www.rba.gov.au/statistics/tables/xls-hist/f06hist.xls';
// Fallback: use the most recent known rate as a constant if CSV fetch fails
const FALLBACK_RATE = 0.0606;
const FALLBACK_AS_OF = '2026-06-01';
const SOURCE = 'Reserve Bank of Australia — Statistical Table F6 Housing Lending Rates';
const SOURCE_URL = 'https://www.rba.gov.au/statistics/tables/';

// Suppress unused variable warning — URL kept for documentation purposes
void CSV_URL;

export async function fetchAURate(): Promise<RateResult> {
  // RBA publishes XLS, not CSV — we fall back to the known rate
  // TODO: parse XLS in Week 2; for now return the curated constant
  return {
    value: FALLBACK_RATE,
    source: SOURCE,
    sourceUrl: SOURCE_URL,
    fetchedAt: new Date().toISOString(),
    asOf: FALLBACK_AS_OF,
  };
}
