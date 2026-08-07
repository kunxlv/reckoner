'use client';
import { useState } from 'react';
import type { CountryData, FxResult } from '@reckoner/finance-data';
import { SliderInput, Disclosure, CurrencyToggle } from '@reckoner/ui';
import { formatCurrency } from '../../lib/format';
import { calcRefinance } from '../../lib/refinance';
import { BreakEvenChart } from './BreakEvenChart';

interface RefinanceCalculatorProps {
  country: CountryData;
  defaultRate: number;
  fxResult?: (FxResult & { rates: Record<string, number> }) | null;
}

export function RefinanceCalculator({ country, defaultRate, fxResult }: RefinanceCalculatorProps) {
  const [balance, setBalance] = useState(Math.round(country.defaults.price * 0.7));
  const [currentRate, setCurrentRate] = useState(defaultRate + 0.01);
  const [newRate, setNewRate] = useState(defaultRate);
  const [remainingYears, setRemainingYears] = useState(25);
  const [closingCosts, setClosingCosts] = useState(3000);
  const [fxCurrency, setFxCurrency] = useState('EUR');

  const result = calcRefinance({ balance, currentRate, newRate, remainingYears, closingCosts });
  const { monthlySavings, breakEvenMonths, totalSavingOverTerm } = result;

  const fxRate = fxResult?.rates?.[fxCurrency];
  const convertedSaving = fxResult && fxRate && monthlySavings > 0
    ? formatCurrency(monthlySavings * fxRate, fxCurrency, 'en-US') + ' ' + fxCurrency
    : null;

  const priceStep = country.defaults.priceStep ?? 10000;
  const balanceMax = Math.max(1000000, Math.round(country.defaults.price * 0.7) * 3);

  const secondaries = [
    { label: 'Break-even', value: breakEvenMonths !== null ? breakEvenMonths + ' months' : 'No saving' },
    { label: 'Saving over term', value: formatCurrency(totalSavingOverTerm, country.currency, country.locale) },
    { label: 'New rate', value: (newRate * 100).toFixed(2) + '%' },
  ];

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div className="calc-panel-result" style={{ border: '1px solid var(--color-hairline)', padding: '28px 32px 24px' }}>
        <div style={{ fontSize: 12, color: 'var(--color-ink-mid)', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.06em', fontWeight: 500 }}>
          Monthly saving
        </div>
        <div style={{ fontSize: 56, fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
          {monthlySavings <= 0
            ? 'No saving'
            : formatCurrency(monthlySavings, country.currency, country.locale)}
        </div>
        {fxResult && (
          <div style={{ borderTop: '1px solid var(--color-hairline)', marginTop: 16, paddingTop: 16 }}>
            <CurrencyToggle convertedAmount={convertedSaving} targetCurrency={fxCurrency} rateDate={fxResult.asOf} onCurrencyChange={(c) => setFxCurrency(c)} />
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
        <p style={{ fontSize: 12, color: 'var(--color-ink-mid)', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--color-hairline)' }}>
          Principal and interest only. Check early repayment charges before acting.
        </p>
      </div>

      <div className="calc-panel" style={{ border: '1px solid var(--color-hairline)', padding: '28px 32px', display: 'grid', gap: 26 }}>
        <SliderInput
          label="Outstanding balance"
          value={balance}
          min={10000}
          max={balanceMax}
          step={priceStep}
          onChange={(v) => setBalance(v)}
          prefix={country.currencySymbol}
          tooltip="The remaining principal on your current mortgage"
        />
        <SliderInput
          label="Years remaining"
          value={remainingYears}
          min={1}
          max={40}
          step={1}
          onChange={(v) => setRemainingYears(v)}
          suffix=" yr"
          tooltip="How many years are left on your current loan"
        />
        <SliderInput
          label="Current rate"
          value={currentRate * 100}
          min={0}
          max={20}
          step={0.05}
          onChange={(v) => setCurrentRate(v / 100)}
          suffix="%"
          tooltip="Your existing mortgage interest rate"
        />
        <SliderInput
          label="New rate"
          value={newRate * 100}
          min={0}
          max={20}
          step={0.05}
          onChange={(v) => setNewRate(v / 100)}
          suffix="%"
          tooltip="The rate being offered on the refinanced loan"
        />
        <Disclosure
          trigger="Add refinancing costs"
          helper="Upfront fees affect your break-even timeline"
        >
          <SliderInput
            label="Refinancing costs"
            value={closingCosts}
            min={0}
            max={20000}
            step={500}
            onChange={(v) => setClosingCosts(v)}
            prefix={country.currencySymbol}
            tooltip="Total costs to set up the new loan (fees, legal, etc.)  -  affects your break-even timeline"
          />
        </Disclosure>
      </div>

      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>Cumulative saving over time</div>
      <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 16 }}>When your monthly saving recovers the upfront refinancing cost</div>
      <BreakEvenChart
        monthlySavings={monthlySavings}
        closingCosts={closingCosts}
        breakEvenMonths={breakEvenMonths}
        totalMonths={remainingYears * 12}
        currency={country.currency}
        locale={country.locale}
      />
    </div>
  );
}
