'use client';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';

interface DataPoint { year: number; balance: number; }

interface Props {
  data: DataPoint[];
  goal: number;
  currency: string;
  locale: string;
}

export default function GoalChartInner({ data, goal, currency, locale }: Props) {
  const fmt = (v: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(v);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hairline)" />
        <XAxis dataKey="year" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} label={{ value: 'Year', position: 'insideBottom', offset: -2, fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={fmt} width={80} />
        <Tooltip formatter={(v) => typeof v === 'number' ? fmt(v) : v} />
        <Legend />
        <ReferenceLine y={goal} stroke="var(--color-accent)" strokeDasharray="4 4" label={{ value: 'Goal', position: 'insideTopRight', fontSize: 11 }} />
        <Line type="monotone" dataKey="balance" stroke="var(--color-ink)" dot={false} name="Balance" />
      </LineChart>
    </ResponsiveContainer>
  );
}
