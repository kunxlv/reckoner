'use client';
import { useState } from 'react';
import type { CountryData, FxResult } from '@reckoner/finance-data';
import { calculateAccumulation } from '@reckoner/growth-engine';
import { SliderInput, SegmentedControl, Disclosure, CurrencyToggle } from '@reckoner/ui';
import { formatCurrency } from '../../lib/format';
import { GrowthChart } from './GrowthChart';

interface Props {
  country: CountryData;
  defaultPrincipal: number;
  defaultAnnualRate: number;
  fxResult?: (FxResult & { rates: Record<string, number> }) | null;
}

type Frequency = 'monthly' | 'quarterly' | 'annually' | 'continuous';

const FREQUENCY_OPTIONS: { label: string; value: Frequency }[] = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Annually', value: 'annually' },
  { label: 'Continuous', value: 'continuous' },
];

export function CompoundInterestCalculator({ country, defaultPrincipal, defaultAnnualRate, fxResult }: Props) {
  const [principal, setPrincipal] = useState(defaultPrincipal);
  const [rate, setRate] = useState(parseFloat((defaultAnnualRate * 100).toFixed(2)));
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [monthlyContribution, setMonthlyContribution] = useState(0);
  const [years, setYears] = useState(10);
  const [inflationRate, setInflationRate] = useState('');
  const [fxCurrency, setFxCurrency] = useState('EUR');

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

  const fxRate = fxResult?.rates?.[fxCurrency];
  const convertedBalance = fxResult && fxRate && result.finalBalance > 0
    ? formatCurrency(result.finalBalance * fxRate, fxCurrency, 'en-US') + ' ' + fxCurrency
    : null;

  const principalMax = Math.max(100000, defaultPrincipal * 10);
  const principalStep = defaultPrincipal >= 100000 ? 5000 : 1000;
  const contributionMax = Math.max(5000, defaultPrincipal / 10);

  const secondaries = [
    { label: 'Total contributed', value: fmt(result.totalContributed) },
    { label: 'Interest earned', value: fmt(result.totalInterest) },
    { label: 'Real balance', value: result.realFinalBalance !== undefined ? fmt(result.realFinalBalance) : ' - ' },
  ];

  return (
    <div>
      {/* Result card */}
      <div className="calc-panel-result" style={{ border: '1px solid var(--color-hairline)', padding: '28px 32px 24px' }}>
        <div style={{ fontSize: 12, color: 'var(--color-ink-mid)', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.06em', fontWeight: 500 }}>
          Final balance
        </div>
        <div style={{ fontSize: 56, fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
          {fmt(result.finalBalance)}
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

      {/* Input panel */}
      <div className="calc-panel" style={{ border: '1px solid var(--color-hairline)', padding: '28px 32px', marginTop: 24, display: 'grid', gap: 26 }}>
        <SliderInput
          label="Starting amount"
          tooltip="The lump sum you invest or deposit today"
          value={principal}
          min={0}
          max={principalMax}
          step={principalStep}
          onChange={(v) => setPrincipal(v)}
          prefix={country.currencySymbol}
        />
        <SliderInput
          label="Annual interest rate"
          tooltip="The yearly interest rate applied to your balance"
          value={rate}
          min={0}
          max={30}
          step={0.1}
          onChange={(v) => setRate(v)}
          suffix="%"
        />
        <SegmentedControl
          label="Compounding"
          tooltip="How often earned interest is added back to your principal  -  more frequent compounds faster"
          options={FREQUENCY_OPTIONS}
          value={frequency}
          onChange={(v) => setFrequency(v as Frequency)}
        />
        <SliderInput
          label="Monthly contribution"
          tooltip="A fixed amount added to your investment each month"
          value={monthlyContribution}
          min={0}
          max={contributionMax}
          step={50}
          onChange={(v) => setMonthlyContribution(v)}
          prefix={country.currencySymbol}
        />
        <SliderInput
          label="Years"
          tooltip="The total duration of the investment or savings period"
          value={years}
          min={1}
          max={50}
          step={1}
          onChange={(v) => setYears(v)}
          suffix=" yr"
        />
        <Disclosure trigger="Add inflation adjustment" helper="Adjusts results to real purchasing power">
          <div style={{ paddingTop: 18 }}>
            <div style={{ fontSize: 12, color: 'var(--color-ink-mid)', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.06em', fontWeight: 500 }}>Inflation rate (%)</div>
            <input
              type="number"
              min={0}
              max={20}
              step={0.1}
              placeholder="e.g. 2.5"
              value={inflationRate}
              onChange={(e) => setInflationRate(e.target.value)}
              style={{ fontSize: 18, border: 'none', borderBottom: '1px solid var(--color-ink)', background: 'transparent', outline: 'none', width: '100%', color: 'var(--color-ink)', padding: '4px 0' }}
            />
          </div>
        </Disclosure>
      </div>

      {/* Chart */}
      <GrowthChart
        schedule={result.schedule}
        principal={principal}
        currency={country.currency}
        locale={country.locale}
      />
    </div>
  );
}
