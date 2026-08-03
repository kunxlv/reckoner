'use client';
import dynamic from 'next/dynamic';
import type { CardPayoffRow } from '@reckoner/card-payoff-engine';

interface PayoffChartProps {
  minSchedule: CardPayoffRow[];
  extraSchedule: CardPayoffRow[];
  currency: string;
  locale: string;
}

const Inner = dynamic(() => import('./PayoffChartInner'), { ssr: false });

export function PayoffChart(props: PayoffChartProps) {
  if (props.minSchedule.length === 0) return null;
  return <Inner {...props} />;
}
