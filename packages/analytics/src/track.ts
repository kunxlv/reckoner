import type { AnalyticsEvent } from './events';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    plausible?: (event: string, options?: { props?: Record<string, unknown> }) => void;
  }
}

export function track(event: AnalyticsEvent): void {
  if (typeof window === 'undefined') return;

  const { name, props } = event;

  // GA4
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, props);
  }

  // Plausible
  if (typeof window.plausible === 'function') {
    window.plausible(name, { props: props as Record<string, unknown> });
  }
}
