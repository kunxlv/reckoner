'use client';
import { useId } from 'react';

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  prefix?: string;   // e.g. '$', '£', '€'
  suffix?: string;   // e.g. '%', 'yr'
  helper?: React.ReactNode;
  error?: string;
  /** Second field alongside main (for down payment % toggle) */
  secondaryField?: React.ReactNode;
  id?: string;
}

export function SliderInput({
  label, value, min, max, step = 1, onChange,
  prefix, suffix, helper, error, secondaryField, id: idProp,
}: SliderInputProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  function handleText(e: React.ChangeEvent<HTMLInputElement>) {
    const parsed = parseFloat(e.target.value.replace(/,/g, ''));
    if (!Number.isNaN(parsed)) onChange(parsed);
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const parsed = parseFloat(e.target.value.replace(/,/g, ''));
    if (!Number.isNaN(parsed)) onChange(Math.max(min, Math.min(max, parsed)));
  }

  function handleRange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(Number(e.target.value));
  }

  const borderColor = error ? '#c2321f' : '#dddddd';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 8 }}>
        <label htmlFor={id} style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
          {label}
        </label>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {/* Main numeric field */}
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            border: `1px solid ${borderColor}`, borderRadius: 0,
            padding: '8px 12px', minWidth: 110,
          }}>
            {prefix && <span style={{ color: '#5a5a5a', marginRight: 4 }}>{prefix}</span>}
            <input
              id={id}
              type="text"
              inputMode="decimal"
              value={value.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              onChange={handleText}
              onBlur={handleBlur}
              style={{
                border: 'none', outline: 'none', background: 'transparent',
                fontSize: 16, width: '100%', textAlign: 'right',
                fontVariantNumeric: 'tabular-nums lining-nums slashed-zero',
              }}
              aria-label={label}
            />
            {suffix && <span style={{ color: '#5a5a5a', marginLeft: 4 }}>{suffix}</span>}
          </span>
          {secondaryField}
        </div>
      </div>

      {/* Slider track */}
      <div style={{ position: 'relative', height: 24, display: 'flex', alignItems: 'center' }}>
        {/* Track background */}
        <div style={{ height: 2, width: '100%', background: '#dddddd', borderRadius: 100 }} />
        {/* Filled portion */}
        <div style={{
          position: 'absolute', left: 0, height: 2,
          width: `${pct}%`, background: '#000000', borderRadius: 100,
        }} />
        {/* Thumb (visual) */}
        <div style={{
          position: 'absolute', left: `${pct}%`,
          width: 24, height: 24, marginLeft: -12,
          background: '#ffffff', border: '2px solid #000000', borderRadius: '100px',
          boxSizing: 'border-box' as const, pointerEvents: 'none',
        }} />
        {/* Actual range input — sits over everything, transparent */}
        <input
          type="range"
          min={min} max={max} step={step} value={value}
          onChange={handleRange}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            opacity: 0, cursor: 'pointer', margin: 0,
          }}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="8" cy="8" r="7" fill="none" stroke="#c2321f" strokeWidth="1.5" />
            <line x1="8" y1="4.5" x2="8" y2="9" stroke="#c2321f" strokeWidth="1.5" />
            <circle cx="8" cy="11.5" r="1" fill="#c2321f" />
          </svg>
          <span style={{ fontSize: 13, color: '#c2321f' }}>{error}</span>
        </div>
      )}
      {!error && helper && (
        <div style={{ fontSize: 13, color: '#5a5a5a', marginTop: 8, lineHeight: 1.45 }}>{helper}</div>
      )}
    </div>
  );
}
