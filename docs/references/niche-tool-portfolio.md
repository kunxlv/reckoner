# Content Copy — Week 1: Multi-Country Mortgage Calculator

**Status:** authoritative. Use these strings verbatim. Do not paraphrase, do not add filler, do not add emoji.

---

## 0. Voice

We are competing against banks, so we sound **more trustworthy than a bank, not more excited than one.** Plain, numerate, direct.

**Rules**
- Sentence case everywhere. Never Title Case Buttons.
- Active voice. A control says what it does.
- No "seamlessly," "effortlessly," "unlock," "empower," "revolutionary," "game-changing," "in today's world," "whether you're X or Y."
- No emoji. No exclamation marks.
- Numbers are specific. "About $2,528" beats "an affordable payment."
- Never congratulate the user. Never apologize.
- Errors say what happened and what to do next.
- Second person. "Your payment," not "the user's payment."
- Say "we" only where a human is accountable (methodology, corrections).

**Test:** if a sentence could appear on any of the ten thousand other calculator sites, rewrite it.

---

## 1. Global chrome

| Element | Copy |
|---|---|
| Wordmark | `reckoner` + `.tools` (see design system §0.5) |
| Tagline (hub page only) | `Calculators that show their working.` |
| Nav: tools | `Tools` |
| Nav: country trigger | `{flag} {ISO}` e.g. `🇺🇸 US` |
| Skip link | `Skip to calculator` |
| Footer heading 1 | `Calculators` |
| Footer heading 2 | `Countries` |
| Footer heading 3 | `About` |
| Footer links | `Methodology` · `How we source rates` · `Who writes this` · `Privacy` · `Contact` |
| Footer legal line | `Information tool, not financial advice. Figures are estimates.` |

---

## 2. Country selector

**Trigger aria-label:** `Change country. Currently United States.`

**Popover heading:** `Choose the country the property is in`

**Popover helper:** `Repayment rules differ by country. We apply the local ones.`

**List items:** `🇺🇸 United States · USD` / `🇬🇧 United Kingdom · GBP` / `🇨🇦 Canada · CAD` / `🇦🇺 Australia · AUD` / `🇮🇪 Ireland · EUR` / `🇩🇪 Germany · EUR` / `🇳🇱 Netherlands · EUR` / `🇳🇿 New Zealand · NZD` / `🇫🇷 France · EUR` / `🇪🇸 Spain · EUR` / `🇸🇬 Singapore · SGD` / `🇮🇳 India · INR`

**Footnote inside popover:**
> Your figures carry over unchanged. We don't convert them — a 400,000 loan stays 400,000 in the new currency.

**Tier-2/3 badge (on the 8 generic-engine countries):**
- Badge: `Standard model`
- Tooltip: `This edition uses the standard annuity formula. Local repayment conventions are on the way.`

**Geo suggestion banner (once per visitor, dismissible):**
> Looks like you're in Australia. Want the **AU calculator** instead? It uses local lending rates and repayment frequencies.
> Buttons: `Switch to Australia` · `Stay on US`

**Empty/unsupported country:**
> We don't have a {Country} edition yet. The closest match is our standard model — the maths is correct, but it won't include local taxes or lending rules.

---

## 3. Currency display toggle

Lives inside the result card, below a hairline, subordinate to the primary figure.

| Element | Copy |
|---|---|
| Default line | `≈ €2,340 · European Central Bank reference rate, 27 Jul` |
| Currency dropdown aria-label | `Show the payment in another currency` |
| Dropdown heading | `Also show in` |
| Off state | `Show in another currency` |
| Info icon aria-label | `About this conversion` |

**Info popover:**
> **This is a comparison figure, not part of the calculation.**
> Your mortgage is repaid in {currency} — that's the number the lender charges you.
>
> Reference rates are published once each business day by the European Central Bank. They're mid-market rates: a bank or transfer service will offer you something different. Rates also move daily, so this figure is only good for today.

**Stale rate state (>48h old):**
> Rate from {date}. We refresh once each business day.

**Failed fetch state:**
> Conversion is unavailable right now. Your payment in {currency} is unaffected.

