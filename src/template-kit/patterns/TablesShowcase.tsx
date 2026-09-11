import { useMemo, useState } from 'react'
import { MOCK_TABLE_ROWS } from '../data/mock-data'
import { ListToolbar } from './lists/ListToolbar'
import { SortDropdownMenu } from './lists/SortDropdownMenu'
import { TemplateListTable } from './tables/TemplateListTable'
import { TemplateSection } from '../components/TemplateSection'

const SORT_OPTIONS = [
  { field: 'reference', label: 'Trip ID' },
  { field: 'date', label: 'Trip Date' },
  { field: 'client', label: 'Client' },
  { field: 'persons', label: 'Persons' },
  { field: 'destination', label: 'Destination' },
  { field: 'cost', label: 'Cost' },
  { field: 'stage', label: 'Stage' },
  { field: 'owner', label: 'Owner' },
] as const

type DemoSortField = (typeof SORT_OPTIONS)[number]['field']

export function TablesShowcase() {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<DemoSortField>('reference')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return MOCK_TABLE_ROWS
    return MOCK_TABLE_ROWS.filter(
      (row) =>
        row.reference.includes(q) ||
        row.client.toLowerCase().includes(q) ||
        row.destination.toLowerCase().includes(q) ||
        row.owner.toLowerCase().includes(q),
    )
  }, [search])

  return (
    <TemplateSection
      title="List table"
        description="Selectable sticky table with TripStageBadge, AccountingAmount, sort, row actions, pagination."
      path="src/features/ui-templates/patterns/tables/"
    >
      <TemplateListTable
        rows={rows}
        toolbar={
          <ListToolbar
            title="Template table"
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Type to filter table…"
            filterCount={0}
            showClear={Boolean(search.trim())}
            onClear={() => setSearch('')}
            sortSlot={
              <SortDropdownMenu
                title="Sort table"
                sortBy={sortBy}
                sortDir={sortDir}
                options={[...SORT_OPTIONS]}
                defaultSortBy="reference"
                onSort={setSortBy}
                onSortDirChange={setSortDir}
              />
            }
          />
        }
      />
    </TemplateSection>
  )
}
