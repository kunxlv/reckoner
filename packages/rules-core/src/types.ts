export interface Band {
  upTo: number | null;  // null = top bracket (no ceiling)
  rate: number;         // 0.05 = 5%
}

export interface Surcharge {
  id: string;           // "additional_property" | "non_resident" | "foreign_buyer"
  kind: 'flat_rate' | 'added_to_bands';
  value: number;        // 0.05 = 5%
  appliesWhen: string;  // named predicate key resolved in UI layer
}

export interface Relief {
  id: string;           // "first_time_buyer"
  bands: Band[];        // replacement band schedule when relief applies
  cap: number | null;   // price ceiling above which relief is lost (null = no cap)
}

export interface Provenance {
  source: string;
  sourceUrl: string;
  lastReviewed: string;    // YYYY-MM-DD
  effectiveFrom: string;   // YYYY-MM-DD
  effectiveTo?: string;    // YYYY-MM-DD — open-ended if absent
}

export interface TransferTaxRuleSet {
  calculator: 'transfer-tax';
  jurisdiction: string;    // "GB-ENG", "AU-NSW", "DE-BY"
  currency: string;
  tier: 1 | 2 | 3;
  provenance: Provenance;
  bands: Band[];
  surcharges: Surcharge[];
  reliefs: Relief[];
}

export interface AffordabilityRuleSet {
  calculator: 'affordability';
  jurisdiction: string;
  provenance: Provenance;
  method: 'lti_ltv' | 'dti_stress' | 'serviceability_buffer' | 'tdsr_msr';
  params: Record<string, number>;
}
