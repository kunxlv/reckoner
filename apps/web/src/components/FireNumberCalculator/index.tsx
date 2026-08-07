'use client';
import { useState } from 'react';
import type { CountryData, FxResult } from '@reckoner/finance-data';
import { calculateAccumulation } from '@reckoner/growth-engine';
import { SliderInput, CurrencyToggle } from '@reckoner/ui';
import { formatCurrency } from '../../lib/format';
import { FireChart } from './FireChart';

interface Props {
  country: CountryData;
  defaultCurrentSavings: number;
  defaultAnnualRate: number;
  fxResult?: (FxResult & { rates: Record<string, number> }) | null;
}

export function FireNumberCalculator({ country, defaultCurrentSavings, defaultAnnualRate, fxResult }: Props) {
  const [currentSavings, setCurrentSavings] = useState(defaultCurrentSavings);
  const [annualExpenses, setAnnualExpenses] = useState(40000);
  const [withdrawalRate, setWithdrawalRate] = useState(4);
  const [monthlyContrib, setMonthlyContrib] = useState(1000);
  const [annualReturn, setAnnualReturn] = useState(parseFloat((defaultAnnualRate * 100).toFixed(2)));
  const [fxCurrency, setFxCurrency] = useState('EUR');

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

  const fxRate = fxResult?.rates?.[fxCurrency];
  const convertedFireNumber = fxResult && fxRate && fireNumber > 0
    ? formatCurrency(fireNumber * fxRate, fxCurrency, 'en-US') + ' ' + fxCurrency
    : null;

  const secondaries = [
    { label: 'Years to FIRE', value: crossingRow ? `${crossingRow.year} yrs` : '>60 yrs' },
    { label: 'Current gap', value: fmt(Math.max(0, fireNumber - currentSavings)) },
    { label: 'Monthly income at FIRE', value: fmt(fireNumber * (withdrawalRate / 100) / 12) },
  ];

  return (
    <div>
      <div className="calc-panel-result" style={{ border: '1px solid var(--color-hairline)', padding: '28px 32px 24px' }}>
        <div style={{ fontSize: 12, color: 'var(--color-ink-mid)', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.06em', fontWeight: 500 }}>
          FIRE number
        </div>
        <div style={{ fontSize: 56, fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
          {fmt(fireNumber)}
        </div>
        {fxResult && (
          <div style={{ borderTop: '1px solid var(--color-hairline)', marginTop: 16, paddingTop: 16 }}>
            <CurrencyToggle convertedAmount={convertedFireNumber} targetCurrency={fxCurrency} rateDate={fxResult.asOf} onCurrencyChange={(c) => setFxCurrency(c)} />
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
          tooltip="How much you have already saved toward financial independence"
          value={currentSavings}
          min={0}
          max={Math.max(500000, defaultCurrentSavings * 10)}
          step={defaultCurrentSavings >= 100000 ? 5000 : 1000}
          onChange={(v) => setCurrentSavings(v)}
          prefix={country.currencySymbol}
        />
        <SliderInput
          label="Annual expenses"
          tooltip="The yearly amount you plan to spend once you stop working  -  the lower this is, the sooner you reach FIRE"
          value={annualExpenses}
          min={0}
          max={200000}
          step={1000}
          onChange={(v) => setAnnualExpenses(v)}
          prefix={country.currencySymbol}
        />
        <SliderInput
          label="Withdrawal rate"
          tooltip="The percentage of your portfolio you withdraw each year  -  4% is the classic rule of thumb from the Trinity Study"
          value={withdrawalRate}
          min={1}
          max={10}
          step={0.1}
          onChange={(v) => setWithdrawalRate(v)}
          suffix="%"
        />
        <SliderInput
          label="Monthly contribution"
          tooltip="How much you add to your savings each month until you reach your FIRE number"
          value={monthlyContrib}
          min={0}
          max={10000}
          step={100}
          onChange={(v) => setMonthlyContrib(v)}
          prefix={country.currencySymbol}
        />
        <SliderInput
          label="Expected annual return"
          tooltip="Average yearly investment return during your accumulation phase"
          value={annualReturn}
          min={0}
          max={20}
          step={0.1}
          onChange={(v) => setAnnualReturn(v)}
          suffix="%"
        />
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
