import type { MetadataRoute } from 'next';
import {
  getStaticSitemapEntries,
  getHubSitemapEntries,
  getPropertySitemapEntries,
  getLoanSitemapEntries,
  getSavingsSitemapEntries,
} from '@reckoner/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...getStaticSitemapEntries(),
    ...getHubSitemapEntries(),
    ...getPropertySitemapEntries(),
    ...getLoanSitemapEntries(),
    ...getSavingsSitemapEntries(),
  ];
}
