import type { RateResult } from '../types';

// ECB MIR series: new business, house purchase, floating & up to 1yr fixation
// Format: MIR.M.{CC}.B.A2C.AM.R.A.2250.EUR.N
// CC = IE, DE, NL, FR, ES
const ECB_BASE = 'https://data-api.ecb.europa.eu/service/data/MIR';
const SOURCE = 'European Central Bank Data Portal — MFI Interest Rate Statistics';
const SOURCE_URL = 'https://data.ecb.europa.eu/data/datasets/MIR';

const SERIES: Record<string, string> = {
  ie: 'MIR.M.IE.B.A2C.AM.R.A.2250.EUR.N',
  de: 'MIR.M.DE.B.A2C.AM.R.A.2250.EUR.N',
  nl: 'MIR.M.NL.B.A2C.AM.R.A.2250.EUR.N',
  fr: 'MIR.M.FR.B.A2C.AM.R.A.2250.EUR.N',
  es: 'MIR.M.ES.B.A2C.AM.R.A.2250.EUR.N',
};

export async function fetchECBRate(countryCode: 'ie' | 'de' | 'nl' | 'fr' | 'es'): Promise<RateResult> {
  const series = SERIES[countryCode];
  if (!series) throw new Error(`No ECB series for ${countryCode}`);

  const url = `${ECB_BASE}/${series}?lastNObservations=1&format=jsondata`;
  const res = await fetch(url, { next: { revalidate: 86400 } } as RequestInit);
  if (!res.ok) throw new Error(`ECB API error: ${res.status} for ${countryCode}`);

  const data = await res.json() as {
    dataSets: Array<{ observations: Record<string, [number]> }>;
    structure: { dimensions: { observation: Array<{ values: Array<{ id: string }> }> } };
  };

  const dataset = data.dataSets[0];
  const observations = dataset?.observations ?? {};
  const keys = Object.keys(observations);
  const lastKey = keys[keys.length - 1];
  if (!lastKey) throw new Error(`ECB returned no observations for ${countryCode}`);

  const value = observations[lastKey]?.[0];
  if (value === undefined) throw new Error(`ECB value missing for ${countryCode}`);

  // Parse date from structure
  const timeDim = data.structure.dimensions.observation.find((d) =>
    d.values.some((v) => /^\d{4}-\d{2}$/.test(v.id))
  );
  const obsIndex = parseInt(lastKey.split(':').pop() ?? '0', 10);
  const dateId = timeDim?.values[obsIndex]?.id ?? 'unknown';

  return {
    value: value / 100,
    source: SOURCE,
    sourceUrl: SOURCE_URL,
    fetchedAt: new Date().toISOString(),
    asOf: dateId,
  };
}
