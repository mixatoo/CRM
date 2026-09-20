import type { Invoice } from '@/domain/entities/invoice'
import { invoiceBalanceDue, INVOICE_STATUS_LABELS } from '@/domain/entities/invoice'
import { paginateItems, type PaginatedResult } from '@/types/pagination'

export type ClientLinkedInvoiceRow = Invoice & {
  tripReference: string
}

export type ClientLinkedInvoiceSortField =
  | 'invoice'
  | 'issued'
  | 'due'
  | 'trip'
  | 'total'
  | 'balance'
  | 'status'

export type ClientLinkedInvoiceSortDir = 'asc' | 'desc'

function sortValue(invoice: ClientLinkedInvoiceRow, field: ClientLinkedInvoiceSortField): string | number {
  switch (field) {
    case 'invoice':
      return invoice.number.toLowerCase()
    case 'issued':
      return invoice.issuedAt
    case 'due':
      return invoice.dueDate
    case 'trip':
      return invoice.tripReference.toLowerCase()
    case 'total':
      return invoice.total
    case 'balance':
      return invoiceBalanceDue(invoice)
    case 'status':
      return INVOICE_STATUS_LABELS[invoice.status].toLowerCase()
  }
}

export function sortClientLinkedInvoices(
  invoices: ClientLinkedInvoiceRow[],
  sortBy: ClientLinkedInvoiceSortField,
  sortDir: ClientLinkedInvoiceSortDir,
): ClientLinkedInvoiceRow[] {
  const dir = sortDir === 'asc' ? 1 : -1
  return [...invoices].sort((left, right) => {
    const leftValue = sortValue(left, sortBy)
    const rightValue = sortValue(right, sortBy)

    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      const cmp = leftValue - rightValue
      if (cmp !== 0) return cmp * dir
    } else {
      const cmp = String(leftValue).localeCompare(String(rightValue), undefined, {
        numeric: sortBy === 'invoice',
      })
      if (cmp !== 0) return cmp * dir
    }

    return right.issuedAt.localeCompare(left.issuedAt) * dir
  })
}

export function paginateClientLinkedInvoices(
  invoices: ClientLinkedInvoiceRow[],
  page: number,
  pageSize: number,
): PaginatedResult<ClientLinkedInvoiceRow> {
  return paginateItems(invoices, page, pageSize)
}
