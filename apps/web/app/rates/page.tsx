import { Header } from '../../src/components/Header.js';
import { Footer } from '../../src/components/Footer.js';
import { getAllCountries } from '@reckoner/finance-data';

export const metadata = {
  title: 'How we source rates | Reckoner',
  description: 'Every rate source used by Reckoner, with publication cadence and last-fetched dates.',
};

const RATE_SOURCES = [
  { cc: 'US', source: 'Freddie Mac PMMS via FRED', url: 'https://fred.stlouisfed.org/series/MORTGAGE30US', cadence: 'Weekly (Thursday)', notes: 'Citation required per FRED terms.' },
  { cc: 'UK', source: 'Bank of England IADB', url: 'https://www.bankofengland.co.uk/statistics', cadence: 'Monthly', notes: '2yr fixed 75% LTV series (IUMBV42).' },
  { cc: 'CA', source: 'Bank of Canada Valet API', url: 'https://www.bankofcanada.ca/valet/', cadence: 'Weekly', notes: 'Posted conventional mortgage rates. No API key required.' },
  { cc: 'AU', source: 'Reserve Bank of Australia Table F6', url: 'https://www.rba.gov.au/statistics/tables/', cadence: 'Monthly', notes: 'Housing lending rates.' },
  { cc: 'IE / DE / NL / FR / ES', source: 'ECB Data Portal — MIR statistics', url: 'https://data.ecb.europa.eu/data/datasets/MIR', cadence: 'Monthly', notes: 'MFI interest rates, new house purchase loans.' },
  { cc: 'NZ / SG / IN', source: 'Manually curated', url: '', cadence: 'Quarterly review', notes: 'Sourced from RBNZ, MAS, and RBI respectively.' },
];

export default function RatesPage() {
  const countries = getAllCountries();
  return (
    <>
      <Header allCountries={countries} />
      <main id="main">
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>
          <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: '-0.03em', margin: '0 0 16px' }}>How we source rates</h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>Every rate is prefilled from an official source — a central bank or national statistics body. The table below shows exactly where each comes from, how often it updates, and any usage requirements.</p>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #000000' }}>
                {['Country', 'Source', 'Cadence', 'Notes'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px 8px 0', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RATE_SOURCES.map((r) => (
                <tr key={r.cc} style={{ borderBottom: '1px solid #dddddd' }}>
                  <td style={{ padding: '12px 12px 12px 0', fontWeight: 500 }}>{r.cc}</td>
                  <td style={{ padding: '12px 12px' }}>
                    {r.url ? <a href={r.url} style={{ color: '#0072f0' }}>{r.source}</a> : r.source}
                  </td>
                  <td style={{ padding: '12px 12px', color: '#5a5a5a' }}>{r.cadence}</td>
                  <td style={{ padding: '12px 0 12px 12px', color: '#5a5a5a' }}>{r.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Footer countries={countries} />
    </>
  );
}
