'use client';
import { useState } from 'react';
import type { CountryData } from '@reckoner/finance-data';
import { calculateCAGR, calculateAccumulation } from '@reckoner/growth-engine';
import { formatCurrency } from '../../lib/format';
import { ReturnChart } from './ReturnChart';

interface Props {
  country: CountryData;
  defaultInitialValue: number;
  defaultAnnualRate: number;
}

type Mode = 'find-cagr' | 'project';

const inputStyle = {
  fontSize: 18, fontWeight: 400, border: 'none', borderBottom: '1px solid var(--color-ink)',
  background: 'transparent', outline: 'none', width: '100%', color: 'var(--color-ink)', padding: '4px 0',
} as const;
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--color-ink-mid)' } as const;

export function InvestmentReturnCalculator({ country, defaultInitialValue, defaultAnnualRate }: Props) {
  const [mode, setMode] = useState<Mode>('find-cagr');

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
  const metricLabel = { fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 4 } as const;
  const metricValue = { fontSize: 28, fontWeight: 300, letterSpacing: '-0.03em' } as const;

  const tabStyle = (active: boolean) => ({
    padding: '8px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer',
    border: '1px solid var(--color-hairline)', background: active ? 'var(--color-ink)' : 'transparent',
    color: active ? 'var(--color-canvas)' : 'var(--color-ink)',
  } as const);

  // Build chart data
  const chartData = mode === 'find-cagr'
    ? Array.from({ length: Math.max(1, Math.round(cagrYears)) + 1 }, (_, i) => ({
        year: i,
        value: initialValue * Math.pow(1 + cagrResult.cagr, i),
      }))
    : [{ year: 0, value: projectInitial }, ...projResult.schedule.map((r) => ({ year: r.year, value: r.balance }))];

  return (
    <div style={{ display: 'grid', gap: 32 }}>
      <div style={{ display: 'flex', gap: 0 }}>
        <button type="button" style={tabStyle(mode === 'find-cagr')} onClick={() => setMode('find-cagr')}>
          Find CAGR
        </button>
        <button type="button" style={tabStyle(mode === 'project')} onClick={() => setMode('project')}>
          Project growth
        </button>
      </div>

      {mode === 'find-cagr' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <label style={labelStyle}>Initial value ({country.currency})</label>
            <input type="number" min="0.01" style={inputStyle} value={initialValue}
              onChange={(e) => setInitialValue(parseFloat(e.target.value) || 1)} />
          </div>
          <div>
            <label style={labelStyle}>Final value ({country.currency})</label>
            <input type="number" min="0.01" style={inputStyle} value={finalValue}
              onChange={(e) => setFinalValue(parseFloat(e.target.value) || 1)} />
          </div>
          <div>
            <label style={labelStyle}>Years</label>
            <input type="number" min="1" max="100" style={inputStyle} value={cagrYears}
              onChange={(e) => setCagrYears(parseInt(e.target.value, 10) || 1)} />
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <label style={labelStyle}>Starting value ({country.currency})</label>
            <input type="number" min="0" style={inputStyle} value={projectInitial}
              onChange={(e) => setProjectInitial(parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label style={labelStyle}>CAGR (%)</label>
            <input type="number" min="0" max="100" step="0.1" style={inputStyle} value={projectCagr}
              onChange={(e) => setProjectCagr(parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label style={labelStyle}>Years</label>
            <input type="number" min="1" max="100" style={inputStyle} value={projectYears}
              onChange={(e) => setProjectYears(parseInt(e.target.value, 10) || 1)} />
          </div>
        </div>
      )}

      {mode === 'find-cagr' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
          <div>
            <div style={metricLabel}>CAGR</div>
            <div style={metricValue}>{(cagrResult.cagr * 100).toFixed(2)}%</div>
          </div>
          <div>
            <div style={metricLabel}>Total return</div>
            <div style={metricValue}>{(cagrResult.totalReturnPercent * 100).toFixed(1)}%</div>
          </div>
          <div>
            <div style={metricLabel}>Absolute gain</div>
            <div style={metricValue}>{fmt(cagrResult.absoluteGain)}</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
          <div>
            <div style={metricLabel}>Projected final value</div>
            <div style={metricValue}>{fmt(projResult.finalBalance)}</div>
          </div>
          <div>
            <div style={metricLabel}>Total gain</div>
            <div style={metricValue}>{fmt(projResult.totalInterest)}</div>
          </div>
          <div>
            <div style={metricLabel}>Multiplier</div>
            <div style={metricValue}>
              {projectInitial > 0 ? `${(projResult.finalBalance / projectInitial).toFixed(2)}×` : '—'}
            </div>
          </div>
        </div>
      )}

      <ReturnChart
        data={chartData}
        currency={country.currency}
        locale={country.locale}
      />
    </div>
  );
}
