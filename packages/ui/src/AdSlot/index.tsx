interface AdSlotProps {
  width: number;
  height: number;
  className?: string;
}

export function AdSlot({ width, height, className }: AdSlotProps) {
  return (
    <div
      className={className}
      style={{
        width, height,
        background: 'var(--color-canvas)',
        border: '1px solid var(--color-hairline)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 13, color: 'var(--color-ink-mid)' }}>Advertisement · {width}×{height}</span>
    </div>
  );
}
