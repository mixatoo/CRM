import { useEffect, useMemo, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { FileText } from 'lucide-react'
import { CloseButton } from '@/design-system/components/CloseButton'
import type { Trip } from '@/domain/entities'
import type { TripService } from '@/domain/entities/trip-service'
import { Button } from '@/design-system/components/Button'
import { AmountInput } from '@/design-system/components/AmountInput'
import { Input } from '@/design-system/components/Input'
import { NotesTextarea } from '@/design-system/components/NotesField'
import { CrmFieldGrid, CrmInputCell, CrmMetricCell, CrmPanel } from '@/design-system/layout/CrmPanel'
import { EmbeddedFormDatePicker } from '@/design-system/components/DatePickerField'
import {
  compositeFieldClassName,
  formFieldPrefixClassName,
  formInputClassName,
} from '@/features/trips/components/services/flight/operations/operation-worksheet-ui'
import { InvoiceDocumentPreview } from '@/features/trips/components/invoices/InvoiceDocumentPreview'
import { InvoiceLineItemsPicker } from '@/features/trips/components/invoices/InvoiceLineItemsPicker'
import {
  billableTripServices,
  defaultInvoiceDueDate,
  defaultSelectedServiceIds,
  type CreateInvoiceInput,
} from '@/features/trips/utils/create-invoice'
import {
  buildInvoiceDocumentPreview,
  draftInvoiceNumber,
  previewLineItemsFromServices,
  todayIsoDate,
} from '@/features/trips/utils/invoice-document'
import { useClient } from '@/features/clients/hooks/use-clients'
import { usePaymentTerm } from '@/features/payment-terms/hooks/use-payment-terms'
import { formatDate } from '@/shared/utils/date-format'
import { cn } from '@/shared/utils/cn'

interface CreateInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trip: Trip
  services: TripService[]
  nextSequence: number
  isPending?: boolean
  onCreate: (input: CreateInvoiceInput) => void
}

