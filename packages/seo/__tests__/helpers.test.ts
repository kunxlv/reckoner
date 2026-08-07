import { describe, it, expect } from 'vitest';
import {
  getToolPath, getToolCanonical, getToolHreflang, getToolMetadata,
  getPropertySitemapEntries, getLoanSitemapEntries, getSavingsSitemapEntries,
  softwareApplicationSchema, websiteSchema,
  getHubCanonical, getHubHreflang, getHubMetadata,
  getHubSitemapEntries,
} from '../src/index';

describe('getToolPath', () => {
  it('builds the correct path', () => {
    expect(getToolPath('us', 'property', 'mortgage-calculator')).toBe('/us/property/mortgage-calculator');
  });
  it('works for any category and slug', () => {
    expect(getToolPath('uk', 'loans', 'personal-loan')).toBe('/uk/loans/personal-loan');
  });
});

describe('getToolCanonical', () => {
  it('prepends the base URL', () => {
    expect(getToolCanonical('us', 'property', 'stamp-duty')).toBe(
      'https://reckoner.tools/us/property/stamp-duty',
    );
  });
});

describe('getToolHreflang', () => {
  it('returns 13 entries (12 countries + x-default)', () => {
    const entries = getToolHreflang('us', 'property', 'mortgage-calculator');
    expect(entries).toHaveLength(13);
  });
  it('includes x-default pointing to us', () => {
    const entries = getToolHreflang('ca', 'property', 'stamp-duty');
    const xDefault = entries.find((e) => e.hrefLang === 'x-default');
    expect(xDefault?.href).toBe('https://reckoner.tools/us/property/stamp-duty');
  });
  it('all non-x-default entries use the correct path format', () => {
    const entries = getToolHreflang('au', 'property', 'refinance');
    const real = entries.filter((e) => e.hrefLang !== 'x-default');
    for (const e of real) {
      expect(e.href).toMatch(/^https:\/\/reckoner\.tools\/[a-z]+\/property\/refinance$/);
    }
  });
});

describe('getToolMetadata', () => {
  it('sets title and description', () => {
    const meta = getToolMetadata('us', 'property', 'stamp-duty', 'My Title', 'My Desc');
    expect(meta.title).toBe('My Title');
    expect(meta.description).toBe('My Desc');
  });
  it('sets canonical to the new path', () => {
    const meta = getToolMetadata('uk', 'property', 'affordability', 'T', 'D');
    expect((meta.alternates?.canonical as string)).toBe(
      'https://reckoner.tools/uk/property/affordability',
    );
  });
  it('sets robots follow', () => {
    const meta = getToolMetadata('us', 'property', 'refinance', 'T', 'D');
    expect(meta.robots).toEqual({ index: true, follow: true });
  });
});

