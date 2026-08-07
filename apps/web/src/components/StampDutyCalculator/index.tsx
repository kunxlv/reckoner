'use client';
import { useState } from 'react';
import type { CountryData, FxResult } from '@reckoner/finance-data';
import type { TransferTaxRuleSet } from '@reckoner/rules-core';
import { calculateTransferTax } from '@reckoner/transfer-tax-engine';
import { SliderInput, SegmentedControl, CurrencyToggle } from '@reckoner/ui';
import { formatCurrency } from '../../lib/format';
import { TaxCurveChart } from './TaxCurveChart';

interface StampDutyCalculatorProps {
  country: CountryData;
  ruleset: TransferTaxRuleSet;
  fxResult?: (FxResult & { rates: Record<string, number> }) | null;
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
  starter_vrijstelling: 'Starter exemption',
};

const STANDARD = '__standard__';

export function StampDutyCalculator({ country, ruleset, fxResult }: StampDutyCalculatorProps) {
  const defaultPrice = country.defaults.price;
  const [price, setPrice] = useState(defaultPrice);
  const [activeSurcharges, setActiveSurcharges] = useState<string[]>([]);
  const [activeRelief, setActiveRelief] = useState<string | null>(null);
  const [fxCurrency, setFxCurrency] = useState('EUR');
  const [customRatePct, setCustomRatePct] = useState(1.5);

  const isUS = ruleset.jurisdiction === 'US';
  const isNZ = ruleset.jurisdiction === 'NZ';

  const effectiveRuleset: TransferTaxRuleSet = isUS
    ? { ...ruleset, bands: [{ upTo: null as null, rate: customRatePct / 100 }] }
    : ruleset;

  const result = calculateTransferTax({ price, surcharges: activeSurcharges, relief: activeRelief }, effectiveRuleset);
  const effectiveRatePct = (result.effectiveRate * 100).toFixed(2);

  const fxRate = fxResult?.rates?.[fxCurrency];
  const convertedTax = fxResult && fxRate && result.tax > 0
    ? formatCurrency(result.tax * fxRate, fxCurrency, 'en-US') + ' ' + fxCurrency
    : null;

  function toggleSurcharge(id: string) {
    setActiveSurcharges((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  const reliefOptions = [
    { label: 'Standard buyer', value: STANDARD },
    ...ruleset.reliefs.map((r) => ({ label: RELIEF_LABELS[r.id] ?? r.id, value: r.id })),
  ];

  const reliefValue = activeRelief ?? STANDARD;

  return (
    <div>
      {/* Result card */}
      <div className="calc-panel-result" style={{ border: '1px solid var(--color-hairline)', padding: '28px 32px 24px' }}>
        <div style={{ fontSize: 12, color: 'var(--color-ink-mid)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>
          Stamp duty / Transfer tax
        </div>
        <div style={{ fontSize: 56, fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
          {formatCurrency(result.tax, ruleset.currency, country.locale)}
        </div>
        <div style={{ fontSize: 14, color: 'var(--color-ink-mid)', marginTop: 8 }}>
          {isNZ ? 'New Zealand does not have stamp duty or a transfer tax on residential property.' : `Effective rate: ${effectiveRatePct}%`}
        </div>

        {fxResult && !isNZ && (
          <div style={{ borderTop: '1px solid var(--color-hairline)', marginTop: 16, paddingTop: 16 }}>
            <CurrencyToggle
              convertedAmount={convertedTax}
              targetCurrency={fxCurrency}
              rateDate={fxResult.asOf}
              onCurrencyChange={(c) => setFxCurrency(c)}
            />
          </div>
        )}

        {result.breakdown.length > 1 && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-hairline)' }}>
            <div style={{ fontSize: 11, color: 'var(--color-ink-mid)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>
              Tax breakdown by band
            </div>
            {result.breakdown.map((line) => (
              <div
                key={line.label}
                style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--color-ink-mid)', marginBottom: 6 }}
              >
                <span style={{ textTransform: 'capitalize' }}>{line.label}</span>
                <span>{formatCurrency(line.amount, ruleset.currency, country.locale)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input panel */}
      <div className="calc-panel" style={{ border: '1px solid var(--color-hairline)', padding: '28px 32px', marginTop: 24, display: 'grid', gap: 26 }}>
        <SliderInput
          label="Property price"
          value={price}
          min={country.defaults.priceMin ?? 10000}
          max={country.defaults.priceMax ?? 5000000}
          step={country.defaults.priceStep ?? 5000}
          onChange={(v) => setPrice(v)}
          prefix={country.currencySymbol}
          helper="The purchase price  -  stamp duty is calculated on this amount"
          tooltip="The purchase price of the property  -  stamp duty is calculated on this amount"
        />

        {isUS && (
          <SliderInput
            label="Transfer tax rate"
            value={customRatePct}
            min={0}
            max={4}
            step={0.05}
            onChange={(v) => setCustomRatePct(parseFloat(v.toFixed(2)))}
            suffix="%"
            helper="Enter the rate for your state or county. There is no federal transfer tax in the US."
            tooltip="Real estate transfer tax rates vary by state and county. Enter the rate that applies to your location."
          />
        )}

        {ruleset.reliefs.length > 0 && (
          <SegmentedControl
            label="Buyer type"
            options={reliefOptions}
            value={reliefValue}
            onChange={(v) => setActiveRelief(v === STANDARD ? null : v)}
            tooltip="Your buyer status  -  some categories qualify for tax relief or exemptions"
          />
        )}

        {ruleset.surcharges.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-ink-mid)' }}>
              Additional factors
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ruleset.surcharges.map((s) => (
                <label
                  key={s.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={activeSurcharges.includes(s.id)}
                    onChange={() => toggleSurcharge(s.id)}
                    style={{ accentColor: 'var(--color-ink)', width: 16, height: 16, flexShrink: 0 }}
                  />
                  {SURCHARGE_LABELS[s.id] ?? s.id}
                  <span style={{ color: 'var(--color-ink-mid)', marginLeft: 'auto', paddingLeft: 12 }}>
                    +{(s.value * 100).toFixed(1)}%
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      {!isNZ && (
        <div style={{ marginTop: 32 }}>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>How stamp duty scales with price</div>
          <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginBottom: 16 }}>
            Tax amount and effective rate across the price range
          </div>
          <TaxCurveChart
            ruleset={effectiveRuleset}
            surcharges={activeSurcharges}
            relief={activeRelief}
            currentPrice={price}
            currency={effectiveRuleset.currency}
            locale={country.locale}
          />
        </div>
      )}
    </div>
  );
}
