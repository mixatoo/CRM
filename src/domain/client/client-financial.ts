import { BASE_CURRENCY, convertBetweenCurrencies, roundCurrency } from '@/domain/currency'
import type { Client } from '@/domain/entities/client'
import { resolveClientBillingAccount } from '@/domain/entities/client'
import type { Trip } from '@/domain/entities/trip'
import { tripTotalSelling } from '@/domain/entities/trip'

export type ClientTripFinancial = Pick<
  Trip,
  'totalCost' | 'totalSelling' | 'clientPaidAmount' | 'stage' | 'currency'
>

export const CLIENT_FINANCIAL_EXCLUDED_STAGES: Trip['stage'][] = ['lost']

export function resolveClientReportingCurrency(
  client: Pick<Client, 'preferredCurrency' | 'paymentCurrencies'>,
): string {
  return (
    client.preferredCurrency?.trim().toUpperCase() ||
    client.paymentCurrencies?.[0]?.trim().toUpperCase() ||
    BASE_CURRENCY
  )
}

export function isClientBillingBlocked(client: Pick<Client, 'status'>): boolean {
  return client.status === 'blocked'
}

export function tripClientBalanceForSummary(trip: ClientTripFinancial): number {
  if (CLIENT_FINANCIAL_EXCLUDED_STAGES.includes(trip.stage)) return 0
  const selling = tripTotalSelling(trip)
  const paid = trip.clientPaidAmount ?? 0
  return Math.max(0, selling - paid)
}

export interface ClientFinancialSummary {
  outstandingBalance: number
  totalSales: number
  totalPaid: number
  totalDue: number
  availableCredit: number
  reportingCurrency: string
}

export function resolveClientFinancialSummary(
  client: Pick<Client, 'billingAccount' | 'creditLimit' | 'preferredCurrency' | 'paymentCurrencies'>,
  trips: ClientTripFinancial[] = [],
  reportingCurrency = resolveClientReportingCurrency(client),
): ClientFinancialSummary {
  const billableTrips = trips.filter((trip) => !CLIENT_FINANCIAL_EXCLUDED_STAGES.includes(trip.stage))

  let totalSales = 0
  let totalPaid = 0
  let outstandingBalance = 0

  for (const trip of billableTrips) {
    const tripCurrency = trip.currency?.trim().toUpperCase() || reportingCurrency
    const selling = tripTotalSelling(trip)
    const paid = trip.clientPaidAmount ?? 0
    const balance = Math.max(0, selling - paid)

    totalSales += convertBetweenCurrencies(selling, tripCurrency, reportingCurrency)
    totalPaid += convertBetweenCurrencies(paid, tripCurrency, reportingCurrency)
    outstandingBalance += convertBetweenCurrencies(balance, tripCurrency, reportingCurrency)
  }

  totalSales = roundCurrency(totalSales)
  totalPaid = roundCurrency(totalPaid)
  outstandingBalance = roundCurrency(outstandingBalance)
  const totalDue = outstandingBalance

  const isCreditAccount = resolveClientBillingAccount(client) === 'credit'
  const creditLimit = isCreditAccount ? (client.creditLimit ?? 0) : 0
  const availableCredit = creditLimit > 0 ? Math.max(0, roundCurrency(creditLimit - outstandingBalance)) : 0

  return {
    outstandingBalance,
    totalSales,
    totalPaid,
    totalDue,
    availableCredit,
    reportingCurrency,
  }
}

export class ClientCreditExceededError extends Error {
  constructor(
    public readonly availableCredit: number,
    public readonly requested: number,
    public readonly currency: string,
  ) {
    super(
      `Credit limit exceeded. Available ${availableCredit.toFixed(2)} ${currency}, requested ${requested.toFixed(2)} ${currency}.`,
    )
    this.name = 'ClientCreditExceededError'
  }
}

export class ClientBillingBlockedError extends Error {
  constructor() {
    super('This account is blocked and cannot accept new charges.')
    this.name = 'ClientBillingBlockedError'
  }
}

export function assertClientCreditAvailable(
  client: Pick<Client, 'status' | 'billingAccount' | 'creditLimit' | 'preferredCurrency' | 'paymentCurrencies'>,
  trips: ClientTripFinancial[],
  additionalExposure: number,
  additionalCurrency: string,
): void {
  if (isClientBillingBlocked(client)) {
    throw new ClientBillingBlockedError()
  }

  const billing = resolveClientBillingAccount(client)
  if (billing !== 'credit' || !client.creditLimit || client.creditLimit <= 0) return
  if (additionalExposure <= 0) {
    assertClientWithinCreditLimit(client, trips)
    return
  }

  const reportingCurrency = resolveClientReportingCurrency(client)
  const summary = resolveClientFinancialSummary(client, trips, reportingCurrency)
  const additionalInReporting = convertBetweenCurrencies(
    additionalExposure,
    additionalCurrency,
    reportingCurrency,
  )

  if (additionalInReporting > summary.availableCredit + 0.01) {
    throw new ClientCreditExceededError(summary.availableCredit, additionalInReporting, reportingCurrency)
  }
}

/** Ensures the account's current outstanding balance does not exceed its credit limit. */
export function assertClientWithinCreditLimit(
  client: Pick<Client, 'status' | 'billingAccount' | 'creditLimit' | 'preferredCurrency' | 'paymentCurrencies'>,
  trips: ClientTripFinancial[],
): void {
  if (isClientBillingBlocked(client)) {
    throw new ClientBillingBlockedError()
  }

  const billing = resolveClientBillingAccount(client)
  if (billing !== 'credit' || !client.creditLimit || client.creditLimit <= 0) return

  const summary = resolveClientFinancialSummary(client, trips)
  if (summary.outstandingBalance > client.creditLimit + 0.01) {
    throw new ClientCreditExceededError(
      summary.availableCredit,
      summary.outstandingBalance,
      summary.reportingCurrency,
    )
  }
}

export function validateCreditAccountSetup(
  client: Pick<Client, 'billingAccount' | 'creditLimit'>,
): void {
  if (resolveClientBillingAccount(client) !== 'credit') return
  if (!client.creditLimit || client.creditLimit <= 0) {
    throw new Error('Credit accounts require an approved credit limit greater than zero.')
  }
}
