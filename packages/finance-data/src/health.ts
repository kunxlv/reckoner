import type { CountryCode } from './types.js';

export interface RateHealth {
  cc: CountryCode;
  fetchedAt: string | null;
  ageHours: number | null;
  stale: boolean;  // true if > 14 days
}

const STALE_THRESHOLD_MS = 14 * 24 * 60 * 60 * 1000;

export function checkRateHealth(cc: CountryCode, fetchedAt: string | null): RateHealth {
  if (!fetchedAt) {
    return { cc, fetchedAt: null, ageHours: null, stale: true };
  }
  const ageMs = Date.now() - new Date(fetchedAt).getTime();
  return {
    cc,
    fetchedAt,
    ageHours: Math.round(ageMs / (1000 * 60 * 60)),
    stale: ageMs > STALE_THRESHOLD_MS,
  };
}
