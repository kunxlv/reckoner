'use client';
import dynamic from 'next/dynamic';

const Inner = dynamic(() => import('./BorrowingChartInner'), { ssr: false });

interface BorrowingChartProps {
  data: Array<{ income: number; maxBorrow: number }>;
  currentIncome: number;
  currency: string;
  locale: string;
}

export function BorrowingChart(props: BorrowingChartProps) {
  return (
    <div style={{ width: '100%', aspectRatio: '860/320' }}>
      <Inner {...props} />
    </div>
  );
}
