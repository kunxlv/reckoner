'use client';
import {
  AreaChart, Area, XAxis, YAxis, ReferenceLine,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import type { AmortizationRow } from '@reckoner/mortgage-engine';

interface CrossoverChartInnerProps {
  rows: AmortizationRow[];
  crossoverPeriod: number | null;
  currency: string;
  locale: string;
  periodsPerYear: number;
}

export default function CrossoverChartInner({
  rows, crossoverPeriod, currency, locale, periodsPerYear,
}: CrossoverChartInnerProps) {
  // Yearly aggregation
  const yearly = rows.reduce<Array<{ year: number; interest: number; principal: number }>>((acc, row) => {
    const year = Math.ceil(row.period / periodsPerYear);
    const existing = acc.find((a) => a.year === year);
    if (existing) {
      existing.interest += row.interest;
      existing.principal += row.principal;
    } else {
      acc.push({ year, interest: row.interest, principal: row.principal });
    }
    return acc;
  }, []);

  const crossoverYear = crossoverPeriod ? Math.ceil(crossoverPeriod / periodsPerYear) : null;

  const fmt = (v: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency, notation: 'compact', maximumFractionDigits: 0 }).format(v);

  const totalInterest = rows[rows.length - 1]?.cumulativeInterest ?? 0;

  return (
    <div style={{ width: '100%', aspectRatio: '860/360' }}
      role="img"
      aria-label={`Stacked area chart of yearly payments. Interest dominates the early years${crossoverYear ? `, with principal overtaking around year ${crossoverYear}` : ''}. Total interest paid is ${fmt(totalInterest)}.`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={yearly} margin={{ top: 20, right: 80, left: 20, bottom: 20 }}>
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12, fill: '#5a5a5a' }}
            axisLine={{ stroke: '#dddddd' }}
            tickLine={false}
            label={{ value: 'Years', position: 'insideBottom', offset: -10, fill: '#5a5a5a', fontSize: 12 }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#5a5a5a' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={fmt}
          />
          <Tooltip
            formatter={(v) => (typeof v === 'number' ? fmt(v) : String(v))}
            contentStyle={{ background: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 0, boxShadow: '0 24px 64px -12px rgba(0,0,0,0.24)', fontSize: 13, color: 'var(--color-ink)' }}
          />
          <Area
            type="monotone"
            dataKey="interest"
            stackId="1"
            stroke="#c2321f"
            strokeWidth={1.5}
            fill="#fbeceb"
            name="Interest"
            aria-hidden="true"
          />
          <Area
            type="monotone"
            dataKey="principal"
            stackId="1"
            stroke="#0f7a4d"
            strokeWidth={1.5}
            fill="#e8f5ee"
            name="Principal"
            aria-hidden="true"
          />
          {crossoverYear && (
            <ReferenceLine
              x={crossoverYear}
              stroke="#000000"
              strokeWidth={1}
              label={{
                value: `Year ${crossoverYear}: from here you pay more principal than interest`,
                position: crossoverYear > (yearly.length / 2) ? 'insideTopLeft' : 'insideTopRight',
                fontSize: 13,
                fontStyle: 'italic',
                fontFamily: 'var(--font-instrument-serif, Georgia, serif)',
                fill: '#000000',
              }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>

      {/* Visually hidden data table */}
      <table style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>
        <caption>Yearly breakdown of principal and interest</caption>
        <thead><tr><th>Year</th><th>Interest</th><th>Principal</th></tr></thead>
        <tbody>
          {yearly.map((r) => (
            <tr key={r.year}>
              <td>{r.year}</td>
              <td>{fmt(r.interest)}</td>
              <td>{fmt(r.principal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
