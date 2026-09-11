import { memo, type MouseEvent } from 'react'
import { renderClientLinkedInvoicesTableCell } from '@/features/clients/components/invoices/client-linked-invoices-table-column-render'
import type { ClientLinkedInvoicesTableColumnKey } from '@/features/clients/components/invoices/client-linked-invoices-table-columns'
import type { ClientLinkedInvoiceRow } from '@/features/clients/utils/client-linked-invoices-list'
import { useTableRowSelected } from '@/shared/hooks/table-row-selection-context'
import { crmInteractiveTableRowClass } from '@/design-system/components/table-styles'

export interface ClientLinkedInvoicesTableRowProps {
  invoice: ClientLinkedInvoiceRow
  orderedVisibleKeys: readonly ClientLinkedInvoicesTableColumnKey[]
  isDragSelecting: boolean
  onOpen: (invoice: ClientLinkedInvoiceRow, event?: MouseEvent) => void
  onSelectionPointerDown: (invoiceId: string, button: number) => void
  onSelectionPointerEnter: (invoiceId: string) => void
  onSelectionClick: (invoiceId: string, shiftKey: boolean) => void
}

export const ClientLinkedInvoicesTableRow = memo(function ClientLinkedInvoicesTableRow({
  invoice,
  orderedVisibleKeys,
  isDragSelecting,
  onOpen,
  onSelectionPointerDown,
  onSelectionPointerEnter,
  onSelectionClick,
}: ClientLinkedInvoicesTableRowProps) {
  const selected = useTableRowSelected(invoice.id)
  const rowLabel = `Open invoice ${invoice.number}`

  const cellContext = {
    invoice,
    selected,
    isDragSelecting,
    onOpen: () => onOpen(invoice),
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
        if (target.closest('[data-invoice-row-action]')) return
        if (target.closest('[data-client-row-selection]')) return
        if (target.closest('a')) return
        onOpen(invoice, event)
      }}
      onAuxClick={(event) => {
        if (event.button !== 1) return
        event.preventDefault()
        onOpen(invoice, event)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen(invoice)
        }
      }}
      className={crmInteractiveTableRowClass({ selected })}
    >
      {orderedVisibleKeys.map((key) => renderClientLinkedInvoicesTableCell(key, cellContext))}
    </tr>
  )
})
