import { useEffect, useMemo, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { CloseButton } from '@/design-system/components/CloseButton'
import type { Trip } from '@/domain/entities'
import type { Invoice } from '@/domain/entities/invoice'
import { invoiceBalanceDue } from '@/domain/entities/invoice'
import type { PaymentDirection, PaymentMethod } from '@/domain/entities/trip-payment'
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '@/domain/entities/trip-payment'
import { Button } from '@/design-system/components/Button'
import { AmountInput } from '@/design-system/components/AmountInput'
import { Input } from '@/design-system/components/Input'
import { FormPicklist } from '@/design-system/components/FormPicklist'
import { NotesTextarea } from '@/design-system/components/NotesField'
import { CrmFieldGrid, CrmInputCell, CrmPanel } from '@/design-system/layout/CrmPanel'
import { FormDatePicker } from '@/design-system/components/DatePickerField'
import {
  PaymentAllocationEditor,
  selectedAllocationRows,
  type AllocationRowState,
} from '@/features/payments/components/PaymentAllocationEditor'
import {
  compositeFieldClassName,
  formFieldPrefixClassName,
  formInputClassName,
} from '@/features/trips/components/services/flight/operations/operation-worksheet-ui'
import type { RecordPaymentInput } from '@/features/trips/hooks/use-payment-mutations'
import { todayIsoDate } from '@/features/trips/utils/invoice-document'
import { cn } from '@/shared/utils/cn'
import { sumAllocationAmounts } from '@/domain/entities/payment-allocation'

interface RecordPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trip: Trip
  invoices: Invoice[]
  isPending?: boolean
  onSubmit: (input: RecordPaymentInput) => void
}

function buildInitialRows(invoices: Invoice[]): AllocationRowState[] {
  return invoices.map((invoice) => ({ invoiceId: invoice.id, amount: 0, selected: false }))
}

export function RecordPaymentDialog({
  open,
  onOpenChange,
  trip,
  invoices,
  isPending,
  onSubmit,
}: RecordPaymentDialogProps) {
  const [direction, setDirection] = useState<PaymentDirection>('inbound')
  const [method, setMethod] = useState<PaymentMethod>('bank_transfer')
  const [amount, setAmount] = useState(0)
  const [paidAt, setPaidAt] = useState(todayIsoDate())
  const [reference, setReference] = useState('')
  const [counterpartyName, setCounterpartyName] = useState('')
  const [notes, setNotes] = useState('')
  const [allocationRows, setAllocationRows] = useState<AllocationRowState[]>([])

  const openInvoices = useMemo(
    () =>
      invoices.filter(
        (invoice) => invoice.status !== 'void' && invoice.status !== 'paid' && invoiceBalanceDue(invoice) > 0,
      ),
    [invoices],
  )

  useEffect(() => {
    if (!open) return
    setDirection('inbound')
    setMethod('bank_transfer')
    setAmount(0)
    setPaidAt(todayIsoDate())
    setReference('')
    setCounterpartyName(trip.mainContactName ?? '')
    setNotes('')
    setAllocationRows(buildInitialRows(openInvoices))
  }, [open, trip.mainContactName, openInvoices])

  const selectedAllocations = selectedAllocationRows(allocationRows)
  const allocatedTotal = sumAllocationAmounts(selectedAllocations)
  const allocationValid = allocatedTotal <= amount + 0.001
  const canSubmit = amount > 0 && paidAt.length > 0 && !isPending && allocationValid

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit({
      trip,
      direction,
      method,
      amount,
      paidAt,
      allocations: direction === 'inbound' && selectedAllocations.length > 0 ? selectedAllocations : undefined,
      reference,
      counterpartyName,
      notes,
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[600] bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[601] flex max-h-[min(90vh,48rem)] w-[min(40rem,calc(100vw-1rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl outline-none">
          <header className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
            <div>
              <Dialog.Title className="text-sm font-semibold">Record payment</Dialog.Title>
              <Dialog.Description className="text-xs text-[var(--color-muted)]">
                Trip {trip.reference} · {trip.currency}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <CloseButton />
            </Dialog.Close>
          </header>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
            <div className="flex gap-2">
              {(['inbound', 'outbound'] as PaymentDirection[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  className={cn(
                    'flex-1 rounded-[var(--radius-md)] border px-3 py-2 text-xs font-medium',
                    direction === option
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                      : 'border-[var(--color-border)] text-[var(--color-muted)]',
                  )}
                  onClick={() => setDirection(option)}
                >
                  {option === 'inbound' ? 'Client receipt' : 'Supplier payment'}
                </button>
              ))}
            </div>

            <CrmPanel title="Payment details">
              <CrmFieldGrid columns={2}>
                <CrmInputCell label="Amount">
                  <AmountInput value={amount} onChange={setAmount} decimals={2} className={formInputClassName} />
                </CrmInputCell>
                <CrmInputCell label="Date">
                  <FormDatePicker value={paidAt} onChange={setPaidAt} aria-label="Payment date" />
                </CrmInputCell>
                <CrmInputCell label="Method">
                  <FormPicklist
                    value={method}
                    onChange={(value) => setMethod(value as PaymentMethod)}
                    options={PAYMENT_METHODS.map((option) => ({
                      value: option,
                      label: PAYMENT_METHOD_LABELS[option],
                    }))}
                    panelTitle="Payment method"
                    ariaLabel="Payment method"
                  />
                </CrmInputCell>
                <CrmInputCell label="Reference">
                  <Input value={reference} onChange={(e) => setReference(e.target.value)} className={formInputClassName} />
                </CrmInputCell>
                <CrmInputCell label={direction === 'inbound' ? 'Payer' : 'Payee'}>
                  <div className={compositeFieldClassName}>
                    <span className={formFieldPrefixClassName}>Name</span>
                    <Input
                      value={counterpartyName}
                      onChange={(event) => setCounterpartyName(event.target.value)}
                      className={formInputClassName}
                    />
                  </div>
                </CrmInputCell>
              </CrmFieldGrid>
            </CrmPanel>

            {direction === 'inbound' ? (
              <CrmPanel title="Allocate to invoices" hint="Optional — leave empty for unallocated receipt">
                <PaymentAllocationEditor
                  receiptAmount={amount}
                  currency={trip.currency}
                  invoices={openInvoices}
                  rows={allocationRows}
                  onChange={setAllocationRows}
                />
              </CrmPanel>
            ) : null}

            <NotesTextarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={2}
              placeholder="Internal notes…"
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2"
            />
          </div>

          <footer className="flex shrink-0 justify-end gap-2 border-t border-[var(--color-border)] px-4 py-3">
            <Dialog.Close asChild>
              <Button type="button" variant="secondary" size="sm">
                Cancel
              </Button>
            </Dialog.Close>
            <Button type="button" size="sm" disabled={!canSubmit} onClick={handleSubmit}>
              {isPending ? 'Saving…' : 'Record payment'}
            </Button>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
