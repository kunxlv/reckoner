import type { MetadataRoute } from 'next';
import { getStaticSitemapEntries, getPropertySitemapEntries } from '@reckoner/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...getStaticSitemapEntries(),
    ...getPropertySitemapEntries(),
  ];
}
