import { Header } from '../../src/components/Header.js';
import { Footer } from '../../src/components/Footer.js';
import { getAllCountries } from '@reckoner/finance-data';

export const metadata = { title: 'About | Reckoner', description: 'Who writes Reckoner and how we source our data.' };

export default function AboutPage() {
  const countries = getAllCountries();
  return (
    <>
      <Header allCountries={countries} />
      <main id="main">
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
          <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: '-0.03em', margin: '0 0 16px' }}>Who writes this</h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 16px' }}>Reckoner is built and maintained by a software engineer who builds financial calculation tools. The repayment engines are tested against worked examples published by FRED, the Bank of Canada, the Bank of England, and the Reserve Bank of Australia.</p>
          <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 16px' }}>Found an error in the calculation or rate data? <a href="/contact" style={{ color: '#0072f0' }}>Contact us</a> with the details.</p>
        </div>
      </main>
      <Footer countries={countries} />
    </>
  );
}
