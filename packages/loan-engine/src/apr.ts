/**
 * Newton-Raphson IRR: finds monthly rate r such that
 *   netAmount = payment × (1 − (1+r)^−n) / r
 * Returns annual rate (r × 12).
 */
export function computeAPR(
  netAmount: number,
  payment: number,
  termMonths: number,
): number {
  if (netAmount <= 0 || payment <= 0 || termMonths <= 0) return 0;

  // Initial guess: approximate monthly rate from simple interest
  let r = Math.max(payment / netAmount / termMonths, 1e-6);

  for (let iter = 0; iter < 200; iter++) {
    const pow = Math.pow(1 + r, -termMonths);
    const pv = payment * (1 - pow) / r;
    // Derivative of pv with respect to r
    const dpv = payment * (
      (termMonths * pow) / (r * (1 + r)) -
      (1 - pow) / (r * r)
    );
    const delta = (pv - netAmount) / dpv;
    r -= delta;
    if (r < 1e-12) r = 1e-12; // clamp away from zero/negative
    if (Math.abs(delta) < 1e-12) break;
  }

  return r * 12;
}
