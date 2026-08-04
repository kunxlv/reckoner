'use client';
import dynamic from 'next/dynamic';

interface DataPoint { year: number; value: number; }
interface ReturnChartProps { data: DataPoint[]; currency: string; locale: string; }

const Inner = dynamic(() => import('./ReturnChartInner'), { ssr: false });

export function ReturnChart(props: ReturnChartProps) {
  if (props.data.length === 0) return null;
  return <Inner {...props} />;
}
