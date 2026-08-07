import { faqSchema, jsonLdScript } from '@reckoner/seo';

interface FAQ {
  question: string;
  answer: string;
}

export function FAQSchema({ faqs }: { faqs: FAQ[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdScript(faqSchema(faqs)) }}
    />
  );
}
