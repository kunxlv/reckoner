'use client';
import { useState } from 'react';
import type { CountryData } from '@reckoner/finance-data';
import { calculateAutoLoan } from '@reckoner/loan-engine';
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
}

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

const TERM_OPTIONS = [24, 36, 48, 60, 72, 84] as const;

export function AutoLoanCalculator({ country, defaults }: AutoLoanCalculatorProps) {
  const [vehiclePrice, setVehiclePrice] = useState(defaults.vehiclePrice);
  const [downPayment, setDownPayment] = useState(defaults.downPayment);
  const [tradeInValue, setTradeInValue] = useState(defaults.tradeInValue);
  const [salesTaxRate, setSalesTaxRate] = useState(parseFloat((defaults.salesTaxRate * 100).toFixed(2)));
  const [annualRate, setAnnualRate] = useState(parseFloat((defaults.annualRate * 100).toFixed(2)));
  const [termMonths, setTermMonths] = useState(defaults.termMonths);
  const [docFee, setDocFee] = useState(0);

  const result = calculateAutoLoan({
    vehiclePrice,
    downPayment,
    tradeInValue,
    salesTaxRate: salesTaxRate / 100,
    annualRate: annualRate / 100,
    termMonths,
    ...(docFee > 0 ? { docFee } : {}),
  });

  const { financedAmount, monthlyPayment, totalInterest, totalCost, apr, schedule } = result;

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          marginBottom: 24,
        }}
      >
        <div>
          <label style={labelStyle}>
            Vehicle price ({country.currencySymbol})
          </label>
          <input
            type="number"
            value={vehiclePrice}
            min={0}
            step={1000}
            onChange={(e) => setVehiclePrice(Number(e.target.value))}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>
            Down payment ({country.currencySymbol})
          </label>
          <input
            type="number"
            value={downPayment}
            min={0}
            step={500}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>
            Trade-in value ({country.currencySymbol})
          </label>
          <input
            type="number"
            value={tradeInValue}
            min={0}
            step={500}
            onChange={(e) => setTradeInValue(Number(e.target.value))}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Sales tax / VAT (%)</label>
          <input
            type="number"
            value={salesTaxRate}
            min={0}
            max={50}
            step={0.1}
            onChange={(e) => setSalesTaxRate(Number(e.target.value))}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Annual interest rate (%)</label>
          <input
            type="number"
            value={annualRate}
            min={0}
            max={50}
            step={0.1}
            onChange={(e) => setAnnualRate(Number(e.target.value))}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Loan term (months)</label>
          <select
            value={termMonths}
            onChange={(e) => setTermMonths(Number(e.target.value))}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            {TERM_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t} months ({(t / 12).toFixed(t % 12 === 0 ? 0 : 1)} yr)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>
            Documentation / dealer fee ({country.currencySymbol}, optional)
          </label>
          <input
            type="number"
            value={docFee}
            min={0}
            step={50}
            onChange={(e) => setDocFee(Number(e.target.value))}
            style={inputStyle}
          />
        </div>
      </div>

      <div
        style={{
          background: 'var(--color-surface)',
          padding: '24px',
          marginBottom: 32,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
            gap: 16,
          }}
        >
          {[
            { label: 'Financed amount', value: formatCurrency(financedAmount, country.currency, country.locale), accent: false },
            { label: 'Monthly payment', value: formatCurrency(monthlyPayment, country.currency, country.locale), accent: false },
            { label: 'Total interest', value: formatCurrency(totalInterest, country.currency, country.locale), accent: true },
            { label: 'Total out-of-pocket', value: formatCurrency(totalCost, country.currency, country.locale), accent: false },
            { label: 'APR', value: `${(apr * 100).toFixed(2)}%`, accent: false },
          ].map(({ label, value, accent }) => (
            <div key={label}>
              <div
                style={{
                  fontSize: 13,
                  color: 'var(--color-ink-mid)',
                  marginBottom: 4,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 300,
                  letterSpacing: '-0.03em',
                  color: accent ? 'var(--color-interest)' : 'var(--color-ink)',
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
        Loan balance over time
      </div>
      <div
        style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 16 }}
      >
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
