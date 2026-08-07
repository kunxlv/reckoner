'use client';
import { useState } from 'react';
import type { CountryData, FxResult } from '@reckoner/finance-data';
import { calculateAccumulation, calculateDrawdown } from '@reckoner/growth-engine';
import { SliderInput, Disclosure, CurrencyToggle } from '@reckoner/ui';
import { formatCurrency } from '../../lib/format';
import { RetirementChart } from './RetirementChart';

interface Props {
  country: CountryData;
  defaultSavings: number;
  defaultAnnualRate: number;
  fxResult?: (FxResult & { rates: Record<string, number> }) | null;
}

export function RetirementCalculator({ country, defaultSavings, defaultAnnualRate, fxResult }: Props) {
  const [currentSavings, setCurrentSavings] = useState(defaultSavings);
  const [monthlyContrib, setMonthlyContrib] = useState(500);
  const [yearsToRetirement, setYearsToRetirement] = useState(25);
  const [accumRate, setAccumRate] = useState(parseFloat((defaultAnnualRate * 100).toFixed(2)));
  const [annualExpenses, setAnnualExpenses] = useState(Math.round(defaultSavings * 0.4));
  const [yearsInRetirement, setYearsInRetirement] = useState(30);
  const [inflationRate, setInflationRate] = useState('');
  const [fxCurrency, setFxCurrency] = useState('EUR');

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

  const fxRate = fxResult?.rates?.[fxCurrency];
  const convertedBalance = fxResult && fxRate && retirementBalance > 0
    ? formatCurrency(retirementBalance * fxRate, fxCurrency, 'en-US') + ' ' + fxCurrency
    : null;

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

  const secondaries = [
    { label: 'Interest earned', value: fmt(accumResult.totalInterest) },
    {
      label: 'Retirement lasts',
      value: drawResult.yearsToDepletion === Math.max(1, Math.round(yearsInRetirement))
        ? `${drawResult.yearsToDepletion}+ yrs`
        : `${drawResult.yearsToDepletion} yrs`,
    },
    {
      label: 'Real balance',
      value: accumResult.realFinalBalance !== undefined ? fmt(accumResult.realFinalBalance) : '–',
    },
  ];

  return (
    <div>
      <div className="calc-panel-result" style={{ border: '1px solid var(--color-hairline)', padding: '28px 32px 24px' }}>
        <div style={{ fontSize: 12, color: 'var(--color-ink-mid)', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.06em', fontWeight: 500 }}>
          Retirement balance
        </div>
        <div style={{ fontSize: 56, fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
          {fmt(retirementBalance)}
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
          label="Current savings"
          tooltip="The amount you have already saved for retirement"
          value={currentSavings}
          min={0}
          max={Math.max(500000, defaultSavings * 10)}
          step={defaultSavings >= 100000 ? 5000 : 1000}
          onChange={(v) => setCurrentSavings(v)}
          prefix={country.currencySymbol}
        />
        <SliderInput
          label="Monthly contribution"
          tooltip="The amount you add to your retirement savings each month going forward"
          value={monthlyContrib}
          min={0}
          max={5000}
          step={50}
          onChange={(v) => setMonthlyContrib(v)}
          prefix={country.currencySymbol}
        />
        <SliderInput
          label="Years to retirement"
          tooltip="How many years from now until you plan to retire"
          value={yearsToRetirement}
          min={1}
          max={50}
          step={1}
          onChange={(v) => setYearsToRetirement(v)}
          suffix=" yr"
        />
        <SliderInput
          label="Annual return"
          tooltip="The average yearly return you expect on your investments during the accumulation phase"
          value={accumRate}
          min={0}
          max={20}
          step={0.1}
          onChange={(v) => setAccumRate(v)}
          suffix="%"
        />
        <SliderInput
          label="Annual expenses in retirement"
          tooltip="Your estimated annual spending once retired  -  used to model how long your savings last"
          value={annualExpenses}
          min={0}
          max={Math.max(200000, Math.round(defaultSavings * 0.4) * 5)}
          step={defaultSavings >= 500000 ? 10000 : 1000}
          onChange={(v) => setAnnualExpenses(v)}
          prefix={country.currencySymbol}
        />
        <SliderInput
          label="Years in retirement"
          tooltip="How many years you plan to spend in retirement"
          value={yearsInRetirement}
          min={5}
          max={50}
          step={1}
          onChange={(v) => setYearsInRetirement(v)}
          suffix=" yr"
        />
        <Disclosure trigger="Add inflation adjustment" helper="Models real purchasing power">
          <div style={{ display: 'grid', gap: 26 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, display: 'block', marginBottom: 8 }}>
                Inflation rate (%)
              </label>
              <input
                type="number"
                min={0}
                max={20}
                step={0.1}
                value={inflationRate}
                placeholder="e.g. 2.5"
                onChange={(e) => setInflationRate(e.target.value)}
                style={{
                  fontSize: 16, border: '1px solid var(--color-hairline)',
                  background: 'var(--color-canvas)', outline: 'none',
                  width: '100%', color: 'var(--color-ink)', padding: '8px 12px',
                  boxSizing: 'border-box' as const,
                }}
              />
            </div>
          </div>
        </Disclosure>
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
