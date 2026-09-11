import { Plus } from 'lucide-react'
import type { PaymentDirection } from '@/domain/entities/trip-payment'
import { Button } from '@/design-system/components/Button'
import { SearchField } from '@/design-system/components/SearchField'
import { FormPicklist } from '@/design-system/components/FormPicklist'
import { layout } from '@/design-system/tokens/layout'
import { cn } from '@/shared/utils/cn'

interface TripPaymentsToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  direction: PaymentDirection | 'all'
  onDirectionChange: (value: PaymentDirection | 'all') => void
  onRecordPayment?: () => void
  canCreate?: boolean
}

export function TripPaymentsToolbar({
  search,
  onSearchChange,
  direction,
  onDirectionChange,
  onRecordPayment,
  canCreate = false,
}: TripPaymentsToolbarProps) {
  const hasFilters = search.trim().length > 0 || direction !== 'all'

  return (
    <div
      className={cn(
        'flex flex-nowrap items-center gap-2 overflow-x-auto px-2 py-2 sm:gap-2.5 sm:px-3',
        layout.hideScrollbar,
      )}
    >
      {canCreate && onRecordPayment ? (
        <Button type="button" size="sm" className="h-8 shrink-0 gap-1 px-2.5" onClick={onRecordPayment}>
          <Plus className="h-3.5 w-3.5" />
          Record payment
        </Button>
      ) : null}

      <SearchField
        value={search}
        onValueChange={onSearchChange}
        placeholder="Search payments…"
        className="h-8 min-w-[8rem] max-w-xs shrink"
        inputClassName="text-xs"
        collapsible={false}
      />

      <FormPicklist
        size="sm"
        fullWidth={false}
        value={direction}
        onChange={(value) => onDirectionChange(value as PaymentDirection | 'all')}
        options={[
          { value: 'all', label: 'All directions' },
          { value: 'inbound', label: 'Client receipts' },
          { value: 'outbound', label: 'Supplier payments' },
        ]}
        panelTitle="Direction"
        ariaLabel="Filter by direction"
      />

      {hasFilters ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 shrink-0 px-2 text-xs font-normal text-[var(--color-muted)]"
          onClick={() => {
            onSearchChange('')
            onDirectionChange('all')
          }}
        >
          Clear
        </Button>
      ) : null}
    </div>
  )
}
