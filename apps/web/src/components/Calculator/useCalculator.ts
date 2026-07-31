'use client';
import { useState, useMemo, useCallback } from 'react';
import { calculate } from '@reckoner/mortgage-engine';
import type { LoanInput, ScheduleResult } from '@reckoner/mortgage-engine';
import type { CountryData } from '@reckoner/finance-data';

export interface CalcState {
  price: number;
  deposit: number;
  rate: number;         // decimal
  termYears: number;
  periodsPerYear: 12 | 26 | 52;
  extraPayment: number;
  propertyTax: number;  // annual $
  insurance: number;    // annual $
  pmi: number;          // monthly $
  hoa: number;          // monthly $
}

function initState(country: CountryData, defaultRate: number): CalcState {
  return {
    price: country.defaults.price,
    deposit: country.defaults.deposit,
    rate: defaultRate,
    termYears: country.defaults.termYears,
    periodsPerYear: country.defaults.periodsPerYear,
    extraPayment: 0,
    propertyTax: 0,
    insurance: 0,
    pmi: 0,
    hoa: 0,
  };
}

export function useCalculator(country: CountryData, defaultRate: number, urlState?: Partial<CalcState>) {
  const [state, setState] = useState<CalcState>(() => ({
    ...initState(country, defaultRate),
    ...urlState,
  }));

  const update = useCallback(<K extends keyof CalcState>(key: K, value: CalcState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  }, []);

  const loanAmount = Math.max(0, state.price - state.deposit);

  const result = useMemo<ScheduleResult | null>(() => {
    if (loanAmount <= 0 || state.rate < 0 || state.termYears < 1) return null;
    const input: LoanInput = {
      principal: loanAmount,
      annualRate: state.rate,
      termYears: state.termYears,
      periodsPerYear: state.periodsPerYear,
      convention: country.convention,
      ...(state.extraPayment > 0 ? { extraPaymentPerPeriod: state.extraPayment } : {}),
    };
    return calculate(input);
  }, [loanAmount, state.rate, state.termYears, state.periodsPerYear, state.extraPayment, country.convention]);

  const baseResult = useMemo<ScheduleResult | null>(() => {
    if (!result || state.extraPayment <= 0 || loanAmount <= 0) return null;
    return calculate({
      principal: loanAmount,
      annualRate: state.rate,
      termYears: state.termYears,
      periodsPerYear: state.periodsPerYear,
      convention: country.convention,
    });
  }, [loanAmount, state.rate, state.termYears, state.periodsPerYear, country.convention, result, state.extraPayment]);

  // Monthly add-ons
  const monthlyTax = state.propertyTax / 12;
  const monthlyInsurance = state.insurance / 12;
  const monthlyAddOns = monthlyTax + monthlyInsurance + state.pmi + state.hoa;

  const depositPct = state.price > 0 ? (state.deposit / state.price) * 100 : 0;

  // Validation errors
  const errors: Partial<Record<keyof CalcState, string>> = {};
  if (state.price <= 0) errors.price = 'Enter an amount above 0.';
  if (state.deposit >= state.price && state.price > 0)
    errors.deposit = "Your down payment covers the full price — there's no mortgage to calculate.";
  if (state.rate > 0.25) errors.rate = 'Rates above 25% are unusual. Check the figure.';
  if (state.termYears < 1 || state.termYears > 40) errors.termYears = 'Enter a term between 1 and 40 years.';

  return { state, update, result, baseResult, loanAmount, depositPct, monthlyAddOns, errors };
}
