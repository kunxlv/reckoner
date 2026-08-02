'use client';
import { useState } from 'react';
import type { RateResult } from '@reckoner/finance-data';
import type { ConventionId } from '@reckoner/finance-data';

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

interface TrustDisclosuresProps {
  convention: ConventionId;
  rateResult: RateResult | null;
}

export function TrustDisclosures({ convention, rateResult }: TrustDisclosuresProps) {
  const isCanadian = convention === 'canadianSemiAnnual';

  return (
    <div style={{ background: 'var(--color-canvas)', border: '1px solid var(--color-hairline)' }}>
      <AccordionItem label="How this is calculated">
        <div style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--color-ink-deep)', display: 'grid', gap: 12 }}>
          <p style={{ margin: 0 }}>
            Your payment is fixed so the loan reaches exactly zero at the end of the term. That amount is called an annuity payment:
          </p>
          <pre style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-hairline)',
            padding: '14px 18px', fontSize: 13, overflowX: 'auto', margin: 0,
            lineHeight: 1.6, fontFamily: 'monospace', color: 'var(--color-ink)',
          }}>
            {`M = P x [ i(1+i)^n ] / [ (1+i)^n - 1 ]

  P  loan principal (home price minus deposit)
  n  total payments (term in years x payments per year)
  i  periodic interest rate`}
          </pre>
          <p style={{ margin: 0 }}>
            {isCanadian ? (
              <>
                <strong style={{ fontWeight: 500 }}>Periodic rate (Canada):</strong>{' '}
                Canadian law requires fixed-rate mortgages to compound semi-annually, not monthly.
                The periodic rate is{' '}
                <code style={{ fontFamily: 'monospace', fontSize: 13, background: 'var(--color-surface)', padding: '1px 5px' }}>
                  i = (1 + r/2)^(1/6) - 1
                </code>
                , which produces a slightly lower payment than a standard r/12 calculation.
              </>
            ) : (
              <>
                <strong style={{ fontWeight: 500 }}>Periodic rate:</strong>{' '}
                The annual rate divided by the number of payments per year.
                For monthly payments:{' '}
                <code style={{ fontFamily: 'monospace', fontSize: 13, background: 'var(--color-surface)', padding: '1px 5px' }}>
                  i = r / 12
                </code>
                .
              </>
            )}
          </p>
          <p style={{ margin: 0 }}>
            Early payments are mostly interest because interest accrues on a larger balance. As the balance falls, each payment retires more principal. The chart above shows exactly where that crossover happens for your loan.
          </p>
          <p style={{ margin: 0 }}>
            <a href="/methodology" style={{ color: 'var(--color-ink)', fontWeight: 500 }}>
              Full methodology with worked examples
            </a>
          </p>
        </div>
      </AccordionItem>

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
    </div>
  );
}
