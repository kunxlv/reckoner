'use client';
import { useState } from 'react';

interface GeoBannerProps {
  detectedCountry: string;
  targetCode: string;
  targetName: string;
  targetHref: string;
  onDismiss?: () => void;
}

export function GeoBanner({ detectedCountry, targetCode, targetName, targetHref, onDismiss }: GeoBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  function dismiss() {
    setDismissed(true);
    onDismiss?.();
  }

  return (
    <div style={{
      background: 'var(--color-canvas)',
      border: '1px solid var(--color-hairline)',
      borderRadius: 0,
      padding: '12px 16px',
      marginBottom: 16,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    }}>
      <span style={{ fontSize: 14, lineHeight: 1.4 }}>
        Looks like you&apos;re in {detectedCountry}. Want the{' '}
        <strong style={{ fontWeight: 500 }}>{targetCode} calculator</strong> instead?
        {' '}It uses local lending rates and repayment frequencies.
      </span>
      <span style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <a
          href={targetHref}
          style={{
            fontSize: 14, fontWeight: 500,
            background: 'var(--color-ink)', color: 'var(--color-canvas)',
            borderRadius: 0, padding: '7px 14px',
            textDecoration: 'none', whiteSpace: 'nowrap' as const,
          }}
        >
          Switch to {targetName}
        </a>
        <button
          type="button"
          onClick={dismiss}
          style={{
            fontSize: 14, fontWeight: 500,
            border: '1px solid var(--color-ink)',
            borderRadius: 0, padding: '7px 14px',
            background: 'none', cursor: 'pointer',
            whiteSpace: 'nowrap' as const,
            color: 'var(--color-ink)',
          }}
        >
          Stay on US
        </button>
      </span>
    </div>
  );
}
