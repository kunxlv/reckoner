'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export interface NavTool {
  slug: string;
  label: string;
  comingSoon?: boolean;
}

interface CategoryNavProps {
  label: string;
  categoryPath: string;
  tools: NavTool[];
  currentCc: string;
}

export function CategoryNav({ label, categoryPath, tools, currentCc }: CategoryNavProps) {
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
        {label}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: 8,
            minWidth: 220,
            background: 'var(--color-canvas)',
            border: '1px solid var(--color-hairline)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            zIndex: 50,
          }}
        >
          {tools.map((tool) =>
            tool.comingSoon ? (
              <span
                key={tool.slug}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 16px',
                  fontSize: 14,
                  color: 'var(--color-ink-mute)',
                  cursor: 'default',
                  userSelect: 'none',
                }}
              >
                {tool.label}
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--color-ink-mute)',
                  }}
                >
                  Soon
                </span>
              </span>
            ) : (
              <Link
                key={tool.slug}
                href={`/${currentCc}/${categoryPath}/${tool.slug}`}
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
            ),
          )}
        </div>
      )}
    </div>
  );
}
