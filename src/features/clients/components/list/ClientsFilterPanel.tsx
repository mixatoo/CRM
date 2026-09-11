import { useEffect, useMemo, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Building2, Check, ChevronRight, CircleDot, Globe2, MapPin, SlidersHorizontal, Tag, Tags } from 'lucide-react'
import { CloseButton } from '@/design-system/components/CloseButton'
import {
  CLIENT_STATUSES,
  CLIENT_STATUS_LABELS,
  CLIENT_TYPES,
  CLIENT_TYPE_LABELS,
  type ClientStatus,
} from '@/domain/entities/client'
import { Button } from '@/design-system/components/Button'
import { SearchField } from '@/design-system/components/SearchField'
import { ClientStatusBadge } from '@/features/clients/components/ClientStatusBadge'
import {
  countActiveClientPanelFilters,
  useClientFilterOptions,
  type ClientFilterOptionItem,
} from '@/features/clients/hooks/use-client-filter-options'
import { LabelFilterPanelSection } from '@/features/labels/components/LabelFilterPanelSection'
import { useLabelsForTarget } from '@/features/labels/hooks/use-labels'
import { EMPTY_CLIENT_PANEL_FILTERS, type ClientPanelFilters } from '@/repositories/interfaces'
import { cn } from '@/shared/utils/cn'

type FilterCategory = 'status' | 'type' | 'country' | 'city' | 'company' | 'labels'

const STICKY_BAR_CLASS =
  'bg-[var(--color-surface)]/95 backdrop-blur-sm supports-[backdrop-filter]:bg-[var(--color-surface)]/90'

const CATEGORIES: Array<{
  id: FilterCategory
  label: string
  icon: typeof Globe2
  description: string
}> = [
  { id: 'status', label: 'Status', icon: CircleDot, description: 'Active, inactive, or blocked' },
  { id: 'type', label: 'Type', icon: Tags, description: 'Individual or corporate' },
  { id: 'country', label: 'Country', icon: Globe2, description: 'Client country' },
  { id: 'city', label: 'City', icon: MapPin, description: 'Client city' },
  { id: 'company', label: 'Company', icon: Building2, description: 'Corporate account' },
  { id: 'labels', label: 'Labels', icon: Tag, description: 'Assigned account labels' },
]

function filtersEqual(a: ClientPanelFilters, b: ClientPanelFilters) {
  const aLabels = [...(a.labelIds ?? [])].sort().join(',')
  const bLabels = [...(b.labelIds ?? [])].sort().join(',')
  return (
    a.status === b.status &&
    a.type === b.type &&
    a.country === b.country &&
    a.city === b.city &&
    a.company === b.company &&
    aLabels === bLabels
  )
}

interface ClientsFilterPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: ClientPanelFilters
  onFiltersChange: (filters: ClientPanelFilters) => void
  matchCount?: number
}

