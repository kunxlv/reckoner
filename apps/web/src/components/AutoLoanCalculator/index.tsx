'use client';
import { useState } from 'react';
import type { CountryData, FxResult } from '@reckoner/finance-data';
import { calculateAutoLoan } from '@reckoner/loan-engine';
import { SliderInput, SegmentedControl, Disclosure, CurrencyToggle } from '@reckoner/ui';
import { formatCurrency } from '../../lib/format';
import { LoanBalanceChart } from '../PersonalLoanCalculator/LoanBalanceChart';

export interface AutoLoanDefaults {
  vehiclePrice: number;
  downPayment: number;
  tradeInValue: number;
  salesTaxRate: number;
  annualRate: number;
  termMonths: number;
}

interface AutoLoanCalculatorProps {
  country: CountryData;
  defaults: AutoLoanDefaults;
  fxResult?: (FxResult & { rates: Record<string, number> }) | null;
}

const TERM_OPTIONS = [
  { label: '2 yr', value: 24 },
  { label: '3 yr', value: 36 },
  { label: '4 yr', value: 48 },
  { label: '5 yr', value: 60 },
  { label: '6 yr', value: 72 },
];

export function AutoLoanCalculator({ country, defaults, fxResult }: AutoLoanCalculatorProps) {
  const [vehiclePrice, setVehiclePrice] = useState(defaults.vehiclePrice);
  const [downPayment, setDownPayment] = useState(defaults.downPayment);
  const [tradeInValue, setTradeInValue] = useState(defaults.tradeInValue);
  const [salesTaxRate, setSalesTaxRate] = useState(parseFloat((defaults.salesTaxRate * 100).toFixed(2)));
  const [annualRate, setAnnualRate] = useState(parseFloat((defaults.annualRate * 100).toFixed(2)));
  const [termMonths, setTermMonths] = useState(defaults.termMonths);
  const [docFee, setDocFee] = useState(0);
  const [fxCurrency, setFxCurrency] = useState('EUR');

  const result = calculateAutoLoan({
    vehiclePrice,
    downPayment,
    tradeInValue,
    salesTaxRate: salesTaxRate / 100,
    annualRate: annualRate / 100,
    termMonths,
    ...(docFee > 0 ? { docFee } : {}),
  });

  const { financedAmount, monthlyPayment, totalInterest, apr, schedule } = result;

  const fxRate = fxResult?.rates?.[fxCurrency];
  const convertedPayment = fxResult && fxRate && monthlyPayment > 0
    ? formatCurrency(monthlyPayment * fxRate, fxCurrency, 'en-US') + ' ' + fxCurrency
    : null;

  const vehiclePriceMax = Math.max(100000, defaults.vehiclePrice * 5);
  const vehiclePriceStep = defaults.vehiclePrice >= 500000 ? 10000 : 1000;
  const downPaymentMax = Math.max(50000, defaults.downPayment * 5);
  const downPaymentStep = defaults.downPayment >= 50000 ? 5000 : 500;
  const tradeInMax = Math.max(30000, (defaults.tradeInValue || 10000));

  const secondaries = [
    { label: 'Financed amount', value: formatCurrency(financedAmount, country.currency, country.locale) },
    { label: 'Total interest', value: formatCurrency(totalInterest, country.currency, country.locale) },
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
          label="Vehicle price"
          tooltip="The purchase price of the vehicle before any deductions"
          value={vehiclePrice}
          min={5000}
          max={vehiclePriceMax}
          step={vehiclePriceStep}
          onChange={(v) => setVehiclePrice(v)}
          prefix={country.currencySymbol}
        />
        <SliderInput
          label="Down payment"
          tooltip="Cash paid upfront  -  reduces the amount you finance and total interest paid"
          value={downPayment}
          min={0}
          max={downPaymentMax}
          step={downPaymentStep}
          onChange={(v) => setDownPayment(v)}
          prefix={country.currencySymbol}
        />
        <SliderInput
          label="Interest rate"
          tooltip="The yearly interest rate charged on the amount you finance"
          value={annualRate}
          min={0}
          max={30}
          step={0.1}
          onChange={(v) => setAnnualRate(v)}
          suffix="%"
        />
        <SegmentedControl
          label="Loan term"
          tooltip="The number of months over which the loan is repaid"
          options={TERM_OPTIONS}
          value={termMonths}
          onChange={(v) => setTermMonths(v)}
        />
        <Disclosure trigger="More options">
          <div style={{ paddingTop: 18, display: 'grid', gap: 26 }}>
            <SliderInput
              label="Trade-in value"
              tooltip="If you're trading in a vehicle, its value is applied against the purchase price"
              value={tradeInValue}
              min={0}
              max={tradeInMax}
              step={500}
              onChange={(v) => setTradeInValue(v)}
              prefix={country.currencySymbol}
            />
            <SliderInput
              label="Sales tax rate"
              tooltip="The tax rate applied to the vehicle purchase in your state or country"
              value={salesTaxRate}
              min={0}
              max={30}
              step={0.5}
              onChange={(v) => setSalesTaxRate(v)}
              suffix="%"
            />
            <SliderInput
              label="Documentation fee"
              tooltip="Fees charged by the dealer for paperwork  -  added to your total out-of-pocket cost"
              value={docFee}
              min={0}
              max={3000}
              step={50}
              onChange={(v) => setDocFee(v)}
              prefix={country.currencySymbol}
            />
          </div>
        </Disclosure>
      </div>

      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4, marginTop: 32 }}>
        Loan balance over time
      </div>
      <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 16 }}>
        Remaining balance and cumulative interest by month
      </div>
      <LoanBalanceChart
        schedule={schedule}
        currency={country.currency}
        locale={country.locale}
      />
    </div>
  );
}
