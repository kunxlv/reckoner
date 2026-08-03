# Sub-project 2: Loans Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `loan-engine` package with APR calculation, then add personal loan and auto loan calculators at `/{cc}/loans/personal-loan` and `/{cc}/loans/auto-loan`, a per-country loans hub at `/{cc}/loans/`, and activate the Loans nav dropdown.

**Architecture:** A new `packages/loan-engine` package wraps `@reckoner/mortgage-engine`'s `calculate()` (pure amortization engine) and adds APR computation via Newton-Raphson IRR and auto loan capitalization helpers. Calculator pages follow the existing property calculator pattern: server-rendered page with `revalidate = 86400`, a `'use client'` calculator component, and a recharts chart via the dynamic-import SSR guard. `LoanBalanceChart` is a single chart component reused by both calculators.

**Tech Stack:** TypeScript strict, Vitest 2 (100% coverage on engine), Next.js 15 App Router ISR, recharts 3 (dynamic import), CSS custom properties, pnpm workspace.

## Global Constraints

- All colours via `var(--color-*)` — no hardcoded hex.
- `revalidate = 86400` and `dynamicParams = true` on every calculator page and hub page.
- `currentTool` props: `"loans/personal-loan"`, `"loans/auto-loan"`, `"loans"` (hub).
- Import paths in `/{cc}/loans/{slug}/page.tsx` use `'../../../../src/components/'` (4 levels).
- Import paths in `/{cc}/loans/page.tsx` (hub) use `'../../../src/components/'` (3 levels).
- `loan-engine` package: 100% line/function/branch/statement coverage on `src/**/*.ts`.
- `convention: 'standardMonthly'` and `periodsPerYear: 12` for all loan calculations.
- `termYears: termMonths / 12` when calling `@reckoner/mortgage-engine`'s `calculate()`.
- APR computed by Newton-Raphson only when fee > 0; otherwise APR === annualRate.
- No hardcoded hex in any component or page.
- `getLoanSitemapEntries()` returns exactly 24 entries (2 slugs × 12 countries, priority 0.8).
- `TrustDisclosures` extended with `{ type: 'personal-loan' }` and `{ type: 'auto-loan' }` variants.
- `LOANS_TOOLS` in `Header.tsx`: `personal-loan` and `auto-loan` must have `comingSoon` removed (active).

---

### Task 1: `packages/loan-engine` — engine, APR, auto loan

**Files:**
- Create: `packages/loan-engine/package.json`
- Create: `packages/loan-engine/tsconfig.json`
- Create: `packages/loan-engine/vitest.config.ts`
- Create: `packages/loan-engine/src/types.ts`
- Create: `packages/loan-engine/src/apr.ts`
- Create: `packages/loan-engine/src/calculate.ts`
- Create: `packages/loan-engine/src/autoLoan.ts`
- Create: `packages/loan-engine/src/index.ts`
- Create: `packages/loan-engine/__tests__/apr.test.ts`
- Create: `packages/loan-engine/__tests__/calculate.test.ts`
- Create: `packages/loan-engine/__tests__/autoLoan.test.ts`

**Interfaces:**
- Consumes: `calculate` from `@reckoner/mortgage-engine`; `AmortizationRow` from `@reckoner/mortgage-engine`
- Produces:
  - `computeAPR(netAmount: number, payment: number, termMonths: number): number`
  - `calculateLoan(input: LoanCalcInput): LoanCalcResult`
  - `calculateAutoLoan(input: AutoLoanInput): AutoLoanResult`
  - Types: `LoanCalcInput`, `LoanCalcResult`, `AutoLoanInput`, `AutoLoanResult`, `AmortizationRow` (re-exported)

- [ ] **Step 1: Write failing tests for `computeAPR`**

Create `packages/loan-engine/__tests__/apr.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { computeAPR } from '../src/apr';

describe('computeAPR', () => {
  it('returns 0 for zero netAmount', () => {
    expect(computeAPR(0, 212.47, 60)).toBe(0);
  });

  it('returns 0 for zero payment', () => {
    expect(computeAPR(10000, 0, 60)).toBe(0);
  });

  it('returns 0 for zero termMonths', () => {
    expect(computeAPR(10000, 212.47, 0)).toBe(0);
  });

  it('recovers 10% annual rate from matching payment', () => {
    // At 10% annual: PMT for $10,000 over 60 months ≈ 212.47
    const apr = computeAPR(10000, 212.47, 60);
    expect(apr).toBeCloseTo(0.10, 4);
  });

  it('APR > annualRate when net amount is less than principal', () => {
    // $10,000 loan at 10%, but consumer receives only $9,500 (=$500 fee)
    // Payment stays at $212.47 (same as 10% loan on $10,000)
    const apr = computeAPR(9500, 212.47, 60);
    expect(apr).toBeGreaterThan(0.10);
    expect(apr).toBeLessThan(0.14); // sanity bound
  });

  it('converges for small rates', () => {
    // 3% annual: PMT for $5,000 over 36 months ≈ 145.43
    const apr = computeAPR(5000, 145.43, 36);
    expect(apr).toBeCloseTo(0.03, 4);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /path/to/repo && pnpm install && cd packages/loan-engine && pnpm test
```
Expected: module not found — `apr.ts` doesn't exist yet.

- [ ] **Step 3: Create `packages/loan-engine/package.json`**

```json
{
  "name": "@reckoner/loan-engine",
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
    "@reckoner/mortgage-engine": "workspace:*"
  },
  "devDependencies": {
    "@reckoner/config": "workspace:*",
    "@vitest/coverage-v8": "^2",
    "typescript": "^5",
    "vitest": "^2"
  }
}
```

- [ ] **Step 4: Create `packages/loan-engine/tsconfig.json`**

```json
{
  "extends": "@reckoner/config/tsconfig",
  "include": ["src/**/*", "__tests__/**/*"]
}
```

- [ ] **Step 5: Create `packages/loan-engine/vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/types.ts'],
      thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
    },
  },
});
```

- [ ] **Step 6: Create `packages/loan-engine/src/types.ts`**

```typescript
import type { AmortizationRow } from '@reckoner/mortgage-engine';
export type { AmortizationRow };

export interface LoanCalcInput {
  /** Loan principal in local currency units */
  principal: number;
  /** Annual nominal rate as decimal: 0.12 = 12% */
  annualRate: number;
  /** Loan term in months */
  termMonths: number;
  /** Flat origination fee deducted from disbursed amount (affects APR) */
  originationFee?: number;
}

export interface LoanCalcResult {
  monthlyPayment: number;
  totalInterest: number;
  /** monthlyPayment × termMonths */
  totalCost: number;
  /** annualRate when no fee; IRR-based APR when originationFee > 0 */
  apr: number;
  schedule: AmortizationRow[];
}

export interface AutoLoanInput {
  vehiclePrice: number;
  /** Cash down payment (not financed) */
  downPayment: number;
  /** Trade-in value (not financed) */
  tradeInValue: number;
  /** Sales tax as decimal: 0.07 = 7%. Use 0 where tax is included in listed price. */
  salesTaxRate: number;
  annualRate: number;
  termMonths: number;
  /** Dealer documentation fee rolled into the loan (affects APR) */
  docFee?: number;
}

export interface AutoLoanResult {
  /** vehicle price + tax − down payment − trade-in + doc fee (clamped to 0) */
  financedAmount: number;
  monthlyPayment: number;
  totalInterest: number;
  /** Total out-of-pocket = monthlyPayment × termMonths + downPayment + tradeInValue */
  totalCost: number;
  apr: number;
  schedule: AmortizationRow[];
}
```

