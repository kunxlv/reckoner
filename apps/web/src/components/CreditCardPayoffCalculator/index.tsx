'use client';
import { useState } from 'react';
import type { CountryData, FxResult } from '@reckoner/finance-data';
import { calculateCardPayoff } from '@reckoner/card-payoff-engine';
import { SliderInput, SegmentedControl, Disclosure, CurrencyToggle } from '@reckoner/ui';
import { formatCurrency } from '../../lib/format';
import { PayoffChart } from './PayoffChart';

interface Props {
  country: CountryData;
  defaultBalanceCents: number;
  defaultAnnualRate: number;
  fxResult?: (FxResult & { rates: Record<string, number> }) | null;
}

type MinType = 'percent' | 'fixed';

const MIN_TYPE_OPTIONS: { label: string; value: MinType }[] = [
  { label: '% of balance', value: 'percent' },
  { label: 'Fixed amount', value: 'fixed' },
];

export function CreditCardPayoffCalculator({ country, defaultBalanceCents, defaultAnnualRate, fxResult }: Props) {
  const [balanceCents, setBalanceCents] = useState(defaultBalanceCents);
  const [annualRate, setAnnualRate] = useState(parseFloat((defaultAnnualRate * 100).toFixed(2)));
  const [minType, setMinType] = useState<MinType>('percent');
  const [minRate, setMinRate] = useState(2);
  const [minFloorCents, setMinFloorCents] = useState(2500);
  const [fixedAmountCents, setFixedAmountCents] = useState(5000);
  const [extraMonthly, setExtraMonthly] = useState(0);
  const [fxCurrency, setFxCurrency] = useState('EUR');

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

  const fxRate = fxResult?.rates?.[fxCurrency];
  const convertedPaid = fxResult && fxRate && minResult.totalPaidCents > 0
    ? formatCurrency((minResult.totalPaidCents / 100) * fxRate, fxCurrency, 'en-US') + ' ' + fxCurrency
    : null;

  const fmtCents = (c: number) => formatCurrency(c / 100, country.currency, country.locale);

  const balanceMax = Math.max(25000, defaultBalanceCents / 100 * 5);
  const balanceStep = defaultBalanceCents >= 5000000 ? 1000 : 100;

  const secondaries = [
    { label: 'Total interest', value: fmtCents(minResult.totalInterestCents) },
    { label: 'Total paid', value: fmtCents(minResult.totalPaidCents) },
    { label: 'With extra', value: hasExtra ? fmtCents(extraMonthlyCents * 100) : ' - ' },
  ];

  return (
    <div>
      {/* Result card */}
      <div className="calc-panel-result" style={{ border: '1px solid var(--color-hairline)', padding: '28px 32px 24px' }}>
        <div style={{ fontSize: 12, color: 'var(--color-ink-mid)', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.06em', fontWeight: 500 }}>
          Months to payoff
        </div>
        <div style={{ fontSize: 56, fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
          {minResult.months}
        </div>
        {fxResult && (
          <div style={{ borderTop: '1px solid var(--color-hairline)', marginTop: 16, paddingTop: 16 }}>
            <CurrencyToggle convertedAmount={convertedPaid} targetCurrency={fxCurrency} rateDate={fxResult.asOf} onCurrencyChange={(c) => setFxCurrency(c)} />
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

        {hasExtra && extraResult && (
          <div className="result-stats" style={{ marginTop: 20 }}>
            <div style={{ paddingLeft: 0 }}>
              <div style={{ fontSize: 11, color: 'var(--color-ink-mid)', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.06em', fontWeight: 500 }}>With extra: months</div>
              <div style={{ fontSize: 22, fontWeight: 300, letterSpacing: '-0.02em', color: 'var(--color-positive)' }}>{extraResult.months}</div>
            </div>
            <div className="stat-sep">
              <div style={{ fontSize: 11, color: 'var(--color-ink-mid)', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.06em', fontWeight: 500 }}>With extra: interest</div>
              <div style={{ fontSize: 22, fontWeight: 300, letterSpacing: '-0.02em', color: 'var(--color-positive)' }}>{fmtCents(extraResult.totalInterestCents)}</div>
            </div>
            <div className="stat-sep">
              <div style={{ fontSize: 11, color: 'var(--color-ink-mid)', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.06em', fontWeight: 500 }}>Interest saved</div>
              <div style={{ fontSize: 22, fontWeight: 300, letterSpacing: '-0.02em', color: 'var(--color-positive)' }}>{fmtCents(minResult.totalInterestCents - extraResult.totalInterestCents)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Input panel */}
      <div className="calc-panel" style={{ border: '1px solid var(--color-hairline)', padding: '28px 32px', marginTop: 24, display: 'grid', gap: 26 }}>
        <SliderInput
          label="Current balance"
          tooltip="The total amount currently owed on your credit card"
          value={balanceCents / 100}
          min={100}
          max={balanceMax}
          step={balanceStep}
          onChange={(v) => setBalanceCents(Math.round(v * 100))}
          prefix={country.currencySymbol}
        />
        <SliderInput
          label="Interest rate (APR)"
          tooltip="Annual Percentage Rate  -  the yearly cost of carrying an unpaid balance"
          value={annualRate}
          min={1}
          max={60}
          step={0.1}
          onChange={(v) => setAnnualRate(v)}
          suffix="%"
        />
        <SegmentedControl
          label="Minimum payment"
          tooltip="Choose how your minimum payment is calculated: a percentage of your balance, or a fixed dollar amount"
          options={MIN_TYPE_OPTIONS}
          value={minType}
          onChange={(v) => setMinType(v as MinType)}
        />
        {minType === 'percent' ? (
          <div style={{ display: 'grid', gap: 26 }}>
            <SliderInput
              label="Min % of balance"
              tooltip="Your card charges this percentage of your current balance as the minimum payment each month"
              value={minRate}
              min={0.5}
              max={10}
              step={0.5}
              onChange={(v) => setMinRate(v)}
              suffix="%"
            />
            <SliderInput
              label="Minimum floor"
              tooltip="Even if the % calculation is lower, you must pay at least this amount each month"
              value={minFloorCents / 100}
              min={1}
              max={100}
              step={5}
              onChange={(v) => setMinFloorCents(Math.round(v * 100))}
              prefix={country.currencySymbol}
            />
          </div>
        ) : (
          <SliderInput
            label="Fixed minimum"
            tooltip="A set minimum payment amount regardless of what your balance is"
            value={fixedAmountCents / 100}
            min={1}
            max={500}
            step={10}
            onChange={(v) => setFixedAmountCents(Math.round(v * 100))}
            prefix={country.currencySymbol}
          />
        )}
        <Disclosure trigger="Add extra payment" helper="See how paying more reduces total interest">
          <div style={{ paddingTop: 18 }}>
            <SliderInput
              label="Extra per month"
              tooltip="Paying more than the minimum reduces interest and pays off debt faster"
              value={extraMonthly}
              min={0}
              max={1000}
              step={10}
              onChange={(v) => setExtraMonthly(v)}
              prefix={country.currencySymbol}
            />
          </div>
        </Disclosure>
      </div>

      {/* Chart  -  only when extra > 0 */}
      {hasExtra && extraResult && (
        <>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4, marginTop: 32 }}>
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
