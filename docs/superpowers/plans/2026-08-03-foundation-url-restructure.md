# Sub-project 1: URL Restructure & Navigation Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move all 5 property calculators from `/{cc}/slug` to `/{cc}/property/slug`, add permanent redirects from old paths, replace the single `PropertyNav` dropdown with three category dropdowns (Property ▾, Loans ▾, Savings ▾) in the header, add a per-country property hub page, and generalize the SEO package to support any tool path.

**Architecture:** Next.js permanent redirects in `next.config.ts` handle the old flat paths so existing links and search-engine indexes are preserved. Calculator page files move into a new `app/[cc]/property/` directory; the old files are deleted since the redirects make them unreachable. The header gains a generic `CategoryNav` component used three times — one per category. The SEO package grows generic `getToolPath`/`getToolHreflang`/`getToolCanonical`/`getToolMetadata` helpers that every page can use, replacing the current mortgage-only functions for new pages.

**Tech Stack:** Next.js 15 App Router, TypeScript strict mode, CSS custom properties (`var(--color-*)`), Vitest 2 for the SEO package, pnpm workspaces / Turborepo.

## Global Constraints

- All colours via `var(--color-*)` CSS custom properties — no hardcoded hex values.
- No new `npm`/`pnpm` dependencies outside `vitest`/`@vitest/coverage-v8` for the SEO test setup (already in other packages in the monorepo).
- Relative imports from page files must be updated when directory depth changes (`../../../src/` → `../../../../src/`).
- `currentTool` prop on `Header` must be the full sub-path after `/{cc}/`, e.g. `"property/mortgage-calculator"` so country-selector hrefs resolve correctly.
- `revalidate = 86400` and `dynamicParams = true` must remain on every calculator page.
- The three category dropdowns are: **Property** (5 active tools), **Loans** (4 tools, all `comingSoon: true`), **Savings** (5 tools, all `comingSoon: true`).
- Redirects are permanent (`permanent: true` = 308 status). The 5 old slugs are: `mortgage-calculator`, `stamp-duty`, `affordability`, `refinance`, `rent-vs-buy`.
- SEO test coverage threshold: 100% lines/functions/branches/statements on `src/**/*.ts` in `packages/seo`.

---

### Task 1: SEO package — generic path helpers, metadata, and sitemap

**Files:**
- Modify: `packages/seo/src/hreflang.ts`
- Modify: `packages/seo/src/metadata.ts`
- Modify: `packages/seo/src/sitemap.ts`
- Modify: `packages/seo/src/index.ts`
- Modify: `packages/seo/package.json` (add vitest + coverage devDeps + test script)
- Create: `packages/seo/vitest.config.ts`
- Create: `packages/seo/__tests__/helpers.test.ts`

**Interfaces:**
- Consumes: `CountryCode`, `COUNTRY_CODES`, `LOCALE_MAP` from existing `hreflang.ts`; `Metadata` from `next`
- Produces:
  - `getToolPath(cc: CountryCode, category: string, slug: string): string`
  - `getToolCanonical(cc: CountryCode, category: string, slug: string): string`
  - `getToolHreflang(cc: CountryCode, category: string, slug: string): HreflangEntry[]`
  - `getToolMetadata(cc: CountryCode, category: string, slug: string, title: string, description: string): Metadata`
  - `getPropertySitemapEntries(): SitemapEntry[]`

- [ ] **Step 1: Write failing tests for the new helpers**

Create `packages/seo/__tests__/helpers.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd packages/seo && pnpm test
```
Expected: "Cannot find module" or "is not a function" errors — the new exports don't exist yet.

- [ ] **Step 3: Add `vitest.config.ts` to the SEO package**

Create `packages/seo/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
    },
  },
});
```

- [ ] **Step 4: Add vitest devDeps and test script to `packages/seo/package.json`**

Replace the `"scripts"` and `"devDependencies"` sections in `packages/seo/package.json`:

```json
{
  "name": "@reckoner/seo",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "test": "vitest run --coverage",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@reckoner/config": "workspace:*",
    "@vitest/coverage-v8": "^2",
    "next": "^15",
    "typescript": "^5",
    "vitest": "^2"
  }
}
```

Then run:
```bash
cd /path/to/repo && pnpm install
```

- [ ] **Step 5: Add `getToolPath`, `getToolCanonical`, `getToolHreflang` to `packages/seo/src/hreflang.ts`**

