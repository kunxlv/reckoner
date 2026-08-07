import { Header } from '../../src/components/Header';
import { Footer } from '../../src/components/Footer';
import { getAllCountries } from '@reckoner/finance-data';
import { TEST_VECTORS } from '@reckoner/mortgage-engine';

export const metadata = {
  title: 'How we calculate mortgage repayments | Reckoner',
  description: 'Amortization formulas, per-country compounding conventions, and worked examples validated against official central bank sources.',
};

export default function MethodologyPage() {
  const countries = getAllCountries();
  return (
    <>
      <Header allCountries={countries} />
      <main id="main">
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>
          <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: '-0.03em', margin: '0 0 16px' }}>How we calculate mortgage repayments</h1>

          <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '32px 0 10px' }}>The standard annuity formula</h2>
          <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 16px' }}>Your monthly payment <em>M</em> is the amount that reduces the balance to exactly zero at the end of the term:</p>
          <pre style={{ background: '#f8f8f8', border: '1px solid #dddddd', padding: '16px 20px', fontSize: 14, overflowX: 'auto' }}>
            {`M = P × [ i(1+i)ⁿ ] / [ (1+i)ⁿ − 1 ]

where:
  P = loan principal
  n = total number of payments (term × periods per year)
  i = periodic interest rate (see per-country conventions below)`}
          </pre>

          <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '32px 0 10px' }}>Per-country conventions</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #000000' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px 8px 0', fontWeight: 500 }}>Country</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 500 }}>Convention</th>
                <th style={{ textAlign: 'left', padding: '8px 0 8px 12px', fontWeight: 500 }}>Periodic rate</th>
              </tr>
            </thead>
            <tbody>
              {countries.map((c) => (
                <tr key={c.code} style={{ borderBottom: '1px solid #dddddd' }}>
                  <td style={{ padding: '10px 12px 10px 0' }}>{c.code.toUpperCase()}</td>
                  <td style={{ padding: '10px 12px' }}>{c.convention}</td>
                  <td style={{ padding: '10px 0 10px 12px', fontFamily: 'monospace', fontSize: 13 }}>
                    {c.convention === 'canadianSemiAnnual' ? 'i = (1 + r/2)^(1/6) − 1' : 'i = r / 12'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.025em', margin: '32px 0 10px' }}>Official test vectors</h2>
          <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 16px' }}>Every convention is tested against worked examples from official sources. These test vectors are the acceptance criteria for the engine:</p>
          {Object.values(TEST_VECTORS).map((v) => (
            <div key={v.description} style={{ border: '1px solid #dddddd', padding: '16px 20px', marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{v.description}</div>
              <div style={{ fontSize: 13, color: '#5a5a5a', marginBottom: 8 }}>
                Source: <a href={v.sourceUrl} style={{ color: '#0072f0' }}>{v.source}</a>
              </div>
              <table style={{ fontSize: 13, borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '2px 16px 2px 0', color: '#5a5a5a' }}>Principal</td>
                    <td style={{ padding: '2px 0', fontFamily: 'monospace' }}>{v.input.principal.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 16px 2px 0', color: '#5a5a5a' }}>Annual rate</td>
                    <td style={{ padding: '2px 0', fontFamily: 'monospace' }}>{(v.input.annualRate * 100).toFixed(2)}%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 16px 2px 0', color: '#5a5a5a' }}>Term</td>
                    <td style={{ padding: '2px 0', fontFamily: 'monospace' }}>{v.input.termYears} years</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 16px 2px 0', color: '#5a5a5a' }}>Expected payment</td>
                    <td style={{ padding: '2px 0', fontFamily: 'monospace', fontWeight: 500 }}>{v.expected.payment.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
