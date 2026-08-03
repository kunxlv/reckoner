'use client';
import dynamic from 'next/dynamic';

const Inner = dynamic(() => import('./BreakEvenChartInner'), { ssr: false });

interface BreakEvenChartProps {
  monthlySavings: number;
  closingCosts: number;
  breakEvenMonths: number | null;
  totalMonths: number;
  currency: string;
  locale: string;
}

export function BreakEvenChart(props: BreakEvenChartProps) {
  return (
    <div style={{ width: '100%', aspectRatio: '860/300' }}>
      <Inner {...props} />
    </div>
  );
}
