'use client';
import { useState } from 'react';
import type { CountryData } from '@reckoner/finance-data';
import { calculateAccumulation } from '@reckoner/growth-engine';
import { formatCurrency } from '../../lib/format';
import { FieldLabel } from '../ui/FieldLabel';
import { CurrencyInput } from '../ui/CurrencyInput';
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

export function SavingsGoalCalculator({ country, defaultPrincipal, defaultGoal, defaultAnnualRate }: Props) {
  const [principal, setPrincipal] = useState(defaultPrincipal);
  const [goal, setGoal] = useState(defaultGoal);
  const [rate, setRate] = useState(parseFloat((defaultAnnualRate * 100).toFixed(2)));
  const [monthlyContrib, setMonthlyContrib] = useState(200);
  const [maxYears, setMaxYears] = useState(30);

  const result = calculateAccumulation({
    principal,
    annualRate: rate / 100,
    compoundingFrequency: 'monthly',
    monthlyContribution: monthlyContrib,
    years: Math.max(1, Math.round(maxYears)),
  });

  const crossingYear = result.schedule.find((row) => row.balance >= goal);

  const fmt = (v: number) => formatCurrency(v, country.currency, country.locale);
  const metricLabel = { fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 4 } as const;
  const metricValue = { fontSize: 28, fontWeight: 300, letterSpacing: '-0.03em' } as const;

  return (
    <div style={{ display: 'grid', gap: 32 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <FieldLabel tooltip="How much you already have saved toward this goal">
            Starting amount
          </FieldLabel>
          <CurrencyInput
            currencySymbol={country.currencySymbol}
            type="number" min={0} value={principal}
            onChange={(e) => setPrincipal(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <FieldLabel tooltip="The target balance you want to reach">
            Savings goal
          </FieldLabel>
          <CurrencyInput
            currencySymbol={country.currencySymbol}
            type="number" min={0} value={goal}
            onChange={(e) => setGoal(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <FieldLabel tooltip="The yearly interest or investment return on your savings">
            Annual interest rate (%)
          </FieldLabel>
          <input type="number" min={0} max={100} step={0.01} style={inputStyle} value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <FieldLabel tooltip="How much you add each month to work toward your goal">
            Monthly contribution
          </FieldLabel>
          <CurrencyInput
            currencySymbol={country.currencySymbol}
            type="number" min={0} value={monthlyContrib}
            onChange={(e) => setMonthlyContrib(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <FieldLabel tooltip="The maximum number of years to model — shows whether and when you hit your goal">
            Projection period (years)
          </FieldLabel>
          <input type="number" min={1} max={100} style={inputStyle} value={maxYears}
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
