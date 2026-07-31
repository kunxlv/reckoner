interface ResultCardProps {
  monthlyPayment: string;      // formatted, e.g. "$2,528"
  paymentLabel?: string | undefined;       // "Principal and interest"
  totalInterest: string;
  totalPaid: string;
  payoffDate: string;          // "August 2056"
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
        background: '#ffffff',
        border: '1px solid #dddddd',
        borderRadius: 0,
        padding: '28px 32px 24px',
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#5a5a5a' }}>
        Monthly payment
      </div>
      <div style={{ fontSize: 56, fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 1.05, fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>
        {monthlyPayment}
      </div>
      <div style={{ fontSize: 13, color: '#5a5a5a', marginTop: 2 }}>
        {paymentLabel}
      </div>

      {conversionLine && (
        <div style={{ borderTop: '1px solid #dddddd', marginTop: 16, paddingTop: 12 }}>
          {conversionLine}
        </div>
      )}

      <div style={{ borderTop: '1px solid #dddddd', marginTop: 16, paddingTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#5a5a5a', marginBottom: 4 }}>Total interest</div>
          <div style={{ fontSize: 28, fontWeight: 400, letterSpacing: '-0.02em' }}>{totalInterest}</div>
        </div>
        <div style={{ borderLeft: '1px solid #dddddd', paddingLeft: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#5a5a5a', marginBottom: 4 }}>Total paid</div>
          <div style={{ fontSize: 28, fontWeight: 400, letterSpacing: '-0.02em' }}>{totalPaid}</div>
        </div>
        <div style={{ borderLeft: '1px solid #dddddd', paddingLeft: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#5a5a5a', marginBottom: 4 }}>Paid off</div>
          <div style={{ fontSize: 28, fontWeight: 400, letterSpacing: '-0.02em' }}>{payoffDate}</div>
        </div>
      </div>

      {overpaymentCallout && (
        <div style={{ fontSize: 14, lineHeight: 1.5, borderTop: '1px solid #dddddd', paddingTop: 14, marginTop: 16 }}>
          {overpaymentCallout}
        </div>
      )}

      {shareButton && (
        <div style={{ marginTop: 16 }}>{shareButton}</div>
      )}
    </div>
  );
}
