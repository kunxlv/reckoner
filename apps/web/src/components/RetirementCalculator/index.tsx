'use client';
import { useState } from 'react';
import type { CountryData } from '@reckoner/finance-data';
import { calculateAccumulation, calculateDrawdown } from '@reckoner/growth-engine';
import { formatCurrency } from '../../lib/format';
import { RetirementChart } from './RetirementChart';

interface Props {
  country: CountryData;
  defaultSavings: number;
  defaultAnnualRate: number;
}

const inputStyle = {
  fontSize: 18, fontWeight: 400, border: 'none',
  borderBottom: '1px solid var(--color-ink)', background: 'transparent',
  outline: 'none', width: '100%', color: 'var(--color-ink)', padding: '4px 0',
} as const;

const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6,
  color: 'var(--color-ink-mid)',
} as const;

export function RetirementCalculator({ country, defaultSavings, defaultAnnualRate }: Props) {
  const [currentSavings, setCurrentSavings] = useState(defaultSavings);
  const [monthlyContrib, setMonthlyContrib] = useState(500);
  const [yearsToRetirement, setYearsToRetirement] = useState(25);
  const [accumRate, setAccumRate] = useState(defaultAnnualRate * 100);
  const [annualExpenses, setAnnualExpenses] = useState(defaultSavings * 0.4);
  const [yearsInRetirement, setYearsInRetirement] = useState(30);
  const [inflationRate, setInflationRate] = useState('');

  const inflation = inflationRate !== '' ? parseFloat(inflationRate) / 100 : undefined;

  const accumResult = calculateAccumulation({
    principal: currentSavings,
    annualRate: accumRate / 100,
    compoundingFrequency: 'monthly',
    monthlyContribution: monthlyContrib,
    years: Math.max(1, Math.round(yearsToRetirement)),
    ...(inflation !== undefined ? { inflationRate: inflation } : {}),
  });

  const retirementBalance = accumResult.finalBalance;

  const drawResult = calculateDrawdown({
    portfolioValue: retirementBalance,
    annualWithdrawal: annualExpenses,
    annualReturn: accumRate / 100,
    maxYears: Math.max(1, Math.round(yearsInRetirement)),
    ...(inflation !== undefined ? { inflationRate: inflation } : {}),
  });

  const fmt = (v: number) => formatCurrency(v, country.currency, country.locale);

  // Build combined chart data
  const chartData = [
    ...accumResult.schedule.map((row) => ({
      label: `Yr ${row.year}`,
      nominal: row.balance,
      ...(row.realBalance !== undefined ? { real: row.realBalance } : {}),
    })),
    ...drawResult.schedule.map((row) => ({
      label: `R+${row.year}`,
      nominal: row.portfolioValue,
      ...(row.realPortfolioValue !== undefined ? { real: row.realPortfolioValue } : {}),
    })),
  ];

  const retirementLabel = `Yr ${accumResult.schedule.length}`;

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
          <label style={labelStyle}>Monthly contribution ({country.currency})</label>
          <input type="number" min="0" style={inputStyle} value={monthlyContrib}
            onChange={(e) => setMonthlyContrib(parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label style={labelStyle}>Years to retirement</label>
          <input type="number" min="1" max="60" style={inputStyle} value={yearsToRetirement}
            onChange={(e) => setYearsToRetirement(parseInt(e.target.value, 10) || 1)} />
        </div>
        <div>
          <label style={labelStyle}>Annual investment return (%)</label>
          <input type="number" min="0" max="30" step="0.1" style={inputStyle} value={accumRate}
            onChange={(e) => setAccumRate(parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label style={labelStyle}>Annual expenses in retirement ({country.currency})</label>
          <input type="number" min="0" style={inputStyle} value={annualExpenses}
            onChange={(e) => setAnnualExpenses(parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label style={labelStyle}>Years in retirement</label>
          <input type="number" min="1" max="60" style={inputStyle} value={yearsInRetirement}
            onChange={(e) => setYearsInRetirement(parseInt(e.target.value, 10) || 1)} />
        </div>
        <div>
          <label style={labelStyle}>Inflation rate (%, optional)</label>
          <input type="number" min="0" max="20" step="0.1" style={inputStyle}
            value={inflationRate} placeholder="e.g. 2.5"
            onChange={(e) => setInflationRate(e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
        <div>
          <div style={metricLabel}>Retirement balance</div>
          <div style={metricValue}>{fmt(retirementBalance)}</div>
        </div>
        <div>
          <div style={metricLabel}>Interest earned (accumulation)</div>
          <div style={metricValue}>{fmt(accumResult.totalInterest)}</div>
        </div>
        <div>
          <div style={metricLabel}>Retirement lasts</div>
          <div style={metricValue}>
            {drawResult.yearsToDepletion === Math.max(1, Math.round(yearsInRetirement))
              ? `${drawResult.yearsToDepletion}+ yrs`
              : `${drawResult.yearsToDepletion} yrs`}
          </div>
        </div>
        {accumResult.realFinalBalance !== undefined && (
          <div>
            <div style={metricLabel}>Retirement balance (real)</div>
            <div style={metricValue}>{fmt(accumResult.realFinalBalance)}</div>
          </div>
        )}
      </div>

      <RetirementChart
        data={chartData}
        currency={country.currency}
        locale={country.locale}
        retirementLabel={retirementLabel}
      />
    </div>
  );
}
