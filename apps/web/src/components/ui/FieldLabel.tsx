import type { CSSProperties, ReactNode } from 'react';

interface FieldLabelProps {
  children: ReactNode;
  tooltip: string;
  style?: CSSProperties;
}

const baseStyle: CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  marginBottom: 6,
  color: 'var(--color-ink-mid)',
};

export function FieldLabel({ children, tooltip, style }: FieldLabelProps) {
  return (
    <label style={{ ...baseStyle, ...style }}>
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        {children}
        <span className="field-tip">
          <span className="field-tip-icon">i</span>
          <span className="field-tip-body">{tooltip}</span>
        </span>
      </span>
    </label>
  );
}