- [ ] **Step 7: Create `packages/loan-engine/src/apr.ts`**

```typescript
/**
 * Newton-Raphson IRR: finds monthly rate r such that
 *   netAmount = payment × (1 − (1+r)^−n) / r
 * Returns annual rate (r × 12).
 */
export function computeAPR(
  netAmount: number,
  payment: number,
  termMonths: number,
): number {
  if (netAmount <= 0 || payment <= 0 || termMonths <= 0) return 0;

  // Initial guess: approximate monthly rate from simple interest
  let r = Math.max(payment / netAmount / termMonths, 1e-6);

  for (let iter = 0; iter < 200; iter++) {
    const pow = Math.pow(1 + r, -termMonths);
    const pv = payment * (1 - pow) / r;
    // Derivative of pv with respect to r
    const dpv = payment * (
      (termMonths * pow) / (r * (1 + r)) -
      (1 - pow) / (r * r)
    );
    const delta = (pv - netAmount) / dpv;
    r -= delta;
    if (r < 1e-12) r = 1e-12; // clamp away from zero/negative
    if (Math.abs(delta) < 1e-12) break;
  }

  return r * 12;
}
```

- [ ] **Step 8: Run apr tests to verify they pass**

```bash
cd packages/loan-engine && pnpm install && pnpm test -- --testPathPattern=apr
```
Expected: 6/6 passing.

- [ ] **Step 9: Write failing tests for `calculateLoan`**

Create `packages/loan-engine/__tests__/calculate.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateLoan } from '../src/calculate';

describe('calculateLoan', () => {
  it('computes monthly payment for a 36-month 10% loan', () => {
    // PMT = 10000 × (0.10/12) / (1 − (1 + 0.10/12)^−36) ≈ 322.67
    const result = calculateLoan({ principal: 10000, annualRate: 0.10, termMonths: 36 });
    expect(result.monthlyPayment).toBeCloseTo(322.67, 1);
  });

  it('total interest is positive for non-zero rate', () => {
    const result = calculateLoan({ principal: 10000, annualRate: 0.10, termMonths: 36 });
    expect(result.totalInterest).toBeGreaterThan(0);
    expect(result.totalInterest).toBeCloseTo(1616, 0);
  });

  it('totalCost = monthlyPayment × termMonths', () => {
    const result = calculateLoan({ principal: 10000, annualRate: 0.10, termMonths: 36 });
    expect(result.totalCost).toBeCloseTo(result.monthlyPayment * 36, 2);
  });

  it('APR equals annualRate when no origination fee', () => {
    const result = calculateLoan({ principal: 10000, annualRate: 0.10, termMonths: 36 });
    expect(result.apr).toBe(0.10);
  });

  it('APR > annualRate when origination fee is charged', () => {
    const noFee = calculateLoan({ principal: 10000, annualRate: 0.10, termMonths: 36 });
    const withFee = calculateLoan({ principal: 10000, annualRate: 0.10, termMonths: 36, originationFee: 300 });
    expect(withFee.apr).toBeGreaterThan(noFee.apr);
    expect(withFee.monthlyPayment).toBeCloseTo(noFee.monthlyPayment, 4);
  });

  it('zero rate produces zero interest', () => {
    const result = calculateLoan({ principal: 6000, annualRate: 0, termMonths: 12 });
    expect(result.totalInterest).toBeCloseTo(0, 4);
    expect(result.monthlyPayment).toBeCloseTo(500, 2);
    expect(result.apr).toBe(0);
  });

  it('schedule has termMonths rows', () => {
    const result = calculateLoan({ principal: 10000, annualRate: 0.08, termMonths: 60 });
    expect(result.schedule).toHaveLength(60);
  });

  it('final schedule balance is approximately zero', () => {
    const result = calculateLoan({ principal: 10000, annualRate: 0.08, termMonths: 60 });
    expect(result.schedule[59]!.balance).toBeCloseTo(0, 4);
  });
});
```

- [ ] **Step 10: Create `packages/loan-engine/src/calculate.ts`**

```typescript
import { calculate } from '@reckoner/mortgage-engine';
import { computeAPR } from './apr';
import type { LoanCalcInput, LoanCalcResult } from './types';

export function calculateLoan(input: LoanCalcInput): LoanCalcResult {
  const { principal, annualRate, termMonths, originationFee = 0 } = input;

  const engineResult = calculate({
    principal,
    annualRate,
    termYears: termMonths / 12,
    periodsPerYear: 12,
    convention: 'standardMonthly',
  });

  const monthlyPayment = engineResult.payment;
  const totalInterest = engineResult.totalInterest;
  const totalCost = monthlyPayment * termMonths;

  const apr = originationFee > 0
    ? computeAPR(principal - originationFee, monthlyPayment, termMonths)
    : annualRate;

  return {
    monthlyPayment,
    totalInterest,
    totalCost,
    apr,
    schedule: engineResult.rows,
  };
}
```

- [ ] **Step 11: Write failing tests for `calculateAutoLoan`**

