import { useMemo } from 'react'
import type { Invoice } from '@/domain/entities/invoice'
import { invoiceBalanceDue } from '@/domain/entities/invoice'
import type { PaymentAllocationInput } from '@/domain/entities/payment-allocation'
import { paymentUnallocatedAmount, sumAllocationAmounts } from '@/domain/entities/payment-allocation'
import { AmountInput } from '@/design-system/components/AmountInput'
import { Button } from '@/design-system/components/Button'
import { cn } from '@/shared/utils/cn'

export type OpenInvoiceOption = Invoice & {
  tripReference?: string
}

export type AllocationRowState = PaymentAllocationInput & {
  selected: boolean
}

interface PaymentAllocationEditorProps {
  receiptAmount: number
  currency: string
  invoices: OpenInvoiceOption[]
  rows: AllocationRowState[]
  onChange: (rows: AllocationRowState[]) => void
  className?: string
}

function buildRowsFromInvoices(invoices: OpenInvoiceOption[], current: AllocationRowState[]): AllocationRowState[] {
  const currentById = new Map(current.map((row) => [row.invoiceId, row]))
  return invoices.map((invoice) => {
    const existing = currentById.get(invoice.id)
    return {
      invoiceId: invoice.id,
      amount: existing?.amount ?? 0,
      selected: existing?.selected ?? false,
    }
  })
}

export function useAllocationRows(invoices: OpenInvoiceOption[], seed: AllocationRowState[] = []) {
  return useMemo(() => buildRowsFromInvoices(invoices, seed), [invoices, seed])
}

export function selectedAllocationRows(rows: AllocationRowState[]): PaymentAllocationInput[] {
  return rows.filter((row) => row.selected && row.amount > 0).map(({ invoiceId, amount }) => ({ invoiceId, amount }))
}

export function PaymentAllocationEditor({
  receiptAmount,
  currency,
  invoices,
  rows,
  onChange,
  className,
}: PaymentAllocationEditorProps) {
  const invoiceById = useMemo(() => new Map(invoices.map((invoice) => [invoice.id, invoice])), [invoices])
  const allocated = sumAllocationAmounts(selectedAllocationRows(rows))
  const unallocated = paymentUnallocatedAmount(receiptAmount, selectedAllocationRows(rows))

  const updateRow = (invoiceId: string, patch: Partial<AllocationRowState>) => {
    onChange(rows.map((row) => (row.invoiceId === invoiceId ? { ...row, ...patch } : row)))
  }

  const autoAllocateFifo = () => {
    let remaining = receiptAmount
    const sorted = [...invoices].sort((left, right) => left.dueDate.localeCompare(right.dueDate))
    onChange(
      rows.map((row) => {
        const invoice = invoiceById.get(row.invoiceId)
        if (!invoice || remaining <= 0) {
          return { ...row, selected: false, amount: 0 }
        }
        const balance = invoiceBalanceDue(invoice)
        if (balance <= 0) return { ...row, selected: false, amount: 0 }
        const amount = Math.min(balance, remaining)
        remaining = Math.round((remaining - amount) * 100) / 100
        return { ...row, selected: amount > 0, amount }
      }),
    )
  }

  if (invoices.length === 0) {
    return (
      <p className={cn('rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] px-3 py-4 text-xs text-[var(--color-muted)]', className)}>
        No open invoices available for allocation.
      </p>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-[11px] text-[var(--color-muted)]">
          Allocated: <span className="font-medium text-[var(--color-foreground)]">{allocated.toFixed(2)} {currency}</span>
          {' · '}
          Unallocated: <span className="font-medium text-[var(--color-foreground)]">{unallocated.toFixed(2)} {currency}</span>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={autoAllocateFifo}>
          Auto-allocate (FIFO)
        </Button>
      </div>

      <div className="max-h-[min(14rem,40vh)] overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-border)]">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-[var(--color-surface-muted)]/95">
            <tr className="border-b border-[var(--color-border)]">
              <th className="px-2 py-2 text-left font-medium">Invoice</th>
              <th className="px-2 py-2 text-left font-medium">Trip</th>
              <th className="px-2 py-2 text-right font-medium">Due</th>
              <th className="px-2 py-2 text-right font-medium">Apply</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const invoice = invoiceById.get(row.invoiceId)
              if (!invoice) return null
              const balance = invoiceBalanceDue(invoice)
              return (
                <tr key={row.invoiceId} className="border-b border-[var(--color-border)]/60 last:border-0">
                  <td className="px-2 py-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={row.selected}
                        onChange={(event) => {
                          const selected = event.target.checked
                          updateRow(row.invoiceId, {
                            selected,
                            amount: selected && row.amount <= 0 ? Math.min(balance, receiptAmount) : row.amount,
                          })
                        }}
                      />
                      <span className="font-mono">{invoice.number}</span>
                    </label>
                  </td>
                  <td className="px-2 py-2 font-mono text-[var(--color-muted)]">{invoice.tripReference ?? '—'}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{balance.toFixed(2)}</td>
                  <td className="px-2 py-2">
                    <AmountInput
                      value={row.amount}
                      onChange={(amount) => updateRow(row.invoiceId, { amount, selected: amount > 0 })}
                      decimals={2}
                      disabled={!row.selected}
                      className="ml-auto max-w-[7rem]"
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
