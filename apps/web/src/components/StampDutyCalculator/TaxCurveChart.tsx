'use client';
import dynamic from 'next/dynamic';
import type { TransferTaxRuleSet } from '@reckoner/rules-core';

const Inner = dynamic(() => import('./TaxCurveChartInner'), { ssr: false });

interface TaxCurveChartProps {
  ruleset: TransferTaxRuleSet;
  surcharges: string[];
  relief: string | null;
  currentPrice: number;
  currency: string;
  locale: string;
}

export function TaxCurveChart(props: TaxCurveChartProps) {
  return (
    <div style={{ width: '100%', aspectRatio: '860/320' }}>
      <Inner {...props} />
    </div>
  );
}