describe('getPropertySitemapEntries', () => {
  const PROPERTY_SLUGS = ['mortgage-calculator', 'stamp-duty', 'affordability', 'refinance', 'rent-vs-buy'];
  it('returns 60 entries (5 tools × 12 countries)', () => {
    expect(getPropertySitemapEntries()).toHaveLength(60);
  });
  it('all URLs use the /property/ path prefix', () => {
    for (const entry of getPropertySitemapEntries()) {
      expect(entry.url).toMatch(/\/property\//);
    }
  });
  it('us/mortgage-calculator has priority 1.0', () => {
    const entry = getPropertySitemapEntries().find(
      (e) => e.url === 'https://reckoner.tools/us/property/mortgage-calculator',
    );
    expect(entry?.priority).toBe(1.0);
  });
  it('contains all 5 slugs for each country', () => {
    const urls = getPropertySitemapEntries().map((e) => e.url);
    for (const slug of PROPERTY_SLUGS) {
      expect(urls.some((u) => u.includes(`/us/property/${slug}`))).toBe(true);
      expect(urls.some((u) => u.includes(`/uk/property/${slug}`))).toBe(true);
    }
  });
});

describe('getLoanSitemapEntries', () => {
  it('returns 48 entries (4 slugs × 12 countries)', () => {
    expect(getLoanSitemapEntries()).toHaveLength(48);
  });
  it('all URLs contain /loans/', () => {
    for (const entry of getLoanSitemapEntries()) {
      expect(entry.url).toMatch(/\/loans\//);
    }
  });
  it('priority is 0.8 for all entries', () => {
    for (const entry of getLoanSitemapEntries()) {
      expect(entry.priority).toBe(0.8);
    }
  });
  it('includes credit-card-payoff and debt-strategy URLs', () => {
    const entries = getLoanSitemapEntries();
    expect(entries.some((e) => e.url.includes('credit-card-payoff'))).toBe(true);
    expect(entries.some((e) => e.url.includes('debt-strategy'))).toBe(true);
  });
});

describe('getSavingsSitemapEntries', () => {
  it('returns 60 entries (5 slugs × 12 countries)', () => {
    expect(getSavingsSitemapEntries()).toHaveLength(60);
  });
  it('all URLs contain /savings/', () => {
    for (const entry of getSavingsSitemapEntries()) {
      expect(entry.url).toMatch(/\/savings\//);
    }
  });
  it('priority is 0.8 for all entries', () => {
    for (const entry of getSavingsSitemapEntries()) {
      expect(entry.priority).toBe(0.8);
    }
  });
  it('includes compound-interest and fire-number URLs', () => {
    const entries = getSavingsSitemapEntries();
    expect(entries.some((e) => e.url.includes('compound-interest'))).toBe(true);
    expect(entries.some((e) => e.url.includes('fire-number'))).toBe(true);
  });
});

describe('softwareApplicationSchema', () => {
  it('has @type SoftwareApplication', () => {
    const s = softwareApplicationSchema(
      'https://reckoner.tools/us/property/mortgage-calculator',
      'Mortgage Calculator',
      'Monthly payment and amortisation schedule.',
    );
    expect(s['@type']).toBe('SoftwareApplication');
  });
  it('uses the provided url', () => {
    const url = 'https://reckoner.tools/uk/loans/personal-loan';
    const s = softwareApplicationSchema(url, 'Personal Loan', 'Desc');
    expect(s.url).toBe(url);
  });
  it('sets applicationCategory to FinanceApplication', () => {
    const s = softwareApplicationSchema(
      'https://reckoner.tools/us/savings/compound-interest',
      'Compound Interest',
      'Desc',
    );
    expect(s.applicationCategory).toBe('FinanceApplication');
  });
  it('has a free Offer', () => {
    const s = softwareApplicationSchema('https://reckoner.tools/us/property/refinance', 'Refinance', 'Desc');
    expect((s.offers as Record<string, unknown>).price).toBe('0');
  });
});

describe('websiteSchema', () => {
  it('has @type WebSite', () => {
    expect(websiteSchema()['@type']).toBe('WebSite');
  });
  it('url is the base URL', () => {
    expect(websiteSchema().url).toBe('https://reckoner.tools');
  });
  it('name is Reckoner', () => {
    expect(websiteSchema().name).toBe('Reckoner');
  });
});

describe('getToolMetadata openGraph and twitter', () => {
  it('includes openGraph with siteName Reckoner', () => {
    const meta = getToolMetadata('us', 'property', 'stamp-duty', 'Title', 'Desc');
    expect((meta.openGraph as Record<string, unknown>)?.siteName).toBe('Reckoner');
  });
  it('openGraph type is website', () => {
    const meta = getToolMetadata('us', 'property', 'stamp-duty', 'Title', 'Desc');
    expect((meta.openGraph as Record<string, unknown>)?.type).toBe('website');
  });
  it('includes twitter card summary', () => {
    const meta = getToolMetadata('us', 'property', 'stamp-duty', 'Title', 'Desc');
    expect((meta.twitter as Record<string, unknown>)?.card).toBe('summary');
  });
});

describe('getHubCanonical', () => {
  it('returns /us/property for category hub', () => {
    expect(getHubCanonical('us', 'property')).toBe('https://reckoner.tools/us/property');
  });
  it('returns /uk with no trailing slash for country hub (category empty string)', () => {
    expect(getHubCanonical('uk', '')).toBe('https://reckoner.tools/uk');
  });
});

describe('getHubHreflang', () => {
  it('returns 13 entries for a category hub', () => {
    expect(getHubHreflang('us', 'property')).toHaveLength(13);
  });
  it('x-default points to /us/property for category hub', () => {
    const entries = getHubHreflang('ca', 'property');
    const xDefault = entries.find((e) => e.hrefLang === 'x-default');
    expect(xDefault?.href).toBe('https://reckoner.tools/us/property');
  });
  it('x-default points to /us for country hub', () => {
    const entries = getHubHreflang('ca', '');
    const xDefault = entries.find((e) => e.hrefLang === 'x-default');
    expect(xDefault?.href).toBe('https://reckoner.tools/us');
  });
  it('all non-x-default entries use the correct hub path format', () => {
    const entries = getHubHreflang('au', 'loans');
    const real = entries.filter((e) => e.hrefLang !== 'x-default');
    for (const e of real) {
      expect(e.href).toMatch(/^https:\/\/reckoner\.tools\/[a-z]+\/loans$/);
    }
  });
});

describe('getHubMetadata', () => {
  it('sets canonical for category hub', () => {
    const meta = getHubMetadata('uk', 'savings', 'Title', 'Desc');
    expect((meta.alternates?.canonical as string)).toBe('https://reckoner.tools/uk/savings');
  });
  it('sets canonical for country hub', () => {
    const meta = getHubMetadata('au', '', 'Title', 'Desc');
    expect((meta.alternates?.canonical as string)).toBe('https://reckoner.tools/au');
  });
  it('includes openGraph siteName', () => {
    const meta = getHubMetadata('us', 'loans', 'Title', 'Desc');
    expect((meta.openGraph as Record<string, unknown>)?.siteName).toBe('Reckoner');
  });
  it('includes twitter card', () => {
    const meta = getHubMetadata('us', 'property', 'Title', 'Desc');
    expect((meta.twitter as Record<string, unknown>)?.card).toBe('summary');
  });
  it('hreflang languages object has 13 entries', () => {
    const meta = getHubMetadata('us', 'savings', 'Title', 'Desc');
    expect(Object.keys(meta.alternates?.languages ?? {})).toHaveLength(13);
  });
});

describe('getHubSitemapEntries', () => {
  it('returns 48 entries (4 hub types × 12 countries)', () => {
    expect(getHubSitemapEntries()).toHaveLength(48);
  });
  it('includes country hub /us with no trailing slash', () => {
    const entries = getHubSitemapEntries();
    expect(entries.some((e) => e.url === 'https://reckoner.tools/us')).toBe(true);
  });
  it('includes category hubs for all three categories', () => {
    const urls = getHubSitemapEntries().map((e) => e.url);
    expect(urls.some((u) => u.includes('/us/property'))).toBe(true);
    expect(urls.some((u) => u.includes('/us/loans'))).toBe(true);
    expect(urls.some((u) => u.includes('/us/savings'))).toBe(true);
  });
  it('country hub has priority 0.9', () => {
    const entry = getHubSitemapEntries().find((e) => e.url === 'https://reckoner.tools/us');
    expect(entry?.priority).toBe(0.9);
  });
  it('category hub has priority 0.8', () => {
    const entry = getHubSitemapEntries().find(
      (e) => e.url === 'https://reckoner.tools/us/property',
    );
    expect(entry?.priority).toBe(0.8);
  });
  it('covers all 12 countries', () => {
    const urls = getHubSitemapEntries().map((e) => e.url);
    for (const cc of ['us', 'uk', 'ca', 'au', 'ie', 'de', 'nl', 'nz', 'fr', 'es', 'sg', 'in']) {
      expect(urls.some((u) => u.includes(`/${cc}/property`))).toBe(true);
    }
  });
});
