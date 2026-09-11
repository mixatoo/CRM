import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Calendar, Check, ChevronRight, MapPin, SlidersHorizontal, Tag, User, Users } from 'lucide-react'
import { CloseButton } from '@/design-system/components/CloseButton'
import type { TripStage } from '@/domain/entities'
import { TRIP_STAGE_LABELS } from '@/domain/entities'
import { Button } from '@/design-system/components/Button'
import { DateCalendar, type DateCalendarHandle } from '@/design-system/components/DateCalendar'
import { SearchField } from '@/design-system/components/SearchField'
import {
  countActivePanelFilters,
  useTripFilterOptions,
  type TripFilterOptionItem,
} from '@/features/trips/hooks/use-trip-filter-options'
import { LabelFilterPanelSection } from '@/features/labels/components/LabelFilterPanelSection'
import { useLabelsForTarget } from '@/features/labels/hooks/use-labels'
import { EMPTY_TRIP_PANEL_FILTERS, type TripPanelFilters } from '@/repositories/interfaces'
import { cn } from '@/shared/utils/cn'
import { formatDateParts, parseDateInput, toLocalIsoDate } from '@/shared/utils/date-format'

type FilterCategory = 'owner' | 'client' | 'destination' | 'date' | 'labels'

interface TripsFilterPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: TripPanelFilters
  onFiltersChange: (filters: TripPanelFilters) => void
  matchCount?: number
  stage?: TripStage | 'all'
}

const CATEGORIES: Array<{
  id: FilterCategory
  label: string
  icon: typeof User
  description: string
}> = [
  { id: 'owner', label: 'Owner', icon: User, description: 'Who manages the trip' },
  { id: 'client', label: 'Client', icon: Users, description: 'Main contact on the trip' },
  { id: 'destination', label: 'Destination', icon: MapPin, description: 'Where the trip goes' },
  { id: 'date', label: 'Trip date', icon: Calendar, description: 'Start or booking window' },
  { id: 'labels', label: 'Labels', icon: Tag, description: 'Assigned trip labels' },
]

const DATE_PRESETS = [
  { id: '7d', label: 'Last 7 days', hint: 'Recent departures' },
  { id: '30d', label: 'Last 30 days', hint: 'Past month' },
  { id: 'month', label: 'This month', hint: 'Calendar month' },
  { id: 'quarter', label: 'This quarter', hint: 'Q1–Q4 window' },
  { id: 'next90', label: 'Next 90 days', hint: 'Upcoming trips' },
] as const

const STICKY_BAR_CLASS =
  'bg-[var(--color-surface)]/95 backdrop-blur-sm supports-[backdrop-filter]:bg-[var(--color-surface)]/90'

function labelIdsEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  const sortedA = [...a].sort()
  const sortedB = [...b].sort()
  return sortedA.every((id, index) => id === sortedB[index])
}

function filtersEqual(a: TripPanelFilters, b: TripPanelFilters) {
  return (
    a.owner === b.owner &&
    a.client === b.client &&
    a.destination === b.destination &&
    a.dateFrom === b.dateFrom &&
    a.dateTo === b.dateTo &&
    labelIdsEqual(a.labelIds, b.labelIds)
  )
}

