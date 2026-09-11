import { useState } from 'react'
import type { PaymentDirection, PaymentStatus } from '@/domain/entities/trip-payment'
import { SearchField } from '@/design-system/components/SearchField'
import { FormPicklist } from '@/design-system/components/FormPicklist'
import { LabelFilterField } from '@/features/labels/components/LabelFilterField'
import { Button } from '@/design-system/components/Button'
import { layout } from '@/design-system/tokens/layout'
import { cn } from '@/shared/utils/cn'

interface TransactionsFiltersBarProps {
  searchInput: string
  onSearchChange: (value: string) => void
  direction: PaymentDirection | 'all'
  onDirectionChange: (value: PaymentDirection | 'all') => void
  status: PaymentStatus | 'all'
  onStatusChange: (value: PaymentStatus | 'all') => void
  labelIds: string[]
  onLabelIdsChange: (value: string[]) => void
  isFetching?: boolean
}

export function TransactionsFiltersBar({
  searchInput,
  onSearchChange,
  direction,
  onDirectionChange,
  status,
  onStatusChange,
  labelIds,
  onLabelIdsChange,
  isFetching,
}: TransactionsFiltersBarProps) {
  const hasFilters = searchInput.trim().length > 0 || direction !== 'all' || status !== 'all' || labelIds.length > 0
  const [searchOpen, setSearchOpen] = useState(() => searchInput.trim().length > 0)

  return (
    <div className="flex flex-col gap-2 border-b border-[var(--color-border)] px-2 py-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 sm:px-4 sm:py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <h1 className={cn('shrink-0', layout.pageTitle)}>Transactions</h1>
        {isFetching ? (
          <span className="inline-flex shrink-0 items-center" aria-label="Loading">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-accent)]" />
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1.5 sm:ml-auto sm:gap-2">
        <SearchField
          value={searchInput}
          onValueChange={onSearchChange}
          open={searchOpen}
          onOpenChange={setSearchOpen}
          placeholder="Reference, counterparty"
          aria-label="Search transactions"
          density="toolbar"
        />

        <FormPicklist
          size="sm"
          fullWidth={false}
          value={direction}
          onChange={(value) => onDirectionChange(value as PaymentDirection | 'all')}
          options={[
            { value: 'all', label: 'All directions' },
            { value: 'inbound', label: 'Receipts' },
            { value: 'outbound', label: 'Disbursements' },
          ]}
          panelTitle="Direction"
          ariaLabel="Filter by direction"
        />

        <FormPicklist
          size="sm"
          fullWidth={false}
          value={status}
          onChange={(value) => onStatusChange(value as PaymentStatus | 'all')}
          options={[
            { value: 'all', label: 'All statuses' },
            { value: 'recorded', label: 'Recorded' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'void', label: 'Void' },
          ]}
          panelTitle="Status"
          ariaLabel="Filter by status"
        />

        <LabelFilterField
          value={labelIds}
          onChange={onLabelIdsChange}
          targetType="payment"
          ariaLabel="Filter transactions by labels"
        />

        {hasFilters ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 font-normal text-[var(--color-muted)]"
            onClick={() => {
              onSearchChange('')
              onDirectionChange('all')
              onStatusChange('all')
              onLabelIdsChange([])
              setSearchOpen(false)
            }}
          >
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  )
}
