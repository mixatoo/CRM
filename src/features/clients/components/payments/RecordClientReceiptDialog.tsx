import { useEffect, useMemo, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { CloseButton } from '@/design-system/components/CloseButton'
import type { Client } from '@/domain/entities/client'
import { clientPrimaryLabel } from '@/domain/entities/client'
import { invoiceBalanceDue } from '@/domain/entities/invoice'
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, type PaymentMethod } from '@/domain/entities/trip-payment'
import { sumAllocationAmounts } from '@/domain/entities/payment-allocation'
import { Button } from '@/design-system/components/Button'
import { AmountInput } from '@/design-system/components/AmountInput'
import { Input } from '@/design-system/components/Input'
import { FormPicklist } from '@/design-system/components/FormPicklist'
import { NotesTextarea } from '@/design-system/components/NotesField'
import { CrmFieldGrid, CrmInputCell, CrmPanel } from '@/design-system/layout/CrmPanel'
import { FormDatePicker } from '@/design-system/components/DatePickerField'
import { useClientOpenInvoices } from '@/features/clients/hooks/use-clients'
import type { RecordClientReceiptInput } from '@/features/clients/hooks/use-client-payment-mutations'
import {
  PaymentAllocationEditor,
  selectedAllocationRows,
  type AllocationRowState,
} from '@/features/payments/components/PaymentAllocationEditor'
import { formInputClassName } from '@/features/trips/components/services/flight/operations/operation-worksheet-ui'
import { todayIsoDate } from '@/features/trips/utils/invoice-document'
import { resolveClientReportingCurrency } from '@/domain/client/client-financial'

interface RecordClientReceiptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: Client
  isPending?: boolean
  onSubmit: (input: RecordClientReceiptInput) => void
}

function buildInitialRows(invoiceIds: string[]): AllocationRowState[] {
  return invoiceIds.map((invoiceId) => ({ invoiceId, amount: 0, selected: false }))
}

export function RecordClientReceiptDialog({
  open,
  onOpenChange,
  client,
  isPending,
  onSubmit,
}: RecordClientReceiptDialogProps) {
  const currency = resolveClientReportingCurrency(client)
  const { data: openInvoices = [] } = useClientOpenInvoices(client.id)
  const [method, setMethod] = useState<PaymentMethod>('bank_transfer')
  const [amount, setAmount] = useState(0)
  const [paidAt, setPaidAt] = useState(todayIsoDate())
  const [reference, setReference] = useState('')
  const [counterpartyName, setCounterpartyName] = useState('')
  const [notes, setNotes] = useState('')
  const [allocationRows, setAllocationRows] = useState<AllocationRowState[]>([])

  const payableInvoices = useMemo(
    () => openInvoices.filter((invoice) => invoiceBalanceDue(invoice) > 0),
    [openInvoices],
  )

  useEffect(() => {
    if (!open) return
    setMethod('bank_transfer')
    setAmount(0)
    setPaidAt(todayIsoDate())
    setReference('')
    setCounterpartyName(clientPrimaryLabel(client))
    setNotes('')
    setAllocationRows(buildInitialRows(payableInvoices.map((invoice) => invoice.id)))
  }, [open, client, payableInvoices])

  const selectedAllocations = selectedAllocationRows(allocationRows)
  const allocatedTotal = sumAllocationAmounts(selectedAllocations)
  const allocationValid = allocatedTotal <= amount + 0.001
  const canSubmit = amount > 0 && paidAt.length > 0 && !isPending && allocationValid

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit({
      client,
      method,
      amount,
      currency,
      paidAt,
      allocations: selectedAllocations.length > 0 ? selectedAllocations : undefined,
      reference,
      counterpartyName,
      notes,
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[600] bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[601] flex max-h-[min(92vh,50rem)] w-[min(44rem,calc(100vw-1rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl outline-none">
          <header className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
            <div>
              <Dialog.Title className="text-sm font-semibold">Record collection</Dialog.Title>
              <Dialog.Description className="text-xs text-[var(--color-muted)]">
                {clientPrimaryLabel(client)} · {currency}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <CloseButton />
            </Dialog.Close>
          </header>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
            <CrmPanel title="Receipt details">
              <CrmFieldGrid columns={2}>
                <CrmInputCell label="Amount">
                  <AmountInput value={amount} onChange={setAmount} decimals={2} className={formInputClassName} />
                </CrmInputCell>
                <CrmInputCell label="Date">
                  <FormDatePicker value={paidAt} onChange={setPaidAt} aria-label="Receipt date" />
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
                <CrmInputCell label="Payer">
                  <Input value={counterpartyName} onChange={(e) => setCounterpartyName(e.target.value)} className={formInputClassName} />
                </CrmInputCell>
              </CrmFieldGrid>
            </CrmPanel>

            <CrmPanel title="Allocate to invoices" hint="Select one or more open invoices">
              <PaymentAllocationEditor
                receiptAmount={amount}
                currency={currency}
                invoices={payableInvoices}
                rows={allocationRows}
                onChange={setAllocationRows}
              />
            </CrmPanel>

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
              {isPending ? 'Saving…' : 'Record collection'}
            </Button>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
