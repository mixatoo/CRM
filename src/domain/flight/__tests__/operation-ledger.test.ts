import { describe, expect, it } from 'vitest'
import { normalizeTicketPricing } from '@/domain/flight/financial'
import { buildIssueLedgerEntries, buildRefundLedgerEntries } from '@/domain/flight/ledger'
import {
  applyClientPayment,
  applyIssueTicket,
  applyRefundTicket,
  applyReissueTicket,
  applyVoidTicket,
  applyCancelTicket,
  createEmptyFlightPassenger,
  createEmptyFlightTicket,
  defaultFlightServiceDetails,
} from '@/domain/flight/ticket'
import type { IssueTransactionData, TicketTransaction } from '@/domain/flight/types'

const adminCtx = { userRole: 'admin' as const, serviceStatus: 'confirmed' as const }

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

function txn(partial: Partial<TicketTransaction> & Pick<TicketTransaction, 'id' | 'type' | 'ticketId'>): TicketTransaction {
  return {
    createdAt: '2026-06-30T10:00:00.000Z',
    status: 'completed',
    ...partial,
  }
}

describe('operation ledger builders', () => {
  it('records issue as supplier debit and selling credit', () => {
    const pricing = normalizeTicketPricing({ currency: 'EGP', exchangeRate: 1, fare: 800, taxes: 50, sellingPrice: 1000 })
    const ticket = createEmptyFlightTicket('p1', 'one_way', { pricing }, 'EGP')
    const transaction = txn({
      id: 'txn-issue',
      type: 'issue',
      ticketId: ticket.id,
      issue: validIssue,
    })

    const entries = buildIssueLedgerEntries(transaction, ticket)
    expect(entries).toHaveLength(1)
    expect(entries[0]?.debit).toBe(850)
    expect(entries[0]?.credit).toBe(1000)
  })

  it('records refund with optional P/L adjustment', () => {
    const pricing = normalizeTicketPricing({ currency: 'EGP', exchangeRate: 1, fare: 800, taxes: 50, sellingPrice: 1000 })
    const ticket = createEmptyFlightTicket('p1', 'one_way', { pricing }, 'EGP')
    const transaction = txn({
      id: 'txn-refund',
      type: 'refund',
      ticketId: ticket.id,
      refund: {
        refundRequestDate: '2026-06-30',
        refundAmount: 1000,
        airlinePenalty: 100,
        supplierFees: 0,
        agencyFees: 50,
        netRefund: 850,
        profitLoss: -150,
        status: 'processed',
      },
    })

    const entries = buildRefundLedgerEntries(transaction, ticket)
    expect(entries).toHaveLength(2)
    expect(entries[0]?.debit).toBe(850)
    expect(entries[0]?.credit).toBe(1000)
    expect(entries[1]?.transactionType).toBe('manual_adjustment')
  })
})

describe('computeTicketFinancials with operation ledger', () => {
  it('zeros client outstanding after full refund', () => {
    const { details, ticketId } = issueTicket()

    const refundResult = applyRefundTicket(
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
    expect(refundResult.ok).toBe(true)
    if (!refundResult.ok) return

    const refunded = refundResult.value.passengers[0]!.tickets[0]!
    expect(refunded.ledger.some((entry) => entry.transactionType === 'refund')).toBe(true)
    expect(refunded.financials.clientReceivable).toBe(0)
    expect(refunded.financials.amountOutstanding).toBe(0)
  })

  it('reduces receivable after partial refund', () => {
    const { details, ticketId } = issueTicket()

    const refundResult = applyRefundTicket(
      details,
      ticketId,
      {
        refundRequestDate: '2026-06-30',
        refundAmount: 400,
        airlinePenalty: 0,
        supplierFees: 0,
        agencyFees: 0,
        netRefund: 400,
        profitLoss: 0,
        status: 'processed',
      },
      true,
      adminCtx,
    )
    expect(refundResult.ok).toBe(true)
    if (!refundResult.ok) return

    const refunded = refundResult.value.passengers[0]!.tickets[0]!
    expect(refunded.financials.clientReceivable).toBe(600)
    expect(refunded.financials.amountOutstanding).toBe(600)
  })

  it('records void fees as remaining receivable', () => {
    const { details, ticketId } = issueTicket()

    const voidResult = applyVoidTicket(
      details,
      ticketId,
      { voidFee: 50, supplierFee: 0, agencyFee: 0, profitLoss: 100, status: 'completed' },
      adminCtx,
    )
    expect(voidResult.ok).toBe(true)
    if (!voidResult.ok) return

    const voided = voidResult.value.passengers[0]!.tickets[0]!
    expect(voided.ledger.some((entry) => entry.transactionType === 'void')).toBe(true)
    expect(voided.financials.clientReceivable).toBe(50)
  })

  it('records client payment against outstanding balance', () => {
    const { details, ticketId, ticket } = issueTicket()

    const paymentResult = applyClientPayment(
      details,
      ticketId,
      { amount: 400, currency: 'EGP', exchangeRate: 1, referenceNumber: 'RCPT-1' },
      adminCtx,
    )
    expect(paymentResult.ok).toBe(true)
    if (!paymentResult.ok) return

    const paid = paymentResult.value.passengers[0]!.tickets[0]!
    expect(paid.ledger.some((entry) => entry.transactionType === 'client_payment')).toBe(true)
    expect(paid.financials.amountCollected).toBe(400)
    expect(paid.financials.amountOutstanding).toBe(ticket.financials.amountOutstanding - 400)
  })

  it('records reissue net client charge in receivable', () => {
    const { details, ticketId } = issueTicket()

    const reissueResult = applyReissueTicket(
      details,
      ticketId,
      {
        oldTicketNumber: '176-1234567890',
        newTicketNumber: '176-1234567891',
        fareDifference: 100,
        taxDifference: 20,
        reissuePenalty: 0,
        supplierFees: 0,
        agencyFees: 30,
        amountToCollect: 150,
        amountToPay: 0,
        profit: 30,
        status: 'completed',
      },
      false,
      adminCtx,
    )
    expect(reissueResult.ok).toBe(true)
    if (!reissueResult.ok) return

    const reissued = reissueResult.value.passengers[0]!.tickets[0]!
    expect(reissued.ledger.some((entry) => entry.transactionType === 'reissue')).toBe(true)
    expect(reissued.financials.clientReceivable).toBe(1150)
  })

  it('records refundable cancellation net refund', () => {
    const { details, ticketId } = issueTicket()

    const cancelResult = applyCancelTicket(
      details,
      ticketId,
      {
        isRefundable: true,
        cancellationPenalty: 100,
        supplierFees: 0,
        agencyFees: 50,
        netRefund: 850,
        profitLoss: -150,
      },
      adminCtx,
    )
    expect(cancelResult.ok).toBe(true)
    if (!cancelResult.ok) return

    const cancelled = cancelResult.value.passengers[0]!.tickets[0]!
    expect(cancelled.ledger.some((entry) => entry.transactionType === 'cancellation')).toBe(true)
    expect(cancelled.financials.clientReceivable).toBe(150)
  })
})

describe('applyIssueTicket ledger', () => {
  it('appends issue ledger entry on issue', () => {
    const { ticket } = issueTicket()
    expect(ticket.ledger).toHaveLength(1)
    expect(ticket.ledger[0]?.transactionType).toBe('issue')
    expect(ticket.transactions).toHaveLength(1)
    expect(ticket.transactions[0]?.type).toBe('issue')
  })
})
