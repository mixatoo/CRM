import type { ReactNode } from 'react'
import { useMemo } from 'react'
import type { LucideIcon } from 'lucide-react'
import { StickyDataTable } from '../components/StickyDataTable'
import { DataTableEmptyRow } from '../components/DataTableEmptyState'
import { TableColumnPicker } from '../components/TableColumnPicker'
import {
  TABLE_ALIGN,
  TABLE_CELL_X,
  CRM_TABLE_ROW_PY,
  type TableAlign,
  tableCellClass,
  tableHeadClass,
} from '../components/table-styles'
import type { TableColumnVisibility } from '../hooks/use-table-column-visibility'
import { cn } from '../utils/cn'

export interface DataTableColumn<T> {
  key: string
  header: ReactNode
  align?: TableAlign
  numeric?: boolean
  className?: string
  cell: (row: T) => ReactNode
  footer?: ReactNode
}

type DataTableScroll = 'none' | 'auto' | 'fill'

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  emptyMessage?: string
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: LucideIcon
  compact?: boolean
  scroll?: DataTableScroll
  maxHeight?: string
  freezeFirstColumn?: boolean
  tableClassName?: string
  columnVisibility?: TableColumnVisibility<string>
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = 'No data',
  emptyTitle,
  emptyDescription,
  emptyIcon,
  compact = false,
  scroll = 'none',
  maxHeight = '24rem',
  freezeFirstColumn = false,
  tableClassName,
  columnVisibility,
}: DataTableProps<T>) {
  const visibleColumns = useMemo(
    () => (columnVisibility ? columns.filter((column) => columnVisibility.isVisible(column.key)) : columns),
    [columnVisibility, columns],
  )
  const hasFooter = useMemo(() => visibleColumns.some((col) => col.footer != null), [visibleColumns])
  const cellPy = compact ? 'py-1.5' : CRM_TABLE_ROW_PY

  const resolvedTitle = emptyTitle ?? emptyMessage

  const table = (
    <table className={cn('w-full min-w-[28rem] table-fixed border-collapse text-sm', tableClassName)}>
      <thead>
        <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
          {visibleColumns.map((col) => (
            <th
              key={col.key}
              className={cn(tableHeadClass(col.align ?? 'left', col.className), cellPy)}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <DataTableEmptyRow
            colSpan={visibleColumns.length}
            title={resolvedTitle}
            description={emptyDescription}
            icon={emptyIcon}
          />
        ) : (
          rows.map((row) => (
            <tr
              key={rowKey(row)}
              className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-elevated)]/60"
            >
              {visibleColumns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    tableCellClass(col.align ?? 'left', { numeric: col.numeric, extra: col.className }),
                    cellPy,
                  )}
                >
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
      {hasFooter && rows.length > 0 && (
        <tfoot>
          <tr className="border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)]/80 font-semibold">
            {visibleColumns.map((col) => (
              <td
                key={col.key}
                className={cn(
                  TABLE_CELL_X,
                  'py-3.5',
                  TABLE_ALIGN[col.align ?? 'left'],
                  col.numeric && 'tabular-nums',
                  col.className,
                )}
              >
                {col.footer ?? null}
              </td>
            ))}
          </tr>
        </tfoot>
      )}
    </table>
  )

  const content =
    scroll === 'none' ? (
      <div className="overflow-x-auto">{table}</div>
    ) : (
      <StickyDataTable
        fill={scroll === 'fill'}
        maxHeight={maxHeight}
        freezeFirstColumn={freezeFirstColumn}
        striped
      >
        {table}
      </StickyDataTable>
    )

  if (!columnVisibility) return content

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <TableColumnPicker columnVisibility={columnVisibility} />
      </div>
      {content}
    </div>
  )
}
