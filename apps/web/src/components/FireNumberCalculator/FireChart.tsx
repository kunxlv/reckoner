'use client';
import dynamic from 'next/dynamic';

interface DataPoint { year: number; balance: number; }
interface FireChartProps { data: DataPoint[]; fireNumber: number; currency: string; locale: string; }

const Inner = dynamic(() => import('./FireChartInner'), { ssr: false });

export function FireChart(props: FireChartProps) {
  if (props.data.length === 0) return null;
  return <Inner {...props} />;
}
