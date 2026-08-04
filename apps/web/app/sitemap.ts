import type { MetadataRoute } from 'next';
import {
  getStaticSitemapEntries,
  getPropertySitemapEntries,
  getLoanSitemapEntries,
  getSavingsSitemapEntries,
} from '@reckoner/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...getStaticSitemapEntries(),
    ...getPropertySitemapEntries(),
    ...getLoanSitemapEntries(),
    ...getSavingsSitemapEntries(),
  ];
}
