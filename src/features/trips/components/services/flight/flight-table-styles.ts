import {
  type TableAlign,
  TABLE_ALIGN,
  tableActionsClass,
} from '@/design-system/components/table-styles'
import { cn } from '@/shared/utils/cn'

/** Matches compact `DataTableColumnHeader` horizontal padding (`px-2`). */
export const FLIGHT_TABLE_CELL_X = 'px-2'

/** Mirrors `tableSelectionCellClass` outer inset (`px-1` → trailing edge). */
export const FLIGHT_TABLE_TRAILING_EDGE_X = 'pr-1'

/** Horizontal inset for the flight grid scroll area — matches toolbar/pagination (`px-2 sm:px-3`). */
export const FLIGHT_TABLE_SCROLL_INSET_X = 'px-2 sm:px-3'

/** Editable flight grid cells — aligned with compact column headers. */
export function flightTableEditCellClass(align: TableAlign = 'left', extra?: string) {
  return cn(
    FLIGHT_TABLE_CELL_X,
    'py-2 text-sm leading-snug align-middle text-[var(--color-foreground)]',
    TABLE_ALIGN[align],
    extra,
  )
}

export function flightTableActionsCellClass(extra?: string) {
  return cn(
    'box-border overflow-visible py-2 pl-2 text-center align-middle',
    FLIGHT_TABLE_TRAILING_EDGE_X,
    extra,
  )
}

/** Actions column header — trailing inset mirrors selection column (`px-1`). */
export function flightTableActionsHeadClass(extra?: string) {
  return cn('!pl-2 !pr-1', extra)
}

export { tableActionsClass }

export const FLIGHT_TABLE_ROW =
  'cursor-pointer border-b border-[var(--color-border)] last:border-0 transition-colors'

export const FLIGHT_TABLE_ROW_SELECTED =
  'bg-[var(--color-accent-muted)]/55 hover:bg-[var(--color-accent-muted)]/70 data-[selected=true]:bg-[var(--color-accent-muted)]/55'

/** Uppercase labels in flight grid headers and editable fields. */
export const FLIGHT_TABLE_HEAD_CLASS = 'uppercase tracking-wide'

export const FLIGHT_TABLE_FIELD_CLASS = 'uppercase placeholder:uppercase'
