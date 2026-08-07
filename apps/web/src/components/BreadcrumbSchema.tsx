import { breadcrumbSchema, jsonLdScript } from '@reckoner/seo';

interface BreadcrumbItem {
  name: string;
  href: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbSchema(items)) }}
    />
  );
}
