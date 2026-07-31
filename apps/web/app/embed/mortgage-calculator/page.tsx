import { notFound } from 'next/navigation';
import { getCountry, COUNTRY_CODES, fetchRate, fetchFxRates } from '@reckoner/finance-data';
import type { CountryCode } from '@reckoner/finance-data';
import { Calculator } from '../../../src/components/Calculator/index.js';

export const revalidate = 86400;

export const metadata = {
  robots: { index: false, follow: true },
};

interface Props {
  searchParams: Promise<{ country?: string }>;
}

export default async function EmbedPage({ searchParams }: Props) {
  const { country: cc = 'us' } = await searchParams;
  if (!COUNTRY_CODES.includes(cc as CountryCode)) notFound();

  const country = getCountry(cc as CountryCode);
  let rateResult = null;
  try { rateResult = await fetchRate(cc as CountryCode); } catch { /* ok */ }
  let fxResult = null;
  try { fxResult = await fetchFxRates(country.currency); } catch { /* ok */ }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex,follow" />
        <style>{`
          body { margin: 0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; background: transparent; }
          *, *::before, *::after { font-variant-numeric: tabular-nums lining-nums slashed-zero; box-sizing: border-box; }
        `}</style>
      </head>
      <body>
        <Calculator country={country} rateResult={rateResult} fxResult={fxResult} />
        <p style={{ fontSize: 12, color: '#5a5a5a', marginTop: 16, textAlign: 'center' }}>
          <a href={`https://reckoner.tools/${cc}/mortgage-calculator`} target="_blank" rel="noopener noreferrer" style={{ color: '#5a5a5a' }}>
            Mortgage calculator by Reckoner
          </a>
        </p>
      </body>
    </html>
  );
}
