'use client';
import { useState } from 'react';
import type { CountryData } from '@reckoner/finance-data';
import { formatCurrency } from '../../lib/format';
import { calcRentVsBuy } from '../../lib/rentVsBuy';
import { FieldLabel } from '../ui/FieldLabel';
import { CurrencyInput } from '../ui/CurrencyInput';
import { ComparisonChart } from './ComparisonChart';

interface RentVsBuyCalculatorProps {
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

export function RentVsBuyCalculator({ country, defaultRate }: RentVsBuyCalculatorProps) {
  const [propertyPrice, setPropertyPrice] = useState(country.defaults.price);
  const [deposit, setDeposit] = useState(country.defaults.deposit);
  const [annualRate, setAnnualRate] = useState(defaultRate);
  const [termYears, setTermYears] = useState(country.defaults.termYears);
  const [monthlyRent, setMonthlyRent] = useState(Math.round(country.defaults.price * 0.004));
  const [annualAppreciation, setAnnualAppreciation] = useState(0.04);
  const [annualInvestmentReturn, setAnnualInvestmentReturn] = useState(0.07);

  const result = calcRentVsBuy({ propertyPrice, deposit, annualRate, termYears, monthlyRent, annualAppreciation, annualInvestmentReturn });
  const { mortgagePayment, effectiveBuyCost, netBuyAdvantage } = result;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div>
          <FieldLabel tooltip="The purchase price of the property you're considering buying">
            Property price
          </FieldLabel>
          <CurrencyInput
            currencySymbol={country.currencySymbol}
            type="number" value={propertyPrice} min={0} step={country.defaults.priceStep}
            onChange={(e) => setPropertyPrice(Number(e.target.value))}
          />
        </div>
        <div>
          <FieldLabel tooltip="The down payment amount you would put down">
            Deposit
          </FieldLabel>
          <CurrencyInput
            currencySymbol={country.currencySymbol}
            type="number" value={deposit} min={0} step={country.defaults.depositStep}
            onChange={(e) => setDeposit(Number(e.target.value))}
          />
        </div>
        <div>
          <FieldLabel tooltip="The annual interest rate on the mortgage">
            Mortgage rate (%)
          </FieldLabel>
          <input
            type="number"
            value={(annualRate * 100).toFixed(2)}
            min={0} max={20} step={0.1}
            onChange={(e) => setAnnualRate(Number(e.target.value) / 100)}
            style={inputStyle}
          />
        </div>
        <div>
          <FieldLabel tooltip="The duration of the mortgage in years">
            Mortgage term (years)
          </FieldLabel>
          <input
            type="number" value={termYears} min={1} max={40} step={1}
            onChange={(e) => setTermYears(Number(e.target.value))}
            style={inputStyle}
          />
        </div>
        <div>
          <FieldLabel tooltip="The monthly rent for comparable housing if you continue renting">
            Monthly rent
          </FieldLabel>
          <CurrencyInput
            currencySymbol={country.currencySymbol}
            type="number" value={monthlyRent} min={0} step={100}
            onChange={(e) => setMonthlyRent(Number(e.target.value))}
          />
        </div>
        <div>
          <FieldLabel tooltip="The expected average annual increase in the property's value">
            Annual property appreciation (%)
          </FieldLabel>
          <input
            type="number"
            value={(annualAppreciation * 100).toFixed(1)}
            min={-10} max={20} step={0.5}
            onChange={(e) => setAnnualAppreciation(Number(e.target.value) / 100)}
            style={inputStyle}
          />
        </div>
        <div>
          <FieldLabel tooltip="The annual return you could earn by investing the deposit instead of using it to buy">
            Deposit investment return (%)
          </FieldLabel>
          <input
            type="number"
            value={(annualInvestmentReturn * 100).toFixed(1)}
            min={0} max={20} step={0.5}
            onChange={(e) => setAnnualInvestmentReturn(Number(e.target.value) / 100)}
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ background: 'var(--color-surface)', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 4 }}>Monthly mortgage payment</div>
            <div style={{ fontSize: 28, fontWeight: 300, letterSpacing: '-0.03em' }}>
              {formatCurrency(mortgagePayment, country.currency, country.locale)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 4 }}>
              Effective monthly cost (incl. deposit opportunity cost)
            </div>
            <div style={{ fontSize: 28, fontWeight: 300, letterSpacing: '-0.03em' }}>
              {formatCurrency(effectiveBuyCost, country.currency, country.locale)}
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--color-hairline)', paddingTop: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 4 }}>
            Net financial advantage of buying over renting (10-year horizon)
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 300,
              letterSpacing: '-0.03em',
              color: netBuyAdvantage >= 0 ? 'var(--color-ink)' : 'var(--color-ink-mid)',
            }}
          >
            {netBuyAdvantage >= 0 ? '+' : ''}{formatCurrency(netBuyAdvantage, country.currency, country.locale)}
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginTop: 4 }}>
            {netBuyAdvantage >= 0
              ? 'Buying is ahead over 10 years with these assumptions.'
              : 'Renting is ahead over 10 years with these assumptions.'}
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
          Excludes maintenance, insurance, transaction costs, and tax effects. This is illustrative only.
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>10-year cumulative cost comparison</div>
        <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 16 }}>Effective cost of buying (including deposit opportunity cost) versus rent payments. Equity value is shown in the result above.</div>
        <ComparisonChart
          buyMonthly={effectiveBuyCost}
          rentMonthly={monthlyRent}
          currency={country.currency}
          locale={country.locale}
        />
      </div>
    </div>
  );
}
