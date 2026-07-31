import type { NextConfig } from 'next';

const config: NextConfig = {
  typedRoutes: false,
  webpack(webpackConfig) {
    // Allow importing .tsx files as .js (TypeScript ESM convention)
    webpackConfig.resolve = webpackConfig.resolve ?? {};
    webpackConfig.resolve.extensionAlias = {
      '.js': ['.tsx', '.ts', '.js'],
      '.jsx': ['.tsx', '.jsx'],
    };
    return webpackConfig;
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