Create `packages/loan-engine/__tests__/autoLoan.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateAutoLoan } from '../src/autoLoan';

describe('calculateAutoLoan', () => {
  it('computes financed amount correctly', () => {
    // 25000 + 25000×0.07 − 5000 − 3000 = 18750
    const result = calculateAutoLoan({
      vehiclePrice: 25000, downPayment: 5000, tradeInValue: 3000,
      salesTaxRate: 0.07, annualRate: 0.06, termMonths: 60,
    });
    expect(result.financedAmount).toBeCloseTo(18750, 2);
  });

  it('computes monthly payment on financed amount', () => {
    // PMT for 18750 at 6% over 60 months ≈ 362.45
    const result = calculateAutoLoan({
      vehiclePrice: 25000, downPayment: 5000, tradeInValue: 3000,
      salesTaxRate: 0.07, annualRate: 0.06, termMonths: 60,
    });
    expect(result.monthlyPayment).toBeCloseTo(362.45, 0);
  });

  it('totalCost includes down payment and trade-in', () => {
    const result = calculateAutoLoan({
      vehiclePrice: 25000, downPayment: 5000, tradeInValue: 3000,
      salesTaxRate: 0.07, annualRate: 0.06, termMonths: 60,
    });
    const expectedPayments = result.monthlyPayment * 60;
    expect(result.totalCost).toBeCloseTo(expectedPayments + 5000 + 3000, 0);
  });

  it('clamps financed amount to zero when down+trade-in exceeds price+tax', () => {
    const result = calculateAutoLoan({
      vehiclePrice: 20000, downPayment: 15000, tradeInValue: 10000,
      salesTaxRate: 0, annualRate: 0.05, termMonths: 48,
    });
    expect(result.financedAmount).toBe(0);
    expect(result.monthlyPayment).toBe(0);
    expect(result.schedule).toHaveLength(0);
  });

  it('APR equals annualRate when no doc fee', () => {
    const result = calculateAutoLoan({
      vehiclePrice: 25000, downPayment: 5000, tradeInValue: 0,
      salesTaxRate: 0, annualRate: 0.05, termMonths: 60,
    });
    expect(result.apr).toBe(0.05);
  });

  it('APR > annualRate when doc fee is charged', () => {
    const noDee = calculateAutoLoan({
      vehiclePrice: 25000, downPayment: 5000, tradeInValue: 0,
      salesTaxRate: 0, annualRate: 0.05, termMonths: 60,
    });
    const withFee = calculateAutoLoan({
      vehiclePrice: 25000, downPayment: 5000, tradeInValue: 0,
      salesTaxRate: 0, annualRate: 0.05, termMonths: 60, docFee: 500,
    });
    expect(withFee.apr).toBeGreaterThan(noDee.apr);
  });

  it('zero salesTaxRate: financed = price - down - tradeIn + docFee', () => {
    const result = calculateAutoLoan({
      vehiclePrice: 30000, downPayment: 6000, tradeInValue: 2000,
      salesTaxRate: 0, annualRate: 0.07, termMonths: 48, docFee: 300,
    });
    expect(result.financedAmount).toBeCloseTo(22300, 2);
  });

  it('schedule length equals termMonths', () => {
    const result = calculateAutoLoan({
      vehiclePrice: 25000, downPayment: 5000, tradeInValue: 0,
      salesTaxRate: 0, annualRate: 0.06, termMonths: 48,
    });
    expect(result.schedule).toHaveLength(48);
  });
});
```

- [ ] **Step 12: Create `packages/loan-engine/src/autoLoan.ts`**

```typescript
import { calculate } from '@reckoner/mortgage-engine';
import { computeAPR } from './apr';
import type { AutoLoanInput, AutoLoanResult } from './types';

export function calculateAutoLoan(input: AutoLoanInput): AutoLoanResult {
  const {
    vehiclePrice,
    downPayment,
    tradeInValue,
    salesTaxRate,
    annualRate,
    termMonths,
    docFee = 0,
  } = input;

  const salesTaxAmount = vehiclePrice * salesTaxRate;
  const financedAmount = Math.max(
    0,
    vehiclePrice + salesTaxAmount - downPayment - tradeInValue + docFee,
  );

  if (financedAmount === 0) {
    return {
      financedAmount: 0,
      monthlyPayment: 0,
      totalInterest: 0,
      totalCost: vehiclePrice + salesTaxAmount,
      apr: annualRate,
      schedule: [],
    };
  }

  const engineResult = calculate({
    principal: financedAmount,
    annualRate,
    termYears: termMonths / 12,
    periodsPerYear: 12,
    convention: 'standardMonthly',
  });

  const monthlyPayment = engineResult.payment;
  const totalInterest = engineResult.totalInterest;
  const totalCost = monthlyPayment * termMonths + downPayment + tradeInValue;

  const netAmount = financedAmount - docFee;
  const apr = docFee > 0
    ? computeAPR(netAmount, monthlyPayment, termMonths)
    : annualRate;

  return {
    financedAmount,
    monthlyPayment,
    totalInterest,
    totalCost,
    apr,
    schedule: engineResult.rows,
  };
}
```

- [ ] **Step 13: Create `packages/loan-engine/src/index.ts`**

```typescript
export { computeAPR } from './apr';
export { calculateLoan } from './calculate';
export { calculateAutoLoan } from './autoLoan';
export type {
  LoanCalcInput,
  LoanCalcResult,
  AutoLoanInput,
  AutoLoanResult,
  AmortizationRow,
} from './types';
```

- [ ] **Step 14: Run all tests and verify 100% coverage**

```bash
cd packages/loan-engine && pnpm test
```
Expected: all tests pass with 100% line/function/branch/statement coverage.

- [ ] **Step 15: Typecheck**

```bash
cd packages/loan-engine && pnpm typecheck
```
Expected: no errors.

- [ ] **Step 16: Install the package into the web app**

Edit `apps/web/package.json` — add to the `"dependencies"` block:
```json
"@reckoner/loan-engine": "workspace:*",
```

Then from repo root:
```bash
pnpm install
```

- [ ] **Step 17: Commit**

```bash
git add packages/loan-engine/ apps/web/package.json pnpm-lock.yaml
git commit -m "feat(loan-engine): add calculateLoan, calculateAutoLoan, computeAPR with 100% coverage"
```

---

### Task 2: Personal loan calculator — TrustDisclosures, component, chart, page

**Files:**
- Modify: `apps/web/src/components/TrustDisclosures.tsx`
- Create: `apps/web/src/components/PersonalLoanCalculator/index.tsx`
- Create: `apps/web/src/components/PersonalLoanCalculator/LoanBalanceChart.tsx`
- Create: `apps/web/src/components/PersonalLoanCalculator/LoanBalanceChartInner.tsx`
- Create: `apps/web/app/[cc]/loans/personal-loan/page.tsx`

**Interfaces:**
- Consumes: `calculateLoan`, `LoanCalcResult`, `AmortizationRow` from `@reckoner/loan-engine` (Task 1); `CountryData` from `@reckoner/finance-data`; `getToolMetadata` from `@reckoner/seo`
- Produces: `<PersonalLoanCalculator country={CountryData} defaultRate={number} />` + route `/{cc}/loans/personal-loan`

- [ ] **Step 1: Extend `TrustDisclosures.tsx` with personal-loan and auto-loan context types**

Open `apps/web/src/components/TrustDisclosures.tsx`.

At the top, the `CalculatorContext` type currently ends with `| { type: 'rent-vs-buy' }`. Add two new variants:

```typescript
export type CalculatorContext =
  | { type: 'mortgage'; convention: ConventionId }
  | { type: 'stamp-duty' }
  | { type: 'affordability'; method: AffordabilityMethod }
  | { type: 'refinance' }
  | { type: 'rent-vs-buy' }
  | { type: 'personal-loan' }
  | { type: 'auto-loan' };
```

Add a `PersonalLoanFormula` component after the existing `RentVsBuyFormula` function:

