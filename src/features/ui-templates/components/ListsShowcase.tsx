import { useMemo, useState } from 'react'
import { MOCK_FACET_DESTINATIONS, MOCK_FACET_OWNERS } from '@/features/ui-templates/data/mock-data'
import { FacetListPicker } from '@/features/ui-templates/patterns/lists/FacetListPicker'
import { ListToolbar } from '@/features/ui-templates/patterns/lists/ListToolbar'
import { SimpleFacetListPicker } from '@/features/ui-templates/patterns/lists/SimpleFacetListPicker'
import { SortDropdownMenu } from '@/features/ui-templates/patterns/lists/SortDropdownMenu'
import { TemplateSection } from '@/features/ui-templates/components/TemplateSection'

const SORT_OPTIONS = [
  { field: 'reference', label: 'Trip ID' },
  { field: 'date', label: 'Trip Date' },
  { field: 'client', label: 'Client' },
  { field: 'cost', label: 'Cost' },
] as const

type DemoSortField = (typeof SORT_OPTIONS)[number]['field']

export function ListsShowcase() {
  const [ownerQuery, setOwnerQuery] = useState('')
  const [ownerValue, setOwnerValue] = useState('all')
  const [destinationQuery, setDestinationQuery] = useState('')
  const [destinationValue, setDestinationValue] = useState('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<DemoSortField>('reference')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const filteredOwners = useMemo(() => {
    const q = ownerQuery.trim().toLowerCase()
    if (!q) return MOCK_FACET_OWNERS
    return MOCK_FACET_OWNERS.filter((item) => item.value.toLowerCase().includes(q))
  }, [ownerQuery])

  const filteredDestinations = useMemo(() => {
    const q = destinationQuery.trim().toLowerCase()
    if (!q) return MOCK_FACET_DESTINATIONS
    return MOCK_FACET_DESTINATIONS.filter((item) => item.value.toLowerCase().includes(q))
  }, [destinationQuery])

  const totalTrips = MOCK_FACET_OWNERS.reduce((sum, item) => sum + item.count, 0)
  const totalOpen = MOCK_FACET_OWNERS.reduce((sum, item) => sum + (item.activeCount ?? 0), 0)

  return (
    <div className="space-y-8">
      <TemplateSection
        title="List toolbar"
        description="Search toggle, filter badge, sort menu, primary action."
        path="src/features/ui-templates/patterns/lists/ListToolbar.tsx"
      >
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
          <ListToolbar
            title="All records"
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="ID, client, destination"
            filterCount={2}
            onFilterClick={() => {}}
            showClear
            onClear={() => setSearch('')}
            sortSlot={
              <SortDropdownMenu
                title="Sort records"
                sortBy={sortBy}
                sortDir={sortDir}
                options={[...SORT_OPTIONS]}
                defaultSortBy="reference"
                onSort={setSortBy}
                onSortDirChange={setSortDir}
              />
            }
            onPrimaryAction={() => {}}
            primaryActionLabel="New record"
          />
        </div>
      </TemplateSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <TemplateSection
          title="Facet list (Owner / Client)"
          description="Three columns: label · Open · Trips. Used in filter panels."
          path="src/features/ui-templates/patterns/lists/FacetListPicker.tsx"
        >
          <div className="h-[22rem]">
            <FacetListPicker
              labelColumn="Owner"
              secondaryCountColumn="Open"
              allLabel="All owners"
              searchPlaceholder="Owner name"
              emptyMessage="No owners match your search"
              query={ownerQuery}
              onQueryChange={setOwnerQuery}
              value={ownerValue}
              onChange={setOwnerValue}
              options={filteredOwners}
              totalCount={totalTrips}
              totalSecondaryCount={totalOpen}
            />
          </div>
        </TemplateSection>

        <TemplateSection
          title="Simple facet list (Destination)"
          description="Two columns: label · count."
          path="src/features/ui-templates/patterns/lists/SimpleFacetListPicker.tsx"
        >
          <div className="h-[22rem]">
            <SimpleFacetListPicker
              labelColumn="Destination"
              countColumn="Trips"
              allLabel="All destinations"
              searchPlaceholder="Destination"
              emptyMessage="No destinations match your search"
              query={destinationQuery}
              onQueryChange={setDestinationQuery}
              value={destinationValue}
              onChange={setDestinationValue}
              options={filteredDestinations}
              totalCount={MOCK_FACET_DESTINATIONS.reduce((sum, item) => sum + item.count, 0)}
            />
          </div>
        </TemplateSection>
      </div>
    </div>
  )
}
