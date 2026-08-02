// packages/affordability-engine/__tests__/calculate.test.ts
import { describe, it, expect } from 'vitest';
import { calculateAffordability } from '../src/index';
import type { AffordabilityRuleSet } from '@reckoner/rules-core';
import type { AffordabilityInput } from '../src/index';

const IRELAND_RULESET: AffordabilityRuleSet = {
  calculator: 'affordability',
  jurisdiction: 'IE',
  provenance: {
    source: 'Central Bank of Ireland Mortgage Measures Framework',
    sourceUrl: 'https://www.centralbank.ie/financial-system/financial-stability/macro-prudential-policy/mortgage-measures',
    lastReviewed: '2026-08-01',
    effectiveFrom: '2023-01-01',
  },
  method: 'lti_ltv',
  params: { ltiFtb: 4, ltiSsb: 3.5, ltvFtb: 0.9, ltvSsb: 0.9, ltvBtl: 0.7 },
};

const AUSTRALIA_RULESET: AffordabilityRuleSet = {
  calculator: 'affordability',
  jurisdiction: 'AU',
  provenance: {
    source: 'APRA Prudential Practice Guide APG 223',
    sourceUrl: 'https://www.apra.gov.au/sites/default/files/apg_223_november_2021_0.pdf',
    lastReviewed: '2026-08-01',
    effectiveFrom: '2021-11-01',
  },
  method: 'serviceability_buffer',
  params: { buffer: 0.03 },
};

const SINGAPORE_RULESET: AffordabilityRuleSet = {
  calculator: 'affordability',
  jurisdiction: 'SG',
  provenance: {
    source: 'MAS Notice 645 — Total Debt Servicing Ratio',
    sourceUrl: 'https://www.mas.gov.sg/regulation/notices/notice-645',
    lastReviewed: '2026-08-01',
    effectiveFrom: '2023-01-01',
  },
  method: 'tdsr_msr',
  params: { tdsr: 0.55, msr: 0.30, rateFloor: 0.04 },
};

const CANADA_RULESET: AffordabilityRuleSet = {
  calculator: 'affordability',
  jurisdiction: 'CA',
  provenance: {
    source: 'OSFI Guideline B-20 — Minimum Qualifying Rate',
    sourceUrl: 'https://www.osfi-bsif.gc.ca/en/guidance/guidance-library/residential-mortgage-underwriting-practices-procedures',
    lastReviewed: '2026-08-01',
    effectiveFrom: '2021-06-01',
  },
  method: 'dti_stress',
  params: { stressFloor: 0.0525 },
};

