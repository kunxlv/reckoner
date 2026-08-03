'use client';
import { useState } from 'react';
import type { CountryData } from '@reckoner/finance-data';
import { calculateDebtStrategy } from '@reckoner/debt-strategy-engine';
import type { Debt } from '@reckoner/debt-strategy-engine';
import { formatCurrency } from '../../lib/format';
import { StrategyChart } from './StrategyChart';

interface Props {
  country: CountryData;
  defaultDebts: Debt[];
  defaultExtraMonthlyCents: number;
}

const inputStyle = {
  fontSize: 16,
  fontWeight: 400,
  border: 'none',
  borderBottom: '1px solid var(--color-ink)',
  background: 'transparent',
  outline: 'none',
  width: '100%',
  color: 'var(--color-ink)',
  padding: '4px 0',
} as const;

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  marginBottom: 4,
  color: 'var(--color-ink-mid)',
} as const;

export function DebtStrategyCalculator({ country, defaultDebts, defaultExtraMonthlyCents }: Props) {
  const [debts, setDebts] = useState<Debt[]>(defaultDebts);
  const [extraMonthlyCents, setExtraMonthlyCents] = useState(defaultExtraMonthlyCents);

  const fmtCents = (c: number) => formatCurrency(c / 100, country.currency, country.locale);

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

  const monthsSaved = (result: typeof minimum) => minimum.months - result.months;
  const interestSaved = (result: typeof minimum) => minimum.totalInterestCents - result.totalInterestCents;

  return (
    <div>
      {/* Debt inputs */}
      <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
        {debts.map((debt, idx) => (
          <div
            key={idx}
            style={{
              padding: 16,
              border: '1px solid var(--color-hairline)',
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
              gap: 12,
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
              <label style={labelStyle}>Balance ({country.currencySymbol})</label>
              <input
                type="number"
                value={debt.balanceCents / 100}
                min={1}
                step={100}
                onChange={(e) =>
                  updateDebt(idx, 'balanceCents', Math.round(Number(e.target.value) * 100))
                }
                style={inputStyle}
              />
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
              <label style={labelStyle}>Min payment ({country.currencySymbol})</label>
              <input
                type="number"
                value={debt.minPaymentCents / 100}
                min={1}
                step={10}
                onChange={(e) =>
                  updateDebt(idx, 'minPaymentCents', Math.round(Number(e.target.value) * 100))
                }
                style={inputStyle}
              />
            </div>
            <div>
              {debts.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDebt(idx)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-ink-mid)',
                    fontSize: 20,
                    lineHeight: 1,
                    padding: '4px 0',
                  }}
                  aria-label="Remove debt"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {debts.length < 5 && (
        <button
          type="button"
          onClick={addDebt}
          style={{
            background: 'none',
            border: '1px solid var(--color-hairline)',
            cursor: 'pointer',
            color: 'var(--color-ink-mid)',
            fontSize: 14,
            padding: '8px 16px',
            marginBottom: 24,
          }}
        >
          + Add debt
        </button>
      )}

      <div style={{ maxWidth: 300, marginBottom: 32 }}>
        <label style={{ ...labelStyle, fontSize: 13 }}>
          Extra monthly budget above minimums ({country.currencySymbol})
        </label>
        <input
          type="number"
          value={extraMonthlyCents / 100}
          min={0}
          step={10}
          onChange={(e) => setExtraMonthlyCents(Math.round(Number(e.target.value) * 100))}
          style={inputStyle}
        />
      </div>

      {/* Results table */}
      <div style={{ background: 'var(--color-surface)', padding: 24, marginBottom: 32, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
          <thead>
            <tr>
              {['Strategy', 'Total interest', 'Months to payoff', 'Months saved', 'Interest saved'].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left',
                    padding: '0 16px 12px 0',
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--color-ink-mid)',
                    borderBottom: '1px solid var(--color-hairline)',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'Minimum only', result: minimum },
              { label: 'Snowball', result: snowball },
              { label: 'Avalanche', result: avalanche },
            ].map(({ label, result }) => {
              const ms = monthsSaved(result);
              const is = interestSaved(result);
              return (
                <tr key={label}>
                  <td style={{ padding: '14px 16px 14px 0', fontWeight: 500 }}>{label}</td>
                  <td style={{ padding: '14px 16px 14px 0', color: 'var(--color-interest)' }}>
                    {fmtCents(result.totalInterestCents)}
                  </td>
                  <td style={{ padding: '14px 16px 14px 0' }}>{result.months}</td>
                  <td style={{ padding: '14px 16px 14px 0', color: ms > 0 ? 'var(--color-positive)' : 'var(--color-ink-mid)' }}>
                    {ms > 0 ? `${ms} fewer` : '—'}
                  </td>
                  <td style={{ padding: '14px 16px 14px 0', color: is > 0 ? 'var(--color-positive)' : 'var(--color-ink-mid)' }}>
                    {is > 0 ? fmtCents(is) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Chart */}
      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
        Total interest by strategy
      </div>
      <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 16 }}>
        Lower is better
      </div>
      <StrategyChart
        minimumInterestCents={minimum.totalInterestCents}
        snowballInterestCents={snowball.totalInterestCents}
        avalancheInterestCents={avalanche.totalInterestCents}
        currency={country.currency}
        locale={country.locale}
      />
    </div>
  );
}
