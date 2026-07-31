import type { CountryCode } from './types.js';
import { getMortgagePath, COUNTRY_CODES } from './hreflang.js';

const BASE = 'https://reckoner.tools';

export interface SitemapEntry {
  url: string;
  lastModified?: Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export function getMortgageSitemapEntries(): SitemapEntry[] {
  return COUNTRY_CODES.map((cc) => ({
    url: `${BASE}${getMortgagePath(cc as CountryCode)}`,
    changeFrequency: 'weekly',
    priority: cc === 'us' ? 1.0 : 0.9,
  }));
}

export function getStaticSitemapEntries(): SitemapEntry[] {
  return [
    { url: BASE, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/methodology`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/rates`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/about`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/privacy`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/contact`, changeFrequency: 'monthly', priority: 0.3 },
  ];
}
