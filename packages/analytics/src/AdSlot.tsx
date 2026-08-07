interface AdSlotProps {
  width: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
}

/** Reserved ad container — fluid width, fixed height. Ready for Google Auto Ads. Server-renderable. */
export function AdSlot({ width, height, className, style }: AdSlotProps) {
  return (
    <div
      className={className}
      style={{
        width: '100%',
        maxWidth: width,
        height,
        background: '#ffffff',
        border: '1px solid #dddddd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <span style={{ fontSize: 12, color: '#898989', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        Ad
      </span>
    </div>
  );
}
