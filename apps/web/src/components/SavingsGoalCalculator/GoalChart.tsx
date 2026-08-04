'use client';
import dynamic from 'next/dynamic';

interface DataPoint { year: number; balance: number; }
interface GoalChartProps { data: DataPoint[]; goal: number; currency: string; locale: string; }

const Inner = dynamic(() => import('./GoalChartInner'), { ssr: false });

export function GoalChart(props: GoalChartProps) {
  if (props.data.length === 0) return null;
  return <Inner {...props} />;
}
