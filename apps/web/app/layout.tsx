import type { Metadata } from 'next';
import { Lato, Instrument_Serif } from 'next/font/google';
import { AnalyticsScripts } from '@reckoner/analytics';
import './globals.css';

const lato = Lato({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '700'],
  variable: '--font-lato',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  display: 'swap',
  style: 'italic',
  weight: '400',
  variable: '--font-instrument-serif',
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://reckoner.tools'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${lato.variable} ${instrumentSerif.variable}`}>
      <head>
        <AnalyticsScripts
          ga4Id="G-3YD9S3SJ63"
          {...(process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ? { plausibleDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN } : {})}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
