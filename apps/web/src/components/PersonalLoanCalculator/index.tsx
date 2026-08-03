'use client';
import { useState } from 'react';
import type { CountryData } from '@reckoner/finance-data';
import { calculateLoan } from '@reckoner/loan-engine';
import { formatCurrency } from '../../lib/format';
import { LoanBalanceChart } from './LoanBalanceChart';

interface PersonalLoanCalculatorProps {
  country: CountryData;
  defaultRate: number;
  defaultAmount: number;
  defaultTermMonths: number;
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

const TERM_OPTIONS = [12, 24, 36, 48, 60, 72, 84] as const;

export function PersonalLoanCalculator({
  country,
  defaultRate,
  defaultAmount,
  defaultTermMonths,
}: PersonalLoanCalculatorProps) {
  const [amount, setAmount] = useState(defaultAmount);
  const [rate, setRate] = useState(defaultRate * 100);
  const [termMonths, setTermMonths] = useState(defaultTermMonths);
  const [originationFee, setOriginationFee] = useState(0);

  const loanInput = originationFee
    ? { principal: amount, annualRate: rate / 100, termMonths, originationFee }
    : { principal: amount, annualRate: rate / 100, termMonths };
  const result = calculateLoan(loanInput);

  const { monthlyPayment, totalInterest, totalCost, apr, schedule } = result;

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
            Loan amount ({country.currencySymbol})
          </label>
          <input
            type="number"
            value={amount}
            min={100}
            step={500}
            onChange={(e) => setAmount(Number(e.target.value))}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Annual interest rate (%)</label>
          <input
            type="number"
            value={rate}
            min={0}
            max={50}
            step={0.1}
            onChange={(e) => setRate(Number(e.target.value))}
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
            Origination fee ({country.currencySymbol}, optional)
          </label>
          <input
            type="number"
            value={originationFee}
            min={0}
            step={50}
            onChange={(e) => setOriginationFee(Number(e.target.value))}
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
            gridTemplateColumns: '1fr 1fr 1fr 1fr',
            gap: 24,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 13,
                color: 'var(--color-ink-mid)',
                marginBottom: 4,
              }}
            >
              Monthly payment
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 300,
                letterSpacing: '-0.03em',
                color: 'var(--color-ink)',
              }}
            >
              {formatCurrency(monthlyPayment, country.currency, country.locale)}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                color: 'var(--color-ink-mid)',
                marginBottom: 4,
              }}
            >
              Total interest
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 300,
                letterSpacing: '-0.03em',
                color: 'var(--color-interest)',
              }}
            >
              {formatCurrency(totalInterest, country.currency, country.locale)}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                color: 'var(--color-ink-mid)',
                marginBottom: 4,
              }}
            >
              Total cost
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 300,
                letterSpacing: '-0.03em',
                color: 'var(--color-ink)',
              }}
            >
              {formatCurrency(totalCost, country.currency, country.locale)}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                color: 'var(--color-ink-mid)',
                marginBottom: 4,
              }}
            >
              APR
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 300,
                letterSpacing: '-0.03em',
                color: 'var(--color-ink)',
              }}
            >
              {(apr * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
        Balance and cumulative interest over time
      </div>
      <div
        style={{
          fontSize: 13,
          color: 'var(--color-ink-mid)',
          marginBottom: 16,
        }}
      >
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
