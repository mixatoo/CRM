import type { TripServiceStatus } from '@/domain/entities/trip-service'
import type { UserRole } from '@/domain/entities'
import { canMutate, type Action, type Resource } from '@/domain/policies/permissions'
import type {
  CancellationTransactionData,
  FlightTicket,
  IssueTransactionData,
  PaymentTransactionData,
  RefundTransactionData,
  ReissueTransactionData,
  TicketStatus,
  VoidTransactionData,
} from '@/domain/flight/types'
import { TICKET_STATUS_LABELS } from '@/domain/flight/types'
import { isBaseCurrency, normalizeExchangeRate } from '@/domain/currency'
import { roundMoney, sumTransactionsByType } from '@/domain/flight/financial'
import { err, ok, type Result } from '@/shared/result'

export type TicketOperation =
  | 'issue'
  | 'void'
  | 'refund'
  | 'partial_refund'
  | 'reissue'
  | 'cancel'
  | 'client_payment'
  | 'supplier_payment'

export interface TicketOperationContext {
  serviceStatus?: TripServiceStatus
  userRole?: UserRole
}

export interface TicketOperationAvailability {
  operation: TicketOperation
  allowed: boolean
  reason?: string
}

const TERMINAL_STATUSES = new Set<TicketStatus>(['void', 'cancelled'])

const STATUS_MATRIX: Record<TicketStatus, ReadonlySet<TicketOperation>> = {
  draft: new Set(['issue', 'cancel']),
  requested: new Set(['issue', 'cancel']),
  issued: new Set(['void', 'refund', 'partial_refund', 'reissue', 'cancel', 'client_payment', 'supplier_payment']),
  reissued: new Set(['void', 'refund', 'partial_refund', 'reissue', 'cancel', 'client_payment', 'supplier_payment']),
  exchanged: new Set(['refund', 'partial_refund', 'reissue', 'cancel', 'client_payment', 'supplier_payment']),
  partially_refunded: new Set(['partial_refund', 'refund', 'client_payment', 'supplier_payment']),
  refunded: new Set(['client_payment', 'supplier_payment']),
  void: new Set(),
  cancelled: new Set(),
}

const OPERATION_LABELS: Record<TicketOperation, string> = {
  issue: 'Issue',
  void: 'Void',
  refund: 'Refund',
  partial_refund: 'Partial refund',
  reissue: 'Reissue',
  cancel: 'Cancel',
  client_payment: 'Receive payment',
  supplier_payment: 'Pay supplier',
}

export function ticketOperationLabel(operation: TicketOperation): string {
  return OPERATION_LABELS[operation]
}

export function ticketOperationPermission(operation: TicketOperation): { resource: Resource; action: Action } {
  if (operation === 'client_payment' || operation === 'supplier_payment') {
    return { resource: 'payment', action: 'create' }
  }
  return { resource: 'service', action: 'update' }
}

function statusLabel(status: TicketStatus): string {
  return TICKET_STATUS_LABELS[status] ?? status
}

function serviceBlocksOperations(serviceStatus?: TripServiceStatus): string | null {
  if (serviceStatus === 'canceled') {
    return 'This flight service is canceled. Ticket operations are locked.'
  }
  return null
}

function roleBlocksOperation(operation: TicketOperation, role?: UserRole): string | null {
  if (!role) return 'You must be signed in to perform this action.'
  const { resource, action } = ticketOperationPermission(operation)
  if (!canMutate(role, resource, action)) {
    return `Your role cannot ${OPERATION_LABELS[operation].toLowerCase()} on this service.`
  }
  return null
}

export function isTicketOperationAllowedByStatus(status: TicketStatus, operation: TicketOperation): boolean {
  return STATUS_MATRIX[status]?.has(operation) ?? false
}

export function validateTicketOperation(
  ticket: FlightTicket,
  operation: TicketOperation,
  ctx: TicketOperationContext = {},
): Result<void> {
  const serviceBlock = serviceBlocksOperations(ctx.serviceStatus)
  if (serviceBlock) return err({ code: 'CONFLICT', message: serviceBlock })

  const roleBlock = roleBlocksOperation(operation, ctx.userRole)
  if (roleBlock) return err({ code: 'PERMISSION_DENIED', message: roleBlock })

  if (!isTicketOperationAllowedByStatus(ticket.status, operation)) {
    if (TERMINAL_STATUSES.has(ticket.status)) {
      return err({
        code: 'CONFLICT',
        message: `Cannot ${OPERATION_LABELS[operation].toLowerCase()} — ticket is ${statusLabel(ticket.status)}.`,
      })
    }
    return err({
      code: 'VALIDATION',
      message: `${OPERATION_LABELS[operation]} is not available for tickets with status "${statusLabel(ticket.status)}".`,
    })
  }

  if (operation === 'refund' && ticket.status === 'partially_refunded') {
    const remaining = getRemainingRefundableAmount(ticket)
    if (remaining <= 0) {
      return err({ code: 'CONFLICT', message: 'This ticket has already been fully refunded.' })
    }
  }

  if (operation === 'partial_refund' && ticket.status === 'refunded') {
    return err({ code: 'CONFLICT', message: 'Ticket is already fully refunded.' })
  }

  return ok(undefined)
}

