'use client';
import { useState, useRef, useEffect } from 'react';

interface CurrencyToggleProps {
  convertedAmount: string | null;   // null = unavailable
  targetCurrency: string;           // 'EUR'
  rateDate: string;                 // '27 Jul'
  rateStale?: boolean;              // fetchedAt > 48h
  onCurrencyChange?: (currency: string) => void;
}

const CURRENCIES = [
  { code: 'EUR', label: 'Euro' },
  { code: 'GBP', label: 'Pound sterling' },
  { code: 'CAD', label: 'Canadian dollar' },
  { code: 'AUD', label: 'Australian dollar' },
  { code: 'NZD', label: 'New Zealand dollar' },
  { code: 'SGD', label: 'Singapore dollar' },
  { code: 'INR', label: 'Indian rupee' },
  { code: 'USD', label: 'US dollar' },
];

const RATE_SOURCE: Record<string, string> = {
  EUR: 'European Central Bank',
  GBP: 'Bank of England',
  USD: 'Federal Reserve',
  CAD: 'Bank of Canada',
  AUD: 'Reserve Bank of Australia',
  NZD: 'Reserve Bank of New Zealand',
  SGD: 'Monetary Authority of Singapore',
  INR: 'Reserve Bank of India',
};

export function CurrencyToggle({ convertedAmount, targetCurrency, rateDate, rateStale, onCurrencyChange }: CurrencyToggleProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (convertedAmount === null) {
    return (
      <div style={{ fontSize: 13, color: 'var(--color-ink-mid)' }}>
        Conversion is unavailable right now.
      </div>
    );
  }

  const rateSource = RATE_SOURCE[targetCurrency] ?? 'reference rate';

  return (
    <div ref={ref} style={{ fontSize: 13, color: 'var(--color-ink-mid)', position: 'relative' }}>
      <span>
        {'≈ '}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{
            fontSize: 13, background: 'none', border: 'none', cursor: 'pointer',
            padding: 0, display: 'inline-flex', alignItems: 'center', gap: 3,
            borderBottom: '1px dotted var(--color-ink-mid)',
            color: 'var(--color-ink-mid)',
          }}
          aria-label="Show the payment in another currency"
          aria-expanded={open}
        >
          {convertedAmount}
          <svg
            width="8" height="5" viewBox="0 0 10 6" fill="none" aria-hidden="true"
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 160ms cubic-bezier(0.2,0,0,1)' }}
          >
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
        {` · ${rateSource} rate`}
        {rateStale ? ` from ${rateDate}. We refresh once each business day.` : `, ${rateDate}`}
      </span>

      {open && (
        <div
          role="dialog"
          aria-label="Choose currency to convert into"
          className="currency-dropdown"
        >
          <div style={{ padding: '10px 14px 8px' }}>
            <div style={{
              fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
              textTransform: 'uppercase' as const, color: 'var(--color-ink-mid)',
            }}>
              Currency
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--color-hairline)' }}>
            {CURRENCIES.map((c) => {
              const selected = c.code === targetCurrency;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { onCurrencyChange?.(c.code); setOpen(false); }}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    width: '100%', padding: '9px 14px',
                    background: selected ? 'var(--color-surface)' : 'transparent',
                    border: 'none', borderBottom: '1px solid var(--color-hairline)',
                    cursor: 'pointer', textAlign: 'left' as const,
                    transition: 'background 100ms',
                  }}
                  onMouseEnter={(e) => {
                    if (!selected) (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)';
                  }}
                  onMouseLeave={(e) => {
                    if (!selected) (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <span style={{
                    fontSize: 13, fontWeight: selected ? 600 : 400,
                    color: 'var(--color-ink)',
                  }}>
                    {c.label}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--color-ink-mid)', fontWeight: 500 }}>
                    {c.code}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
