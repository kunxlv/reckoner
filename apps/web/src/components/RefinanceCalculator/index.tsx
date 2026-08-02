'use client';
import { useState } from 'react';
import type { CountryData } from '@reckoner/finance-data';
import { formatCurrency } from '../../lib/format';

interface RefinanceCalculatorProps {
  country: CountryData;
  defaultRate: number;
}

function monthlyPayment(principal: number, annualRate: number, termYears: number): number {
  if (principal <= 0 || termYears <= 0) return 0;
  const i = annualRate / 12;
  const n = termYears * 12;
  if (i === 0) return principal / n;
  return (principal * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
}

export function RefinanceCalculator({ country, defaultRate }: RefinanceCalculatorProps) {
  const [balance, setBalance] = useState(country.defaults.price * 0.7);
  const [currentRate, setCurrentRate] = useState(defaultRate + 0.01);
  const [newRate, setNewRate] = useState(defaultRate);
  const [remainingYears, setRemainingYears] = useState(25);
  const [closingCosts, setClosingCosts] = useState(3000);

  const currentPayment = monthlyPayment(balance, currentRate, remainingYears);
  const newPayment = monthlyPayment(balance, newRate, remainingYears);
  const monthlySavings = currentPayment - newPayment;
  const breakEvenMonths = monthlySavings > 0 ? Math.ceil(closingCosts / monthlySavings) : null;
  const totalSavingOverTerm = monthlySavings * remainingYears * 12 - closingCosts;

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

  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 } as const;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div>
          <label style={labelStyle}>Outstanding balance ({country.currencySymbol})</label>
          <input
            type="number"
            value={balance}
            min={0}
            step={10000}
            onChange={(e) => setBalance(Number(e.target.value))}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Years remaining on current loan</label>
          <input
            type="number"
            value={remainingYears}
            min={1}
            max={40}
            step={1}
            onChange={(e) => setRemainingYears(Number(e.target.value))}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Current interest rate (%)</label>
          <input
            type="number"
            value={(currentRate * 100).toFixed(2)}
            min={0}
            max={20}
            step={0.1}
            onChange={(e) => setCurrentRate(Number(e.target.value) / 100)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>New interest rate (%)</label>
          <input
            type="number"
            value={(newRate * 100).toFixed(2)}
            min={0}
            max={20}
            step={0.1}
            onChange={(e) => setNewRate(Number(e.target.value) / 100)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Refinancing costs ({country.currencySymbol})</label>
          <input
            type="number"
            value={closingCosts}
            min={0}
            step={100}
            onChange={(e) => setClosingCosts(Number(e.target.value))}
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ background: 'var(--color-surface)', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 4 }}>Monthly saving</div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 300,
                letterSpacing: '-0.03em',
                color: monthlySavings > 0 ? 'var(--color-ink)' : 'var(--color-ink-mid)',
              }}
            >
              {formatCurrency(monthlySavings, country.currency, country.locale)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 4 }}>Break-even</div>
            <div style={{ fontSize: 32, fontWeight: 300, letterSpacing: '-0.03em' }}>
              {breakEvenMonths !== null ? `${breakEvenMonths} months` : 'No saving'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 4 }}>Saving over remaining term</div>
            <div style={{ fontSize: 32, fontWeight: 300, letterSpacing: '-0.03em' }}>
              {formatCurrency(totalSavingOverTerm, country.currency, country.locale)}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid var(--color-hairline)',
            fontSize: 13,
            lineHeight: 1.55,
            color: 'var(--color-ink-mid)',
          }}
        >
          This covers principal and interest only. If you are breaking a fixed-rate term early, check your
          lender&apos;s early repayment charge first -- it may exceed the saving.
        </div>
      </div>
    </div>
  );
}
