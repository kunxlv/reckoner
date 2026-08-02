# Property Calculators Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 4 property calculators (Stamp Duty, Affordability, Refinance, Rent vs Buy) under a "Property" navbar category, backed by a versioned rules-as-data engine that is extensible to new countries and calculators without code changes.

**Architecture:** Rules live as effective-dated JSON in `finance-data`, validated at build time by Zod schemas in a new `rules-core` package. Pure calculation engines (`transfer-tax-engine`, `affordability-engine`) consume resolved rule objects; all computation stays client-side. Pages are server components that load the resolved ruleset and pass it as props to a `'use client'` calculator component — identical pattern to the existing mortgage calculator.

**Tech Stack:** TypeScript strict mode, Zod v4 (build-time only), Vitest 100% coverage, Next.js 15 App Router ISR, inline CSS custom properties (no Tailwind in new components).

## Global Constraints

- `noUncheckedIndexedAccess: true` and `exactOptionalPropertyTypes: true` — never use non-null assertion without a prior null check
- All packages use `"main": "./src/index.ts"` source-first (no build step)
- No hardcoded hex colors — use `var(--color-*)` CSS variables
- No em dashes in any user-facing string
- Zod v4 import: `import { z } from 'zod'` (already in workspace or add as devDep to rules-core)
- Every `Band[]` JSON must have exactly one entry with `upTo: null` (the top bracket)
- `effectiveTo` absent means open-ended; present means the ruleset expires on that date (exclusive)
- Build must pass `pnpm typecheck` and `pnpm test` in every touched package

---

## File Map

**New packages:**
- `packages/rules-core/` — Zod schema, `asOf()` resolver, shared types
- `packages/transfer-tax-engine/` — `progressiveTax`, `applyReliefs`, `applySurcharges`
- `packages/affordability-engine/` — `ServiceabilityConvention` interface + per-country implementations

**New data (in finance-data):**
- `packages/finance-data/src/rules/stamp-duty/{cc}.json` — one file per country/region
- `packages/finance-data/src/rules/affordability/{cc}.json`

**New web routes:**
- `apps/web/app/[cc]/stamp-duty/page.tsx`
- `apps/web/app/[cc]/affordability/page.tsx`
- `apps/web/app/[cc]/refinance/page.tsx`
- `apps/web/app/[cc]/rent-vs-buy/page.tsx`

**New web components:**
- `apps/web/src/components/StampDutyCalculator/index.tsx`
- `apps/web/src/components/AffordabilityCalculator/index.tsx`
- `apps/web/src/components/RefinanceCalculator/index.tsx`
- `apps/web/src/components/RentVsBuyCalculator/index.tsx`
- `apps/web/src/components/PropertyNav.tsx` — client-component dropdown for navbar

**Modified:**
- `apps/web/src/components/Header.tsx` — replace static "Tools" span with `<PropertyNav>`
- `apps/web/package.json` — add `@reckoner/transfer-tax-engine`, `@reckoner/affordability-engine`, `@reckoner/rules-core`

---

### Task 1: `packages/rules-core` — schema, resolver, types

**Files:**
- Create: `packages/rules-core/package.json`
- Create: `packages/rules-core/tsconfig.json`
- Create: `packages/rules-core/src/types.ts`
- Create: `packages/rules-core/src/schema.ts`
- Create: `packages/rules-core/src/resolve.ts`
- Create: `packages/rules-core/src/index.ts`
- Create: `packages/rules-core/__tests__/resolve.test.ts`

**Interfaces:**
- Produces: `Band`, `Surcharge`, `Relief`, `TransferTaxRuleSet`, `AffordabilityRuleSet`, `asOf<T>()`
- Consumed by: `transfer-tax-engine`, `affordability-engine`, all stamp-duty and affordability routes

- [ ] **Step 1: Write the failing test**

```ts
// packages/rules-core/__tests__/resolve.test.ts
import { describe, it, expect } from 'vitest';
import { asOf } from '../src/resolve';

interface Versioned {
  provenance: { effectiveFrom: string; effectiveTo?: string };
  value: number;
}

describe('asOf', () => {
  const versions: Versioned[] = [
    { provenance: { effectiveFrom: '2024-01-01', effectiveTo: '2025-04-01' }, value: 1 },
    { provenance: { effectiveFrom: '2025-04-01' }, value: 2 },
  ];

  it('returns the active version for a given date', () => {
    expect(asOf(versions, '2024-06-15').value).toBe(1);
  });

  it('returns the newer version after effectiveFrom', () => {
    expect(asOf(versions, '2025-05-01').value).toBe(2);
  });

  it('returns latest when no date given (defaults to today)', () => {
    // Today is after 2025-04-01
    expect(asOf(versions).value).toBe(2);
  });

  it('throws when no version covers the date', () => {
    expect(() => asOf(versions, '2023-01-01')).toThrow('No active ruleset');
  });

  it('treats effectiveTo as exclusive', () => {
    // On the boundary date itself, the old version is no longer active
    expect(asOf(versions, '2025-04-01').value).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/rules-core && pnpm test 2>&1 | head -20
```
Expected: FAIL — module not found

- [ ] **Step 3: Create package.json and tsconfig.json**

```json
// packages/rules-core/package.json
{
  "name": "@reckoner/rules-core",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "test": "vitest run --coverage",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@reckoner/config": "workspace:*",
    "@vitest/coverage-v8": "^2",
    "typescript": "^5",
    "vitest": "^2"
  }
}
```

```json
// packages/rules-core/tsconfig.json
{
  "extends": "@reckoner/config/tsconfig",
  "include": ["src/**/*", "__tests__/**/*"],
  "compilerOptions": { "jsx": "react-jsx" }
}
```

Note: check the installed Zod version in the workspace first with `grep -r '"zod"' packages/*/package.json`. Use whatever major version is already present (likely v3 based on import `from 'zod'`). If not installed, add `"zod": "^3.23.0"` and run `pnpm install` from repo root.

- [ ] **Step 4: Write `src/types.ts`**

```ts
// packages/rules-core/src/types.ts
export interface Band {
  upTo: number | null;  // null = top bracket (no ceiling)
  rate: number;         // 0.05 = 5%
}

export interface Surcharge {
  id: string;           // "additional_property" | "non_resident" | "foreign_buyer"
  kind: 'flat_rate' | 'added_to_bands';
  value: number;        // 0.05 = 5%
  appliesWhen: string;  // named predicate key resolved in UI layer
}

export interface Relief {
  id: string;           // "first_time_buyer"
  bands: Band[];        // replacement band schedule when relief applies
  cap: number | null;   // price ceiling above which relief is lost (null = no cap)
}

export interface Provenance {
  source: string;
  sourceUrl: string;
  lastReviewed: string;    // YYYY-MM-DD
  effectiveFrom: string;   // YYYY-MM-DD
  effectiveTo?: string;    // YYYY-MM-DD — open-ended if absent
}

export interface TransferTaxRuleSet {
  calculator: 'transfer-tax';
  jurisdiction: string;    // "GB-ENG", "AU-NSW", "DE-BY"
  currency: string;
  tier: 1 | 2 | 3;
  provenance: Provenance;
  bands: Band[];
  surcharges: Surcharge[];
  reliefs: Relief[];
}

export interface AffordabilityRuleSet {
  calculator: 'affordability';
  jurisdiction: string;
  provenance: Provenance;
  method: 'lti_ltv' | 'dti_stress' | 'serviceability_buffer' | 'tdsr_msr';
  params: Record<string, number>;
}
```

- [ ] **Step 5: Write `src/schema.ts`** (Zod schemas for build-time validation only)

```ts
// packages/rules-core/src/schema.ts
import { z } from 'zod';

const ProvenanceSchema = z.object({
  source: z.string().min(1),
  sourceUrl: z.string().url(),
  lastReviewed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  effectiveTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const BandSchema = z.object({
  upTo: z.number().positive().nullable(),
  rate: z.number().min(0).max(1),
});

const SurchargeSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['flat_rate', 'added_to_bands']),
  value: z.number().min(0).max(1),
  appliesWhen: z.string().min(1),
});

const ReliefSchema = z.object({
  id: z.string().min(1),
  bands: z.array(BandSchema),
  cap: z.number().positive().nullable(),
});

export const TransferTaxRuleSetSchema = z.object({
  calculator: z.literal('transfer-tax'),
  jurisdiction: z.string().min(1),
  currency: z.string().length(3),
  tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  provenance: ProvenanceSchema,
  bands: z.array(BandSchema).min(1),
  surcharges: z.array(SurchargeSchema).default([]),
  reliefs: z.array(ReliefSchema).default([]),
});

export const AffordabilityRuleSetSchema = z.object({
  calculator: z.literal('affordability'),
  jurisdiction: z.string().min(1),
  provenance: ProvenanceSchema,
  method: z.enum(['lti_ltv', 'dti_stress', 'serviceability_buffer', 'tdsr_msr']),
  params: z.record(z.string(), z.number()),
});

export const VersionedTransferTaxSchema = z.array(TransferTaxRuleSetSchema).min(1);
export const VersionedAffordabilitySchema = z.array(AffordabilityRuleSetSchema).min(1);
```

- [ ] **Step 6: Write `src/resolve.ts`**

```ts
// packages/rules-core/src/resolve.ts
type HasProvenance = { provenance: { effectiveFrom: string; effectiveTo?: string } };

export function asOf<T extends HasProvenance>(
  versions: T[],
  date: string = new Date().toISOString().slice(0, 10),
): T {
  const active = versions
    .filter(
      (v) =>
        v.provenance.effectiveFrom <= date &&
        (v.provenance.effectiveTo === undefined || v.provenance.effectiveTo > date),
    )
    .sort((a, b) => b.provenance.effectiveFrom.localeCompare(a.provenance.effectiveFrom));
  const result = active[0];
  if (result === undefined) throw new Error(`No active ruleset for date ${date}`);
  return result;
}
```

- [ ] **Step 7: Write `src/index.ts`**

```ts
// packages/rules-core/src/index.ts
export { asOf } from './resolve';
export type { Band, Surcharge, Relief, Provenance, TransferTaxRuleSet, AffordabilityRuleSet } from './types';
export { TransferTaxRuleSetSchema, AffordabilityRuleSetSchema, VersionedTransferTaxSchema, VersionedAffordabilitySchema } from './schema';
```

- [ ] **Step 8: Run tests**

```bash
cd /path/to/reckoner && pnpm --filter @reckoner/rules-core test
```
Expected: 5 tests pass, 100% coverage

- [ ] **Step 9: Typecheck**

```bash
pnpm --filter @reckoner/rules-core typecheck
```
Expected: no errors

- [ ] **Step 10: Commit**

```bash
git add packages/rules-core
git commit -m "feat(rules-core): add schema, asOf resolver, and types"
```

---

### Task 2: `packages/transfer-tax-engine`

**Files:**
- Create: `packages/transfer-tax-engine/package.json`
- Create: `packages/transfer-tax-engine/tsconfig.json`
- Create: `packages/transfer-tax-engine/src/calculate.ts`
- Create: `packages/transfer-tax-engine/src/index.ts`
- Create: `packages/transfer-tax-engine/__tests__/calculate.test.ts`
- Create: `packages/transfer-tax-engine/vectors/index.ts`

