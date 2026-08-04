'use client';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';

interface DataPoint {
  label: string;
  nominal: number;
  real?: number;
}

interface Props {
  data: DataPoint[];
  currency: string;
  locale: string;
  retirementLabel: string;
}

export default function RetirementChartInner({ data, currency, locale, retirementLabel }: Props) {
  const fmt = (v: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(v);

  const hasReal = data.some((d) => d.real !== undefined);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hairline)" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={fmt} width={80} />
        <Tooltip formatter={(v) => typeof v === 'number' ? fmt(v) : v} />
        <Legend />
        <ReferenceLine x={retirementLabel} stroke="var(--color-ink-mid)" strokeDasharray="4 4" label={{ value: 'Retirement', fontSize: 11 }} />
        <Line type="monotone" dataKey="nominal" stroke="var(--color-ink)" dot={false} name="Nominal balance" />
        {hasReal && (
          <Line type="monotone" dataKey="real" stroke="var(--color-ink-mid)" dot={false} strokeDasharray="4 4" name="Real balance" />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