---

## 4. Calculator interface strings

### 4.1 Inputs

| Field | Label | Helper | Placeholder |
|---|---|---|---|
| Home price | `Home price` | — | `400,000` |
| Down payment | `Down payment` | `Under 20% usually means paying PMI.` *(US)* | `80,000` |
| Deposit *(UK/IE/AU/NZ)* | `Deposit` | `A bigger deposit usually gets you a better rate.` | `60,000` |
| Interest rate | `Interest rate` | `Prefilled with this week's national average. Change it to your quoted rate.` | `6.50` |
| Term | `Term` | — | segmented: `15` `20` `25` `30` + `Other` |
| Repayment frequency *(AU/NZ)* | `Repay` | `Fortnightly means 26 half-payments a year — one extra month's worth.` | `Monthly` `Fortnightly` `Weekly` |
| Fixed period *(UK/IE/DE)* | `Fixed for` | `What happens after this matters — see below.` | `2` `5` `10` years |

**Down payment percent toggle:** `%` / `{currency symbol}` — aria-label `Enter down payment as amount or percentage`

**Disclosure trigger:** `Add taxes, insurance and fees` *(US: `Add property tax, insurance and PMI`)*
**Disclosure helper:** `Optional. Affects your total monthly cost, not the loan itself.`

| Advanced field | Label | Helper |
|---|---|---|
| Property tax | `Property tax` | `We prefilled the {State} average. Your county may differ.` |
| Home insurance | `Home insurance` | — |
| PMI *(US)* | `PMI` | `Drops off automatically at 78% loan-to-value.` |
| HOA | `HOA fees` | — |
| Extra payment | `Extra monthly payment` | `See what even a small amount does to your total interest.` |

### 4.2 Results

| Element | Copy |
|---|---|
| Primary label | `Monthly payment` |
| Primary sub | `Principal and interest` *(or `Principal, interest, tax and insurance` when disclosure is filled)* |
| Secondary 1 | `Total interest` |
| Secondary 2 | `Total paid` |
| Secondary 3 | `Paid off` → `March 2056` |
| Overpayment callout | `Paying $200 extra each month clears the loan 4 years 7 months early and saves $118,400 in interest.` |
| Share button | `Copy link to these figures` → toast: `Link copied` |
| Embed link | `Add this calculator to your site` |

### 4.3 States

| State | Copy |
|---|---|
| Initial (prefilled, always shows a real result) | *Never show an empty state. The calculator loads with a realistic worked example for the country.* |
| Rate unavailable | `Enter your interest rate` + helper `We couldn't reach the rate source. Your lender's quoted rate is more accurate anyway.` |
| Value too low | `Enter an amount above 0.` |
| Value above cap | `That's above the maximum we model ({cap}). Enter a lower amount.` |
| Rate implausible | `Rates above 25% are unusual. Check the figure.` |
| Term invalid | `Enter a term between 1 and 40 years.` |
| Down payment ≥ price | `Your down payment covers the full price — there's no mortgage to calculate.` |
| Zero-interest edge | `At 0% interest your payment is simply the loan divided by the number of months.` |

### 4.4 Chart labels

| Element | Copy |
|---|---|
| Chart title | `Where your money goes` |
| Series (direct-labelled) | `Interest` / `Principal` |
| Crossover marker | `Year 18 — from here you pay more principal than interest` |
| Chart aria-label | `Stacked area chart of cumulative payments over 30 years. Interest dominates until year 18, after which principal repayment is larger. Total interest paid is $510,178.` |
| Data table caption (visually hidden) | `Yearly breakdown of principal and interest` |
| Balance chart title | `What you still owe` |
| LTV reference line | `PMI typically drops off here` |
| Comparison chart title | `With and without extra payments` |
| Mobile axis abbreviation | `$400k` |

---

## 5. Page copy — US (template for all editions)

**Title tag (57 chars):**
`Mortgage Calculator with Amortization Schedule | Reckoner`

**Meta description (152 chars):**
`Work out your monthly mortgage payment, total interest and full amortization schedule. Prefilled with this week's Freddie Mac 30-year average. Free, no signup.`

