import { Header } from '../../src/components/Header.js';
import { Footer } from '../../src/components/Footer.js';
import { getAllCountries } from '@reckoner/finance-data';

export const metadata = { title: 'Privacy | Reckoner' };

export default function PrivacyPage() {
  const countries = getAllCountries();
  return (
    <>
      <Header allCountries={countries} />
      <main id="main">
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
          <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: '-0.03em', margin: '0 0 16px' }}>Privacy</h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 16px' }}>Reckoner uses Google Analytics 4 and Plausible Analytics to measure aggregate traffic. No personally identifiable information is collected by the calculator itself — all inputs stay in your browser and are never sent to our servers.</p>
          <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 16px' }}>The calculator is supported by display advertising via Google AdSense. Ad serving may use cookies per Google&apos;s standard terms.</p>
        </div>
      </main>
      <Footer countries={countries} />
    </>
  );
}
