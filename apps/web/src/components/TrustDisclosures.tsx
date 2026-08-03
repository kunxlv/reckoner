'use client';
import { useState } from 'react';
import type { RateResult } from '@reckoner/finance-data';
import type { ConventionId } from '@reckoner/finance-data';

type AffordabilityMethod = 'lti_ltv' | 'dti_stress' | 'serviceability_buffer' | 'tdsr_msr';

export type CalculatorContext =
  | { type: 'mortgage'; convention: ConventionId }
  | { type: 'stamp-duty' }
  | { type: 'affordability'; method: AffordabilityMethod }
  | { type: 'refinance' }
  | { type: 'rent-vs-buy' }
  | { type: 'personal-loan' }
  | { type: 'auto-loan' }
  | { type: 'credit-card-payoff' }
  | { type: 'debt-strategy' };

interface ItemProps {
  label: string;
  children: React.ReactNode;
  borderBottom?: boolean;
}

function AccordionItem({ label, children, borderBottom = true }: ItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ borderBottom: borderBottom ? '1px solid var(--color-hairline)' : 'none' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          width: '100%', textAlign: 'left', background: 'none', border: 'none',
          padding: '18px 24px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 16, fontWeight: 500, color: 'var(--color-ink)',
        }}
      >
        <svg
          width="10" height="12" viewBox="0 0 8 12" fill="none"
          aria-hidden="true"
          style={{
            transform: open ? 'rotate(90deg)' : 'none',
            transition: 'transform 200ms cubic-bezier(0.2,0,0,1)',
            flexShrink: 0,
          }}
        >
          <path d="M1.5 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        {label}
      </button>

      <div style={{
        display: 'grid',
        gridTemplateRows: open ? '1fr' : '0fr',
        transition: 'grid-template-rows 200ms cubic-bezier(0.2,0,0,1)',
      }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ padding: '0 24px 20px 44px' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

const code = (s: string) => (
  <code style={{ fontFamily: 'monospace', fontSize: 13, background: 'var(--color-surface)', padding: '1px 5px' }}>
    {s}
  </code>
);

const pre = (s: string) => (
  <pre style={{
    background: 'var(--color-surface)', border: '1px solid var(--color-hairline)',
    padding: '14px 18px', fontSize: 13, overflowX: 'auto', margin: 0,
    lineHeight: 1.6, fontFamily: 'monospace', color: 'var(--color-ink)',
  }}>
    {s}
  </pre>
);

function MortgageFormula({ convention }: { convention: ConventionId }) {
  const isCanadian = convention === 'canadianSemiAnnual';
  return (
    <div style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--color-ink-deep)', display: 'grid', gap: 12 }}>
      <p style={{ margin: 0 }}>
        Your payment is fixed so the loan reaches exactly zero at the end of the term. That amount is called an annuity payment:
      </p>
      {pre(`M = P × [ i(1+i)^n ] / [ (1+i)^n − 1 ]

  P  loan principal (home price minus deposit)
  n  total payments (term in years × payments per year)
  i  periodic interest rate`)}
      <p style={{ margin: 0 }}>
        {isCanadian ? (
          <>
            <strong style={{ fontWeight: 500 }}>Periodic rate (Canada):</strong>{' '}
            Canadian law requires fixed-rate mortgages to compound semi-annually, not monthly.
            The periodic rate is {code('i = (1 + r/2)^(1/6) − 1')}, which produces a slightly
            lower payment than a standard r/12 calculation.
          </>
        ) : (
          <>
            <strong style={{ fontWeight: 500 }}>Periodic rate:</strong>{' '}
            The annual rate divided by payments per year. For monthly payments: {code('i = r / 12')}.
          </>
        )}
      </p>
      <p style={{ margin: 0 }}>
        Early payments are mostly interest because interest accrues on a larger balance. As the balance falls, each payment retires more principal. The chart above shows exactly where that crossover happens for your loan.
      </p>
      <p style={{ margin: 0 }}>
        <a href="/methodology" style={{ color: 'var(--color-ink)', fontWeight: 500 }}>Full methodology with worked examples</a>
      </p>
    </div>
  );
}

function StampDutyFormula() {
  return (
    <div style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--color-ink-deep)', display: 'grid', gap: 12 }}>
      <p style={{ margin: 0 }}>
        Tax is calculated by progressive banding. Each rate applies only to the slice of the purchase price that falls within that band, not to the whole price.
      </p>
      {pre(`tax = sum of (slice × rate) for each band
  where slice = min(price, band upper) − band lower`)}
      <p style={{ margin: 0 }}>
        <strong style={{ fontWeight: 500 }}>Relief (e.g. first-time buyer):</strong>{' '}
        When active, the relief bands replace the standard bands entirely, but only if the purchase price is at or below the relief cap. Above the cap, standard rates apply to the full price with no concession.
      </p>
      <p style={{ margin: 0 }}>
        <strong style={{ fontWeight: 500 }}>Surcharges:</strong>{' '}
        Applied as a flat percentage of the full purchase price and added on top of the base tax. They do not affect which band is used for the base calculation.
      </p>
    </div>
  );
}