**H1:** `Mortgage Calculator`

**Answer-first paragraph** *(this is the AI-citation and featured-snippet target — keep it factual, self-contained, and under 60 words):*
> A $400,000 mortgage at 6.5% over 30 years costs about **$2,528 a month** in principal and interest, and roughly **$510,000 in total interest** over the full term. Change the figures below to see your own numbers, a month-by-month schedule, and what a single extra payment would save you.

**Rate provenance line (under the rate field):**
> Prefilled with the Freddie Mac 30-year fixed average of **6.50%**, week of 24 July 2026. Your quoted rate depends on credit score, down payment, loan type and location.

**H2:** `How your payment is worked out`
> Your payment is fixed so the loan reaches zero at the end of the term. Early payments are mostly interest because interest is charged on a bigger balance. As the balance falls, more of each payment goes to principal. The chart above shows exactly where that flips for your loan.

**H2:** `What this doesn't include`
> This is principal and interest only unless you fill in the optional fields. Your actual monthly cost will also include property tax, homeowners insurance, and — if your down payment is under 20% — private mortgage insurance. All three vary by state and lender.

**H2:** `Why our number may differ from your bank's`
> Usually one of three things: your bank is bundling tax and insurance into the figure, it's adding its own fees, or it's using a different compounding convention. Ours is published on the methodology page, with worked examples you can check.

---

## 6. Country variants — the differentiating copy

Each edition needs at least one paragraph that could only have been written for that country. Where you can't write one, don't ship that edition.

### United Kingdom
**Title:** `Mortgage Calculator UK — Monthly Repayments & Overpayments | Reckoner`
**H1:** `UK Mortgage Calculator`
**Answer-first:**
> A £300,000 mortgage at 4.5% over 25 years costs about **£1,667 a month**, with roughly **£200,000 in total interest**. Enter your own figures below, including what happens when your fixed period ends.

**Local callout — `Remember the revert rate`:**
> Most UK mortgages are fixed for two or five years, then move to the lender's standard variable rate — often several points higher. This shows your payment during the fixed period. Budget for the jump, or plan to remortgage before it lands.

### Canada
**Title:** `Canadian Mortgage Calculator — Semi-Annual Compounding | Reckoner`
**H1:** `Canadian Mortgage Calculator`
**Answer-first:**
> A $500,000 mortgage at 5.0% over 25 years costs about **$2,908 a month** in Canada. Canadian fixed-rate mortgages compound semi-annually rather than monthly, which is why this is slightly lower than a US-style calculator would tell you.

**Local callout — `Why other calculators get Canada wrong`:**
> By law, Canadian fixed-rate mortgages compound semi-annually, not in advance. Most international calculators just divide the annual rate by twelve, which overstates your payment by a few dollars a month and thousands over the term. We convert the rate properly — the formula is on our methodology page.

**Rate provenance:**
> Prefilled from the Bank of Canada's posted conventional mortgage rates, which reflect the most typical rate among the six major chartered banks.

### Australia
**Title:** `Home Loan Repayment Calculator Australia | Reckoner`
**H1:** `Australian Home Loan Repayment Calculator`
**Answer-first:**
> A $600,000 home loan at 6.0% over 30 years costs about **$3,597 a month**. Switching to fortnightly repayments cuts roughly four years off the loan and saves around **$150,000 in interest**.

**Local callout — `Fortnightly repayments do more than they look like they should`:**
> Paying half your monthly amount every fortnight means 26 half-payments a year — the equivalent of thirteen monthly payments instead of twelve. That extra month goes almost entirely to principal. Switch the frequency above to see it.

### Ireland
**Title:** `Mortgage Calculator Ireland — Repayments & LTV Limits | Reckoner`
**H1:** `Irish Mortgage Calculator`
**Answer-first:**
> A €350,000 mortgage at 3.9% over 30 years costs about **€1,651 a month**, with roughly **€244,000 in total interest**.

