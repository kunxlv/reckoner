'use client';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import type { AmortizationRow } from '@reckoner/loan-engine';

interface Props {
  schedule: AmortizationRow[];
  currency: string;
  locale: string;
}

export default function LoanBalanceChartInner({ schedule, currency, locale }: Props) {
  const fmt = (v: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(v);

  // Sample to at most 60 points for readability
  const step = Math.max(1, Math.floor(schedule.length / 60));
  const data = schedule
    .filter((_, i) => i % step === 0 || i === schedule.length - 1)
    .map((row) => ({
      month: row.period,
      balance: Math.max(0, row.balance),
      interest: row.cumulativeInterest,
    }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hairline)" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={fmt}
          width={80}
        />
        <Tooltip formatter={(v) => (typeof v === 'number' ? fmt(v) : v)} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Line
          type="monotone"
          dataKey="balance"
          stroke="var(--color-ink)"
          strokeWidth={2}
          dot={false}
          name="Remaining balance"
        />
        <Line
          type="monotone"
          dataKey="interest"
          stroke="var(--color-interest)"
          strokeWidth={2}
          dot={false}
          name="Cumulative interest"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
