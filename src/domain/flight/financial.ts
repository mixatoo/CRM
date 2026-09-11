import type {
  FlightPassenger,
  FlightSegment,
  FlightServiceDetails,
  FlightServiceFinancialSummary,
  FlightTicket,
  PaymentStatus,
  TicketFinancialSnapshot,
  TicketLedgerEntry,
  TicketPricing,
  TicketTransaction,
} from '@/domain/flight/types'

import { BASE_CURRENCY, convertToBaseCurrency, normalizeExchangeRate, roundCurrency } from '@/domain/currency'

export function roundMoney(value: number): number {
  return roundCurrency(value)
}

export { BASE_CURRENCY, convertToBaseCurrency, normalizeExchangeRate }

export function computeSupplierCost(pricing: Pick<TicketPricing, 'fare' | 'taxes' | 'airlineFees' | 'supplierFees'>): number {
  return roundMoney(pricing.fare + pricing.taxes + pricing.airlineFees + pricing.supplierFees)
}

/** What the client owes before payments: list price − discount (list price already includes mark-up when set). */
export function computeClientReceivable(
  pricing: Pick<TicketPricing, 'sellingPrice' | 'clientDiscount'>,
): number {
  const clientDiscount = roundMoney(pricing.clientDiscount ?? 0)
  return roundMoney(Math.max(0, pricing.sellingPrice - clientDiscount))
}

/** Supplier cost after airline commission (commission reduces net cost to the agency). */
export function computeNetSupplierCost(pricing: Pick<TicketPricing, 'supplierCost' | 'commission'>): number {
  return roundMoney(Math.max(0, pricing.supplierCost - pricing.commission))
}

export function computeTicketProfit(pricing: Pick<TicketPricing, 'sellingPrice' | 'supplierCost'>): number {
  return roundMoney(pricing.sellingPrice - pricing.supplierCost)
}

export function deriveTicketRoute(segments: FlightSegment[]): string {
  if (segments.length === 0) return ''
  const airports: string[] = []
  for (const segment of segments) {
    const dep = segment.departureAirport.trim()
    const arr = segment.arrivalAirport.trim()
    if (!dep && !arr) continue
    if (airports.length === 0 && dep) airports.push(dep)
    if (arr) airports.push(arr)
  }
  return airports.join(' → ')
}

export function derivePrimaryAirline(segments: FlightSegment[]): string {
  return segments.find((s) => s.airline.trim())?.airline.trim() ?? ''
}

export function derivePrimaryCabin(segments: FlightSegment[]): string {
  return segments.find((s) => s.cabinClass?.trim())?.cabinClass?.trim() ?? ''
}

export function resolvePaymentStatus(collected: number, receivable: number): PaymentStatus {
  if (receivable <= 0) return collected > 0 ? 'overpaid' : 'paid'
  if (collected <= 0) return 'unpaid'
  if (collected >= receivable) return collected > receivable ? 'overpaid' : 'paid'
  return 'partial'
}

export function computeTicketFinancials(
  pricing: TicketPricing,
  ledger: TicketLedgerEntry[],
): TicketFinancialSnapshot {
  const supplierCost = pricing.supplierCost
  const sellingPrice = pricing.sellingPrice
  const grossProfit = roundMoney(sellingPrice - supplierCost)
  const netSupplierCost = computeNetSupplierCost(pricing)

  let amountCollected = 0
  let amountPaidToSupplier = 0
  let netAdjustments = 0
  let profitAdjustments = 0

  for (const entry of ledger) {
    switch (entry.transactionType) {
      case 'client_payment':
        amountCollected += entry.credit - entry.debit
        break
      case 'supplier_payment':
        amountPaidToSupplier += entry.debit - entry.credit
        break
      case 'refund':
      case 'partial_refund':
        // Cash returned to the client reduces outstanding receivable.
        netAdjustments -= entry.debit
        break
      case 'void':
        // Reverse billed selling price; void fees remain payable.
        netAdjustments -= entry.credit
        netAdjustments += entry.debit
        break
      case 'cancellation':
        // Net refund paid to the client reduces receivable.
        netAdjustments -= entry.debit
        break
      case 'reissue':
      case 'partial_reissue':
        netAdjustments += entry.credit - entry.debit
        break
      case 'manual_adjustment':
      case 'credit_note':
      case 'debit_note':
        profitAdjustments += entry.credit - entry.debit
        break
      case 'issue':
      case 'exchange':
      case 'refund_payment':
        break
      default:
        break
    }
  }

  amountCollected = roundMoney(Math.max(0, amountCollected))
  amountPaidToSupplier = roundMoney(Math.max(0, amountPaidToSupplier))
  netAdjustments = roundMoney(netAdjustments)
  profitAdjustments = roundMoney(profitAdjustments)

  const clientReceivable = roundMoney(
    Math.max(0, computeClientReceivable(pricing) + netAdjustments),
  )
  const supplierPayable = roundMoney(supplierCost)
  const amountOutstanding = roundMoney(Math.max(0, clientReceivable - amountCollected))
  const supplierOutstanding = roundMoney(Math.max(0, supplierPayable - amountPaidToSupplier))
  const netProfit = roundMoney(clientReceivable - netSupplierCost + profitAdjustments)

  return {
    supplierCost,
    sellingPrice,
    grossProfit,
    netProfit,
    clientReceivable,
    supplierPayable,
    amountCollected,
    amountOutstanding,
    amountPaidToSupplier,
    supplierOutstanding,
    currency: pricing.currency,
    exchangeRate: pricing.exchangeRate,
    paymentStatus: resolvePaymentStatus(amountCollected, clientReceivable),
  }
}