function FacetPicker({
  query,
  onQueryChange,
  value,
  options,
  totalClients,
  onChange,
  emptyMessage,
  allLabel,
  valueLabel,
  searchPlaceholder,
  searchAriaLabel,
}: {
  query: string
  onQueryChange: (value: string) => void
  value: string
  options: ClientFilterOptionItem[]
  totalClients: number
  onChange: (value: string) => void
  emptyMessage: string
  allLabel: string
  valueLabel: string
  searchPlaceholder: string
  searchAriaLabel: string
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 pb-2">
        <SearchField
          value={query}
          onValueChange={onQueryChange}
          placeholder={searchPlaceholder}
          aria-label={searchAriaLabel}
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
          <span>{valueLabel}</span>
          <span className="text-right">Clients</span>
        </div>

        <FacetRow
          name={allLabel}
          count={totalClients}
          selected={value === 'all'}
          onSelect={() => onChange('all')}
          variant="all"
        />

        <div className="min-h-0 flex-1 overflow-y-auto">
          {options.length === 0 ? (
            <p className="px-2.5 py-2 text-[11px] font-normal text-[var(--color-muted)]">{emptyMessage}</p>
          ) : (
            options.map((item) => (
              <FacetRow
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

function FacetRow({
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

export function ClientsFilterPanel({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  matchCount,
}: ClientsFilterPanelProps) {
  const options = useClientFilterOptions()
  const { data: availableLabels = [] } = useLabelsForTarget('client')
  const labelById = useMemo(
    () => new Map(availableLabels.map((label) => [label.id, label])),
    [availableLabels],
  )
  const [category, setCategory] = useState<FilterCategory>('status')
  const [countryQuery, setCountryQuery] = useState('')
  const [cityQuery, setCityQuery] = useState('')
  const [companyQuery, setCompanyQuery] = useState('')
  const [draftFilters, setDraftFilters] = useState<ClientPanelFilters>(filters)

  const hasDraftChanges = !filtersEqual(draftFilters, filters)
  const activeCount = countActiveClientPanelFilters(draftFilters)
  const appliedCount = countActiveClientPanelFilters(filters)
  const currentCategory = CATEGORIES.find((item) => item.id === category)!
  const totalClients = options.totalClients

  useEffect(() => {
    if (open) setDraftFilters(filters)
  }, [open, filters])

  useEffect(() => {
    if (!open) {
      setCountryQuery('')
      setCityQuery('')
      setCompanyQuery('')
      setCategory('status')
    }
  }, [open])

  const update = (patch: Partial<ClientPanelFilters>) => {
    setDraftFilters((current) => ({ ...current, ...patch }))
  }

  const filteredCountries = useMemo(() => {
    const q = countryQuery.trim().toLowerCase()
    if (!q) return options.countries
    return options.countries.filter((item) => item.value.toLowerCase().includes(q))
  }, [options.countries, countryQuery])

  const filteredCities = useMemo(() => {
    const q = cityQuery.trim().toLowerCase()
    if (!q) return options.cities
    return options.cities.filter((item) => item.value.toLowerCase().includes(q))
  }, [options.cities, cityQuery])

  const filteredCompanies = useMemo(() => {
    const q = companyQuery.trim().toLowerCase()
    if (!q) return options.companies
    return options.companies.filter((item) => item.value.toLowerCase().includes(q))
  }, [options.companies, companyQuery])

  const categoryActive = (id: FilterCategory) => {
    if (id === 'status') return draftFilters.status !== 'all'
    if (id === 'type') return draftFilters.type !== 'all'
    if (id === 'country') return draftFilters.country !== 'all'
    if (id === 'city') return draftFilters.city !== 'all'
    if (id === 'labels') return (draftFilters.labelIds?.length ?? 0) > 0
    return draftFilters.company !== 'all'
  }

  const activeChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; onRemove: () => void }> = []
    if (draftFilters.status !== 'all') {
      chips.push({
        key: 'status',
        label: CLIENT_STATUS_LABELS[draftFilters.status],
        onRemove: () => setDraftFilters((current) => ({ ...current, status: 'all' })),
      })
    }
    if (draftFilters.type !== 'all') {
      chips.push({
        key: 'type',
        label: CLIENT_TYPE_LABELS[draftFilters.type],
        onRemove: () => setDraftFilters((current) => ({ ...current, type: 'all' })),
      })
    }
    if (draftFilters.country !== 'all') {
      chips.push({
        key: 'country',
        label: draftFilters.country,
        onRemove: () => setDraftFilters((current) => ({ ...current, country: 'all' })),
      })
    }
    if (draftFilters.city !== 'all') {
      chips.push({
        key: 'city',
        label: draftFilters.city,
        onRemove: () => setDraftFilters((current) => ({ ...current, city: 'all' })),
      })
    }
    if (draftFilters.company !== 'all') {
      chips.push({
        key: 'company',
        label: draftFilters.company,
        onRemove: () => setDraftFilters((current) => ({ ...current, company: 'all' })),
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
          <header className={cn('shrink-0 border-b border-[var(--color-border)] px-4 py-3', STICKY_BAR_CLASS)}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent-muted)]/50 text-[var(--color-accent)]">
                    <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <Dialog.Title className="text-sm font-semibold text-[var(--color-foreground)]">Filters</Dialog.Title>
                </div>
                <p className="mt-1 text-xs font-normal text-[var(--color-muted)]">
                  {hasDraftChanges ? (
                    'Changes are preview only until you apply'
                  ) : typeof matchCount === 'number' ? (
                    <>
                      <span className="font-medium tabular-nums text-[var(--color-foreground)]">{matchCount}</span>
                      {' of '}
                      <span className="tabular-nums">{totalClients}</span> clients
                      {draftFilters.status !== 'all' && (
                        <>
                          {' · '}
                          <span className="font-medium text-[var(--color-foreground)]">
                            {CLIENT_STATUS_LABELS[draftFilters.status]}
                          </span>
                        </>
                      )}
                    </>
                  ) : (
                    'Refine by status, type, country, city, company, or labels'
                  )}
                </p>
              </div>
              <Dialog.Close asChild>
                <CloseButton aria-label="Close filters" />
              </Dialog.Close>
            </div>
          </header>

          <div
            className={cn('shrink-0 border-b border-[var(--color-border)] px-3 py-2', STICKY_BAR_CLASS)}
            role="tablist"
            aria-label="Filter categories"
          >
            <div className="grid grid-cols-3 gap-1 sm:grid-cols-6">
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

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className={cn('shrink-0 border-b border-[var(--color-border)] px-4 py-2.5', STICKY_BAR_CLASS)}>
              <h3 className="text-sm font-semibold text-[var(--color-foreground)]">{currentCategory.label}</h3>
              <p className="mt-0.5 text-xs font-normal text-[var(--color-muted)]">{currentCategory.description}</p>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="flex min-h-0 flex-1 flex-col px-4 py-3">
                {category === 'status' && (
                  <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
                    <div
                      className={cn(
                        'shrink-0 border-b border-[var(--color-border)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-subtle)]',
                        STICKY_BAR_CLASS,
                      )}
                    >
                      Client status
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto">
                      <StatusRow
                        label="All statuses"
                        selected={draftFilters.status === 'all'}
                        onSelect={() => update({ status: 'all' })}
                        variant="all"
                      />
                      {CLIENT_STATUSES.map((status) => (
                        <StatusRow
                          key={status}
                          label={CLIENT_STATUS_LABELS[status]}
                          status={status}
                          selected={draftFilters.status === status}
                          onSelect={() => update({ status })}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {category === 'type' && (
                  <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
                    <div
                      className={cn(
                        'shrink-0 border-b border-[var(--color-border)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-subtle)]',
                        STICKY_BAR_CLASS,
                      )}
                    >
                      Client type
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto">
                      <TypeRow
                        label="All types"
                        selected={draftFilters.type === 'all'}
                        onSelect={() => update({ type: 'all' })}
                        variant="all"
                      />
                      {CLIENT_TYPES.map((type) => (
                        <TypeRow
                          key={type}
                          label={CLIENT_TYPE_LABELS[type]}
                          selected={draftFilters.type === type}
                          onSelect={() => update({ type })}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {category === 'country' && (
                  <FacetPicker
                    query={countryQuery}
                    onQueryChange={setCountryQuery}
                    value={draftFilters.country}
                    options={filteredCountries}
                    totalClients={totalClients}
                    onChange={(country) => update({ country })}
                    emptyMessage="No countries match your search"
                    allLabel="All countries"
                    valueLabel="Country"
                    searchPlaceholder="Country"
                    searchAriaLabel="Filter countries by name"
                  />
                )}

                {category === 'city' && (
                  <FacetPicker
                    query={cityQuery}
                    onQueryChange={setCityQuery}
                    value={draftFilters.city}
                    options={filteredCities}
                    totalClients={totalClients}
                    onChange={(city) => update({ city })}
                    emptyMessage="No cities match your search"
                    allLabel="All cities"
                    valueLabel="City"
                    searchPlaceholder="City"
                    searchAriaLabel="Filter cities by name"
                  />
                )}

                {category === 'company' && (
                  <FacetPicker
                    query={companyQuery}
                    onQueryChange={setCompanyQuery}
                    value={draftFilters.company}
                    options={filteredCompanies}
                    totalClients={totalClients}
                    onChange={(company) => update({ company })}
                    emptyMessage="No companies match your search"
                    allLabel="All companies"
                    valueLabel="Company"
                    searchPlaceholder="Company"
                    searchAriaLabel="Filter companies by name"
                  />
                )}

                {category === 'labels' && (
                  <LabelFilterPanelSection
                    value={draftFilters.labelIds ?? []}
                    onChange={(labelIds) => update({ labelIds })}
                    targetType="client"
                    searchAriaLabel="Filter client labels by name"
                  />
                )}
              </div>
            </div>
          </div>

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
                onClick={() => setDraftFilters(EMPTY_CLIENT_PANEL_FILTERS)}
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
function StatusRow({
  label,
  status,
  selected,
  onSelect,
  variant = 'item',
}: {
  label: string
  status?: ClientStatus
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
        'flex w-full items-center gap-2 border-t border-[var(--color-border)] px-2.5 py-1.5 text-left transition-colors first:border-t-0',
        variant === 'all' && 'border-b',
        selected
          ? 'bg-[var(--color-accent-muted)]/35'
          : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)]',
      )}
    >
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
      {status ? (
        <ClientStatusBadge status={status} />
      ) : (
        <span
          className={cn(
            'min-w-0 flex-1 truncate text-xs',
            selected || variant === 'all' ? 'font-medium text-[var(--color-foreground)]' : 'font-normal text-[var(--color-foreground)]',
          )}
        >
          {label}
        </span>
      )}
    </button>
  )
}

function TypeRow({
  label,
  selected,
  onSelect,
  variant = 'item',
}: {
  label: string
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
        'flex w-full items-center gap-2 border-t border-[var(--color-border)] px-2.5 py-1.5 text-left transition-colors first:border-t-0',
        variant === 'all' && 'border-b',
        selected
          ? 'bg-[var(--color-accent-muted)]/35'
          : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)]',
      )}
    >
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
          'min-w-0 flex-1 truncate text-xs',
          selected || variant === 'all' ? 'font-medium text-[var(--color-foreground)]' : 'font-normal text-[var(--color-foreground)]',
        )}
      >
        {label}
      </span>
    </button>
  )
}