Append to the existing file **after** the existing `getCanonical` export:

```typescript
export function getToolPath(cc: CountryCode, category: string, slug: string): string {
  return `/${cc}/${category}/${slug}`;
}

export function getToolCanonical(cc: CountryCode, category: string, slug: string): string {
  return `${BASE}${getToolPath(cc, category, slug)}`;
}

export function getToolHreflang(
  current: CountryCode,
  category: string,
  slug: string,
): HreflangEntry[] {
  const entries: HreflangEntry[] = COUNTRY_CODES.map((cc) => ({
    hrefLang: LOCALE_MAP[cc],
    href: `${BASE}${getToolPath(cc, category, slug)}`,
  }));
  entries.push({ hrefLang: 'x-default', href: `${BASE}${getToolPath('us', category, slug)}` });
  return entries;
}
```

- [ ] **Step 6: Add `getToolMetadata` to `packages/seo/src/metadata.ts`**

Append to the existing file **after** the existing `getMortgageMetadata` export:

```typescript
import { getToolCanonical, getToolHreflang } from './hreflang';

export function getToolMetadata(
  cc: CountryCode,
  category: string,
  slug: string,
  title: string,
  description: string,
): Metadata {
  const hreflang = getToolHreflang(cc, category, slug);
  return {
    title,
    description,
    alternates: {
      canonical: getToolCanonical(cc, category, slug),
      languages: Object.fromEntries(
        hreflang.map(({ hrefLang, href }) => [hrefLang, href]),
      ),
    },
    robots: { index: true, follow: true },
  };
}
```

Note: `getToolHreflang` is already imported in `metadata.ts` after this addition; if `metadata.ts` already imports from `./hreflang`, add `getToolCanonical` and `getToolHreflang` to that existing import line.

- [ ] **Step 7: Add `getPropertySitemapEntries` to `packages/seo/src/sitemap.ts`**

Append to the existing file **after** the existing `getStaticSitemapEntries` export:

```typescript
const PROPERTY_SLUGS = [
  'mortgage-calculator',
  'stamp-duty',
  'affordability',
  'refinance',
  'rent-vs-buy',
] as const;

export function getPropertySitemapEntries(): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  for (const cc of COUNTRY_CODES) {
    for (const slug of PROPERTY_SLUGS) {
      entries.push({
        url: `${BASE}/${cc}/property/${slug}`,
        changeFrequency: 'weekly',
        priority: cc === 'us' && slug === 'mortgage-calculator' ? 1.0 : 0.9,
      });
    }
  }
  return entries;
}
```

- [ ] **Step 8: Export new functions from `packages/seo/src/index.ts`**

Add to the existing exports:

```typescript
export { getToolPath, getToolCanonical, getToolHreflang } from './hreflang';
export { getToolMetadata } from './metadata';
export { getPropertySitemapEntries } from './sitemap';
```

- [ ] **Step 9: Run tests and verify they pass**

```bash
cd packages/seo && pnpm test
```
Expected: all tests PASS with 100% coverage.

- [ ] **Step 10: Typecheck the package**

```bash
cd packages/seo && pnpm typecheck
```
Expected: no errors.

- [ ] **Step 11: Commit**

```bash
git add packages/seo/
git commit -m "feat(seo): add generic getToolPath/Hreflang/Metadata + getPropertySitemapEntries"
```

---

### Task 2: Permanent redirects + property page migration

**Files:**
- Modify: `apps/web/next.config.ts`
- Create: `apps/web/app/[cc]/property/mortgage-calculator/page.tsx`
- Create: `apps/web/app/[cc]/property/stamp-duty/page.tsx`
- Create: `apps/web/app/[cc]/property/affordability/page.tsx`
- Create: `apps/web/app/[cc]/property/refinance/page.tsx`
- Create: `apps/web/app/[cc]/property/rent-vs-buy/page.tsx`
- Delete: `apps/web/app/[cc]/mortgage-calculator/page.tsx`
- Delete: `apps/web/app/[cc]/stamp-duty/page.tsx`
- Delete: `apps/web/app/[cc]/affordability/page.tsx`
- Delete: `apps/web/app/[cc]/refinance/page.tsx`
- Delete: `apps/web/app/[cc]/rent-vs-buy/page.tsx`

**Interfaces:**
- Consumes: `getToolMetadata` from `@reckoner/seo` (Task 1)
- Produces: 5 new calculator pages at `/{cc}/property/{slug}` routes

