export function formatCurrency(
  amount: number,
  currency: string,
  locale: string,
  opts?: { compact?: boolean }
): string {
  if (opts?.compact && Math.abs(amount) >= 1_000) {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 0,
    }).format(amount);
    return formatted;
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatRate(rate: number): string {
  return (rate * 100).toFixed(2);
}

export function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
