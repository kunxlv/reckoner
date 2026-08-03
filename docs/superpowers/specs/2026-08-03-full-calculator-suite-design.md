# Full Calculator Suite Design

**Date:** 2026-08-03
**Status:** Approved (post-review revision)

## Overview

Three sequential sub-projects to complete the reckoner.tools calculator suite: UI polish and SEO/AEO foundation, Loans & Debt complex calculators, and Savings & Investing calculators. Together they bring the site from 7 live calculators to 14 and replace the narrow mortgage-focused landing page with a full SEO/AEO-optimised hub.

Sub-projects 1 (foundation URL restructure) and 2 (loans core) are already shipped. These are Sub-projects 3, 4, and 5.

---

## Sub-project 3: UI Polish + SEO/AEO Foundation

### Goals

- Update nav dropdown labels to be descriptive rather than category names
- Centre the dropdown menus under their trigger buttons
- Redesign the landing page as a three-section hybrid (hero + tool grid + FAQ) with `FAQPage` and `WebSite` JSON-LD schema
- Add per-country hub pages (`/{cc}/`) listing all categories and their live tools
- Add `SoftwareApplication` JSON-LD to every calculator page via a shared server component
- Fix hardcoded hex on the current landing page

### Nav labels

| Current | New |
|---|---|
| Property | Mortgages & Property |
| Loans | Loans & Debt |
| Savings | Savings & Investing |

Changed in `apps/web/src/components/Header.tsx` (`label` props on `CategoryNav`).

### Dropdown centering

In `apps/web/src/components/CategoryNav.tsx`, change the dropdown's inline style from `left: 0` to `left: '50%'` + `transform: 'translateX(-50%)'`.

### Landing page redesign

**File:** `apps/web/app/page.tsx`

Four sections:

1. **Hero** — H1 targeting "financial calculators [country]" queries (≤80 words). Subhead explaining country-specific maths. No country selector above the fold.

2. **Tool grid** — three columns, one per category (Mortgages & Property / Loans & Debt / Savings & Investing). Each tool shown with its label and a one-line description. Tool links go to `/us/{category}/{slug}` (US as default; the country grid below lets users change). Tools marked `comingSoon` are shown greyed with a "Soon" badge.

3. **Country grid** — 12 country cards linking to `/{cc}/` country hub pages. Subtitle on each card changes from "Mortgage calculator" to "Property · Loans · Savings".

4. **FAQ section** — 18 questions in three groups (Mortgage & Property / Loans & Debt / Savings & Investing). Each Q&A is an accordion. `FAQPage` JSON-LD schema injected via a `<script type="application/ld+json">` tag rendered server-side. FAQ answers are written during implementation, targeting 2–4 sentences each, structured as a direct answer an AI engine can extract (factual, no marketing language).

**FAQ questions (18):**

*Mortgage & Property (6):*
- How do I calculate my monthly mortgage payment?
- What is the difference between fixed and variable rate mortgages?
- How much deposit do I need to buy a house?
- What is loan-to-value (LTV) and why does it matter?
- How does remortgaging work and when does it make sense?
- Should I rent or buy — how do I decide?

*Loans & Debt (6):*
- How do I calculate the monthly payment on a personal loan?
- What is APR and how is it different from the interest rate?
- How is an auto loan different from a personal loan?
- What is the minimum payment trap on a credit card?
- What is the difference between the debt snowball and debt avalanche?
- How do I compare two loans with different rates and terms?

*Savings & Investing (6):*
- How does compound interest work?
- What is the difference between nominal and real returns?
- How much do I need to retire?
- What is the FIRE number and how is it calculated?
- What is CAGR and how do I use it to compare investments?
- How long will my savings last in retirement?

**Schemas added to landing page:**
- `WebSite` schema with `name`, `url`, `description`
- `FAQPage` schema with all 18 Q&As (questions + answers)

Also fixes hardcoded hex colours (`#000000`, `#dddddd`, `#2f2f2f`, `#5a5a5a`) replacing them with `var(--color-*)` tokens.