/** Live issue-form breakdown for the result panel (empty ledger). */
export interface IssueResultSummary {
  supplierCost: number
  sellingPrice: number
  clientDiscount: number
  clientReceivable: number
  ticketSpread: number
  commission: number
  markup: number
  netProfit: number
  marginOnCollectionPercent: number | null
}

export function buildIssueResultSummary(
  pricing: TicketPricing,
  financials: Pick<TicketFinancialSnapshot, 'clientReceivable' | 'netProfit'>,
): IssueResultSummary {
  const clientDiscount = roundMoney(pricing.clientDiscount ?? 0)
  const ticketSpread = roundMoney(pricing.sellingPrice - pricing.supplierCost)
  const commission = roundMoney(pricing.commission)
  const markup = roundMoney(pricing.agencyServiceFees)
  const clientReceivable = financials.clientReceivable
  const netProfit = financials.netProfit
  const marginOnCollectionPercent =
    clientReceivable > 0 ? roundMoney((netProfit / clientReceivable) * 100) : null

  return {
    supplierCost: pricing.supplierCost,
    sellingPrice: pricing.sellingPrice,
    clientDiscount,
    clientReceivable,
    ticketSpread,
    commission,
    markup,
    netProfit,
    marginOnCollectionPercent,
  }
}

export function normalizeTicketPricing(
  partial: Partial<TicketPricing> & Pick<TicketPricing, 'currency'>,
): TicketPricing {
  const fare = roundMoney(partial.fare ?? 0)
  const taxes = roundMoney(partial.taxes ?? 0)
  const airlineFees = roundMoney(partial.airlineFees ?? 0)
  const supplierFees = roundMoney(partial.supplierFees ?? 0)
  const agencyServiceFees = roundMoney(partial.agencyServiceFees ?? 0)
  const commission = roundMoney(partial.commission ?? 0)
  const clientDiscount = roundMoney(partial.clientDiscount ?? 0)
  const supplierCost = computeSupplierCost({ fare, taxes, airlineFees, supplierFees })
  const sellingPrice = roundMoney(partial.sellingPrice ?? supplierCost)
  const profit = computeTicketProfit({ sellingPrice, supplierCost })

  return {
    fare,
    taxes,
    airlineFees,
    supplierFees,
    agencyServiceFees,
    commission,
    clientDiscount,
    supplierCost,
    sellingPrice,
    profit,
    currency: partial.currency.trim().toUpperCase(),
    exchangeRate: normalizeExchangeRate(partial.currency, partial.exchangeRate),
  }
}

export function refreshTicketComputedFields(ticket: FlightTicket): FlightTicket {
  const route = ticket.route.trim() || deriveTicketRoute(ticket.segments)
  const airline = ticket.airline.trim() || derivePrimaryAirline(ticket.segments)
  const cabinClass = ticket.cabinClass.trim() || derivePrimaryCabin(ticket.segments)
  const pricing = normalizeTicketPricing({ ...ticket.pricing, supplierCost: undefined as unknown as number })
  const financials = computeTicketFinancials(pricing, ticket.ledger)

  return {
    ...ticket,
    route,
    airline,
    cabinClass,
    pricing,
    financials,
  }
}

