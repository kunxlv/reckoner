import type { Metadata } from 'next';
import type { CountryCode } from './types';
import { getMortgageHreflang, getCanonical } from './hreflang';

const TITLES: Record<CountryCode, string> = {
  us: 'Mortgage Calculator with Amortization Schedule | Reckoner',
  uk: 'Mortgage Calculator UK:Monthly Repayments & Overpayments | Reckoner',
  ca: 'Canadian Mortgage Calculator:Semi-Annual Compounding | Reckoner',
  au: 'Home Loan Repayment Calculator Australia | Reckoner',
  ie: 'Mortgage Calculator Ireland:Repayments & LTV Limits | Reckoner',
  de: 'Baufinanzierung Calculator:Rate, Tilgung & Restschuld | Reckoner',
  nl: 'Dutch Mortgage Calculator:Annuïteiten vs Lineair | Reckoner',
  nz: 'Home Loan Calculator NZ:Weekly, Fortnightly, Monthly | Reckoner',
  fr: 'French Mortgage Calculator:Mensualité and Coût Total | Reckoner',
  es: 'Spanish Mortgage Calculator:Resident and Non-Resident | Reckoner',
  sg: 'Home Loan Calculator Singapore:TDSR and Monthly Instalment | Reckoner',
  in: 'Home Loan EMI Calculator:Schedule and Prepayment Savings | Reckoner',
};

const DESCRIPTIONS: Record<CountryCode, string> = {
  us: 'Work out your monthly mortgage payment, total interest and full amortization schedule. Prefilled with this week\'s Freddie Mac 30-year average. Free, no signup.',
  uk: 'Work out UK mortgage repayments, total interest and overpayment savings. Shows what happens when your fixed period ends. Free, no signup.',
  ca: 'Canadian mortgage payments calculated with proper semi-annual compounding, not the US monthly shortcut. Bank of Canada posted rates. Free.',
  au: 'Australian home loan repayments with monthly, fortnightly and weekly options. See how much fortnightly repayments save. RBA rate data.',
  ie: 'Irish mortgage repayments with Central Bank loan-to-income and loan-to-value limits built in. ECB-sourced rates. Free, no signup.',
  de: 'Calculate your Annuitätendarlehen monthly rate and the Restschuld left at the end of your Zinsbindung. ECB-sourced rates. Free.',
  nl: 'Compare annuity and linear Dutch mortgage repayments side by side, with full amortisation schedule. ECB-sourced rates. Free.',
  nz: 'New Zealand home loan repayments across weekly, fortnightly and monthly schedules, with total interest and payoff date. Free.',
  fr: 'French mortgage repayments including assurance emprunteur, with total cost of credit and full schedule. ECB-sourced rates. Free.',
  es: 'Spanish mortgage repayments for residents and non-resident buyers, with LTV limits and purchase costs. ECB-sourced rates. Free.',
  sg: 'Singapore home loan instalments with TDSR and MSR limits, total interest and full repayment schedule. Free, no signup.',
  in: 'Calculate your home loan EMI, full amortisation schedule, and how much a prepayment saves in interest. Free, no signup.',
};

export function getMortgageMetadata(cc: CountryCode): Metadata {
  const hreflang = getMortgageHreflang(cc);
  return {
    title: TITLES[cc],
    description: DESCRIPTIONS[cc],
    alternates: {
      canonical: getCanonical(cc),
      languages: Object.fromEntries(
        hreflang.map(({ hrefLang, href }) => [hrefLang, href])
      ),
    },
    robots: { index: true, follow: true },
  };
}
