import type { FxResult } from '../types';

// In-process cache — survives across requests in the same Node.js instance.
// Vercel's Fluid Compute reuses instances, so this acts as a warm cache.
let lastGood: (FxResult & { rates: Record<string, number> }) | null = null;
let lastGoodFetchedAt: number = 0;

const STALE_MS = 48 * 60 * 60 * 1000;  // 48 hours

export function getCachedFx(): (FxResult & { rates: Record<string, number> }) | null {
  return lastGood;
}

export function setCachedFx(result: FxResult & { rates: Record<string, number> }): void {
  lastGood = result;
  lastGoodFetchedAt = Date.now();
}

export function isFxStale(): boolean {
  if (!lastGood) return false;
  return Date.now() - lastGoodFetchedAt > STALE_MS;
}
