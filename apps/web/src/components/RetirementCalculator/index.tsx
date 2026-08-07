'use client';
import { useState } from 'react';
import type { CountryData } from '@reckoner/finance-data';
import { calculateAccumulation, calculateDrawdown } from '@reckoner/growth-engine';
import { formatCurrency } from '../../lib/format';
import { FieldLabel } from '../ui/FieldLabel';
import { CurrencyInput } from '../ui/CurrencyInput';
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

export function RetirementCalculator({ country, defaultSavings, defaultAnnualRate }: Props) {
  const [currentSavings, setCurrentSavings] = useState(defaultSavings);
  const [monthlyContrib, setMonthlyContrib] = useState(500);
  const [yearsToRetirement, setYearsToRetirement] = useState(25);
  const [accumRate, setAccumRate] = useState(parseFloat((defaultAnnualRate * 100).toFixed(2)));
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
          <FieldLabel tooltip="The amount you have already saved for retirement">
            Current savings
          </FieldLabel>
          <CurrencyInput
            currencySymbol={country.currencySymbol}
            type="number" min={0} value={currentSavings}
            onChange={(e) => setCurrentSavings(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <FieldLabel tooltip="The amount you add to your retirement savings each month going forward">
            Monthly contribution
          </FieldLabel>
          <CurrencyInput
            currencySymbol={country.currencySymbol}
            type="number" min={0} value={monthlyContrib}
            onChange={(e) => setMonthlyContrib(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <FieldLabel tooltip="How many years from now until you plan to retire">
            Years to retirement
          </FieldLabel>
          <input type="number" min={1} max={60} style={inputStyle} value={yearsToRetirement}
            onChange={(e) => setYearsToRetirement(parseInt(e.target.value, 10) || 1)} />
        </div>
        <div>
          <FieldLabel tooltip="The average yearly return you expect on your investments during the accumulation phase">
            Annual investment return (%)
          </FieldLabel>
          <input type="number" min={0} max={30} step={0.1} style={inputStyle} value={accumRate}
            onChange={(e) => setAccumRate(parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <FieldLabel tooltip="Your estimated annual spending once retired — used to model how long your savings last">
            Annual expenses in retirement
          </FieldLabel>
          <CurrencyInput
            currencySymbol={country.currencySymbol}
            type="number" min={0} value={annualExpenses}
            onChange={(e) => setAnnualExpenses(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <FieldLabel tooltip="How many years you plan to spend in retirement">
            Years in retirement
          </FieldLabel>
          <input type="number" min={1} max={60} style={inputStyle} value={yearsInRetirement}
            onChange={(e) => setYearsInRetirement(parseInt(e.target.value, 10) || 1)} />
        </div>
        <div>
          <FieldLabel tooltip="Optional — models the erosion of purchasing power over time">
            Inflation rate (%, optional)
          </FieldLabel>
          <input type="number" min={0} max={20} step={0.1} style={inputStyle}
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
