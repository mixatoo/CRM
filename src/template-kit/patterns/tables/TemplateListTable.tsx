import { useMemo, useState, isValidElement, cloneElement, type ReactElement, type ReactNode } from 'react'
import { Inbox, MoreHorizontal } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { AccountingAmount } from '../../primitives/components/AccountingAmount'
import { DataTableEmptyRow } from '../../primitives/components/DataTableEmptyState'
import { TableColumnPicker } from '../../primitives/components/TableColumnPicker'
import { TripStageBadge } from '../../primitives/components/TripStageBadge'
import { Pagination } from '../../primitives/components/Pagination'
import { StickyDataTable } from '../../primitives/components/StickyDataTable'
import {
  tableActionsCellClass,
  tableCellClass,
  tableSelectionCellClass,
  tableSelectionHeadClass,
} from '../../primitives/components/table-styles'
import { DataTableShell } from '../../primitives/layout/DataTableShell'
import { RowSelectionCheckbox } from './RowSelectionCheckbox'
import {
  SortableColumnHeader,
  StaticColumnHeader,
} from './SortableColumnHeader'
import {
  TEMPLATE_TABLE_COLUMN_ORDER,
  TEMPLATE_TABLE_COLUMN_OPTIONS,
  TEMPLATE_TABLE_COLUMN_WIDTHS,
  TEMPLATE_TABLE_COL_COUNT,
  TemplateTableColgroup,
} from './template-table-columns'
import { useTableColumnVisibility } from '../../primitives/hooks/use-table-column-visibility'
import { TEMPLATE_TABLE_COLUMNS_STORAGE_KEY } from '../../primitives/types/table-columns'
import type { TemplateListRow, TemplateSortDir, TemplateSortField } from './types'
import { cn } from '../../primitives/utils/cn'

function formatPersons(count: number) {
  return String(count).padStart(2, '0')
}

function sortRows(rows: TemplateListRow[], sortBy: TemplateSortField, sortDir: TemplateSortDir) {
  const dir = sortDir === 'asc' ? 1 : -1
  return [...rows].sort((a, b) => {
    let cmp = 0
    switch (sortBy) {
      case 'reference':
        cmp = a.reference.localeCompare(b.reference, undefined, { numeric: true })
        break
      case 'date':
        cmp = a.date.localeCompare(b.date)
        break
      case 'client':
        cmp = a.client.localeCompare(b.client)
        break
      case 'persons':
        cmp = a.persons - b.persons
        break
      case 'destination':
        cmp = a.destination.localeCompare(b.destination)
        break
      case 'cost':
        cmp = a.cost - b.cost
        break
      case 'stage':
        cmp = a.stage.localeCompare(b.stage)
        break
      case 'owner':
        cmp = a.owner.localeCompare(b.owner)
        break
    }
    return cmp * dir
  })
}

export interface TemplateListTableProps {
  rows: TemplateListRow[]
  toolbar?: React.ReactNode
  pageSize?: number
  className?: string
}

/**
 * Copy-paste starting point for entity list tables.
 * Includes selection column, sortable headers, cost formatting, row actions, pagination.
 */
