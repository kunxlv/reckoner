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

const AFFORDABILITY_MAP: Record<CountryCode, () => JsonModule> = {
  us: () => import('./affordability/us.json'),
  uk: () => import('./affordability/uk.json'),
  ca: () => import('./affordability/ca.json'),
  au: () => import('./affordability/au.json'),
  ie: () => import('./affordability/ie.json'),
  de: () => import('./affordability/de.json'),
  nl: () => import('./affordability/nl.json'),
  nz: () => import('./affordability/nz.json'),
  fr: () => import('./affordability/fr.json'),
  es: () => import('./affordability/es.json'),
  sg: () => import('./affordability/sg.json'),
  in: () => import('./affordability/in.json'),
};

export async function loadAffordabilityRules(cc: CountryCode): Promise<AffordabilityRuleSet[]> {
  const loader = AFFORDABILITY_MAP[cc];
  const mod = await loader();
  return mod.default as AffordabilityRuleSet[];
}
