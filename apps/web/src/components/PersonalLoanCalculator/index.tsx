'use client';
import { useState } from 'react';
import type { CountryData, FxResult } from '@reckoner/finance-data';
import { calculateLoan } from '@reckoner/loan-engine';
import { SliderInput, SegmentedControl, Disclosure, CurrencyToggle } from '@reckoner/ui';
import { formatCurrency } from '../../lib/format';
import { LoanBalanceChart } from './LoanBalanceChart';

interface PersonalLoanCalculatorProps {
  country: CountryData;
  defaultRate: number;
  defaultAmount: number;
  defaultTermMonths: number;
  fxResult?: (FxResult & { rates: Record<string, number> }) | null;
}

const TERM_OPTIONS = [
  { label: '2 yr', value: 24 },
  { label: '3 yr', value: 36 },
  { label: '4 yr', value: 48 },
  { label: '5 yr', value: 60 },
  { label: '7 yr', value: 84 },
];

export function PersonalLoanCalculator({
  country,
  defaultRate,
  defaultAmount,
  defaultTermMonths,
  fxResult,
}: PersonalLoanCalculatorProps) {
  const [amount, setAmount] = useState(defaultAmount);
  const [rate, setRate] = useState(parseFloat((defaultRate * 100).toFixed(2)));
  const [termMonths, setTermMonths] = useState(defaultTermMonths);
  const [originationFee, setOriginationFee] = useState(0);
  const [fxCurrency, setFxCurrency] = useState('EUR');

  const loanInput = originationFee
    ? { principal: amount, annualRate: rate / 100, termMonths, originationFee }
    : { principal: amount, annualRate: rate / 100, termMonths };
  const result = calculateLoan(loanInput);

  const { monthlyPayment, totalInterest, totalCost, apr, schedule } = result;

  const fxRate = fxResult?.rates?.[fxCurrency];
  const convertedPayment = fxResult && fxRate && monthlyPayment > 0
    ? formatCurrency(monthlyPayment * fxRate, fxCurrency, 'en-US') + ' ' + fxCurrency
    : null;

  const amountMax = Math.max(50000, defaultAmount * 5);
  const amountStep = defaultAmount >= 100000 ? 10000 : 1000;

  const secondaries = [
    { label: 'Total interest', value: formatCurrency(totalInterest, country.currency, country.locale) },
    { label: 'Total cost', value: formatCurrency(totalCost, country.currency, country.locale) },
    { label: 'APR', value: `${(apr * 100).toFixed(2)}%` },
  ];

  return (
    <div>
      <div className="calc-panel-result" style={{ border: '1px solid var(--color-hairline)', padding: '28px 32px 24px' }}>
        <div style={{ fontSize: 12, color: 'var(--color-ink-mid)', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.06em', fontWeight: 500 }}>
          Monthly payment
        </div>
        <div style={{ fontSize: 56, fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
          {formatCurrency(monthlyPayment, country.currency, country.locale)}
        </div>
        {fxResult && (
          <div style={{ borderTop: '1px solid var(--color-hairline)', marginTop: 16, paddingTop: 16 }}>
            <CurrencyToggle convertedAmount={convertedPayment} targetCurrency={fxCurrency} rateDate={fxResult.asOf} onCurrencyChange={(c) => setFxCurrency(c)} />
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

      <div className="calc-panel" style={{ border: '1px solid var(--color-hairline)', padding: '28px 32px', marginTop: 24, display: 'grid', gap: 26 }}>
        <SliderInput
          label="Loan amount"
          tooltip="The total amount you want to borrow"
          value={amount}
          min={1000}
          max={amountMax}
          step={amountStep}
          onChange={(v) => setAmount(v)}
          prefix={country.currencySymbol}
        />
        <SliderInput
          label="Interest rate"
          tooltip="The nominal yearly interest rate charged on the outstanding balance"
          value={rate}
          min={0}
          max={50}
          step={0.1}
          onChange={(v) => setRate(v)}
          suffix="%"
        />
        <SegmentedControl
          label="Loan term"
          tooltip="The duration over which you repay the loan in equal monthly instalments"
          options={TERM_OPTIONS}
          value={termMonths}
          onChange={(v) => setTermMonths(v)}
        />
        <Disclosure trigger="Add origination fee">
          <div style={{ paddingTop: 18 }}>
            <SliderInput
              label="Origination fee"
              tooltip="A one-time upfront fee charged by the lender  -  this is factored into the APR shown below"
              value={originationFee}
              min={0}
              max={5000}
              step={50}
              onChange={(v) => setOriginationFee(v)}
              prefix={country.currencySymbol}
            />
          </div>
        </Disclosure>
      </div>

      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4, marginTop: 32 }}>
        Balance and cumulative interest over time
      </div>
      <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 16 }}>
        Month-by-month breakdown
      </div>
      <LoanBalanceChart
        schedule={schedule}
        currency={country.currency}
        locale={country.locale}
      />
    </div>
  );
}
