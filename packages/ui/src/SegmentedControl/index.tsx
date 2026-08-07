'use client';
import { useId } from 'react';

interface Option<T extends string | number> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T extends string | number> {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  tooltip?: string;
}

export function SegmentedControl<T extends string | number>({
  label, options, value, onChange, tooltip,
}: SegmentedControlProps<T>) {
  const groupId = useId();

  return (
    <div className="segmented-row">
      <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, display: 'inline-flex', alignItems: 'center' }}>
        {label}
        {tooltip && (
          <span className="field-tip" style={{ marginLeft: 5, textTransform: 'none', letterSpacing: 0 }}>
            <span className="field-tip-icon">i</span>
            <span className="field-tip-body">{tooltip}</span>
          </span>
        )}
      </span>
      <div
        role="group"
        aria-label={label}
        style={{
          display: 'inline-flex',
          border: '1px solid var(--color-hairline)',
          borderRadius: 0,
          padding: 3,
          gap: 2,
        }}
      >
        {options.map((opt) => {
          const optId = `${groupId}-${String(opt.value)}`;
          const selected = opt.value === value;
          return (
            <label key={String(opt.value)} htmlFor={optId} style={{ cursor: 'pointer' }}>
              <input
                type="radio"
                id={optId}
                name={groupId}
                value={String(opt.value)}
                checked={selected}
                onChange={() => onChange(opt.value)}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                display: 'block',
                fontSize: 14, fontWeight: 500,
                padding: '7px 16px',
                borderRadius: 0,
                background: selected ? 'var(--color-ink)' : 'transparent',
                color: selected ? 'var(--color-canvas)' : 'var(--color-ink-mid)',
                userSelect: 'none' as const,
                transition: 'background 160ms cubic-bezier(0.2,0,0,1), color 160ms cubic-bezier(0.2,0,0,1)',
              }}>
                {opt.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
