import { Plus } from 'lucide-react'
import type { InvoiceStatus } from '@/domain/entities/invoice'
import { INVOICE_STATUSES, INVOICE_STATUS_LABELS } from '@/domain/entities/invoice'
import { Button } from '@/design-system/components/Button'
import { SearchField } from '@/design-system/components/SearchField'
import { FormPicklist } from '@/design-system/components/FormPicklist'
import { layout } from '@/design-system/tokens/layout'
import { cn } from '@/shared/utils/cn'

interface TripInvoicesToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  status: InvoiceStatus | 'all'
  onStatusChange: (value: InvoiceStatus | 'all') => void
  onCreateInvoice?: () => void
  canCreate?: boolean
}

export function TripInvoicesToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  onCreateInvoice,
  canCreate = false,
}: TripInvoicesToolbarProps) {
  const hasFilters = search.trim().length > 0 || status !== 'all'

  return (
    <div
      className={cn(
        'flex flex-nowrap items-center gap-2 overflow-x-auto px-2 py-2 sm:gap-2.5 sm:px-3',
        layout.hideScrollbar,
      )}
    >
      {canCreate && onCreateInvoice ? (
        <Button type="button" size="sm" className="h-8 shrink-0 gap-1 px-2.5" onClick={onCreateInvoice}>
          <Plus className="h-3.5 w-3.5" />
          Create invoice
        </Button>
      ) : null}

      <SearchField
        value={search}
        onValueChange={onSearchChange}
        placeholder="Search invoices…"
        className="h-8 min-w-[8rem] max-w-xs shrink"
        inputClassName="text-xs"
        collapsible={false}
      />

      <FormPicklist
        size="sm"
        fullWidth={false}
        value={status}
        onChange={(value) => onStatusChange(value as InvoiceStatus | 'all')}
        options={[
          { value: 'all', label: 'All statuses' },
          ...INVOICE_STATUSES.map((option) => ({
            value: option,
            label: INVOICE_STATUS_LABELS[option],
          })),
        ]}
        panelTitle="Status"
        ariaLabel="Filter by status"
      />

      {hasFilters ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 shrink-0 px-2 text-xs font-normal text-[var(--color-muted)]"
          onClick={() => {
            onSearchChange('')
            onStatusChange('all')
          }}
        >
          Clear
        </Button>
      ) : null}
    </div>
  )
}
