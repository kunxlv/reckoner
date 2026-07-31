import type { FxResult } from '../types.js';

const BASE_URL = 'https://api.frankfurter.dev/v1/latest';

export async function fetchFrankfurter(base: string, targets: string[]): Promise<FxResult & { rates: Record<string, number> }> {
  const url = `${BASE_URL}?base=${base}&symbols=${targets.join(',')}`;
  const res = await fetch(url, { next: { revalidate: 86400 } } as RequestInit);
  if (!res.ok) throw new Error(`Frankfurter error: ${res.status}`);

  const data = await res.json() as {
    amount: number;
    base: string;
    date: string;
    rates: Record<string, number>;
  };

  // Return rates keyed by target — caller picks what they need
  return {
    rate: 1,  // placeholder; callers use getRateFor()
    base: data.base,
    target: '',
    fetchedAt: new Date().toISOString(),
    asOf: data.date,
    rates: data.rates,
  };
}

export function getRateFor(result: FxResult & { rates?: Record<string, number> }, target: string): number | null {
  const rates = result.rates;
  return rates?.[target] ?? null;
}
