import { softwareApplicationSchema, jsonLdScript } from '@reckoner/seo';

interface Props {
  name: string;
  description: string;
  url: string;
}

export function CalculatorSchema({ name, description, url }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: jsonLdScript(softwareApplicationSchema(url, name, description)),
      }}
    />
  );
}
