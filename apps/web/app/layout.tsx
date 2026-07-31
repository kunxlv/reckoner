import type { Metadata } from 'next';
import { Inter, Instrument_Serif } from 'next/font/google';
import { AnalyticsScripts } from '@reckoner/analytics';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500'],
  variable: '--font-inter',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <head>
        <AnalyticsScripts
          {...(process.env.NEXT_PUBLIC_GA4_ID ? { ga4Id: process.env.NEXT_PUBLIC_GA4_ID } : {})}
          {...(process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ? { plausibleDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN } : {})}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