export function TripsFilterPanel({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  matchCount,
  stage = 'all',
}: TripsFilterPanelProps) {
  const { data: options } = useTripFilterOptions()
  const { data: availableLabels = [] } = useLabelsForTarget('trip')
  const labelById = useMemo(
    () => new Map(availableLabels.map((label) => [label.id, label])),
    [availableLabels],
  )
  const [category, setCategory] = useState<FilterCategory>('owner')
  const [ownerQuery, setOwnerQuery] = useState('')
  const [clientQuery, setClientQuery] = useState('')
  const [destinationQuery, setDestinationQuery] = useState('')
  const [draftFilters, setDraftFilters] = useState<TripPanelFilters>(filters)

  const hasDraftChanges = !filtersEqual(draftFilters, filters)
  const activeCount = countActivePanelFilters(draftFilters)
  const appliedCount = countActivePanelFilters(filters)
  const totalTrips = options?.totalTrips ?? 0
  const currentCategory = CATEGORIES.find((item) => item.id === category)!

  useEffect(() => {
    if (open) {
      setDraftFilters(filters)
    }
  }, [open, filters])

  const filteredOwners = useMemo(() => {
    const list = options?.owners ?? []
    const q = ownerQuery.trim().toLowerCase()
    if (!q) return list
    return list.filter((item) => item.value.toLowerCase().includes(q))
  }, [options?.owners, ownerQuery])

  const filteredClients = useMemo(() => {
    const list = options?.clients ?? []
    const q = clientQuery.trim().toLowerCase()
    if (!q) return list
    return list.filter((item) => item.value.toLowerCase().includes(q))
  }, [options?.clients, clientQuery])

  const filteredDestinations = useMemo(() => {
    const list = options?.destinations ?? []
    const q = destinationQuery.trim().toLowerCase()
    if (!q) return list
    return list.filter((item) => item.value.toLowerCase().includes(q))
  }, [options?.destinations, destinationQuery])

  const categoryActive = (id: FilterCategory) => {
    if (id === 'owner') return draftFilters.owner !== 'all'
    if (id === 'client') return draftFilters.client !== 'all'
    if (id === 'destination') return draftFilters.destination !== 'all'
    if (id === 'labels') return (draftFilters.labelIds?.length ?? 0) > 0
    return Boolean(draftFilters.dateFrom || draftFilters.dateTo)
  }

  const activeChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; onRemove: () => void }> = []
    if (draftFilters.owner !== 'all') {
      chips.push({
        key: 'owner',
        label: draftFilters.owner,
        onRemove: () => setDraftFilters((current) => ({ ...current, owner: 'all' })),
      })
    }
    if (draftFilters.client !== 'all') {
      chips.push({
        key: 'client',
        label: draftFilters.client,
        onRemove: () => setDraftFilters((current) => ({ ...current, client: 'all' })),
      })
    }
    if (draftFilters.destination !== 'all') {
      chips.push({
        key: 'destination',
        label: draftFilters.destination,
        onRemove: () => setDraftFilters((current) => ({ ...current, destination: 'all' })),
      })
    }
    if (draftFilters.dateFrom || draftFilters.dateTo) {
      const from = draftFilters.dateFrom ? formatFilterDate(draftFilters.dateFrom) : 'Any'
      const to = draftFilters.dateTo ? formatFilterDate(draftFilters.dateTo) : 'Any'
      chips.push({
        key: 'date',
        label: `${from} → ${to}`,
        onRemove: () => setDraftFilters((current) => ({ ...current, dateFrom: '', dateTo: '' })),
      })
    }
    for (const labelId of draftFilters.labelIds ?? []) {
      const label = labelById.get(labelId)
      if (!label) continue
      chips.push({
        key: `label-${labelId}`,
        label: label.name,
        onRemove: () =>
          setDraftFilters((current) => ({
            ...current,
            labelIds: (current.labelIds ?? []).filter((id) => id !== labelId),
          })),
      })
    }
    return chips
  }, [draftFilters, labelById])

  useEffect(() => {
    if (!open) {
      setOwnerQuery('')
      setClientQuery('')
      setDestinationQuery('')
      setCategory('owner')
    }
  }, [open])

  const update = (patch: Partial<TripPanelFilters>) => {
    setDraftFilters((current) => ({ ...current, ...patch }))
  }

  const handleApply = () => {
    onFiltersChange(draftFilters)
    onOpenChange(false)
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) setDraftFilters(filters)
        onOpenChange(next)
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[600] bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content
          className="fixed inset-y-0 right-0 z-[601] flex w-full max-w-[28rem] flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl outline-none max-sm:inset-0 max-sm:max-w-none"
          aria-describedby={undefined}
        >
          {/* Frozen: panel header */}
          <header className={cn('shrink-0 border-b border-[var(--color-border)] px-4 py-3', STICKY_BAR_CLASS)}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent-muted)]/50 text-[var(--color-accent)]">
                    <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <Dialog.Title className="text-sm font-semibold text-[var(--color-foreground)]">
                    Filters
                  </Dialog.Title>
                </div>
                <p className="mt-1 text-xs font-normal text-[var(--color-muted)]">
                  {hasDraftChanges ? (
                    'Changes are preview only until you apply'
                  ) : typeof matchCount === 'number' ? (
                    <>
                      <span className="font-medium tabular-nums text-[var(--color-foreground)]">{matchCount}</span>
                      {' of '}
                      <span className="tabular-nums">{totalTrips}</span> trips
                      {stage !== 'all' && (
                        <>
                          {' · '}
                          <span className="font-medium text-[var(--color-foreground)]">
                            {TRIP_STAGE_LABELS[stage]}
                          </span>
                        </>
                      )}
                    </>
                  ) : (
                    'Refine by owner, client, destination, date, or labels'
                  )}
                </p>
              </div>
              <Dialog.Close asChild>
                <CloseButton aria-label="Close filters" />
              </Dialog.Close>
            </div>
          </header>

          {/* Frozen: category tabs */}
          <div
            className={cn('shrink-0 border-b border-[var(--color-border)] px-3 py-2', STICKY_BAR_CLASS)}
            role="tablist"
            aria-label="Filter categories"
          >
            <div className="grid grid-cols-3 gap-1 sm:grid-cols-5">
              {CATEGORIES.map((item) => {
                const Icon = item.icon
                const active = category === item.id
                const hasValue = categoryActive(item.id)
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setCategory(item.id)}
                    className={cn(
                      'relative flex flex-col items-center gap-1 rounded-[var(--radius-md)] px-2 py-2 text-center transition-colors',
                      active
                        ? 'bg-[var(--color-accent-muted)]/45 text-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/20'
                        : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-foreground)]',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span className="text-[11px] font-medium leading-tight">{item.label}</span>
                    {hasValue && (
                      <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {/* Frozen: section context */}
            <div className={cn('shrink-0 border-b border-[var(--color-border)] px-4 py-2.5', STICKY_BAR_CLASS)}>
              <h3 className="text-sm font-semibold text-[var(--color-foreground)]">{currentCategory.label}</h3>
              <p className="mt-0.5 text-xs font-normal text-[var(--color-muted)]">{currentCategory.description}</p>
            </div>

            <div
              className={cn(
                'min-h-0 flex-1',
                category === 'date' ? 'overflow-y-auto' : 'flex flex-col overflow-hidden',
              )}
            >
              <div
                className={cn(
                  category === 'date' ? 'px-4 py-3' : 'flex min-h-0 flex-1 flex-col px-4 py-3',
                )}
              >
                {category === 'owner' && (
                  <OwnerPicker
                    query={ownerQuery}
                    onQueryChange={setOwnerQuery}
                    value={draftFilters.owner}
                    options={filteredOwners}
                    totalTrips={totalTrips}
                    totalOpen={(options?.owners ?? []).reduce((sum, item) => sum + item.activeCount, 0)}
                    onChange={(owner) => update({ owner })}
                    emptyMessage="No owners match your search"
                  />
                )}

                {category === 'client' && (
                  <ClientPicker
                    query={clientQuery}
                    onQueryChange={setClientQuery}
                    value={draftFilters.client}
                    options={filteredClients}
                    totalTrips={totalTrips}
                    totalOpen={(options?.clients ?? []).reduce((sum, item) => sum + item.activeCount, 0)}
                    onChange={(client) => update({ client })}
                    emptyMessage="No clients match your search"
                  />
                )}

                {category === 'destination' && (
                  <DestinationPicker
                    query={destinationQuery}
                    onQueryChange={setDestinationQuery}
                    value={draftFilters.destination}
                    options={filteredDestinations}
                    totalTrips={totalTrips}
                    onChange={(destination) => update({ destination })}
                    emptyMessage="No destinations match your search"
                  />
                )}

                {category === 'date' && (
                  <DateFilterDetail
                    filters={draftFilters}
                    dateBounds={options?.dateBounds ?? null}
                    onUpdate={update}
                  />
                )}

                {category === 'labels' && (
                  <LabelFilterPanelSection
                    value={draftFilters.labelIds ?? []}
                    onChange={(labelIds) => update({ labelIds })}
                    targetType="trip"
                    searchAriaLabel="Filter trip labels by name"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Frozen: footer actions */}
          <footer className={cn('shrink-0 border-t border-[var(--color-border)] px-4 py-3', STICKY_BAR_CLASS)}>
            <div className="mb-2 flex min-h-[1.75rem] items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                {activeChips.length > 0 ? (
                  <div className="flex items-center gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {activeChips.map((chip) => (
                      <span
                        key={chip.key}
                        className="inline-flex max-w-[9rem] shrink-0 items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)]/60 py-0.5 pr-1 pl-2 text-[10px] font-normal text-[var(--color-foreground)]"
                      >
                        <span className="truncate">{chip.label}</span>
                        <CloseButton
                          iconSize="xs"
                          className="!p-0.5"
                          onClick={chip.onRemove}
                          aria-label={`Remove ${chip.label}`}
                        />
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs font-normal text-[var(--color-muted)]">
                    {appliedCount > 0 ? `${appliedCount} filter${appliedCount === 1 ? '' : 's'} active` : 'No filters selected'}
                  </span>
                )}
              </div>
              {!hasDraftChanges && typeof matchCount === 'number' && (
                <span className="shrink-0 text-xs font-normal tabular-nums text-[var(--color-muted)]">
                  <span className="font-medium text-[var(--color-foreground)]">{matchCount}</span> results
                </span>
              )}
            </div>
            {hasDraftChanges && (
              <p className="mb-2 text-[11px] font-normal text-[var(--color-accent)]">Unsaved changes</p>
            )}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 font-normal text-[var(--color-muted)]"
                disabled={activeCount === 0 && !hasDraftChanges}
                onClick={() => setDraftFilters(EMPTY_TRIP_PANEL_FILTERS)}
              >
                Reset
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-[1.4] gap-1.5"
                disabled={!hasDraftChanges}
                onClick={handleApply}
              >
                Apply filters
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              </Button>
            </div>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function OwnerPicker({
  query,
  onQueryChange,
  value,
  options,
  totalTrips,
  totalOpen,
  onChange,
  emptyMessage,
}: {
  query: string
  onQueryChange: (value: string) => void
  value: string
  options: TripFilterOptionItem[]
  totalTrips: number
  totalOpen: number
  onChange: (value: string) => void
  emptyMessage: string
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 pb-2">
        <SearchField
          value={query}
          onValueChange={onQueryChange}
          placeholder="Owner name"
          aria-label="Filter owners by name"
          density="compact"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div
          className={cn(
            'grid shrink-0 grid-cols-[minmax(0,1fr)_2.5rem_2.75rem] gap-2 border-b border-[var(--color-border)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-subtle)]',
            STICKY_BAR_CLASS,
          )}
        >
          <span>Owner</span>
          <span className="text-right">Open</span>
          <span className="text-right">Trips</span>
        </div>

        <OwnerFacetRow
          name="All owners"
          openCount={totalOpen}
          tripCount={totalTrips}
          selected={value === 'all'}
          onSelect={() => onChange('all')}
          variant="all"
        />

        <div className="min-h-0 flex-1 overflow-y-auto">
          {options.length === 0 ? (
            <p className="px-2.5 py-2 text-[11px] font-normal text-[var(--color-muted)]">{emptyMessage}</p>
          ) : (
            options.map((item) => (
              <OwnerFacetRow
                key={item.value}
                name={item.value}
                openCount={item.activeCount}
                tripCount={item.count}
                selected={value === item.value}
                onSelect={() => onChange(item.value)}
                avatar={initials(item.value)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function OwnerFacetRow({
  name,
  openCount,
  tripCount,
  selected,
  onSelect,
  avatar,
  variant = 'item',
}: {
  name: string
  openCount: number
  tripCount: number
  selected: boolean
  onSelect: () => void
  avatar?: string
  variant?: 'all' | 'item'
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'grid w-full grid-cols-[minmax(0,1fr)_2.5rem_2.75rem] items-center gap-2 border-t border-[var(--color-border)] px-2.5 py-1.5 text-left transition-colors first:border-t-0',
        variant === 'all' && 'border-b',
        selected
          ? 'bg-[var(--color-accent-muted)]/35'
          : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)]',
      )}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <span
          className={cn(
            'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border transition-colors',
            selected
              ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
              : 'border-[var(--color-border-strong)] bg-[var(--color-surface)]',
          )}
          aria-hidden
        >
          {selected && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
        </span>
        {avatar ? (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[9px] font-semibold text-[var(--color-foreground)]">
            {avatar}
          </span>
        ) : null}
        <span
          className={cn(
            'truncate text-xs',
            selected || variant === 'all'
              ? 'font-medium text-[var(--color-foreground)]'
              : 'font-normal text-[var(--color-foreground)]',
          )}
        >
          {name}
        </span>
      </span>

      <span
        className={cn(
          'text-right text-xs tabular-nums',
          selected ? 'font-semibold text-[var(--color-accent)]' : 'font-medium text-[var(--color-muted)]',
        )}
      >
        {openCount}
      </span>

      <span
        className={cn(
          'text-right text-xs tabular-nums',
          selected ? 'font-semibold text-[var(--color-accent)]' : 'font-medium text-[var(--color-muted)]',
        )}
      >
        {tripCount}
      </span>
    </button>
  )
}

function ClientPicker({
  query,
  onQueryChange,
  value,
  options,
  totalTrips,
  totalOpen,
  onChange,
  emptyMessage,
}: {
  query: string
  onQueryChange: (value: string) => void
  value: string
  options: TripFilterOptionItem[]
  totalTrips: number
  totalOpen: number
  onChange: (value: string) => void
  emptyMessage: string
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 pb-2">
        <SearchField
          value={query}
          onValueChange={onQueryChange}
          placeholder="Client name"
          aria-label="Filter clients by name"
          density="compact"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div
          className={cn(
            'grid shrink-0 grid-cols-[minmax(0,1fr)_2.5rem_2.75rem] gap-2 border-b border-[var(--color-border)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-subtle)]',
            STICKY_BAR_CLASS,
          )}
        >
          <span>Client</span>
          <span className="text-right">Open</span>
          <span className="text-right">Trips</span>
        </div>

        <OwnerFacetRow
          name="All clients"
          openCount={totalOpen}
          tripCount={totalTrips}
          selected={value === 'all'}
          onSelect={() => onChange('all')}
          variant="all"
        />

        <div className="min-h-0 flex-1 overflow-y-auto">
          {options.length === 0 ? (
            <p className="px-2.5 py-2 text-[11px] font-normal text-[var(--color-muted)]">{emptyMessage}</p>
          ) : (
            options.map((item) => (
              <OwnerFacetRow
                key={item.value}
                name={item.value}
                openCount={item.activeCount}
                tripCount={item.count}
                selected={value === item.value}
                onSelect={() => onChange(item.value)}
                avatar={initials(item.value)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function DestinationPicker({
  query,
  onQueryChange,
  value,
  options,
  totalTrips,
  onChange,
  emptyMessage,
}: {
  query: string
  onQueryChange: (value: string) => void
  value: string
  options: TripFilterOptionItem[]
  totalTrips: number
  onChange: (value: string) => void
  emptyMessage: string
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 pb-2">
        <SearchField
          value={query}
          onValueChange={onQueryChange}
          placeholder="Destination"
          aria-label="Filter destinations by name"
          density="compact"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div
          className={cn(
            'grid shrink-0 grid-cols-[minmax(0,1fr)_2.75rem] gap-2 border-b border-[var(--color-border)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-subtle)]',
            STICKY_BAR_CLASS,
          )}
        >
          <span>Destination</span>
          <span className="text-right">Trips</span>
        </div>

        <DestinationFacetRow
          name="All destinations"
          count={totalTrips}
          selected={value === 'all'}
          onSelect={() => onChange('all')}
          variant="all"
        />

        <div className="min-h-0 flex-1 overflow-y-auto">
          {options.length === 0 ? (
            <p className="px-2.5 py-2 text-[11px] font-normal text-[var(--color-muted)]">{emptyMessage}</p>
          ) : (
            options.map((item) => (
              <DestinationFacetRow
                key={item.value}
                name={item.value}
                count={item.count}
                selected={value === item.value}
                onSelect={() => onChange(item.value)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function DestinationFacetRow({
  name,
  count,
  selected,
  onSelect,
  variant = 'item',
}: {
  name: string
  count: number
  selected: boolean
  onSelect: () => void
  variant?: 'all' | 'item'
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'grid w-full grid-cols-[minmax(0,1fr)_2.75rem] items-center gap-2 border-t border-[var(--color-border)] px-2.5 py-1.5 text-left transition-colors first:border-t-0',
        variant === 'all' && 'border-b',
        selected
          ? 'bg-[var(--color-accent-muted)]/35'
          : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)]',
      )}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <span
          className={cn(
            'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border transition-colors',
            selected
              ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
              : 'border-[var(--color-border-strong)] bg-[var(--color-surface)]',
          )}
          aria-hidden
        >
          {selected && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
        </span>
        <span
          className={cn(
            'truncate text-xs',
            selected || variant === 'all'
              ? 'font-medium text-[var(--color-foreground)]'
              : 'font-normal text-[var(--color-foreground)]',
          )}
        >
          {name}
        </span>
      </span>

      <span
        className={cn(
          'text-right text-xs tabular-nums',
          selected ? 'font-semibold text-[var(--color-accent)]' : 'font-medium text-[var(--color-muted)]',
        )}
      >
        {count}
      </span>
    </button>
  )
}

function DateFilterDetail({
  filters,
  dateBounds,
  onUpdate,
}: {
  filters: TripPanelFilters
  dateBounds: { min: string; max: string } | null
  onUpdate: (patch: Partial<TripPanelFilters>) => void
}) {
  const activePreset = detectDatePreset(filters.dateFrom, filters.dateTo)
  const [openField, setOpenField] = useState<'from' | 'to' | null>(null)

  const toggleField = (field: 'from' | 'to') => {
    setOpenField((current) => (current === field ? null : field))
  }

  return (
    <div className="space-y-3">
      <DateFilterCard title="Quick ranges">
        <div className="divide-y divide-[var(--color-border)]">
          {DATE_PRESETS.map((preset) => {
            const range = getDatePresetRange(preset.id)
            const selected = activePreset === preset.id
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  onUpdate({ dateFrom: range.from, dateTo: range.to })
                  setOpenField(null)
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-3 px-2.5 py-2 text-left transition-colors',
                  selected
                    ? 'bg-[var(--color-accent-muted)]/35'
                    : 'hover:bg-[var(--color-surface-elevated)]',
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className={cn(
                      'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border',
                      selected
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)]'
                        : 'border-[var(--color-border-strong)] bg-[var(--color-surface)]',
                    )}
                    aria-hidden
                  >
                    {selected && <span className="h-1 w-1 rounded-full bg-white" />}
                  </span>
                  <span className="truncate text-xs font-medium text-[var(--color-foreground)]">{preset.label}</span>
                </span>
                <span className="shrink-0 text-[10px] tabular-nums text-[var(--color-muted)]">
                  {formatFilterDate(range.from)} – {formatFilterDate(range.to)}
                </span>
              </button>
            )
          })}
        </div>
      </DateFilterCard>

      <DateFilterCard title="Custom range">
        <CustomDateRangePicker
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          dateBounds={dateBounds}
          openField={openField}
          onToggleField={toggleField}
          onClear={() => {
            onUpdate({ dateFrom: '', dateTo: '' })
            setOpenField(null)
          }}
          onSelectDate={(field, iso) => {
            onUpdate(field === 'from' ? { dateFrom: iso } : { dateTo: iso })
            setOpenField(null)
          }}
          onClearField={(field) => {
            onUpdate(field === 'from' ? { dateFrom: '' } : { dateTo: '' })
            setOpenField(null)
          }}
        />
      </DateFilterCard>

      {dateBounds && (
        <p className="px-1 text-center text-[10px] font-normal text-[var(--color-muted)]">
          Trips in data: {formatFilterDate(dateBounds.min)} — {formatFilterDate(dateBounds.max)}
        </p>
      )}
    </div>
  )
}

function DateFilterCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/30 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-subtle)]">
        {title}
      </div>
      {children}
    </section>
  )
}

function CustomDateRangePicker({
  dateFrom,
  dateTo,
  dateBounds,
  openField,
  onToggleField,
  onClear,
  onSelectDate,
  onClearField,
}: {
  dateFrom: string
  dateTo: string
  dateBounds: { min: string; max: string } | null
  openField: 'from' | 'to' | null
  onToggleField: (field: 'from' | 'to') => void
  onClear: () => void
  onSelectDate: (field: 'from' | 'to', iso: string) => void
  onClearField: (field: 'from' | 'to') => void
}) {
  const calendarRef = useRef<DateCalendarHandle>(null)
  const spanDays = dateFrom && dateTo ? daysBetween(dateFrom, dateTo) : null
  const hasAny = Boolean(dateFrom || dateTo)
  const isComplete = Boolean(dateFrom && dateTo && spanDays !== null)

  useEffect(() => {
    if (!openField) return
    const frame = requestAnimationFrame(() => calendarRef.current?.focusGrid())
    return () => cancelAnimationFrame(frame)
  }, [openField])

  return (
    <div className="p-2.5">
      <div className="grid grid-cols-2 gap-2">
        <DateSlotButton
          label="From"
          value={dateFrom}
          isActive={openField === 'from'}
          onClick={() => onToggleField('from')}
        />
        <DateSlotButton
          label="To"
          value={dateTo}
          isActive={openField === 'to'}
          onClick={() => onToggleField('to')}
        />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 px-0.5">
        <p className="text-[11px] font-normal text-[var(--color-muted)]">
          {isComplete && spanDays !== null
            ? `${spanDays} day${spanDays === 1 ? '' : 's'} selected`
            : dateFrom && dateTo
              ? 'End date must be after start date'
              : hasAny
                ? 'Select the other date'
                : 'Pick a start and end date'}
        </p>
        {hasAny && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 text-[10px] font-normal text-[var(--color-accent)] hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {openField && (
        <div className="mt-2.5 border-t border-[var(--color-border)] pt-2.5">
          <DateCalendar
            ref={calendarRef}
            value={openField === 'from' ? dateFrom : dateTo}
            min={openField === 'from' ? dateBounds?.min : dateFrom || dateBounds?.min}
            max={openField === 'from' ? dateTo || dateBounds?.max : dateBounds?.max}
            yearMonthPickers
            autoFocusGrid
            onChange={(iso) => onSelectDate(openField, iso)}
            onClear={() => onClearField(openField)}
          />
        </div>
      )}
    </div>
  )
}

function DateSlotButton({
  label,
  value,
  isActive,
  onClick,
}: {
  label: string
  value: string
  isActive: boolean
  onClick: () => void
}) {
  const display = value ? formatFilterDate(value) : null

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isActive}
      className={cn(
        'rounded-[var(--radius-sm)] border px-2.5 py-2 text-left transition-colors',
        isActive
          ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)]/30 ring-1 ring-[var(--color-accent)]/20'
          : display
            ? 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-strong)]'
            : 'border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-muted)]/25 hover:bg-[var(--color-surface-elevated)]',
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-subtle)]">{label}</span>
      <p
        className={cn(
          'mt-0.5 truncate text-xs',
          display ? 'font-medium text-[var(--color-foreground)]' : 'font-normal text-[var(--color-muted)]',
        )}
      >
        {display ?? 'Add date'}
      </p>
    </button>
  )
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function formatFilterDate(value: string) {
  const date = parseDateInput(value)
  if (!date) return value
  const parts = formatDateParts(value)
  if (!parts.valid) return value
  return `${parts.day} ${parts.month} ${parts.year}`
}

function getDatePresetRange(id: (typeof DATE_PRESETS)[number]['id']) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  switch (id) {
    case '7d': {
      const start = new Date(today)
      start.setDate(start.getDate() - 7)
      return { from: toLocalIsoDate(start), to: toLocalIsoDate(today) }
    }
    case '30d': {
      const start = new Date(today)
      start.setDate(start.getDate() - 30)
      return { from: toLocalIsoDate(start), to: toLocalIsoDate(today) }
    }
    case 'month': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      return { from: toLocalIsoDate(start), to: toLocalIsoDate(monthEnd) }
    }
    case 'quarter': {
      const quarter = Math.floor(today.getMonth() / 3)
      const start = new Date(today.getFullYear(), quarter * 3, 1)
      const quarterEnd = new Date(today.getFullYear(), quarter * 3 + 3, 0)
      return { from: toLocalIsoDate(start), to: toLocalIsoDate(quarterEnd) }
    }
    case 'next90': {
      const future = new Date(today)
      future.setDate(future.getDate() + 90)
      return { from: toLocalIsoDate(today), to: toLocalIsoDate(future) }
    }
  }
}

function detectDatePreset(from: string, to: string) {
  if (!from || !to) return null
  for (const preset of DATE_PRESETS) {
    const range = getDatePresetRange(preset.id)
    if (range.from === from && range.to === to) return preset.id
  }
  return null
}

function daysBetween(from: string, to: string) {
  const start = new Date(from)
  const end = new Date(to)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null
  const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return diff >= 0 ? diff + 1 : null
}