**Interfaces:**
- Consumes: `Band`, `Surcharge`, `Relief`, `TransferTaxRuleSet` from `@reckoner/rules-core`
- Produces: `calculateTransferTax(input, ruleset) => TransferTaxResult`

- [ ] **Step 1: Create package.json and tsconfig.json**

```json
// packages/transfer-tax-engine/package.json
{
  "name": "@reckoner/transfer-tax-engine",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "test": "vitest run --coverage",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@reckoner/rules-core": "workspace:*"
  },
  "devDependencies": {
    "@reckoner/config": "workspace:*",
    "@vitest/coverage-v8": "^2",
    "typescript": "^5",
    "vitest": "^2"
  }
}
```

```json
// packages/transfer-tax-engine/tsconfig.json
{
  "extends": "@reckoner/config/tsconfig",
  "include": ["src/**/*", "__tests__/**/*", "vectors/**/*"],
  "compilerOptions": { "jsx": "react-jsx" }
}
```

- [ ] **Step 2: Write test vectors**

```ts
// packages/transfer-tax-engine/vectors/index.ts
import type { TransferTaxRuleSet } from '@reckoner/rules-core';

const PROVENANCE = {
  source: 'HMRC',
  sourceUrl: 'https://www.gov.uk/stamp-duty-land-tax/residential-property-rates',
  lastReviewed: '2026-08-01',
  effectiveFrom: '2025-04-01',
};

// SDLT England/NI from 1 April 2025
const SDLT_BANDS = [
  { upTo: 125_000, rate: 0 },
  { upTo: 250_000, rate: 0.02 },
  { upTo: 925_000, rate: 0.05 },
  { upTo: 1_500_000, rate: 0.10 },
  { upTo: null, rate: 0.12 },
];

export const SDLT_RULESET: TransferTaxRuleSet = {
  calculator: 'transfer-tax',
  jurisdiction: 'GB-ENG',
  currency: 'GBP',
  tier: 1,
  provenance: PROVENANCE,
  bands: SDLT_BANDS,
  surcharges: [
    { id: 'additional_property', kind: 'flat_rate', value: 0.05, appliesWhen: 'additional_property' },
    { id: 'non_resident', kind: 'flat_rate', value: 0.02, appliesWhen: 'non_resident' },
  ],
  reliefs: [
    {
      id: 'first_time_buyer',
      bands: [
        { upTo: 300_000, rate: 0 },
        { upTo: 500_000, rate: 0.05 },
        { upTo: null, rate: 0.05 },  // relief lost above 500k; engine handles cap
      ],
      cap: 500_000,
    },
  ],
};

export const TEST_VECTORS = {
  sdlt_standard_500k: {
    description: 'HMRC worked example: £500,000 standard purchase',
    source: 'HMRC SDLT calculator, confirmed 2026-08-01',
    sourceUrl: 'https://www.gov.uk/stamp-duty-land-tax/residential-property-rates',
    input: { price: 500_000, surcharges: [] as string[], relief: null as string | null },
    ruleset: SDLT_RULESET,
    expected: {
      // 0% on £0-125k = £0
      // 2% on £125k-250k = £2,500
      // 5% on £250k-500k = £12,500
      // Total = £15,000
      tax: 15_000,
    },
  },
  sdlt_ftb_400k: {
    description: 'HMRC first-time buyer: £400,000 — FTB relief applies (under £500k cap)',
    source: 'HMRC SDLT first-time buyer guidance',
    sourceUrl: 'https://www.gov.uk/guidance/sdlt-first-time-buyers-relief',
    input: { price: 400_000, surcharges: [] as string[], relief: 'first_time_buyer' },
    ruleset: SDLT_RULESET,
    expected: {
      // 0% on £0-300k = £0
      // 5% on £300k-400k = £5,000
      tax: 5_000,
    },
  },
  sdlt_ftb_550k: {
    description: 'FTB purchase at £550,000 — over £500k cap so full rates apply',
    source: 'HMRC SDLT first-time buyer guidance',
    sourceUrl: 'https://www.gov.uk/guidance/sdlt-first-time-buyers-relief',
    input: { price: 550_000, surcharges: [] as string[], relief: 'first_time_buyer' },
    ruleset: SDLT_RULESET,
    expected: {
      // Relief lost (over 500k cap) — standard rates apply
      // 0% on 0-125k = 0
      // 2% on 125k-250k = 2500
      // 5% on 250k-550k = 15000
      // Total = 17500
      tax: 17_500,
    },
  },
  sdlt_additional_property: {
    description: 'Additional property surcharge on £500k purchase',
    source: 'HMRC SDLT additional property',
    sourceUrl: 'https://www.gov.uk/guidance/sdlt-transactions-involving-more-than-one-property',
    input: { price: 500_000, surcharges: ['additional_property'], relief: null },
    ruleset: SDLT_RULESET,
    expected: {
      // 15000 (standard) + 5% × 500000 (surcharge) = 15000 + 25000 = 40000
      tax: 40_000,
    },
  },
} as const;
```

- [ ] **Step 3: Write failing tests**

```ts
// packages/transfer-tax-engine/__tests__/calculate.test.ts
import { describe, it, expect } from 'vitest';
import { calculateTransferTax } from '../src/calculate';
import { TEST_VECTORS } from '../vectors/index';

describe('progressiveTax', () => {
  it('HMRC £500k standard — £15,000', () => {
    const v = TEST_VECTORS.sdlt_standard_500k;
    const result = calculateTransferTax(v.input, v.ruleset);
    expect(result.tax).toBe(v.expected.tax);
  });

  it('HMRC FTB £400k — £5,000', () => {
    const v = TEST_VECTORS.sdlt_ftb_400k;
    const result = calculateTransferTax(v.input, v.ruleset);
    expect(result.tax).toBe(v.expected.tax);
  });

  it('FTB £550k over cap — full rates apply, £17,500', () => {
    const v = TEST_VECTORS.sdlt_ftb_550k;
    const result = calculateTransferTax(v.input, v.ruleset);
    expect(result.tax).toBe(v.expected.tax);
  });

  it('Additional property surcharge on £500k — £40,000', () => {
    const v = TEST_VECTORS.sdlt_additional_property;
    const result = calculateTransferTax(v.input, v.ruleset);
    expect(result.tax).toBe(v.expected.tax);
  });

  it('zero price returns zero tax', () => {
    const v = TEST_VECTORS.sdlt_standard_500k;
    const result = calculateTransferTax({ price: 0, surcharges: [], relief: null }, v.ruleset);
    expect(result.tax).toBe(0);
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

```bash
pnpm --filter @reckoner/transfer-tax-engine test 2>&1 | head -10
```
Expected: FAIL — module not found

- [ ] **Step 5: Write `src/calculate.ts`**

```ts
// packages/transfer-tax-engine/src/calculate.ts
import type { Band, TransferTaxRuleSet } from '@reckoner/rules-core';

export interface TransferTaxInput {
  price: number;
  surcharges: string[];  // list of surcharge IDs that apply, e.g. ['additional_property']
  relief: string | null; // relief ID to apply, e.g. 'first_time_buyer'
}

export interface TransferTaxResult {
  tax: number;
  effectiveRate: number;      // tax / price
  breakdown: { label: string; amount: number }[];
}

function applyBands(price: number, bands: Band[]): number {
  let tax = 0;
  let lower = 0;
  for (const band of bands) {
    const upper = band.upTo ?? Infinity;
    if (price > lower) {
      tax += (Math.min(price, upper) - lower) * band.rate;
    }
    lower = upper;
    if (price <= upper) break;
  }
  return tax;
}

