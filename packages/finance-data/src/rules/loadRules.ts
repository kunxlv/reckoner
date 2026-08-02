// packages/finance-data/src/rules/loadRules.ts
import type { CountryCode } from '../types';
import type { TransferTaxRuleSet, AffordabilityRuleSet } from '@reckoner/rules-core';

// JSON imports are widened to string/number by resolveJsonModule, so we cast via unknown at load time.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonModule = Promise<{ default: any }>;

const STAMP_DUTY_MAP: Record<CountryCode, () => JsonModule> = {
  us: () => import('./stamp-duty/us.json'),
  uk: () => import('./stamp-duty/gb-eng.json'),
  ca: () => import('./stamp-duty/ca.json'),
  au: () => import('./stamp-duty/au.json'),
  ie: () => import('./stamp-duty/ie.json'),
  de: () => import('./stamp-duty/de.json'),
  nl: () => import('./stamp-duty/nl.json'),
  nz: () => import('./stamp-duty/nz.json'),
  fr: () => import('./stamp-duty/fr.json'),
  es: () => import('./stamp-duty/es.json'),
  sg: () => import('./stamp-duty/sg.json'),
  in: () => import('./stamp-duty/in.json'),
};

export async function loadStampDutyRules(cc: CountryCode): Promise<TransferTaxRuleSet[]> {
  const loader = STAMP_DUTY_MAP[cc];
  const mod = await loader();
  return mod.default as TransferTaxRuleSet[];
}

// Stub — Task 4 will populate affordability JSON data files.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function loadAffordabilityRules(_cc: CountryCode): Promise<AffordabilityRuleSet[]> {
  return [];
}
