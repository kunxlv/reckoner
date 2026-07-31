interface AdSlotProps {
  width: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
}

/** Reserved ad container — renders at exact dimensions before any ad script loads. Server-renderable. */
export function AdSlot({ width, height, className, style }: AdSlotProps) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        background: '#ffffff',
        border: '1px solid #dddddd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...style,
      }}
    >
      <span style={{ fontSize: 13, color: '#898989' }}>
        Advertisement · {width}×{height}
      </span>
    </div>
  );
}
