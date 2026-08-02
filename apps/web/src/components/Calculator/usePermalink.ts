'use client';
import { useEffect, useRef } from 'react';
import type { CalcState } from './useCalculator';

const KEYS: (keyof CalcState)[] = [
  'price', 'deposit', 'rate', 'termYears', 'periodsPerYear',
  'extraPayment', 'propertyTax', 'insurance', 'pmi', 'hoa',
];

export function encodeState(state: CalcState): URLSearchParams {
  const p = new URLSearchParams();
  for (const k of KEYS) {
    p.set(k, String(state[k]));
  }
  return p;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function decodeState(search: string): Partial<CalcState> {
  const p = new URLSearchParams(search);
  const raw: Partial<Record<keyof CalcState, number>> = {};
  for (const k of KEYS) {
    const v = p.get(k);
    if (v === null) continue;
    const n = Number(v);
    if (!Number.isNaN(n) && isFinite(n)) raw[k] = n;
  }

  // Clamp all values to safe ranges before touching component state.
  // This prevents extreme/malicious URL params from causing UI or engine issues.
  const out: Partial<CalcState> = {};
  if (raw.price !== undefined) out.price = clamp(raw.price, 0, 200_000_000);
  if (raw.deposit !== undefined) out.deposit = clamp(raw.deposit, 0, out.price ?? 200_000_000);
  if (raw.rate !== undefined) out.rate = clamp(raw.rate, 0, 1);
  if (raw.termYears !== undefined) out.termYears = clamp(Math.round(raw.termYears), 1, 40);
  if (raw.periodsPerYear !== undefined) {
    const ppy = raw.periodsPerYear;
    out.periodsPerYear = ([12, 26, 52] as const).includes(ppy as 12 | 26 | 52) ? (ppy as 12 | 26 | 52) : 12;
  }
  if (raw.extraPayment !== undefined) out.extraPayment = clamp(raw.extraPayment, 0, 1_000_000);
  if (raw.propertyTax !== undefined) out.propertyTax = clamp(raw.propertyTax, 0, 1_000_000);
  if (raw.insurance !== undefined) out.insurance = clamp(raw.insurance, 0, 100_000);
  if (raw.pmi !== undefined) out.pmi = clamp(raw.pmi, 0, 10_000);
  if (raw.hoa !== undefined) out.hoa = clamp(raw.hoa, 0, 10_000);
  return out;
}

export function usePermalink(state: CalcState) {
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const params = encodeState(state);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    history.replaceState(null, '', newUrl);
  }, [state]);

  function copyLink() {
    const params = encodeState(state);
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    void navigator.clipboard.writeText(url);
  }

  return { copyLink };
}
