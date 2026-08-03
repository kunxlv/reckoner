'use client';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import type { CardPayoffRow } from '@reckoner/card-payoff-engine';

interface Props {
  minSchedule: CardPayoffRow[];
  extraSchedule: CardPayoffRow[];
  currency: string;
  locale: string;
}

export default function PayoffChartInner({ minSchedule, extraSchedule, currency, locale }: Props) {
  const fmt = (v: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(v / 100);

  // Build cumulative interest arrays
  let minCumulative = 0;
  let extraCumulative = 0;
  const maxMonths = Math.max(minSchedule.length, extraSchedule.length);

  const data = Array.from({ length: maxMonths }, (_, i) => {
    if (i < minSchedule.length) minCumulative += minSchedule[i]!.interestCents;
    const extraVal = i < extraSchedule.length
      ? (extraCumulative += extraSchedule[i]!.interestCents, extraCumulative)
      : undefined;
    return {
      month: i + 1,
      minInterest: minCumulative,
      extraInterest: extraVal,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hairline)" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => fmt(v)}
          width={80}
        />
        <Tooltip formatter={(v) => (typeof v === 'number' ? fmt(v) : v)} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Line
          type="monotone"
          dataKey="minInterest"
          stroke="var(--color-interest)"
          strokeWidth={2}
          dot={false}
          name="Minimum only"
          connectNulls={false}
        />
        <Line
          type="monotone"
          dataKey="extraInterest"
          stroke="var(--color-ink)"
          strokeWidth={2}
          dot={false}
          name="With extra payment"
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
