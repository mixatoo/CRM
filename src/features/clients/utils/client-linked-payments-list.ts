import type { TripPayment } from '@/domain/entities/trip-payment'
import type { Invoice } from '@/domain/entities/invoice'
import type { PaymentAllocation } from '@/domain/entities/payment-allocation'
import { paymentUnallocatedAmount } from '@/domain/entities/payment-allocation'
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from '@/domain/entities/trip-payment'
import { paginateItems, type PaginatedResult } from '@/types/pagination'

export type ClientLinkedPaymentAllocation = PaymentAllocation & {
  invoice?: Invoice
  invoiceNumber: string
}

export type ClientLinkedPaymentRow = TripPayment & {
  tripReference: string
  invoiceNumber: string
  linkedInvoice?: Invoice
  allocations: ClientLinkedPaymentAllocation[]
  unallocatedAmount: number
}

export type ClientLinkedPaymentSortField =
  | 'invoice'
  | 'date'
  | 'trip'
  | 'method'
  | 'reference'
  | 'amount'
  | 'status'

export type ClientLinkedPaymentSortDir = 'asc' | 'desc'

function sortValue(payment: ClientLinkedPaymentRow, field: ClientLinkedPaymentSortField): string | number {
  switch (field) {
    case 'invoice':
      return payment.invoiceNumber.toLowerCase() || 'unallocated'
    case 'date':
      return payment.paidAt
    case 'trip':
      return payment.tripReference.toLowerCase()
    case 'method':
      return PAYMENT_METHOD_LABELS[payment.method].toLowerCase()
    case 'reference':
      return payment.reference?.trim().toLowerCase() ?? ''
    case 'amount':
      return payment.amount
    case 'status':
      return PAYMENT_STATUS_LABELS[payment.status].toLowerCase()
  }
}

export function sortClientLinkedPayments(
  payments: ClientLinkedPaymentRow[],
  sortBy: ClientLinkedPaymentSortField,
  sortDir: ClientLinkedPaymentSortDir,
): ClientLinkedPaymentRow[] {
  const dir = sortDir === 'asc' ? 1 : -1
  return [...payments].sort((left, right) => {
    const leftValue = sortValue(left, sortBy)
    const rightValue = sortValue(right, sortBy)

    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      const cmp = leftValue - rightValue
      if (cmp !== 0) return cmp * dir
    } else {
      const cmp = String(leftValue).localeCompare(String(rightValue), undefined, {
        numeric: sortBy === 'reference' || sortBy === 'invoice' || sortBy === 'trip',
      })
      if (cmp !== 0) return cmp * dir
    }

    return right.paidAt.localeCompare(left.paidAt) * dir
  })
}

export function paginateClientLinkedPayments(
  payments: ClientLinkedPaymentRow[],
  page: number,
  pageSize: number,
): PaginatedResult<ClientLinkedPaymentRow> {
  return paginateItems(payments, page, pageSize)
}

export function formatClientPaymentInvoiceLabel(payment: ClientLinkedPaymentRow): string {
  if (payment.allocations.length === 0) {
    return payment.unallocatedAmount > 0 ? 'Unallocated' : ''
  }
  if (payment.allocations.length === 1) {
    return payment.allocations[0]!.invoiceNumber
  }
  return `${payment.allocations[0]!.invoiceNumber} +${payment.allocations.length - 1}`
}

export function resolveClientPaymentUnallocated(payment: TripPayment, allocations: ClientLinkedPaymentAllocation[]): number {
  return paymentUnallocatedAmount(payment.amount, allocations)
}
