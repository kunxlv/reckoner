import { Header } from '../../src/components/Header';
import { Footer } from '../../src/components/Footer';
import { getAllCountries } from '@reckoner/finance-data';

export const metadata = { title: 'Contact | Reckoner' };

export default function ContactPage() {
  const countries = getAllCountries();
  return (
    <>
      <Header allCountries={countries} />
      <main id="main">
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
          <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: '-0.03em', margin: '0 0 16px' }}>Contact</h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 16px' }}>For methodology corrections, rate data issues, or embed questions, email <a href="mailto:hello@reckoner.tools" style={{ color: '#0072f0' }}>hello@reckoner.tools</a>.</p>
        </div>
      </main>
      <Footer countries={countries} />
    </>
  );
}
