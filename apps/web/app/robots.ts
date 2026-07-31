import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/embed/', '/api/'] },
      { userAgent: ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'CCBot'], allow: '/' },
    ],
    sitemap: 'https://reckoner.tools/sitemap.xml',
  };
}
