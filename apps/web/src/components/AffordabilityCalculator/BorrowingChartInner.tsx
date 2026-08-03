'use client';
import {
  LineChart, Line, XAxis, YAxis, ReferenceLine,
  ResponsiveContainer, Tooltip,
} from 'recharts';

interface BorrowingChartInnerProps {
  data: Array<{ income: number; maxBorrow: number }>;
  currentIncome: number;
  currency: string;
  locale: string;
}

export default function BorrowingChartInner({
  data, currentIncome, currency, locale,
}: BorrowingChartInnerProps) {
  const fmt = (v: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency, notation: 'compact', maximumFractionDigits: 0 }).format(v);

  return (
    <div
      style={{ width: '100%', height: '100%' }}
      role="img"
      aria-label={`Line chart showing how maximum borrowing capacity changes with gross annual income. Current income is ${fmt(currentIncome)}.`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 80, left: 20, bottom: 20 }}>
          <XAxis
            dataKey="income"
            tickFormatter={fmt}
            tick={{ fontSize: 12, fill: '#5a5a5a' }}
            axisLine={{ stroke: '#dddddd' }}
            tickLine={false}
            tickCount={6}
          />
          <YAxis
            tickFormatter={fmt}
            tick={{ fontSize: 12, fill: '#5a5a5a' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(v) => fmt(v as number)}
            labelFormatter={(label) => `Income: ${fmt(label as number)}`}
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
            type="monotone"
            dataKey="maxBorrow"
            stroke="var(--color-ink)"
            strokeWidth={2}
            dot={false}
            name="Max borrow"
          />
          <ReferenceLine
            x={currentIncome}
            stroke="#6b7280"
            strokeDasharray="3 3"
            label={{ value: 'Your income', position: 'insideTopRight', fontSize: 12, fill: '#6b7280' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
