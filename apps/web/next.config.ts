import type { NextConfig } from 'next';

const PROPERTY_SLUGS = [
  'mortgage-calculator',
  'stamp-duty',
  'affordability',
  'refinance',
  'rent-vs-buy',
] as const;

const config: NextConfig = {
  webpack(webpackConfig) {
    webpackConfig.resolve = webpackConfig.resolve ?? {};
    webpackConfig.resolve.extensionAlias = {
      '.js': ['.tsx', '.ts', '.js'],
      '.jsx': ['.tsx', '.jsx'],
    };
    return webpackConfig;
  },
  experimental: {
    turbo: {
      resolveExtensions: ['.tsx', '.ts', '.jsx', '.js'],
    },
  },
  async redirects() {
    return PROPERTY_SLUGS.map((slug) => ({
      source: `/:cc/${slug}`,
      destination: `/:cc/property/${slug}`,
      permanent: true,
    }));
  },
  async headers() {
    return [
      {
        source: '/embed/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          { key: 'Content-Security-Policy', value: 'frame-ancestors *;' },
        ],
      },
    ];
  },
};

export default config;