function AffordabilityFormula({ method }: { method: AffordabilityMethod }) {
  return (
    <div style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--color-ink-deep)', display: 'grid', gap: 12 }}>
      {method === 'lti_ltv' && (
        <>
          <p style={{ margin: 0 }}>
            Maximum borrowing is the lower of two regulatory limits:
          </p>
          {pre(`income limit  = gross annual income × LTI multiple
              (4× for first-time buyers, 3.5× for subsequent buyers, lower for buy-to-let)

LTV limit     = property price × max loan-to-value ratio
              (90% owner-occupy, 70% buy-to-let)

max borrow = min(income limit, LTV limit)`)}
          <p style={{ margin: 0 }}>
            The binding constraint shown in the result is whichever of the two limits produces the lower figure. Lenders may grant exceptions, but these are rationed annually.
          </p>
        </>
      )}
      {method === 'serviceability_buffer' && (
        <>
          <p style={{ margin: 0 }}>
            APRA requires lenders to assess whether you can service the loan at your contract rate plus a 3 percentage point buffer:
          </p>
          {pre(`assessment rate  = contract rate + 3%

max monthly payment = gross monthly income × 35% − existing monthly debts

max borrow = PMT⁻¹(max monthly payment, assessment rate / 12, term in months)
           = max monthly payment × [ (1+i)^n − 1 ] / [ i(1+i)^n ]`)}
          <p style={{ margin: 0 }}>
            The 3% buffer is why lenders quote a lower borrowing capacity than the rate you will actually pay would suggest. It was raised from 2.5% to 3.0% in October 2021.
          </p>
        </>
      )}
      {method === 'dti_stress' && (
        <>
          <p style={{ margin: 0 }}>
            OSFI B-20 requires lenders to qualify borrowers at the Mortgage Qualification Rate (MQR): whichever is higher, the contract rate plus 2%, or 5.25%:
          </p>
          {pre(`assessment rate  = max(contract rate + 2%, 5.25%)

max monthly payment = gross monthly income × 39% − existing monthly debts

max borrow = PMT⁻¹(max monthly payment, assessment rate / 12, term in months)`)}
          <p style={{ margin: 0 }}>
            The stress test applies to insured and uninsured mortgages from federally regulated lenders. The 39% gross income cap is a representative conventional limit; individual lenders may vary.
          </p>
        </>
      )}
      {method === 'tdsr_msr' && (
        <>
          <p style={{ margin: 0 }}>
            MAS rules cap the Total Debt Servicing Ratio (TDSR) at 55% of gross monthly income. A rate floor of 4% applies to prevent underestimating payments on low-rate loans:
          </p>
          {pre(`assessment rate  = max(contract rate, 4%)

max monthly payment = gross monthly income × 55% − all existing monthly debts
                    (Mortgage Servicing Ratio: 30% for HDB loans)

max borrow = PMT⁻¹(max monthly payment, assessment rate / 12, term in months)`)}
          <p style={{ margin: 0 }}>
            The binding constraint is whichever of TDSR or MSR produces the lower figure. Existing car loans, personal loans, and credit card minimum payments all count toward the 55% cap.
          </p>
        </>
      )}
    </div>
  );
}

function RefinanceFormula() {
  return (
    <div style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--color-ink-deep)', display: 'grid', gap: 12 }}>
      <p style={{ margin: 0 }}>
        Both the current and new payments use the standard annuity formula:
      </p>
      {pre(`M = P × [ i(1+i)^n ] / [ (1+i)^n − 1 ]

  P  outstanding balance
  n  remaining months
  i  annual rate ÷ 12`)}
      {pre(`monthly saving    = current payment − new payment

break-even (months) = ceil(upfront costs ÷ monthly saving)

total saving over term = monthly saving × remaining months − upfront costs`)}
      <p style={{ margin: 0 }}>
        A negative total saving means the upfront costs exceed the cumulative saving over the remaining term. Refinancing is only worthwhile if you stay in the property past the break-even point.
      </p>
    </div>
  );
}

function RentVsBuyFormula() {
  return (
    <div style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--color-ink-deep)', display: 'grid', gap: 12 }}>
      <p style={{ margin: 0 }}>
        The calculator projects the 10-year financial outcome of each option.
      </p>
      {pre(`Buying
  mortgage payment     = annuity PMT on (price − deposit) at the given rate
  opportunity cost/mo  = deposit × (investment return ÷ 12)
  effective buy cost   = mortgage payment + opportunity cost

  future property value = price × (1 + appreciation)^10
  equity at year 10     = future value − outstanding loan balance

Renting
  rent total = monthly rent × 120 months

Net buy advantage = rent total − (effective buy cost × 120) + (equity − deposit)`)}
      <p style={{ margin: 0 }}>
        A positive net advantage means buying comes out ahead over 10 years with these assumptions. The result is highly sensitive to the appreciation and investment return inputs — small changes shift the outcome significantly.
      </p>
      <p style={{ margin: 0 }}>
        The model does not account for principal paydown reducing the outstanding balance over time (equity is simplified to future value minus original loan). It also excludes maintenance, insurance, and transaction costs.
      </p>
    </div>
  );
}

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