- [ ] **Step 1: Add redirects to `apps/web/next.config.ts`**

Add an `async redirects()` method to the existing config object. The final `next.config.ts`:

```typescript
import type { NextConfig } from 'next';

const PROPERTY_SLUGS = [
  'mortgage-calculator',
  'stamp-duty',
  'affordability',
  'refinance',
  'rent-vs-buy',
] as const;

const config: NextConfig = {
  webpack(webpackConfig) {
    webpackConfig.resolve = webpackConfig.resolve ?? {};
    webpackConfig.resolve.extensionAlias = {
      '.js': ['.tsx', '.ts', '.js'],
      '.jsx': ['.tsx', '.jsx'],
    };
    return webpackConfig;
  },
  experimental: {
    turbo: {
      resolveExtensions: ['.tsx', '.ts', '.jsx', '.js'],
    },
  },
  async redirects() {
    return PROPERTY_SLUGS.map((slug) => ({
      source: `/:cc/${slug}`,
      destination: `/:cc/property/${slug}`,
      permanent: true,
    }));
  },
  async headers() {
    return [
      {
        source: '/embed/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          { key: 'Content-Security-Policy', value: 'frame-ancestors *;' },
        ],
      },
    ];
  },
};

export default config;
```

- [ ] **Step 2: Create directory structure**

```bash
mkdir -p "apps/web/app/[cc]/property/mortgage-calculator"
mkdir -p "apps/web/app/[cc]/property/stamp-duty"
mkdir -p "apps/web/app/[cc]/property/affordability"
mkdir -p "apps/web/app/[cc]/property/refinance"
mkdir -p "apps/web/app/[cc]/property/rent-vs-buy"
```

- [ ] **Step 3: Create `apps/web/app/[cc]/property/mortgage-calculator/page.tsx`**

