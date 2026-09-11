import type { ServiceCategory } from '@/domain/entities/trip'
import type { TripServiceStatus } from '@/domain/entities/trip-service'

export type InvoiceStatus = 'draft' | 'pending' | 'sent' | 'paid' | 'void'

export interface InvoiceLineItem {
  id: string
  serviceId?: string
  description: string
  quantity: number
  unitAmount: number
  amount: number
  currency: string
  category?: ServiceCategory
  serviceStatus?: TripServiceStatus
  lineNumber?: number
  supplierName?: string
  serviceStartDate?: string
  serviceEndDate?: string
  detailRows?: InvoiceLineDetailRow[]
  detailNote?: string
  detailSummary?: string
}

export interface InvoiceLineDetailRow {
  label: string
  value: string
}

export interface Invoice {
  id: string
  tripId: string
  number: string
  status: InvoiceStatus
  clientName: string
  clientEmail?: string
  currency: string
  lineItems: InvoiceLineItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  amountPaid: number
  notes?: string
  issuedAt: string
  dueDate: string
  createdAt: string
  updatedAt: string
}

export const INVOICE_STATUSES: InvoiceStatus[] = ['draft', 'pending', 'sent', 'paid', 'void']

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  pending: 'Pending',
  sent: 'Sent',
  paid: 'Paid',
  void: 'Void',
}

export function computeInvoiceTotals(
  lineItems: Pick<InvoiceLineItem, 'amount'>[],
  taxRate = 0,
): Pick<Invoice, 'subtotal' | 'taxAmount' | 'total'> {
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)
  const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100
  return {
    subtotal,
    taxAmount,
    total: subtotal + taxAmount,
  }
}

export function invoiceBalanceDue(invoice: Pick<Invoice, 'total' | 'amountPaid' | 'status'>): number {
  if (invoice.status === 'void' || invoice.status === 'paid') return 0
  return Math.max(0, invoice.total - invoice.amountPaid)
}

export function canEditInvoice(invoice: Pick<Invoice, 'status'>): boolean {
  return invoice.status === 'draft'
}

export function applyInvoicePayment(
  invoice: Invoice,
  paymentAmount: number,
): Pick<Invoice, 'amountPaid' | 'status'> {
  const amountPaid = Math.min(invoice.total, Math.round(((invoice.amountPaid ?? 0) + paymentAmount) * 100) / 100)
  let status = invoice.status
  if (amountPaid >= invoice.total) {
    status = 'paid'
  } else if (invoice.status === 'draft' && amountPaid > 0) {
    status = 'sent'
  }
  return { amountPaid, status }
}

export function invoicedServiceIds(invoices: Invoice[]): Set<string> {
  const ids = new Set<string>()
  for (const invoice of invoices) {
    if (invoice.status === 'void') continue
    for (const line of invoice.lineItems) {
      if (line.serviceId) ids.add(line.serviceId)
    }
  }
  return ids
}

export function nextInvoiceStatuses(status: InvoiceStatus): InvoiceStatus[] {
  switch (status) {
    case 'draft':
      return ['pending', 'sent', 'void']
    case 'pending':
      return ['sent', 'void']
    case 'sent':
      return ['paid', 'void']
    case 'paid':
    case 'void':
      return []
  }
}
