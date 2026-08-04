'use client';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import type { AccumulationRow } from '@reckoner/growth-engine';

interface Props {
  schedule: AccumulationRow[];
  principal: number;
  currency: string;
  locale: string;
}

export default function GrowthChartInner({ schedule, principal, currency, locale }: Props) {
  const fmt = (v: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(v);

  const data = schedule.map((row) => ({
    year: row.year,
    principal,
    contributions: Math.max(0, row.contributed - principal),
    interest: Math.max(0, row.interest),
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hairline)" />
        <XAxis dataKey="year" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} label={{ value: 'Year', position: 'insideBottom', offset: -2, fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={fmt} width={80} />
        <Tooltip formatter={(v) => typeof v === 'number' ? fmt(v) : v} />
        <Legend />
        <Area type="monotone" dataKey="principal" stackId="1" stroke="var(--color-ink-mid)" fill="var(--color-surface)" name="Principal" />
        <Area type="monotone" dataKey="contributions" stackId="1" stroke="var(--color-ink)" fill="var(--color-ink-mid)" name="Contributions" />
        <Area type="monotone" dataKey="interest" stackId="1" stroke="var(--color-accent)" fill="var(--color-accent)" name="Interest" fillOpacity={0.6} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