```tsx
function PersonalLoanFormula() {
  return (
    <div style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--color-ink-deep)', display: 'grid', gap: 12 }}>
      <p style={{ margin: 0 }}>
        Your payment is fixed so the loan reaches exactly zero at the end of the term (standard annuity):
      </p>
      {pre(`M = P × [ i(1+i)^n ] / [ (1+i)^n − 1 ]

  P  loan principal
  n  term in months
  i  annual rate ÷ 12`)}
      <p style={{ margin: 0 }}>
        <strong style={{ fontWeight: 500 }}>APR (when an origination fee is charged):</strong>{' '}
        The APR is the annual rate {code('r')} that makes the present value of all payments equal
        to the net amount you actually receive ({code('principal − fee')}). It is solved numerically:
      </p>
      {pre(`principal − fee = M × [ (1+r)^n − 1 ] / [ r(1+r)^n ]`)}
      <p style={{ margin: 0 }}>
        When there is no fee, APR equals the nominal rate. The APR is always higher than the
        nominal rate when a fee is deducted before disbursement.
      </p>
    </div>
  );
}
```

Add an `AutoLoanFormula` component after `PersonalLoanFormula`:

```tsx
function AutoLoanFormula() {
  return (
    <div style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--color-ink-deep)', display: 'grid', gap: 12 }}>
      <p style={{ margin: 0 }}>
        The amount financed is the vehicle price plus sales tax, minus your down payment and trade-in value, plus any dealer documentation fee:
      </p>
      {pre(`financed = vehicle price × (1 + tax rate) − down payment − trade-in + doc fee`)}
      <p style={{ margin: 0 }}>
        The monthly payment is then the standard annuity on the financed amount:
      </p>
      {pre(`M = F × [ i(1+i)^n ] / [ (1+i)^n − 1 ]

  F  financed amount
  n  term in months
  i  annual rate ÷ 12`)}
      <p style={{ margin: 0 }}>
        <strong style={{ fontWeight: 500 }}>APR (when a doc fee is charged):</strong>{' '}
        The doc fee is rolled into the loan but is not part of the net proceeds you receive.
        APR is the rate that equates your net proceeds ({code('financed − doc fee')}) to the
        present value of all payments.
      </p>
    </div>
  );
}
```

In the `TrustDisclosures` component JSX, inside `<AccordionItem label="How this is calculated" ...>`, add the two new branches alongside the existing ones:

```tsx
{context.type === 'personal-loan' && <PersonalLoanFormula />}
{context.type === 'auto-loan' && <AutoLoanFormula />}
```

Also update the `showRateSection` logic. Currently it is:
```typescript
const showRateSection = context.type !== 'stamp-duty';
```
Change it to:
```typescript
const showRateSection = context.type !== 'stamp-duty' && context.type !== 'personal-loan' && context.type !== 'auto-loan';
```
(Loan calculators don't use a live prefilled rate, so the "Where the rate comes from" section is hidden.)

- [ ] **Step 2: Typecheck TrustDisclosures**

```bash
cd apps/web && pnpm typecheck
```
Expected: no errors.

- [ ] **Step 3: Create `apps/web/src/components/PersonalLoanCalculator/LoanBalanceChartInner.tsx`**

```tsx
'use client';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import type { AmortizationRow } from '@reckoner/loan-engine';

interface Props {
  schedule: AmortizationRow[];
  currency: string;
  locale: string;
}

export default function LoanBalanceChartInner({ schedule, currency, locale }: Props) {
  const fmt = (v: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(v);

  // Sample to at most 60 points for readability
  const step = Math.max(1, Math.floor(schedule.length / 60));
  const data = schedule
    .filter((_, i) => i % step === 0 || i === schedule.length - 1)
    .map((row) => ({
      month: row.period,
      balance: Math.max(0, row.balance),
      interest: row.cumulativeInterest,
    }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hairline)" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={fmt}
          width={80}
        />
        <Tooltip formatter={(v: number) => fmt(v)} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Line
          type="monotone"
          dataKey="balance"
          stroke="var(--color-ink)"
          strokeWidth={2}
          dot={false}
          name="Remaining balance"
        />
        <Line
          type="monotone"
          dataKey="interest"
          stroke="var(--color-interest)"
          strokeWidth={2}
          dot={false}
          name="Cumulative interest"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 4: Create `apps/web/src/components/PersonalLoanCalculator/LoanBalanceChart.tsx`**

```tsx
'use client';
import dynamic from 'next/dynamic';
import type { AmortizationRow } from '@reckoner/loan-engine';

interface LoanBalanceChartProps {
  schedule: AmortizationRow[];
  currency: string;
  locale: string;
}

const Inner = dynamic(() => import('./LoanBalanceChartInner'), { ssr: false });

export function LoanBalanceChart(props: LoanBalanceChartProps) {
  if (props.schedule.length === 0) return null;
  return <Inner {...props} />;
}
```

- [ ] **Step 5: Create `apps/web/src/components/PersonalLoanCalculator/index.tsx`**

```tsx
'use client';
import { useState } from 'react';
import type { CountryData } from '@reckoner/finance-data';
import { calculateLoan } from '@reckoner/loan-engine';
import { formatCurrency } from '../../lib/format';
import { LoanBalanceChart } from './LoanBalanceChart';

interface PersonalLoanCalculatorProps {
  country: CountryData;
  defaultRate: number;
  defaultAmount: number;
  defaultTermMonths: number;
}

const inputStyle = {
  fontSize: 18,
  fontWeight: 400,
  border: 'none',
  borderBottom: '1px solid var(--color-ink)',
  background: 'transparent',
  outline: 'none',
  width: '100%',
  color: 'var(--color-ink)',
  padding: '4px 0',
} as const;

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  marginBottom: 6,
  color: 'var(--color-ink-mid)',
} as const;

const TERM_OPTIONS = [12, 24, 36, 48, 60, 72, 84] as const;