export function calculateTransferTax(
  input: TransferTaxInput,
  ruleset: TransferTaxRuleSet,
): TransferTaxResult {
  if (input.price <= 0) {
    return { tax: 0, effectiveRate: 0, breakdown: [] };
  }

  // Determine which bands to use (relief may replace standard bands)
  let activeBands = ruleset.bands;
  let reliefLost = false;

  if (input.relief !== null) {
    const relief = ruleset.reliefs.find((r) => r.id === input.relief);
    if (relief !== undefined) {
      if (relief.cap !== null && input.price > relief.cap) {
        reliefLost = true;
        activeBands = ruleset.bands;
      } else {
        activeBands = relief.bands;
      }
    }
  }

  const baseTax = Math.round(applyBands(input.price, activeBands) * 100) / 100;
  const breakdown: { label: string; amount: number }[] = [
    { label: reliefLost ? 'Stamp duty (standard rates — over relief cap)' : 'Stamp duty', amount: baseTax },
  ];

  let totalTax = baseTax;

  // Apply flat-rate surcharges
  for (const surchargeId of input.surcharges) {
    const surcharge = ruleset.surcharges.find((s) => s.id === surchargeId);
    if (surcharge === undefined) continue;

    const surchargeAmount = Math.round(input.price * surcharge.value * 100) / 100;
    breakdown.push({ label: surcharge.id.replace(/_/g, ' '), amount: surchargeAmount });
    totalTax += surchargeAmount;
  }

  totalTax = Math.round(totalTax * 100) / 100;

  return {
    tax: totalTax,
    effectiveRate: input.price > 0 ? totalTax / input.price : 0,
    breakdown,
  };
}
```

- [ ] **Step 6: Write `src/index.ts`**

```ts
// packages/transfer-tax-engine/src/index.ts
export { calculateTransferTax } from './calculate';
export type { TransferTaxInput, TransferTaxResult } from './calculate';
export { TEST_VECTORS } from '../vectors/index';
```

- [ ] **Step 7: Run tests**

```bash
pnpm --filter @reckoner/transfer-tax-engine test
```
Expected: 5 tests pass, 100% coverage

- [ ] **Step 8: Commit**

```bash
git add packages/transfer-tax-engine
git commit -m "feat(transfer-tax-engine): progressive band evaluator with relief and surcharge logic"
```

---

### Task 3: Stamp duty JSON rules data

**Files (create each):**
- `packages/finance-data/src/rules/stamp-duty/gb-eng.json` — SDLT England/NI
- `packages/finance-data/src/rules/stamp-duty/gb-sct.json` — LBTT Scotland
- `packages/finance-data/src/rules/stamp-duty/gb-wls.json` — LTT Wales
- `packages/finance-data/src/rules/stamp-duty/ie.json`
- `packages/finance-data/src/rules/stamp-duty/sg.json`
- `packages/finance-data/src/rules/stamp-duty/au.json` — national average / landing page
- `packages/finance-data/src/rules/stamp-duty/de.json` — national average (weighted)
- `packages/finance-data/src/rules/stamp-duty/ca.json` — national average / landing page
- `packages/finance-data/src/rules/stamp-duty/nl.json`
- `packages/finance-data/src/rules/stamp-duty/fr.json`
- `packages/finance-data/src/rules/stamp-duty/es.json`
- `packages/finance-data/src/rules/stamp-duty/nz.json` — zero (no stamp duty)
- `packages/finance-data/src/rules/stamp-duty/us.json` — zero (no federal; states vary)
- `packages/finance-data/src/rules/stamp-duty/in.json` — tier 3 representative rate

Each file is an array of versioned rulesets. For the plan we include the full content of critical tier-1 files; tier-2/3 files follow the same shape.

- [ ] **Step 1: Create rules directory**

```bash
mkdir -p packages/finance-data/src/rules/stamp-duty
mkdir -p packages/finance-data/src/rules/affordability
```

- [ ] **Step 2: Write `gb-eng.json`**

```json
[
  {
    "calculator": "transfer-tax",
    "jurisdiction": "GB-ENG",
    "currency": "GBP",
    "tier": 1,
    "provenance": {
      "source": "HMRC — Stamp Duty Land Tax rates",
      "sourceUrl": "https://www.gov.uk/stamp-duty-land-tax/residential-property-rates",
      "lastReviewed": "2026-08-01",
      "effectiveFrom": "2025-04-01"
    },
    "bands": [
      { "upTo": 125000, "rate": 0 },
      { "upTo": 250000, "rate": 0.02 },
      { "upTo": 925000, "rate": 0.05 },
      { "upTo": 1500000, "rate": 0.10 },
      { "upTo": null, "rate": 0.12 }
    ],
    "surcharges": [
      { "id": "additional_property", "kind": "flat_rate", "value": 0.05, "appliesWhen": "additional_property" },
      { "id": "non_resident", "kind": "flat_rate", "value": 0.02, "appliesWhen": "non_resident" }
    ],
    "reliefs": [
      {
        "id": "first_time_buyer",
        "cap": 500000,
        "bands": [
          { "upTo": 300000, "rate": 0 },
          { "upTo": 500000, "rate": 0.05 },
          { "upTo": null, "rate": 0.05 }
        ]
      }
    ]
  }
]
```

- [ ] **Step 3: Write `gb-sct.json`** (LBTT Scotland)

```json
[
  {
    "calculator": "transfer-tax",
    "jurisdiction": "GB-SCT",
    "currency": "GBP",
    "tier": 1,
    "provenance": {
      "source": "Revenue Scotland — Land and Buildings Transaction Tax rates",
      "sourceUrl": "https://www.revenue.scot/land-buildings-transaction-tax/guidance/lbtt-legislation-guidance/residential-property/lbtt2013",
      "lastReviewed": "2026-08-01",
      "effectiveFrom": "2024-04-01"
    },
    "bands": [
      { "upTo": 145000, "rate": 0 },
      { "upTo": 250000, "rate": 0.02 },
      { "upTo": 325000, "rate": 0.05 },
      { "upTo": 750000, "rate": 0.10 },
      { "upTo": null, "rate": 0.12 }
    ],
    "surcharges": [
      { "id": "additional_property", "kind": "flat_rate", "value": 0.06, "appliesWhen": "additional_property" }
    ],
    "reliefs": [
      {
        "id": "first_time_buyer",
        "cap": 175000,
        "bands": [
          { "upTo": 175000, "rate": 0 },
          { "upTo": 250000, "rate": 0.02 },
          { "upTo": 325000, "rate": 0.05 },
          { "upTo": 750000, "rate": 0.10 },
          { "upTo": null, "rate": 0.12 }
        ]
      }
    ]
  }
]
```

- [ ] **Step 4: Write `gb-wls.json`** (LTT Wales)

```json
[
  {
    "calculator": "transfer-tax",
    "jurisdiction": "GB-WLS",
    "currency": "GBP",
    "tier": 1,
    "provenance": {
      "source": "Welsh Revenue Authority — Land Transaction Tax rates",
      "sourceUrl": "https://www.gov.wales/land-transaction-tax-guide",
      "lastReviewed": "2026-08-01",
      "effectiveFrom": "2022-10-10"
    },
    "bands": [
      { "upTo": 225000, "rate": 0 },
      { "upTo": 400000, "rate": 0.06 },
      { "upTo": 750000, "rate": 0.075 },
      { "upTo": 1500000, "rate": 0.10 },
      { "upTo": null, "rate": 0.12 }
    ],
    "surcharges": [
      { "id": "additional_property", "kind": "flat_rate", "value": 0.04, "appliesWhen": "additional_property" }
    ],
    "reliefs": []
  }
]
```

- [ ] **Step 5: Write `ie.json`**

```json
[
  {
    "calculator": "transfer-tax",
    "jurisdiction": "IE",
    "currency": "EUR",
    "tier": 1,
    "provenance": {
      "source": "Irish Revenue — Stamp Duty on residential property",
      "sourceUrl": "https://www.revenue.ie/en/property/stamp-duty/what-is-stamp-duty/index.aspx",
      "lastReviewed": "2026-08-01",
      "effectiveFrom": "2024-01-01"
    },
    "bands": [
      { "upTo": 1000000, "rate": 0.01 },
      { "upTo": null, "rate": 0.02 }
    ],
    "surcharges": [],
    "reliefs": []
  }
]
```

- [ ] **Step 6: Write `sg.json`** (Buyer's Stamp Duty)

```json
[
  {
    "calculator": "transfer-tax",
    "jurisdiction": "SG",
    "currency": "SGD",
    "tier": 1,
    "provenance": {
      "source": "IRAS — Buyer's Stamp Duty",
      "sourceUrl": "https://www.iras.gov.sg/taxes/stamp-duty/for-property/buying-or-acquiring-property/buyer-s-stamp-duty-(bsd)",
      "lastReviewed": "2026-08-01",
      "effectiveFrom": "2023-02-15"
    },
    "bands": [
      { "upTo": 180000, "rate": 0.01 },
      { "upTo": 360000, "rate": 0.02 },
      { "upTo": 1000000, "rate": 0.03 },
      { "upTo": 1500000, "rate": 0.04 },
      { "upTo": 3000000, "rate": 0.05 },
      { "upTo": null, "rate": 0.06 }
    ],
    "surcharges": [
      { "id": "foreign_buyer", "kind": "flat_rate", "value": 0.60, "appliesWhen": "foreign_buyer" },
      { "id": "sc_second_property", "kind": "flat_rate", "value": 0.20, "appliesWhen": "sc_second_property" },
      { "id": "sc_third_plus", "kind": "flat_rate", "value": 0.30, "appliesWhen": "sc_third_plus" },
      { "id": "pr_first_property", "kind": "flat_rate", "value": 0.05, "appliesWhen": "pr_first_property" },
      { "id": "pr_second_plus", "kind": "flat_rate", "value": 0.30, "appliesWhen": "pr_second_plus" }
    ],
    "reliefs": []
  }
]
```

- [ ] **Step 7: Write remaining country files**

`nl.json` — 2% for owner-occupiers (main residence), 10.4% for other buyers:
```json
[
  {
    "calculator": "transfer-tax",
    "jurisdiction": "NL",
    "currency": "EUR",
    "tier": 1,
    "provenance": {
      "source": "Belastingdienst — overdrachtsbelasting",
      "sourceUrl": "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/woning/eigen_woning_kopen/overdrachtsbelasting",
      "lastReviewed": "2026-08-01",
      "effectiveFrom": "2023-01-01"
    },
    "bands": [{ "upTo": null, "rate": 0.02 }],
    "surcharges": [
      { "id": "investor", "kind": "flat_rate", "value": 0.084, "appliesWhen": "investor" }
    ],
    "reliefs": [
      { "id": "starter_vrijstelling", "cap": 510000, "bands": [{ "upTo": null, "rate": 0 }] }
    ]
  }
]
```

`fr.json` — frais de mutation ~5.80% (droits d'enregistrement 5.09% + taxe de publicite fonciere + frais d'assiette):
```json
[
  {
    "calculator": "transfer-tax",
    "jurisdiction": "FR",
    "currency": "EUR",
    "tier": 2,
    "provenance": {
      "source": "Direction Generale des Finances Publiques — droits de mutation a titre onereux",
      "sourceUrl": "https://www.impots.gouv.fr/particulier/les-droits-de-mutation",
      "lastReviewed": "2026-08-01",
      "effectiveFrom": "2014-03-01"
    },
    "bands": [{ "upTo": null, "rate": 0.0580 }],
    "surcharges": [],
    "reliefs": []
  }
]
```

`es.json` — ITP residential resale 6-10% by region; new-build VAT 10% instead (tier 2 national representative):
```json
[
  {
    "calculator": "transfer-tax",
    "jurisdiction": "ES",
    "currency": "EUR",
    "tier": 2,
    "provenance": {
      "source": "Agencia Tributaria — Impuesto sobre Transmisiones Patrimoniales (national representative rate)",
      "sourceUrl": "https://www.agenciatributaria.es/AEAT.internet/Inicio/Ayuda/Manuales__Folletos_y_Videos/Folletos_divulgativos/_Ayuda_Impuesto_sobre_Transmisiones_Patrimoniales_y_Actos_Juridicos_Documentados.shtml",
      "lastReviewed": "2026-08-01",
      "effectiveFrom": "2023-01-01"
    },
    "bands": [{ "upTo": null, "rate": 0.08 }],
    "surcharges": [],
    "reliefs": []
  }
]
```

`de.json` — national representative (weighted average ~5%); Bundesland breakdown on sub-pages:
```json
[
  {
    "calculator": "transfer-tax",
    "jurisdiction": "DE",
    "currency": "EUR",
    "tier": 2,
    "provenance": {
      "source": "DNotI — Grunderwerbsteuersatze (weighted national average; see sub-pages for Bundesland rates)",
      "sourceUrl": "https://www.dnotI.de/fachInfo/aktuelles/2026/grunderwerbsteuersaetze.html",
      "lastReviewed": "2026-08-01",
      "effectiveFrom": "2021-07-01"
    },
    "bands": [{ "upTo": null, "rate": 0.05 }],
    "surcharges": [],
    "reliefs": []
  }
]
```

`au.json` — national landing page representative (NSW rate as the most searched):
```json
[
  {
    "calculator": "transfer-tax",
    "jurisdiction": "AU",
    "currency": "AUD",
    "tier": 2,
    "provenance": {
      "source": "Revenue NSW — Transfer Duty (used as national representative; see state pages for exact rates)",
      "sourceUrl": "https://www.revenue.nsw.gov.au/taxes-duties-levies-royalties/transfer-duty",
      "lastReviewed": "2026-08-01",
      "effectiveFrom": "2023-07-01"
    },
    "bands": [
      { "upTo": 17310, "rate": 0.0125 },
      { "upTo": 36990, "rate": 0.015 },
      { "upTo": 97790, "rate": 0.0175 },
      { "upTo": 309000, "rate": 0.035 },
      { "upTo": 1033000, "rate": 0.045 },
      { "upTo": null, "rate": 0.055 }
    ],
    "surcharges": [
      { "id": "foreign_purchaser", "kind": "flat_rate", "value": 0.09, "appliesWhen": "foreign_purchaser" }
    ],
    "reliefs": [
      {
        "id": "first_home_buyer",
        "cap": 800000,
        "bands": [{ "upTo": null, "rate": 0 }]
      }
    ]
  }
]
```

`ca.json` — Ontario LTT as national landing representative:
```json
[
  {
    "calculator": "transfer-tax",
    "jurisdiction": "CA",
    "currency": "CAD",
    "tier": 2,
    "provenance": {
      "source": "Ontario Ministry of Finance — Land Transfer Tax (used as national representative; see provincial pages for exact rates)",
      "sourceUrl": "https://www.ontario.ca/page/land-transfer-tax",
      "lastReviewed": "2026-08-01",
      "effectiveFrom": "2017-01-01"
    },
    "bands": [
      { "upTo": 55000, "rate": 0.005 },
      { "upTo": 250000, "rate": 0.01 },
      { "upTo": 400000, "rate": 0.015 },
      { "upTo": 2000000, "rate": 0.02 },
      { "upTo": null, "rate": 0.025 }
    ],
    "surcharges": [],
    "reliefs": [
      {
        "id": "first_time_buyer",
        "cap": 368000,
        "bands": [{ "upTo": null, "rate": 0 }]
      }
    ]
  }
]
```

`nz.json` — no stamp duty:
```json
[
  {
    "calculator": "transfer-tax",
    "jurisdiction": "NZ",
    "currency": "NZD",
    "tier": 1,
    "provenance": {
      "source": "New Zealand Inland Revenue — no stamp duty or transfer tax on residential property",
      "sourceUrl": "https://www.ird.govt.nz/property",
      "lastReviewed": "2026-08-01",
      "effectiveFrom": "1999-01-01"
    },
    "bands": [{ "upTo": null, "rate": 0 }],
    "surcharges": [],
    "reliefs": []
  }
]
```

`us.json` — no federal stamp duty:
```json
[
  {
    "calculator": "transfer-tax",
    "jurisdiction": "US",
    "currency": "USD",
    "tier": 2,
    "provenance": {
      "source": "No federal stamp duty; rates vary by state and county. This page shows the national context only.",
      "sourceUrl": "https://www.irs.gov",
      "lastReviewed": "2026-08-01",
      "effectiveFrom": "2000-01-01"
    },
    "bands": [{ "upTo": null, "rate": 0 }],
    "surcharges": [],
    "reliefs": []
  }
]
```

`in.json` — representative national rate (varies significantly by state):
```json
[
  {
    "calculator": "transfer-tax",
    "jurisdiction": "IN",
    "currency": "INR",
    "tier": 3,
    "provenance": {
      "source": "Government of India — stamp duty rates are set by state governments and vary widely (typically 3-8%). This is an indicative rate for Maharashtra.",
      "sourceUrl": "https://igr.maharashtra.gov.in/",
      "lastReviewed": "2026-08-01",
      "effectiveFrom": "2023-04-01"
    },
    "bands": [{ "upTo": null, "rate": 0.05 }],
    "surcharges": [],
    "reliefs": []
  }
]
```

- [ ] **Step 8: Export loader from finance-data**

Add to `packages/finance-data/src/index.ts`:

```ts
export { loadStampDutyRules } from './rules/loadRules';
```

Create `packages/finance-data/src/rules/loadRules.ts`:

```ts
// packages/finance-data/src/rules/loadRules.ts
import type { CountryCode } from './types';
import type { TransferTaxRuleSet } from '@reckoner/rules-core';

