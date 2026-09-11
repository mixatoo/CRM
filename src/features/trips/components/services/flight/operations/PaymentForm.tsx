import { useEffect, useMemo } from 'react'
import type { FlightTicket, PaymentTransactionData } from '@/domain/flight/types'
import { validatePaymentData } from '@/domain/flight/transitions'
import { Input } from '@/design-system/components/Input'
import { NotesInput } from '@/design-system/components/NotesField'
import { FormField, MoneyInput, useOperationForm } from '@/features/trips/components/services/flight/operations/OperationFormFields'

interface PaymentFormProps {
  ticket: FlightTicket
  type: 'client' | 'supplier'
  seed?: PaymentTransactionData
  onSubmit: (data: PaymentTransactionData) => void
  onValidityChange?: (valid: boolean) => void
}

export function PaymentForm({ ticket, type, seed, onSubmit, onValidityChange }: PaymentFormProps) {
  const defaultAmount = type === 'client' ? ticket.financials.amountOutstanding : ticket.financials.supplierOutstanding
  const { values, set } = useOperationForm<PaymentTransactionData>(
    seed ?? {
      amount: defaultAmount,
      currency: ticket.pricing.currency,
      exchangeRate: ticket.pricing.exchangeRate,
      referenceNumber: '',
      notes: '',
    },
    seed ? `seed-${ticket.id}` : ticket.id,
  )

  const canSubmit = useMemo(() => validatePaymentData(ticket, type, values).ok, [ticket, type, values])

  useEffect(() => {
    onValidityChange?.(canSubmit)
  }, [canSubmit, onValidityChange])

  const outstanding = type === 'client' ? ticket.financials.amountOutstanding : ticket.financials.supplierOutstanding

  return (
    <form
      id="flight-op-form"
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (!canSubmit) return
        onSubmit(values)
      }}
    >
      <MoneyInput label="Amount" value={values.amount} onChange={(v) => set('amount', v)} currency={values.currency} />
      <p className="text-xs text-[var(--color-muted)]">
        Outstanding balance: {ticket.pricing.currency} {outstanding.toFixed(2)}
      </p>
      <FormField label="Reference number">
        <Input size="sm" value={values.referenceNumber ?? ''} onChange={(e) => set('referenceNumber', e.target.value)} />
      </FormField>
      <FormField label="Notes">
        <NotesInput size="sm" value={values.notes ?? ''} onChange={(e) => set('notes', e.target.value)} />
      </FormField>
    </form>
  )
}
