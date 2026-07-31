import { getAllCountries } from '@reckoner/finance-data';
import { Header } from '../src/components/Header.js';
import { Footer } from '../src/components/Footer.js';

const FLAG_MAP: Record<string, string> = {
  us: '🇺🇸', uk: '🇬🇧', ca: '🇨🇦', au: '🇦🇺', ie: '🇮🇪',
  de: '🇩🇪', nl: '🇳🇱', nz: '🇳🇿', fr: '🇫🇷', es: '🇪🇸',
  sg: '🇸🇬', in: '🇮🇳',
};

const NAME_MAP: Record<string, string> = {
  us: 'United States', uk: 'United Kingdom', ca: 'Canada', au: 'Australia',
  ie: 'Ireland', de: 'Germany', nl: 'Netherlands', nz: 'New Zealand',
  fr: 'France', es: 'Spain', sg: 'Singapore', in: 'India',
};

export const metadata = {
  title: "Financial calculators that use your country's actual rules | Reckoner",
  description: 'Mortgage calculators for 12 countries, each applying local repayment conventions and current reference rates. Free, no signup.',
};

export default function HubPage() {
  const countries = getAllCountries();

  return (
    <>
      <Header allCountries={countries} />
      <main id="main">
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '64px 24px' }}>
          <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 16px', maxWidth: '20ch' }}>
            Financial calculators that use your country&apos;s actual rules
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 64px', maxWidth: '60ch', color: '#2f2f2f' }}>
            Most calculators run one formula and change the currency symbol. Ours apply each country&apos;s real repayment conventions, current reference rates and local costs — so the number you see is the one you&apos;d actually pay.
          </p>

          <h2 style={{ fontSize: 20, fontWeight: 500, margin: '0 0 8px' }}>Choose your country</h2>
          <p style={{ fontSize: 14, color: '#5a5a5a', margin: '0 0 24px' }}>
            Repayment maths genuinely differs. Canadian fixed-rate mortgages compound semi-annually. German mortgages leave a balance outstanding when the fixed period ends. Pick a country and we apply the right rules.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 2 }}>
            {countries.map((c) => (
              <a
                key={c.code}
                href={`/${c.code}/mortgage-calculator`}
                style={{
                  display: 'block', textDecoration: 'none', color: '#000000',
                  border: '1px solid #dddddd', padding: '16px 20px',
                  fontSize: 15,
                }}
              >
                <span style={{ marginRight: 8 }}>{FLAG_MAP[c.code]}</span>
                <strong style={{ fontWeight: 500 }}>{NAME_MAP[c.code]}</strong>
                <span style={{ fontSize: 13, color: '#5a5a5a', display: 'block', marginTop: 2 }}>
                  {c.currency} · Mortgage calculator
                </span>
              </a>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, marginTop: 64, borderTop: '1px solid #dddddd', paddingTop: 32 }}>
            {[
              { heading: 'Official sources.', body: 'Reference rates come from central banks and national statistics agencies, with the source and date shown on every page.' },
              { heading: 'Open methodology.', body: 'Every formula is published, with worked examples you can check.' },
              { heading: 'No lead capture.', body: 'No email, no quote form, no broker handoff. The calculator just works.' },
            ].map(({ heading, body }, i) => (
              <div key={heading} style={{ padding: '0 32px 0 0', borderRight: i < 2 ? '1px solid #dddddd' : 'none', marginRight: i < 2 ? 32 : 0 }}>
                <p style={{ fontSize: 15, margin: 0 }}>
                  <strong style={{ fontWeight: 500 }}>{heading}</strong>{' '}{body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer countries={countries} />
    </>
  );
}
