import type { CardPayoffInput, CardPayoffResult, CardPayoffRow } from './types';

export function calculateCardPayoff(input: CardPayoffInput): CardPayoffResult {
  const { balanceCents: initialBalance, annualRate, minPaymentRule, extraMonthlyCents = 0 } = input;
  const monthlyRate = annualRate / 12;

  let balance = initialBalance;
  const schedule: CardPayoffRow[] = [];
  let totalInterestCents = 0;
  let totalPaidCents = 0;
  let month = 0;

  while (balance > 0 && month < 1200) {
    month++;

    const interestCents = Math.floor(balance * monthlyRate);

    const minPayment =
      minPaymentRule.type === 'percent'
        ? Math.max(Math.floor(balance * minPaymentRule.rate), minPaymentRule.floorCents)
        : minPaymentRule.amountCents;

    // Cap payment to what is actually owed (interest + remaining principal)
    let paymentCents = Math.min(minPayment + extraMonthlyCents, balance + interestCents);

    const principalCents = Math.max(0, paymentCents - interestCents);
    balance = Math.max(0, balance - principalCents);

    totalInterestCents += interestCents;
    totalPaidCents += paymentCents;

    schedule.push({ month, paymentCents, interestCents, principalCents, balanceCents: balance });
  }

  return { months: month, totalInterestCents, totalPaidCents, schedule };
}
