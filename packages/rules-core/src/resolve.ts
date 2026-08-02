type HasProvenance = { provenance: { effectiveFrom: string; effectiveTo?: string } };

export function asOf<T extends HasProvenance>(
  versions: T[],
  date: string = new Date().toISOString().slice(0, 10),
): T {
  const active = versions
    .filter(
      (v) =>
        v.provenance.effectiveFrom <= date &&
        (v.provenance.effectiveTo === undefined || v.provenance.effectiveTo > date),
    )
    .sort((a, b) => b.provenance.effectiveFrom.localeCompare(a.provenance.effectiveFrom));
  const result = active[0];
  if (result === undefined) throw new Error(`No active ruleset for date ${date}`);
  return result;
}
