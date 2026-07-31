# Week 1 Implementation Plan — Multi-Country Mortgage Calculator (MVP)

**Project:** Personal finance calculator hub (Domain B)
**Week 1 deliverable:** One flagship tool, live, indexed, embeddable, in 12 country editions
**Owner:** solo build
**Status:** ready for design

---

## 0. Scope decision up front (read this first)

Your original Week 1 line was *"stand up Domain B + ship mortgage calculator (with amortization chart + embed widget)"*. Adding 12 countries and live currency conversion roughly triples the surface area. So Week 1 splits into **P0 (must ship this week)** and **P1 (Week 2, already designed for)**.

| | Ships Week 1 (P0) | Deferred to Week 2 (P1) |
|---|---|---|
| **Tool** | Mortgage / home loan repayment calculator | Affordability ("how much can I borrow") |
| **Countries** | 12 editions, but only **4 with full local rules** (US, UK, CA, AU); other 8 run the generic annuity engine with correct currency/format/labels | Full local rules for DE, IE, NL, NZ, FR, ES, SG, IN |
| **Rates** | Live/periodic reference rate per country, **prefilled but editable** | Rate history sparkline, "rate as of" comparison table |
| **FX** | Display-layer conversion only (see §3) | Standalone currency converter tool |
| **Chart** | Amortization: balance curve + principal/interest split | Extra-payment scenario overlay, CSV export |
| **Embed** | Iframe embed + attribution backlink | Configurable embed builder UI |
| **Content** | 12 country landing pages + methodology + author page | Programmatic page sets — **Week 5 at the earliest**, see §10 |

**Why 4 "deep" countries, not 12:** mortgage *math itself* differs by country (§4). Shipping 12 countries running US math with a currency symbol swapped is exactly the thin-template pattern that got sites hit in the March 2026 scaled-content update. Four countries done correctly + eight done honestly-generic (with a visible "generic annuity model" note) is defensible; twelve done wrong is not.

---

## 1. The 12 country editions

Ordered by (RPM × audience × data availability). Tier 1 gets local rules in Week 1.

| Tier | Country | Locale | Currency | Why included |
|---|---|---|---|---|
| **1** | United States | `en-US` | USD | Highest RPM, ~2.2M/mo head term, primary target |
| **1** | United Kingdom | `en-GB` | GBP | High RPM, distinct product model (fixed period + SVR revert) |
| **1** | Canada | `en-CA` | CAD | High RPM, **legally distinct compounding** (§4) — genuine differentiator |
| **1** | Australia | `en-AU` | AUD | High RPM, offset/redraw culture, free RBA data |
| 2 | Ireland | `en-IE` | EUR | Your home market — real E-E-A-T edge, low competition |
| 2 | Germany | `de-DE` | EUR | Large audience, **completely different product** (Zinsbindung/Tilgung) |
| 2 | Netherlands | `nl-NL` | EUR | High digital adoption, mortgage interest deduction angle |
| 2 | New Zealand | `en-NZ` | NZD | Small but high RPM, low competition |
| 3 | France | `fr-FR` | EUR | Large audience, assurance emprunteur nuance |
| 3 | Spain | `es-ES` | EUR | Large audience + expat/non-resident buyer traffic |
| 3 | Singapore | `en-SG` | SGD | Very high RPM, small volume, TDSR rules |
| 3 | India | `en-IN` | INR | Massive volume, low RPM — traffic/brand play, not revenue |

**Language scope Week 1:** English only for all 12 (including DE/FR/ES/NL editions). Localised *content* is a Week 6+ decision — half-translated pages are worse than English pages with correct local rules and formatting. Formatting (`Intl.NumberFormat`) is localised from day one regardless.

---

## 2. Live data sources — the answer to your first question

### 2.1 Currency exchange rates

**Primary: Frankfurter** (`https://api.frankfurter.dev/v2/...`)

<cite index="11-1">Frankfurter is open source, requires no API key, and imposes no monthly or daily quotas — requests are rate-limited only to prevent abuse, and the project can be self-hosted with Docker for full control.</cite> <cite index="3-1">It serves European Central Bank reference rates, which the ECB publishes daily around 16:00 CET across 30+ major currencies.</cite>

