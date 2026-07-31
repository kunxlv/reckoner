'use client';
import dynamic from 'next/dynamic';
import type { AmortizationRow } from '@reckoner/mortgage-engine';

const Inner = dynamic(() => import('./CrossoverChartInner.js'), { ssr: false });

interface CrossoverChartProps {
  rows: AmortizationRow[];
  crossoverPeriod: number | null;
  currency: string;
  locale: string;
  periodsPerYear: number;
}

export function CrossoverChart(props: CrossoverChartProps) {
  return (
    <div style={{ width: '100%', aspectRatio: '860/360' }}>
      <Inner {...props} />
    </div>
  );
}