Copy the entire content of `apps/web/app/[cc]/mortgage-calculator/page.tsx`, then make two changes:
1. Change every `'../../../src/` import prefix to `'../../../../src/`
2. Change `currentTool` prop on `<Header>` from (it doesn't have one currently) — add `currentTool="property/mortgage-calculator"` to the Header JSX element.

The updated Header line in the mortgage page becomes:
```tsx
<Header currentCountry={country} allCountries={allCountries} currentTool="property/mortgage-calculator" />
```

All import lines that were `'../../../src/components/Header'` etc. become `'../../../../src/components/Header'`.

After creating the file, also update `generateMetadata` to use `getToolMetadata`:
```tsx
export async function generateMetadata({ params }: { params: Promise<{ cc: string }> }): Promise<Metadata> {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) return {};
  const country = getCountry(cc as CountryCode);
  const h1 = COUNTRY_H1[cc] ?? 'Mortgage Calculator';
  return getToolMetadata(
    cc as CountryCode,
    'property',
    'mortgage-calculator',
    TITLES[cc as CountryCode] ?? `${h1} | Reckoner`,
    DESCRIPTIONS[cc as CountryCode] ?? '',
  );
}
```

Where `TITLES` and `DESCRIPTIONS` are the existing records already in the mortgage page (keep them there — do not delete them).

Import `getToolMetadata` by adding it to the existing `@reckoner/seo` import line:
```tsx
import { webApplicationSchema, faqSchema, breadcrumbSchema, jsonLdScript, getToolMetadata } from '@reckoner/seo';
```

Remove `getMortgageMetadata` from that import since it's replaced by `getToolMetadata`.

- [ ] **Step 4: Create `apps/web/app/[cc]/property/stamp-duty/page.tsx`**

Copy the entire content of `apps/web/app/[cc]/stamp-duty/page.tsx` and make these changes:

1. Change `'../../../src/` → `'../../../../src/` in all import lines.
2. Add `getToolMetadata` to the `@reckoner/seo` import (or add that import if it doesn't exist yet on the stamp-duty page).
3. Replace `generateMetadata` body with:

```tsx
export async function generateMetadata({ params }: { params: Promise<{ cc: string }> }): Promise<Metadata> {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) return {};
  const country = getCountry(cc as CountryCode);
  const h1 = H1[cc] ?? 'Stamp Duty Calculator';
  return getToolMetadata(
    cc as CountryCode,
    'property',
    'stamp-duty',
    `${h1} | Reckoner`,
    `Calculate stamp duty or transfer tax for a property purchase in ${country.code.toUpperCase()}. Free, sourced from official government rates.`,
  );
}
```

4. Update `currentTool` on `<Header>` to `currentTool="property/stamp-duty"`.

- [ ] **Step 5: Create `apps/web/app/[cc]/property/affordability/page.tsx`**

Copy the entire content of `apps/web/app/[cc]/affordability/page.tsx` and make these changes:

1. Change `'../../../src/` → `'../../../../src/` in all import lines.
2. Add `getToolMetadata` import from `@reckoner/seo`.
3. Replace `generateMetadata` body with:

```tsx
export async function generateMetadata({ params }: { params: Promise<{ cc: string }> }): Promise<Metadata> {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) return {};
  const country = getCountry(cc as CountryCode);
  const h1 = COUNTRY_H1[cc] ?? 'Affordability Calculator';
  return getToolMetadata(
    cc as CountryCode,
    'property',
    'affordability',
    `${h1} | Reckoner`,
    `Calculate how much you can borrow in ${country.code.toUpperCase()} using official affordability rules. Free, no signup.`,
  );
}
```

4. Update `currentTool` on `<Header>` to `currentTool="property/affordability"`.

- [ ] **Step 6: Create `apps/web/app/[cc]/property/refinance/page.tsx`**

Copy the entire content of `apps/web/app/[cc]/refinance/page.tsx` and make these changes:

1. Change `'../../../src/` → `'../../../../src/` in all import lines.
2. Add `getToolMetadata` import from `@reckoner/seo`.
3. Replace `generateMetadata` body with:

```tsx
export async function generateMetadata({ params }: { params: Promise<{ cc: string }> }): Promise<Metadata> {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) return {};
  const country = getCountry(cc as CountryCode);
  const h1 = COUNTRY_H1[cc] ?? 'Refinance Break-Even Calculator';
  return getToolMetadata(
    cc as CountryCode,
    'property',
    'refinance',
    `${h1} | Reckoner`,
    `Calculate how many months it takes to recover refinancing costs through lower monthly payments in ${country.code.toUpperCase()}. Free, no signup.`,
  );
}
```

4. Update `currentTool` on `<Header>` to `currentTool="property/refinance"`.

- [ ] **Step 7: Create `apps/web/app/[cc]/property/rent-vs-buy/page.tsx`**

Copy the entire content of `apps/web/app/[cc]/rent-vs-buy/page.tsx` and make these changes:

1. Change `'../../../src/` → `'../../../../src/` in all import lines.
2. Add `getToolMetadata` import from `@reckoner/seo`.
3. Replace `generateMetadata` body with:

```tsx
export async function generateMetadata({ params }: { params: Promise<{ cc: string }> }): Promise<Metadata> {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) return {};
  const country = getCountry(cc as CountryCode);
  return getToolMetadata(
    cc as CountryCode,
    'property',
    'rent-vs-buy',
    `Rent vs Buy Calculator ${country.code.toUpperCase()} | Reckoner`,
    `Compare the 10-year financial outcome of renting versus buying a home in ${country.code.toUpperCase()}. Free, no signup.`,
  );
}
```

4. Update `currentTool` on `<Header>` to `currentTool="property/rent-vs-buy"`.

- [ ] **Step 8: Delete the old flat-path page files**

```bash
rm "apps/web/app/[cc]/mortgage-calculator/page.tsx"
rm "apps/web/app/[cc]/stamp-duty/page.tsx"
rm "apps/web/app/[cc]/affordability/page.tsx"
rm "apps/web/app/[cc]/refinance/page.tsx"
rm "apps/web/app/[cc]/rent-vs-buy/page.tsx"
rmdir "apps/web/app/[cc]/mortgage-calculator"
rmdir "apps/web/app/[cc]/stamp-duty"
rmdir "apps/web/app/[cc]/affordability"
rmdir "apps/web/app/[cc]/refinance"
rmdir "apps/web/app/[cc]/rent-vs-buy"
```

- [ ] **Step 9: Typecheck the web app**

```bash
cd apps/web && pnpm typecheck
```
Expected: no errors.

- [ ] **Step 10: Start the dev server and verify manually**

```bash
cd apps/web && pnpm dev
```

Visit the following and confirm each works:
- `http://localhost:3000/us/property/mortgage-calculator` — mortgage calculator loads
- `http://localhost:3000/us/property/stamp-duty` — stamp duty calculator loads
- `http://localhost:3000/us/property/affordability` — affordability calculator loads
- `http://localhost:3000/us/property/refinance` — refinance calculator loads
- `http://localhost:3000/us/property/rent-vs-buy` — rent vs buy calculator loads

Then verify old paths redirect (curl returns 308):
```bash
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/us/mortgage-calculator
```
Expected output: `308 http://localhost:3000/us/property/mortgage-calculator`

- [ ] **Step 11: Commit**

```bash
git add apps/web/next.config.ts "apps/web/app/[cc]/property/"
git commit -m "feat: move property calculators to /{cc}/property/ paths with 308 redirects"
```

---

### Task 3: CategoryNav component + three-dropdown Header redesign

**Files:**
- Create: `apps/web/src/components/CategoryNav.tsx`
- Modify: `apps/web/src/components/Header.tsx`
- Delete: `apps/web/src/components/PropertyNav.tsx`

**Interfaces:**
- Consumes: `currentCc: string` from Header props; `currentTool?: string` (unchanged, now receives e.g. `"property/mortgage-calculator"`)
- Produces: `<CategoryNav label={string} categoryPath={string} tools={NavTool[]} currentCc={string} />` used in Header

- [ ] **Step 1: Create `apps/web/src/components/CategoryNav.tsx`**

```tsx
'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export interface NavTool {
  slug: string;
  label: string;
  comingSoon?: boolean;
}

interface CategoryNavProps {
  label: string;
  categoryPath: string;
  tools: NavTool[];
  currentCc: string;
}

export function CategoryNav({ label, categoryPath, tools, currentCc }: CategoryNavProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          fontSize: 14,
          color: 'var(--color-ink-mid)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: 0,
        }}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {label}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 8,
            minWidth: 220,
            background: 'var(--color-canvas)',
            border: '1px solid var(--color-hairline)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            zIndex: 50,
          }}
        >
          {tools.map((tool) =>
            tool.comingSoon ? (
              <span
                key={tool.slug}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 16px',
                  fontSize: 14,
                  color: 'var(--color-ink-mute)',
                  cursor: 'default',
                  userSelect: 'none',
                }}
              >
                {tool.label}
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--color-ink-mute)',
                  }}
                >
                  Soon
                </span>
              </span>
            ) : (
              <Link
                key={tool.slug}
                href={`/${currentCc}/${categoryPath}/${tool.slug}`}
                onClick={() => setOpen(false)}
                style={{
                  display: 'block',
                  padding: '10px 16px',
                  fontSize: 14,
                  color: 'var(--color-ink)',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {tool.label}
              </Link>
            ),
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update `apps/web/src/components/Header.tsx`**

Replace the entire file with the following. The key changes are: import `CategoryNav` instead of `PropertyNav`; define three tool lists; render three `<CategoryNav>` elements in place of the single `<PropertyNav>`.

```tsx
import type { CountryData } from '@reckoner/finance-data';
import { CountrySelector } from '@reckoner/ui';
import type { Country } from '@reckoner/ui';
import Link from 'next/link';
import { CategoryNav } from './CategoryNav';

const FLAG_MAP: Record<string, string> = {
  us: '🇺🇸', uk: '🇬🇧', ca: '🇨🇦', au: '🇦🇺', ie: '🇮🇪',
  de: '🇩🇪', nl: '🇳🇱', nz: '🇳🇿', fr: '🇫🇷', es: '🇪🇸',
  sg: '🇸🇬', in: '🇮🇳',
};

const NAME_MAP: Record<string, string> = {
  us: 'United States', uk: 'United Kingdom', ca: 'Canada', au: 'Australia',
  ie: 'Ireland', de: 'Germany', nl: 'Netherlands', nz: 'New Zealand',
  fr: 'France', es: 'Spain', sg: 'Singapore', in: 'India',
};

const PROPERTY_TOOLS = [
  { slug: 'mortgage-calculator', label: 'Mortgage Calculator' },
  { slug: 'stamp-duty', label: 'Stamp Duty' },
  { slug: 'affordability', label: 'Affordability' },
  { slug: 'refinance', label: 'Refinance Break-Even' },
  { slug: 'rent-vs-buy', label: 'Rent vs Buy' },
];

const LOANS_TOOLS = [
  { slug: 'personal-loan', label: 'Personal Loan', comingSoon: true },
  { slug: 'auto-loan', label: 'Auto Loan', comingSoon: true },
  { slug: 'credit-card-payoff', label: 'Credit Card Payoff', comingSoon: true },
  { slug: 'debt-strategy', label: 'Debt Strategy', comingSoon: true },
];

const SAVINGS_TOOLS = [
  { slug: 'compound-interest', label: 'Compound Interest', comingSoon: true },
  { slug: 'retirement', label: 'Retirement Projection', comingSoon: true },
  { slug: 'savings-goal', label: 'Savings Goal', comingSoon: true },
  { slug: 'fire-number', label: 'FIRE Number', comingSoon: true },
  { slug: 'investment-return', label: 'Investment Return / CAGR', comingSoon: true },
];

interface HeaderProps {
  currentCountry?: CountryData;
  allCountries: CountryData[];
  currentTool?: string;
}

export function Header({ currentCountry, allCountries, currentTool = 'property/mortgage-calculator' }: HeaderProps) {
  const countries: Country[] = allCountries.map((c) => ({
    code: c.code,
    name: NAME_MAP[c.code] ?? c.code.toUpperCase(),
    currency: c.currency,
    flag: FLAG_MAP[c.code] ?? '🌍',
    href: `/${c.code}/${currentTool}`,
    tier: c.tier,
  }));

  const current: Country = currentCountry
    ? {
        code: currentCountry.code,
        name: NAME_MAP[currentCountry.code] ?? currentCountry.code.toUpperCase(),
        currency: currentCountry.currency,
        flag: FLAG_MAP[currentCountry.code] ?? '🌍',
        href: `/${currentCountry.code}/${currentTool}`,
        tier: currentCountry.tier,
      }
    : countries[0]!;

  return (
    <header
      style={{
        height: 56,
        borderBottom: '1px solid var(--color-hairline)',
        display: 'flex',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        background: 'var(--color-canvas)',
        zIndex: 40,
        transition: 'background 200ms, border-color 200ms',
      }}
    >
      <a href="#main" className="skip-nav">Skip to calculator</a>
      <div
        style={{
          width: '100%',
          maxWidth: 1160,
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <Link
            href="/"
            style={{
              textDecoration: 'none',
              color: 'var(--color-ink)',
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            reckoner.
          </Link>
          <CategoryNav
            label="Property"
            categoryPath="property"
            tools={PROPERTY_TOOLS}
            currentCc={current.code}
          />
          <CategoryNav
            label="Loans"
            categoryPath="loans"
            tools={LOANS_TOOLS}
            currentCc={current.code}
          />
          <CategoryNav
            label="Savings"
            categoryPath="savings"
            tools={SAVINGS_TOOLS}
            currentCc={current.code}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <CountrySelector current={current} countries={countries} />
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Delete the old PropertyNav file**

```bash
rm apps/web/src/components/PropertyNav.tsx
```

- [ ] **Step 4: Typecheck**

```bash
cd apps/web && pnpm typecheck
```
Expected: no errors (PropertyNav import is gone; CategoryNav compiles cleanly).

- [ ] **Step 5: Visual check in dev server**

```bash
cd apps/web && pnpm dev
```

Visit `http://localhost:3000/us/property/mortgage-calculator`. Confirm:
- Header shows three dropdown buttons: "Property ▾", "Loans ▾", "Savings ▾"
- Clicking "Property ▾" opens a dropdown with 5 active links
- Clicking "Loans ▾" opens a dropdown with 4 items showing "Soon" badge, not clickable
- Clicking "Savings ▾" opens a dropdown with 5 items showing "Soon" badge
- Clicking outside any open dropdown closes it
- Country selector still changes country and stays on the same calculator path

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/CategoryNav.tsx apps/web/src/components/Header.tsx
git rm apps/web/src/components/PropertyNav.tsx
git commit -m "feat: replace PropertyNav with three-dropdown CategoryNav (Property/Loans/Savings)"
```

---

### Task 4: Property hub page per country + homepage link update

**Files:**
- Create: `apps/web/app/[cc]/property/page.tsx`
- Modify: `apps/web/app/page.tsx` (homepage — update country card links)

**Interfaces:**
- Consumes: `getCountry`, `getAllCountries`, `COUNTRY_CODES` from `@reckoner/finance-data`; `getToolMetadata` from `@reckoner/seo` (Task 1); `Header`, `Footer` from components (Task 3)
- Produces: `/{cc}/property` route with a hub listing all 5 property calculators

- [ ] **Step 1: Create `apps/web/app/[cc]/property/page.tsx`**

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCountry, getAllCountries, COUNTRY_CODES } from '@reckoner/finance-data';
import type { CountryCode } from '@reckoner/finance-data';
import { Header } from '../../../src/components/Header';
import { Footer } from '../../../src/components/Footer';

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return COUNTRY_CODES.map((cc) => ({ cc }));
}

const NAME_MAP: Record<string, string> = {
  us: 'United States', uk: 'United Kingdom', ca: 'Canada', au: 'Australia',
  ie: 'Ireland', de: 'Germany', nl: 'Netherlands', nz: 'New Zealand',
  fr: 'France', es: 'Spain', sg: 'Singapore', in: 'India',
};

const TOOLS: Array<{ slug: string; label: string; description: string }> = [
  {
    slug: 'mortgage-calculator',
    label: 'Mortgage Calculator',
    description: 'Monthly payment, full amortisation schedule, and total interest. Uses your country\'s official compounding convention.',
  },
  {
    slug: 'stamp-duty',
    label: 'Stamp Duty / Transfer Tax',
    description: 'Progressive banding calculation using official government rates. Includes first-time buyer relief and surcharges where applicable.',
  },
  {
    slug: 'affordability',
    label: 'Affordability Calculator',
    description: 'Maximum borrowing under your country\'s regulatory limits — income multiples, LTV caps, or debt servicing ratios.',
  },
  {
    slug: 'refinance',
    label: 'Refinance Break-Even',
    description: 'How many months until a lower rate recovers your closing costs. Shows cumulative saving over the remaining term.',
  },
  {
    slug: 'rent-vs-buy',
    label: 'Rent vs Buy',
    description: 'Ten-year projection of the financial outcome of each option, accounting for equity build-up and deposit opportunity cost.',
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cc: string }>;
}): Promise<Metadata> {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) return {};
  const countryName = NAME_MAP[cc] ?? cc.toUpperCase();
  return {
    title: `Property Calculators for ${countryName} | Reckoner`,
    description: `Mortgage, stamp duty, affordability, refinance, and rent vs buy calculators for ${countryName}, each using official local rules. Free, no signup.`,
    alternates: { canonical: `https://reckoner.tools/${cc}/property` },
    robots: { index: true, follow: true },
  };
}

export default async function PropertyHubPage({
  params,
}: {
  params: Promise<{ cc: string }>;
}) {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) notFound();

  const country = getCountry(cc as CountryCode);
  const allCountries = getAllCountries();
  const countryName = NAME_MAP[cc] ?? cc.toUpperCase();

  return (
    <>
      <Header currentCountry={country} allCountries={allCountries} currentTool="property" />
      <main id="main">
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '64px 24px' }}>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 400,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              margin: '0 0 12px',
            }}
          >
            Property calculators for {countryName}
          </h1>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              margin: '0 0 48px',
              maxWidth: '60ch',
              color: 'var(--color-ink-deep)',
            }}
          >
            Each calculator applies {countryName}&apos;s actual rules — the compounding convention,
            regulatory limits, and official tax bands in force today.
          </p>

          <div style={{ display: 'grid', gap: 2 }}>
            {TOOLS.map((tool) => (
              <a
                key={tool.slug}
                href={`/${cc}/property/${tool.slug}`}
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  color: 'var(--color-ink)',
                  border: '1px solid var(--color-hairline)',
                  padding: '20px 24px',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = 'var(--color-surface)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = 'transparent')
                }
              >
                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
                  {tool.label}
                </div>
                <div style={{ fontSize: 14, color: 'var(--color-ink-mid)', lineHeight: 1.5 }}>
                  {tool.description}
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>
      <Footer countries={allCountries} currentCc={cc} />
    </>
  );
}
```

- [ ] **Step 2: Update homepage (`apps/web/app/page.tsx`) to link to new property paths**

In `apps/web/app/page.tsx`, there is a country grid where each card links to `/${c.code}/mortgage-calculator`. Change each card `href` to `/${c.code}/property/mortgage-calculator`.

The country card map currently reads:
```tsx
<a
  key={c.code}
  href={`/${c.code}/mortgage-calculator`}
  ...
>
```

Change it to:
```tsx
<a
  key={c.code}
  href={`/${c.code}/property/mortgage-calculator`}
  ...
>
```

Also update the span text from `Mortgage calculator` to stay as `Mortgage calculator` (no change needed there).

- [ ] **Step 3: Typecheck**

```bash
cd apps/web && pnpm typecheck
```
Expected: no errors.

- [ ] **Step 4: Visual check**

Start dev server and visit `http://localhost:3000/us/property`. Confirm:
- Heading shows "Property calculators for United States"
- Five tool cards are listed with descriptions
- Each card links to the correct `/us/property/{slug}` URL
- Country selector works: switching to UK goes to `/uk/property`
- Homepage country cards now link to `/us/property/mortgage-calculator`

- [ ] **Step 5: Commit**

```bash
git add "apps/web/app/[cc]/property/page.tsx" apps/web/app/page.tsx
git commit -m "feat: add per-country property hub page and update homepage links"
```

---

### Task 5: Footer links + sitemap update

**Files:**
- Modify: `apps/web/src/components/Footer.tsx`
- Modify: `apps/web/app/sitemap.ts`

**Interfaces:**
- Consumes: `getPropertySitemapEntries` from `@reckoner/seo` (Task 1)
- Produces: Footer with correct new tool paths; sitemap with property tool URLs under `/property/`

- [ ] **Step 1: Update `apps/web/src/components/Footer.tsx`**

The Footer currently has a "Calculators" section with links like `/${cc}/mortgage-calculator`. Change all five calculator links to the new `/property/` paths.

Find the JSX block in Footer with the 5 `<a>` elements and update their hrefs:

```tsx
// Old
<a href={`/${cc}/mortgage-calculator`} style={linkStyle}>Mortgage calculator</a>
<a href={`/${cc}/stamp-duty`} style={linkStyle}>Stamp duty calculator</a>
<a href={`/${cc}/affordability`} style={linkStyle}>Affordability calculator</a>
<a href={`/${cc}/refinance`} style={linkStyle}>Refinance calculator</a>
<a href={`/${cc}/rent-vs-buy`} style={linkStyle}>Rent vs buy calculator</a>

// New
<a href={`/${cc}/property/mortgage-calculator`} style={linkStyle}>Mortgage calculator</a>
<a href={`/${cc}/property/stamp-duty`} style={linkStyle}>Stamp duty calculator</a>
<a href={`/${cc}/property/affordability`} style={linkStyle}>Affordability calculator</a>
<a href={`/${cc}/property/refinance`} style={linkStyle}>Refinance calculator</a>
<a href={`/${cc}/property/rent-vs-buy`} style={linkStyle}>Rent vs buy calculator</a>
```

Also, the Countries column links to `/${c.code}/mortgage-calculator`. Update that to `/${c.code}/property/mortgage-calculator`:

```tsx
// Old
<a key={c.code} href={`/${c.code}/mortgage-calculator`} style={linkStyle}>
// New
<a key={c.code} href={`/${c.code}/property/mortgage-calculator`} style={linkStyle}>
```

- [ ] **Step 2: Update `apps/web/app/sitemap.ts`**

Replace the current file content with:

```typescript
import type { MetadataRoute } from 'next';
import { getStaticSitemapEntries, getPropertySitemapEntries } from '@reckoner/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...getStaticSitemapEntries(),
    ...getPropertySitemapEntries(),
  ];
}
```

This replaces `getMortgageSitemapEntries()` with `getPropertySitemapEntries()` which covers all 5 property tools × 12 countries = 60 entries (vs. 12 entries before).

- [ ] **Step 3: Typecheck**

```bash
cd apps/web && pnpm typecheck
```
Expected: no errors.

- [ ] **Step 4: Verify sitemap output**

Start the dev server and visit `http://localhost:3000/sitemap.xml`. Confirm:
- Contains entries for `/us/property/mortgage-calculator`, `/us/property/stamp-duty`, etc.
- Does NOT contain the old flat paths like `/us/mortgage-calculator` (they're redirect targets, not canonical pages)
- Static entries (homepage, methodology, about, etc.) are still present

- [ ] **Step 5: Full build check**

```bash
cd apps/web && pnpm build
```
Expected: build completes without errors. Static pages are generated for all `/{cc}/property/{slug}` routes.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/Footer.tsx apps/web/app/sitemap.ts
git commit -m "feat: update footer links and sitemap to use new /property/ paths"
```
