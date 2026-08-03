import { describe, it, expect } from 'vitest';
import {
  getMortgagePath,
  getMortgageHreflang,
  getCanonical,
  COUNTRY_CODES,
  getMortgageMetadata,
  webApplicationSchema,
  faqSchema,
  breadcrumbSchema,
  organizationSchema,
  datasetSchema,
  jsonLdScript,
  getMortgageSitemapEntries,
  getStaticSitemapEntries,
} from '../src/index';
import type { CountryCode } from '../src/index';

describe('COUNTRY_CODES', () => {
  it('has 12 entries', () => {
    expect(COUNTRY_CODES).toHaveLength(12);
  });
});

describe('getMortgagePath', () => {
  it('returns the correct path for us', () => {
    expect(getMortgagePath('us')).toBe('/us/mortgage-calculator');
  });
  it('returns the correct path for uk', () => {
    expect(getMortgagePath('uk')).toBe('/uk/mortgage-calculator');
  });
});

describe('getCanonical', () => {
  it('prepends the base URL for us', () => {
    expect(getCanonical('us')).toBe('https://reckoner.tools/us/mortgage-calculator');
  });
});

describe('getMortgageHreflang', () => {
  it('returns 13 entries (12 countries + x-default)', () => {
    const entries = getMortgageHreflang('us');
    expect(entries).toHaveLength(13);
  });
  it('includes x-default pointing to /us/mortgage-calculator', () => {
    const entries = getMortgageHreflang('uk');
    const xDefault = entries.find((e) => e.hrefLang === 'x-default');
    expect(xDefault?.href).toBe('https://reckoner.tools/us/mortgage-calculator');
  });
});

describe('getMortgageMetadata', () => {
  it('returns metadata with title and description for us', () => {
    const meta = getMortgageMetadata('us');
    expect(meta.title).toBe('Mortgage Calculator with Amortization Schedule | Reckoner');
    expect(meta.description).toBe('Work out your monthly mortgage payment, total interest and full amortization schedule. Prefilled with this week\'s Freddie Mac 30-year average. Free, no signup.');
  });
  it('sets canonical for us', () => {
    const meta = getMortgageMetadata('us');
    expect(meta.alternates?.canonical).toBe('https://reckoner.tools/us/mortgage-calculator');
  });
  it('sets robots index and follow', () => {
    const meta = getMortgageMetadata('ca');
    expect(meta.robots).toEqual({ index: true, follow: true });
  });
  it('returns metadata for all country codes', () => {
    for (const cc of COUNTRY_CODES) {
      const meta = getMortgageMetadata(cc as CountryCode);
      expect(meta.title).toBeDefined();
    }
  });
});

describe('webApplicationSchema', () => {
  it('returns a schema.org WebApplication object', () => {
    const schema = webApplicationSchema('us', 'Test App', 'Test desc');
    expect(schema['@type']).toBe('WebApplication');
    expect(schema.name).toBe('Test App');
    expect(schema.description).toBe('Test desc');
    expect(schema.url).toBe('https://reckoner.tools/us/mortgage-calculator');
  });
});

describe('faqSchema', () => {
  it('returns a FAQPage schema with mainEntity entries', () => {
    const schema = faqSchema([{ question: 'Q?', answer: 'A.' }]);
    expect(schema['@type']).toBe('FAQPage');
    expect(schema.mainEntity).toHaveLength(1);
    expect(schema.mainEntity[0].name).toBe('Q?');
  });
});

describe('breadcrumbSchema', () => {
  it('returns a BreadcrumbList with correct positions', () => {
    const schema = breadcrumbSchema([
      { name: 'Home', href: '/' },
      { name: 'Tools', href: '/tools' },
    ]);
    expect(schema['@type']).toBe('BreadcrumbList');
    expect(schema.itemListElement).toHaveLength(2);
    expect(schema.itemListElement[0].position).toBe(1);
    expect(schema.itemListElement[1].position).toBe(2);
    expect(schema.itemListElement[0].item).toBe('https://reckoner.tools/');
  });
});

describe('organizationSchema', () => {
  it('returns an Organization schema', () => {
    const schema = organizationSchema();
    expect(schema['@type']).toBe('Organization');
    expect(schema.name).toBe('Reckoner');
  });
});

describe('datasetSchema', () => {
  it('returns a Dataset schema', () => {
    const schema = datasetSchema();
    expect(schema['@type']).toBe('Dataset');
    expect(schema.url).toBe('https://reckoner.tools/methodology');
  });
});

describe('jsonLdScript', () => {
  it('serializes data as JSON string', () => {
    const result = jsonLdScript({ '@type': 'Thing' });
    expect(result).toBe('{"@type":"Thing"}');
  });
  it('handles arrays', () => {
    const result = jsonLdScript([{ '@type': 'Thing' }]);
    expect(result).toBe('[{"@type":"Thing"}]');
  });
});

describe('getMortgageSitemapEntries', () => {
  it('returns 12 entries (one per country)', () => {
    expect(getMortgageSitemapEntries()).toHaveLength(12);
  });
  it('us entry has priority 1.0', () => {
    const entry = getMortgageSitemapEntries().find(
      (e) => e.url === 'https://reckoner.tools/us/mortgage-calculator',
    );
    expect(entry?.priority).toBe(1.0);
  });
  it('non-us entries have priority 0.9', () => {
    const entries = getMortgageSitemapEntries().filter(
      (e) => e.url !== 'https://reckoner.tools/us/mortgage-calculator',
    );
    for (const entry of entries) {
      expect(entry.priority).toBe(0.9);
    }
  });
});

describe('getStaticSitemapEntries', () => {
  it('returns at least 6 entries', () => {
    expect(getStaticSitemapEntries().length).toBeGreaterThanOrEqual(6);
  });
  it('includes the homepage with priority 1.0', () => {
    const home = getStaticSitemapEntries().find((e) => e.url === 'https://reckoner.tools');
    expect(home?.priority).toBe(1.0);
  });
});
