import { describe, expect, it } from 'vitest'
import {
  applyClientPayment,
  applyIssueTicket,
  applyRefundTicket,
  createEmptyFlightPassenger,
  createEmptyFlightTicket,
  defaultFlightServiceDetails,
} from '@/domain/flight/ticket'
import {
  canReverseTransaction,
  getLastReversibleTransaction,
  reverseTicketTransaction,
} from '@/domain/flight/reversal'
import type { IssueTransactionData } from '@/domain/flight/types'

const adminCtx = { userRole: 'admin' as const, serviceStatus: 'confirmed' as const, userId: 'u1', userName: 'Admin' }

const validIssue: IssueTransactionData = {
  issueDate: '2026-06-29',
  ticketNumber: '176-1234567890',
  currency: 'EGP',
  exchangeRate: 1,
  fulfillmentSource: 'gds',
  supplierId: 'agency-gds',
  supplierName: 'Agency GDS',
  fare: 800,
  taxes: 50,
  airlineFees: 0,
  supplierFees: 0,
  agencyServiceFees: 100,
  commission: 0,
  clientDiscount: 0,
  sellingPrice: 1000,
}

function serviceWithTicket(status: 'draft' | 'issued' = 'draft') {
  const passenger = createEmptyFlightPassenger('one_way', {}, 'EGP')
  const ticket = createEmptyFlightTicket(passenger.id, 'one_way', { status }, 'EGP')
  return {
    ...defaultFlightServiceDetails('one_way', 'EGP'),
    passengers: [{ ...passenger, tickets: [ticket] }],
  }
}

function issueTicket() {
  const details = serviceWithTicket('draft')
  const ticketId = details.passengers[0]!.tickets[0]!.id
  const result = applyIssueTicket(details, ticketId, validIssue, adminCtx)
  expect(result.ok).toBe(true)
  if (!result.ok) throw new Error('issue failed')
  return { details: result.value, ticketId, ticket: result.value.passengers[0]!.tickets[0]! }
}

describe('reverseTicketTransaction', () => {
  it('reverses the latest issue and restores draft status with balanced ledger', () => {
    const { details, ticketId, ticket } = issueTicket()
    const issueTxnId = ticket.transactions[0]!.id

    const reversed = reverseTicketTransaction(details, ticketId, issueTxnId, 'Wrong selling price', adminCtx)
    expect(reversed.ok).toBe(true)
    if (!reversed.ok) return

    const next = reversed.value.passengers[0]!.tickets[0]!
    expect(next.status).toBe('draft')
    expect(next.transactions[0]?.status).toBe('cancelled')
    expect(next.transactions[1]?.type).toBe('manual_adjustment')
    expect(next.transactions[1]?.reversesTransactionId).toBe(issueTxnId)

    const netDebit = next.ledger.reduce((sum, entry) => sum + entry.debit - entry.credit, 0)
    expect(netDebit).toBe(0)
    expect(next.financials.clientReceivable).toBe(0)
  })

  it('blocks reversing a transaction that is not the most recent', () => {
    const { details, ticketId, ticket } = issueTicket()
    const issueTxnId = ticket.transactions[0]!.id

    const withPayment = applyClientPayment(
      details,
      ticketId,
      { amount: 500, currency: 'EGP', exchangeRate: 1 },
      adminCtx,
    )
    expect(withPayment.ok).toBe(true)
    if (!withPayment.ok) return

    const updatedTicket = withPayment.value.passengers[0]!.tickets[0]!
    expect(getLastReversibleTransaction(updatedTicket)?.id).not.toBe(issueTxnId)

    const gate = canReverseTransaction(updatedTicket, issueTxnId, adminCtx)
    expect(gate.ok).toBe(false)
  })

  it('allows reversing refund after issue when refund is latest', () => {
    const { details, ticketId } = issueTicket()

    const refunded = applyRefundTicket(
      details,
      ticketId,
      {
        refundRequestDate: '2026-06-30',
        refundAmount: 1000,
        airlinePenalty: 0,
        supplierFees: 0,
        agencyFees: 0,
        netRefund: 1000,
        profitLoss: 0,
        status: 'processed',
      },
      false,
      adminCtx,
    )
    expect(refunded.ok).toBe(true)
    if (!refunded.ok) return

    const ticket = refunded.value.passengers[0]!.tickets[0]!
    const refundTxnId = getLastReversibleTransaction(ticket)!.id

    const reversed = reverseTicketTransaction(refunded.value, ticketId, refundTxnId, 'Refund recorded by mistake', adminCtx)
    expect(reversed.ok).toBe(true)
    if (!reversed.ok) return

    const next = reversed.value.passengers[0]!.tickets[0]!
    expect(next.status).toBe('issued')
    expect(next.transactions.filter((txn) => txn.status === 'completed' && txn.type !== 'manual_adjustment')).toHaveLength(1)
  })
})
