import { canMutate } from '@/domain/policies/permissions'
import {
  computeTicketFinancials,
  createTransactionId,
  normalizeTicketPricing,
  refreshTicketComputedFields,
} from '@/domain/flight/financial'
import { buildReversalLedgerEntries } from '@/domain/flight/ledger'
import {
  defaultTicketPricing,
  findTicketInService,
  updateTicketInService,
  type OperationContext,
} from '@/domain/flight/ticket'
import type {
  FlightServiceDetails,
  FlightTicket,
  TicketStatus,
  TicketTransaction,
  TicketTransactionType,
} from '@/domain/flight/types'
import { AGENCY_GDS_SUPPLIER_ID, AGENCY_GDS_SUPPLIER_NAME } from '@/domain/flight/types'
import { normalizeExchangeRate } from '@/domain/currency'
import { err, ok, type Result } from '@/shared/result'

const NON_REVERSIBLE_TYPES = new Set<TicketTransactionType>(['manual_adjustment', 'credit_note', 'debit_note', 'exchange', 'refund_payment'])

export function getLastReversibleTransaction(ticket: FlightTicket): TicketTransaction | null {
  const completed = ticket.transactions
    .filter((txn) => txn.status === 'completed' && !NON_REVERSIBLE_TYPES.has(txn.type))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id))

  return completed[0] ?? null
}

export function canReverseTransaction(
  ticket: FlightTicket,
  transactionId: string,
  ctx: OperationContext = {},
): Result<void> {
  if (!ctx.userRole) {
    return err({ code: 'PERMISSION_DENIED', message: 'You must be signed in to reverse a transaction.' })
  }
  if (!canMutate(ctx.userRole, 'service', 'update')) {
    return err({ code: 'PERMISSION_DENIED', message: 'Your role cannot reverse ticket transactions.' })
  }

  const txn = ticket.transactions.find((row) => row.id === transactionId)
  if (!txn) {
    return err({ code: 'NOT_FOUND', message: 'Transaction not found on this ticket.' })
  }
  if (txn.status === 'cancelled') {
    return err({ code: 'CONFLICT', message: 'This transaction was already reversed.' })
  }
  if (txn.status !== 'completed') {
    return err({ code: 'CONFLICT', message: 'Only completed transactions can be reversed.' })
  }
  if (NON_REVERSIBLE_TYPES.has(txn.type)) {
    return err({ code: 'CONFLICT', message: 'This transaction type cannot be reversed.' })
  }

  const latest = getLastReversibleTransaction(ticket)
  if (!latest || latest.id !== transactionId) {
    return err({
      code: 'CONFLICT',
      message: 'Only the most recent transaction can be reversed. Reverse newer transactions first.',
    })
  }

  return ok(undefined)
}

export function reconcileTicketFromTransactions(ticket: FlightTicket): FlightTicket {
  const active = ticket.transactions
    .filter((txn) => txn.status === 'completed' && txn.type !== 'manual_adjustment')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  let status: TicketStatus = 'draft'
  let ticketNumber = ''
  let issueDate: string | undefined
  let supplierId: string | undefined
  let supplierName = ''
  let pricing = defaultTicketPricing(ticket.pricing.currency)

  for (const txn of active) {
    switch (txn.type) {
      case 'issue': {
        const data = txn.issue
        if (!data) break
        status = 'issued'
        ticketNumber = data.ticketNumber
        issueDate = data.issueDate
        pricing = normalizeTicketPricing({
          fare: data.fare,
          taxes: data.taxes,
          airlineFees: data.airlineFees,
          supplierFees: data.supplierFees,
          agencyServiceFees: data.agencyServiceFees,
          commission: data.commission,
          clientDiscount: data.clientDiscount,
          sellingPrice: data.sellingPrice,
          currency: data.currency,
          exchangeRate: normalizeExchangeRate(data.currency, data.exchangeRate),
        })
        if (data.fulfillmentSource === 'gds') {
          supplierId = AGENCY_GDS_SUPPLIER_ID
          supplierName = AGENCY_GDS_SUPPLIER_NAME
        } else {
          supplierId = data.supplierId?.trim() || undefined
          supplierName = data.supplierName?.trim() ?? ''
        }
        break
      }
      case 'refund':
        status = 'refunded'
        break
      case 'partial_refund':
        status = 'partially_refunded'
        break
      case 'reissue':
      case 'partial_reissue':
        status = 'reissued'
        if (txn.reissue) ticketNumber = txn.reissue.newTicketNumber
        break
      case 'void':
        status = 'void'
        break
      case 'cancellation':
        status = 'cancelled'
        break
      default:
        break
    }
  }

  const financials = computeTicketFinancials(pricing, ticket.ledger)
  return refreshTicketComputedFields({
    ...ticket,
    status,
    ticketNumber,
    issueDate,
    supplierId,
    supplierName,
    pricing,
    financials,
  })
}

export function reverseTicketTransaction(
  details: FlightServiceDetails,
  ticketId: string,
  transactionId: string,
  reason: string,
  ctx: OperationContext = {},
): Result<FlightServiceDetails> {
  const found = findTicketInService(details, ticketId)
  if (!found) {
    return err({ code: 'NOT_FOUND', message: 'Ticket not found in this service.' })
  }

  const gate = canReverseTransaction(found.ticket, transactionId, ctx)
  if (!gate.ok) return gate

  const trimmedReason = reason.trim()
  if (!trimmedReason) {
    return err({ code: 'VALIDATION', message: 'A reason is required to reverse a transaction.' })
  }

  return ok(reverseTicketTransactionImpl(details, ticketId, transactionId, trimmedReason, ctx))
}

function reverseTicketTransactionImpl(
  details: FlightServiceDetails,
  ticketId: string,
  transactionId: string,
  reason: string,
  ctx: OperationContext,
): FlightServiceDetails {
  const found = findTicketInService(details, ticketId)
  if (!found) return details

  const original = found.ticket.transactions.find((txn) => txn.id === transactionId)
  if (!original || original.status !== 'completed') return details

  const reversalTransaction: TicketTransaction = {
    id: createTransactionId(),
    type: 'manual_adjustment',
    ticketId,
    reversesTransactionId: transactionId,
    createdAt: new Date().toISOString(),
    createdBy: ctx.userId,
    createdByName: ctx.userName,
    status: 'completed',
    notes: `Reversal of ${original.type.replaceAll('_', ' ')}: ${reason}`,
  }

  const reversalEntries = buildReversalLedgerEntries(
    found.ticket.ledger.filter((entry) => entry.transactionId === transactionId),
    reversalTransaction,
    original,
    ctx.userId,
    ctx.userName,
  )

  return updateTicketInService(details, ticketId, (ticket) => {
    const cancelledTransactions = ticket.transactions.map((txn) =>
      txn.id === transactionId ? { ...txn, status: 'cancelled' as const } : txn,
    )

    const nextTicket = reconcileTicketFromTransactions({
      ...ticket,
      transactions: [...cancelledTransactions, reversalTransaction],
      ledger: [...ticket.ledger, ...reversalEntries],
    })

    return refreshTicketComputedFields(nextTicket)
  })
}
