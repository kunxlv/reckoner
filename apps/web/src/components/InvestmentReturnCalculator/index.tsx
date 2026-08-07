'use client';
import { useState } from 'react';
import type { CountryData, FxResult } from '@reckoner/finance-data';
import { calculateCAGR, calculateAccumulation } from '@reckoner/growth-engine';
import { SliderInput, SegmentedControl, CurrencyToggle } from '@reckoner/ui';
import { formatCurrency } from '../../lib/format';
import { ReturnChart } from './ReturnChart';

interface Props {
  country: CountryData;
  defaultInitialValue: number;
  defaultAnnualRate: number;
  fxResult?: (FxResult & { rates: Record<string, number> }) | null;
}

type Mode = 'find-cagr' | 'project';

const MODE_OPTIONS = [
  { label: 'Find CAGR', value: 'find-cagr' as Mode },
  { label: 'Project growth', value: 'project' as Mode },
];

export function InvestmentReturnCalculator({ country, defaultInitialValue, defaultAnnualRate, fxResult }: Props) {
  const [mode, setMode] = useState<Mode>('find-cagr');
  const [fxCurrency, setFxCurrency] = useState('EUR');

  // Find CAGR mode state
  const [initialValue, setInitialValue] = useState(defaultInitialValue);
  const [finalValue, setFinalValue] = useState(defaultInitialValue * 2);
  const [cagrYears, setCagrYears] = useState(10);

  // Project mode state
  const [projectInitial, setProjectInitial] = useState(defaultInitialValue);
  const [projectCagr, setProjectCagr] = useState(parseFloat((defaultAnnualRate * 100).toFixed(2)));
  const [projectYears, setProjectYears] = useState(10);

  const cagrResult = calculateCAGR({
    initialValue,
    finalValue,
    years: Math.max(1, Math.round(cagrYears)),
  });

  const projResult = calculateAccumulation({
    principal: projectInitial,
    annualRate: projectCagr / 100,
    compoundingFrequency: 'monthly',
    years: Math.max(1, Math.round(projectYears)),
  });

  const fmt = (v: number) => formatCurrency(v, country.currency, country.locale);

  const fxRate = fxResult?.rates?.[fxCurrency];
  const convertedProjBalance = fxResult && fxRate && mode === 'project' && projResult.finalBalance > 0
    ? formatCurrency(projResult.finalBalance * fxRate, fxCurrency, 'en-US') + ' ' + fxCurrency
    : null;

  const initialValueMax = Math.max(100000, defaultInitialValue * 5);
  const initialValueStep = defaultInitialValue >= 100000 ? 5000 : 1000;
  const finalValueMax = Math.max(1000000, defaultInitialValue * 20);
  const finalValueStep = defaultInitialValue >= 100000 ? 10000 : 1000;

  const findCagrSecondaries = [
    { label: 'Total return', value: (cagrResult.totalReturnPercent * 100).toFixed(1) + '%' },
    { label: 'Absolute gain', value: fmt(cagrResult.absoluteGain) },
    { label: 'Period', value: cagrYears + ' yrs' },
  ];

  const projectSecondaries = [
    { label: 'Total gain', value: fmt(projResult.totalInterest) },
    { label: 'Multiplier', value: projectInitial > 0 ? (projResult.finalBalance / projectInitial).toFixed(2) + '×' : ' - ' },
    { label: 'Period', value: projectYears + ' yrs' },
  ];

  const secondaries = mode === 'find-cagr' ? findCagrSecondaries : projectSecondaries;

  const chartData = mode === 'find-cagr'
    ? Array.from({ length: Math.max(1, Math.round(cagrYears)) + 1 }, (_, i) => ({
        year: i,
        value: initialValue * Math.pow(1 + cagrResult.cagr, i),
      }))
    : [{ year: 0, value: projectInitial }, ...projResult.schedule.map((r) => ({ year: r.year, value: r.balance }))];

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <SegmentedControl
        label="Mode"
        tooltip="Choose whether to calculate the return rate from known start/end values, or project growth at a given rate"
        options={MODE_OPTIONS}
        value={mode}
        onChange={(v) => setMode(v as Mode)}
      />

      <div className="calc-panel-result" style={{ border: '1px solid var(--color-hairline)', padding: '28px 32px 24px' }}>
        <div style={{ fontSize: 12, color: 'var(--color-ink-mid)', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.06em', fontWeight: 500 }}>
          {mode === 'find-cagr' ? 'CAGR' : 'Projected value'}
        </div>
        <div style={{ fontSize: 56, fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
          {mode === 'find-cagr'
            ? (cagrResult.cagr * 100).toFixed(2) + '%'
            : fmt(projResult.finalBalance)}
        </div>
        {fxResult && mode === 'project' && (
          <div style={{ borderTop: '1px solid var(--color-hairline)', marginTop: 16, paddingTop: 16 }}>
            <CurrencyToggle convertedAmount={convertedProjBalance} targetCurrency={fxCurrency} rateDate={fxResult.asOf} onCurrencyChange={(c) => setFxCurrency(c)} />
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

      <div className="calc-panel" style={{ border: '1px solid var(--color-hairline)', padding: '28px 32px', display: 'grid', gap: 26 }}>
        {mode === 'find-cagr' ? (
          <>
            <SliderInput
              label="Initial value"
              tooltip="The value of the investment at the start of the period"
              value={initialValue}
              min={100}
              max={initialValueMax}
              step={initialValueStep}
              onChange={(v) => setInitialValue(v)}
              prefix={country.currencySymbol}
            />
            <SliderInput
              label="Final value"
              tooltip="The value of the investment at the end of the period"
              value={finalValue}
              min={100}
              max={finalValueMax}
              step={finalValueStep}
              onChange={(v) => setFinalValue(v)}
              prefix={country.currencySymbol}
            />
            <SliderInput
              label="Years"
              tooltip="The length of the investment period in years"
              value={cagrYears}
              min={1}
              max={50}
              step={1}
              onChange={(v) => setCagrYears(v)}
              suffix=" yr"
            />
          </>
        ) : (
          <>
            <SliderInput
              label="Starting value"
              tooltip="The initial amount you invest"
              value={projectInitial}
              min={100}
              max={initialValueMax}
              step={initialValueStep}
              onChange={(v) => setProjectInitial(v)}
              prefix={country.currencySymbol}
            />
            <SliderInput
              label="CAGR"
              tooltip="Compound Annual Growth Rate  -  the constant yearly return used to project future value"
              value={projectCagr}
              min={0}
              max={30}
              step={0.1}
              onChange={(v) => setProjectCagr(v)}
              suffix="%"
            />
            <SliderInput
              label="Years"
              tooltip="How many years into the future to project the investment"
              value={projectYears}
              min={1}
              max={50}
              step={1}
              onChange={(v) => setProjectYears(v)}
              suffix=" yr"
            />
          </>
        )}
      </div>

      <ReturnChart
        data={chartData}
        currency={country.currency}
        locale={country.locale}
      />
    </div>
  );
}
