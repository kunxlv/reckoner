import type { MetadataRoute } from 'next';
import { getMortgageSitemapEntries, getStaticSitemapEntries } from '@reckoner/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...getStaticSitemapEntries(),
    ...getMortgageSitemapEntries(),
  ];
}
