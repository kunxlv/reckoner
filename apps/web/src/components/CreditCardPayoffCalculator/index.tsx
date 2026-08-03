'use client';
import { useState } from 'react';
import type { CountryData } from '@reckoner/finance-data';
import { calculateCardPayoff } from '@reckoner/card-payoff-engine';
import { formatCurrency } from '../../lib/format';
import { PayoffChart } from './PayoffChart';

interface Props {
  country: CountryData;
  defaultBalanceCents: number;
  defaultAnnualRate: number;
}

type MinType = 'percent' | 'fixed';

const inputStyle = {
  fontSize: 18,
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
  fontSize: 13,
  fontWeight: 500,
  marginBottom: 6,
  color: 'var(--color-ink-mid)',
} as const;

export function CreditCardPayoffCalculator({ country, defaultBalanceCents, defaultAnnualRate }: Props) {
  const [balanceCents, setBalanceCents] = useState(defaultBalanceCents);
  const [annualRate, setAnnualRate] = useState(defaultAnnualRate * 100); // displayed as %
  const [minType, setMinType] = useState<MinType>('percent');
  const [minRate, setMinRate] = useState(2); // 2%
  const [minFloorCents, setMinFloorCents] = useState(2500); // $25
  const [fixedAmountCents, setFixedAmountCents] = useState(5000); // $50
  const [extraMonthly, setExtraMonthly] = useState(0); // displayed as dollars

  const minPaymentRule =
    minType === 'percent'
      ? { type: 'percent' as const, rate: minRate / 100, floorCents: minFloorCents }
      : { type: 'fixed' as const, amountCents: fixedAmountCents };

  const extraMonthlyCents = Math.round(extraMonthly * 100);

  const minResult = calculateCardPayoff({
    balanceCents,
    annualRate: annualRate / 100,
    minPaymentRule,
  });

  const hasExtra = extraMonthlyCents > 0;
  const extraResult = hasExtra
    ? calculateCardPayoff({
        balanceCents,
        annualRate: annualRate / 100,
        minPaymentRule,
        extraMonthlyCents,
      })
    : null;

  const fmtCents = (c: number) => formatCurrency(c / 100, country.currency, country.locale);

  const resultRowStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 24,
  } as const;

  const metricLabelStyle = { fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 4 } as const;
  const metricValueStyle = {
    fontSize: 28,
    fontWeight: 300,
    letterSpacing: '-0.03em',
    color: 'var(--color-ink)',
  } as const;
  const metricInterestStyle = { ...metricValueStyle, color: 'var(--color-interest)' } as const;

  return (
    <div>
      {/* Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div>
          <label style={labelStyle}>Current balance ({country.currencySymbol})</label>
          <input
            type="number"
            value={balanceCents / 100}
            min={1}
            step={100}
            onChange={(e) => setBalanceCents(Math.round(Number(e.target.value) * 100))}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Annual interest rate (APR %)</label>
          <input
            type="number"
            value={annualRate}
            min={0}
            max={99}
            step={0.1}
            onChange={(e) => setAnnualRate(Number(e.target.value))}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Minimum payment type</label>
          <select
            value={minType}
            onChange={(e) => setMinType(e.target.value as MinType)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="percent">% of balance (with floor)</option>
            <option value="fixed">Fixed amount</option>
          </select>
        </div>
        {minType === 'percent' ? (
          <>
            <div>
              <label style={labelStyle}>Minimum % of balance</label>
              <input
                type="number"
                value={minRate}
                min={0.5}
                max={10}
                step={0.5}
                onChange={(e) => setMinRate(Number(e.target.value))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Minimum floor ({country.currencySymbol})</label>
              <input
                type="number"
                value={minFloorCents / 100}
                min={1}
                step={5}
                onChange={(e) => setMinFloorCents(Math.round(Number(e.target.value) * 100))}
                style={inputStyle}
              />
            </div>
          </>
        ) : (
          <div>
            <label style={labelStyle}>Fixed minimum ({country.currencySymbol})</label>
            <input
              type="number"
              value={fixedAmountCents / 100}
              min={1}
              step={10}
              onChange={(e) => setFixedAmountCents(Math.round(Number(e.target.value) * 100))}
              style={inputStyle}
            />
          </div>
        )}
        <div>
          <label style={labelStyle}>Extra monthly payment ({country.currencySymbol}, optional)</label>
          <input
            type="number"
            value={extraMonthly}
            min={0}
            step={10}
            onChange={(e) => setExtraMonthly(Number(e.target.value))}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Results */}
      <div style={{ background: 'var(--color-surface)', padding: 24, marginBottom: 32 }}>
        {/* Minimum-only row */}
        <div style={{ marginBottom: hasExtra ? 24 : 0 }}>
          {hasExtra && (
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink-mid)', marginBottom: 12 }}>
              Minimum payments only
            </div>
          )}
          <div style={resultRowStyle}>
            <div>
              <div style={metricLabelStyle}>Months to payoff</div>
              <div style={metricValueStyle}>{minResult.months}</div>
            </div>
            <div>
              <div style={metricLabelStyle}>Total interest</div>
              <div style={metricInterestStyle}>{fmtCents(minResult.totalInterestCents)}</div>
            </div>
            <div>
              <div style={metricLabelStyle}>Total paid</div>
              <div style={metricValueStyle}>{fmtCents(minResult.totalPaidCents)}</div>
            </div>
          </div>
        </div>

        {/* Extra payment row — only when extra > 0 */}
        {hasExtra && extraResult && (
          <div style={{ borderTop: '1px solid var(--color-hairline)', paddingTop: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink-mid)', marginBottom: 12 }}>
              With {fmtCents(extraMonthlyCents)} extra/month
            </div>
            <div style={resultRowStyle}>
              <div>
                <div style={metricLabelStyle}>Months to payoff</div>
                <div style={metricValueStyle}>{extraResult.months}</div>
              </div>
              <div>
                <div style={metricLabelStyle}>Total interest</div>
                <div style={metricInterestStyle}>{fmtCents(extraResult.totalInterestCents)}</div>
              </div>
              <div>
                <div style={metricLabelStyle}>Total paid</div>
                <div style={metricValueStyle}>{fmtCents(extraResult.totalPaidCents)}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart — only when extra > 0 */}
      {hasExtra && extraResult && (
        <>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
            Cumulative interest over time
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 16 }}>
            Month-by-month comparison
          </div>
          <PayoffChart
            minSchedule={minResult.schedule}
            extraSchedule={extraResult.schedule}
            currency={country.currency}
            locale={country.locale}
          />
        </>
      )}
    </div>
  );
}