### Country hub pages

**File:** `apps/web/app/[cc]/page.tsx`

One ISR page per country code. Shows:
- Country name + flag as H1
- 2–3 sentence country-specific intro covering relevant financial context. Examples: Canada notes semi-annual compounding on fixed-rate mortgages; India notes EMI conventions; Singapore notes COE in vehicle pricing; Germany notes Restschuld (outstanding balance at end of fixed period).
- Three category sections, each listing live tools for that country with descriptions
- `comingSoon` tools shown greyed
- `revalidate = 86400`, `dynamicParams = true`
- `currentTool` not applicable (no active tool); Header receives no `currentTool` prop (defaults to none)
- Metadata: `title = "Financial Calculators for {Country} | Reckoner"`, canonical `https://reckoner.tools/{cc}`

### `CalculatorSchema` server component

**File:** `apps/web/src/components/CalculatorSchema.tsx`

A zero-output server component that renders a `<script type="application/ld+json">` tag with `SoftwareApplication` schema:

```tsx
interface Props {
  name: string;         // e.g. "Mortgage Calculator"
  description: string;  // one sentence
  url: string;          // full absolute URL, e.g. "https://reckoner.tools/us/property/mortgage-calculator"
                        // callers construct this; the component does not build it
}
```

The `url` prop is always a fully-qualified absolute URL. Callers pass `https://reckoner.tools/${cc}/${category}/${slug}`.

Added to the 7 live calculator pages (5 property + 2 loans) as part of this sub-project. Every subsequent calculator page (Sub-projects 4 and 5) adds `<CalculatorSchema>` at the time that page is created.

### Global constraints

- All colours via `var(--color-*)` — no hardcoded hex
- `revalidate = 86400` and `dynamicParams = true` on country hub pages
- Nav label strings are exact: "Mortgages & Property", "Loans & Debt", "Savings & Investing"
- Dropdown centering: `left: '50%'`, `transform: 'translateX(-50%)'`
- FAQ has exactly 18 questions (6 per category)
- `SoftwareApplication` schema on every calculator page via `<CalculatorSchema url="https://reckoner.tools/...">`

---

## Sub-project 4: Loans & Debt — Complex Calculators

### Goals

Add credit card payoff and debt strategy calculators, each backed by its own engine package. Both pages include `<CalculatorSchema>`.

### `packages/card-payoff-engine`

Iterative minimum-payment simulation in **integer cents** (avoids float drift).

**Inputs:**
```typescript
interface CardPayoffInput {
  balanceCents: number;
  annualRate: number;
  minPaymentRule:
    | { type: 'percent'; rate: number; floorCents: number }
    | { type: 'fixed'; amountCents: number };
  extraMonthlyCents?: number; // omit or 0 = minimum-only; both treated identically
}
```

`extraMonthlyCents = 0` and `extraMonthlyCents = undefined` are treated identically by the engine (minimum-only path). The UI suppresses the comparison chart and the "with extra payment" result row when `extraMonthlyCents` is 0 or absent.

**Outputs:**
```typescript
interface CardPayoffResult {
  months: number;
  totalInterestCents: number;
  totalPaidCents: number;
  schedule: CardPayoffRow[];
}

interface CardPayoffRow {
  month: number;
  paymentCents: number;
  interestCents: number;
  principalCents: number;
  balanceCents: number;
}
```

Two calls — one for minimum-only, one with extra payment — produce the comparison data for the chart. The UI calls the engine once (minimum-only) when `extraMonthlyCents` is 0, and twice when it is non-zero.

100% vitest coverage required.

### Credit card payoff calculator

**Route:** `/{cc}/loans/credit-card-payoff`

**Inputs:** current balance (currency), APR (%), minimum payment type (% of balance with floor, or fixed amount), optional extra monthly payment.

**Outputs:** months to payoff, total interest, total paid. When `extraMonthlyCents > 0`, a second result row shows the same figures for the accelerated path.