**Local callout — `Loan-to-income limits`:**
> Central Bank rules cap most borrowing at four times gross income for first-time buyers and three and a half times for others, with loan-to-value limits on top. If your figures exceed those, a lender will need an exception — which is rationed.

### Germany
**Title:** `Baufinanzierung Calculator — Rate, Tilgung & Restschuld | Reckoner`
**H1:** `German Mortgage Calculator`
**Answer-first:**
> A €400,000 Annuitätendarlehen at 3.6% with 2% initial Tilgung costs about **€1,867 a month**. After a 10-year Zinsbindung you'd still owe roughly **€324,000** — the Restschuld you refinance.

**Local callout — `German mortgages don't end when the fixed period does`:**
> You fix your rate for a set period, usually ten or fifteen years, but the loan isn't repaid by then. What's left is your Restschuld, and you refinance it at whatever rates exist at that point. Your initial Tilgung rate is the single biggest lever on how large that residual is.

### Netherlands
**Local callout — `Annuïteiten or lineair`:**
> Annuity repayments stay flat; linear repayments start higher and fall every month. Linear costs less in total interest but demands more up front. Switch between them above.

### New Zealand
**Local callout — `Weekly and fortnightly repayments`:**
> Most New Zealand lenders let you repay weekly or fortnightly at no extra cost, which shortens the term without you noticing the difference month to month.

### France
**Local callout — `Assurance emprunteur isn't optional`:**
> Borrower's insurance is required in practice and is usually quoted on the initial capital rather than the outstanding balance. It's why the TAEG is meaningfully higher than the headline rate.

### Spain
**Local callout — `Buying as a non-resident`:**
> Non-resident buyers are typically capped at around 70% loan-to-value against 80% for residents, and purchase costs run roughly 10–14% of the price on top of the deposit.

### Singapore
**Local callout — `TDSR caps what you can borrow`:**
> Total Debt Servicing Ratio limits your combined monthly debt repayments to 55% of gross income, and the Mortgage Servicing Ratio caps HDB loans at 30%. Those usually bind before the repayment maths does.

### India
**Local callout — `Prepayment is where the money is`:**
> Floating-rate home loans in India carry no prepayment penalty for individual borrowers. A single annual lump sum in the early years removes far more interest than the same amount later.

---

## 7. FAQ (FAQPage schema — every country page, localised answers)

**Is this free?**
> Yes. No account, no email, no quote request. The site is supported by advertising.

**How accurate is it?**
> The maths is exact for the figures you enter. We test every formula against worked examples published by the relevant central bank or regulator, and those tests are on the methodology page. What we can't know is your lender's specific fees, so treat the result as principal and interest unless you've filled in the optional fields.

**Where do the interest rates come from?**
> Each country page prefills a reference rate from an official source — a central bank or national statistics body — and shows the source and publication date next to the field. These are averages, not offers.

**Why is this different from my bank's calculator?**
> Usually the bank is including tax and insurance, adding its own fees, or using a different compounding convention. Ours is documented on the methodology page.

**Can I use this for a property in another country?**
> Yes. Choose the country the property is in, not where you live — the mortgage follows the property's rules and currency.

**Can I put this calculator on my own site?**
> Yes, free. The embed code is at the bottom of every country page and includes a link back to us.

---

## 8. Trust and disclosure blocks

### `How this is calculated` (expandable, on every tool)
> **Standard annuity formula.** Your monthly payment is the amount that reduces the balance to zero over the term:
> `M = P × [ i(1+i)ⁿ ] / [ (1+i)ⁿ − 1 ]`
> where `P` is the loan, `n` the number of monthly payments, and `i` the monthly rate.
> **For this country** we derive `i` as {convention}. Figures are rounded to the nearest {unit} for display and calculated at full precision.
> `Full methodology and worked examples →`

### `Where the rate comes from` (expandable)
> **{Source name}**, published {cadence}. Last fetched {date}.
> This is a national average, not a quote. Your rate will depend on your circumstances and lender.
> `View the source →`

### Footer disclaimer (every page)
> **This is an information tool, not financial advice.** The results are estimates based on the figures you enter and on published reference rates. They don't account for your circumstances, lender fees, taxes or insurance, and they aren't an offer of credit. Reference rates are averages and change frequently. Talk to a qualified mortgage adviser or your lender before borrowing.

