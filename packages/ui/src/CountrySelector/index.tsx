'use client';
import { useState, useRef, useEffect } from 'react';

export interface Country {
  code: string;       // 'us', 'uk', etc.
  name: string;       // 'United States'
  currency: string;   // 'USD'
  flag: string;       // '🇺🇸'
  href: string;       // '/us/mortgage-calculator'
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
          fontSize: 14, fontWeight: 500,
          display: 'inline-flex', alignItems: 'center', gap: 8,
          border: '1px solid #000000', borderRadius: 0,
          padding: '7px 14px', background: 'none', cursor: 'pointer',
        }}
      >
        {current.flag} {current.code.toUpperCase()}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 160ms cubic-bezier(0.2,0,0,1)' }}>
          <path d="M1 1l4 4 4-4" stroke="#000000" strokeWidth="1.5" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 6px)',
          width: 460,
          background: '#ffffff',
          border: '1px solid #000000',
          borderRadius: 0,
          boxShadow: '0 24px 64px -12px rgba(0,0,0,0.24)',
          padding: '18px 20px',
          zIndex: 50,
        }}
          role="dialog"
          aria-label="Choose the country the property is in"
        >
          <div style={{ fontSize: 15, fontWeight: 500 }}>Choose the country the property is in</div>
          <div style={{ fontSize: 13, color: '#5a5a5a', margin: '4px 0 14px' }}>
            Repayment rules differ by country. We apply the local ones.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px', fontSize: 14 }}>
            {countries.map((c) => {
              const selected = c.code === current.code;
              return (
                <a
                  key={c.code}
                  href={c.href}
                  onClick={() => setOpen(false)}
                  style={{
                    textDecoration: 'none', color: '#000000',
                    padding: '8px 10px', borderRadius: 0,
                    outline: selected ? '1px solid #000000' : 'none',
                    outlineOffset: -1,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  <span>{c.flag} {c.name} · {c.currency}</span>
                  {c.tier > 1 && (
                    <span style={{
                      fontSize: 11, color: '#5a5a5a',
                      border: '1px solid #dddddd', borderRadius: 100,
                      padding: '1px 7px', whiteSpace: 'nowrap' as const, marginLeft: 8,
                    }}>
                      Standard model
                    </span>
                  )}
                </a>
              );
            })}
          </div>
          <div style={{ fontSize: 12, color: '#5a5a5a', marginTop: 12, paddingTop: 12, borderTop: '1px solid #dddddd' }}>
            Your figures carry over unchanged. We don&apos;t convert them — a 400,000 loan stays 400,000 in the new currency.
          </div>
        </div>
      )}
    </div>
  );
}
