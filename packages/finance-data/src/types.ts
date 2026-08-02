export type ConventionId = 'standardMonthly' | 'canadianSemiAnnual';
export type PeriodsPerYear = 12 | 26 | 52;
export type CountryCode = 'us' | 'uk' | 'ca' | 'au' | 'ie' | 'de' | 'nl' | 'nz' | 'fr' | 'es' | 'sg' | 'in';

export interface DataPoint {
  value: number | string;
  source: string;
  sourceUrl: string;
  lastReviewed: string;  // ISO date YYYY-MM-DD
}

export interface CountryData {
  code: CountryCode;
  locale: string;          // e.g. 'en-US'
  currency: string;        // e.g. 'USD'
  currencySymbol: string;  // e.g. '$'
  convention: ConventionId;
  tier: 1 | 2 | 3;
  defaults: {
    price: number;
    deposit: number;
    rate: number;          // decimal: 0.065
    termYears: number;
    periodsPerYear: PeriodsPerYear;
    priceMin: number;      // slider lower bound in native currency
    priceMax: number;      // slider upper bound in native currency
    priceStep: number;     // slider increment for home price
    depositStep: number;   // slider increment for deposit
  };
  propertyTax?: DataPoint;
  ltvLimit?: DataPoint;
  ltiLimit?: DataPoint;
  subdivisions?: Record<string, {
    name: string;
    propertyTax: DataPoint;
    transferTax: DataPoint;
    medianHomePrice: DataPoint;
  }>;
}

export interface RateResult {
  value: number;           // decimal: 0.065
  source: string;
  sourceUrl: string;
  fetchedAt: string;       // ISO datetime
  asOf: string;            // publication date from source
}

export interface FxResult {
  rate: number;            // e.g. 0.92 (1 USD = 0.92 EUR)
  base: string;            // 'USD'
  target: string;          // 'EUR'
  fetchedAt: string;
  asOf: string;            // ECB publication date
}
