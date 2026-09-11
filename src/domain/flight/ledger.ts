import { createLedgerEntry, createLedgerEntryId } from '@/domain/flight/financial'
import type {
  CancellationTransactionData,
  FlightTicket,
  IssueTransactionData,
  ReissueTransactionData,
  RefundTransactionData,
  TicketLedgerEntry,
  TicketTransaction,
  TicketTransactionType,
  VoidTransactionData,
} from '@/domain/flight/types'

function buildProfitLossAdjustmentEntry(
  transaction: TicketTransaction,
  profitLoss: number,
  description: string,
  date: string,
  currency: string,
  exchangeRate: number,
  userId?: string,
  userName?: string,
): TicketLedgerEntry | null {
  if (profitLoss === 0) return null
  return createLedgerEntry({
    id: createLedgerEntryId(),
    date,
    transactionType: 'manual_adjustment',
    transactionId: transaction.id,
    description,
    debit: profitLoss < 0 ? Math.abs(profitLoss) : 0,
    credit: profitLoss > 0 ? profitLoss : 0,
    currency,
    exchangeRate,
    userId,
    userName,
  })
}

export function buildIssueLedgerEntries(
  transaction: TicketTransaction,
  ticket: FlightTicket,
  userId?: string,
  userName?: string,
): TicketLedgerEntry[] {
  const data = transaction.issue as IssueTransactionData
  return [
    createLedgerEntry({
      id: createLedgerEntryId(),
      date: data.issueDate,
      transactionType: 'issue',
      transactionId: transaction.id,
      description: `Ticket issued — ${data.ticketNumber}`,
      debit: ticket.pricing.supplierCost,
      credit: ticket.pricing.sellingPrice,
      currency: ticket.pricing.currency,
      exchangeRate: ticket.pricing.exchangeRate,
      userId,
      userName,
      referenceNumber: data.ticketNumber,
    }),
  ]
}

export function buildRefundLedgerEntries(
  transaction: TicketTransaction,
  ticket: FlightTicket,
  userId?: string,
  userName?: string,
): TicketLedgerEntry[] {
  const data = transaction.refund as RefundTransactionData
  const entries: TicketLedgerEntry[] = [
    createLedgerEntry({
      id: createLedgerEntryId(),
      date: data.refundRequestDate,
      transactionType: transaction.type as Extract<TicketTransactionType, 'refund' | 'partial_refund'>,
      transactionId: transaction.id,
      description: `Refund ${data.status} — gross ${data.refundAmount}, net ${data.netRefund}`,
      debit: data.netRefund,
      credit: data.refundAmount,
      currency: ticket.pricing.currency,
      exchangeRate: ticket.pricing.exchangeRate,
      userId,
      userName,
    }),
  ]

  const adjustment = buildProfitLossAdjustmentEntry(
    transaction,
    data.profitLoss,
    'Refund P/L adjustment',
    data.refundProcessedDate ?? data.refundRequestDate,
    ticket.pricing.currency,
    ticket.pricing.exchangeRate,
    userId,
    userName,
  )
  if (adjustment) entries.push(adjustment)

  return entries
}

export function buildReissueLedgerEntries(
  transaction: TicketTransaction,
  ticket: FlightTicket,
  userId?: string,
  userName?: string,
): TicketLedgerEntry[] {
  const data = transaction.reissue as ReissueTransactionData
  const entries: TicketLedgerEntry[] = [
    createLedgerEntry({
      id: createLedgerEntryId(),
      date: transaction.createdAt.slice(0, 10),
      transactionType: transaction.type as Extract<TicketTransactionType, 'reissue' | 'partial_reissue'>,
      transactionId: transaction.id,
      description: `Reissue ${data.oldTicketNumber} → ${data.newTicketNumber}`,
      debit: data.amountToPay,
      credit: data.amountToCollect,
      currency: ticket.pricing.currency,
      exchangeRate: ticket.pricing.exchangeRate,
      userId,
      userName,
      referenceNumber: data.newTicketNumber,
    }),
  ]

  const adjustment = buildProfitLossAdjustmentEntry(
    transaction,
    data.profit,
    'Reissue P/L adjustment',
    transaction.createdAt.slice(0, 10),
    ticket.pricing.currency,
    ticket.pricing.exchangeRate,
    userId,
    userName,
  )
  if (adjustment) entries.push(adjustment)

  return entries
}

