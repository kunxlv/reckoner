'use client';
import { useEffect, useState } from 'react';
import { SliderInput, SegmentedControl, Disclosure, ResultCard, CurrencyToggle, GeoBanner } from '@reckoner/ui';
import type { CountryData } from '@reckoner/finance-data';
import type { RateResult, FxResult } from '@reckoner/finance-data';
import { track } from '@reckoner/analytics';
import { useCalculator } from './useCalculator';
import { usePermalink, decodeState } from './usePermalink';
import { formatCurrency, formatDate, formatRate } from '../../lib/format';

interface CalculatorProps {
  country: CountryData;
  rateResult: RateResult | null;
  fxResult: (FxResult & { rates: Record<string, number> }) | null;
  urlSearch?: string;
}

const TERM_OPTIONS = [
  { label: '15', value: 15 },
  { label: '20', value: 20 },
  { label: '25', value: 25 },
  { label: '30', value: 30 },
];

const FREQ_OPTIONS = [
  { label: 'Monthly', value: 12 as const },
  { label: 'Fortnightly', value: 26 as const },
  { label: 'Weekly', value: 52 as const },
];

export function Calculator({ country, rateResult, fxResult, urlSearch }: CalculatorProps) {
  const defaultRate = rateResult?.value ?? country.defaults.rate;
  const urlState = urlSearch ? decodeState(urlSearch) : {};
  const { state, update, result, baseResult, loanAmount, depositPct, monthlyAddOns, errors } = useCalculator(country, defaultRate, urlState);
  const { copyLink } = usePermalink(state);
  const [fxCurrency, setFxCurrency] = useState('EUR');
  const [linkCopied, setLinkCopied] = useState(false);

  const isUS = country.code === 'us';
  const isAUNZ = country.code === 'au' || country.code === 'nz';

  useEffect(() => {
    track({ name: 'calc_used', props: { cc: country.code, convention: country.convention } });
  }, [country.code, country.convention]);

  function handleCopyLink() {
    copyLink();
    setLinkCopied(true);
    track({ name: 'permalink_copied', props: { cc: country.code } });
    setTimeout(() => setLinkCopied(false), 2000);
  }

  // For result card
  const displayPayment = result
    ? formatCurrency(result.payment + (state.periodsPerYear === 12 ? monthlyAddOns : 0), country.currency, country.locale)
    : '-';

  const paymentLabel = monthlyAddOns > 0 ? 'Principal, interest, tax and insurance' : 'Principal and interest';

  const totalInterestDisplay = result ? formatCurrency(result.totalInterest, country.currency, country.locale) : '-';
  const totalPaidDisplay = result ? formatCurrency(result.totalPaid + (monthlyAddOns > 0 ? monthlyAddOns * result.payoffPeriod : 0), country.currency, country.locale) : '-';
  const payoffDisplay = result ? formatDate(result.payoffDate, country.locale) : '-';

  // FX conversion
  const fxRate = fxResult?.rates?.[fxCurrency];
  const convertedPayment = result && fxRate && fxResult
    ? `${formatCurrency(result.payment * fxRate, fxCurrency, 'en-US')} ${fxCurrency}`
    : null;

  // Overpayment callout
  let overpaymentCallout: string | undefined;
  if (result && baseResult && state.extraPayment > 0) {
    const savedInterest = baseResult.totalInterest - result.totalInterest;
    const savedPeriods = baseResult.payoffPeriod - result.payoffPeriod;
    const savedYears = Math.floor(savedPeriods / (state.periodsPerYear));
    const savedMonths = Math.round((savedPeriods % state.periodsPerYear) / (state.periodsPerYear / 12));
    const extraFmt = formatCurrency(state.extraPayment, country.currency, country.locale);
    overpaymentCallout = `Paying ${extraFmt} extra each month clears the loan ${savedYears > 0 ? `${savedYears} year${savedYears !== 1 ? 's' : ''} ` : ''}${savedMonths > 0 ? `${savedMonths} month${savedMonths !== 1 ? 's' : ''} ` : ''}early and saves ${formatCurrency(savedInterest, country.currency, country.locale)} in interest.`;
  }

  const depositLabel = isUS ? 'Down payment' : 'Deposit';
  const depositHelper = isUS
    ? (depositPct < 20 ? 'Under 20% usually means paying PMI.' : undefined)
    : 'A bigger deposit usually gets you a better rate.';

  // Deposit % secondary field
  const depositPctField = (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      border: '1px solid var(--color-hairline)', borderRadius: 0,
      padding: '8px 12px', width: 64,
      background: 'var(--color-canvas)', flexShrink: 0,
    }} className="deposit-pct-badge">
      <span style={{
        fontSize: 16, width: '100%', textAlign: 'right',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {Math.min(100, depositPct).toFixed(0)}
      </span>
      <span style={{ color: 'var(--color-ink-mid)', marginLeft: 4 }}>%</span>
    </span>
  );

  return (
    <div>
      {/* Result card */}
      <ResultCard
        monthlyPayment={displayPayment}
        paymentLabel={paymentLabel}
        totalInterest={totalInterestDisplay}
        totalPaid={totalPaidDisplay}
        payoffDate={payoffDisplay}
        {...(fxResult ? {
          conversionLine: (
            <CurrencyToggle
              convertedAmount={convertedPayment}
              targetCurrency={fxCurrency}
              rateDate={fxResult.asOf}
              rateStale={false}
              onCurrencyChange={(c) => { setFxCurrency(c); track({ name: 'currency_toggled', props: { target: c } }); }}
            />
          )
        } : {})}
        {...(overpaymentCallout ? { overpaymentCallout } : {})}
        shareButton={
          <button
            type="button"
            onClick={handleCopyLink}
            style={{
              fontSize: 13, color: 'var(--color-ink-mid)', background: 'none', border: 'none',
              cursor: 'pointer', padding: 0, textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            {linkCopied ? 'Link copied' : 'Copy link to these figures'}
          </button>
        }
      />

      {/* Rate provenance */}
      {rateResult && (
        <p style={{ fontSize: 13, color: 'var(--color-ink-mid)', margin: '8px 0 0', lineHeight: 1.45 }}>
          Prefilled with the {rateResult.source} of <strong style={{ fontWeight: 500 }}>{formatRate(rateResult.value)}%</strong>, {rateResult.asOf}.{' '}
          Your quoted rate depends on credit score, down payment, loan type and location.
        </p>
      )}

      {/* Inputs */}
      <div className="calc-panel" style={{
        background: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 0,
        padding: '28px 32px', marginTop: 24, display: 'grid', gap: 26,
      }}>
        <SliderInput
          label="Home price"
          value={state.price}
          min={country.defaults.priceMin}
          max={country.defaults.priceMax}
          step={country.defaults.priceStep}
          onChange={(v) => update('price', v)}
          prefix={country.currencySymbol}
          {...(errors.price ? { error: errors.price } : {})}
        />
        <SliderInput
          label={depositLabel}
          value={state.deposit}
          min={0}
          max={state.price}
          step={country.defaults.depositStep}
          onChange={(v) => update('deposit', v)}
          prefix={country.currencySymbol}
          {...(depositHelper ? { helper: depositHelper } : {})}
          {...(errors.deposit ? { error: errors.deposit } : {})}
          secondaryField={depositPctField}
        />
        <SliderInput
          label="Interest rate"
          value={state.rate * 100}
          min={0}
          max={20}
          step={0.05}
          onChange={(v) => update('rate', v / 100)}
          suffix="%"
          {...(errors.rate ? { error: errors.rate } : {})}
        />

        <SegmentedControl
          label="Term"
          options={TERM_OPTIONS}
          value={TERM_OPTIONS.find((o) => o.value === state.termYears) ? state.termYears : 30}
          onChange={(v) => update('termYears', v)}
        />

        {isAUNZ && (
          <SegmentedControl
            label="Repay"
            options={FREQ_OPTIONS}
            value={state.periodsPerYear}
            onChange={(v) => update('periodsPerYear', v)}
          />
        )}

        <Disclosure
          trigger={isUS ? 'Add property tax, insurance and PMI' : 'Add taxes, insurance and fees'}
          helper="Optional. Affects your total monthly cost, not the loan itself."
          onOpen={() => track({ name: 'disclosure_opened', props: { cc: country.code } })}
        >
          <div style={{ display: 'grid', gap: 18 }}>
            {country.propertyTax && (
              <div className="inline-field-row">
                <span>
                  <label style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Property tax</label>
                  <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginTop: 2 }}>National average. Your area may differ.</div>
                </span>
                <span className="inline-field-box" style={{ border: '1px solid var(--color-hairline)' }}>
                  <span style={{ color: 'var(--color-ink-mid)' }}>{country.currencySymbol}/yr</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={state.propertyTax}
                    onChange={(e) => { const n = Number(e.target.value.replace(/,/g, '')); if (!Number.isNaN(n)) update('propertyTax', n); }}
                    style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 16, width: '100%', textAlign: 'right' }}
                  />
                </span>
              </div>
            )}
            <div className="inline-field-row">
              <label style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Home insurance</label>
              <span className="inline-field-box" style={{ border: '1px solid var(--color-hairline)' }}>
                <span style={{ color: 'var(--color-ink-mid)' }}>{country.currencySymbol}/yr</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={state.insurance}
                  onChange={(e) => { const n = Number(e.target.value.replace(/,/g, '')); if (!Number.isNaN(n)) update('insurance', n); }}
                  style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 16, width: '100%', textAlign: 'right' }}
                />
              </span>
            </div>
            {isUS && (
              <div className="inline-field-row">
                <span>
                  <label style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>PMI</label>
                  <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginTop: 2 }}>Drops off automatically at 78% loan-to-value.</div>
                </span>
                <span className="inline-field-box" style={{ border: '1px solid var(--color-hairline)' }}>
                  <span style={{ color: 'var(--color-ink-mid)' }}>{country.currencySymbol}/mo</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={state.pmi}
                    onChange={(e) => { const n = Number(e.target.value.replace(/,/g, '')); if (!Number.isNaN(n)) update('pmi', n); }}
                    style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 16, width: '100%', textAlign: 'right' }}
                  />
                </span>
              </div>
            )}
            <div className="inline-field-row">
              <span>
                <label style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Extra monthly payment</label>
                <div style={{ fontSize: 13, color: 'var(--color-ink-mid)', marginTop: 2 }}>See what even a small amount does to your total interest.</div>
              </span>
              <span className="inline-field-box" style={{ border: '1px solid var(--color-hairline)' }}>
                <span style={{ color: 'var(--color-ink-mid)' }}>{country.currencySymbol}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={state.extraPayment}
                  onChange={(e) => {
                    const n = Number(e.target.value.replace(/,/g, ''));
                    if (!Number.isNaN(n)) {
                      update('extraPayment', n);
                      if (n > 0) track({ name: 'extra_payment_used', props: { cc: country.code, amount: n } });
                    }
                  }}
                  style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 16, width: '100%', textAlign: 'right' }}
                />
              </span>
            </div>
          </div>
        </Disclosure>
      </div>
    </div>
  );
}