export function PersonalLoanCalculator({
  country,
  defaultRate,
  defaultAmount,
  defaultTermMonths,
}: PersonalLoanCalculatorProps) {
  const [amount, setAmount] = useState(defaultAmount);
  const [rate, setRate] = useState(defaultRate * 100);
  const [termMonths, setTermMonths] = useState(defaultTermMonths);
  const [originationFee, setOriginationFee] = useState(0);

  const result = calculateLoan({
    principal: amount,
    annualRate: rate / 100,
    termMonths,
    originationFee: originationFee || undefined,
  });

  const { monthlyPayment, totalInterest, totalCost, apr, schedule } = result;

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          marginBottom: 24,
        }}
      >
        <div>
          <label style={labelStyle}>
            Loan amount ({country.currencySymbol})
          </label>
          <input
            type="number"
            value={amount}
            min={100}
            step={500}
            onChange={(e) => setAmount(Number(e.target.value))}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Annual interest rate (%)</label>
          <input
            type="number"
            value={rate}
            min={0}
            max={50}
            step={0.1}
            onChange={(e) => setRate(Number(e.target.value))}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Loan term (months)</label>
          <select
            value={termMonths}
            onChange={(e) => setTermMonths(Number(e.target.value))}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            {TERM_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t} months ({(t / 12).toFixed(t % 12 === 0 ? 0 : 1)} yr)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>
            Origination fee ({country.currencySymbol}, optional)
          </label>
          <input
            type="number"
            value={originationFee}
            min={0}
            step={50}
            onChange={(e) => setOriginationFee(Number(e.target.value))}
            style={inputStyle}
          />
        </div>
      </div>

      <div
        style={{
          background: 'var(--color-surface)',
          padding: '24px',
          marginBottom: 32,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr',
            gap: 24,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 13,
                color: 'var(--color-ink-mid)',
                marginBottom: 4,
              }}
            >
              Monthly payment
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 300,
                letterSpacing: '-0.03em',
                color: 'var(--color-ink)',
              }}
            >
              {formatCurrency(monthlyPayment, country.currency, country.locale)}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                color: 'var(--color-ink-mid)',
                marginBottom: 4,
              }}
            >
              Total interest
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 300,
                letterSpacing: '-0.03em',
                color: 'var(--color-interest)',
              }}
            >
              {formatCurrency(totalInterest, country.currency, country.locale)}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                color: 'var(--color-ink-mid)',
                marginBottom: 4,
              }}
            >
              Total cost
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 300,
                letterSpacing: '-0.03em',
                color: 'var(--color-ink)',
              }}
            >
              {formatCurrency(totalCost, country.currency, country.locale)}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                color: 'var(--color-ink-mid)',
                marginBottom: 4,
              }}
            >
              APR
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 300,
                letterSpacing: '-0.03em',
                color: 'var(--color-ink)',
              }}
            >
              {(apr * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
        Balance and cumulative interest over time
      </div>
      <div
        style={{
          fontSize: 13,
          color: 'var(--color-ink-mid)',
          marginBottom: 16,
        }}
      >
        Month-by-month breakdown
      </div>
      <LoanBalanceChart
        schedule={schedule}
        currency={country.currency}
        locale={country.locale}
      />
    </div>
  );
}
```

- [ ] **Step 6: Create `apps/web/app/[cc]/loans/personal-loan/page.tsx`**

First create the directory:
```bash
mkdir -p "apps/web/app/[cc]/loans/personal-loan"
```

Then create the page file:

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCountry, getAllCountries, COUNTRY_CODES } from '@reckoner/finance-data';
import type { CountryCode } from '@reckoner/finance-data';
import { getToolMetadata } from '@reckoner/seo';
import { AdSlot } from '@reckoner/analytics';
import { Header } from '../../../../src/components/Header';
import { Footer } from '../../../../src/components/Footer';
import { PersonalLoanCalculator } from '../../../../src/components/PersonalLoanCalculator';
import { TrustDisclosures } from '../../../../src/components/TrustDisclosures';

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return COUNTRY_CODES.map((cc) => ({ cc }));
}

const H1: Record<string, string> = {
  us: 'Personal Loan Calculator',
  uk: 'Personal Loan Calculator',
  ca: 'Personal Loan Calculator',
  au: 'Personal Loan Calculator',
  ie: 'Personal Loan Calculator',
  de: 'Privatkredit Rechner',
  nl: 'Persoonlijke Lening Berekenen',
  nz: 'Personal Loan Calculator',
  fr: 'Calculateur de Prêt Personnel',
  es: 'Calculadora de Préstamo Personal',
  sg: 'Personal Loan Calculator',
  in: 'Personal Loan EMI Calculator',
};

const INTRO: Record<string, string> = {
  us: 'Enter your loan amount, interest rate and term to see your monthly payment, total interest, and full repayment schedule. If your lender charges an origination fee, add it to see your true APR.',
  uk: 'Enter your loan amount, interest rate and term to see your monthly payment, total interest, and full repayment schedule. Adding a fee shows your true APR.',
  ca: 'Enter your loan amount, interest rate and term. Canadian personal loans typically use monthly compounding on the stated rate.',
  au: 'Enter your loan amount, interest rate and term. Australian personal loan rates are quoted as comparison rates — use the actual interest rate for this calculator.',
  ie: 'Enter your loan amount, interest rate and term. If your lender quotes an APR, use the underlying interest rate to see how the payment is built up.',
  de: 'Geben Sie Darlehensbetrag, Zinssatz und Laufzeit ein, um Ihre monatliche Rate zu berechnen.',
  nl: 'Voer het leenbedrag, de rente en de looptijd in om uw maandelijkse betaling te berekenen.',
  nz: 'Enter your loan amount, interest rate and term to see your monthly payment and full repayment schedule.',
  fr: 'Entrez le montant, le taux et la durée pour voir votre mensualité et le coût total du crédit.',
  es: 'Introduzca el importe, el tipo de interés y el plazo para ver su cuota mensual y el coste total.',
  sg: 'Enter your loan amount, interest rate and term. Singapore personal loan rates are quoted as flat rates by some lenders — use the effective interest rate (EIR) here.',
  in: 'Enter your loan amount, interest rate and term to see your EMI, total interest, and full repayment schedule.',
};

const DEFAULTS: Record<string, { amount: number; rate: number; termMonths: number }> = {
  us: { amount: 10000, rate: 0.12, termMonths: 36 },
  uk: { amount: 8000, rate: 0.09, termMonths: 36 },
  ca: { amount: 12000, rate: 0.10, termMonths: 36 },
  au: { amount: 15000, rate: 0.12, termMonths: 36 },
  ie: { amount: 10000, rate: 0.09, termMonths: 36 },
  de: { amount: 10000, rate: 0.07, termMonths: 36 },
  nl: { amount: 10000, rate: 0.06, termMonths: 36 },
  nz: { amount: 15000, rate: 0.13, termMonths: 36 },
  fr: { amount: 10000, rate: 0.07, termMonths: 36 },
  es: { amount: 10000, rate: 0.08, termMonths: 36 },
  sg: { amount: 20000, rate: 0.07, termMonths: 36 },
  in: { amount: 500000, rate: 0.13, termMonths: 36 },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cc: string }>;
}): Promise<Metadata> {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) return {};
  const h1 = H1[cc] ?? 'Personal Loan Calculator';
  return getToolMetadata(
    cc as CountryCode,
    'loans',
    'personal-loan',
    `${h1} | Reckoner`,
    `Calculate monthly payments, total interest, and APR for a personal loan. Free, no signup.`,
  );
}

export default async function PersonalLoanPage({
  params,
}: {
  params: Promise<{ cc: string }>;
}) {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) notFound();

  const country = getCountry(cc as CountryCode);
  const allCountries = getAllCountries();
  const defaults = DEFAULTS[cc] ?? DEFAULTS.us!;
  const h1 = H1[cc] ?? 'Personal Loan Calculator';
  const intro = INTRO[cc] ?? INTRO.us!;

  return (
    <>
      <Header
        currentCountry={country}
        allCountries={allCountries}
        currentTool="loans/personal-loan"
      />
      <main id="main">
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '48px 24px 0' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 300px',
              gap: 48,
              alignItems: 'start',
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 40,
                  fontWeight: 400,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.1,
                  margin: '0 0 12px',
                }}
              >
                {h1}
              </h1>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.6,
                  margin: '0 0 32px',
                  maxWidth: '72ch',
                }}
              >
                {intro}
              </p>
              <PersonalLoanCalculator
                country={country}
                defaultRate={defaults.rate}
                defaultAmount={defaults.amount}
                defaultTermMonths={defaults.termMonths}
              />
            </div>
            <div style={{ position: 'sticky', top: 72 }}>
              <AdSlot width={300} height={600} />
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1160, margin: '32px auto 0', padding: '0 24px' }}>
          <AdSlot width={728} height={90} style={{ margin: '0 0 32px' }} />
          <TrustDisclosures context={{ type: 'personal-loan' }} />
        </div>
      </main>
      <Footer countries={allCountries} currentCc={cc} />
    </>
  );
}
```

