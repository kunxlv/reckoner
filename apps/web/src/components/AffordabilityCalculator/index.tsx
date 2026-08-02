'use client';
import { useState } from 'react';
import type { CountryData } from '@reckoner/finance-data';
import type { AffordabilityRuleSet } from '@reckoner/rules-core';
import { calculateAffordability } from '@reckoner/affordability-engine';
import { formatCurrency } from '../../lib/format';

interface AffordabilityCalculatorProps {
  country: CountryData;
  ruleset: AffordabilityRuleSet;
  defaultRate: number;
}

export function AffordabilityCalculator({ country, ruleset, defaultRate }: AffordabilityCalculatorProps) {
  const [grossIncome, setGrossIncome] = useState(80_000);
  const [monthlyDebts, setMonthlyDebts] = useState(0);
  const [propertyPrice, setPropertyPrice] = useState(country.defaults.price);
  const [annualRate, setAnnualRate] = useState(defaultRate);
  const [termYears, setTermYears] = useState(country.defaults.termYears);
  const [buyerType, setBuyerType] = useState<'first_time_buyer' | 'subsequent_buyer' | 'buy_to_let'>('first_time_buyer');

  const result = calculateAffordability(
    { grossAnnualIncome: grossIncome, monthlyDebts, propertyPrice, annualRate, termYears, buyerType },
    ruleset,
  );

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
          <label style={labelStyle}>Gross annual income ({country.currencySymbol})</label>
          <input
            type="number"
            value={grossIncome}
            min={0}
            step={1000}
            onChange={(e) => setGrossIncome(Number(e.target.value))}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Existing monthly debt payments ({country.currencySymbol})</label>
          <input
            type="number"
            value={monthlyDebts}
            min={0}
            step={100}
            onChange={(e) => setMonthlyDebts(Number(e.target.value))}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Property price ({country.currencySymbol})</label>
          <input
            type="number"
            value={propertyPrice}
            min={0}
            step={country.defaults.priceStep}
            onChange={(e) => setPropertyPrice(Number(e.target.value))}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Interest rate (%)</label>
          <input
            type="number"
            value={(annualRate * 100).toFixed(2)}
            min={0}
            max={20}
            step={0.1}
            onChange={(e) => setAnnualRate(Number(e.target.value) / 100)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Term (years)</label>
          <input
            type="number"
            value={termYears}
            min={5}
            max={40}
            step={1}
            onChange={(e) => setTermYears(Number(e.target.value))}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Buyer type</label>
          <select
            value={buyerType}
            onChange={(e) => setBuyerType(e.target.value as typeof buyerType)}
            style={{ ...inputStyle, fontSize: 14 }}
          >
            <option value="first_time_buyer">First-time buyer</option>
            <option value="subsequent_buyer">Subsequent buyer</option>
            <option value="buy_to_let">Buy to let</option>
          </select>
        </div>
      </div>

      <div style={{ background: 'var(--color-surface)', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 4 }}>Maximum borrowing</div>
            <div style={{ fontSize: 36, fontWeight: 300, letterSpacing: '-0.03em' }}>
              {formatCurrency(result.maxBorrow, country.currency, country.locale)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 4 }}>Monthly payment at this amount</div>
            <div style={{ fontSize: 36, fontWeight: 300, letterSpacing: '-0.03em' }}>
              {formatCurrency(result.maxMonthlyPayment, country.currency, country.locale)}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 16, fontSize: 13, color: 'var(--color-ink-mid)' }}>
          Assessed at {(result.assessmentRate * 100).toFixed(2)}% (stress rate)
          {' '}&middot;{' '}
          Binding constraint: {result.bindingConstraint.toUpperCase()}
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--color-ink-mid)', borderTop: '1px solid var(--color-hairline)', paddingTop: 12 }}>
          This is an estimate. Lenders also consider credit history, outgoings, and their own criteria.
        </div>
      </div>
    </div>
  );
}
