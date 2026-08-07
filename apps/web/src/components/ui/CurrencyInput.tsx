import type { InputHTMLAttributes } from 'react';

interface CurrencyInputProps extends InputHTMLAttributes<HTMLInputElement> {
  currencySymbol: string;
  fontSize?: number;
}

export function CurrencyInput({ currencySymbol, fontSize = 18, ...props }: CurrencyInputProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', borderBottom: '1px solid var(--color-ink)' }}>
      <span style={{ fontSize, fontWeight: 400, color: 'var(--color-ink)', paddingBottom: 4, flexShrink: 0 }}>
        {currencySymbol}
      </span>
      <input
        style={{
          fontSize,
          fontWeight: 400,
          border: 'none',
          background: 'transparent',
          outline: 'none',
          width: '100%',
          color: 'var(--color-ink)',
          padding: `4px 0 4px 4px`,
        }}
        {...props}
      />
    </div>
  );
}
