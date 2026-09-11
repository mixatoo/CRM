import { useCallback, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Download, Trash2 } from 'lucide-react'
import { CloseButton } from '@/design-system/components/CloseButton'
import type { Trip } from '@/domain/entities'
import type { TripService } from '@/domain/entities/trip-service'
import { canEditInvoice, nextInvoiceStatuses, type Invoice, type InvoiceStatus } from '@/domain/entities/invoice'
import { canMutate } from '@/domain/policies/permissions'
import type { UserRole } from '@/domain/entities'
import { Button } from '@/design-system/components/Button'
import { InvoiceDocumentPreview } from '@/features/trips/components/invoices/InvoiceDocumentPreview'
import {
  InvoiceStatusBadge,
  invoiceStatusActionLabel,
} from '@/features/trips/components/invoices/InvoiceStatusBadge'
import { invoiceToDocumentData } from '@/features/trips/utils/invoice-document'
import { buildInvoicePdfBlobFromPreview } from '@/features/trips/utils/download-invoice-pdf'
import { PdfExportDialog } from '@/document-system/export/PdfExportDialog'
import { formatDate, formatDateTime } from '@/shared/utils/date-format'
import { cn } from '@/shared/utils/cn'

interface InvoiceDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trip: Trip
  invoice: Invoice
  services?: TripService[]
  role: UserRole
  isUpdating?: boolean
  isDeleting?: boolean
  onStatusChange: (status: InvoiceStatus) => void
  onDelete: () => void
}

export function InvoiceDetailDialog({
  open,
  onOpenChange,
  trip,
  invoice,
  services = [],
  role,
  isUpdating,
  isDeleting,
  onStatusChange,
  onDelete,
}: InvoiceDetailDialogProps) {
  const [pdfExportOpen, setPdfExportOpen] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const canUpdate = canMutate(role, 'invoice', 'update')
  const canDelete = canMutate(role, 'invoice', 'delete')
  const canExport = canMutate(role, 'invoice', 'export')
  const nextStatuses = nextInvoiceStatuses(invoice.status)
  const document = invoiceToDocumentData(invoice, trip, { services })

  const generateInvoicePdf = useCallback(
    () => buildInvoicePdfBlobFromPreview(previewRef.current, document),
    [document],
  )

  const handleExportPdf = () => {
    setPdfExportOpen(true)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[600] bg-black/45 backdrop-blur-[1px]" />
        <Dialog.Content
          className={cn(
            'fixed inset-2 z-[601] flex flex-col overflow-hidden outline-none sm:inset-3 lg:inset-4',
            'rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]/40 shadow-2xl',
          )}
        >
          <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 lg:px-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Dialog.Title className="font-mono text-sm font-semibold text-[var(--color-foreground)]">
                  {invoice.number}
                </Dialog.Title>
                <InvoiceStatusBadge status={invoice.status} />
              </div>
              <Dialog.Description className="mt-0.5 text-xs text-[var(--color-muted)]">
                Trip {trip.reference} · Updated {formatDateTime(invoice.updatedAt)}
              </Dialog.Description>
            </div>

            <div className="hidden flex-wrap items-center gap-4 text-xs text-[var(--color-muted)] xl:flex">
              <span>
                Subtotal <b className="text-[var(--color-foreground)]">{invoice.subtotal.toFixed(2)}</b>
              </span>
              <span>
                Tax <b className="text-[var(--color-foreground)]">{invoice.taxAmount.toFixed(2)}</b>
              </span>
              <span>
                Total{' '}
                <b className="text-[var(--color-success)]">
                  {invoice.total.toFixed(2)} {invoice.currency}
                </b>
              </span>
              <span>
                Balance{' '}
                <b className="text-[var(--color-warning)]">
                  {document.balanceDue?.toFixed(2)} {invoice.currency}
                </b>
              </span>
              <span>
                Due <b className="text-[var(--color-foreground)]">{formatDate(invoice.dueDate)}</b>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {canExport ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-7 gap-1 px-2"
                  disabled={isUpdating || isDeleting}
                  onClick={handleExportPdf}
                >
                  <Download className="h-3.5 w-3.5" />
                  Export PDF
                </Button>
              ) : null}
              {canUpdate
                ? nextStatuses.map((status) => (
                    <Button
                      key={status}
                      type="button"
                      variant={status === 'void' ? 'secondary' : 'primary'}
                      size="sm"
                      className="h-7 px-2 text-xs font-normal"
                      disabled={isUpdating || isDeleting}
                      onClick={() => onStatusChange(status)}
                    >
                      {invoiceStatusActionLabel(status)}
                    </Button>
                  ))
                : null}
              {canDelete && canEditInvoice(invoice) ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-7 gap-1 px-2 text-xs font-normal text-[var(--color-danger)]"
                  disabled={isUpdating || isDeleting}
                  onClick={onDelete}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              ) : null}
              <Dialog.Close asChild>
                <CloseButton />
              </Dialog.Close>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5">
            <InvoiceDocumentPreview ref={previewRef} document={document} />
          </div>

          <PdfExportDialog
            open={pdfExportOpen}
            onOpenChange={setPdfExportOpen}
            title="Invoice PDF"
            description={`Preview and download ${invoice.number}.pdf`}
            filename={`${invoice.number}.pdf`}
            generatePdf={generateInvoicePdf}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
