import { Header } from '../../src/components/Header';
import { Footer } from '../../src/components/Footer';
import { getAllCountries } from '@reckoner/finance-data';

export const metadata = {
  title: 'Privacy Policy | Reckoner',
  description: 'How Reckoner collects, uses, and protects your data.',
};

const h2Style = { fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', margin: '32px 0 10px' };
const pStyle = { fontSize: 16, lineHeight: 1.7, margin: '0 0 14px', color: 'var(--color-ink-deep)' };
const ulStyle = { fontSize: 16, lineHeight: 1.7, margin: '0 0 14px', paddingLeft: 20, color: 'var(--color-ink-deep)' };

export default function PrivacyPage() {
  const countries = getAllCountries();
  return (
    <>
      <Header allCountries={countries} />
      <main id="main">
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>
          <p style={{ fontSize: 13, color: 'var(--color-ink-mute)', marginBottom: 8 }}>Last updated: July 2025</p>
          <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: '-0.03em', margin: '0 0 20px' }}>Privacy Policy</h1>
          <p style={pStyle}>
            Reckoner (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the website reckoner.tools (the &quot;Service&quot;). This Privacy Policy explains what information we collect, how we use it, and your choices. By using the Service you agree to the practices described here.
          </p>

          <h2 style={h2Style}>1. Information We Collect</h2>
          <p style={pStyle}><strong>Calculator inputs.</strong> All figures you enter into our calculators - home price, loan amount, interest rate, and similar values - are processed entirely in your browser. They are never transmitted to our servers and we never store them.</p>
          <p style={pStyle}><strong>Usage analytics.</strong> We use Google Analytics 4 to collect aggregate, anonymised information about how visitors use the Service. This includes pages visited, time on page, approximate geographic region (country level), device type, and referring source. IP addresses are anonymised before processing. We do not use this data to identify individuals.</p>
          <p style={pStyle}><strong>Log data.</strong> Our hosting infrastructure automatically records standard server log data - IP address, browser type, pages requested, and timestamps - retained for up to 90 days for security and diagnostic purposes only.</p>
          <p style={pStyle}><strong>Cookies.</strong> We use first-party cookies to remember your country preference and interface state (e.g. which currency you selected). These are functional cookies and do not track you across other sites. Third-party cookies may be set by Google Analytics and Google AdSense as described below.</p>

          <h2 style={h2Style}>2. Advertising</h2>
          <p style={pStyle}>The Service is supported by display advertising delivered by Google AdSense. Google may use cookies and similar technologies to serve ads based on your prior visits to this and other websites. You can opt out of personalised advertising by visiting <a href="https://www.google.com/settings/ads" style={{ color: 'var(--color-focus)' }}>google.com/settings/ads</a>. Ad serving is governed by <a href="https://policies.google.com/privacy" style={{ color: 'var(--color-focus)' }}>Google&apos;s Privacy Policy</a>.</p>
          <p style={pStyle}>We comply with the Google EU User Consent Policy. Where required by applicable law (including GDPR and ePrivacy), we obtain your consent before setting non-essential cookies or serving personalised ads.</p>

          <h2 style={h2Style}>3. How We Use Information</h2>
          <ul style={ulStyle}>
            <li>To operate and improve the Service</li>
            <li>To monitor and diagnose technical issues</li>
            <li>To measure aggregate traffic patterns and popular content</li>
            <li>To serve relevant advertising that funds the Service</li>
            <li>To comply with legal obligations</li>
          </ul>
          <p style={pStyle}>We do not sell, rent, or share your personal data with third parties for their own marketing purposes.</p>

          <h2 style={h2Style}>4. Third-Party Services</h2>
          <p style={pStyle}>The Service integrates with the following third parties, each of which has its own privacy policy:</p>
          <ul style={ulStyle}>
            <li><strong>Google Analytics 4</strong> - analytics (<a href="https://policies.google.com/privacy" style={{ color: 'var(--color-focus)' }}>Google Privacy Policy</a>)</li>
            <li><strong>Google AdSense</strong> - advertising (<a href="https://policies.google.com/privacy" style={{ color: 'var(--color-focus)' }}>Google Privacy Policy</a>)</li>
            <li><strong>Vercel</strong> - hosting and edge network</li>
          </ul>

          <h2 style={h2Style}>5. Your Rights</h2>
          <p style={pStyle}>Depending on your location, you may have the right to access, correct, delete, or restrict the processing of personal data we hold about you. Because we do not collect personally identifiable information from calculator inputs, the main personal data we may hold is standard web-server log data.</p>
          <p style={pStyle}>Residents of the European Economic Area, United Kingdom, and California (CCPA) may have additional rights. To exercise any right, contact us at <a href="mailto:developer@kunalv.com" style={{ color: 'var(--color-focus)' }}>developer@kunalv.com</a>.</p>
          <p style={pStyle}>To opt out of Google Analytics tracking across all websites, install the <a href="https://tools.google.com/dlpage/gaoptout" style={{ color: 'var(--color-focus)' }}>Google Analytics opt-out browser add-on</a>.</p>

          <h2 style={h2Style}>6. Data Retention</h2>
          <p style={pStyle}>Server log data is retained for up to 90 days. Google Analytics data is retained for 14 months. We do not retain any calculator input data because it is never sent to us.</p>

          <h2 style={h2Style}>7. Children</h2>
          <p style={pStyle}>The Service is not directed at children under 13. We do not knowingly collect personal data from children. If you believe a child has provided us personal data, contact us and we will delete it promptly.</p>

          <h2 style={h2Style}>8. Changes to This Policy</h2>
          <p style={pStyle}>We may update this Privacy Policy from time to time. The date at the top of this page reflects the most recent revision. Continued use of the Service after changes are posted constitutes your acceptance of the revised policy.</p>

          <h2 style={h2Style}>9. Contact</h2>
          <p style={pStyle}>Questions about this Privacy Policy? Email us at <a href="mailto:developer@kunalv.com" style={{ color: 'var(--color-focus)' }}>developer@kunalv.com</a>.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
