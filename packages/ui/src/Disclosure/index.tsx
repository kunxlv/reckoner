'use client';
import { useRef, useState } from 'react';

interface DisclosureProps {
  trigger: React.ReactNode;
  helper?: React.ReactNode;
  children: React.ReactNode;
  onOpen?: () => void;
}

export function Disclosure({ trigger, helper, children, onOpen }: DisclosureProps) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) onOpen?.();
  }

  return (
    <div style={{ borderTop: '1px solid var(--color-hairline)', paddingTop: 20 }}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 16, fontWeight: 500,
          background: 'none', border: 'none', padding: 0,
          cursor: 'pointer', color: 'var(--color-ink)', width: '100%', textAlign: 'left' as const,
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
        {trigger}
      </button>
      {helper && (
        <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginTop: 4, marginLeft: 18 }}>{helper}</div>
      )}
      <div
        ref={contentRef}
        style={{
          display: 'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          transition: 'grid-template-rows 200ms cubic-bezier(0.2,0,0,1)',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          {open && (
            <div style={{ paddingTop: 20 }}>
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
