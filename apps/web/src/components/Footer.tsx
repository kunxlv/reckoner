import type { CountryData } from '@reckoner/finance-data';

const NAME_MAP: Record<string, string> = {
  us: 'United States', uk: 'United Kingdom', ca: 'Canada', au: 'Australia',
  ie: 'Ireland', de: 'Germany', nl: 'Netherlands', nz: 'New Zealand',
  fr: 'France', es: 'Spain', sg: 'Singapore', in: 'India',
};

interface FooterProps {
  countries: CountryData[];
  currentCc?: string;
}

const linkStyle = { fontSize: 14, color: 'var(--color-ink-mid)', textDecoration: 'none' };
const headingStyle = { fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 12 };

export function Footer({ countries, currentCc }: FooterProps) {
  const cc = currentCc ?? 'us';
  return (
    <footer style={{ borderTop: '1px solid var(--color-hairline)', marginTop: 16 }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '48px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 48 }}>
        <div>
          <div style={headingStyle}>Calculators</div>
          <div style={{ display: 'grid', gap: 8 }}>
            <a href={`/${cc}/mortgage-calculator`} style={linkStyle}>Mortgage calculator</a>
            <a href={`/${cc}/stamp-duty`} style={linkStyle}>Stamp duty calculator</a>
            <a href={`/${cc}/affordability`} style={linkStyle}>Affordability calculator</a>
            <a href={`/${cc}/refinance`} style={linkStyle}>Refinance calculator</a>
            <a href={`/${cc}/rent-vs-buy`} style={linkStyle}>Rent vs buy calculator</a>
          </div>
        </div>
        <div>
          <div style={headingStyle}>Countries</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
            {countries.map((c) => (
              <a key={c.code} href={`/${c.code}/mortgage-calculator`} style={linkStyle}>
                {NAME_MAP[c.code] ?? c.code.toUpperCase()}
              </a>
            ))}
          </div>
        </div>
        <div>
          <div style={headingStyle}>About</div>
          <div style={{ display: 'grid', gap: 8 }}>
            <a href="/methodology" style={linkStyle}>Methodology</a>
            <a href="/rates" style={linkStyle}>How we source rates</a>
            <a href="/about" style={linkStyle}>Who writes this</a>
            <a href="/privacy" style={linkStyle}>Privacy</a>
            <a href="/contact" style={linkStyle}>Contact</a>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1160, margin: '0 auto', borderTop: '1px solid var(--color-hairline)', padding: '20px 24px 40px' }}>
        <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--color-ink-mid)', margin: '0 0 8px', maxWidth: '88ch' }}>
          <strong style={{ fontWeight: 500, color: 'var(--color-ink-mid)' }}>This is an information tool, not financial advice.</strong>{' '}
          The results are estimates based on the figures you enter and on published reference rates. They don&apos;t account for your circumstances, lender fees, taxes or insurance, and they aren&apos;t an offer of credit. Reference rates are averages and change frequently. Talk to a qualified mortgage adviser or your lender before borrowing.
        </p>
        <div style={{ fontSize: 13, color: 'var(--color-ink-mid)' }}>Information tool, not financial advice. Figures are estimates.</div>
      </div>
    </footer>
  );
}
