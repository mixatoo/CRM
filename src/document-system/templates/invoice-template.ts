import type { InvoiceStatus } from '@/domain/entities/invoice'
import { INVOICE_STATUS_LABELS } from '@/domain/entities/invoice'
import { PdfDocument } from '@/document-system/engine/pdf-document'
import {
  renderBillToBlock,
  renderInvoiceBottom,
  renderInvoiceClosingBand,
  renderInvoiceLineItems,
  renderTermsBlock,
  renderTripSummaryBar,
} from '@/document-system/primitives/invoice-layout'
import { renderCompactHeader, renderDocumentHeader, type DocBadgeTone } from '@/document-system/primitives/layout'
import type { DocTotalsRow } from '@/document-system/primitives/table'
import {
  formatInvoiceAmountValue,
  formatInvoiceMoney,
  type InvoiceDocumentData,
} from '@/features/trips/utils/invoice-document'

function invoiceStatusTone(status: InvoiceStatus): DocBadgeTone {
  if (status === 'paid') return 'success'
  if (status === 'void') return 'danger'
  if (status === 'draft') return 'neutral'
  return 'warning'
}

function isOverdue(dueDate: string, status?: InvoiceStatus): boolean {
  if (!status || status === 'paid' || status === 'void') return false
  const due = new Date(dueDate)
  if (Number.isNaN(due.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  return due < today
}

function statusLabel(status: InvoiceStatus, dueDate: string): string {
  if (isOverdue(dueDate, status) && status !== 'paid' && status !== 'void') return 'Overdue'
  return INVOICE_STATUS_LABELS[status]
}

function buildNotesText(document: InvoiceDocumentData): string {
  const parts: string[] = []
  if (document.notes?.trim()) parts.push(document.notes.trim())
  parts.push(document.paymentInstructions)
  return parts.join('\n\n')
}

export function renderInvoiceDocument(document: InvoiceDocumentData): PdfDocument {
  const ctx = new PdfDocument()
  ctx.disableRunningFooter = true
  const dueAmount =
    document.balanceDue != null && document.balanceDue > 0 ? document.balanceDue : document.total

  ctx.setCompactHeader((compact) => renderCompactHeader(compact, 'Invoice', document.invoiceNumber))

  renderDocumentHeader(ctx, {
    companyLogoUrl: document.company.logoUrl,
    companyName: document.company.name,
    companyTagline: document.company.tagline,
    documentTitle: 'Invoice',
    documentNumber: `No. ${document.invoiceNumber}`,
    statusLabel: document.status ? statusLabel(document.status, document.dueDate) : undefined,
    statusTone: document.status ? invoiceStatusTone(document.status) : 'neutral',
    meta: [
      { label: 'Currency', value: document.currency },
      { label: 'Payment terms', value: `Net ${document.paymentTermsDays}` },
    ],
  })

  renderBillToBlock(ctx, document)
  renderTripSummaryBar(ctx, document)
  renderInvoiceLineItems(ctx, document)

  const totalRows: DocTotalsRow[] = [
    { label: 'Subtotal', value: formatInvoiceAmountValue(document.subtotal) },
  ]

  if (document.taxRate > 0) {
    totalRows.push({
      label: `Tax (${document.taxRate}%)`,
      value: formatInvoiceAmountValue(document.taxAmount),
    })
  }

  if (document.amountPaid != null && document.amountPaid > 0) {
    totalRows.push({
      label: 'Amount paid',
      value: formatInvoiceAmountValue(document.amountPaid),
      tone: 'success',
    })
  }

  if (
    document.balanceDue != null &&
    document.balanceDue > 0 &&
    document.balanceDue !== document.total
  ) {
    totalRows.push({
      label: 'Balance due',
      value: formatInvoiceAmountValue(document.balanceDue),
    })
  }

  totalRows.push({
    label: 'Total due',
    value: formatInvoiceMoney(dueAmount, document.currency),
    tone: 'grand',
  })

  const notesText = buildNotesText(document)
  renderInvoiceBottom(
    ctx,
    { title: 'Notes & payment', body: notesText },
    totalRows,
  )

  renderTermsBlock(ctx, 'Terms & conditions', document.termsAndConditions)
  renderInvoiceClosingBand(ctx, document)

  return ctx
}

export function buildInvoicePdf(document: InvoiceDocumentData) {
  return renderInvoiceDocument(document).finish()
}

export function buildInvoicePdfBlob(document: InvoiceDocumentData): Blob {
  return buildInvoicePdf(document).output('blob')
}
