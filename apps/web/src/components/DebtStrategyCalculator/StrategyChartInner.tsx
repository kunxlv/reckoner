'use client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';

interface Props {
  minimumInterestCents: number;
  snowballInterestCents: number;
  avalancheInterestCents: number;
  currency: string;
  locale: string;
}

export default function StrategyChartInner({
  minimumInterestCents,
  snowballInterestCents,
  avalancheInterestCents,
  currency,
  locale,
}: Props) {
  const fmt = (v: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(v / 100);

  const data = [
    { strategy: 'Minimum only', interestCents: minimumInterestCents },
    { strategy: 'Snowball', interestCents: snowballInterestCents },
    { strategy: 'Avalanche', interestCents: avalancheInterestCents },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hairline)" vertical={false} />
        <XAxis dataKey="strategy" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => fmt(v)}
          width={80}
        />
        <Tooltip formatter={(v) => (typeof v === 'number' ? fmt(v) : v)} />
        <Bar dataKey="interestCents" name="Total interest" radius={[3, 3, 0, 0]}>
          <Cell key="min" fill="var(--color-interest)" />
          <Cell key="snow" fill="var(--color-ink-mid)" />
          <Cell key="aval" fill="var(--color-ink)" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
