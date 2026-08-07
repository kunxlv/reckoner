'use client';
import { useState } from 'react';
import type { CountryData, FxResult } from '@reckoner/finance-data';
import { calculateDebtStrategy } from '@reckoner/debt-strategy-engine';
import type { Debt } from '@reckoner/debt-strategy-engine';
import { CurrencyToggle } from '@reckoner/ui';
import { formatCurrency } from '../../lib/format';
import { StrategyChart } from './StrategyChart';

interface Props {
  country: CountryData;
  defaultDebts: Debt[];
  defaultExtraMonthlyCents: number;
  fxResult?: (FxResult & { rates: Record<string, number> }) | null;
}

const labelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 500,
  marginBottom: 4,
  color: 'var(--color-ink-mid)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
};

const inputStyle = {
  fontSize: 15,
  fontWeight: 400,
  border: 'none',
  borderBottom: '1px solid var(--color-ink)',
  background: 'transparent',
  outline: 'none',
  width: '100%',
  color: 'var(--color-ink)',
  padding: '4px 0',
} as const;

export function DebtStrategyCalculator({ country, defaultDebts, defaultExtraMonthlyCents, fxResult }: Props) {
  const [debts, setDebts] = useState<Debt[]>(defaultDebts);
  const [extraMonthlyCents, setExtraMonthlyCents] = useState(defaultExtraMonthlyCents);
  const [fxCurrency, setFxCurrency] = useState('EUR');

  const fmtCents = (c: number) => formatCurrency(c / 100, country.currency, country.locale);
  const fmt = (v: number) => formatCurrency(v, country.currency, country.locale);

  const updateDebt = (idx: number, field: keyof Debt, value: string | number) => {
    setDebts((prev) => prev.map((d, i) => (i === idx ? { ...d, [field]: value } : d)));
  };

  const addDebt = () => {
    if (debts.length >= 5) return;
    setDebts((prev) => [
      ...prev,
      { name: `Debt ${prev.length + 1}`, balanceCents: 100000, annualRate: 0.18, minPaymentCents: 3000 },
    ]);
  };

  const removeDebt = (idx: number) => {
    if (debts.length <= 1) return;
    setDebts((prev) => prev.filter((_, i) => i !== idx));
  };

  const minimum = calculateDebtStrategy(debts, 'minimum', extraMonthlyCents);
  const snowball = calculateDebtStrategy(debts, 'snowball', extraMonthlyCents);
  const avalanche = calculateDebtStrategy(debts, 'avalanche', extraMonthlyCents);

  const fxRate = fxResult?.rates?.[fxCurrency];
  const convertedInterest = fxResult && fxRate && avalanche.totalInterestCents > 0
    ? formatCurrency((avalanche.totalInterestCents / 100) * fxRate, fxCurrency, 'en-US') + ' ' + fxCurrency
    : null;

  const monthsSaved = (result: typeof minimum) => minimum.months - result.months;
  const interestSaved = (result: typeof minimum) => minimum.totalInterestCents - result.totalInterestCents;

  const strategies = [
    { label: 'Minimum only', result: minimum },
    { label: 'Snowball', result: snowball },
    { label: 'Avalanche', result: avalanche },
  ];

  const secondaries = [
    { label: 'Total interest (avalanche)', value: fmtCents(avalanche.totalInterestCents) },
    { label: 'Interest saved vs minimum', value: interestSaved(avalanche) > 0 ? fmtCents(interestSaved(avalanche)) : ' - ' },
    { label: 'Months saved vs minimum', value: monthsSaved(avalanche) > 0 ? `${monthsSaved(avalanche)} fewer` : ' - ' },
  ];

  return (
    <div>
      {/* Result card */}
      <div className="calc-panel-result" style={{ border: '1px solid var(--color-hairline)', padding: '28px 32px 24px' }}>
        <div style={{ fontSize: 12, color: 'var(--color-ink-mid)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>
          Best payoff  -  Avalanche strategy
        </div>
        <div style={{ fontSize: 56, fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
          {avalanche.months} <span style={{ fontSize: 24, color: 'var(--color-ink-mid)', fontWeight: 300 }}>months</span>
        </div>
        {fxResult && (
          <div style={{ borderTop: '1px solid var(--color-hairline)', marginTop: 16, paddingTop: 16 }}>
            <CurrencyToggle convertedAmount={convertedInterest} targetCurrency={fxCurrency} rateDate={fxResult.asOf} onCurrencyChange={(c) => setFxCurrency(c)} />
          </div>
        )}
        <div className="result-stats" style={{ marginTop: 16 }}>
          {secondaries.map((m, i) => (
            <div key={m.label} className={i > 0 ? 'stat-sep' : ''}>
              <div style={{ fontSize: 11, color: 'var(--color-ink-mid)', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.06em', fontWeight: 500 }}>{m.label}</div>
              <div style={{ fontSize: 22, fontWeight: 300, letterSpacing: '-0.02em', color: i > 0 ? 'var(--color-positive)' : 'var(--color-ink)' }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Strategy comparison table */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--color-hairline)', overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr 2fr', gap: 0, minWidth: 480 }}>
            {['Strategy', 'Months', 'Total interest', 'Months saved', 'Interest saved'].map((h) => (
              <div key={h} style={{ fontSize: 11, color: 'var(--color-ink-mid)', paddingBottom: 10, textTransform: 'uppercase' as const, letterSpacing: '0.06em', fontWeight: 500 }}>
                {h}
              </div>
            ))}
          </div>
          {strategies.map(({ label, result }) => {
            const ms = monthsSaved(result);
            const is = interestSaved(result);
            return (
              <div key={label} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr 2fr', gap: 0, paddingTop: 12, paddingBottom: 12, borderTop: '1px solid var(--color-hairline-subtle)', minWidth: 480 }}>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{label}</div>
                <div style={{ fontSize: 15, fontWeight: 300 }}>{result.months}</div>
                <div style={{ fontSize: 15, color: 'var(--color-interest)', fontWeight: 300 }}>{fmtCents(result.totalInterestCents)}</div>
                <div style={{ fontSize: 15, color: ms > 0 ? 'var(--color-positive)' : 'var(--color-ink-mid)', fontWeight: 300 }}>{ms > 0 ? `${ms}` : ' - '}</div>
                <div style={{ fontSize: 15, color: is > 0 ? 'var(--color-positive)' : 'var(--color-ink-mid)', fontWeight: 300 }}>{is > 0 ? fmtCents(is) : ' - '}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Input panel */}
      <div className="calc-panel" style={{ border: '1px solid var(--color-hairline)', padding: '28px 32px', marginTop: 24, display: 'grid', gap: 20 }}>
        {/* Debt rows */}
        {debts.map((debt, idx) => (
          <div
            key={idx}
            style={{
              padding: '16px 20px',
              border: '1px solid var(--color-hairline-subtle)',
              background: 'var(--color-surface)',
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
              gap: 16,
              alignItems: 'end',
            }}
          >
            <div>
              <label style={labelStyle}>Name</label>
              <input
                type="text"
                value={debt.name}
                onChange={(e) => updateDebt(idx, 'name', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Balance</label>
              <div style={{ display: 'flex', alignItems: 'baseline', borderBottom: '1px solid var(--color-ink)' }}>
                <span style={{ fontSize: 15, color: 'var(--color-ink)', paddingBottom: 4, flexShrink: 0 }}>{country.currencySymbol}</span>
                <input
                  type="number"
                  value={debt.balanceCents / 100}
                  min={1}
                  step={100}
                  onChange={(e) => updateDebt(idx, 'balanceCents', Math.round(Number(e.target.value) * 100))}
                  style={{ ...inputStyle, border: 'none', paddingLeft: 4 }}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>APR (%)</label>
              <input
                type="number"
                value={(debt.annualRate * 100).toFixed(1)}
                min={0}
                max={99}
                step={0.1}
                onChange={(e) => updateDebt(idx, 'annualRate', Number(e.target.value) / 100)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Min payment</label>
              <div style={{ display: 'flex', alignItems: 'baseline', borderBottom: '1px solid var(--color-ink)' }}>
                <span style={{ fontSize: 15, color: 'var(--color-ink)', paddingBottom: 4, flexShrink: 0 }}>{country.currencySymbol}</span>
                <input
                  type="number"
                  value={debt.minPaymentCents / 100}
                  min={1}
                  step={10}
                  onChange={(e) => updateDebt(idx, 'minPaymentCents', Math.round(Number(e.target.value) * 100))}
                  style={{ ...inputStyle, border: 'none', paddingLeft: 4 }}
                />
              </div>
            </div>
            <div>
              {debts.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDebt(idx)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ink-mid)', fontSize: 20, lineHeight: 1, padding: '4px 0' }}
                  aria-label="Remove debt"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}

        {debts.length < 5 && (
          <button
            type="button"
            onClick={addDebt}
            style={{ background: 'none', border: '1px solid var(--color-hairline)', cursor: 'pointer', color: 'var(--color-ink-mid)', fontSize: 14, padding: '8px 16px', width: 'fit-content' }}
          >
            + Add debt
          </button>
        )}

        {/* Extra monthly budget */}
        <div style={{ borderTop: '1px solid var(--color-hairline)', paddingTop: 20 }}>
          <label style={labelStyle}>Extra monthly budget above minimums</label>
          <div style={{ display: 'flex', alignItems: 'baseline', borderBottom: '1px solid var(--color-ink)', maxWidth: 200 }}>
            <span style={{ fontSize: 18, color: 'var(--color-ink)', paddingBottom: 4, flexShrink: 0 }}>{country.currencySymbol}</span>
            <input
              type="number"
              value={extraMonthlyCents / 100}
              min={0}
              step={10}
              onChange={(e) => setExtraMonthlyCents(Math.round(Number(e.target.value) * 100))}
              style={{ fontSize: 18, fontWeight: 400, border: 'none', background: 'transparent', outline: 'none', width: '100%', color: 'var(--color-ink)', padding: '4px 0 4px 4px' }}
            />
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-ink-mid)', marginTop: 6 }}>
            Distributed to highest rate first (avalanche) or lowest balance first (snowball)
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ marginTop: 32 }}>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>Total interest by strategy</div>
        <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 16 }}>Lower is better</div>
        <StrategyChart
          minimumInterestCents={minimum.totalInterestCents}
          snowballInterestCents={snowball.totalInterestCents}
          avalancheInterestCents={avalanche.totalInterestCents}
          currency={country.currency}
          locale={country.locale}
        />
      </div>
    </div>
  );
}
