import type { CountryCode } from './types.js';
import { getCanonical, getMortgagePath } from './hreflang.js';

const BASE = 'https://reckoner.tools';

export function webApplicationSchema(cc: CountryCode, name: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url: getCanonical(cc),
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    provider: organizationSchema(),
  };
}

export function faqSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}

export function breadcrumbSchema(items: Array<{ name: string; href: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(({ name, href }, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: `${BASE}${href}`,
    })),
  };
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Reckoner',
    url: BASE,
    description: 'Financial calculators that use your country\'s actual rules.',
  };
}

export function datasetSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Reckoner mortgage calculation methodology and test vectors',
    description: 'Amortization formulas, per-country compounding conventions, and worked examples validated against official central bank sources.',
    url: `${BASE}/methodology`,
    creator: organizationSchema(),
    license: `${BASE}/methodology`,
  };
}

/** Renders JSON-LD as a script tag string — insert into RSC with dangerouslySetInnerHTML */
export function jsonLdScript(data: Record<string, unknown> | Record<string, unknown>[]): string {
  return JSON.stringify(data);
}
