import {
  DataTableColumnHeader,
  dataTableAriaSort,
} from '../../primitives/components/DataTableColumnHeader'
import type { TableAlign } from '../../primitives/components/table-styles'
import type { TemplateSortDir, TemplateSortField } from './types'

interface SortableColumnHeaderProps {
  label: string
  field: TemplateSortField
  sortBy: TemplateSortField
  sortDir: TemplateSortDir
  onSort: (field: TemplateSortField) => void
  align?: TableAlign
  className?: string
}

export function SortableColumnHeader({
  label,
  field,
  sortBy,
  sortDir,
  onSort,
  align = 'left',
  className,
}: SortableColumnHeaderProps) {
  const active = sortBy === field

  return (
    <DataTableColumnHeader
      label={label}
      align={align}
      className={className}
      active={active}
      sortDir={sortDir}
      onSort={() => onSort(field)}
      aria-sort={dataTableAriaSort(active, sortDir)}
    />
  )
}

export function StaticColumnHeader({
  label,
  align = 'left',
  className,
}: {
  label: string
  align?: TableAlign
  className?: string
}) {
  return <DataTableColumnHeader label={label} align={align} className={className} sortable={false} />
}
