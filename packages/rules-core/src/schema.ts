import { z } from 'zod';

const ProvenanceSchema = z.object({
  source: z.string().min(1),
  sourceUrl: z.string().url(),
  lastReviewed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  effectiveTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const BandSchema = z.object({
  upTo: z.number().positive().nullable(),
  rate: z.number().min(0).max(1),
});

const SurchargeSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['flat_rate', 'added_to_bands']),
  value: z.number().min(0).max(1),
  appliesWhen: z.string().min(1),
});

const ReliefSchema = z.object({
  id: z.string().min(1),
  bands: z.array(BandSchema),
  cap: z.number().positive().nullable(),
});

export const TransferTaxRuleSetSchema = z.object({
  calculator: z.literal('transfer-tax'),
  jurisdiction: z.string().min(1),
  currency: z.string().length(3),
  tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  provenance: ProvenanceSchema,
  bands: z.array(BandSchema).min(1),
  surcharges: z.array(SurchargeSchema).default([]),
  reliefs: z.array(ReliefSchema).default([]),
});

export const AffordabilityRuleSetSchema = z.object({
  calculator: z.literal('affordability'),
  jurisdiction: z.string().min(1),
  provenance: ProvenanceSchema,
  method: z.enum(['lti_ltv', 'dti_stress', 'serviceability_buffer', 'tdsr_msr']),
  params: z.record(z.string(), z.number()),
});

export const VersionedTransferTaxSchema = z.array(TransferTaxRuleSetSchema).min(1);
export const VersionedAffordabilitySchema = z.array(AffordabilityRuleSetSchema).min(1);
