import type { RateResult } from '../types.js';

const SERIES = 'MORTGAGE30US';
const SOURCE = 'Freddie Mac Primary Mortgage Market Survey via FRED';
const SOURCE_URL = 'https://fred.stlouisfed.org/series/MORTGAGE30US';

export async function fetchUSRate(): Promise<RateResult> {
  const apiKey = process.env['FRED_API_KEY'];
  if (!apiKey) throw new Error('FRED_API_KEY env var is not set');

  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${SERIES}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=1`;
  const res = await fetch(url, { next: { revalidate: 86400 } } as RequestInit);
  if (!res.ok) throw new Error(`FRED API error: ${res.status}`);

  const data = await res.json() as { observations: Array<{ date: string; value: string }> };
  const obs = data.observations[0];
  if (!obs || obs.value === '.') throw new Error('FRED returned no valid observation');

  return {
    value: parseFloat(obs.value) / 100,  // FRED returns e.g. "6.50"
    source: SOURCE,
    sourceUrl: SOURCE_URL,
    fetchedAt: new Date().toISOString(),
    asOf: obs.date,
  };
}