export function CreateInvoiceDialog({
  open,
  onOpenChange,
  trip,
  services,
  nextSequence,
  isPending,
  onCreate,
}: CreateInvoiceDialogProps) {
  const billable = useMemo(() => billableTripServices(services), [services])
  const { data: client } = useClient(trip.clientId)
  const { data: paymentTerm } = usePaymentTerm(client?.paymentTermId)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [issuedAt, setIssuedAt] = useState(todayIsoDate())
  const [dueDate, setDueDate] = useState(defaultInvoiceDueDate(trip))
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [taxRate, setTaxRate] = useState(0)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!open) return
    const issueDate = todayIsoDate()
    setSelectedIds(defaultSelectedServiceIds(services))
    setIssuedAt(issueDate)
    setDueDate(defaultInvoiceDueDate(trip, issueDate, paymentTerm ?? null))
    setClientName(trip.mainContactName ?? '')
    setClientEmail(trip.mainContactEmail ?? '')
    setTaxRate(0)
    setNotes('')
  }, [open, services, trip, paymentTerm])

  useEffect(() => {
    if (!open || !paymentTerm) return
    setDueDate(defaultInvoiceDueDate(trip, issuedAt, paymentTerm))
  }, [issuedAt, open, paymentTerm, trip])

  const previewDocument = useMemo(
    () =>
      buildInvoiceDocumentPreview(trip, {
        invoiceNumber: draftInvoiceNumber(trip, nextSequence),
        status: 'draft',
        clientName: clientName.trim() || trip.mainContactName || trip.name,
        clientEmail: clientEmail.trim() || trip.mainContactEmail,
        issuedAt,
        dueDate,
        lineItems: previewLineItemsFromServices(billable, selectedIds),
        taxRate,
        notes,
        services: billable,
      }),
    [
      billable,
      clientEmail,
      clientName,
      dueDate,
      issuedAt,
      nextSequence,
      notes,
      selectedIds,
      taxRate,
      trip,
    ],
  )

  const canSubmit = selectedIds.length > 0 && issuedAt.length > 0 && dueDate.length > 0 && !isPending

  const handleSubmit = () => {
    if (!canSubmit) return
    onCreate({
      serviceIds: selectedIds,
      issuedAt,
      dueDate,
      clientName,
      clientEmail,
      taxRate,
      notes,
    })
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
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 lg:px-5">
            <div className="min-w-0">
              <Dialog.Title className="text-sm font-semibold text-[var(--color-foreground)]">
                Create invoice
              </Dialog.Title>
              <Dialog.Description className="mt-0.5 text-xs text-[var(--color-muted)]">
                Trip {trip.reference} · {trip.name}
              </Dialog.Description>
            </div>
            <div className="hidden items-center gap-4 text-xs text-[var(--color-muted)] md:flex">
              <span>
                Lines <b className="text-[var(--color-foreground)]">{selectedIds.length}</b>
              </span>
              <span>
                Total{' '}
                <b className="text-[var(--color-success)]">
                  {previewDocument.total.toFixed(2)} {trip.currency}
                </b>
              </span>
              <span>
                Due <b className="text-[var(--color-foreground)]">{formatDate(dueDate)}</b>
              </span>
            </div>
            <Dialog.Close asChild>
              <CloseButton className="shrink-0" />
            </Dialog.Close>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)] p-3 sm:p-4 lg:p-5">
              <div className="mx-auto grid w-full max-w-[1280px] gap-3 lg:grid-cols-2 xl:grid-cols-3">
                <CrmPanel title="Bill to">
                  <CrmFieldGrid columns={2}>
                    <CrmInputCell label="Client name">
                      <div className={compositeFieldClassName}>
                        <span className={formFieldPrefixClassName}>Name</span>
                        <Input
                          value={clientName}
                          onChange={(event) => setClientName(event.target.value)}
                          className={formInputClassName}
                        />
                      </div>
                    </CrmInputCell>
                    <CrmInputCell label="Email">
                      <div className={compositeFieldClassName}>
                        <span className={formFieldPrefixClassName}>Email</span>
                        <Input
                          value={clientEmail}
                          onChange={(event) => setClientEmail(event.target.value)}
                          className={formInputClassName}
                        />
                      </div>
                    </CrmInputCell>
                  </CrmFieldGrid>
                </CrmPanel>

                <CrmPanel title="Schedule & tax">
                  <CrmFieldGrid columns={3}>
                    <CrmInputCell label="Issue date">
                      <div className={compositeFieldClassName}>
                        <span className={formFieldPrefixClassName}>Issued</span>
                        <EmbeddedFormDatePicker
                          value={issuedAt}
                          onChange={setIssuedAt}
                          aria-label="Issue date"
                          inputClassName={cn(formInputClassName, 'pr-7 pl-2 tabular-nums')}
                        />
                      </div>
                    </CrmInputCell>
                    <CrmInputCell label="Due date">
                      <div className={compositeFieldClassName}>
                        <span className={formFieldPrefixClassName}>Due</span>
                        <EmbeddedFormDatePicker
                          value={dueDate}
                          onChange={setDueDate}
                          aria-label="Due date"
                          inputClassName={cn(formInputClassName, 'pr-7 pl-2 tabular-nums')}
                        />
                      </div>
                    </CrmInputCell>
                    <CrmInputCell label="Tax rate %" hint="Applied to subtotal">
                      <div className={compositeFieldClassName}>
                        <span className={formFieldPrefixClassName}>Tax</span>
                        <AmountInput
                          value={taxRate}
                          onChange={(value) => setTaxRate(Math.min(100, value))}
                          decimals={1}
                          className={cn(formInputClassName, 'text-left')}
                        />
                      </div>
                    </CrmInputCell>
                  </CrmFieldGrid>
                </CrmPanel>

                <CrmPanel title="Summary" className="xl:col-span-1">
                  <CrmFieldGrid columns={2}>
                    <CrmMetricCell label="Lines">{selectedIds.length}</CrmMetricCell>
                    <CrmMetricCell label="Subtotal" tone="accent">
                      {previewDocument.subtotal.toFixed(2)} {trip.currency}
                    </CrmMetricCell>
                    <CrmMetricCell label="Tax">
                      {previewDocument.taxAmount.toFixed(2)} {trip.currency}
                    </CrmMetricCell>
                    <CrmMetricCell label="Total" tone="success">
                      {previewDocument.total.toFixed(2)} {trip.currency}
                    </CrmMetricCell>
                  </CrmFieldGrid>
                </CrmPanel>
              </div>

              <div className="mx-auto mt-3 grid w-full max-w-[1280px] gap-3 lg:grid-cols-2">
                <CrmPanel title="Service lines">
                  <InvoiceLineItemsPicker services={billable} selectedIds={selectedIds} onChange={setSelectedIds} />
                </CrmPanel>

                <CrmPanel title="Internal notes">
                  <div className="p-3">
                    <NotesTextarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      rows={4}
                      placeholder="Payment terms, bank details, or client-facing notes…"
                      className="min-h-[5rem] w-full resize-y rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
                    />
                  </div>
                </CrmPanel>
              </div>
            </div>

            <div className="p-3 sm:p-4 lg:p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  Live preview
                </h3>
                <span className="text-[11px] text-[var(--color-muted)]">
                  Draft {draftInvoiceNumber(trip, nextSequence)}
                </span>
              </div>
              <InvoiceDocumentPreview document={previewDocument} />
            </div>
          </div>

          <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 lg:px-5">
            <p className="hidden text-xs text-[var(--color-muted)] sm:block">
              {selectedIds.length} service{selectedIds.length === 1 ? '' : 's'} selected · Payment due by{' '}
              {formatDate(dueDate)}
            </p>
            <div className="ml-auto flex items-center gap-2">
              <Dialog.Close asChild>
                <Button type="button" variant="secondary" size="sm">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="button" size="sm" disabled={!canSubmit} onClick={handleSubmit}>
                <FileText className="h-3.5 w-3.5" />
                {isPending ? 'Creating…' : 'Create draft'}
              </Button>
            </div>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
