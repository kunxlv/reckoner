'use client';
import { useState } from 'react';
import type { CountryData } from '@reckoner/finance-data';
import { calculateAccumulation } from '@reckoner/growth-engine';
import { formatCurrency } from '../../lib/format';
import { GrowthChart } from './GrowthChart';

interface Props {
  country: CountryData;
  defaultPrincipal: number;
  defaultAnnualRate: number;
}

type Frequency = 'monthly' | 'quarterly' | 'annually' | 'continuous';

const inputStyle = {
  fontSize: 18, fontWeight: 400, border: 'none',
  borderBottom: '1px solid var(--color-ink)', background: 'transparent',
  outline: 'none', width: '100%', color: 'var(--color-ink)', padding: '4px 0',
} as const;

const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6,
  color: 'var(--color-ink-mid)',
} as const;

export function CompoundInterestCalculator({ country, defaultPrincipal, defaultAnnualRate }: Props) {
  const [principal, setPrincipal] = useState(defaultPrincipal);
  const [rate, setRate] = useState(defaultAnnualRate * 100); // displayed as %
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [monthlyContribution, setMonthlyContribution] = useState(0);
  const [years, setYears] = useState(10);
  const [inflationRate, setInflationRate] = useState(''); // empty = not provided

  const inflation = inflationRate !== '' ? parseFloat(inflationRate) / 100 : undefined;

  const result = calculateAccumulation({
    principal,
    annualRate: rate / 100,
    compoundingFrequency: frequency,
    monthlyContribution,
    years: Math.max(1, Math.round(years)),
    ...(inflation !== undefined ? { inflationRate: inflation } : {}),
  });

  const fmt = (v: number) => formatCurrency(v, country.currency, country.locale);

  const metricLabel = { fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 4 } as const;
  const metricValue = { fontSize: 28, fontWeight: 300, letterSpacing: '-0.03em' } as const;

  return (
    <div style={{ display: 'grid', gap: 32 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <label style={labelStyle}>Starting amount ({country.currency})</label>
          <input
            type="number" min="0" style={inputStyle} value={principal}
            onChange={(e) => setPrincipal(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label style={labelStyle}>Annual interest rate (%)</label>
          <input
            type="number" min="0" max="100" step="0.01" style={inputStyle} value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label style={labelStyle}>Compounding frequency</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as Frequency)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annually">Annually</option>
            <option value="continuous">Continuous</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Monthly contribution ({country.currency})</label>
          <input
            type="number" min="0" style={inputStyle} value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label style={labelStyle}>Years</label>
          <input
            type="number" min="1" max="100" step="1" style={inputStyle} value={years}
            onChange={(e) => setYears(parseInt(e.target.value, 10) || 1)}
          />
        </div>
        <div>
          <label style={labelStyle}>Inflation rate (%, optional)</label>
          <input
            type="number" min="0" max="20" step="0.1" style={inputStyle}
            value={inflationRate} placeholder="e.g. 2.5"
            onChange={(e) => setInflationRate(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
        <div>
          <div style={metricLabel}>Final balance</div>
          <div style={metricValue}>{fmt(result.finalBalance)}</div>
        </div>
        <div>
          <div style={metricLabel}>Total contributed</div>
          <div style={metricValue}>{fmt(result.totalContributed)}</div>
        </div>
        <div>
          <div style={metricLabel}>Interest earned</div>
          <div style={metricValue}>{fmt(result.totalInterest)}</div>
        </div>
        {result.realFinalBalance !== undefined && (
          <div>
            <div style={metricLabel}>Real balance (inflation-adjusted)</div>
            <div style={metricValue}>{fmt(result.realFinalBalance)}</div>
          </div>
        )}
      </div>

      <GrowthChart
        schedule={result.schedule}
        principal={principal}
        currency={country.currency}
        locale={country.locale}
      />
    </div>
  );
}