**Chart:** shown only when `extraMonthlyCents > 0` — two lines (minimum-only vs. accelerated) showing cumulative interest over time. Uses dynamic import SSR guard pattern (outer wrapper + inner recharts component).

**TrustDisclosures:** new `{ type: 'credit-card-payoff' }` context with formula explanation.

**`<CalculatorSchema>`** with full URL: `https://reckoner.tools/${cc}/loans/credit-card-payoff`.

### `packages/debt-strategy-engine`

Given an array of debts, produces month-by-month schedules for three strategies.

```typescript
interface Debt {
  name: string;
  balanceCents: number;
  annualRate: number;
  minPaymentCents: number;
}

type Strategy = 'minimum' | 'snowball' | 'avalanche';

interface DebtScheduleRow {
  month: number;
  totalPaymentCents: number;
  totalInterestCents: number;
  totalPrincipalCents: number;
  totalBalanceCents: number;
  // Per-debt balances after this month's payments (keyed by debt index 0–4)
  debtBalancesCents: number[];
}

interface DebtStrategyResult {
  strategy: Strategy;
  months: number;
  totalInterestCents: number;
  totalPaidCents: number;
  schedule: DebtScheduleRow[];
}
```

`debtBalancesCents` has the same length as the input `debts` array. A fully paid-off debt is represented as 0. This allows the UI to show per-debt payoff milestones from the schedule.

Supports 1–5 debts. Extra monthly budget applied to the focus debt (lowest balance for snowball, highest APR for avalanche) after all minimums are paid. When a debt reaches 0, its freed minimum rolls into the next focus debt. 100% vitest coverage.

### Debt strategy calculator

**Route:** `/{cc}/loans/debt-strategy`

**Inputs:** up to 5 debts (name, balance, APR, minimum payment), extra monthly budget above minimums.

**Outputs:** table comparing snowball vs avalanche (total interest, months to payoff, months saved vs minimum-only).

**Chart:** grouped bar chart — total interest paid per strategy (minimum / snowball / avalanche).

**TrustDisclosures:** new `{ type: 'debt-strategy' }` context.

**`<CalculatorSchema>`** with full URL: `https://reckoner.tools/${cc}/loans/debt-strategy`.

---

## Sub-project 5: Savings & Investing Calculators

### Goals

Add five savings calculators backed by a single `growth-engine` package. All pages include `<CalculatorSchema>`.

### `packages/growth-engine`

Three computation modes:

**Accumulation mode:**
```typescript
interface AccumulationInput {
  principal: number;
  annualRate: number;
  // Compounding frequency. 'continuous' uses A = P × e^(r×t) per year,
  // plus monthly contributions compounded continuously within the year.
  compoundingFrequency: 'monthly' | 'quarterly' | 'annually' | 'continuous';
  monthlyContribution?: number;
  years: number;           // must be a positive integer
  inflationRate?: number;  // if provided, also compute realFinalBalance
}

interface AccumulationRow {
  year: number;           // 1-based
  balance: number;
  contributed: number;    // cumulative contributions including principal
  interest: number;       // cumulative interest earned
  realBalance?: number;   // inflation-adjusted, if inflationRate provided
}

interface AccumulationResult {
  finalBalance: number;
  totalContributed: number;
  totalInterest: number;
  realFinalBalance?: number; // if inflationRate provided
  schedule: AccumulationRow[]; // one row per year, length = years
}
```

Compounding formulas:
- `monthly`: `A = P(1 + r/12)^(12t)` per period; contributions added monthly
- `quarterly`: `A = P(1 + r/4)^(4t)`; contributions compounded quarterly
- `annually`: `A = P(1 + r)^t`; contributions added annually
- `continuous`: `A = Pe^(rt)`; monthly contributions treated as continuous flow

