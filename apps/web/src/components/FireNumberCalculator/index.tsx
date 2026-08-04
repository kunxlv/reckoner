'use client';
import { useState } from 'react';
import type { CountryData } from '@reckoner/finance-data';
import { calculateAccumulation } from '@reckoner/growth-engine';
import { formatCurrency } from '../../lib/format';
import { FireChart } from './FireChart';

interface Props {
  country: CountryData;
  defaultCurrentSavings: number;
  defaultAnnualRate: number;
}

const inputStyle = {
  fontSize: 18, fontWeight: 400, border: 'none', borderBottom: '1px solid var(--color-ink)',
  background: 'transparent', outline: 'none', width: '100%', color: 'var(--color-ink)', padding: '4px 0',
} as const;
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--color-ink-mid)' } as const;

export function FireNumberCalculator({ country, defaultCurrentSavings, defaultAnnualRate }: Props) {
  const [currentSavings, setCurrentSavings] = useState(defaultCurrentSavings);
  const [annualExpenses, setAnnualExpenses] = useState(40000);
  const [withdrawalRate, setWithdrawalRate] = useState(4); // as %
  const [monthlyContrib, setMonthlyContrib] = useState(1000);
  const [annualReturn, setAnnualReturn] = useState(defaultAnnualRate * 100);

  const fireNumber = annualExpenses / (withdrawalRate / 100);

  const result = calculateAccumulation({
    principal: currentSavings,
    annualRate: annualReturn / 100,
    compoundingFrequency: 'monthly',
    monthlyContribution: monthlyContrib,
    years: 60,
  });

  const crossingRow = result.schedule.find((row) => row.balance >= fireNumber);

  const fmt = (v: number) => formatCurrency(v, country.currency, country.locale);
  const metricLabel = { fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 4 } as const;
  const metricValue = { fontSize: 28, fontWeight: 300, letterSpacing: '-0.03em' } as const;

  return (
    <div style={{ display: 'grid', gap: 32 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <label style={labelStyle}>Current savings ({country.currency})</label>
          <input type="number" min="0" style={inputStyle} value={currentSavings}
            onChange={(e) => setCurrentSavings(parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label style={labelStyle}>Annual expenses in retirement ({country.currency})</label>
          <input type="number" min="0" style={inputStyle} value={annualExpenses}
            onChange={(e) => setAnnualExpenses(parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label style={labelStyle}>Withdrawal rate (%)</label>
          <input type="number" min="0.1" max="20" step="0.1" style={inputStyle} value={withdrawalRate}
            onChange={(e) => setWithdrawalRate(parseFloat(e.target.value) || 4)} />
        </div>
        <div>
          <label style={labelStyle}>Monthly savings contribution ({country.currency})</label>
          <input type="number" min="0" style={inputStyle} value={monthlyContrib}
            onChange={(e) => setMonthlyContrib(parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label style={labelStyle}>Expected annual return (%)</label>
          <input type="number" min="0" max="30" step="0.1" style={inputStyle} value={annualReturn}
            onChange={(e) => setAnnualReturn(parseFloat(e.target.value) || 0)} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
        <div>
          <div style={metricLabel}>FIRE number</div>
          <div style={metricValue}>{fmt(fireNumber)}</div>
        </div>
        <div>
          <div style={metricLabel}>Years to FIRE</div>
          <div style={metricValue}>{crossingRow ? `${crossingRow.year} yrs` : '>60 yrs'}</div>
        </div>
        <div>
          <div style={metricLabel}>{currentSavings >= fireNumber ? 'Already there!' : 'Gap'}</div>
          <div style={metricValue}>{fmt(Math.max(0, fireNumber - currentSavings))}</div>
        </div>
      </div>

      <FireChart
        data={result.schedule.map((r) => ({ year: r.year, balance: r.balance }))}
        fireNumber={fireNumber}
        currency={country.currency}
        locale={country.locale}
      />
    </div>
  );
}