describe('calculateAffordability', () => {
  describe('lti_ltv (Ireland FTB)', () => {
    it('caps at 4x gross income for FTB', () => {
      const input: AffordabilityInput = {
        grossAnnualIncome: 80_000,
        monthlyDebts: 0,
        propertyPrice: 400_000,
        annualRate: 0.039,
        termYears: 30,
        buyerType: 'first_time_buyer',
      };
      const result = calculateAffordability(input, IRELAND_RULESET);
      // Max borrow = 4 × 80000 = 320000
      expect(result.maxBorrow).toBe(320_000);
      expect(result.bindingConstraint).toBe('lti');
    });

    it('respects LTV for SSB when LTI is not binding', () => {
      const input: AffordabilityInput = {
        grossAnnualIncome: 200_000,
        monthlyDebts: 0,
        propertyPrice: 300_000,
        annualRate: 0.039,
        termYears: 30,
        buyerType: 'subsequent_buyer',
      };
      const result = calculateAffordability(input, IRELAND_RULESET);
      // LTI cap = 3.5 × 200000 = 700000 — not binding vs 300000 × 0.9 = 270000 LTV
      expect(result.maxBorrow).toBe(270_000);
      expect(result.bindingConstraint).toBe('ltv');
    });
  });

  describe('serviceability_buffer (Australia APRA)', () => {
    it('applies +3% buffer on top of rate', () => {
      const input: AffordabilityInput = {
        grossAnnualIncome: 120_000,
        monthlyDebts: 500,
        propertyPrice: 800_000,
        annualRate: 0.06,
        termYears: 30,
        buyerType: 'first_time_buyer',
      };
      const result = calculateAffordability(input, AUSTRALIA_RULESET);
      // Assessment rate = 6% + 3% = 9%
      // Monthly income = 10000, net of debts = 9500, no DTI cap in AU rule
      expect(result.assessmentRate).toBeCloseTo(0.09, 4);
      expect(result.maxBorrow).toBeGreaterThan(0);
    });
  });

  describe('tdsr_msr (Singapore)', () => {
    it('limits total debt service to 55% of gross monthly income', () => {
      const input: AffordabilityInput = {
        grossAnnualIncome: 120_000,
        monthlyDebts: 2_000,
        propertyPrice: 1_500_000,
        annualRate: 0.038,
        termYears: 25,
        buyerType: 'first_time_buyer',
      };
      const result = calculateAffordability(input, SINGAPORE_RULESET);
      // Monthly income = 10000; TDSR = 55% = 5500; available for mortgage = 5500 - 2000 = 3500
      // assessment rate = max(0.038, 0.04) = 0.04
      expect(result.availableForMortgage).toBeCloseTo(3_500, 0);
      expect(result.assessmentRate).toBeCloseTo(0.04, 4);
      expect(result.bindingConstraint).toBe('dti');
      expect(result.maxBorrow).toBeGreaterThan(0);
    });

    it('clamps availableForMortgage to zero when debts exceed tdsr limit', () => {
      const input: AffordabilityInput = {
        grossAnnualIncome: 12_000,
        monthlyDebts: 10_000,
        propertyPrice: 500_000,
        annualRate: 0.05,
        termYears: 25,
        buyerType: 'first_time_buyer',
      };
      const result = calculateAffordability(input, SINGAPORE_RULESET);
      expect(result.availableForMortgage).toBe(0);
      expect(result.maxBorrow).toBe(0);
    });
  });

  describe('dti_stress (Canada OSFI)', () => {
    it('applies stress floor when contract rate + 2% is below floor', () => {
      const input: AffordabilityInput = {
        grossAnnualIncome: 100_000,
        monthlyDebts: 500,
        propertyPrice: 600_000,
        annualRate: 0.03,
        termYears: 25,
        buyerType: 'first_time_buyer',
      };
      const result = calculateAffordability(input, CANADA_RULESET);
      // annualRate + 0.02 = 0.05 < stressFloor 0.0525, so assessmentRate = 0.0525
      expect(result.assessmentRate).toBeCloseTo(0.0525, 4);
      expect(result.maxBorrow).toBeGreaterThan(0);
      expect(result.bindingConstraint).toBe('payment_capacity');
    });

    it('uses contract rate + 2% when it exceeds the stress floor', () => {
      const input: AffordabilityInput = {
        grossAnnualIncome: 100_000,
        monthlyDebts: 0,
        propertyPrice: 600_000,
        annualRate: 0.05,
        termYears: 25,
        buyerType: 'subsequent_buyer',
      };
      const result = calculateAffordability(input, CANADA_RULESET);
      // annualRate + 0.02 = 0.07 > stressFloor 0.0525, so assessmentRate = 0.07
      expect(result.assessmentRate).toBeCloseTo(0.07, 4);
      expect(result.availableForMortgage).toBeCloseTo((100_000 / 12) * 0.39, 1);
    });

    it('clamps availableForMortgage to zero when debts exceed 39% income limit', () => {
      const input: AffordabilityInput = {
        grossAnnualIncome: 12_000,
        monthlyDebts: 5_000,
        propertyPrice: 200_000,
        annualRate: 0.05,
        termYears: 25,
        buyerType: 'first_time_buyer',
      };
      const result = calculateAffordability(input, CANADA_RULESET);
      expect(result.availableForMortgage).toBe(0);
      expect(result.maxBorrow).toBe(0);
    });
  });

  describe('lti_ltv (buy_to_let)', () => {
    it('uses ltvBtl ratio for buy_to_let buyer type', () => {
      const input: AffordabilityInput = {
        grossAnnualIncome: 80_000,
        monthlyDebts: 0,
        propertyPrice: 400_000,
        annualRate: 0.039,
        termYears: 25,
        buyerType: 'buy_to_let',
      };
      const result = calculateAffordability(input, IRELAND_RULESET);
      // LTI for BTL = 0, maxByLti = 0; LTV = 400000 × 0.7 = 280000
      // min(0, 280000) = 0 — BTL capped at income-based zero
      expect(result.maxBorrow).toBe(0);
    });
  });

  describe('zero-rate edge cases', () => {
    it('handles 0% interest rate in serviceability_buffer', () => {
      const input: AffordabilityInput = {
        grossAnnualIncome: 120_000,
        monthlyDebts: 0,
        propertyPrice: 500_000,
        annualRate: 0,
        termYears: 30,
        buyerType: 'first_time_buyer',
      };
      // buffer=0.03, assessmentRate=0.03 (not zero), so uses normal PMT path
      const result = calculateAffordability(input, AUSTRALIA_RULESET);
      expect(result.maxBorrow).toBeGreaterThan(0);
      expect(result.assessmentRate).toBeCloseTo(0.03, 4);
    });

    it('handles 0% assessment rate (zero annualRate + zero buffer) with zero-rate PMT fallback', () => {
      const zeroBufferRuleset: AffordabilityRuleSet = {
        calculator: 'affordability',
        jurisdiction: 'AU',
        provenance: {
          source: 'Test',
          sourceUrl: 'https://example.com',
          lastReviewed: '2026-08-01',
          effectiveFrom: '2021-11-01',
        },
        method: 'serviceability_buffer',
        params: { buffer: 0 },
      };
      const input: AffordabilityInput = {
        grossAnnualIncome: 120_000,
        monthlyDebts: 0,
        propertyPrice: 500_000,
        annualRate: 0,
        termYears: 30,
        buyerType: 'first_time_buyer',
      };
      const result = calculateAffordability(input, zeroBufferRuleset);
      // assessmentRate = 0, uses zero-rate PMT: principal / n
      expect(result.maxBorrow).toBeGreaterThan(0);
      expect(result.assessmentRate).toBe(0);
    });
  });

  describe('param fallback defaults (empty params)', () => {
    it('lti_ltv FTB uses default ltiFtb=4 and ltvFtb=0.9 when params empty', () => {
      const emptyParamRuleset: AffordabilityRuleSet = {
        calculator: 'affordability',
        jurisdiction: 'IE',
        provenance: { source: 'Test', sourceUrl: 'https://example.com', lastReviewed: '2026-08-01', effectiveFrom: '2023-01-01' },
        method: 'lti_ltv',
        params: {},
      };
      const input: AffordabilityInput = {
        grossAnnualIncome: 80_000,
        monthlyDebts: 0,
        propertyPrice: 400_000,
        annualRate: 0.039,
        termYears: 30,
        buyerType: 'first_time_buyer',
      };
      const result = calculateAffordability(input, emptyParamRuleset);
      // Default ltiFtb=4: 4 × 80000 = 320000; default ltvFtb=0.9: 400000 × 0.9 = 360000
      expect(result.maxBorrow).toBe(320_000);
      expect(result.bindingConstraint).toBe('lti');
    });

    it('lti_ltv SSB uses default ltiSsb=3.5 and ltvSsb=0.9 when params empty', () => {
      const emptyParamRuleset: AffordabilityRuleSet = {
        calculator: 'affordability',
        jurisdiction: 'IE',
        provenance: { source: 'Test', sourceUrl: 'https://example.com', lastReviewed: '2026-08-01', effectiveFrom: '2023-01-01' },
        method: 'lti_ltv',
        params: {},
      };
      const input: AffordabilityInput = {
        grossAnnualIncome: 200_000,
        monthlyDebts: 0,
        propertyPrice: 300_000,
        annualRate: 0.039,
        termYears: 30,
        buyerType: 'subsequent_buyer',
      };
      const result = calculateAffordability(input, emptyParamRuleset);
      // Default ltiSsb=3.5: 3.5 × 200000 = 700000; default ltvSsb=0.9: 300000 × 0.9 = 270000 → ltv binding
      expect(result.maxBorrow).toBe(270_000);
      expect(result.bindingConstraint).toBe('ltv');
    });

    it('lti_ltv BTL uses default ltvBtl=0.7 when params empty', () => {
      const emptyParamRuleset: AffordabilityRuleSet = {
        calculator: 'affordability',
        jurisdiction: 'IE',
        provenance: { source: 'Test', sourceUrl: 'https://example.com', lastReviewed: '2026-08-01', effectiveFrom: '2023-01-01' },
        method: 'lti_ltv',
        params: {},
      };
      const input: AffordabilityInput = {
        grossAnnualIncome: 80_000,
        monthlyDebts: 0,
        propertyPrice: 400_000,
        annualRate: 0.039,
        termYears: 25,
        buyerType: 'buy_to_let',
      };
      const result = calculateAffordability(input, emptyParamRuleset);
      // Default ltvBtl=0.7; LTI BTL = 0, so maxBorrow = 0
      expect(result.maxBorrow).toBe(0);
    });

    it('serviceability_buffer uses default buffer=0.03 when params empty', () => {
      const emptyParamRuleset: AffordabilityRuleSet = {
        calculator: 'affordability',
        jurisdiction: 'AU',
        provenance: { source: 'Test', sourceUrl: 'https://example.com', lastReviewed: '2026-08-01', effectiveFrom: '2021-11-01' },
        method: 'serviceability_buffer',
        params: {},
      };
      const input: AffordabilityInput = {
        grossAnnualIncome: 120_000,
        monthlyDebts: 0,
        propertyPrice: 500_000,
        annualRate: 0.06,
        termYears: 30,
        buyerType: 'first_time_buyer',
      };
      const result = calculateAffordability(input, emptyParamRuleset);
      expect(result.assessmentRate).toBeCloseTo(0.09, 4);
    });

    it('tdsr_msr uses default tdsr=0.55 and rateFloor=0.04 when params empty', () => {
      const emptyParamRuleset: AffordabilityRuleSet = {
        calculator: 'affordability',
        jurisdiction: 'SG',
        provenance: { source: 'Test', sourceUrl: 'https://example.com', lastReviewed: '2026-08-01', effectiveFrom: '2023-01-01' },
        method: 'tdsr_msr',
        params: {},
      };
      const input: AffordabilityInput = {
        grossAnnualIncome: 120_000,
        monthlyDebts: 2_000,
        propertyPrice: 1_500_000,
        annualRate: 0.038,
        termYears: 25,
        buyerType: 'first_time_buyer',
      };
      const result = calculateAffordability(input, emptyParamRuleset);
      // Default tdsr=0.55, rateFloor=0.04
      expect(result.availableForMortgage).toBeCloseTo(3_500, 0);
      expect(result.assessmentRate).toBeCloseTo(0.04, 4);
    });

    it('dti_stress uses default stressFloor=0.0525 when params empty', () => {
      const emptyParamRuleset: AffordabilityRuleSet = {
        calculator: 'affordability',
        jurisdiction: 'CA',
        provenance: { source: 'Test', sourceUrl: 'https://example.com', lastReviewed: '2026-08-01', effectiveFrom: '2021-06-01' },
        method: 'dti_stress',
        params: {},
      };
      const input: AffordabilityInput = {
        grossAnnualIncome: 100_000,
        monthlyDebts: 0,
        propertyPrice: 600_000,
        annualRate: 0.03,
        termYears: 25,
        buyerType: 'first_time_buyer',
      };
      const result = calculateAffordability(input, emptyParamRuleset);
      // Default stressFloor=0.0525; contract+2%=0.05 < 0.0525 so uses floor
      expect(result.assessmentRate).toBeCloseTo(0.0525, 4);
    });
  });
});