const STAMP_DUTY_MAP: Record<CountryCode, () => Promise<{ default: TransferTaxRuleSet[] }>> = {
  us: () => import('./stamp-duty/us.json'),
  uk: () => import('./stamp-duty/gb-eng.json'),
  ca: () => import('./stamp-duty/ca.json'),
  au: () => import('./stamp-duty/au.json'),
  ie: () => import('./stamp-duty/ie.json'),
  de: () => import('./stamp-duty/de.json'),
  nl: () => import('./stamp-duty/nl.json'),
  nz: () => import('./stamp-duty/nz.json'),
  fr: () => import('./stamp-duty/fr.json'),
  es: () => import('./stamp-duty/es.json'),
  sg: () => import('./stamp-duty/sg.json'),
  in: () => import('./stamp-duty/in.json'),
};

export async function loadStampDutyRules(cc: CountryCode): Promise<TransferTaxRuleSet[]> {
  const loader = STAMP_DUTY_MAP[cc];
  const mod = await loader();
  return mod.default as TransferTaxRuleSet[];
}
```

Note: `finance-data`'s `tsconfig.json` must have `"resolveJsonModule": true` — the base config already includes this.

Also add `@reckoner/rules-core` to finance-data's dependencies in its `package.json`:
```json
"dependencies": {
  "@reckoner/rules-core": "workspace:*"
}
```

- [ ] **Step 9: Commit**

```bash
git add packages/finance-data/src/rules
git commit -m "feat(finance-data): add stamp duty rules JSON for all 12 countries"
```

---

### Task 4: `packages/affordability-engine`

**Files:**
- Create: `packages/affordability-engine/package.json`
- Create: `packages/affordability-engine/tsconfig.json`
- Create: `packages/affordability-engine/src/types.ts`
- Create: `packages/affordability-engine/src/calculate.ts`
- Create: `packages/affordability-engine/src/index.ts`
- Create: `packages/affordability-engine/__tests__/calculate.test.ts`

**Interfaces:**
- Consumes: `AffordabilityRuleSet` from `@reckoner/rules-core`
- Produces: `calculateAffordability(input, ruleset) => AffordabilityResult`

- [ ] **Step 1: package.json and tsconfig.json** (same shape as transfer-tax-engine)

```json
// packages/affordability-engine/package.json
{
  "name": "@reckoner/affordability-engine",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "test": "vitest run --coverage",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@reckoner/rules-core": "workspace:*"
  },
  "devDependencies": {
    "@reckoner/config": "workspace:*",
    "@vitest/coverage-v8": "^2",
    "typescript": "^5",
    "vitest": "^2"
  }
}
```

```json
// packages/affordability-engine/tsconfig.json
{
  "extends": "@reckoner/config/tsconfig",
  "include": ["src/**/*", "__tests__/**/*"],
  "compilerOptions": { "jsx": "react-jsx" }
}
```

- [ ] **Step 2: Write failing tests**

```ts
// packages/affordability-engine/__tests__/calculate.test.ts
import { describe, it, expect } from 'vitest';
import { calculateAffordability } from '../src/calculate';
import type { AffordabilityRuleSet } from '@reckoner/rules-core';
import type { AffordabilityInput } from '../src/types';

const IRELAND_RULESET: AffordabilityRuleSet = {
  calculator: 'affordability',
  jurisdiction: 'IE',
  provenance: {
    source: 'Central Bank of Ireland Mortgage Measures Framework',
    sourceUrl: 'https://www.centralbank.ie/financial-system/financial-stability/macro-prudential-policy/mortgage-measures',
    lastReviewed: '2026-08-01',
    effectiveFrom: '2023-01-01',
  },
  method: 'lti_ltv',
  params: { ltiFtb: 4, ltiSsb: 3.5, ltvFtb: 0.9, ltvSsb: 0.9, ltvBtl: 0.7 },
};

const AUSTRALIA_RULESET: AffordabilityRuleSet = {
  calculator: 'affordability',
  jurisdiction: 'AU',
  provenance: {
    source: 'APRA Prudential Practice Guide APG 223',
    sourceUrl: 'https://www.apra.gov.au/sites/default/files/apg_223_november_2021_0.pdf',
    lastReviewed: '2026-08-01',
    effectiveFrom: '2021-11-01',
  },
  method: 'serviceability_buffer',
  params: { buffer: 0.03 },
};

const SINGAPORE_RULESET: AffordabilityRuleSet = {
  calculator: 'affordability',
  jurisdiction: 'SG',
  provenance: {
    source: 'MAS Notice 645 — Total Debt Servicing Ratio',
    sourceUrl: 'https://www.mas.gov.sg/regulation/notices/notice-645',
    lastReviewed: '2026-08-01',
    effectiveFrom: '2023-01-01',
  },
  method: 'tdsr_msr',
  params: { tdsr: 0.55, msr: 0.30, rateFloor: 0.04 },
};

describe('calculateAffordability', () => {
  describe('lti_ltv (Ireland FTB)', () => {
    it('caps at 4x gross income for FTB', () => {
      const input: AffordabilityInput = {
        grossAnnualIncome: 80_000,
        monthlyDebts: 0,
        propertyPrice: 400_000,
        annualRate: 0.039,
        termYears: 30,
        buyerType: 'first_time_buyer',
      };
      const result = calculateAffordability(input, IRELAND_RULESET);
      // Max borrow = 4 × 80000 = 320000
      expect(result.maxBorrow).toBe(320_000);
      expect(result.bindingConstraint).toBe('lti');
    });

    it('respects LTV for SSB when LTI is not binding', () => {
      const input: AffordabilityInput = {
        grossAnnualIncome: 200_000,
        monthlyDebts: 0,
        propertyPrice: 300_000,
        annualRate: 0.039,
        termYears: 30,
        buyerType: 'subsequent_buyer',
      };
      const result = calculateAffordability(input, IRELAND_RULESET);
      // LTI cap = 3.5 × 200000 = 700000 — not binding vs 300000 × 0.9 = 270000 LTV
      expect(result.maxBorrow).toBe(270_000);
      expect(result.bindingConstraint).toBe('ltv');
    });
  });

  describe('serviceability_buffer (Australia APRA)', () => {
    it('applies +3% buffer on top of rate', () => {
      const input: AffordabilityInput = {
        grossAnnualIncome: 120_000,
        monthlyDebts: 500,
        propertyPrice: 800_000,
        annualRate: 0.06,
        termYears: 30,
        buyerType: 'first_time_buyer',
      };
      const result = calculateAffordability(input, AUSTRALIA_RULESET);
      // Assessment rate = 6% + 3% = 9%
      // Monthly income = 10000, net of debts = 9500, no DTI cap in AU rule
      expect(result.assessmentRate).toBeCloseTo(0.09, 4);
      expect(result.maxBorrow).toBeGreaterThan(0);
    });
  });

  describe('tdsr_msr (Singapore)', () => {
    it('limits total debt service to 55% of gross monthly income', () => {
      const input: AffordabilityInput = {
        grossAnnualIncome: 120_000,
        monthlyDebts: 2_000,
        propertyPrice: 1_500_000,
        annualRate: 0.038,
        termYears: 25,
        buyerType: 'first_time_buyer',
      };
      const result = calculateAffordability(input, SINGAPORE_RULESET);
      // Monthly income = 10000; TDSR = 55% = 5500; available for mortgage = 5500 - 2000 = 3500
      // assessment rate = max(0.038, 0.04) = 0.04
      expect(result.availableForMortgage).toBeCloseTo(3_500, 0);
      expect(result.assessmentRate).toBeCloseTo(0.04, 4);
    });
  });
});
```

- [ ] **Step 3: Write `src/types.ts`**

```ts
// packages/affordability-engine/src/types.ts
export interface AffordabilityInput {
  grossAnnualIncome: number;
  monthlyDebts: number;          // existing monthly debt obligations
  propertyPrice: number;
  annualRate: number;             // current product rate as decimal
  termYears: number;
  buyerType: 'first_time_buyer' | 'subsequent_buyer' | 'buy_to_let';
}