export function listTicketOperationAvailability(
  ticket: FlightTicket,
  ctx: TicketOperationContext = {},
): TicketOperationAvailability[] {
  const operations: TicketOperation[] = [
    'issue',
    'void',
    'refund',
    'partial_refund',
    'reissue',
    'cancel',
    'client_payment',
    'supplier_payment',
  ]

  return operations.map((operation) => {
    const result = validateTicketOperation(ticket, operation, ctx)
    return {
      operation,
      allowed: result.ok,
      reason: result.ok ? undefined : result.error.message,
    }
  })
}

export function getRemainingRefundableAmount(ticket: FlightTicket): number {
  const priorRefunds = sumTransactionsByType(ticket.transactions, 'refund')
    + sumTransactionsByType(ticket.transactions, 'partial_refund')
  return roundMoney(Math.max(0, ticket.pricing.sellingPrice - priorRefunds))
}

export function validateIssueData(data: IssueTransactionData): Result<void> {
  if (!data.ticketNumber?.trim()) {
    return err({ code: 'VALIDATION', message: 'Ticket number is required.', fields: { ticketNumber: 'Required' } })
  }
  if (!data.issueDate?.trim()) {
    return err({ code: 'VALIDATION', message: 'Issue date is required.', fields: { issueDate: 'Required' } })
  }
  if (data.sellingPrice <= 0) {
    return err({ code: 'VALIDATION', message: 'Selling price must be greater than zero.', fields: { sellingPrice: 'Must be > 0' } })
  }
  const currency = data.currency.trim().toUpperCase()
  if (!isBaseCurrency(currency) && normalizeExchangeRate(currency, data.exchangeRate) <= 0) {
    return err({
      code: 'VALIDATION',
      message: 'Exchange rate to EGP is required for foreign-currency tickets.',
      fields: { exchangeRate: 'Required' },
    })
  }
  const supplierCost = data.fare + data.taxes + data.airlineFees + data.supplierFees
  if (supplierCost < 0) {
    return err({ code: 'VALIDATION', message: 'Supplier cost cannot be negative.' })
  }
  if (data.fulfillmentSource === 'external_supplier' && !data.supplierName?.trim()) {
    return err({
      code: 'VALIDATION',
      message: 'Select the external supplier for this ticket.',
      fields: { supplierName: 'Required' },
    })
  }
  return ok(undefined)
}

export function validateRefundData(ticket: FlightTicket, data: RefundTransactionData, partial: boolean): Result<void> {
  if (data.refundAmount <= 0) {
    return err({ code: 'VALIDATION', message: 'Refund amount must be greater than zero.' })
  }
  const maxRefundable = getRemainingRefundableAmount(ticket)
  if (data.refundAmount > maxRefundable + 0.01) {
    return err({
      code: 'VALIDATION',
      message: `Refund amount cannot exceed ${maxRefundable.toFixed(2)} ${ticket.pricing.currency}.`,
    })
  }
  if (!partial && data.refundAmount < maxRefundable - 0.01 && ticket.status !== 'partially_refunded') {
    return err({
      code: 'VALIDATION',
      message: 'Full refund amount must match the remaining selling price, or use partial refund.',
    })
  }
  return ok(undefined)
}

export function validateReissueData(ticket: FlightTicket, data: ReissueTransactionData): Result<void> {
  if (!data.newTicketNumber?.trim()) {
    return err({ code: 'VALIDATION', message: 'New ticket number is required.' })
  }
  if (data.newTicketNumber.trim() === data.oldTicketNumber.trim()) {
    return err({ code: 'VALIDATION', message: 'New ticket number must differ from the current number.' })
  }
  if (!data.oldTicketNumber?.trim() && !ticket.ticketNumber?.trim()) {
    return err({ code: 'VALIDATION', message: 'Current ticket number is missing.' })
  }
  return ok(undefined)
}

export function validateVoidData(_ticket: FlightTicket, data: VoidTransactionData): Result<void> {
  if (data.voidFee < 0 || data.supplierFee < 0 || data.agencyFee < 0) {
    return err({ code: 'VALIDATION', message: 'Fees cannot be negative.' })
  }
  return ok(undefined)
}

export function validateCancellationData(data: CancellationTransactionData): Result<void> {
  if (data.cancellationPenalty < 0 || data.supplierFees < 0 || data.agencyFees < 0) {
    return err({ code: 'VALIDATION', message: 'Cancellation fees cannot be negative.' })
  }
  return ok(undefined)
}

export function validatePaymentData(
  ticket: FlightTicket,
  type: 'client' | 'supplier',
  data: PaymentTransactionData,
): Result<void> {
  if (data.amount <= 0) {
    return err({ code: 'VALIDATION', message: 'Payment amount must be greater than zero.' })
  }
  if (type === 'client') {
    if (ticket.financials.amountOutstanding <= 0) {
      return err({ code: 'VALIDATION', message: 'No client balance outstanding on this ticket.' })
    }
    if (data.amount > ticket.financials.amountOutstanding + 0.01) {
      return err({
        code: 'VALIDATION',
        message: `Amount exceeds client outstanding balance (${ticket.financials.amountOutstanding.toFixed(2)}).`,
      })
    }
  } else {
    if (ticket.financials.supplierOutstanding <= 0) {
      return err({ code: 'VALIDATION', message: 'No supplier balance outstanding on this ticket.' })
    }
    if (data.amount > ticket.financials.supplierOutstanding + 0.01) {
      return err({
        code: 'VALIDATION',
        message: `Amount exceeds supplier outstanding balance (${ticket.financials.supplierOutstanding.toFixed(2)}).`,
      })
    }
  }
  return ok(undefined)
}