export function buildVoidLedgerEntries(
  transaction: TicketTransaction,
  ticket: FlightTicket,
  userId?: string,
  userName?: string,
): TicketLedgerEntry[] {
  const data = transaction.void as VoidTransactionData
  const totalFees = data.voidFee + data.supplierFee + data.agencyFee
  const entries: TicketLedgerEntry[] = [
    createLedgerEntry({
      id: createLedgerEntryId(),
      date: transaction.createdAt.slice(0, 10),
      transactionType: 'void',
      transactionId: transaction.id,
      description: `Ticket voided — selling price reversed`,
      debit: totalFees,
      credit: ticket.pricing.sellingPrice,
      currency: ticket.pricing.currency,
      exchangeRate: ticket.pricing.exchangeRate,
      userId,
      userName,
    }),
  ]

  const adjustment = buildProfitLossAdjustmentEntry(
    transaction,
    data.profitLoss,
    'Void P/L adjustment',
    transaction.createdAt.slice(0, 10),
    ticket.pricing.currency,
    ticket.pricing.exchangeRate,
    userId,
    userName,
  )
  if (adjustment) entries.push(adjustment)

  return entries
}

export function buildCancellationLedgerEntries(
  transaction: TicketTransaction,
  ticket: FlightTicket,
  userId?: string,
  userName?: string,
): TicketLedgerEntry[] {
  const data = transaction.cancellation as CancellationTransactionData
  const grossBase = data.isRefundable ? ticket.pricing.sellingPrice : 0
  const entries: TicketLedgerEntry[] = [
    createLedgerEntry({
      id: createLedgerEntryId(),
      date: transaction.createdAt.slice(0, 10),
      transactionType: 'cancellation',
      transactionId: transaction.id,
      description: data.isRefundable
        ? `Cancellation with refund — gross ${grossBase}, net ${data.netRefund}`
        : 'Non-refundable cancellation',
      debit: data.netRefund,
      credit: grossBase,
      currency: ticket.pricing.currency,
      exchangeRate: ticket.pricing.exchangeRate,
      userId,
      userName,
    }),
  ]

  const adjustment = buildProfitLossAdjustmentEntry(
    transaction,
    data.profitLoss,
    'Cancellation P/L adjustment',
    transaction.createdAt.slice(0, 10),
    ticket.pricing.currency,
    ticket.pricing.exchangeRate,
    userId,
    userName,
  )
  if (adjustment) entries.push(adjustment)

  return entries
}

export function buildPaymentLedgerEntries(
  transaction: TicketTransaction,
  type: Extract<TicketTransactionType, 'client_payment' | 'supplier_payment' | 'refund_payment'>,
  userId?: string,
  userName?: string,
): TicketLedgerEntry[] {
  const data = transaction.payment!
  const isClient = type === 'client_payment'
  return [
    createLedgerEntry({
      id: createLedgerEntryId(),
      date: transaction.createdAt.slice(0, 10),
      transactionType: type,
      transactionId: transaction.id,
      description: transaction.notes ?? (isClient ? 'Client payment received' : 'Supplier payment sent'),
      debit: isClient ? 0 : data.amount,
      credit: isClient ? data.amount : 0,
      currency: data.currency,
      exchangeRate: data.exchangeRate,
      userId,
      userName,
      referenceNumber: data.referenceNumber,
    }),
  ]
}

export function buildReversalLedgerEntries(
  originalEntries: TicketLedgerEntry[],
  reversalTransaction: TicketTransaction,
  originalTransaction: TicketTransaction,
  userId?: string,
  userName?: string,
): TicketLedgerEntry[] {
  const date = reversalTransaction.createdAt.slice(0, 10)
  const originalLabel = originalTransaction.type.replaceAll('_', ' ')

  return originalEntries.map((entry) =>
    createLedgerEntry({
      id: createLedgerEntryId(),
      date,
      transactionType: 'manual_adjustment',
      transactionId: reversalTransaction.id,
      description: `Reversal of ${originalLabel}: ${entry.description}`,
      debit: entry.credit,
      credit: entry.debit,
      currency: entry.currency,
      exchangeRate: entry.exchangeRate,
      userId,
      userName,
      referenceNumber: entry.referenceNumber,
    }),
  )
}
