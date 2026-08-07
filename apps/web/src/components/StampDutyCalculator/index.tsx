'use client';
import { useState } from 'react';
import type { CountryData } from '@reckoner/finance-data';
import type { TransferTaxRuleSet } from '@reckoner/rules-core';
import { calculateTransferTax } from '@reckoner/transfer-tax-engine';
import { formatCurrency } from '../../lib/format';
import { FieldLabel } from '../ui/FieldLabel';
import { TaxCurveChart } from './TaxCurveChart';

interface StampDutyCalculatorProps {
  country: CountryData;
  ruleset: TransferTaxRuleSet;
}

const SURCHARGE_LABELS: Record<string, string> = {
  additional_property: 'Additional / second property',
  non_resident: 'Non-resident buyer',
  foreign_buyer: 'Foreign buyer (ABSD)',
  sc_second_property: 'Singapore citizen: second property',
  sc_third_plus: 'Singapore citizen: third or more',
  pr_first_property: 'Singapore PR: first property',
  pr_second_plus: 'Singapore PR: second or more',
  investor: 'Investor / not primary residence',
  foreign_purchaser: 'Foreign purchaser surcharge',
};

const RELIEF_LABELS: Record<string, string> = {
  first_time_buyer: 'First-time buyer',
  first_home_buyer: 'First home buyer',
  starter_vrijstelling: 'Starter exemption (under threshold)',
};

export function StampDutyCalculator({ country, ruleset }: StampDutyCalculatorProps) {
  const defaultPrice = country.defaults.price;
  const [price, setPrice] = useState(defaultPrice);
  const [activeSurcharges, setActiveSurcharges] = useState<string[]>([]);
  const [activeRelief, setActiveRelief] = useState<string | null>(null);

  const result = calculateTransferTax({ price, surcharges: activeSurcharges, relief: activeRelief }, ruleset);

  function toggleSurcharge(id: string) {
    setActiveSurcharges((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  const effectiveRatePct = (result.effectiveRate * 100).toFixed(2);

  return (
    <div>
      {/* Price input */}
      <div style={{ marginBottom: 24 }}>
        <FieldLabel tooltip="The purchase price of the property — stamp duty is calculated on this amount" style={{ marginBottom: 8 }}>
          Property price
        </FieldLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 16, color: 'var(--color-ink-mid)' }}>{country.currencySymbol}</span>
          <input
            type="number"
            value={price}
            min={0}
            step={country.defaults.priceStep}
            onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
            style={{
              fontSize: 24, fontWeight: 400, border: 'none', borderBottom: '2px solid var(--color-ink)',
              background: 'transparent', outline: 'none', width: '100%', color: 'var(--color-ink)',
              padding: '4px 0',
            }}
          />
        </div>
        <input
          type="range"
          min={country.defaults.priceMin}
          max={country.defaults.priceMax}
          step={country.defaults.priceStep}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          style={{ width: '100%', marginTop: 12, accentColor: 'var(--color-ink)' }}
        />
      </div>

      {/* Buyer type (reliefs) */}
      {ruleset.reliefs.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Buyer type</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button
              type="button"
              onClick={() => setActiveRelief(null)}
              style={{
                fontSize: 13, padding: '6px 14px', border: '1px solid var(--color-ink)',
                background: activeRelief === null ? 'var(--color-ink)' : 'transparent',
                color: activeRelief === null ? 'var(--color-canvas)' : 'var(--color-ink)',
                cursor: 'pointer',
              }}
            >
              Standard buyer
            </button>
            {ruleset.reliefs.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setActiveRelief(activeRelief === r.id ? null : r.id)}
                style={{
                  fontSize: 13, padding: '6px 14px', border: '1px solid var(--color-ink)',
                  background: activeRelief === r.id ? 'var(--color-ink)' : 'transparent',
                  color: activeRelief === r.id ? 'var(--color-canvas)' : 'var(--color-ink)',
                  cursor: 'pointer',
                }}
              >
                {RELIEF_LABELS[r.id] ?? r.id}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Surcharges */}
      {ruleset.surcharges.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Additional factors</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ruleset.surcharges.map((s) => (
              <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={activeSurcharges.includes(s.id)}
                  onChange={() => toggleSurcharge(s.id)}
                  style={{ accentColor: 'var(--color-ink)' }}
                />
                {SURCHARGE_LABELS[s.id] ?? s.id} (+{(s.value * 100).toFixed(1)}%)
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      <div style={{ background: 'var(--color-surface)', padding: '24px', marginTop: 8 }}>
        <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 4 }}>
          Stamp duty / transfer tax
        </div>
        <div style={{ fontSize: 40, fontWeight: 300, letterSpacing: '-0.03em', color: 'var(--color-ink)' }}>
          {formatCurrency(result.tax, ruleset.currency, country.locale)}
        </div>
        <div style={{ fontSize: 14, color: 'var(--color-ink-mid)', marginTop: 4 }}>
          Effective rate: {effectiveRatePct}%
        </div>
        {result.breakdown.length > 1 && (
          <div style={{ marginTop: 16, borderTop: '1px solid var(--color-hairline)', paddingTop: 16 }}>
            {result.breakdown.map((line) => (
              <div key={line.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 4 }}>
                <span style={{ textTransform: 'capitalize' }}>{line.label}</span>
                <span>{formatCurrency(line.amount, ruleset.currency, country.locale)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 32 }}>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>How stamp duty scales with price</div>
        <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 16 }}>Tax amount and effective rate across the price range</div>
        <TaxCurveChart
          ruleset={ruleset}
          surcharges={activeSurcharges}
          relief={activeRelief}
          currentPrice={price}
          currency={ruleset.currency}
          locale={country.locale}
        />
      </div>
    </div>
  );
}
