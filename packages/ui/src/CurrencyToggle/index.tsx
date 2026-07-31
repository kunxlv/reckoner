'use client';
import { useState } from 'react';

interface CurrencyToggleProps {
  convertedAmount: string | null;   // null = unavailable
  targetCurrency: string;           // 'EUR'
  rateDate: string;                 // '27 Jul'
  rateStale?: boolean;              // fetchedAt > 48h
  onCurrencyChange?: (currency: string) => void;
}

const CURRENCIES = [
  { code: 'EUR', label: 'Euro · EUR' },
  { code: 'GBP', label: 'Pound sterling · GBP' },
  { code: 'CAD', label: 'Canadian dollar · CAD' },
  { code: 'AUD', label: 'Australian dollar · AUD' },
  { code: 'NZD', label: 'New Zealand dollar · NZD' },
  { code: 'SGD', label: 'Singapore dollar · SGD' },
  { code: 'INR', label: 'Indian rupee · INR' },
  { code: 'USD', label: 'US dollar · USD' },
];

export function CurrencyToggle({ convertedAmount, targetCurrency, rateDate, rateStale, onCurrencyChange }: CurrencyToggleProps) {
  const [open, setOpen] = useState(false);

  if (convertedAmount === null) {
    return (
      <div style={{ fontSize: 13, color: '#5a5a5a' }}>
        Conversion is unavailable right now.
      </div>
    );
  }

  return (
    <div style={{ fontSize: 13, color: '#5a5a5a', position: 'relative' }}>
      <span>
        ≈{' '}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{
            fontSize: 13, background: 'none', border: 'none', cursor: 'pointer',
            padding: 0, display: 'inline-flex', alignItems: 'center', gap: 3,
            borderBottom: '1px dotted #5a5a5a', color: '#5a5a5a',
          }}
          aria-label="Show the payment in another currency"
          aria-expanded={open}
        >
          {convertedAmount}
          <svg width="8" height="5" viewBox="0 0 10 6" fill="none" aria-hidden="true">
            <path d={open ? 'M1 5l4-4 4 4' : 'M1 1l4 4 4-4'} stroke="#5a5a5a" strokeWidth="1.5" />
          </svg>
        </button>
        {' '}· European Central Bank reference rate
        {rateStale ? ` from ${rateDate}. We refresh once each business day.` : `, ${rateDate}`}
      </span>

      {open && (
        <div style={{
          position: 'absolute', left: 0, top: 'calc(100% + 6px)',
          background: '#ffffff', border: '1px solid #000000', borderRadius: 0,
          boxShadow: '0 24px 64px -12px rgba(0,0,0,0.24)',
          width: 240, padding: '8px 0', zIndex: 20,
        }}>
          <div style={{ fontSize: 13, color: '#5a5a5a', padding: '6px 14px' }}>Also show in</div>
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => { onCurrencyChange?.(c.code); setOpen(false); }}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                width: '100%', fontSize: 14, padding: '9px 14px',
                background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' as const,
                outline: c.code === targetCurrency ? '1px solid #000000' : 'none',
                outlineOffset: -1,
              }}
            >
              <span>{c.label}</span>
              {c.code === targetCurrency && (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8.5l3.5 3.5L13 5" stroke="#000000" strokeWidth="1.8" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