### Author box (required — YMYL)
> **Written and maintained by {Full Name}**
> {Name} is a software engineer in Dublin who builds financial calculation tools. The repayment engines behind this site are tested against worked examples published by FRED, the Bank of Canada, the Bank of England and the Reserve Bank of Australia. Found an error? {email}
> *Last reviewed {date}*

---

## 9. Embed

**Section heading:** `Add this calculator to your site`
**Body:**
> Free to use. The embed is under 40KB, carries no ads and no tracking, and inherits your page's background. The code includes a link back to this page.

**Button:** `Copy embed code` → `Copied`

---

## 10. Meta for the remaining editions

| Route | Title tag | Meta description |
|---|---|---|
| `/uk/` | `Mortgage Calculator UK — Monthly Repayments & Overpayments` | `Work out UK mortgage repayments, total interest and overpayment savings. Shows what happens when your fixed period ends. Free, no signup.` |
| `/ca/` | `Canadian Mortgage Calculator — Semi-Annual Compounding` | `Canadian mortgage payments calculated with proper semi-annual compounding, not the US monthly shortcut. Bank of Canada posted rates. Free.` |
| `/au/` | `Home Loan Repayment Calculator Australia — Weekly & Fortnightly` | `Australian home loan repayments with monthly, fortnightly and weekly options. See how much fortnightly repayments save. RBA rate data.` |
| `/ie/` | `Mortgage Calculator Ireland — Repayments, LTV and LTI Limits` | `Irish mortgage repayments with Central Bank loan-to-income and loan-to-value limits built in. ECB-sourced rates. Free, no signup.` |
| `/de/` | `German Mortgage Calculator — Rate, Tilgung and Restschuld` | `Calculate your Annuitätendarlehen monthly rate and the Restschuld left at the end of your Zinsbindung. ECB-sourced rates. Free.` |
| `/nl/` | `Dutch Mortgage Calculator — Annuïteiten vs Lineair` | `Compare annuity and linear Dutch mortgage repayments side by side, with full amortisation schedule. ECB-sourced rates. Free.` |
| `/nz/` | `Home Loan Calculator NZ — Weekly, Fortnightly, Monthly` | `New Zealand home loan repayments across weekly, fortnightly and monthly schedules, with total interest and payoff date. Free.` |
| `/fr/` | `French Mortgage Calculator — Mensualité and Coût Total` | `French mortgage repayments including assurance emprunteur, with total cost of credit and full schedule. ECB-sourced rates. Free.` |
| `/es/` | `Spanish Mortgage Calculator — Resident and Non-Resident` | `Spanish mortgage repayments for residents and non-resident buyers, with LTV limits and purchase costs. ECB-sourced rates. Free.` |
| `/sg/` | `Home Loan Calculator Singapore — TDSR and Monthly Instalment` | `Singapore home loan instalments with TDSR and MSR limits, total interest and full repayment schedule. Free, no signup.` |
| `/in/` | `Home Loan EMI Calculator — Schedule and Prepayment Savings` | `Calculate your home loan EMI, full amortisation schedule, and how much a prepayment saves in interest. Free, no signup.` |

---

## 11. Global hub page

**H1:** `Financial calculators that use your country's actual rules`

**Sub:**
> Most calculators run one formula and change the currency symbol. Ours apply each country's real repayment conventions, current reference rates and local costs — so the number you see is the one you'd actually pay.

**Section heading:** `Choose your country`
> Repayment maths genuinely differs. Canadian fixed-rate mortgages compound semi-annually. German mortgages leave a balance outstanding when the fixed period ends. Pick a country and we apply the right rules.

**Three trust points** *(rendered as a row of text with hairline separators — not as three cards with icons)*
- **Official sources.** Reference rates come from central banks and national statistics agencies, with the source and date shown on every page.
- **Open methodology.** Every formula is published, with worked examples you can check.
- **No lead capture.** No email, no quote form, no broker handoff. The calculator just works.
