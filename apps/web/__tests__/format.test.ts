import { describe, it, expect } from 'vitest';
import { formatCurrency, formatRate, formatDate, formatPercent } from '../src/lib/format';

describe('formatCurrency', () => {
  it('formats USD with en-US locale', () => {
    const result = formatCurrency(1234, 'USD', 'en-US');
    expect(result).toContain('1,234');
    expect(result).toContain('$');
  });

  it('formats GBP with en-GB locale', () => {
    const result = formatCurrency(500, 'GBP', 'en-GB');
    expect(result).toContain('500');
    expect(result).toContain('£');
  });

  it('rounds to zero decimal places', () => {
    const result = formatCurrency(1234.99, 'USD', 'en-US');
    expect(result).not.toContain('.');
    expect(result).toContain('1,235');
  });

  it('handles zero', () => {
    const result = formatCurrency(0, 'USD', 'en-US');
    expect(result).toContain('0');
  });

  it('handles negative amounts', () => {
    const result = formatCurrency(-500, 'USD', 'en-US');
    expect(result).toContain('500');
  });

  it('compact mode: formats large numbers in compact notation', () => {
    const result = formatCurrency(1_500_000, 'USD', 'en-US', { compact: true });
    // Compact notation: $2M or $1.5M depending on platform
    expect(result.length).toBeLessThan(10);
    expect(result).toContain('$');
  });

  it('compact mode: values below 1000 fall through to standard formatting', () => {
    const result = formatCurrency(999, 'USD', 'en-US', { compact: true });
    expect(result).toContain('999');
  });

  it('compact mode: negative values above 1000 in absolute value use compact notation', () => {
    const result = formatCurrency(-2_000_000, 'USD', 'en-US', { compact: true });
    expect(result).toContain('M');
  });

  it('without compact option uses standard formatting for large numbers', () => {
    const result = formatCurrency(1_000_000, 'USD', 'en-US');
    expect(result).toContain('1,000,000');
  });
});

describe('formatRate', () => {
  it('converts decimal rate to 2dp percentage string', () => {
    expect(formatRate(0.065)).toBe('6.50');
  });

  it('handles zero', () => {
    expect(formatRate(0)).toBe('0.00');
  });

  it('handles 100% rate', () => {
    expect(formatRate(1)).toBe('100.00');
  });

  it('rounds to two decimal places', () => {
    expect(formatRate(0.04567)).toBe('4.57');
  });
});

describe('formatDate', () => {
  it('formats date with month and year', () => {
    const date = new Date(2024, 0, 15); // January 2024
    const result = formatDate(date, 'en-US');
    expect(result).toContain('2024');
    expect(result).toMatch(/January|Jan/);
  });

  it('formats date with locale-appropriate format', () => {
    const date = new Date(2024, 5, 1); // June 2024
    const result = formatDate(date, 'en-GB');
    expect(result).toContain('2024');
    expect(result).toMatch(/June|Jun/);
  });
});

describe('formatPercent', () => {
  it('converts decimal to percentage with 1dp', () => {
    expect(formatPercent(0.065)).toBe('6.5%');
  });

  it('handles zero', () => {
    expect(formatPercent(0)).toBe('0.0%');
  });

  it('handles 100%', () => {
    expect(formatPercent(1)).toBe('100.0%');
  });

  it('rounds to one decimal place', () => {
    expect(formatPercent(0.04567)).toBe('4.6%');
  });
});
