'use client';
import {
  LineChart, Line, XAxis, YAxis, ReferenceLine,
  ResponsiveContainer, Tooltip,
} from 'recharts';

interface BreakEvenChartInnerProps {
  monthlySavings: number;
  closingCosts: number;
  breakEvenMonths: number | null;
  totalMonths: number;
  currency: string;
  locale: string;
}

export default function BreakEvenChartInner({
  monthlySavings, closingCosts, breakEvenMonths, totalMonths, currency, locale,
}: BreakEvenChartInnerProps) {
  if (monthlySavings <= 0) {
    return (
      <div
        style={{
          width: '100%',
          padding: '32px 24px',
          background: 'var(--color-surface)',
          fontSize: 14,
          color: 'var(--color-ink-mid)',
        }}
      >
        No saving: the new rate is not lower than the current rate.
      </div>
    );
  }

  const fmt = (v: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency, notation: 'compact', maximumFractionDigits: 0 }).format(v);

  const chartEndMonth = Math.min(
    totalMonths,
    breakEvenMonths !== null ? breakEvenMonths * 3 : 120,
    360,
  );

  const data = Array.from({ length: chartEndMonth + 1 }, (_, month) => ({
    month,
    cumulativeSaving: Math.max(0, monthlySavings * month),
  }));

  return (
    <div
      style={{ width: '100%', height: '100%' }}
      role="img"
      aria-label={`Line chart showing cumulative savings over time compared to upfront refinancing cost of ${fmt(closingCosts)}${breakEvenMonths !== null ? `. Break-even at month ${breakEvenMonths}.` : '.'}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 80, left: 20, bottom: 20 }}>
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: '#5a5a5a' }}
            axisLine={{ stroke: '#dddddd' }}
            tickLine={false}
            label={{ value: 'Months', position: 'insideBottom', offset: -10, fill: '#5a5a5a', fontSize: 12 }}
          />
          <YAxis
            tickFormatter={fmt}
            tick={{ fontSize: 12, fill: '#5a5a5a' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(v) => fmt(v as number)}
            labelFormatter={(label) => `Month ${label as number}`}
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
            dataKey="cumulativeSaving"
            stroke="#0f7a4d"
            strokeWidth={2}
            dot={false}
            name="Cumulative saving"
          />
          <ReferenceLine
            y={closingCosts}
            stroke="#c2321f"
            strokeDasharray="4 2"
            label={{ value: 'Upfront cost', position: 'insideTopRight', fontSize: 12, fill: '#c2321f' }}
          />
          {breakEvenMonths !== null && (
            <ReferenceLine
              x={breakEvenMonths}
              stroke="#000000"
              strokeWidth={1}
              label={{
                value: `Break-even: month ${breakEvenMonths}`,
                position: breakEvenMonths < chartEndMonth * 0.6 ? 'insideTopRight' : 'insideTopLeft',
                fontSize: 12,
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
