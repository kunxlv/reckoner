interface FooterProps {
  currentCc?: string;
}

const linkStyle = { fontSize: 14, color: 'var(--color-ink-mid)', textDecoration: 'none' };
const headingStyle = { fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 12 };

export function Footer({ currentCc }: FooterProps) {
  const cc = currentCc ?? 'us';
  return (
    <footer style={{ borderTop: '1px solid var(--color-hairline)', marginTop: 16 }}>
      <div className="footer-grid" style={{ maxWidth: 1160, margin: '0 auto', padding: '48px 24px' }}>
        <div>
          <div style={headingStyle}>Property</div>
          <div style={{ display: 'grid', gap: 8 }}>
            <a href={`/${cc}/property/mortgage-calculator`} style={linkStyle}>Mortgage calculator</a>
            <a href={`/${cc}/property/affordability`} style={linkStyle}>Affordability calculator</a>
            <a href={`/${cc}/property/stamp-duty`} style={linkStyle}>Stamp duty calculator</a>
            <a href={`/${cc}/property/refinance`} style={linkStyle}>Refinance calculator</a>
            <a href={`/${cc}/property/rent-vs-buy`} style={linkStyle}>Rent vs buy calculator</a>
          </div>
        </div>
        <div>
          <div style={headingStyle}>Loans &amp; Debt</div>
          <div style={{ display: 'grid', gap: 8 }}>
            <a href={`/${cc}/loans/auto-loan`} style={linkStyle}>Auto loan calculator</a>
            <a href={`/${cc}/loans/personal-loan`} style={linkStyle}>Personal loan calculator</a>
            <a href={`/${cc}/loans/credit-card-payoff`} style={linkStyle}>Credit card payoff</a>
            <a href={`/${cc}/loans/debt-strategy`} style={linkStyle}>Debt payoff strategy</a>
          </div>
        </div>
        <div>
          <div style={headingStyle}>Savings &amp; Investing</div>
          <div style={{ display: 'grid', gap: 8 }}>
            <a href={`/${cc}/savings/compound-interest`} style={linkStyle}>Compound interest</a>
            <a href={`/${cc}/savings/investment-return`} style={linkStyle}>Investment return</a>
            <a href={`/${cc}/savings/savings-goal`} style={linkStyle}>Savings goal</a>
            <a href={`/${cc}/savings/retirement`} style={linkStyle}>Retirement calculator</a>
            <a href={`/${cc}/savings/fire-number`} style={linkStyle}>FIRE number</a>
          </div>
        </div>
        <div>
          <div style={headingStyle}>About</div>
          <div style={{ display: 'grid', gap: 8 }}>
            <a href="/methodology" style={linkStyle}>Methodology</a>
            <a href="/rates" style={linkStyle}>How we source rates</a>
            <a href="/about" style={linkStyle}>About</a>
            <a href="/privacy" style={linkStyle}>Privacy policy</a>
            <a href="/terms" style={linkStyle}>Terms of use</a>
            <a href="/contact" style={linkStyle}>Contact</a>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1160, margin: '0 auto', borderTop: '1px solid var(--color-hairline)', padding: '20px 24px 40px' }}>
        <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--color-ink-mid)', margin: '0 0 8px', maxWidth: '88ch' }}>
          <strong style={{ fontWeight: 500, color: 'var(--color-ink-mid)' }}>This is an information tool, not financial advice.</strong>{' '}
          The results are estimates based on the figures you enter and on published reference rates. They don&apos;t account for your circumstances, lender fees, taxes or insurance, and they aren&apos;t an offer of credit. Reference rates are averages and change frequently. Talk to a qualified adviser or your lender before making financial decisions.
        </p>
        <div style={{ fontSize: 13, color: 'var(--color-ink-mid)' }}>&copy; {new Date().getFullYear()} Reckoner. Information tool, not financial advice.</div>
      </div>
    </footer>
  );
}