- [ ] **Step 7: Typecheck**

```bash
cd apps/web && pnpm typecheck
```
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/components/TrustDisclosures.tsx
git add apps/web/src/components/PersonalLoanCalculator/
git add "apps/web/app/[cc]/loans/"
git commit -m "feat: add personal loan calculator with amortization chart"
```

---

### Task 3: Auto loan calculator — component, chart, page

**Files:**
- Create: `apps/web/src/components/AutoLoanCalculator/index.tsx`
- Create: `apps/web/app/[cc]/loans/auto-loan/page.tsx`

**Interfaces:**
- Consumes: `calculateAutoLoan`, `AutoLoanResult`, `AmortizationRow` from `@reckoner/loan-engine` (Task 1); `LoanBalanceChart` from `PersonalLoanCalculator/LoanBalanceChart` (Task 2); `CountryData` from `@reckoner/finance-data`
- Produces: `<AutoLoanCalculator country={CountryData} defaults={AutoLoanDefaults} />` + route `/{cc}/loans/auto-loan`

- [ ] **Step 1: Create `apps/web/src/components/AutoLoanCalculator/index.tsx`**

```tsx
'use client';
import { useState } from 'react';
import type { CountryData } from '@reckoner/finance-data';
import { calculateAutoLoan } from '@reckoner/loan-engine';
import { formatCurrency } from '../../lib/format';
import { LoanBalanceChart } from '../PersonalLoanCalculator/LoanBalanceChart';

export interface AutoLoanDefaults {
  vehiclePrice: number;
  downPayment: number;
  tradeInValue: number;
  salesTaxRate: number;
  annualRate: number;
  termMonths: number;
}

interface AutoLoanCalculatorProps {
  country: CountryData;
  defaults: AutoLoanDefaults;
}

const inputStyle = {
  fontSize: 18,
  fontWeight: 400,
  border: 'none',
  borderBottom: '1px solid var(--color-ink)',
  background: 'transparent',
  outline: 'none',
  width: '100%',
  color: 'var(--color-ink)',
  padding: '4px 0',
} as const;

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  marginBottom: 6,
  color: 'var(--color-ink-mid)',
} as const;

const TERM_OPTIONS = [24, 36, 48, 60, 72, 84] as const;