Every currency in your 12-country list (USD, GBP, CAD, AUD, EUR, NZD, SGD, INR) is inside ECB coverage. Licensing is clean: <cite index="10-1">ECB data is free to reuse, though some aggregator services request an attribution link.</cite>

**Fallback: ExchangeRate-API open endpoint** — <cite index="9-1">its free tier of ~1,500 requests/month is more than sufficient if you refresh once daily.</cite> Used only if Frankfurter returns non-200 twice.

**Caching pattern (non-negotiable):** <cite index="15-1">For ECB-based daily rates, fetching once per day after the ~16:00 CET publication is enough — cache the result, serve it to every user, and keep the last good response as a fallback rather than calling the endpoint on every pageview, which wastes quota and returns identical numbers.</cite>

Your implementation: fetch at build time **and** revalidate via a single Vercel Cron → ISR route once daily. Never call the FX API from the browser.

> ⚠️ **ECB rates are daily reference rates, not live market quotes, and not retail rates.** You must label them as such. A user converting a €400,000 mortgage to USD will not get that rate from a bank. Copy for this is in §9.6.

### 2.2 Mortgage reference rates per country

These prefill the rate field. All are official, free, and attributable — which is exactly the E-E-A-T signal a YMYL finance page needs.

| Country | Source | Access | Cadence | Notes |
|---|---|---|---|---|
| **US** | FRED series `MORTGAGE30US` (Freddie Mac PMMS) | Free API key, JSON | Weekly (Thu) | <cite index="20-1">Freddie Mac changed PMMS methodology on 17 Nov 2022 — the weekly rate is now based on applications submitted to Freddie Mac from lenders nationwide. The data is provided "as is" with no warranties, use is at your own risk, and the series is flagged copyrighted-citation-required.</cite> **You must print the citation string.** |
| **UK** | Bank of England Interactive Statistical Database (IADB) | Free CSV/API | Monthly | <cite index="31-1">The BoE Interactive Statistical Database is one of the major central bank APIs with established client libraries.</cite> Use 2yr and 5yr fixed 75% LTV series. |
| **Canada** | Bank of Canada **Valet API** | Free, **no key, no registration, no cost** | Weekly | <cite index="30-1">No registration is required to use the Valet API, no access key is needed, and there is no cost.</cite> <cite index="32-1">Posted rates cover conventional mortgages from the six major chartered banks, with the typical rate derived from the statistical mode of the six posted rates.</cite> Best-quality free source of the twelve. |
| **Australia** | RBA Statistical Table **F6 – Housing Lending Rates** | Free CSV at predictable URL | Monthly, lagged | <cite index="41-1">The RBA does not offer a public REST API; it publishes economic data as downloadable files.</cite> <cite index="35-1">Tables are published as CSV at predictable URLs with no auth and no rate limiting.</cite> Cadence is contested in RBA's own docs — <cite index="36-1">one page states lenders' rates publish 5 business days after month end</cite>, while <cite index="38-1">a change note moved F6–F8 to 25 business days after month end</cite>. **Verify current cadence before relying on it.** |
| **Eurozone** (DE, IE, NL, FR, ES) | ECB Data Portal API — MIR (MFI interest rate) statistics | Free | Monthly | <cite index="31-1">The ECB Data Portal API is a documented public central bank API.</cite> One integration covers five countries — highest leverage item on this list. Bundesbank SDMX is the DE-specific alternative. |
| **New Zealand** | RBNZ statistics (series B20) | Free CSV | Monthly | No REST API; scrape/download pattern like RBA. |
| **Singapore** | MAS statistics / SORA | Free API | Daily/monthly | SORA is the reference; retail spread must be manual. |
| **India** | RBI Database on Indian Economy | Free, awkward | Monthly | Lowest priority. Ship with a manually-curated constant + last-reviewed date. |

**Rule:** any country where you cannot get an official source cleanly in Week 1 ships with a **manually curated constant plus a visible `Last reviewed: <date>` stamp and a link to the official source**. That is honest, it is auditable, and it is better than a stale API you forget to monitor.

