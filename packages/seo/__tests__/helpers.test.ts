import { describe, it, expect } from 'vitest';
import {
  getToolPath, getToolCanonical, getToolHreflang, getToolMetadata,
  getPropertySitemapEntries,
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
