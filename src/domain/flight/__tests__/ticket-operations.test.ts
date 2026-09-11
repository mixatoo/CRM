import { describe, expect, it } from 'vitest'
import {
  applyIssueTicket,
  applyVoidTicket,
  createEmptyFlightPassenger,
  createEmptyFlightTicket,
  defaultFlightServiceDetails,
} from '@/domain/flight/ticket'
import {
  isTicketOperationAllowedByStatus,
  validateIssueData,
  validatePaymentData,
  validateTicketOperation,
} from '@/domain/flight/transitions'
import type { IssueTransactionData } from '@/domain/flight/types'
import { AGENCY_GDS_SUPPLIER_NAME } from '@/domain/flight/types'

const adminCtx = { userRole: 'admin' as const, serviceStatus: 'confirmed' as const }
const opsCtx = { userRole: 'operations' as const, serviceStatus: 'confirmed' as const }
const financeCtx = { userRole: 'finance' as const, serviceStatus: 'confirmed' as const }
const readonlyCtx = { userRole: 'readonly' as const, serviceStatus: 'confirmed' as const }

function serviceWithTicket(status: 'draft' | 'issued' | 'void' = 'draft') {
  const passenger = createEmptyFlightPassenger('one_way', {}, 'EGP')
  const ticket = createEmptyFlightTicket(passenger.id, 'one_way', { status }, 'EGP')
  return {
    ...defaultFlightServiceDetails('one_way', 'EGP'),
    passengers: [{ ...passenger, tickets: [ticket] }],
  }
}

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

describe('ticket status matrix', () => {
  it('allows issue on draft only', () => {
    expect(isTicketOperationAllowedByStatus('draft', 'issue')).toBe(true)
    expect(isTicketOperationAllowedByStatus('issued', 'issue')).toBe(false)
    expect(isTicketOperationAllowedByStatus('void', 'issue')).toBe(false)
  })

  it('allows void on issued', () => {
    expect(isTicketOperationAllowedByStatus('issued', 'void')).toBe(true)
    expect(isTicketOperationAllowedByStatus('draft', 'void')).toBe(false)
  })

  it('blocks all operations on void terminal status', () => {
    expect(isTicketOperationAllowedByStatus('void', 'refund')).toBe(false)
    expect(isTicketOperationAllowedByStatus('void', 'client_payment')).toBe(false)
  })
})

describe('validateTicketOperation', () => {
  it('denies issue when service is canceled', () => {
    const details = serviceWithTicket('draft')
    const ticket = details.passengers[0]!.tickets[0]!
    const result = validateTicketOperation(ticket, 'issue', { ...opsCtx, serviceStatus: 'canceled' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toMatch(/canceled/i)
  })

  it('denies mutations for readonly role', () => {
    const details = serviceWithTicket('draft')
    const ticket = details.passengers[0]!.tickets[0]!
    const result = validateTicketOperation(ticket, 'issue', readonlyCtx)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('PERMISSION_DENIED')
  })

  it('allows payments for finance role on issued ticket', () => {
    const details = serviceWithTicket('issued')
    const ticket = details.passengers[0]!.tickets[0]!
    const result = validateTicketOperation(ticket, 'client_payment', financeCtx)
    expect(result.ok).toBe(true)
  })

  it('denies payments for sales role', () => {
    const details = serviceWithTicket('issued')
    const ticket = details.passengers[0]!.tickets[0]!
    const result = validateTicketOperation(ticket, 'client_payment', { userRole: 'sales', serviceStatus: 'confirmed' })
    expect(result.ok).toBe(false)
  })
})

describe('validateIssueData', () => {
  it('requires ticket number and selling price', () => {
    expect(validateIssueData({ ...validIssue, ticketNumber: '' }).ok).toBe(false)
    expect(validateIssueData({ ...validIssue, sellingPrice: 0 }).ok).toBe(false)
  })

  it('requires FX rate for foreign currency', () => {
    expect(
      validateIssueData({ ...validIssue, currency: 'USD', exchangeRate: 0 }).ok,
    ).toBe(false)
  })

  it('requires external supplier when fulfillment is external', () => {
    expect(
      validateIssueData({
        ...validIssue,
        fulfillmentSource: 'external_supplier',
        supplierId: '',
        supplierName: '',
      }).ok,
    ).toBe(false)
  })
})

describe('applyIssueTicket', () => {
  it('issues draft ticket and blocks duplicate issue', () => {
    const details = serviceWithTicket('draft')
    const ticketId = details.passengers[0]!.tickets[0]!.id

    const first = applyIssueTicket(details, ticketId, validIssue, adminCtx)
    expect(first.ok).toBe(true)
    if (!first.ok) return

    const issued = first.value.passengers[0]!.tickets[0]!
    expect(issued.status).toBe('issued')
    expect(issued.supplierName).toBe(AGENCY_GDS_SUPPLIER_NAME)

    const second = applyIssueTicket(first.value, ticketId, validIssue, adminCtx)
    expect(second.ok).toBe(false)
  })

  it('rejects void on draft ticket', () => {
    const details = serviceWithTicket('draft')
    const ticketId = details.passengers[0]!.tickets[0]!.id

    const result = applyVoidTicket(
      details,
      ticketId,
      { voidFee: 0, supplierFee: 0, agencyFee: 0, profitLoss: 0, status: 'completed' },
      adminCtx,
    )
    expect(result.ok).toBe(false)
  })
})

describe('validatePaymentData', () => {
  it('rejects payment above outstanding', () => {
    const details = serviceWithTicket('draft')
    const ticket = details.passengers[0]!.tickets[0]!
    const issued = applyIssueTicket(details, ticket.id, validIssue, adminCtx)
    expect(issued.ok).toBe(true)
    if (!issued.ok) return

    const issuedTicket = issued.value.passengers[0]!.tickets[0]!
    const result = validatePaymentData(issuedTicket, 'client', {
      amount: issuedTicket.financials.amountOutstanding + 100,
      currency: 'EGP',
      exchangeRate: 1,
    })
    expect(result.ok).toBe(false)
  })
})