### 2.3 Static curated data (no API exists — you maintain it)

This is a JSON file per country in `packages/finance-data/countries/`. It is your actual moat; nobody else does this well across 12 countries.

- Stamp duty / transfer tax / land transfer tax bands
- First-time-buyer reliefs and thresholds
- Typical LTV limits and loan-to-income caps (e.g. Ireland's LTI rules, UK's stress-test norms)
- Typical term lengths and legal maximums
- Default property tax / rates / council charges (where they materially affect payment)
- Mandatory insurance (e.g. France's assurance emprunteur, US PMI thresholds)
- Compounding convention (§4)

Each entry carries `{ value, source, sourceUrl, lastReviewed }`. Render `lastReviewed` on the page. This single pattern is what separates "curated data page" from "scaled content abuse."

**Design the schema for sub-national data now, even though Week 1 only fills the country level.** The Week 5+ state and province page sets (§10) hang off this same file:

```ts
interface CountryData {
  propertyTax: DataPoint;              // national average, Week 1
  subdivisions?: Record<string, {      // 'TX', 'ON', 'NSW' — filled Weeks 5+
    name: string;
    propertyTax: DataPoint;
    transferTax: DataPoint;
    medianHomePrice: DataPoint;
    firstTimeBuyerPrograms?: DataPoint[];
  }>;
}
```

Getting `subdivisions` into the type now costs nothing and saves a data-layer refactor in Week 5.

### 2.4 What you do NOT need in Week 1

- **Supabase** — no. The calculator is fully client-side; rate data is baked at build time. Adding a database in Week 1 buys you nothing and costs you a moving part.
- **A rates-comparison / lender-quote API** — no. Those are paid, geo-restricted, and drag you toward being a lead-gen site (which is what your competitors' weakness *is*).
- **Live intraday FX** — no. Daily ECB reference rates are correct for this use case and defensible.

---

## 3. How currency conversion actually fits (important design constraint)

The instinct is "let the user pick a currency and convert everything." **Don't.** A mortgage exists in one currency. Converting a UK mortgage's monthly payment to USD at today's ECB rate produces a number that is meaningless a month later and actively misleading over a 25-year term.

**The correct model — three distinct roles for FX:**

1. **Country edition sets the currency.** `/uk/mortgage-calculator` calculates in GBP, full stop. The calculation currency is never user-switchable.
2. **A secondary "also show in" display line.** Below the primary result, a muted line: *"≈ $3,140/mo at today's ECB reference rate."* This is a display convenience for expats and comparison shoppers. It never feeds back into the calculation.
3. **A dedicated cross-border comparison view (Week 2+).** "Compare buying in Ireland vs Spain" — this is where FX genuinely earns its place, and it's a strong programmatic-SEO seam (`/compare/ireland-vs-spain-mortgage`).

**Auto-detection:** use Vercel's geo header to *suggest* an edition via a dismissible banner ("Looks like you're in Australia — switch to the AU calculator?"). Never auto-redirect: it breaks crawlers, breaks shared links, and is bad for SEO.

---

## 4. Mortgage math differs by country — this is the differentiator

This section is the reason the site can outrank incumbents. Most multi-country calculators run one formula and swap the symbol. Getting this right is a genuine data/logic asset.

| Country | Convention | Consequence |
|---|---|---|
| **US, UK, AU, IE, NZ** | Nominal annual rate compounded monthly: `i = r/12` | Standard annuity formula |
| **Canada** | Fixed-rate mortgages compound **semi-annually, not in advance** (statutory) | `i = (1 + r/2)^(1/6) − 1`. Using `r/12` overstates the payment. **Almost every non-Canadian calculator gets this wrong** — say so on the page. |
| **Germany** | *Annuitätendarlehen*: user picks Sollzins + **Tilgung** (initial repayment %), and a **Zinsbindung** (fixed period, typically 10–15y), leaving a **Restschuld** (residual debt) at the end | The output is not "monthly payment over 30 years" — it's "monthly rate + residual debt at end of fixed period." Different UI entirely. Do not ship a German page with a US-shaped form. |
| **France** | Annuity + *assurance emprunteur* usually quoted on initial capital | TAEG differs materially from the nominal rate |
| **Netherlands** | Annuïteiten vs lineair are both mainstream | Needs a repayment-type toggle |
| **Singapore** | TDSR/MSR caps constrain borrowing | Affordability more than repayment |

**Engine design:** `packages/mortgage-engine` exposes one interface with pluggable conventions:

```ts
interface MortgageConvention {
  periodicRate(annualNominal: number): number;   // handles CA semi-annual etc.
  schedule(input: LoanInput): AmortizationRow[];
  extras?: ExtraCostModel[];                     // PMI, assurance, stamp duty
}
```

Ship `standardMonthly` and `canadianSemiAnnual` in Week 1. Ship `germanAnnuity` in Week 2. Unit-test each against a known published example from the country's own regulator — and **put those test vectors on the methodology page**. Verifiable correctness is an E-E-A-T signal AI search engines reward.

---

## 5. Architecture

### 5.1 Repo

```
finance-hub/                          # Turborepo
├── apps/
│   └── web/                          # single Next.js app, 12 locales
├── packages/
│   ├── ui/                           # shared design system (reused from TimeSync)
│   ├── mortgage-engine/              # pure TS, zero deps, 100% test coverage
│   ├── finance-data/                 # country JSON + rate fetchers + FX client
│   ├── seo/                          # JSON-LD, hreflang, canonical, sitemap
│   ├── analytics/                    # GA4 + Plausible + AdSlot wrapper
│   └── config/                       # eslint, tsconfig, tailwind preset
```

**One Next.js app, not 12.** Twelve deployments for one tool is operational self-harm. Country is a route segment.

### 5.2 Rendering

Keep static export where possible, but **rate data needs a refresh path**. Two options:

- **Recommended:** move off `output: 'export'` to standard Next.js on Vercel with ISR. Country pages use `revalidate: 86400`. A Vercel Cron hits a revalidation route after each source publishes.
- **Alternative (stays fully static):** GitHub Action on a daily cron → fetch rates → commit JSON → triggers Vercel rebuild. Slower, zero runtime cost, and keeps the pure-static purity you have on TimeSync.

Pick ISR. The operational simplicity is worth it, and you're already paying for Vercel Pro (required — the Hobby tier prohibits commercial/ad-supported use).

### 5.3 URL structure & hreflang

```
/                                   → global hub, self-canonical
/us/mortgage-calculator             → x-default target
/uk/mortgage-calculator
/ca/mortgage-calculator
... 12 total
/methodology
/about  /privacy  /contact
/embed/mortgage-calculator          → noindex, iframe target
```

- Each country page **self-canonicals**.
- Full reciprocal `hreflang` cluster across all 12 + `x-default` → `/us/`.
- No auto-redirects. No cookie-based content switching.
- Country switcher is a real `<a>` link list in the footer, crawlable.

### 5.4 The embed widget (your link engine)

`/embed/mortgage-calculator?country=uk&theme=light` — `noindex, follow`, no ads, no nav, ~40KB.

Below the iframe, the embed snippet includes a **visible, non-hidden attribution link** back to the country page. Hidden or keyword-stuffed embed links are a link scheme; a visible "Powered by [Site]" is not. Offer the snippet on every country page under a "Add this calculator to your site" disclosure.

---

## 6. Week 1 feature list

**P0 — ships this week**

- [ ] Turborepo scaffold; `packages/ui` ported from TimeSync
- [ ] `mortgage-engine` with `standardMonthly` + `canadianSemiAnnual`, unit-tested against official examples
- [ ] `finance-data` with 12 country configs, Frankfurter FX client + daily cache, rate fetchers for US/UK/CA/AU
- [ ] Calculator UI: loan amount, deposit/down payment (£/% toggle), rate, term, start date
- [ ] Results: monthly payment, total interest, total cost, payoff date
- [ ] Amortization chart (balance curve + principal/interest split) + collapsible yearly table
- [ ] Extra-payment input with "you'd save X and finish Y earlier" callout
- [ ] Secondary FX display line with "reference rate" labelling
- [ ] Shareable permalink encoding all inputs (your TimeSync pattern — it works, reuse it)
- [ ] 12 country pages with local copy, local rate prefill, local formatting
- [ ] Methodology page with formulas + test vectors + source table
- [ ] Named author page with credentials and contact (**YMYL requirement, not optional**)
- [ ] Embed route + snippet generator
- [ ] JSON-LD: `WebApplication`, `FAQPage`, `BreadcrumbList`, `Organization` (+ `Dataset` on methodology)
- [ ] GSC + GA4 + Plausible; sitemap; robots allowing GPTBot/ClaudeBot/PerplexityBot/Google-Extended
- [ ] AdSlot placeholders reserving exact dimensions (CLS 0) — **ads not enabled yet**, AdSense applies once content threshold is met

**Explicitly NOT in Week 1:** login, saved scenarios, Supabase, PDF export, lender comparison, translated non-English content, programmatic state pages, dark mode.

---

## 7. Day-by-day

| Day | Work |
|---|---|
| **1** | Domain purchase + DNS. Turborepo scaffold. Port `packages/ui`. Deploy a hello-world to Vercel Pro. |
| **2** | `mortgage-engine`: both conventions, full unit tests against official worked examples. Pure logic, no UI. |
| **3** | `finance-data`: 12 country JSON configs, Frankfurter client + cache layer, US/UK/CA/AU rate fetchers, revalidation route. |
| **4** | Calculator UI + results + share permalink. Wire to engine. |
| **5** | Amortization chart + yearly table + extra-payment callout. |
| **6** | 12 country pages, copy from §9, hreflang, JSON-LD, methodology + author + about/privacy/contact. |
| **7** | Embed route. Lighthouse ≥95. GSC/GA4/Plausible/sitemap. Deploy. Submit for indexing. |

---

## 8. Definition of done

- Lighthouse ≥95 on all four axes, mobile, on a country page
- CLS = 0 with ad placeholders rendered
- Canadian payment matches a Canadian bank's published calculator to the cent
- US payment matches a Freddie Mac / CFPB worked example to the cent
- All 12 pages return 200, self-canonical, and appear in the sitemap
- hreflang cluster validates (no missing return links)
- Rich Results Test passes for `WebApplication` and `FAQPage`
- Share permalink round-trips every input
- FX cache survives a simulated Frankfurter 500 (serves last-good value)
- Every displayed rate has a visible source attribution and date

---

## 9. Content copy — MVP

Voice: plain, direct, numerate. No hype, no "revolutionary," no emoji. You are competing against banks; sound more trustworthy than them, not more excitable.

### 9.1 Global homepage

**H1:** Mortgage and home loan calculators that use your country's actual rules

**Sub:** Most calculators run one formula and change the currency symbol. Ours use each country's real repayment conventions, current reference rates, and local costs — so the number you see is the number you'd actually pay.

**Section — Choose your country**
> Repayment maths differs by country. Canadian fixed-rate mortgages compound semi-annually. German mortgages leave a residual balance at the end of the fixed-rate period. Pick your country and we'll apply the right rules.

**Trust strip (three items):**
- **Official rate sources.** Reference rates come from central banks and public statistics agencies, with the source and date shown on every page.
- **Open methodology.** Every formula we use is published, with worked examples you can check.
- **No lead capture.** No email required, no quotes, no broker handoff. The calculator just works.

### 9.2 US page

**Title tag:** Mortgage Calculator with Amortization Schedule (2026) — Monthly Payment & Total Interest
**Meta description:** Calculate your monthly mortgage payment, total interest, and full amortization schedule. Prefilled with the current Freddie Mac 30-year average. Free, no signup.

**H1:** Mortgage Calculator

**Answer-first paragraph (this is the AI-citation target — keep it extractable):**
> A $400,000 mortgage at 6.5% over 30 years costs about $2,528 per month in principal and interest, and roughly $510,000 in total interest over the full term. Change the numbers below to see your own figures, including a month-by-month amortization schedule and how much a single extra payment would save you.

**Rate prefill note:**
> Prefilled with the current Freddie Mac 30-year fixed average of **X.XX%** (week of *date*). Your quoted rate will depend on credit score, down payment, loan type, and location — edit the field to match your offer.

**H2:** How your monthly payment is calculated
> Your payment is fixed so that the loan reaches zero at the end of the term. Early payments are mostly interest; later payments are mostly principal. The chart shows exactly where the crossover happens for your loan.

**H2:** What this calculator does not include
> This shows principal and interest only. Your actual monthly escrow payment will also include property tax, homeowners insurance, and — if your down payment is under 20% — private mortgage insurance. Those vary by state and lender.

### 9.3 UK page (variant)

**Title tag:** Mortgage Calculator UK — Monthly Repayments, Total Interest & Overpayments
**H1:** UK Mortgage Calculator

**Answer-first:**
> A £300,000 mortgage at 4.5% over 25 years costs about £1,667 per month, with roughly £200,000 in total interest. Enter your own figures below, including what happens when your fixed period ends.

**UK-specific callout:**
> **Remember the revert rate.** Most UK mortgages are fixed for 2 or 5 years, then move to the lender's standard variable rate. This calculator shows the payment during your fixed period. Budget for a higher payment when it ends unless you remortgage.

### 9.4 Canada page (variant) — lead with the differentiator

**Title tag:** Canadian Mortgage Calculator — Semi-Annual Compounding, Accurate Payments
**H1:** Canadian Mortgage Calculator

**Answer-first:**
> A $500,000 mortgage at 5.0% over 25 years costs about $2,908 per month in Canada. Canadian fixed-rate mortgages compound semi-annually rather than monthly, which is why this figure is slightly lower than a US-style calculator would tell you.

**Differentiator callout:**
> **Why other calculators get Canada wrong.** By law, Canadian fixed-rate mortgages compound semi-annually, not in advance. Most international calculators divide the annual rate by 12, which overstates your payment. We convert the rate correctly — see the formula on our methodology page.

**Rate source note:**
> Prefilled from the Bank of Canada's posted conventional mortgage rates, which reflect the most typical rate among Canada's six major chartered banks.

### 9.5 Australia page (variant)

**Title tag:** Home Loan Repayment Calculator Australia — Monthly, Fortnightly & Weekly
**H1:** Australian Home Loan Repayment Calculator

**Answer-first:**
> A $600,000 home loan at 6.0% over 30 years costs about $3,597 per month. Switching to fortnightly repayments would cut roughly four years off the loan and save you around $150,000 in interest.

**AU callout:**
> **Fortnightly repayments.** Paying half your monthly amount every fortnight means 26 half-payments a year — the equivalent of 13 monthly payments instead of 12. Toggle the frequency to see the effect.

### 9.6 Currency conversion copy (used site-wide)

**Inline, next to the converted figure:**
> ≈ **{amount}** at today's European Central Bank reference rate ({rate}, {date}).

**Tooltip / expander:**
> **About this conversion.** Reference rates are published once each business day by the European Central Bank and are mid-market figures — banks and money-transfer services will offer you a different rate. Exchange rates also move continuously, so a conversion is only meaningful for today. Your mortgage is repaid in **{currency}**; this figure is for comparison only and is not part of the calculation.

### 9.7 FAQ (FAQPage schema — put on every country page, with local answers)

**Is this calculator free?**
> Yes, completely. No account, no email, no quote request. We're supported by advertising.

**How accurate is this?**
> The maths is exact for the inputs you give it — we test every formula against worked examples published by the relevant regulator or central bank, and you can see those on our methodology page. What we can't know is your specific lender's fees, insurance, or tax, so treat the result as principal and interest only unless a field says otherwise.

**Where do the interest rates come from?**
> Each country page prefills a reference rate from an official source — the central bank or national statistics body — and shows the source and publication date. These are averages, not offers. Your rate will differ.

**Why is the payment different from my bank's calculator?**
> Usually one of three things: your bank is including tax and insurance, it's applying its own fees, or it's using a different compounding convention. Our methodology page shows exactly which convention we use for your country.

**Can I use this for a mortgage in a different country than I live in?**
> Yes — pick the country where the property is. The mortgage follows the property's country rules and currency, not yours.

**Can I add this calculator to my website?**
> Yes, free. Copy the embed code at the bottom of any country page. It includes a link back to us.

### 9.8 Disclaimer (footer, every page)

> **This is an information tool, not financial advice.** The results are estimates based on the figures you enter and on published reference rates. They do not account for your personal circumstances, lender fees, taxes, or insurance, and they are not an offer of credit. Reference rates are averages and change frequently. Before making any borrowing decision, speak to a qualified mortgage adviser or your lender.

### 9.9 Author box (YMYL — this is load-bearing)

> **Written and maintained by {Full Name}**
> {Name} is a senior software engineer based in Dublin who builds financial calculation tools. The repayment engines behind this site are open-source and tested against worked examples published by the Federal Reserve Economic Data service, the Bank of Canada, the Bank of England, and the Reserve Bank of Australia. Corrections and methodology questions: {email}.
> *Last reviewed: {date}*

**Do not skip or soften this.** Google's expanded YMYL treatment means an anonymous finance calculator site has a materially lower ceiling regardless of how good the tool is. Your name, your face, your email, and a real methodology page are the cheapest ranking asset available to you.

### 9.10 Methodology page

**H1:** How we calculate mortgage repayments

Sections: the standard annuity formula (rendered, with variables defined) → per-country conventions table → worked example per Tier 1 country with the official source it was validated against → data sources table (§2.2, with links and cadence) → update policy → correction contact.

Include the Freddie Mac citation verbatim as required by the FRED terms, and note that the data is provided as-is without warranty.

### 9.11 Embed snippet copy

> **Add this calculator to your site.** Free, no attribution required beyond the link included in the code. The embed is under 40KB, contains no ads and no tracking, and inherits your page's light or dark background.

### 9.12 Meta descriptions — remaining 8

| Page | Meta description |
|---|---|
| `/ie/` | Irish mortgage calculator with current ECB-sourced rates, LTV and loan-to-income limits, and full repayment schedule. Free, no signup. |
| `/de/` | German mortgage calculator (Annuitätendarlehen) showing monthly rate, Tilgung, and residual debt at the end of your Zinsbindung. |
| `/nl/` | Dutch mortgage calculator comparing annuïteiten and lineair repayment with full amortisation schedule. |
| `/nz/` | New Zealand home loan calculator with weekly, fortnightly and monthly repayments and total interest. |
| `/fr/` | French mortgage calculator including assurance emprunteur, showing monthly payment and total cost of credit. |
| `/es/` | Spanish mortgage calculator for residents and non-resident buyers, with full repayment schedule. |
| `/sg/` | Singapore home loan calculator with monthly instalment, total interest, and repayment schedule. |
| `/in/` | Home loan EMI calculator with full amortisation schedule and prepayment savings. |

---

## 10. Programmatic page sets (Weeks 5+) — plan now, build later

TimeSync's ~300 city-pair pages work for a specific reason: **the pair itself is the query, and every page carries genuinely computed data** — real UTC offsets, real per-pair DST transition dates, a real overlap window. Nobody could produce those pages with find-and-replace. That is the test every programmatic set on this site has to pass.

### 10.1 Seam evaluation

| Seam | Pages | Unique data per page | Verdict |
|---|---|---|---|
| `/us/mortgage/[state]` | 50 | Property tax rate, median home price, transfer/recording tax, insurance cost, state first-time-buyer programs | **Build first.** Real legal and tax variation, materially changes the payment |
| `/uk/stamp-duty/[region]`, `/au/stamp-duty/[state]`, `/ca/land-transfer-tax/[province]` | ~15 | Actual duty bands, thresholds, reliefs | **Strong.** Genuinely different law per jurisdiction |
| `/compare/[country-a]-vs-[country-b]` | ~60 | Two rate sources, two repayment conventions, FX, two cost structures | **Defensible, lower volume.** Nobody does this — natural fit for the FX layer from §3 |
| `/[country]/mortgage/[amount]` ("£300,000 mortgage") | ~200 | One input changed in the same formula | **Risky — do not lead with this.** See §10.2 |
| `/[country]/mortgage/[rate]` | many | None | **Don't build** |

### 10.2 Why the amount-pages are a trap

They're the tempting set — "300k mortgage monthly payment" has real volume — and they fail on both axes at once:

- **Thinnest possible data.** The only variable is one number inside a formula you already run client-side. That is the textbook scaled-content pattern.
- **Most zero-click-vulnerable query shape.** A single-number arithmetic answer is exactly what AI Overviews resolve inline without a click. You'd be scaling into the query class most likely to be answered above you.

State pages invert both: property tax in New Jersey vs Alabama swings the monthly payment by hundreds of dollars, which needs a real table to answer, and "how does property tax affect my mortgage payment in Texas" is not a one-sentence AI answer.

If you want the amount-keywords later, capture them as **anchor-linked presets on the country page** (`/us/mortgage-calculator#300000`) rather than as separate indexed URLs. You get the internal relevance signal without the thin-page liability.

### 10.3 Constraints (carry over from the portfolio research)

- **25–30 new pages per week, maximum.** 50 state pages is a two-week block, not one afternoon.
- **≥3 genuinely unique data points per page**, each with `{ value, source, sourceUrl, lastReviewed }` — the same schema as the country configs in §2.3.
- **~60% unique content per page.** Template variation by slug hash (your TimeSync pattern) handles the prose; the data table does the real work.
- **Build the crawl hub before the leaves.** `/us/mortgage/` directory page with a state picker, plus contextual cross-links, exactly as `/meet` serves the pair pages.
- **Quarterly refresh of the bottom 20%** by impressions.

### 10.4 The structural difference from TimeSync

City pairs are combinatorial and symmetric — ~25 cities produced ~300 pages. **Finance seams don't multiply like that.** Fifty states gives you fifty pages, not 1,250. Depth here comes from *stacking seams on one country* rather than from pair math:

```
/us/mortgage-calculator          → tool (Week 1)
/us/mortgage/[state]             → 50 pages (Weeks 5-6)
/us/closing-costs/[state]        → 50 pages (Weeks 9-10)
/us/first-time-buyer/[state]     → 50 pages (Weeks 13-14)
```

That's ~150 US pages off one country's data spine, each set reusing the same curated dataset. It's a stronger argument for going deep on the US first than for spreading thin programmatic sets across all 12 countries.

### 10.5 Sequencing

Not Week 1, and not Week 2. The order that works is the one TimeSync followed: **tool → hub → internal links → long tail.** Fifty state pages pointed at a two-week-old domain with no tool traffic get crawled once and ignored. Week 5 is the earliest sensible start, and only if the Week 1 country pages are indexed by then.

---

## 11. Risks to watch in Week 1

| Risk | Mitigation |
|---|---|
| 12 pages of near-identical content trips scaled-content detection | Each page has distinct local rules, distinct rate source, distinct callout, distinct FAQ answers. If a country page has nothing genuinely different to say, **don't ship that country yet.** |
| Generic-engine countries mislead users | Visible badge: "This edition uses a standard annuity model. Local conventions coming soon." Honest, and it converts to a changelog post later. |
| Rate fetcher silently breaks; stale rates displayed | Every rate carries `fetchedAt`; if older than 14 days, hide the prefill and show "Enter your rate" instead of a stale number. Log to a health-check route. |
| AdSense rejection for thin content | Don't apply until Week 2, once methodology + author + 12 pages are live. Applying early and being rejected costs you time. |
| Building the German edition badly | Ship DE on the generic engine with the badge in Week 1. A wrong German mortgage page is worse than no German page. |

---

## 12. What Week 2 inherits

Because the engine, data layer, and design system are packages, Week 2's affordability calculator is roughly a day of work plus copy. That's the whole point of the Week 1 investment — the flagship is slow, everything after it is fast. If Week 1 takes nine days instead of seven, take the nine days; the packages are what make weeks 3–26 achievable.

---

*Sources for all rate and FX endpoints are listed in §2. Verify each provider's current free-tier terms and publication cadence before going live — free tiers and statistical release schedules both change without notice.*