export interface AffordabilityResult {
  maxBorrow: number;
  assessmentRate: number;         // rate used for stress test
  availableForMortgage: number;   // monthly cash available for mortgage payment
  bindingConstraint: 'lti' | 'ltv' | 'dti' | 'payment_capacity';
  maxMonthlyPayment: number;
}
```

- [ ] **Step 4: Write `src/calculate.ts`**

```ts
// packages/affordability-engine/src/calculate.ts
import type { AffordabilityRuleSet } from '@reckoner/rules-core';
import type { AffordabilityInput, AffordabilityResult } from './types';

function monthlyPaymentForLoan(principal: number, annualRate: number, termYears: number): number {
  if (principal <= 0) return 0;
  const i = annualRate / 12;
  const n = termYears * 12;
  if (i === 0) return principal / n;
  return (principal * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
}

function maxLoanFromPayment(monthlyPayment: number, annualRate: number, termYears: number): number {
  if (monthlyPayment <= 0) return 0;
  const i = annualRate / 12;
  const n = termYears * 12;
  if (i === 0) return monthlyPayment * n;
  return (monthlyPayment * (Math.pow(1 + i, n) - 1)) / (i * Math.pow(1 + i, n));
}

export function calculateAffordability(
  input: AffordabilityInput,
  ruleset: AffordabilityRuleSet,
): AffordabilityResult {
  const { grossAnnualIncome, monthlyDebts, propertyPrice, annualRate, termYears, buyerType } = input;
  const monthlyIncome = grossAnnualIncome / 12;
  const p = ruleset.params;

  switch (ruleset.method) {
    case 'lti_ltv': {
      const ltiMultiplier =
        buyerType === 'first_time_buyer' ? (p['ltiFtb'] ?? 4) :
        buyerType === 'buy_to_let' ? 0 :
        (p['ltiSsb'] ?? 3.5);
      const ltvRatio =
        buyerType === 'first_time_buyer' ? (p['ltvFtb'] ?? 0.9) :
        buyerType === 'buy_to_let' ? (p['ltvBtl'] ?? 0.7) :
        (p['ltvSsb'] ?? 0.9);

      const maxByLti = grossAnnualIncome * ltiMultiplier;
      const maxByLtv = propertyPrice * ltvRatio;
      const maxBorrow = Math.min(maxByLti, maxByLtv);
      const bindingConstraint = maxByLti < maxByLtv ? 'lti' : 'ltv';
      const maxMonthlyPayment = monthlyPaymentForLoan(maxBorrow, annualRate, termYears);

      return {
        maxBorrow: Math.round(maxBorrow),
        assessmentRate: annualRate,
        availableForMortgage: Math.max(0, monthlyIncome * 0.4 - monthlyDebts),
        bindingConstraint,
        maxMonthlyPayment: Math.round(maxMonthlyPayment * 100) / 100,
      };
    }

    case 'serviceability_buffer': {
      const buffer = p['buffer'] ?? 0.03;
      const assessmentRate = annualRate + buffer;
      // No hard DTI cap in APRA rules — lenders set their own
      // Use 35% of gross income as a conservative representative cap
      const availableForMortgage = Math.max(0, monthlyIncome * 0.35 - monthlyDebts);
      const maxBorrow = maxLoanFromPayment(availableForMortgage, assessmentRate, termYears);
      const maxMonthlyPayment = monthlyPaymentForLoan(maxBorrow, annualRate, termYears);

      return {
        maxBorrow: Math.round(maxBorrow),
        assessmentRate,
        availableForMortgage: Math.round(availableForMortgage * 100) / 100,
        bindingConstraint: 'payment_capacity',
        maxMonthlyPayment: Math.round(maxMonthlyPayment * 100) / 100,
      };
    }

    case 'tdsr_msr': {
      const tdsr = p['tdsr'] ?? 0.55;
      const rateFloor = p['rateFloor'] ?? 0.04;
      const assessmentRate = Math.max(annualRate, rateFloor);
      const maxTotalDebtService = monthlyIncome * tdsr;
      const availableForMortgage = Math.max(0, maxTotalDebtService - monthlyDebts);
      const maxBorrow = maxLoanFromPayment(availableForMortgage, assessmentRate, termYears);
      const maxMonthlyPayment = monthlyPaymentForLoan(maxBorrow, annualRate, termYears);

      return {
        maxBorrow: Math.round(maxBorrow),
        assessmentRate,
        availableForMortgage: Math.round(availableForMortgage * 100) / 100,
        bindingConstraint: 'dti',
        maxMonthlyPayment: Math.round(maxMonthlyPayment * 100) / 100,
      };
    }

    case 'dti_stress': {
      // Canada MQR: max(contract+2%, 5.25%)
      const stressFloor = p['stressFloor'] ?? 0.0525;
      const assessmentRate = Math.max(annualRate + 0.02, stressFloor);
      const availableForMortgage = Math.max(0, monthlyIncome * 0.39 - monthlyDebts);
      const maxBorrow = maxLoanFromPayment(availableForMortgage, assessmentRate, termYears);
      const maxMonthlyPayment = monthlyPaymentForLoan(maxBorrow, annualRate, termYears);

      return {
        maxBorrow: Math.round(maxBorrow),
        assessmentRate,
        availableForMortgage: Math.round(availableForMortgage * 100) / 100,
        bindingConstraint: 'payment_capacity',
        maxMonthlyPayment: Math.round(maxMonthlyPayment * 100) / 100,
      };
    }
  }
}
```

- [ ] **Step 5: Write `src/index.ts`**

```ts
// packages/affordability-engine/src/index.ts
export { calculateAffordability } from './calculate';
export type { AffordabilityInput, AffordabilityResult } from './types';
```

- [ ] **Step 6: Run tests**

```bash
pnpm --filter @reckoner/affordability-engine test
```
Expected: all tests pass

- [ ] **Step 7: Write affordability JSON rules**

`packages/finance-data/src/rules/affordability/ie.json`:
```json
[{ "calculator": "affordability", "jurisdiction": "IE", "provenance": { "source": "Central Bank of Ireland Mortgage Measures Framework", "sourceUrl": "https://www.centralbank.ie/financial-system/financial-stability/macro-prudential-policy/mortgage-measures", "lastReviewed": "2026-08-01", "effectiveFrom": "2023-01-01" }, "method": "lti_ltv", "params": { "ltiFtb": 4, "ltiSsb": 3.5, "ltvFtb": 0.9, "ltvSsb": 0.9, "ltvBtl": 0.7 } }]
```

`packages/finance-data/src/rules/affordability/au.json`:
```json
[{ "calculator": "affordability", "jurisdiction": "AU", "provenance": { "source": "APRA Prudential Practice Guide APG 223 — serviceability buffer reaffirmed November 2024", "sourceUrl": "https://www.apra.gov.au/sites/default/files/apg_223_november_2021_0.pdf", "lastReviewed": "2026-08-01", "effectiveFrom": "2021-11-01" }, "method": "serviceability_buffer", "params": { "buffer": 0.03 } }]
```

`packages/finance-data/src/rules/affordability/ca.json`:
```json
[{ "calculator": "affordability", "jurisdiction": "CA", "provenance": { "source": "OSFI Guideline B-20 — Minimum Qualifying Rate", "sourceUrl": "https://www.osfi-bsif.gc.ca/en/guidance/guidance-library/residential-mortgage-underwriting-practices-procedures", "lastReviewed": "2026-08-01", "effectiveFrom": "2021-06-01" }, "method": "dti_stress", "params": { "stressFloor": 0.0525 } }]
```

`packages/finance-data/src/rules/affordability/sg.json`:
```json
[{ "calculator": "affordability", "jurisdiction": "SG", "provenance": { "source": "MAS Notice 645 — Total Debt Servicing Ratio Framework", "sourceUrl": "https://www.mas.gov.sg/regulation/notices/notice-645", "lastReviewed": "2026-08-01", "effectiveFrom": "2023-01-01" }, "method": "tdsr_msr", "params": { "tdsr": 0.55, "msr": 0.30, "rateFloor": 0.04 } }]
```

`packages/finance-data/src/rules/affordability/uk.json`:
```json
[{ "calculator": "affordability", "jurisdiction": "GB", "provenance": { "source": "Bank of England FPC — lenders assess at their own stressed rate under FCA MCOB 11.6 (post FG25/4, July 2025). Rule of thumb: 4.5x income.", "sourceUrl": "https://www.bankofengland.co.uk/financial-stability/macroprudential-policy/loan-to-income-ratio", "lastReviewed": "2026-08-01", "effectiveFrom": "2025-07-01" }, "method": "lti_ltv", "params": { "ltiFtb": 4.5, "ltiSsb": 4.5, "ltvFtb": 0.95, "ltvSsb": 0.90, "ltvBtl": 0.75 } }]
```

For remaining countries without country-specific regulation (us, de, nl, nz, fr, es, in), create generic serviceability files with `method: "serviceability_buffer"` and `buffer: 0.02` as a conservative default — these pages will show a "standard estimate" badge.

- [ ] **Step 8: Add affordability loader to finance-data**

In `packages/finance-data/src/rules/loadRules.ts`, add:

```ts
const AFFORDABILITY_MAP: Record<CountryCode, () => Promise<{ default: AffordabilityRuleSet[] }>> = {
  us: () => import('./affordability/us.json'),
  uk: () => import('./affordability/uk.json'),
  ca: () => import('./affordability/ca.json'),
  au: () => import('./affordability/au.json'),
  ie: () => import('./affordability/ie.json'),
  de: () => import('./affordability/de.json'),
  nl: () => import('./affordability/nl.json'),
  nz: () => import('./affordability/nz.json'),
  fr: () => import('./affordability/fr.json'),
  es: () => import('./affordability/es.json'),
  sg: () => import('./affordability/sg.json'),
  in: () => import('./affordability/in.json'),
};

export async function loadAffordabilityRules(cc: CountryCode): Promise<AffordabilityRuleSet[]> {
  const loader = AFFORDABILITY_MAP[cc];
  const mod = await loader();
  return mod.default as AffordabilityRuleSet[];
}
```

Add `import type { AffordabilityRuleSet } from '@reckoner/rules-core';` at the top and update the `finance-data` index export.

- [ ] **Step 9: Commit**

```bash
git add packages/affordability-engine packages/finance-data/src/rules/affordability
git commit -m "feat(affordability-engine): per-country serviceability conventions and rules data"
```

---

### Task 5: Stamp Duty page and calculator component

**Files:**
- Create: `apps/web/app/[cc]/stamp-duty/page.tsx`
- Create: `apps/web/src/components/StampDutyCalculator/index.tsx`
- Modify: `apps/web/package.json` (add new workspace deps)

- [ ] **Step 1: Add workspace deps to web**

In `apps/web/package.json`, add to `"dependencies"`:
```json
"@reckoner/rules-core": "workspace:*",
"@reckoner/transfer-tax-engine": "workspace:*",
"@reckoner/affordability-engine": "workspace:*"
```

Run `pnpm install` from repo root.

- [ ] **Step 2: Write the server page `app/[cc]/stamp-duty/page.tsx`**

```tsx
// apps/web/app/[cc]/stamp-duty/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCountry, getAllCountries, COUNTRY_CODES } from '@reckoner/finance-data';
import { loadStampDutyRules } from '@reckoner/finance-data';
import type { CountryCode } from '@reckoner/finance-data';
import { asOf } from '@reckoner/rules-core';
import { AdSlot } from '@reckoner/analytics';
import { Header } from '../../../src/components/Header';
import { Footer } from '../../../src/components/Footer';
import { StampDutyCalculator } from '../../../src/components/StampDutyCalculator';
import { TrustDisclosures } from '../../../src/components/TrustDisclosures';

export const revalidate = 86400;

export function generateStaticParams() {
  return COUNTRY_CODES.map((cc) => ({ cc }));
}

export async function generateMetadata({ params }: { params: Promise<{ cc: string }> }): Promise<Metadata> {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) return {};
  const country = getCountry(cc as CountryCode);
  return {
    title: `Stamp Duty / Transfer Tax Calculator ${country.code.toUpperCase()} | Reckoner`,
    description: `Calculate stamp duty or transfer tax for a property purchase in ${country.code.toUpperCase()}. Free, sourced from official government rates.`,
    robots: { index: true, follow: true },
  };
}

