import { memo, type MouseEvent } from 'react'
import { renderClientLinkedPaymentsTableCell } from '@/features/clients/components/payments/client-linked-payments-table-column-render'
import type { ClientLinkedPaymentsTableColumnKey } from '@/features/clients/components/payments/client-linked-payments-table-columns'
import type { ClientLinkedPaymentRow } from '@/features/clients/utils/client-linked-payments-list'
import { useTableRowSelected } from '@/shared/hooks/table-row-selection-context'
import { crmInteractiveTableRowClass } from '@/design-system/components/table-styles'

export interface ClientLinkedPaymentsTableRowProps {
  payment: ClientLinkedPaymentRow
  orderedVisibleKeys: readonly ClientLinkedPaymentsTableColumnKey[]
  isDragSelecting: boolean
  onOpen: (payment: ClientLinkedPaymentRow, event?: MouseEvent) => void
  onSelectionPointerDown: (paymentId: string, button: number) => void
  onSelectionPointerEnter: (paymentId: string) => void
  onSelectionClick: (paymentId: string, shiftKey: boolean) => void
}

export const ClientLinkedPaymentsTableRow = memo(function ClientLinkedPaymentsTableRow({
  payment,
  orderedVisibleKeys,
  isDragSelecting,
  onOpen,
  onSelectionPointerDown,
  onSelectionPointerEnter,
  onSelectionClick,
}: ClientLinkedPaymentsTableRowProps) {
  const selected = useTableRowSelected(payment.id)
  const rowLabel = payment.linkedInvoice
    ? `Open collection for invoice ${payment.linkedInvoice.number}`
    : `Collection on ${payment.paidAt}`

  const cellContext = {
    payment,
    selected,
    isDragSelecting,
    onOpen: () => onOpen(payment),
    onSelectionPointerDown,
    onSelectionPointerEnter,
    onSelectionClick,
  }

  return (
    <tr
      data-interactive="true"
      data-selected={selected ? 'true' : undefined}
      tabIndex={0}
      aria-label={rowLabel}
      onClick={(event) => {
        const target = event.target as HTMLElement
        if (target.closest('[data-payment-row-action]')) return
        if (target.closest('[data-client-row-selection]')) return
        if (target.closest('a')) return
        onOpen(payment, event)
      }}
      onAuxClick={(event) => {
        if (event.button !== 1) return
        event.preventDefault()
        onOpen(payment, event)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen(payment)
        }
      }}
      className={crmInteractiveTableRowClass({ selected })}
    >
      {orderedVisibleKeys.map((key) => renderClientLinkedPaymentsTableCell(key, cellContext))}
    </tr>
  )
})
