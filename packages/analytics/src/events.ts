export type AnalyticsEvent =
  | { name: 'calc_used'; props: { cc: string; convention: string } }
  | { name: 'country_switched'; props: { from: string; to: string } }
  | { name: 'currency_toggled'; props: { target: string } }
  | { name: 'disclosure_opened'; props: { cc: string } }
  | { name: 'extra_payment_used'; props: { cc: string; amount: number } }
  | { name: 'permalink_copied'; props: { cc: string } }
  | { name: 'embed_copied'; props: { cc: string } }
  | { name: 'rate_source_clicked'; props: { cc: string; source: string } }
  | { name: 'methodology_opened'; props: Record<string, never> };