**Drawdown mode:**
```typescript
interface DrawdownInput {
  portfolioValue: number;
  annualWithdrawal: number;  // fixed nominal withdrawal per year
  annualReturn: number;
  inflationRate?: number;    // if provided, annualWithdrawal grows by inflationRate each year
  maxYears?: number;         // cap on schedule length; defaults to 100
}

interface DrawdownRow {
  year: number;          // 1-based
  portfolioValue: number; // value at start of year, after withdrawal
  withdrawal: number;    // actual withdrawal this year (grows with inflation if inflationRate set)
  growth: number;        // investment growth this year
  realPortfolioValue?: number; // inflation-adjusted, if inflationRate provided
}

interface DrawdownResult {
  yearsToDepletion: number; // number of years until portfolio reaches 0;
                            // capped at maxYears if portfolio is sustainable
  schedule: DrawdownRow[];  // length = min(yearsToDepletion, maxYears)
}
```

`yearsToDepletion` is capped at `maxYears` (default 100) to keep the schedule finite. If the portfolio is still positive at `maxYears`, `yearsToDepletion = maxYears` and the schedule has `maxYears` rows.

**CAGR mode:**
```typescript
interface CAGRInput {
  initialValue: number;
  finalValue: number;
  years: number;
}

interface CAGRResult {
  cagr: number;              // as decimal: 0.08 = 8%
  totalReturnPercent: number; // (finalValue - initialValue) / initialValue
  absoluteGain: number;      // finalValue - initialValue
}
```

**FIRE target helper** (UI logic, not an engine mode):

The FIRE number is computed in the UI as `fireNumber = annualExpenses / withdrawalRate`. The UI then calls `Accumulation` mode to project when `balance >= fireNumber`, scanning the schedule year-by-year for the crossing year. No new engine mode is needed.

100% vitest coverage required on all three engine modes.

### Five calculator pages

All under `/{cc}/savings/{slug}`, `revalidate = 86400`, `dynamicParams = true`.

| Slug | Route | Engine mode | Chart |
|---|---|---|---|
| `compound-interest` | `/{cc}/savings/compound-interest` | Accumulation | Stacked area: principal + contributions + interest |
| `retirement` | `/{cc}/savings/retirement` | Accumulation + Drawdown | Balance over time to retirement; real vs nominal lines |
| `savings-goal` | `/{cc}/savings/savings-goal` | Accumulation | Progress to goal over time |
| `fire-number` | `/{cc}/savings/fire-number` | Accumulation (FIRE target via UI logic) | Savings growth line with horizontal FIRE number target |
| `investment-return` | `/{cc}/savings/investment-return` | CAGR | Growth curve; secondary mode: enter CAGR + starting value + years → projected final value |

All five pages:
- `currentTool="savings/{slug}"`
- Import paths use `'../../../../src/components/'` (4 levels)
- `SoftwareApplication` JSON-LD via `<CalculatorSchema url="https://reckoner.tools/${cc}/savings/${slug}">`
- `TrustDisclosures` with new context types per calculator

**Savings Hub page** at `/{cc}/savings/page.tsx`:
- Lists all 5 tools with descriptions
- `currentTool="savings"`
- Import paths `'../../../src/components/'` (3 levels)

**Header activation:** All 5 `SAVINGS_TOOLS` have `comingSoon` removed.

**SEO sitemap:** `getSavingsSitemapEntries()` — 60 entries (5 slugs × 12 countries, priority 0.8). Added to `packages/seo/src/sitemap.ts` and exported from `packages/seo/src/index.ts`. Tests in `packages/seo/__tests__/helpers.test.ts`.

---

## Build order

1. **Sub-project 3** — UI Polish + SEO/AEO Foundation (landing page, country hubs, nav labels, dropdown centering, `CalculatorSchema` on 7 existing pages)
2. **Sub-project 4** — Loans complex (credit card payoff + debt strategy, each with `CalculatorSchema`)
3. **Sub-project 5** — Savings & Investing (growth-engine + 5 calculators + savings hub, each with `CalculatorSchema`)

Each sub-project produces a working, testable, deployable increment.
