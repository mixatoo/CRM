import { ChevronDown, ChevronUp } from 'lucide-react'
import {
  type TableAlign,
  CRM_TABLE_HEAD_LABEL,
  CRM_TABLE_HEAD_LABEL_ACTIVE,
  CRM_TABLE_HEAD_LABEL_BTN,
  CRM_TABLE_HEAD_LABEL_IDLE,
  CRM_TABLE_HEAD_MIN_H,
  CRM_TABLE_HEAD_PY,
  CRM_TABLE_HEAD_SORT_BTN_HOVER,
  tableHeadClass,
  TABLE_HEADER_FLEX,
} from '@/design-system/components/table-styles'
import { cn } from '@/shared/utils/cn'

interface DataTableColumnHeaderBaseProps {
  label: string
  align?: TableAlign
  className?: string
  rowSpan?: number
  colSpan?: number
  compact?: boolean
}

interface DataTableSortableHeaderProps extends DataTableColumnHeaderBaseProps {
  sortable?: true
  active: boolean
  sortDir: 'asc' | 'desc'
  onSort: () => void
  'aria-sort'?: 'ascending' | 'descending' | 'none'
}

interface DataTableStaticHeaderProps extends DataTableColumnHeaderBaseProps {
  sortable: false
}

export type DataTableColumnHeaderProps = DataTableSortableHeaderProps | DataTableStaticHeaderProps

function SortIndicator({
  active,
  sortDir,
  compact = false,
}: {
  active: boolean
  sortDir: 'asc' | 'desc'
  compact?: boolean
}) {
  const idle = 'text-[var(--color-subtle)]/40'
  const hover = 'group-hover/sort:text-[var(--color-muted)]'
  const accent = 'text-[var(--color-accent)]'
  const upClass = cn(
    compact ? 'h-2 w-2' : 'h-2.5 w-2.5',
    'transition-[color,transform] duration-150',
    active && sortDir === 'asc' ? accent : cn(idle, !active && hover),
    !active && 'group-hover/sort:scale-110',
  )
  const downClass = cn(
    compact ? 'h-2 w-2' : 'h-2.5 w-2.5',
    'transition-[color,transform] duration-150',
    active && sortDir === 'desc' ? accent : cn(idle, !active && hover),
    !active && 'group-hover/sort:scale-110',
  )

  if (compact) {
    return (
      <span className="inline-flex shrink-0 items-center -space-x-0.5" aria-hidden>
        <ChevronUp className={upClass} strokeWidth={2.5} />
        <ChevronDown className={downClass} strokeWidth={2.5} />
      </span>
    )
  }

  return (
    <span
      className="inline-flex shrink-0 flex-col items-center justify-center -space-y-1.5"
      aria-hidden
    >
      <ChevronUp className={upClass} strokeWidth={2.5} />
      <ChevronDown className={downClass} strokeWidth={2.5} />
    </span>
  )
}

export function DataTableColumnHeader(props: DataTableColumnHeaderProps) {
  const { label, align = 'left', className, rowSpan, colSpan, compact = false } = props
  const sortable = props.sortable !== false
  const active = sortable && props.active
  const stackedHeader = (rowSpan ?? 1) > 1

  const rowClassName = cn(
    'flex w-full min-w-0 flex-nowrap items-center',
    compact ? 'gap-1.5' : 'gap-2',
    TABLE_HEADER_FLEX[align],
  )

  const labelClassName = cn(
    CRM_TABLE_HEAD_LABEL,
    compact && 'text-[10px]',
    'min-w-0 truncate',
    active ? CRM_TABLE_HEAD_LABEL_ACTIVE : CRM_TABLE_HEAD_LABEL_IDLE,
  )

  const headPadding = compact
    ? stackedHeader
      ? 'min-h-8 py-1'
      : 'min-h-8 py-1'
    : stackedHeader
      ? 'min-h-[4rem] py-2.5'
      : cn(CRM_TABLE_HEAD_MIN_H, CRM_TABLE_HEAD_PY)

  const sortControlClass = cn(
    rowClassName,
    headPadding,
    CRM_TABLE_HEAD_LABEL_BTN,
    'w-full',
    'focus:outline-none focus-visible:outline-none focus-visible:ring-0',
  )

  const sortIconClass = cn(
    'group/sort inline-flex shrink-0 items-center justify-center',
    compact ? 'size-5' : 'size-[1.375rem]',
    CRM_TABLE_HEAD_SORT_BTN_HOVER,
  )

  const sortAriaLabel = `Sort by ${label}${active ? `, ${props.sortDir === 'asc' ? 'ascending' : 'descending'}` : ''}`

  return (
    <th
      rowSpan={rowSpan}
      colSpan={colSpan}
      className={tableHeadClass(align, cn(stackedHeader && 'align-middle', className), compact)}
      aria-sort={sortable ? props['aria-sort'] : undefined}
    >
      {sortable ? (
        <button
          type="button"
          data-table-sort-control=""
          onClick={props.onSort}
          className={sortControlClass}
          aria-label={sortAriaLabel}
        >
          <span className={labelClassName}>{label}</span>
          <span className={sortIconClass} aria-hidden>
            <SortIndicator active={active} sortDir={props.sortDir} compact={compact} />
          </span>
        </button>
      ) : (
        <div className={cn(rowClassName, headPadding)}>
          <span className={cn(CRM_TABLE_HEAD_LABEL, compact && 'text-[10px]', CRM_TABLE_HEAD_LABEL_IDLE)}>
            {label}
          </span>
        </div>
      )}
    </th>
  )
}

export function dataTableAriaSort(
  active: boolean,
  sortDir: 'asc' | 'desc',
): 'ascending' | 'descending' | 'none' {
  if (!active) return 'none'
  return sortDir === 'asc' ? 'ascending' : 'descending'
}
