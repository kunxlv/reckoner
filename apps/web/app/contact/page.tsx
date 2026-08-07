import { Header } from '../../src/components/Header';
import { Footer } from '../../src/components/Footer';
import { getAllCountries } from '@reckoner/finance-data';

export const metadata = {
  title: 'Contact | Reckoner',
  description: 'Get in touch with the Reckoner team.',
};

const h2Style = { fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', margin: '32px 0 10px' };
const pStyle = { fontSize: 16, lineHeight: 1.7, margin: '0 0 14px', color: 'var(--color-ink-deep)' };

export default function ContactPage() {
  const countries = getAllCountries();
  return (
    <>
      <Header allCountries={countries} />
      <main id="main">
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>
          <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: '-0.03em', margin: '0 0 20px' }}>Contact</h1>
          <p style={pStyle}>
            Reckoner is a small independent project. We aim to respond to all genuine enquiries within 2-3 business days.
          </p>

          <h2 style={h2Style}>Email</h2>
          <p style={pStyle}>
            Reach us at <a href="mailto:developer@kunalv.com" style={{ color: 'var(--color-focus)' }}>developer@kunalv.com</a>.
          </p>

          <h2 style={h2Style}>What we can help with</h2>
          <ul style={{ fontSize: 16, lineHeight: 1.7, margin: '0 0 14px', paddingLeft: 20, color: 'var(--color-ink-deep)' }}>
            <li><strong>Calculation methodology</strong> - questions or corrections about how we compute results</li>
            <li><strong>Rate data</strong> - if you believe a prefilled rate is significantly out of date</li>
            <li><strong>Bugs and broken pages</strong> - please include the URL, your browser, and a brief description</li>
            <li><strong>Privacy and data requests</strong> - see our <a href="/privacy" style={{ color: 'var(--color-focus)' }}>Privacy Policy</a> for how to exercise your rights</li>
            <li><strong>Accessibility</strong> - if you experience difficulty using any part of the site</li>
            <li><strong>Advertising and partnerships</strong> - commercial enquiries</li>
          </ul>

          <h2 style={h2Style}>What we cannot help with</h2>
          <p style={pStyle}>
            We are not a financial adviser or mortgage broker. We cannot recommend specific loan products, lenders, or investment strategies. The calculators are estimation tools only - please consult a qualified financial professional before making borrowing or investment decisions.
          </p>

          <h2 style={h2Style}>Response times</h2>
          <p style={pStyle}>
            We typically respond within 2-3 business days. During busy periods it may take a little longer. We read every message, but may not be able to reply to general feedback or suggestions individually.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
