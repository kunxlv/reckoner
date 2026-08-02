import type { RateResult } from '../types';

// IUMBV42 = 2yr fixed 75% LTV mortgage rate (effective rate, monthly data)
const SERIES = 'IUMBV42';
const SOURCE = 'Bank of England Interactive Statistical Database';
const SOURCE_URL = 'https://www.bankofengland.co.uk/statistics/mortgage-lenders-and-administrators';

export async function fetchUKRate(): Promise<RateResult> {
  const url = `https://www.bankofengland.co.uk/boeapps/database/fromshowcolumns.asp?Travel=NIxRSxSUx&FromSeries=1&ToSeries=50&DAT=RNG&FD=1&FM=Jan&FY=2024&TD=31&TM=Dec&TY=2026&VFD=Y&html.x=66&html.y=26&SeriesCodes=${SERIES}&UsingCodes=Y&CSVF=TT&hdbopath=t`;
  const res = await fetch(url, { next: { revalidate: 86400 } } as RequestInit);
  if (!res.ok) throw new Error(`BoE IADB error: ${res.status}`);

  const text = await res.text();
  const lines = text.trim().split('\n').filter((l) => l.trim() && !l.startsWith('"Title"') && !l.startsWith('"Unique'));
  const lastLine = lines[lines.length - 1];
  if (!lastLine) throw new Error('BoE returned empty data');

  // Format: "Jan 2026",4.58
  const parts = lastLine.split(',');
  const dateStr = (parts[0] ?? '').replace(/"/g, '').trim();
  const valueStr = (parts[parts.length - 1] ?? '').trim();
  const value = parseFloat(valueStr);
  if (Number.isNaN(value)) throw new Error(`Could not parse BoE rate: ${lastLine}`);

  return {
    value: value / 100,
    source: SOURCE,
    sourceUrl: SOURCE_URL,
    fetchedAt: new Date().toISOString(),
    asOf: dateStr,
  };
}
