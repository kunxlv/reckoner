'use client';
import dynamic from 'next/dynamic';

interface DataPoint {
  label: string;
  nominal: number;
  real?: number;
}

interface RetirementChartProps {
  data: DataPoint[];
  currency: string;
  locale: string;
  retirementLabel: string;
}

const Inner = dynamic(() => import('./RetirementChartInner'), { ssr: false });

export function RetirementChart(props: RetirementChartProps) {
  if (props.data.length === 0) return null;
  return <Inner {...props} />;
}
