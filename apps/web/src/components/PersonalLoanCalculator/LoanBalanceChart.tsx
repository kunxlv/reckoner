'use client';
import dynamic from 'next/dynamic';
import type { AmortizationRow } from '@reckoner/loan-engine';

interface LoanBalanceChartProps {
  schedule: AmortizationRow[];
  currency: string;
  locale: string;
}

const Inner = dynamic(() => import('./LoanBalanceChartInner'), { ssr: false });

export function LoanBalanceChart(props: LoanBalanceChartProps) {
  if (props.schedule.length === 0) return null;
  return <Inner {...props} />;
}