export function AutoLoanCalculator({ country, defaults }: AutoLoanCalculatorProps) {
  const [vehiclePrice, setVehiclePrice] = useState(defaults.vehiclePrice);
  const [downPayment, setDownPayment] = useState(defaults.downPayment);
  const [tradeInValue, setTradeInValue] = useState(defaults.tradeInValue);
  const [salesTaxRate, setSalesTaxRate] = useState(defaults.salesTaxRate * 100);
  const [annualRate, setAnnualRate] = useState(defaults.annualRate * 100);
  const [termMonths, setTermMonths] = useState(defaults.termMonths);
  const [docFee, setDocFee] = useState(0);

  const result = calculateAutoLoan({
    vehiclePrice,
    downPayment,
    tradeInValue,
    salesTaxRate: salesTaxRate / 100,
    annualRate: annualRate / 100,
    termMonths,
    docFee: docFee || undefined,
  });

  const { financedAmount, monthlyPayment, totalInterest, totalCost, apr, schedule } = result;

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          marginBottom: 24,
        }}
      >
        <div>
          <label style={labelStyle}>
            Vehicle price ({country.currencySymbol})
          </label>
          <input
            type="number"
            value={vehiclePrice}
            min={0}
            step={1000}
            onChange={(e) => setVehiclePrice(Number(e.target.value))}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>
            Down payment ({country.currencySymbol})
          </label>
          <input
            type="number"
            value={downPayment}
            min={0}
            step={500}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>
            Trade-in value ({country.currencySymbol})
          </label>
          <input
            type="number"
            value={tradeInValue}
            min={0}
            step={500}
            onChange={(e) => setTradeInValue(Number(e.target.value))}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Sales tax / VAT (%)</label>
          <input
            type="number"
            value={salesTaxRate}
            min={0}
            max={50}
            step={0.1}
            onChange={(e) => setSalesTaxRate(Number(e.target.value))}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Annual interest rate (%)</label>
          <input
            type="number"
            value={annualRate}
            min={0}
            max={50}
            step={0.1}
            onChange={(e) => setAnnualRate(Number(e.target.value))}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Loan term (months)</label>
          <select
            value={termMonths}
            onChange={(e) => setTermMonths(Number(e.target.value))}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            {TERM_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t} months ({(t / 12).toFixed(t % 12 === 0 ? 0 : 1)} yr)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>
            Documentation / dealer fee ({country.currencySymbol}, optional)
          </label>
          <input
            type="number"
            value={docFee}
            min={0}
            step={50}
            onChange={(e) => setDocFee(Number(e.target.value))}
            style={inputStyle}
          />
        </div>
      </div>

      <div
        style={{
          background: 'var(--color-surface)',
          padding: '24px',
          marginBottom: 32,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
            gap: 16,
          }}
        >
          {[
            { label: 'Financed amount', value: formatCurrency(financedAmount, country.currency, country.locale), accent: false },
            { label: 'Monthly payment', value: formatCurrency(monthlyPayment, country.currency, country.locale), accent: false },
            { label: 'Total interest', value: formatCurrency(totalInterest, country.currency, country.locale), accent: true },
            { label: 'Total out-of-pocket', value: formatCurrency(totalCost, country.currency, country.locale), accent: false },
            { label: 'APR', value: `${(apr * 100).toFixed(2)}%`, accent: false },
          ].map(({ label, value, accent }) => (
            <div key={label}>
              <div
                style={{
                  fontSize: 13,
                  color: 'var(--color-ink-mid)',
                  marginBottom: 4,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 300,
                  letterSpacing: '-0.03em',
                  color: accent ? 'var(--color-interest)' : 'var(--color-ink)',
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
        Loan balance over time
      </div>
      <div
        style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 16 }}
      >
        Remaining balance and cumulative interest by month
      </div>
      <LoanBalanceChart
        schedule={schedule}
        currency={country.currency}
        locale={country.locale}
      />
    </div>
  );
}
```

- [ ] **Step 2: Create `apps/web/app/[cc]/loans/auto-loan/page.tsx`**

Create directory:
```bash
mkdir -p "apps/web/app/[cc]/loans/auto-loan"
```

Create the page file:

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCountry, getAllCountries, COUNTRY_CODES } from '@reckoner/finance-data';
import type { CountryCode } from '@reckoner/finance-data';
import { getToolMetadata } from '@reckoner/seo';
import { AdSlot } from '@reckoner/analytics';
import { Header } from '../../../../src/components/Header';
import { Footer } from '../../../../src/components/Footer';
import { AutoLoanCalculator } from '../../../../src/components/AutoLoanCalculator';
import type { AutoLoanDefaults } from '../../../../src/components/AutoLoanCalculator';
import { TrustDisclosures } from '../../../../src/components/TrustDisclosures';

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return COUNTRY_CODES.map((cc) => ({ cc }));
}

const H1: Record<string, string> = {
  us: 'Auto Loan Calculator',
  uk: 'Car Finance Calculator',
  ca: 'Auto Loan Calculator',
  au: 'Car Loan Calculator',
  ie: 'Car Finance Calculator',
  de: 'Autokredit Rechner',
  nl: 'Autolening Berekenen',
  nz: 'Car Loan Calculator',
  fr: 'Calculateur de Prêt Auto',
  es: 'Calculadora de Préstamo de Auto',
  sg: 'Car Loan Calculator',
  in: 'Car Loan EMI Calculator',
};

const INTRO: Record<string, string> = {
  us: 'Enter your vehicle price, down payment, trade-in, tax rate, and loan terms to see your monthly payment, total interest, and APR. Add the dealer doc fee to see how it raises your APR.',
  uk: 'Enter the vehicle price, deposit, and finance terms to see your monthly payment. UK car prices include VAT, so set the tax field to 0.',
  ca: 'Enter vehicle price, down payment, and trade-in to see your financed amount and monthly payment. Provincial sales tax varies — enter the rate for your province.',
  au: 'Enter vehicle price, deposit, and loan terms. Australian car purchases attract GST (10%) on top of the listed price in some scenarios — confirm with your dealer.',
  ie: 'Enter the vehicle price and finance terms to see your monthly payment. Irish car prices include VAT; set the tax field to 0.',
  de: 'Fahrzeugpreis, Anzahlung und Zinssatz eingeben, um die Monatsrate zu berechnen.',
  nl: 'Voer de aanschafprijs, aanbetaling en rente in om uw maandlast te berekenen.',
  nz: 'Enter vehicle price, deposit, and loan terms. New Zealand has GST (15%) — if the price is GST-inclusive, set the tax field to 0.',
  fr: 'Entrez le prix du véhicule, l\'apport et les conditions du prêt pour calculer votre mensualité.',
  es: 'Introduzca el precio del vehículo, la entrada y las condiciones del préstamo para calcular su cuota mensual.',
  sg: 'Enter vehicle price, loan amount, and terms. Singapore has a COE system — enter the OMV + COE as the vehicle price.',
  in: 'Enter vehicle ex-showroom price plus road tax and insurance for the on-road price. Enter your down payment and loan terms.',
};

const DEFAULTS: Record<string, AutoLoanDefaults> = {
  us: { vehiclePrice: 35000, downPayment: 5000, tradeInValue: 0, salesTaxRate: 0.06, annualRate: 0.07, termMonths: 60 },
  uk: { vehiclePrice: 25000, downPayment: 3000, tradeInValue: 0, salesTaxRate: 0, annualRate: 0.08, termMonths: 48 },
  ca: { vehiclePrice: 40000, downPayment: 5000, tradeInValue: 0, salesTaxRate: 0.13, annualRate: 0.08, termMonths: 60 },
  au: { vehiclePrice: 40000, downPayment: 5000, tradeInValue: 0, salesTaxRate: 0.10, annualRate: 0.09, termMonths: 60 },
  ie: { vehiclePrice: 25000, downPayment: 5000, tradeInValue: 0, salesTaxRate: 0, annualRate: 0.07, termMonths: 48 },
  de: { vehiclePrice: 30000, downPayment: 5000, tradeInValue: 0, salesTaxRate: 0, annualRate: 0.06, termMonths: 48 },
  nl: { vehiclePrice: 30000, downPayment: 5000, tradeInValue: 0, salesTaxRate: 0, annualRate: 0.06, termMonths: 48 },
  nz: { vehiclePrice: 35000, downPayment: 5000, tradeInValue: 0, salesTaxRate: 0, annualRate: 0.09, termMonths: 60 },
  fr: { vehiclePrice: 25000, downPayment: 5000, tradeInValue: 0, salesTaxRate: 0, annualRate: 0.06, termMonths: 48 },
  es: { vehiclePrice: 25000, downPayment: 5000, tradeInValue: 0, salesTaxRate: 0, annualRate: 0.07, termMonths: 48 },
  sg: { vehiclePrice: 100000, downPayment: 30000, tradeInValue: 0, salesTaxRate: 0.09, annualRate: 0.07, termMonths: 60 },
  in: { vehiclePrice: 1200000, downPayment: 200000, tradeInValue: 0, salesTaxRate: 0.12, annualRate: 0.09, termMonths: 60 },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cc: string }>;
}): Promise<Metadata> {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) return {};
  const h1 = H1[cc] ?? 'Auto Loan Calculator';
  return getToolMetadata(
    cc as CountryCode,
    'loans',
    'auto-loan',
    `${h1} | Reckoner`,
    `Calculate monthly car finance payments, total interest, APR, and trade-in impact. Free, no signup.`,
  );
}

export default async function AutoLoanPage({
  params,
}: {
  params: Promise<{ cc: string }>;
}) {
  const { cc } = await params;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) notFound();

  const country = getCountry(cc as CountryCode);
  const allCountries = getAllCountries();
  const defaults = DEFAULTS[cc] ?? DEFAULTS.us!;
  const h1 = H1[cc] ?? 'Auto Loan Calculator';
  const intro = INTRO[cc] ?? INTRO.us!;

  return (
    <>
      <Header
        currentCountry={country}
        allCountries={allCountries}
        currentTool="loans/auto-loan"
      />
      <main id="main">
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '48px 24px 0' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 300px',
              gap: 48,
              alignItems: 'start',
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 40,
                  fontWeight: 400,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.1,
                  margin: '0 0 12px',
                }}
              >
                {h1}
              </h1>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.6,
                  margin: '0 0 32px',
                  maxWidth: '72ch',
                }}
              >
                {intro}
              </p>
              <AutoLoanCalculator country={country} defaults={defaults} />
            </div>
            <div style={{ position: 'sticky', top: 72 }}>
              <AdSlot width={300} height={600} />
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1160, margin: '32px auto 0', padding: '0 24px' }}>
          <AdSlot width={728} height={90} style={{ margin: '0 0 32px' }} />
          <TrustDisclosures context={{ type: 'auto-loan' }} />
        </div>
      </main>
      <Footer countries={allCountries} currentCc={cc} />
    </>
  );
}
```

- [ ] **Step 3: Typecheck**

```bash
cd apps/web && pnpm typecheck
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/AutoLoanCalculator/
git add "apps/web/app/[cc]/loans/auto-loan/"
git commit -m "feat: add auto loan calculator with trade-in, tax, and APR"
```

---

### Task 4: Loans hub page + Header activation + SEO sitemap

**Files:**
- Create: `apps/web/app/[cc]/loans/page.tsx`
- Modify: `apps/web/src/components/Header.tsx`
- Modify: `packages/seo/src/sitemap.ts`
- Modify: `packages/seo/src/index.ts`
- Modify: `packages/seo/__tests__/helpers.test.ts`
- Modify: `apps/web/app/sitemap.ts`

**Interfaces:**
- Consumes: `getPropertySitemapEntries` pattern in `packages/seo/src/sitemap.ts`; `COUNTRY_CODES` from hreflang
- Produces: `getLoanSitemapEntries(): SitemapEntry[]` (24 entries); `/{cc}/loans/` route; active `personal-loan` + `auto-loan` in Header

- [ ] **Step 1: Add `getLoanSitemapEntries` to `packages/seo/src/sitemap.ts`**

Append after the existing `getPropertySitemapEntries` function:

```typescript
const LOAN_SLUGS = ['personal-loan', 'auto-loan'] as const;

export function getLoanSitemapEntries(): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  for (const cc of COUNTRY_CODES) {
    for (const slug of LOAN_SLUGS) {
      entries.push({
        url: `${BASE}/${cc}/loans/${slug}`,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }
  return entries;
}
```

- [ ] **Step 2: Export `getLoanSitemapEntries` from `packages/seo/src/index.ts`**

Add to the existing exports:

```typescript
export { getLoanSitemapEntries } from './sitemap';
```

- [ ] **Step 3: Add tests for `getLoanSitemapEntries` to `packages/seo/__tests__/helpers.test.ts`**

Append inside the existing test file, after the last `describe` block:

```typescript
describe('getLoanSitemapEntries', () => {
  it('returns 24 entries (2 slugs × 12 countries)', () => {
    expect(getLoanSitemapEntries()).toHaveLength(24);
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
});
```

Also add `getLoanSitemapEntries` to the import at the top of `helpers.test.ts`. The current import line is:
```typescript
import {
  getToolPath, getToolCanonical, getToolHreflang, getToolMetadata,
  getPropertySitemapEntries,
} from '../src/index';
```
Add `getLoanSitemapEntries` to this import.

- [ ] **Step 4: Run SEO package tests**

```bash
cd packages/seo && pnpm test
```
Expected: all tests pass with 100% coverage.

- [ ] **Step 5: Activate personal-loan and auto-loan in `apps/web/src/components/Header.tsx`**

In `Header.tsx`, find the `LOANS_TOOLS` constant. Currently it is:

```typescript
const LOANS_TOOLS = [
  { slug: 'personal-loan', label: 'Personal Loan', comingSoon: true },
  { slug: 'auto-loan', label: 'Auto Loan', comingSoon: true },
  { slug: 'credit-card-payoff', label: 'Credit Card Payoff', comingSoon: true },
  { slug: 'debt-strategy', label: 'Debt Strategy', comingSoon: true },
];
```

Remove `comingSoon: true` from `personal-loan` and `auto-loan` (leave it on the other two):

```typescript
const LOANS_TOOLS = [
  { slug: 'personal-loan', label: 'Personal Loan' },
  { slug: 'auto-loan', label: 'Auto Loan' },
  { slug: 'credit-card-payoff', label: 'Credit Card Payoff', comingSoon: true },
  { slug: 'debt-strategy', label: 'Debt Strategy', comingSoon: true },
];
```

- [ ] **Step 6: Create `apps/web/app/[cc]/loans/page.tsx`**

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
    slug: 'personal-loan',
    label: 'Personal Loan Calculator',
    description: 'Monthly payment, total interest, and full repayment schedule. Enter an origination fee to see how it raises your APR.',
  },
  {
    slug: 'auto-loan',
    label: 'Auto Loan Calculator',
    description: 'Finance amount after down payment, trade-in, and sales tax. Monthly payment, APR, and total out-of-pocket cost.',
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
    title: `Loan Calculators for ${countryName} | Reckoner`,
    description: `Personal loan and auto loan calculators for ${countryName}. Monthly payments, total interest, APR, and full repayment schedules. Free, no signup.`,
    alternates: { canonical: `https://reckoner.tools/${cc}/loans` },
    robots: { index: true, follow: true },
  };
}