export function TemplateListTable({ rows, toolbar, pageSize = 8, className }: TemplateListTableProps) {
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<TemplateSortField>('reference')
  const [sortDir, setSortDir] = useState<TemplateSortDir>('desc')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const columnVisibility = useTableColumnVisibility(TEMPLATE_TABLE_COLUMNS_STORAGE_KEY, TEMPLATE_TABLE_COLUMN_OPTIONS)
  const { isVisible } = columnVisibility
  const visibleKeys = useMemo(
    () => new Set(TEMPLATE_TABLE_COLUMN_ORDER.filter((key) => isVisible(key))),
    [isVisible],
  )
  const show = isVisible

  const columnPicker = (
    <TableColumnPicker columnVisibility={columnVisibility} />
  )

  const header = useMemo(() => {
    if (toolbar && isValidElement(toolbar)) {
      return cloneElement(toolbar as ReactElement<{ columnsSlot?: ReactNode }>, {
        columnsSlot: columnPicker,
      })
    }

    return (
      <div className="flex flex-wrap items-center justify-end gap-2 border-b border-[var(--color-border)] px-2 py-2 sm:px-4">
        {toolbar}
        {columnPicker}
      </div>
    )
  }, [toolbar, columnPicker])

  const sorted = useMemo(() => sortRows(rows, sortBy, sortDir), [rows, sortBy, sortDir])
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize)
  const pageIds = pageRows.map((row) => row.id)
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id))
  const somePageSelected = pageIds.some((id) => selected.has(id)) && !allPageSelected

  const handleSort = (field: TemplateSortField) => {
    if (sortBy === field) {
      setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortBy(field)
    setSortDir('asc')
  }

  const togglePage = () => {
    setSelected((current) => {
      const next = new Set(current)
      if (allPageSelected) {
        pageIds.forEach((id) => next.delete(id))
      } else {
        pageIds.forEach((id) => next.add(id))
      }
      return next
    })
  }

  const toggleRow = (id: string) => {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <DataTableShell
      className={cn('h-[28rem]', className)}
      header={header}
      footer={
        <Pagination
          compact
          page={safePage}
          totalPages={totalPages}
          total={sorted.length}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      }
    >
      <StickyDataTable
        fill
        freezeLeadingColumns={2}
        freezeLeadingColumnWidth={TEMPLATE_TABLE_COLUMN_WIDTHS.selection}
        tableClassName="table-fixed text-sm"
      >
        <TemplateTableColgroup visibleKeys={visibleKeys} />
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <th
              className={tableSelectionHeadClass()}
              onClick={(e) => {
                e.stopPropagation()
                togglePage()
              }}
            >
              <RowSelectionCheckbox
                checked={allPageSelected}
                indeterminate={somePageSelected}
                onChange={() => togglePage()}
                aria-label={allPageSelected ? 'Deselect page' : 'Select page'}
              />
            </th>
            {show('reference') ? (
              <SortableColumnHeader label="Trip ID" field="reference" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
            ) : null}
            {show('date') ? (
              <SortableColumnHeader label="Trip Date" field="date" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
            ) : null}
            {show('client') ? (
              <SortableColumnHeader label="Client" field="client" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
            ) : null}
            {show('persons') ? (
              <SortableColumnHeader
                label="Persons"
                field="persons"
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={handleSort}
                className="px-2"
              />
            ) : null}
            {show('destination') ? (
              <SortableColumnHeader label="Destination" field="destination" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
            ) : null}
            {show('cost') ? (
              <SortableColumnHeader
                label="Cost"
                field="cost"
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={handleSort}
                className="px-2"
              />
            ) : null}
            {show('stage') ? (
              <SortableColumnHeader label="Stage" field="stage" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} align="center" />
            ) : null}
            {show('owner') ? (
              <SortableColumnHeader label="Owner" field="owner" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
            ) : null}
            <StaticColumnHeader label="Actions" align="center" />
          </tr>
        </thead>
        <tbody>
          {pageRows.map((row) => {
            const isSelected = selected.has(row.id)
            return (
              <tr
                key={row.id}
                data-selected={isSelected ? 'true' : undefined}
                className={cn(
                  'group/trip-row border-b border-[var(--color-border)] last:border-0',
                  isSelected && 'bg-[var(--color-accent-muted)]/55',
                )}
              >
                <td
                  className={tableSelectionCellClass(
                    cn(isSelected && 'bg-[var(--color-accent-muted)]/60'),
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleRow(row.id)
                  }}
                >
                  <RowSelectionCheckbox
                    checked={isSelected}
                    onChange={() => toggleRow(row.id)}
                    aria-label={`Select row ${row.reference}`}
                  />
                </td>
                {show('reference') ? (
                <td className={tableCellClass('left', { numeric: true, extra: 'px-2 text-[var(--color-accent)]' })}>
                  #{row.reference}
                </td>
                ) : null}
                {show('date') ? (
                <td className={tableCellClass('left', { numeric: true, muted: true, extra: 'px-2' })}>{row.date}</td>
                ) : null}
                {show('client') ? (
                <td className={tableCellClass('left', { extra: 'truncate' })} title={row.client}>
                  {row.client}
                </td>
                ) : null}
                {show('persons') ? (
                <td className={tableCellClass('left', { numeric: true, extra: 'px-2' })}>{formatPersons(row.persons)}</td>
                ) : null}
                {show('destination') ? (
                <td className={tableCellClass('left', { extra: 'truncate' })} title={row.destination}>
                  {row.destination}
                </td>
                ) : null}
                {show('cost') ? (
                <td className={tableCellClass('left', { extra: 'px-2' })}>
                  <AccountingAmount amount={row.cost} currency={row.currency} className="min-w-0" />
                </td>
                ) : null}
                {show('stage') ? (
                <td className={tableCellClass('center', { extra: 'px-2' })}>
                  <TripStageBadge stage={row.stage} className="min-w-0 font-normal" />
                </td>
                ) : null}
                {show('owner') ? (
                <td className={tableCellClass('left', { extra: 'truncate px-2' })} title={row.owner}>
                  {row.owner}
                </td>
                ) : null}
                <td className={tableActionsCellClass()} data-trip-row-action="">
                  <RowActionsMenu label={row.reference} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </StickyDataTable>
    </DataTableShell>
  )
}

function RowActionsMenu({ label }: { label: string }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-foreground)]"
          aria-label={`Actions for ${label}`}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[8rem] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-lg"
          align="end"
          sideOffset={4}
        >
          {['Edit', 'Clone', 'Delete'].map((action) => (
            <DropdownMenu.Item
              key={action}
              className="cursor-pointer rounded-[var(--radius-sm)] px-2.5 py-1.5 text-xs outline-none hover:bg-[var(--color-surface-elevated)]"
            >
              {action}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export function TemplateTableEmptyState({ colSpan = TEMPLATE_TABLE_COL_COUNT }: { colSpan?: number }) {
  return (
    <DataTableEmptyRow
      colSpan={colSpan}
      icon={Inbox}
      title="No rows found"
      description="Try adjusting search or filters."
    />
  )
}
