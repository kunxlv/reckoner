interface ResultCardProps {
  monthlyPayment: string;
  paymentLabel?: string | undefined;
  totalInterest: string;
  totalPaid: string;
  payoffDate: string;
  conversionLine?: React.ReactNode;
  overpaymentCallout?: string | undefined;
  shareButton?: React.ReactNode;
}

export function ResultCard({
  monthlyPayment, paymentLabel = 'Principal and interest',
  totalInterest, totalPaid, payoffDate,
  conversionLine, overpaymentCallout, shareButton,
}: ResultCardProps) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        background: 'var(--color-canvas)',
        border: '1px solid var(--color-hairline)',
        borderRadius: 0,
        padding: '28px 32px 24px',
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--color-ink-mid)' }}>
        Monthly payment
      </div>
      <div style={{ fontSize: 56, fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 1.05, fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>
        {monthlyPayment}
      </div>
      <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginTop: 2 }}>
        {paymentLabel}
      </div>

      {conversionLine && (
        <div style={{ borderTop: '1px solid var(--color-hairline)', marginTop: 16, paddingTop: 12 }}>
          {conversionLine}
        </div>
      )}

      <div style={{ borderTop: '1px solid var(--color-hairline)', marginTop: 16, paddingTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--color-ink-mid)', marginBottom: 4 }}>Total interest</div>
          <div style={{ fontSize: 28, fontWeight: 400, letterSpacing: '-0.02em' }}>{totalInterest}</div>
        </div>
        <div style={{ borderLeft: '1px solid var(--color-hairline)', paddingLeft: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--color-ink-mid)', marginBottom: 4 }}>Total paid</div>
          <div style={{ fontSize: 28, fontWeight: 400, letterSpacing: '-0.02em' }}>{totalPaid}</div>
        </div>
        <div style={{ borderLeft: '1px solid var(--color-hairline)', paddingLeft: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--color-ink-mid)', marginBottom: 4 }}>Paid off</div>
          <div style={{ fontSize: 28, fontWeight: 400, letterSpacing: '-0.02em' }}>{payoffDate}</div>
        </div>
      </div>

      {overpaymentCallout && (
        <div style={{ fontSize: 14, lineHeight: 1.5, borderTop: '1px solid var(--color-hairline)', paddingTop: 14, marginTop: 16 }}>
          {overpaymentCallout}
        </div>
      )}

      {shareButton && (
        <div style={{ marginTop: 16 }}>{shareButton}</div>
      )}
    </div>
  );
}
