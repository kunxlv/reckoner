import type { RateResult } from '../types';

const SERIES = 'V80691335';  // Conventional mortgage - 5-year term
const SOURCE = 'Bank of Canada — Posted conventional mortgage rates (Valet API)';
const SOURCE_URL = 'https://www.bankofcanada.ca/rates/banking-and-financial-statistics/posted-conventional-mortgage-rates/';

export async function fetchCARate(): Promise<RateResult> {
  const url = `https://www.bankofcanada.ca/valet/observations/${SERIES}/json?recent=1`;
  const res = await fetch(url, { next: { revalidate: 86400 } } as RequestInit);
  if (!res.ok) throw new Error(`Bank of Canada Valet API error: ${res.status}`);

  const data = await res.json() as {
    observations: Array<Record<string, { v: string }> & { d: string }>;
  };
  const obs = data.observations[0];
  if (!obs) throw new Error('Bank of Canada returned no observations');

  const raw = obs[SERIES];
  if (!raw) throw new Error(`Series ${SERIES} not found in response`);

  return {
    value: parseFloat(raw.v) / 100,
    source: SOURCE,
    sourceUrl: SOURCE_URL,
    fetchedAt: new Date().toISOString(),
    asOf: obs.d,
  };
}