export function aggregateServiceFinancials(
  passengers: FlightPassenger[],
  _defaultCurrency = BASE_CURRENCY,
): FlightServiceFinancialSummary {
  const tickets = passengers.flatMap((p) => p.tickets)
  let issuedCount = 0

  const totals = tickets.reduce(
    (acc, ticket) => {
      const f = ticket.financials
      const p = ticket.pricing
      if (ticket.status === 'issued' || ticket.status === 'reissued' || ticket.status === 'exchanged') {
        issuedCount += 1
      }
      return {
        supplierCost: acc.supplierCost + convertToBaseCurrency(f.supplierCost, p.currency, p.exchangeRate),
        sellingPrice: acc.sellingPrice + convertToBaseCurrency(f.sellingPrice, p.currency, p.exchangeRate),
        grossProfit: acc.grossProfit + convertToBaseCurrency(f.grossProfit, p.currency, p.exchangeRate),
        netProfit: acc.netProfit + convertToBaseCurrency(f.netProfit, p.currency, p.exchangeRate),
        clientReceivable:
          acc.clientReceivable + convertToBaseCurrency(f.clientReceivable, p.currency, p.exchangeRate),
        supplierPayable: acc.supplierPayable + convertToBaseCurrency(f.supplierPayable, p.currency, p.exchangeRate),
        amountCollected: acc.amountCollected + convertToBaseCurrency(f.amountCollected, p.currency, p.exchangeRate),
        amountOutstanding:
          acc.amountOutstanding + convertToBaseCurrency(f.amountOutstanding, p.currency, p.exchangeRate),
        amountPaidToSupplier:
          acc.amountPaidToSupplier + convertToBaseCurrency(f.amountPaidToSupplier, p.currency, p.exchangeRate),
        supplierOutstanding:
          acc.supplierOutstanding + convertToBaseCurrency(f.supplierOutstanding, p.currency, p.exchangeRate),
      }
    },
    {
      supplierCost: 0,
      sellingPrice: 0,
      grossProfit: 0,
      netProfit: 0,
      clientReceivable: 0,
      supplierPayable: 0,
      amountCollected: 0,
      amountOutstanding: 0,
      amountPaidToSupplier: 0,
      supplierOutstanding: 0,
    },
  )

  const exchangeRate = 1

  return {
    supplierCost: roundMoney(totals.supplierCost),
    sellingPrice: roundMoney(totals.sellingPrice),
    grossProfit: roundMoney(totals.grossProfit),
    netProfit: roundMoney(totals.netProfit),
    clientReceivable: roundMoney(totals.clientReceivable),
    supplierPayable: roundMoney(totals.supplierPayable),
    amountCollected: roundMoney(totals.amountCollected),
    amountOutstanding: roundMoney(totals.amountOutstanding),
    amountPaidToSupplier: roundMoney(totals.amountPaidToSupplier),
    supplierOutstanding: roundMoney(totals.supplierOutstanding),
    currency: BASE_CURRENCY,
    exchangeRate,
    paymentStatus: resolvePaymentStatus(totals.amountCollected, totals.clientReceivable),
    ticketCount: tickets.length,
    issuedCount,
  }
}

export function refreshFlightServiceDetails(
  details: FlightServiceDetails,
  defaultCurrency = BASE_CURRENCY,
): FlightServiceDetails {
  const passengers = details.passengers.map((passenger) => ({
    ...passenger,
    tickets: passenger.tickets.map((ticket) =>
      refreshTicketComputedFields({
        ...ticket,
        passengerId: ticket.passengerId || passenger.id,
      }),
    ),
  }))

  return {
    ...details,
    passengers,
    financialSummary: aggregateServiceFinancials(passengers, defaultCurrency),
    schemaVersion: details.schemaVersion,
  }
}

export function createLedgerEntry(
  partial: Omit<TicketLedgerEntry, 'id'> & { id?: string },
): TicketLedgerEntry {
  return {
    id: partial.id ?? createLedgerEntryId(),
    date: partial.date,
    transactionType: partial.transactionType,
    transactionId: partial.transactionId,
    description: partial.description,
    debit: roundMoney(partial.debit),
    credit: roundMoney(partial.credit),
    currency: partial.currency,
    exchangeRate: partial.exchangeRate,
    userId: partial.userId,
    userName: partial.userName,
    referenceNumber: partial.referenceNumber,
  }
}

export function createLedgerEntryId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `led-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function createTransactionId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `txn-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function sumTransactionsByType(
  transactions: TicketTransaction[],
  type: TicketTransaction['type'],
): number {
  return transactions
    .filter((t) => t.type === type && t.status === 'completed')
    .reduce((sum, t) => {
      if (t.refund) return sum + t.refund.netRefund
      if (t.payment) return sum + t.payment.amount
      if (t.reissue) return sum + t.reissue.amountToCollect - t.reissue.amountToPay
      return sum
    }, 0)
}
