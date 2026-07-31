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
        background: '#ffffff',
        border: '1px solid #dddddd',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 13, color: '#898989' }}>Advertisement · {width}×{height}</span>
    </div>
  );
}
