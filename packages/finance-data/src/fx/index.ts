import type { FxResult } from '../types';
import { fetchFrankfurter, getRateFor } from './frankfurter';
import { getCachedFx, setCachedFx, isFxStale } from './cache';

export type { FxResult };

const ALL_TARGETS = ['EUR', 'GBP', 'CAD', 'AUD', 'NZD', 'SGD', 'INR', 'USD'];

/**
 * Fetch all FX rates relative to base currency.
 * Falls back to last-good cache on failure.
 * Returns null only if no cached value exists.
 */
export async function fetchFxRates(base: string): Promise<(FxResult & { rates: Record<string, number> }) | null> {
  try {
    const targets = ALL_TARGETS.filter((t) => t !== base);
    const result = await fetchFrankfurter(base, targets);
    setCachedFx(result);
    return result;
  } catch {
    const cached = getCachedFx();
    if (cached) return cached;
    return null;
  }
}

export { getRateFor, isFxStale, getCachedFx };