export default async function LoansHubPage({
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
      <Header currentCountry={country} allCountries={allCountries} currentTool="loans" />
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
            Loan calculators for {countryName}
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
            Monthly payments, total interest, and APR — calculated with exact annuity maths, not rule-of-thumb estimates.
          </p>

          <div style={{ display: 'grid', gap: 2 }}>
            {TOOLS.map((tool) => (
              <a
                key={tool.slug}
                href={`/${cc}/loans/${tool.slug}`}
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
                <div
                  style={{
                    fontSize: 14,
                    color: 'var(--color-ink-mid)',
                    lineHeight: 1.5,
                  }}
                >
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

- [ ] **Step 7: Update `apps/web/app/sitemap.ts`**

Replace the current content with:

```typescript
import type { MetadataRoute } from 'next';
import {
  getStaticSitemapEntries,
  getPropertySitemapEntries,
  getLoanSitemapEntries,
} from '@reckoner/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...getStaticSitemapEntries(),
    ...getPropertySitemapEntries(),
    ...getLoanSitemapEntries(),
  ];
}
```

- [ ] **Step 8: Typecheck the web app**

```bash
cd apps/web && pnpm typecheck
```
Expected: no errors.

- [ ] **Step 9: Build check**

```bash
cd apps/web && pnpm build
```
Expected: build completes. Static pages generated for `/{cc}/loans/`, `/{cc}/loans/personal-loan`, `/{cc}/loans/auto-loan`.

- [ ] **Step 10: Commit**

```bash
git add packages/seo/src/sitemap.ts packages/seo/src/index.ts "packages/seo/__tests__/helpers.test.ts"
git add apps/web/src/components/Header.tsx
git add "apps/web/app/[cc]/loans/page.tsx"
git add apps/web/app/sitemap.ts
git commit -m "feat: loans hub, activate personal/auto-loan nav links, add loan sitemap entries"
```
