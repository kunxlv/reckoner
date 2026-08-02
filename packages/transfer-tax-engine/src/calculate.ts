import type { Band, TransferTaxRuleSet } from '@reckoner/rules-core';

export interface TransferTaxInput {
  price: number;
  surcharges: readonly string[];  // list of surcharge IDs that apply, e.g. ['additional_property']
  relief: string | null; // relief ID to apply, e.g. 'first_time_buyer'
}

export interface TransferTaxResult {
  tax: number;
  effectiveRate: number;      // tax / price
  breakdown: { label: string; amount: number }[];
}

function applyBands(price: number, bands: Band[]): number {
  let tax = 0;
  let lower = 0;
  for (const band of bands) {
    const upper = band.upTo ?? Infinity;
    if (price > lower) {
      tax += (Math.min(price, upper) - lower) * band.rate;
    }
    lower = upper;
    if (price <= upper) break;
  }
  return tax;
}

export function calculateTransferTax(
  input: TransferTaxInput,
  ruleset: TransferTaxRuleSet,
): TransferTaxResult {
  if (input.price <= 0) {
    return { tax: 0, effectiveRate: 0, breakdown: [] };
  }

  // Determine which bands to use (relief may replace standard bands)
  let activeBands = ruleset.bands;
  let reliefLost = false;

  if (input.relief !== null) {
    const relief = ruleset.reliefs.find((r) => r.id === input.relief);
    if (relief !== undefined) {
      if (relief.cap !== null && input.price > relief.cap) {
        reliefLost = true;
        activeBands = ruleset.bands;
      } else {
        activeBands = relief.bands;
      }
    }
  }

  const baseTax = Math.round(applyBands(input.price, activeBands) * 100) / 100;
  const breakdown: { label: string; amount: number }[] = [
    { label: reliefLost ? 'Stamp duty (standard rates, relief not applied: over price cap)' : 'Stamp duty', amount: baseTax },
  ];

  let totalTax = baseTax;

  // Apply flat-rate surcharges
  for (const surchargeId of input.surcharges) {
    const surcharge = ruleset.surcharges.find((s) => s.id === surchargeId);
    if (surcharge === undefined) continue;

    const surchargeAmount = Math.round(input.price * surcharge.value * 100) / 100;
    breakdown.push({ label: surcharge.id.replace(/_/g, ' '), amount: surchargeAmount });
    totalTax += surchargeAmount;
  }

  totalTax = Math.round(totalTax * 100) / 100;

  return {
    tax: totalTax,
    effectiveRate: totalTax / input.price,
    breakdown,
  };
}
