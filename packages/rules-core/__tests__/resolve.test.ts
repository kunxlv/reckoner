import { describe, it, expect } from 'vitest';
import { asOf } from '../src/resolve';

interface Versioned {
  provenance: { effectiveFrom: string; effectiveTo?: string };
  value: number;
}

describe('asOf', () => {
  const versions: Versioned[] = [
    { provenance: { effectiveFrom: '2024-01-01', effectiveTo: '2025-04-01' }, value: 1 },
    { provenance: { effectiveFrom: '2025-04-01' }, value: 2 },
  ];

  it('returns the active version for a given date', () => {
    expect(asOf(versions, '2024-06-15').value).toBe(1);
  });

  it('returns the newer version after effectiveFrom', () => {
    expect(asOf(versions, '2025-05-01').value).toBe(2);
  });

  it('returns latest when no date given (defaults to today)', () => {
    // Today is after 2025-04-01
    expect(asOf(versions).value).toBe(2);
  });

  it('throws when no version covers the date', () => {
    expect(() => asOf(versions, '2023-01-01')).toThrow('No active ruleset');
  });

  it('treats effectiveTo as exclusive', () => {
    // On the boundary date itself, the old version is no longer active
    expect(asOf(versions, '2025-04-01').value).toBe(2);
  });
});
