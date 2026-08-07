'use client';
import { useState } from 'react';
import type { CountryData } from '@reckoner/finance-data';
import { formatCurrency } from '../../lib/format';
import { calcRefinance } from '../../lib/refinance';
import { FieldLabel } from '../ui/FieldLabel';
import { CurrencyInput } from '../ui/CurrencyInput';
import { BreakEvenChart } from './BreakEvenChart';

interface RefinanceCalculatorProps {
  country: CountryData;
  defaultRate: number;
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

export function RefinanceCalculator({ country, defaultRate }: RefinanceCalculatorProps) {
  const [balance, setBalance] = useState(country.defaults.price * 0.7);
  const [currentRate, setCurrentRate] = useState(defaultRate + 0.01);
  const [newRate, setNewRate] = useState(defaultRate);
  const [remainingYears, setRemainingYears] = useState(25);
  const [closingCosts, setClosingCosts] = useState(3000);

  const result = calcRefinance({ balance, currentRate, newRate, remainingYears, closingCosts });
  const { monthlySavings, breakEvenMonths, totalSavingOverTerm } = result;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div>
          <FieldLabel tooltip="The remaining principal on your current mortgage">
            Outstanding balance
          </FieldLabel>
          <CurrencyInput
            currencySymbol={country.currencySymbol}
            type="number" value={balance} min={0} step={10000}
            onChange={(e) => setBalance(Number(e.target.value))}
          />
        </div>
        <div>
          <FieldLabel tooltip="How many years are left on your current loan">
            Years remaining on current loan
          </FieldLabel>
          <input
            type="number" value={remainingYears} min={1} max={40} step={1}
            onChange={(e) => setRemainingYears(Number(e.target.value))}
            style={inputStyle}
          />
        </div>
        <div>
          <FieldLabel tooltip="Your existing mortgage interest rate">
            Current interest rate (%)
          </FieldLabel>
          <input
            type="number"
            value={(currentRate * 100).toFixed(2)}
            min={0} max={20} step={0.1}
            onChange={(e) => setCurrentRate(Number(e.target.value) / 100)}
            style={inputStyle}
          />
        </div>
        <div>
          <FieldLabel tooltip="The rate being offered on the refinanced loan">
            New interest rate (%)
          </FieldLabel>
          <input
            type="number"
            value={(newRate * 100).toFixed(2)}
            min={0} max={20} step={0.1}
            onChange={(e) => setNewRate(Number(e.target.value) / 100)}
            style={inputStyle}
          />
        </div>
        <div>
          <FieldLabel tooltip="Total costs to set up the new loan (fees, legal, etc.) — affects your break-even timeline">
            Refinancing costs
          </FieldLabel>
          <CurrencyInput
            currencySymbol={country.currencySymbol}
            type="number" value={closingCosts} min={0} step={100}
            onChange={(e) => setClosingCosts(Number(e.target.value))}
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
          lender&apos;s early repayment charge first. It may exceed the saving.
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
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
    </div>
  );
}
