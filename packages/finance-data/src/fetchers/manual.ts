import type { RateResult } from '../types.js';

interface ManualRate {
  value: number;
  source: string;
  sourceUrl: string;
  asOf: string;
}

const MANUAL_RATES: Record<string, ManualRate> = {
  nz: {
    value: 0.062,
    source: 'Reserve Bank of New Zealand — Retail interest rates on credit extended by banks B20',
    sourceUrl: 'https://www.rbnz.govt.nz/statistics/series/exchange-and-interest-rates/retail-interest-rates',
    asOf: '2026-06-01',
  },
  sg: {
    value: 0.038,
    source: 'Monetary Authority of Singapore — average residential property loan rate',
    sourceUrl: 'https://eservices.mas.gov.sg/statistics/',
    asOf: '2026-06-01',
  },
  in: {
    value: 0.085,
    source: 'Reserve Bank of India — WALR on fresh rupee loans for housing',
    sourceUrl: 'https://www.rbi.org.in/Scripts/BS_ViewBulletin.aspx',
    asOf: '2026-06-01',
  },
};

export function getManualRate(countryCode: 'nz' | 'sg' | 'in'): RateResult {
  const rate = MANUAL_RATES[countryCode];
  if (!rate) throw new Error(`No manual rate for ${countryCode}`);
  return {
    ...rate,
    fetchedAt: new Date().toISOString(),
  };
}
