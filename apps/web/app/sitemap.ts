import type { MetadataRoute } from 'next';
import {
  getStaticSitemapEntries,
  getPropertySitemapEntries,
  getLoanSitemapEntries,
} from '@reckoner/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...getStaticSitemapEntries(),
    ...getPropertySitemapEntries(),
    ...getLoanSitemapEntries(),
  ];
}
