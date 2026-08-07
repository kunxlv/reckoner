'use client';
import { useState, useRef, useEffect } from 'react';

export interface Country {
  code: string;
  name: string;
  currency: string;
  flag: string;
  href: string;
  tier: 1 | 2 | 3;
}

interface CountrySelectorProps {
  current: Country;
  countries: Country[];
}

export function CountrySelector({ current, countries }: CountrySelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`Change country. Currently ${current.name}.`}
        style={{
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '0.06em',
          textTransform: 'uppercase' as const,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          padding: '6px 0',
          color: 'var(--color-ink)',
        }}
      >
        {current.code.toUpperCase()}
        <svg
          width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true"
          style={{
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 160ms cubic-bezier(0.2,0,0,1)',
          }}
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose the country the property is in"
          style={{
            position: 'fixed',
            right: 16,
            top: 64,
            width: 'min(420px, calc(100vw - 32px))',
            background: 'var(--color-canvas)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.14)',
            zIndex: 50,
            maxHeight: 'calc(100dvh - 80px)',
            overflowY: 'auto',
          }}
        >
          <div style={{ padding: '20px 24px 16px' }}>
            <div style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              color: 'var(--color-ink-mid)',
              marginBottom: 4,
            }}>
              Country
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-mid)' }}>
              Repayment rules differ by country. We apply the local ones.
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--color-hairline)' }}>
            {countries.map((c) => {
              const selected = c.code === current.code;
              return (
                <a
                  key={c.code}
                  href={c.href}
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textDecoration: 'none',
                    color: 'var(--color-ink)',
                    padding: '13px 24px',
                    borderBottom: '1px solid var(--color-hairline)',
                    background: selected ? 'var(--color-surface)' : 'transparent',
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
                    fontSize: 13,
                    fontWeight: selected ? 600 : 400,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase' as const,
                  }}>
                    {c.name}
                  </span>
                  <span style={{
                    fontSize: 12,
                    color: 'var(--color-ink-mid)',
                    letterSpacing: '0.04em',
                    fontWeight: 500,
                  }}>
                    {c.currency}
                  </span>
                </a>
              );
            })}
          </div>

          <div style={{
            padding: '12px 24px',
            fontSize: 12,
            color: 'var(--color-ink-mid)',
            lineHeight: 1.5,
          }}>
            Your figures carry over unchanged. We don&apos;t convert them. A 400,000 loan stays 400,000 in the new currency.
          </div>
        </div>
      )}
    </div>
  );
}