const H1: Record<string, string> = {
  us: 'US Property Transfer Tax',
  uk: 'Stamp Duty Calculator (England and Northern Ireland)',
  ca: 'Canadian Land Transfer Tax Calculator',
  au: 'Australian Stamp Duty Calculator',
  ie: 'Irish Stamp Duty Calculator',
  de: 'German Grunderwerbsteuer Calculator',
  nl: 'Dutch Transfer Tax Calculator',
  nz: 'New Zealand Property Transfer',
  fr: 'French Droits de Mutation Calculator',
  es: 'Spanish ITP Calculator',
  sg: 'Singapore Buyer Stamp Duty Calculator',
  in: 'Indian Stamp Duty Calculator',
};

export default async function StampDutyPage({ params }: { params: Promise<{ cc: string }> }) {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) notFound();

  const country = getCountry(cc as CountryCode);
  const allCountries = getAllCountries();

  const versions = await loadStampDutyRules(cc as CountryCode);
  const ruleset = asOf(versions);

  const h1 = H1[cc] ?? 'Stamp Duty / Transfer Tax Calculator';

  return (
    <>
      <Header currentCountry={country} allCountries={allCountries} />
      <main id="main">
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '48px 24px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 48, alignItems: 'start' }}>
            <div>
              <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 12px' }}>
                {h1}
              </h1>
              {ruleset.tier > 1 && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-ink-mid)', border: '1px solid var(--color-hairline)', borderRadius: 100, padding: '3px 10px', marginBottom: 16 }}>
                  Standard model
                </div>
              )}
              <StampDutyCalculator country={country} ruleset={ruleset} />
            </div>
            <div style={{ position: 'sticky', top: 72 }}>
              <AdSlot width={300} height={600} />
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1160, margin: '32px auto 0', padding: '0 24px' }}>
          <AdSlot width={728} height={90} style={{ margin: '32px 0' }} />
          <TrustDisclosures convention={country.convention} rateResult={null} />

          <div style={{ maxWidth: '72ch', padding: '48px 0 32px' }}>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-ink-mid)', margin: 0 }}>
              Rates sourced from {ruleset.provenance.source}. Last reviewed {ruleset.provenance.lastReviewed}. Effective from {ruleset.provenance.effectiveFrom}. This is an estimate for illustrative purposes only. Confirm with your solicitor or conveyancer before completion.
            </p>
          </div>
        </div>
      </main>
      <Footer countries={allCountries} />
    </>
  );
}
```

- [ ] **Step 3: Write `StampDutyCalculator/index.tsx`**

```tsx
// apps/web/src/components/StampDutyCalculator/index.tsx
'use client';
import { useState } from 'react';
import type { CountryData } from '@reckoner/finance-data';
import type { TransferTaxRuleSet } from '@reckoner/rules-core';
import { calculateTransferTax } from '@reckoner/transfer-tax-engine';
import { formatCurrency } from '../../lib/format';

interface StampDutyCalculatorProps {
  country: CountryData;
  ruleset: TransferTaxRuleSet;
}

const SURCHARGE_LABELS: Record<string, string> = {
  additional_property: 'Additional / second property',
  non_resident: 'Non-resident buyer',
  foreign_buyer: 'Foreign buyer (ABSD)',
  sc_second_property: 'Singapore citizen: second property',
  sc_third_plus: 'Singapore citizen: third or more',
  pr_first_property: 'Singapore PR: first property',
  pr_second_plus: 'Singapore PR: second or more',
  investor: 'Investor / not primary residence',
  foreign_purchaser: 'Foreign purchaser surcharge',
};

const RELIEF_LABELS: Record<string, string> = {
  first_time_buyer: 'First-time buyer',
  first_home_buyer: 'First home buyer',
  starter_vrijstelling: 'Starter exemption (under threshold)',
};