function CreditCardPayoffFormula() {
  return (
    <div style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--color-ink-deep)', display: 'grid', gap: 12 }}>
      <p style={{ margin: 0 }}>
        Each month, interest accrues on the outstanding balance, then your payment reduces the principal:
      </p>
      {pre(`monthly interest = balance × (APR ÷ 12)

minimum payment (% rule) = max(balance × percent, floor amount)
minimum payment (fixed)  = fixed amount

payment applied: interest first, remainder to principal

balance next month = balance − (payment − monthly interest)`)}
      <p style={{ margin: 0 }}>
        <strong style={{ fontWeight: 500 }}>With an extra monthly payment:</strong>{' '}
        The extra amount goes entirely to principal every month, shortening the payoff timeline and reducing total interest proportionally.
      </p>
      <p style={{ margin: 0 }}>
        All arithmetic uses integer cent values to avoid floating-point drift over many months.
      </p>
    </div>
  );
}

function DebtStrategyFormula() {
  return (
    <div style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--color-ink-deep)', display: 'grid', gap: 12 }}>
      <p style={{ margin: 0 }}>
        Each month, interest accrues on every debt, then minimums are paid on all debts. Any extra budget is directed to the focus debt:
      </p>
      {pre(`interest per debt = balance × (APR ÷ 12)  [floored to cents]

Minimum-only:  pay each debt's minimum — no extra budget applied.

Snowball:      extra budget → debt with the lowest remaining balance.
               When a debt reaches zero, add its minimum to the budget.

Avalanche:     extra budget → debt with the highest APR.
               When a debt reaches zero, add its minimum to the budget.`)}
      <p style={{ margin: 0 }}>
        Avalanche minimises total interest paid. Snowball pays off individual debts faster, which some people find more motivating.
      </p>
    </div>
  );
}

interface TrustDisclosuresProps {
  context: CalculatorContext;
  rateResult?: RateResult | null;
}

export function TrustDisclosures({ context, rateResult = null }: TrustDisclosuresProps) {
  const showRateSection = context.type !== 'stamp-duty'
    && context.type !== 'personal-loan'
    && context.type !== 'auto-loan'
    && context.type !== 'credit-card-payoff'
    && context.type !== 'debt-strategy';

  return (
    <div style={{ background: 'var(--color-canvas)', border: '1px solid var(--color-hairline)' }}>
      <AccordionItem label="How this is calculated" borderBottom={showRateSection}>
        {context.type === 'mortgage' && <MortgageFormula convention={context.convention} />}
        {context.type === 'stamp-duty' && <StampDutyFormula />}
        {context.type === 'affordability' && <AffordabilityFormula method={context.method} />}
        {context.type === 'refinance' && <RefinanceFormula />}
        {context.type === 'rent-vs-buy' && <RentVsBuyFormula />}
        {context.type === 'personal-loan' && <PersonalLoanFormula />}
        {context.type === 'auto-loan' && <AutoLoanFormula />}
        {context.type === 'credit-card-payoff' && <CreditCardPayoffFormula />}
        {context.type === 'debt-strategy' && <DebtStrategyFormula />}
      </AccordionItem>

      {showRateSection && (
        <AccordionItem label="Where the rate comes from" borderBottom={false}>
          <div style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--color-ink-deep)', display: 'grid', gap: 12 }}>
            {rateResult ? (
              <>
                <p style={{ margin: 0 }}>
                  This page prefills{' '}
                  <strong style={{ fontWeight: 500 }}>{(rateResult.value * 100).toFixed(2)}%</strong>{' '}
                  from the{' '}
                  <a href={rateResult.sourceUrl} style={{ color: 'var(--color-ink)' }} target="_blank" rel="noopener noreferrer">
                    {rateResult.source}
                  </a>
                  , published {rateResult.asOf}.
                </p>
                <p style={{ margin: 0 }}>
                  This is a reference average, not a personal offer. Your lender&apos;s rate depends on your credit score, deposit size, and loan type. The rate you are actually quoted may be meaningfully higher or lower.
                </p>
              </>
            ) : (
              <p style={{ margin: 0 }}>
                No live rate is available right now. The field is prefilled with a typical rate for this market. Change it to your lender&apos;s quoted rate to see your actual figures.
              </p>
            )}
            <p style={{ margin: 0 }}>
              The rate field is editable. Type your lender&apos;s quoted rate to see your own numbers.
            </p>
          </div>
        </AccordionItem>
      )}
    </div>
  );
}
