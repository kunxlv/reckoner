import { monthlyPayment } from './mortgage';

export interface RentVsBuyInput {
  propertyPrice: number;
  deposit: number;
  annualRate: number;
  termYears: number;
  monthlyRent: number;
  annualAppreciation: number;
  annualInvestmentReturn: number;
}

export interface RentVsBuyResult {
  mortgagePayment: number;
  monthlyOpportunityCost: number;
  effectiveBuyCost: number;
  futurePropertyValue: number;
  equity: number;
  rentTotal: number;
  buyTotal: number;
  netBuyAdvantage: number;
}

const YEARS_TO_PROJECT = 10;

export function calcRentVsBuy(input: RentVsBuyInput): RentVsBuyResult {
  const { propertyPrice, deposit, annualRate, termYears, monthlyRent, annualAppreciation, annualInvestmentReturn } = input;
  const loanAmount = propertyPrice - deposit;
  const mortgagePayment = monthlyPayment(loanAmount, annualRate, termYears);
  const monthlyOpportunityCost = deposit * (annualInvestmentReturn / 12);
  const effectiveBuyCost = mortgagePayment + monthlyOpportunityCost;
  const futurePropertyValue = propertyPrice * Math.pow(1 + annualAppreciation, YEARS_TO_PROJECT);
  const equity = futurePropertyValue - loanAmount;
  const rentTotal = monthlyRent * YEARS_TO_PROJECT * 12;
  const buyTotal = effectiveBuyCost * YEARS_TO_PROJECT * 12;
  const netBuyAdvantage = rentTotal - buyTotal + (equity - deposit);
  return { mortgagePayment, monthlyOpportunityCost, effectiveBuyCost, futurePropertyValue, equity, rentTotal, buyTotal, netBuyAdvantage };
}
