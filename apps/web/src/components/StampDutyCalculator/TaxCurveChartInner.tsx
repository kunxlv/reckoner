'use client';
import {
  ComposedChart, Line, XAxis, YAxis, ReferenceLine,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import type { TransferTaxRuleSet } from '@reckoner/rules-core';
import { calculateTransferTax } from '@reckoner/transfer-tax-engine';

interface TaxCurveChartInnerProps {
  ruleset: TransferTaxRuleSet;
  surcharges: string[];
  relief: string | null;
  currentPrice: number;
  currency: string;
  locale: string;
}

export default function TaxCurveChartInner({
  ruleset, surcharges, relief, currentPrice, currency, locale,
}: TaxCurveChartInnerProps) {
  const fmt = (v: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency, notation: 'compact', maximumFractionDigits: 0 }).format(v);

  // Compute maxPrice: max of currentPrice * 2 and largest finite band upper, minimum 500000
  const largestFiniteBand = ruleset.bands.reduce<number>((max, b) => {
    return b.upTo !== null ? Math.max(max, b.upTo) : max;
  }, 0);
  const maxPrice = Math.max(currentPrice * 2, largestFiniteBand, 500_000);

  const step = maxPrice / 60;
  const data = Array.from({ length: 61 }, (_, i) => {
    const p = i * step;
    if (p === 0) return { price: 0, tax: 0, rate: 0 };
    const res = calculateTransferTax({ price: p, surcharges, relief }, ruleset);
    return { price: p, tax: res.tax, rate: res.effectiveRate * 100 };
  });

  return (
    <div
      style={{ width: '100%', height: '100%' }}
      role="img"
      aria-label={`Line chart showing how stamp duty tax amount and effective rate scale with property price. Current price is ${fmt(currentPrice)}.`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 80, left: 20, bottom: 20 }}>
          <XAxis
            dataKey="price"
            tickFormatter={fmt}
            tick={{ fontSize: 12, fill: '#5a5a5a' }}
            axisLine={{ stroke: '#dddddd' }}
            tickLine={false}
            tickCount={6}
          />
          <YAxis
            yAxisId="tax"
            orientation="left"
            tickFormatter={fmt}
            tick={{ fontSize: 12, fill: '#5a5a5a' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="rate"
            orientation="right"
            tickFormatter={(v) => `${(v as number).toFixed(1)}%`}
            tick={{ fontSize: 12, fill: '#5a5a5a' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(v, name) => {
              if (name === 'Tax') return fmt(v as number);
              if (name === 'Effective rate') return `${(v as number).toFixed(2)}%`;
              return String(v);
            }}
            labelFormatter={(label) => `Price: ${fmt(label as number)}`}
            contentStyle={{
              background: 'var(--color-canvas)',
              border: '1px solid var(--color-hairline)',
              borderRadius: 0,
              boxShadow: '0 24px 64px -12px rgba(0,0,0,0.24)',
              fontSize: 13,
              color: 'var(--color-ink)',
            }}
          />
          <Line
            yAxisId="tax"
            type="monotone"
            dataKey="tax"
            stroke="var(--color-ink)"
            strokeWidth={2}
            dot={false}
            name="Tax"
          />
          <Line
            yAxisId="rate"
            type="monotone"
            dataKey="rate"
            stroke="#9ca3af"
            strokeWidth={1}
            strokeDasharray="4 2"
            dot={false}
            name="Effective rate"
          />
          <ReferenceLine
            x={currentPrice}
            yAxisId="tax"
            stroke="#6b7280"
            strokeDasharray="3 3"
            label={{ value: 'Your price', position: 'insideTopRight', fontSize: 12, fill: '#6b7280' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
