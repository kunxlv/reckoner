'use client';
import { useState } from 'react';
import type { CountryData, FxResult } from '@reckoner/finance-data';
import { SliderInput, SegmentedControl, Disclosure, CurrencyToggle } from '@reckoner/ui';
import { formatCurrency } from '../../lib/format';
import { calcRentVsBuy } from '../../lib/rentVsBuy';
import { ComparisonChart } from './ComparisonChart';

interface RentVsBuyCalculatorProps {
  country: CountryData;
  defaultRate: number;
  fxResult?: (FxResult & { rates: Record<string, number> }) | null;
}

const TERM_OPTIONS = [
  { label: '10 yr', value: 10 },
  { label: '15 yr', value: 15 },
  { label: '20 yr', value: 20 },
  { label: '25 yr', value: 25 },
  { label: '30 yr', value: 30 },
];

export function RentVsBuyCalculator({ country, defaultRate, fxResult }: RentVsBuyCalculatorProps) {
  const [propertyPrice, setPropertyPrice] = useState(country.defaults.price);
  const [deposit, setDeposit] = useState(country.defaults.deposit);
  const [annualRate, setAnnualRate] = useState(defaultRate);
  const [termYears, setTermYears] = useState(country.defaults.termYears);
  const [monthlyRent, setMonthlyRent] = useState(Math.round(country.defaults.price * 0.004));
  const [annualAppreciation, setAnnualAppreciation] = useState(0.04);
  const [annualInvestmentReturn, setAnnualInvestmentReturn] = useState(0.07);
  const [fxCurrency, setFxCurrency] = useState('EUR');

  const result = calcRentVsBuy({ propertyPrice, deposit, annualRate, termYears, monthlyRent, annualAppreciation, annualInvestmentReturn });
  const { mortgagePayment, effectiveBuyCost, netBuyAdvantage } = result;

  const fxRate = fxResult?.rates?.[fxCurrency];
  const convertedAdvantage = fxResult && fxRate && netBuyAdvantage !== 0
    ? formatCurrency(Math.abs(netBuyAdvantage) * fxRate, fxCurrency, 'en-US') + ' ' + fxCurrency
    : null;

  const priceMin = country.defaults.priceMin ?? 50000;
  const priceMax = country.defaults.priceMax ?? 5000000;
  const priceStep = country.defaults.priceStep ?? 5000;
  const depositMax = country.defaults.priceMax ?? 5000000;
  const depositStep = country.defaults.depositStep ?? 5000;
  const rentMax = Math.max(10000, Math.round(country.defaults.price * 0.004) * 5);

  const secondaries = [
    { label: 'Monthly mortgage', value: formatCurrency(mortgagePayment, country.currency, country.locale) },
    { label: 'Effective buy cost', value: formatCurrency(effectiveBuyCost, country.currency, country.locale) },
    { label: 'vs monthly rent', value: formatCurrency(monthlyRent, country.currency, country.locale) },
  ];

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div className="calc-panel-result" style={{ border: '1px solid var(--color-hairline)', padding: '28px 32px 24px' }}>
        <div style={{ fontSize: 12, color: 'var(--color-ink-mid)', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.06em', fontWeight: 500 }}>
          Net buy advantage (10-yr)
        </div>
        <div style={{ fontSize: 56, fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.05, color: netBuyAdvantage >= 0 ? 'var(--color-positive)' : 'var(--color-interest)' }}>
          {netBuyAdvantage >= 0 ? '+' : ''}{formatCurrency(netBuyAdvantage, country.currency, country.locale)}
        </div>
        {fxResult && (
          <div style={{ borderTop: '1px solid var(--color-hairline)', marginTop: 16, paddingTop: 16 }}>
            <CurrencyToggle convertedAmount={convertedAdvantage} targetCurrency={fxCurrency} rateDate={fxResult.asOf} onCurrencyChange={(c) => setFxCurrency(c)} />
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
        <p style={{ fontSize: 12, color: 'var(--color-ink-mid)', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-hairline)' }}>
          Excludes maintenance, insurance, transaction costs, and tax effects. Illustrative only.
        </p>
        <div style={{ marginTop: 8, fontSize: 13, color: netBuyAdvantage >= 0 ? 'var(--color-positive)' : 'var(--color-interest)' }}>
          {netBuyAdvantage >= 0
            ? 'Buying is ahead over 10 years with these assumptions.'
            : 'Renting is ahead over 10 years with these assumptions.'}
        </div>
      </div>

      <div className="calc-panel" style={{ border: '1px solid var(--color-hairline)', padding: '28px 32px', display: 'grid', gap: 26 }}>
        <SliderInput
          label="Property price"
          value={propertyPrice}
          min={priceMin}
          max={priceMax}
          step={priceStep}
          onChange={(v) => setPropertyPrice(v)}
          prefix={country.currencySymbol}
          tooltip="The purchase price of the property you're considering buying"
        />
        <SliderInput
          label="Deposit"
          value={deposit}
          min={0}
          max={depositMax}
          step={depositStep}
          onChange={(v) => setDeposit(v)}
          prefix={country.currencySymbol}
          tooltip="The down payment amount you would put down"
        />
        <SliderInput
          label="Mortgage rate"
          value={annualRate * 100}
          min={0}
          max={20}
          step={0.05}
          onChange={(v) => setAnnualRate(v / 100)}
          suffix="%"
          tooltip="The annual interest rate on the mortgage"
        />
        <SegmentedControl
          label="Mortgage term"
          options={TERM_OPTIONS}
          value={termYears}
          onChange={(v) => setTermYears(v)}
          tooltip="The duration of the mortgage in years"
        />
        <SliderInput
          label="Monthly rent"
          value={monthlyRent}
          min={0}
          max={rentMax}
          step={100}
          onChange={(v) => setMonthlyRent(v)}
          prefix={country.currencySymbol}
          tooltip="The monthly rent for comparable housing if you continue renting"
        />
        <Disclosure
          trigger="Investment assumptions"
          helper="How your deposit would grow if invested instead"
        >
          <div style={{ display: 'grid', gap: 18, paddingTop: 18 }}>
            <SliderInput
              label="Annual appreciation"
              value={annualAppreciation * 100}
              min={-5}
              max={20}
              step={0.5}
              onChange={(v) => setAnnualAppreciation(v / 100)}
              suffix="%"
              tooltip="The expected average annual increase in the property's value"
            />
            <SliderInput
              label="Deposit return"
              value={annualInvestmentReturn * 100}
              min={0}
              max={20}
              step={0.5}
              onChange={(v) => setAnnualInvestmentReturn(v / 100)}
              suffix="%"
              tooltip="The annual return you could earn by investing the deposit instead of using it to buy"
            />
          </div>
        </Disclosure>
      </div>

      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>10-year cumulative cost comparison</div>
      <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 16 }}>Effective cost of buying (including deposit opportunity cost) versus rent payments. Equity value is shown in the result above.</div>
      <ComparisonChart
        buyMonthly={effectiveBuyCost}
        rentMonthly={monthlyRent}
        currency={country.currency}
        locale={country.locale}
      />
    </div>
  );
}
