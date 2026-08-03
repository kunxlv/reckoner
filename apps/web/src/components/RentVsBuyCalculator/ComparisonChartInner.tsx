'use client';
import {
  LineChart, Line, XAxis, YAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';

interface ComparisonChartInnerProps {
  buyMonthly: number;
  rentMonthly: number;
  currency: string;
  locale: string;
}

export default function ComparisonChartInner({
  buyMonthly, rentMonthly, currency, locale,
}: ComparisonChartInnerProps) {
  const fmt = (v: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency, notation: 'compact', maximumFractionDigits: 0 }).format(v);

  const data = Array.from({ length: 11 }, (_, year) => ({
    year,
    buy: buyMonthly * year * 12,
    rent: rentMonthly * year * 12,
  }));

  return (
    <div
      style={{ width: '100%', height: '100%' }}
      role="img"
      aria-label="Line chart comparing cumulative effective cost of buying versus cumulative rent payments over 10 years."
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 80, left: 20, bottom: 20 }}>
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12, fill: '#5a5a5a' }}
            axisLine={{ stroke: '#dddddd' }}
            tickLine={false}
            label={{ value: 'Years', position: 'insideBottom', offset: -10, fill: '#5a5a5a', fontSize: 12 }}
          />
          <YAxis
            tickFormatter={fmt}
            tick={{ fontSize: 12, fill: '#5a5a5a' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(v) => fmt(v as number)}
            labelFormatter={(label) => `Year ${label as number}`}
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
            dataKey="buy"
            stroke="var(--color-ink)"
            strokeWidth={2}
            dot={false}
            name="Effective buy cost"
          />
          <Line
            type="monotone"
            dataKey="rent"
            stroke="#9ca3af"
            strokeWidth={2}
            dot={false}
            name="Rent payments"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
