'use client';
import dynamic from 'next/dynamic';

interface StrategyChartProps {
  minimumInterestCents: number;
  snowballInterestCents: number;
  avalancheInterestCents: number;
  currency: string;
  locale: string;
}

const Inner = dynamic(() => import('./StrategyChartInner'), { ssr: false });

export function StrategyChart(props: StrategyChartProps) {
  return <Inner {...props} />;
}
