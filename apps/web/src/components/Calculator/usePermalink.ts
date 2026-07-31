'use client';
import { useEffect, useRef } from 'react';
import type { CalcState } from './useCalculator.js';

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

export function decodeState(search: string): Partial<CalcState> {
  const p = new URLSearchParams(search);
  const out: Partial<CalcState> = {};
  const num = (k: keyof CalcState) => {
    const v = p.get(k);
    if (v === null) return;
    const n = Number(v);
    if (!Number.isNaN(n)) (out as Record<string, unknown>)[k] = n;
  };
  for (const k of KEYS) num(k);
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