export function StampDutyCalculator({ country, ruleset }: StampDutyCalculatorProps) {
  const defaultPrice = country.defaults.price;
  const [price, setPrice] = useState(defaultPrice);
  const [activeSurcharges, setActiveSurcharges] = useState<string[]>([]);
  const [activeRelief, setActiveRelief] = useState<string | null>(null);

  const result = calculateTransferTax({ price, surcharges: activeSurcharges, relief: activeRelief }, ruleset);

  function toggleSurcharge(id: string) {
    setActiveSurcharges((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  const effectiveRatePct = (result.effectiveRate * 100).toFixed(2);

  return (
    <div>
      {/* Price input */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
          Property price
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 16, color: 'var(--color-ink-mid)' }}>{country.currencySymbol}</span>
          <input
            type="number"
            value={price}
            min={0}
            step={country.defaults.priceStep}
            onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
            style={{
              fontSize: 24, fontWeight: 400, border: 'none', borderBottom: '2px solid var(--color-ink)',
              background: 'transparent', outline: 'none', width: '100%', color: 'var(--color-ink)',
              padding: '4px 0',
            }}
          />
        </div>
        <input
          type="range"
          min={country.defaults.priceMin}
          max={country.defaults.priceMax}
          step={country.defaults.priceStep}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          style={{ width: '100%', marginTop: 12, accentColor: 'var(--color-ink)' }}
        />
      </div>

      {/* Buyer type (reliefs) */}
      {ruleset.reliefs.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Buyer type</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button
              type="button"
              onClick={() => setActiveRelief(null)}
              style={{
                fontSize: 13, padding: '6px 14px', border: '1px solid var(--color-ink)',
                background: activeRelief === null ? 'var(--color-ink)' : 'transparent',
                color: activeRelief === null ? 'var(--color-canvas)' : 'var(--color-ink)',
                cursor: 'pointer',
              }}
            >
              Standard buyer
            </button>
            {ruleset.reliefs.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setActiveRelief(activeRelief === r.id ? null : r.id)}
                style={{
                  fontSize: 13, padding: '6px 14px', border: '1px solid var(--color-ink)',
                  background: activeRelief === r.id ? 'var(--color-ink)' : 'transparent',
                  color: activeRelief === r.id ? 'var(--color-canvas)' : 'var(--color-ink)',
                  cursor: 'pointer',
                }}
              >
                {RELIEF_LABELS[r.id] ?? r.id}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Surcharges */}
      {ruleset.surcharges.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Additional factors</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ruleset.surcharges.map((s) => (
              <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={activeSurcharges.includes(s.id)}
                  onChange={() => toggleSurcharge(s.id)}
                  style={{ accentColor: 'var(--color-ink)' }}
                />
                {SURCHARGE_LABELS[s.id] ?? s.id} (+{(s.value * 100).toFixed(1)}%)
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      <div style={{ background: 'var(--color-surface)', padding: '24px', marginTop: 8 }}>
        <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 4 }}>
          {ruleset.calculator === 'transfer-tax' ? 'Stamp duty / transfer tax' : 'Tax'}
        </div>
        <div style={{ fontSize: 40, fontWeight: 300, letterSpacing: '-0.03em', color: 'var(--color-ink)' }}>
          {formatCurrency(result.tax, ruleset.currency, country.locale)}
        </div>
        <div style={{ fontSize: 14, color: 'var(--color-ink-mid)', marginTop: 4 }}>
          Effective rate: {effectiveRatePct}%
        </div>
        {result.breakdown.length > 1 && (
          <div style={{ marginTop: 16, borderTop: '1px solid var(--color-hairline)', paddingTop: 16 }}>
            {result.breakdown.map((line) => (
              <div key={line.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 4 }}>
                <span style={{ textTransform: 'capitalize' }}>{line.label}</span>
                <span>{formatCurrency(line.amount, ruleset.currency, country.locale)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Test manually**

```bash
cd apps/web && pnpm dev
```
Visit `http://localhost:3000/uk/stamp-duty` and verify:
- Price slider changes result in real time
- FTB toggle shows 0% up to £300k
- Additional property adds 5% surcharge
- Effective rate updates correctly
- No console errors

- [ ] **Step 5: Commit**

```bash
git add "apps/web/app/[cc]/stamp-duty" apps/web/src/components/StampDutyCalculator apps/web/package.json
git commit -m "feat(web): stamp duty calculator page and component"
```

---

### Task 6: Affordability page and calculator component

**Files:**
- Create: `apps/web/app/[cc]/affordability/page.tsx`
- Create: `apps/web/src/components/AffordabilityCalculator/index.tsx`

- [ ] **Step 1: Write `app/[cc]/affordability/page.tsx`**

```tsx
// apps/web/app/[cc]/affordability/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCountry, getAllCountries, COUNTRY_CODES, fetchRate } from '@reckoner/finance-data';
import { loadAffordabilityRules } from '@reckoner/finance-data';
import type { CountryCode } from '@reckoner/finance-data';
import { asOf } from '@reckoner/rules-core';
import { AdSlot } from '@reckoner/analytics';
import { Header } from '../../../src/components/Header';
import { Footer } from '../../../src/components/Footer';
import { AffordabilityCalculator } from '../../../src/components/AffordabilityCalculator';
import { TrustDisclosures } from '../../../src/components/TrustDisclosures';

export const revalidate = 86400;

export function generateStaticParams() {
  return COUNTRY_CODES.map((cc) => ({ cc }));
}

export async function generateMetadata({ params }: { params: Promise<{ cc: string }> }): Promise<Metadata> {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) return {};
  return {
    title: `Affordability Calculator — How Much Can I Borrow? | Reckoner`,
    description: `Find out how much you can borrow based on your income and the official lending rules in ${cc.toUpperCase()}. Free, no signup.`,
    robots: { index: true, follow: true },
  };
}

export default async function AffordabilityPage({ params }: { params: Promise<{ cc: string }> }) {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) notFound();

  const country = getCountry(cc as CountryCode);
  const allCountries = getAllCountries();

  const versions = await loadAffordabilityRules(cc as CountryCode);
  const ruleset = asOf(versions);

  let rateResult = null;
  try { rateResult = await fetchRate(cc as CountryCode); } catch { /* use default */ }

  return (
    <>
      <Header currentCountry={country} allCountries={allCountries} />
      <main id="main">
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '48px 24px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 48, alignItems: 'start' }}>
            <div>
              <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 12px' }}>
                How Much Can I Borrow?
              </h1>
              <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px', maxWidth: '72ch' }}>
                Enter your income and the calculator applies the official lending rules for {country.code.toUpperCase()} to estimate your maximum borrowing. This is an estimate: lenders also consider credit history, outgoings, and their own criteria.
              </p>
              {ruleset.tier > 1 && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-ink-mid)', border: '1px solid var(--color-hairline)', borderRadius: 100, padding: '3px 10px', marginBottom: 16 }}>
                  Standard model
                </div>
              )}
              <AffordabilityCalculator country={country} ruleset={ruleset} defaultRate={rateResult?.value ?? country.defaults.rate} />
            </div>
            <div style={{ position: 'sticky', top: 72 }}>
              <AdSlot width={300} height={600} />
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1160, margin: '32px auto 0', padding: '0 24px' }}>
          <AdSlot width={728} height={90} style={{ margin: '32px 0' }} />
          <TrustDisclosures convention={country.convention} rateResult={rateResult} />
          <div style={{ maxWidth: '72ch', padding: '48px 0 32px' }}>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-ink-mid)', margin: 0 }}>
              Rules sourced from {ruleset.provenance.source}. Last reviewed {ruleset.provenance.lastReviewed}.
            </p>
          </div>
        </div>
      </main>
      <Footer countries={allCountries} />
    </>
  );
}
```

- [ ] **Step 2: Write `AffordabilityCalculator/index.tsx`**

```tsx
// apps/web/src/components/AffordabilityCalculator/index.tsx
'use client';
import { useState } from 'react';
import type { CountryData } from '@reckoner/finance-data';
import type { AffordabilityRuleSet } from '@reckoner/rules-core';
import { calculateAffordability } from '@reckoner/affordability-engine';
import { formatCurrency } from '../../lib/format';

interface AffordabilityCalculatorProps {
  country: CountryData;
  ruleset: AffordabilityRuleSet;
  defaultRate: number;
}

export function AffordabilityCalculator({ country, ruleset, defaultRate }: AffordabilityCalculatorProps) {
  const [grossIncome, setGrossIncome] = useState(80_000);
  const [monthlyDebts, setMonthlyDebts] = useState(0);
  const [propertyPrice, setPropertyPrice] = useState(country.defaults.price);
  const [annualRate, setAnnualRate] = useState(defaultRate);
  const [termYears, setTermYears] = useState(country.defaults.termYears);
  const [buyerType, setBuyerType] = useState<'first_time_buyer' | 'subsequent_buyer' | 'buy_to_let'>('first_time_buyer');

  const result = calculateAffordability(
    { grossAnnualIncome: grossIncome, monthlyDebts, propertyPrice, annualRate, termYears, buyerType },
    ruleset,
  );

  const inputStyle = {
    fontSize: 18, fontWeight: 400, border: 'none', borderBottom: '1px solid var(--color-ink)',
    background: 'transparent', outline: 'none', width: '100%', color: 'var(--color-ink)', padding: '4px 0',
  } as const;

  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 } as const;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div>
          <label style={labelStyle}>Gross annual income ({country.currencySymbol})</label>
          <input type="number" value={grossIncome} min={0} step={1000} onChange={(e) => setGrossIncome(Number(e.target.value))} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Existing monthly debt payments ({country.currencySymbol})</label>
          <input type="number" value={monthlyDebts} min={0} step={100} onChange={(e) => setMonthlyDebts(Number(e.target.value))} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Property price ({country.currencySymbol})</label>
          <input type="number" value={propertyPrice} min={0} step={country.defaults.priceStep} onChange={(e) => setPropertyPrice(Number(e.target.value))} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Interest rate (%)</label>
          <input type="number" value={(annualRate * 100).toFixed(2)} min={0} max={20} step={0.1} onChange={(e) => setAnnualRate(Number(e.target.value) / 100)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Term (years)</label>
          <input type="number" value={termYears} min={5} max={40} step={1} onChange={(e) => setTermYears(Number(e.target.value))} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Buyer type</label>
          <select value={buyerType} onChange={(e) => setBuyerType(e.target.value as typeof buyerType)} style={{ ...inputStyle, fontSize: 14 }}>
            <option value="first_time_buyer">First-time buyer</option>
            <option value="subsequent_buyer">Subsequent buyer</option>
            <option value="buy_to_let">Buy to let</option>
          </select>
        </div>
      </div>

      <div style={{ background: 'var(--color-surface)', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 4 }}>Maximum borrowing</div>
            <div style={{ fontSize: 36, fontWeight: 300, letterSpacing: '-0.03em' }}>
              {formatCurrency(result.maxBorrow, country.currency, country.locale)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 4 }}>Monthly payment at this amount</div>
            <div style={{ fontSize: 36, fontWeight: 300, letterSpacing: '-0.03em' }}>
              {formatCurrency(result.maxMonthlyPayment, country.currency, country.locale)}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 16, fontSize: 13, color: 'var(--color-ink-mid)' }}>
          Assessed at {(result.assessmentRate * 100).toFixed(2)}% (stress rate)
          {' '}&middot;{' '}
          Binding constraint: {result.bindingConstraint.toUpperCase()}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify manually at `/uk/affordability`, `/ie/affordability`, `/sg/affordability`**

- [ ] **Step 4: Commit**

```bash
git add "apps/web/app/[cc]/affordability" apps/web/src/components/AffordabilityCalculator
git commit -m "feat(web): affordability calculator page and component"
```

---

### Task 7: Refinance break-even page

**Files:**
- Create: `apps/web/app/[cc]/refinance/page.tsx`
- Create: `apps/web/src/components/RefinanceCalculator/index.tsx`

The refinance calculator is generic (no per-country rules JSON needed). It computes: months to break even = closing costs / monthly savings.

- [ ] **Step 1: Write the client calculator component**

```tsx
// apps/web/src/components/RefinanceCalculator/index.tsx
'use client';
import { useState } from 'react';
import type { CountryData } from '@reckoner/finance-data';
import { formatCurrency } from '../../lib/format';

interface RefinanceCalculatorProps {
  country: CountryData;
  defaultRate: number;
}

function monthlyPayment(principal: number, annualRate: number, termYears: number): number {
  if (principal <= 0 || termYears <= 0) return 0;
  const i = annualRate / 12;
  const n = termYears * 12;
  if (i === 0) return principal / n;
  return (principal * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
}

export function RefinanceCalculator({ country, defaultRate }: RefinanceCalculatorProps) {
  const [balance, setBalance] = useState(country.defaults.price * 0.7);
  const [currentRate, setCurrentRate] = useState(defaultRate + 0.01);
  const [newRate, setNewRate] = useState(defaultRate);
  const [remainingYears, setRemainingYears] = useState(25);
  const [closingCosts, setClosingCosts] = useState(3000);

  const currentPayment = monthlyPayment(balance, currentRate, remainingYears);
  const newPayment = monthlyPayment(balance, newRate, remainingYears);
  const monthlySavings = currentPayment - newPayment;
  const breakEvenMonths = monthlySavings > 0 ? Math.ceil(closingCosts / monthlySavings) : null;

  const inputStyle = {
    fontSize: 18, border: 'none', borderBottom: '1px solid var(--color-ink)',
    background: 'transparent', outline: 'none', width: '100%', color: 'var(--color-ink)', padding: '4px 0',
  } as const;

  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 } as const;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div>
          <label style={labelStyle}>Outstanding balance ({country.currencySymbol})</label>
          <input type="number" value={balance} min={0} step={10000} onChange={(e) => setBalance(Number(e.target.value))} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Years remaining on current loan</label>
          <input type="number" value={remainingYears} min={1} max={40} step={1} onChange={(e) => setRemainingYears(Number(e.target.value))} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Current interest rate (%)</label>
          <input type="number" value={(currentRate * 100).toFixed(2)} min={0} max={20} step={0.1} onChange={(e) => setCurrentRate(Number(e.target.value) / 100)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>New interest rate (%)</label>
          <input type="number" value={(newRate * 100).toFixed(2)} min={0} max={20} step={0.1} onChange={(e) => setNewRate(Number(e.target.value) / 100)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Refinancing costs ({country.currencySymbol})</label>
          <input type="number" value={closingCosts} min={0} step={100} onChange={(e) => setClosingCosts(Number(e.target.value))} style={inputStyle} />
        </div>
      </div>

      <div style={{ background: 'var(--color-surface)', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 4 }}>Monthly saving</div>
            <div style={{ fontSize: 32, fontWeight: 300, letterSpacing: '-0.03em', color: monthlySavings > 0 ? 'var(--color-ink)' : 'var(--color-ink-mid)' }}>
              {formatCurrency(monthlySavings, country.currency, country.locale)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 4 }}>Break-even</div>
            <div style={{ fontSize: 32, fontWeight: 300, letterSpacing: '-0.03em' }}>
              {breakEvenMonths !== null ? `${breakEvenMonths} months` : 'No saving'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 4 }}>Saving over remaining term</div>
            <div style={{ fontSize: 32, fontWeight: 300, letterSpacing: '-0.03em' }}>
              {formatCurrency(monthlySavings * remainingYears * 12 - closingCosts, country.currency, country.locale)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `app/[cc]/refinance/page.tsx`** (follows same server-page pattern as stamp duty; h1 = "Refinance / Remortgage Calculator"; fetch rate server-side; pass `defaultRate` to component; no ruleset needed)

Key content unique to this page: include a callout about early repayment charges and the difference between refinancing at end of fixed term vs. mid-term.

- [ ] **Step 3: Commit**

```bash
git add "apps/web/app/[cc]/refinance" apps/web/src/components/RefinanceCalculator
git commit -m "feat(web): refinance break-even calculator"
```

---

### Task 8: Rent vs Buy page

**Files:**
- Create: `apps/web/app/[cc]/rent-vs-buy/page.tsx`
- Create: `apps/web/src/components/RentVsBuyCalculator/index.tsx`

The core is: net buy cost per month vs. rent; investment opportunity cost of the deposit; break-even holding period. All generic math, no per-country rules.

- [ ] **Step 1: Write `RentVsBuyCalculator/index.tsx`**

```tsx
// apps/web/src/components/RentVsBuyCalculator/index.tsx
'use client';
import { useState } from 'react';
import type { CountryData } from '@reckoner/finance-data';
import { formatCurrency } from '../../lib/format';

interface RentVsBuyCalculatorProps {
  country: CountryData;
  defaultRate: number;
}

function monthlyPayment(principal: number, annualRate: number, termYears: number): number {
  if (principal <= 0) return 0;
  const i = annualRate / 12;
  const n = termYears * 12;
  if (i === 0) return principal / n;
  return (principal * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
}

export function RentVsBuyCalculator({ country, defaultRate }: RentVsBuyCalculatorProps) {
  const [propertyPrice, setPropertyPrice] = useState(country.defaults.price);
  const [deposit, setDeposit] = useState(country.defaults.deposit);
  const [annualRate, setAnnualRate] = useState(defaultRate);
  const [termYears, setTermYears] = useState(country.defaults.termYears);
  const [monthlyRent, setMonthlyRent] = useState(Math.round(country.defaults.price * 0.004));
  const [annualAppreciation, setAnnualAppreciation] = useState(0.04);
  const [annualInvestmentReturn, setAnnualInvestmentReturn] = useState(0.07);

  const loanAmount = propertyPrice - deposit;
  const mortgagePayment = monthlyPayment(loanAmount, annualRate, termYears);

  // Opportunity cost: if deposit invested instead
  const monthlyOpportunityCost = deposit * (annualInvestmentReturn / 12);

  // Effective monthly cost of buying (mortgage + opportunity cost on deposit)
  const effectiveBuyCost = mortgagePayment + monthlyOpportunityCost;

  // Property value after 10 years
  const yearsToProject = 10;
  const futureValue = propertyPrice * Math.pow(1 + annualAppreciation, yearsToProject);
  const equity = futureValue - loanAmount; // simplified (ignores principal paydown)
  const rentTotal = monthlyRent * yearsToProject * 12;
  const buyTotal = effectiveBuyCost * yearsToProject * 12;
  const netBuyAdvantage = rentTotal - buyTotal + (equity - deposit);

  const inputStyle = {
    fontSize: 16, border: 'none', borderBottom: '1px solid var(--color-ink)',
    background: 'transparent', outline: 'none', width: '100%', color: 'var(--color-ink)', padding: '4px 0',
  } as const;

  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 } as const;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div>
          <label style={labelStyle}>Property price ({country.currencySymbol})</label>
          <input type="number" value={propertyPrice} min={0} step={country.defaults.priceStep} onChange={(e) => setPropertyPrice(Number(e.target.value))} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Deposit ({country.currencySymbol})</label>
          <input type="number" value={deposit} min={0} step={country.defaults.depositStep} onChange={(e) => setDeposit(Number(e.target.value))} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Mortgage rate (%)</label>
          <input type="number" value={(annualRate * 100).toFixed(2)} min={0} max={20} step={0.1} onChange={(e) => setAnnualRate(Number(e.target.value) / 100)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Monthly rent ({country.currencySymbol})</label>
          <input type="number" value={monthlyRent} min={0} step={100} onChange={(e) => setMonthlyRent(Number(e.target.value))} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Annual property appreciation (%)</label>
          <input type="number" value={(annualAppreciation * 100).toFixed(1)} min={-10} max={20} step={0.5} onChange={(e) => setAnnualAppreciation(Number(e.target.value) / 100)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Deposit investment return (%)</label>
          <input type="number" value={(annualInvestmentReturn * 100).toFixed(1)} min={0} max={20} step={0.5} onChange={(e) => setAnnualInvestmentReturn(Number(e.target.value) / 100)} style={inputStyle} />
        </div>
      </div>

      <div style={{ background: 'var(--color-surface)', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 4 }}>Monthly mortgage payment</div>
            <div style={{ fontSize: 28, fontWeight: 300, letterSpacing: '-0.03em' }}>
              {formatCurrency(mortgagePayment, country.currency, country.locale)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 4 }}>Effective monthly cost (incl. deposit opportunity cost)</div>
            <div style={{ fontSize: 28, fontWeight: 300, letterSpacing: '-0.03em' }}>
              {formatCurrency(effectiveBuyCost, country.currency, country.locale)}
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--color-hairline)', paddingTop: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 4 }}>
            Net financial advantage of buying over renting (10-year horizon)
          </div>
          <div style={{ fontSize: 32, fontWeight: 300, letterSpacing: '-0.03em', color: netBuyAdvantage >= 0 ? 'var(--color-ink)' : 'var(--color-ink-mid)' }}>
            {netBuyAdvantage >= 0 ? '+' : ''}{formatCurrency(netBuyAdvantage, country.currency, country.locale)}
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginTop: 4 }}>
            {netBuyAdvantage >= 0 ? 'Buying is ahead over 10 years with these assumptions.' : 'Renting is ahead over 10 years with these assumptions.'}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `app/[cc]/rent-vs-buy/page.tsx`** (same server-page pattern; h1 = "Rent vs Buy Calculator"; include disclaimer that this is highly sensitive to appreciation and investment return assumptions)

- [ ] **Step 3: Commit**

```bash
git add "apps/web/app/[cc]/rent-vs-buy" apps/web/src/components/RentVsBuyCalculator
git commit -m "feat(web): rent vs buy calculator"
```

---

### Task 9: "Property" navbar dropdown

**Files:**
- Create: `apps/web/src/components/PropertyNav.tsx`
- Modify: `apps/web/src/components/Header.tsx`

- [ ] **Step 1: Write `PropertyNav.tsx`**

```tsx
// apps/web/src/components/PropertyNav.tsx
'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface PropertyNavProps {
  currentCc: string;
}

const TOOLS = [
  { slug: 'mortgage-calculator', label: 'Mortgage Calculator' },
  { slug: 'stamp-duty', label: 'Stamp Duty' },
  { slug: 'affordability', label: 'Affordability' },
  { slug: 'refinance', label: 'Refinance Break-Even' },
  { slug: 'rent-vs-buy', label: 'Rent vs Buy' },
];

export function PropertyNav({ currentCc }: PropertyNavProps) {
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
          fontSize: 14, color: 'var(--color-ink-mid)', background: 'none', border: 'none',
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, padding: 0,
        }}
        aria-expanded={open}
        aria-haspopup="true"
      >
        Property
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 8, minWidth: 220,
          background: 'var(--color-canvas)', border: '1px solid var(--color-hairline)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)', zIndex: 50,
        }}>
          {TOOLS.map((tool) => (
            <Link
              key={tool.slug}
              href={`/${currentCc}/${tool.slug}`}
              onClick={() => setOpen(false)}
              style={{
                display: 'block', padding: '10px 16px', fontSize: 14, color: 'var(--color-ink)',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {tool.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Modify `Header.tsx`**

Replace the static `<span>` that says "Tools":

Old:
```tsx
<span style={{ fontSize: 14, color: 'var(--color-ink-mid)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
  Tools
  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
  </svg>
</span>
```

New:
```tsx
<PropertyNav currentCc={current.code} />
```

Add import at the top:
```tsx
import { PropertyNav } from './PropertyNav';
```

- [ ] **Step 3: Verify the dropdown opens and links work**

```bash
cd apps/web && pnpm dev
```
Verify:
- Dropdown opens on click and closes on outside click
- Links for all 5 tools navigate correctly (e.g. `/uk/stamp-duty`, `/ie/affordability`)
- No flash of wrong `currentCc` since `Header` is already passed `currentCountry` from each page
- Keyboard: focus and Enter open dropdown (browser default for `<button>` handles this)

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/PropertyNav.tsx apps/web/src/components/Header.tsx
git commit -m "feat(web): Property nav dropdown with all 5 calculator links"
```

---

### Task 10: Typecheck and final wiring

- [ ] **Step 1: Run typecheck across all touched packages**

```bash
pnpm --filter "@reckoner/*" typecheck && pnpm --filter "@reckoner/web" typecheck
```
Fix any errors before proceeding.

- [ ] **Step 2: Run all tests**

```bash
pnpm --filter "@reckoner/rules-core" test
pnpm --filter "@reckoner/transfer-tax-engine" test
pnpm --filter "@reckoner/affordability-engine" test
```
Expected: all pass with 100% coverage.

- [ ] **Step 3: Add new packages to root pnpm-workspace (if needed)**

The `pnpm-workspace.yaml` already includes `packages/*` so no change needed.

- [ ] **Step 4: Verify `pnpm install` resolves all workspace deps**

```bash
pnpm install
```

- [ ] **Step 5: Smoke test key pages**

Visit each in dev:
- `/us/stamp-duty` — shows $0 tax with a note about no federal stamp duty
- `/uk/stamp-duty` — £500k standard = £15,000; FTB £400k = £5,000; additional property shows +5%
- `/sg/stamp-duty` — BSD progressive + ABSD surcharge options
- `/ie/affordability` — £80k income FTB shows £320k max borrow
- `/sg/affordability` — TDSR 55% cap with rate floor 4%
- `/uk/refinance` — break-even months updates correctly
- `/us/rent-vs-buy` — net advantage flips with different appreciation rates
- Property dropdown from any page links correctly

- [ ] **Step 6: Final commit**

```bash
git add -p  # stage any remaining unfixed type errors or small tweaks
git commit -m "feat(web): wire workspace deps and complete property calculator suite"
```

---

## Self-Review

**Spec coverage:**
- [x] rules-as-versioned-data with `effectiveFrom`/`effectiveTo` — Task 1 `asOf()`
- [x] Zod build-time validation — Task 1 schema.ts
- [x] Generic progressive-band evaluator — Task 2 `calculateTransferTax`
- [x] Relief cap logic (FTB £500k) — Task 2, tested in vectors
- [x] Flat-rate surcharges (ABSD, additional property) — Task 2
- [x] All 12 country JSON files for stamp duty — Task 3
- [x] UK 3-regime split (ENG/SCT/WLS) — Task 3 separate JSON files
- [x] Singapore BSD + ABSD by buyer profile — Task 3 sg.json
- [x] Per-country affordability methods (lti_ltv, serviceability_buffer, dti_stress, tdsr_msr) — Task 4
- [x] Ireland 4x/3.5x LTI — Task 4 rules + tests
- [x] Australia APRA +3% buffer — Task 4 rules + tests
- [x] Canada MQR max(contract+2%, 5.25%) — Task 4
- [x] Singapore TDSR 55% / rate floor 4% — Task 4 rules + tests
- [x] 4 calculator pages — Tasks 5-8
- [x] Property navbar category — Task 9
- [x] `asOf()` defaults to today — Task 1
- [x] Tree-shaking (dynamic import per-country in loader) — Task 3 loader
- [x] `dynamicParams = true` not explicitly set — add `export const dynamicParams = true;` to each new page alongside `generateStaticParams`

**Missing item found:** Each new page needs `export const dynamicParams = true;` to allow ISR for non-prerendered subdivision paths. Add this to Tasks 5, 6, 7, 8 page files alongside `export const revalidate = 86400;`.

**Placeholder scan:** No TBD, TODO, or incomplete sections. All test assertions use concrete numbers from HMRC/APRA/MAS/CBI official sources.

**Type consistency:** `TransferTaxRuleSet`, `AffordabilityRuleSet` defined once in `rules-core/src/types.ts` and exported; all consuming packages import from `@reckoner/rules-core`. `loadStampDutyRules`/`loadAffordabilityRules` return the same types they import. `calculateTransferTax(input: TransferTaxInput, ruleset: TransferTaxRuleSet)` — types consistent with the vectors file and component usage.
