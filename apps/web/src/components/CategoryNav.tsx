'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export interface NavTool {
  slug: string;
  label: string;
  description: string;
  icon: React.ReactNode;
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
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
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
            minWidth: 280,
            width: 'max-content',
            maxWidth: 'calc(100vw - 32px)',
            background: 'var(--color-canvas)',
            border: '1px solid var(--color-hairline)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.09)',
            zIndex: 50,
          }}
        >
          {tools.map((tool) =>
            tool.comingSoon ? (
              <div
                key={tool.slug}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '10px 14px',
                  borderBottom: '1px solid var(--color-hairline-subtle)',
                  opacity: 0.4,
                  cursor: 'default',
                  userSelect: 'none',
                }}
              >
                <div style={{
                  width: 36, height: 36, flexShrink: 0,
                  background: 'var(--color-ink-deep)',
                  color: 'var(--color-canvas)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {tool.icon}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-ink-mid)' }}>{tool.label}</span>
                    <span style={{ fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-ink-mute)' }}>Soon</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-ink-mute)', marginTop: 2, lineHeight: 1.4 }}>{tool.description}</div>
                </div>
              </div>
            ) : (
              <Link
                key={tool.slug}
                href={`/${currentCc}/${categoryPath}/${tool.slug}`}
                onClick={() => setOpen(false)}
                onMouseEnter={() => setHoveredSlug(tool.slug)}
                onMouseLeave={() => setHoveredSlug(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '10px 14px',
                  textDecoration: 'none',
                  borderBottom: '1px solid var(--color-hairline-subtle)',
                  background: hoveredSlug === tool.slug ? 'var(--color-surface)' : 'transparent',
                  transition: 'background 120ms',
                }}
              >
                <div style={{
                  width: 36, height: 36, flexShrink: 0,
                  background: 'var(--color-ink-deep)',
                  color: 'var(--color-canvas)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {tool.icon}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-ink)', lineHeight: 1.3 }}>{tool.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-ink-mute)', marginTop: 2, lineHeight: 1.4 }}>{tool.description}</div>
                </div>
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}
