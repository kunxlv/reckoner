'use client';
import { useState } from 'react';
import type { CountryData, FxResult } from '@reckoner/finance-data';
import { calculateAccumulation } from '@reckoner/growth-engine';
import { SliderInput, CurrencyToggle } from '@reckoner/ui';
import { formatCurrency } from '../../lib/format';
import { GoalChart } from './GoalChart';

interface Props {
  country: CountryData;
  defaultPrincipal: number;
  defaultGoal: number;
  defaultAnnualRate: number;
  fxResult?: (FxResult & { rates: Record<string, number> }) | null;
}

export function SavingsGoalCalculator({ country, defaultPrincipal, defaultGoal, defaultAnnualRate, fxResult }: Props) {
  const [principal, setPrincipal] = useState(defaultPrincipal);
  const [goal, setGoal] = useState(defaultGoal);
  const [rate, setRate] = useState(parseFloat((defaultAnnualRate * 100).toFixed(2)));
  const [monthlyContrib, setMonthlyContrib] = useState(200);
  const [maxYears, setMaxYears] = useState(30);
  const [fxCurrency, setFxCurrency] = useState('EUR');

  const result = calculateAccumulation({
    principal,
    annualRate: rate / 100,
    compoundingFrequency: 'monthly',
    monthlyContribution: monthlyContrib,
    years: Math.max(1, Math.round(maxYears)),
  });

  const crossingYear = result.schedule.find((row) => row.balance >= goal);

  const fmt = (v: number) => formatCurrency(v, country.currency, country.locale);

  const fxRate = fxResult?.rates?.[fxCurrency];
  const convertedBalance = fxResult && fxRate && result.finalBalance > 0
    ? formatCurrency(result.finalBalance * fxRate, fxCurrency, 'en-US') + ' ' + fxCurrency
    : null;

  const secondaries = [
    { label: 'Interest earned', value: fmt(result.totalInterest) },
    { label: `Projected balance (yr ${maxYears})`, value: fmt(result.finalBalance) },
    {
      label: result.finalBalance >= goal ? 'Surplus' : 'Shortfall',
      value: fmt(Math.abs(result.finalBalance - goal)),
    },
  ];

  return (
    <div>
      <div className="calc-panel-result" style={{ border: '1px solid var(--color-hairline)', padding: '28px 32px 24px' }}>
        <div style={{ fontSize: 12, color: 'var(--color-ink-mid)', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.06em', fontWeight: 500 }}>
          Years to goal
        </div>
        <div style={{ fontSize: 56, fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
          {crossingYear ? `${crossingYear.year} yrs` : `>${maxYears} yrs`}
        </div>
        {fxResult && (
          <div style={{ borderTop: '1px solid var(--color-hairline)', marginTop: 16, paddingTop: 16 }}>
            <CurrencyToggle convertedAmount={convertedBalance} targetCurrency={fxCurrency} rateDate={fxResult.asOf} onCurrencyChange={(c) => setFxCurrency(c)} />
          </div>
        )}
        <div className="result-stats" style={{ marginTop: 16 }}>
          {secondaries.map((m, i) => (
            <div key={m.label} className={i > 0 ? 'stat-sep' : ''}>
              <div style={{ fontSize: 11, color: 'var(--color-ink-mid)', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.06em', fontWeight: 500 }}>{m.label}</div>
              <div style={{ fontSize: 22, fontWeight: 300, letterSpacing: '-0.02em' }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="calc-panel" style={{ border: '1px solid var(--color-hairline)', padding: '28px 32px', marginTop: 24, display: 'grid', gap: 26 }}>
        <SliderInput
          label="Starting amount"
          tooltip="How much you already have saved toward this goal"
          value={principal}
          min={0}
          max={Math.max(100000, defaultPrincipal * 10)}
          step={defaultPrincipal >= 50000 ? 5000 : 1000}
          onChange={(v) => setPrincipal(v)}
          prefix={country.currencySymbol}
        />
        <SliderInput
          label="Savings goal"
          tooltip="The target balance you want to reach"
          value={goal}
          min={0}
          max={Math.max(500000, defaultGoal * 5)}
          step={defaultGoal >= 50000 ? 5000 : 1000}
          onChange={(v) => setGoal(v)}
          prefix={country.currencySymbol}
        />
        <SliderInput
          label="Annual interest rate"
          tooltip="The yearly interest or investment return on your savings"
          value={rate}
          min={0}
          max={20}
          step={0.1}
          onChange={(v) => setRate(v)}
          suffix="%"
        />
        <SliderInput
          label="Monthly contribution"
          tooltip="How much you add each month to work toward your goal"
          value={monthlyContrib}
          min={0}
          max={5000}
          step={50}
          onChange={(v) => setMonthlyContrib(v)}
          prefix={country.currencySymbol}
        />
        <SliderInput
          label="Projection period"
          tooltip="The maximum number of years to model  -  shows whether and when you hit your goal"
          value={maxYears}
          min={1}
          max={50}
          step={1}
          onChange={(v) => setMaxYears(v)}
          suffix=" yr"
        />
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
