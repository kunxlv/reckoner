'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface PropertyNavProps {
  currentCc: string;
}

const TOOLS = [
  { slug: 'mortgage-calculator', label: 'Mortgage Calculator' },
  { slug: 'stamp-duty', label: 'Stamp Duty' },
  { slug: 'affordability', label: 'Affordability' },
  { slug: 'refinance', label: 'Refinance Break-Even' },
  { slug: 'rent-vs-buy', label: 'Rent vs Buy' },
];

export function PropertyNav({ currentCc }: PropertyNavProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          fontSize: 14,
          color: 'var(--color-ink-mid)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: 0,
        }}
        aria-expanded={open}
        aria-haspopup="true"
      >
        Property
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 8,
            minWidth: 220,
            background: 'var(--color-canvas)',
            border: '1px solid var(--color-hairline)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            zIndex: 50,
          }}
        >
          {TOOLS.map((tool) => (
            <Link
              key={tool.slug}
              href={`/${currentCc}/${tool.slug}`}
              onClick={() => setOpen(false)}
              style={{
                display: 'block',
                padding: '10px 16px',
                fontSize: 14,
                color: 'var(--color-ink)',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {tool.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
