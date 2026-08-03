'use client';
import dynamic from 'next/dynamic';

const Inner = dynamic(() => import('./ComparisonChartInner'), { ssr: false });

interface ComparisonChartProps {
  buyMonthly: number;
  rentMonthly: number;
  currency: string;
  locale: string;
}

export function ComparisonChart(props: ComparisonChartProps) {
  return (
    <div style={{ width: '100%', aspectRatio: '860/320' }}>
      <Inner {...props} />
    </div>
  );
}
