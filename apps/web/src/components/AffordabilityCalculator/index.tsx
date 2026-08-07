'use client';
import { useState, useMemo } from 'react';
import type { CountryData, FxResult } from '@reckoner/finance-data';
import type { AffordabilityRuleSet } from '@reckoner/rules-core';
import { calculateAffordability } from '@reckoner/affordability-engine';
import { SliderInput, SegmentedControl, Disclosure, CurrencyToggle } from '@reckoner/ui';
import { formatCurrency } from '../../lib/format';
import { BorrowingChart } from './BorrowingChart';

interface AffordabilityCalculatorProps {
  country: CountryData;
  ruleset: AffordabilityRuleSet;
  defaultRate: number;
  fxResult?: (FxResult & { rates: Record<string, number> }) | null;
}

const BUYER_TYPE_OPTIONS = [
  { label: 'First-time', value: 'first_time_buyer' as const },
  { label: 'Subsequent', value: 'subsequent_buyer' as const },
  { label: 'Buy to let', value: 'buy_to_let' as const },
];

export function AffordabilityCalculator({ country, ruleset, defaultRate, fxResult }: AffordabilityCalculatorProps) {
  const [grossIncome, setGrossIncome] = useState(80_000);
  const [monthlyDebts, setMonthlyDebts] = useState(0);
  const [propertyPrice, setPropertyPrice] = useState(country.defaults.price);
  const [annualRate, setAnnualRate] = useState(defaultRate);
  const [termYears, setTermYears] = useState(country.defaults.termYears);
  const [buyerType, setBuyerType] = useState<'first_time_buyer' | 'subsequent_buyer' | 'buy_to_let'>('first_time_buyer');
  const [fxCurrency, setFxCurrency] = useState('EUR');

  const result = calculateAffordability(
    { grossAnnualIncome: grossIncome, monthlyDebts, propertyPrice, annualRate, termYears, buyerType },
    ruleset,
  );

  const fxRate = fxResult?.rates?.[fxCurrency];
  const convertedBorrow = fxResult && fxRate && result.maxBorrow > 0
    ? formatCurrency(result.maxBorrow * fxRate, fxCurrency, 'en-US') + ' ' + fxCurrency
    : null;

  const chartData = useMemo(() => {
    const maxIncome = Math.max(grossIncome * 2.5, 200_000);
    const step = maxIncome / 50;
    return Array.from({ length: 51 }, (_, i) => {
      const income = i * step;
      const r = calculateAffordability(
        { grossAnnualIncome: income, monthlyDebts, propertyPrice, annualRate, termYears, buyerType },
        ruleset,
      );
      return { income, maxBorrow: r.maxBorrow };
    });
  }, [grossIncome, monthlyDebts, propertyPrice, annualRate, termYears, buyerType, ruleset]);

  const secondaries = [
    { label: 'Monthly payment', value: formatCurrency(result.maxMonthlyPayment, country.currency, country.locale) },
    { label: 'Stress rate', value: (result.assessmentRate * 100).toFixed(2) + '%' },
    { label: 'Binding constraint', value: result.bindingConstraint.toUpperCase() },
  ];

  const priceMin = country.defaults.priceMin ?? 50000;
  const priceMax = country.defaults.priceMax ?? 5000000;
  const priceStep = country.defaults.priceStep ?? 10000;

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div className="calc-panel-result" style={{ border: '1px solid var(--color-hairline)', padding: '28px 32px 24px' }}>
        <div style={{ fontSize: 12, color: 'var(--color-ink-mid)', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.06em', fontWeight: 500 }}>
          Maximum borrowing
        </div>
        <div style={{ fontSize: 56, fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
          {formatCurrency(result.maxBorrow, country.currency, country.locale)}
        </div>
        {fxResult && (
          <div style={{ borderTop: '1px solid var(--color-hairline)', marginTop: 16, paddingTop: 16 }}>
            <CurrencyToggle convertedAmount={convertedBorrow} targetCurrency={fxCurrency} rateDate={fxResult.asOf} onCurrencyChange={(c) => setFxCurrency(c)} />
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
          This is an estimate. Lenders also consider credit history, outgoings, and their own criteria.
        </p>
      </div>

      <div className="calc-panel" style={{ border: '1px solid var(--color-hairline)', padding: '28px 32px', display: 'grid', gap: 26 }}>
        <SliderInput
          label="Gross annual income"
          value={grossIncome}
          min={0}
          max={500000}
          step={5000}
          onChange={(v) => setGrossIncome(v)}
          prefix={country.currencySymbol}
          tooltip="Your total annual income before tax  -  lenders use this to calculate borrowing limits"
        />
        <SliderInput
          label="Property price"
          value={propertyPrice}
          min={priceMin}
          max={priceMax}
          step={priceStep}
          onChange={(v) => setPropertyPrice(v)}
          prefix={country.currencySymbol}
          tooltip="The purchase price you want to test affordability against"
        />
        <SliderInput
          label="Interest rate"
          value={annualRate * 100}
          min={0}
          max={20}
          step={0.1}
          onChange={(v) => setAnnualRate(v / 100)}
          suffix="%"
          tooltip="Expected mortgage interest rate  -  used to calculate the monthly payment at your maximum borrowing"
        />
        <SliderInput
          label="Term"
          value={termYears}
          min={5}
          max={40}
          step={1}
          onChange={(v) => setTermYears(v)}
          suffix=" yr"
          tooltip="Mortgage duration in years  -  longer terms mean lower payments but more total interest"
        />
        <SegmentedControl
          label="Buyer type"
          options={BUYER_TYPE_OPTIONS}
          value={buyerType}
          onChange={(v) => setBuyerType(v as typeof buyerType)}
          tooltip="Your buyer status  -  first-time buyers may qualify for government programs or reduced stamp duty"
        />
        <Disclosure
          trigger="Add existing debts"
          helper="Monthly debt payments reduce your borrowing capacity"
        >
          <SliderInput
            label="Monthly debt payments"
            value={monthlyDebts}
            min={0}
            max={5000}
            step={100}
            onChange={(v) => setMonthlyDebts(v)}
            prefix={country.currencySymbol}
            tooltip="Your current monthly debt obligations (car loan, student debt, etc.)  -  these reduce how much you can borrow for a mortgage"
          />
        </Disclosure>
      </div>

      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>Borrowing capacity by income</div>
      <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 16 }}>How your maximum loan changes with gross income</div>
      <BorrowingChart data={chartData} currentIncome={grossIncome} currency={country.currency} locale={country.locale} />
    </div>
  );
}
