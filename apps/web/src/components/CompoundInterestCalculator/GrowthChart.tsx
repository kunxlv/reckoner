'use client';
import dynamic from 'next/dynamic';
import type { AccumulationRow } from '@reckoner/growth-engine';

interface GrowthChartProps {
  schedule: AccumulationRow[];
  principal: number;
  currency: string;
  locale: string;
}

const Inner = dynamic(() => import('./GrowthChartInner'), { ssr: false });

export function GrowthChart(props: GrowthChartProps) {
  if (props.schedule.length === 0) return null;
  return <Inner {...props} />;
}
