'use client';
import { useState } from 'react';
import type { CountryData } from '@reckoner/finance-data';
import { calculateAccumulation } from '@reckoner/growth-engine';
import { formatCurrency } from '../../lib/format';
import { GoalChart } from './GoalChart';

interface Props {
  country: CountryData;
  defaultPrincipal: number;
  defaultGoal: number;
  defaultAnnualRate: number;
}

const inputStyle = {
  fontSize: 18, fontWeight: 400, border: 'none', borderBottom: '1px solid var(--color-ink)',
  background: 'transparent', outline: 'none', width: '100%', color: 'var(--color-ink)', padding: '4px 0',
} as const;
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--color-ink-mid)' } as const;

export function SavingsGoalCalculator({ country, defaultPrincipal, defaultGoal, defaultAnnualRate }: Props) {
  const [principal, setPrincipal] = useState(defaultPrincipal);
  const [goal, setGoal] = useState(defaultGoal);
  const [rate, setRate] = useState(defaultAnnualRate * 100);
  const [monthlyContrib, setMonthlyContrib] = useState(200);
  const [maxYears, setMaxYears] = useState(30);

  const result = calculateAccumulation({
    principal,
    annualRate: rate / 100,
    compoundingFrequency: 'monthly',
    monthlyContribution: monthlyContrib,
    years: Math.max(1, Math.round(maxYears)),
  });

  // Find the first year the balance meets or exceeds the goal
  const crossingYear = result.schedule.find((row) => row.balance >= goal);

  const fmt = (v: number) => formatCurrency(v, country.currency, country.locale);
  const metricLabel = { fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 4 } as const;
  const metricValue = { fontSize: 28, fontWeight: 300, letterSpacing: '-0.03em' } as const;

  return (
    <div style={{ display: 'grid', gap: 32 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <label style={labelStyle}>Starting amount ({country.currency})</label>
          <input type="number" min="0" style={inputStyle} value={principal}
            onChange={(e) => setPrincipal(parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label style={labelStyle}>Savings goal ({country.currency})</label>
          <input type="number" min="0" style={inputStyle} value={goal}
            onChange={(e) => setGoal(parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label style={labelStyle}>Annual interest rate (%)</label>
          <input type="number" min="0" max="100" step="0.01" style={inputStyle} value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label style={labelStyle}>Monthly contribution ({country.currency})</label>
          <input type="number" min="0" style={inputStyle} value={monthlyContrib}
            onChange={(e) => setMonthlyContrib(parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label style={labelStyle}>Projection period (years)</label>
          <input type="number" min="1" max="100" style={inputStyle} value={maxYears}
            onChange={(e) => setMaxYears(parseInt(e.target.value, 10) || 1)} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
        <div>
          <div style={metricLabel}>Years to goal</div>
          <div style={metricValue}>
            {crossingYear ? `${crossingYear.year} yrs` : `>${maxYears} yrs`}
          </div>
        </div>
        <div>
          <div style={metricLabel}>Projected balance (yr {maxYears})</div>
          <div style={metricValue}>{fmt(result.finalBalance)}</div>
        </div>
        <div>
          <div style={metricLabel}>
            {result.finalBalance >= goal ? 'Surplus' : 'Shortfall'}
          </div>
          <div style={metricValue}>{fmt(Math.abs(result.finalBalance - goal))}</div>
        </div>
      </div>

      <GoalChart
        data={result.schedule.map((r) => ({ year: r.year, balance: r.balance }))}
        goal={goal}
        currency={country.currency}
        locale={country.locale}
      />
    </div>
  );
}
