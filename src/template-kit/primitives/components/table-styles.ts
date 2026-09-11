import { cn } from '../utils/cn'

export type TableAlign = 'left' | 'center' | 'right'

export const TABLE_ALIGN: Record<TableAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

export const TABLE_HEADER_FLEX: Record<TableAlign, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
}

export const TABLE_CELL_X = 'px-3'

/** Default CRM list row + header vertical rhythm. */
export const CRM_TABLE_ROW_PY = 'py-[9px]'
export const CRM_TABLE_HEAD_HEIGHT = 'h-9'
export const CRM_TABLE_HEAD_MIN_H = 'min-h-9'
export const CRM_TABLE_HEAD_PY = 'py-2'

/** CRM list table — column header typography (compact enterprise grid). */
export const CRM_TABLE_HEAD_LABEL =
  'text-[11px] font-medium uppercase leading-none tracking-[0.05em] text-[var(--color-muted)]'

export const CRM_TABLE_HEAD_LABEL_IDLE = 'text-[var(--color-muted)]'
export const CRM_TABLE_HEAD_LABEL_ACTIVE = 'text-[var(--color-accent)]'

/** Clickable header label — no chrome, accent when column is sorted. */
export const CRM_TABLE_HEAD_LABEL_BTN =
  'cursor-pointer border-0 bg-transparent p-0 shadow-none outline-none transition-colors duration-150'

/** Header band — soft depth without changing row height. */
export const CRM_TABLE_HEAD_BG =
  'bg-gradient-to-b from-[var(--color-surface)] via-[var(--color-surface-elevated)] to-[var(--color-surface-muted)]/55'

/** Sort control — ghost chevron: icon color + scale only, never a boxed target. */
export const CRM_TABLE_HEAD_SORT_BTN_IDLE =
  'appearance-none border-0 border-transparent bg-transparent shadow-none outline-none text-[var(--color-subtle)]'

export const CRM_TABLE_HEAD_SORT_BTN_HOVER =
  'hover:border-transparent hover:bg-transparent hover:shadow-none hover:outline-none hover:scale-110'

export const CRM_TABLE_HEAD_SORT_BTN_ACTIVE = ''

/** @deprecated Active state now lives on the sort control, not the full header cell. */
export const CRM_TABLE_HEAD_ACTIVE: Record<TableAlign, string> = {
  left: '',
  center: '',
  right: '',
}

/** Bottom rule on a sticky header cell — scrolls with the frozen header row. */
export const CRM_TABLE_HEAD_STICKY_BOTTOM_SHADOW =
  'shadow-[0_1px_0_0_var(--color-border-strong),0_6px_14px_-10px_rgba(15,23,42,0.14)]'

/** Frozen 2nd column header cell — bottom rule + horizontal freeze edge. */
export const CRM_TABLE_HEAD_FROZEN_COL_2_STICKY_SHADOW =
  'shadow-[0_1px_0_0_var(--color-border-strong),2px_0_8px_-2px_rgba(15,23,42,0.08),0_6px_14px_-10px_rgba(15,23,42,0.14)]'

/** Apply sticky bottom rule to all header cells in a table. */
export const CRM_TABLE_HEAD_STICKY_BOTTOM_SHADOW_TABLE =
  '[&_thead_th]:shadow-[0_1px_0_0_var(--color-border-strong),0_6px_14px_-10px_rgba(15,23,42,0.14)]'

/** Frozen 2nd column header — keep bottom rule when horizontal edge shadow is applied. */
export const CRM_TABLE_HEAD_FROZEN_COL_2_STICKY_SHADOW_TABLE =
  '[&_thead_th:nth-child(2)]:shadow-[0_1px_0_0_var(--color-border-strong),2px_0_8px_-2px_rgba(15,23,42,0.08),0_6px_14px_-10px_rgba(15,23,42,0.14)]'

/** Body rows — soft zebra + calm interactive states. */
export const CRM_TABLE_ROW_BORDER = 'border-b border-[var(--color-border)]/40 last:border-b-0'
export const CRM_TABLE_ROW_HOVER =
  '[&_tbody_tr[data-interactive]:not([data-selected=true]):hover]:bg-[var(--color-surface-muted)]/45'
export const CRM_TABLE_ROW_SELECTED_HOVER =
  '[&_tbody_tr[data-interactive][data-selected=true]:hover]:bg-[var(--color-accent-muted)]/40'
export const CRM_TABLE_ROW_HOVER_FROZEN_COL_1 =
  '[&_tbody_tr[data-interactive]:not([data-selected=true]):hover_td:nth-child(1)]:bg-[var(--color-surface-muted)]/45'
export const CRM_TABLE_ROW_HOVER_FROZEN_COL_2 =
  '[&_tbody_tr[data-interactive]:not([data-selected=true]):hover_td:nth-child(2)]:bg-[var(--color-surface-muted)]/45'
export const CRM_TABLE_ROW_SELECTED_HOVER_FROZEN_COL_1 =
  '[&_tbody_tr[data-interactive][data-selected=true]:hover_td:nth-child(1)]:bg-[var(--color-accent-muted)]/40'
export const CRM_TABLE_ROW_SELECTED_HOVER_FROZEN_COL_2 =
  '[&_tbody_tr[data-interactive][data-selected=true]:hover_td:nth-child(2)]:bg-[var(--color-accent-muted)]/40'
export const CRM_TABLE_ROW_STRIPE = cn(
  '[&_tbody_tr:nth-child(odd)]:bg-[var(--color-surface)]',
  '[&_tbody_tr:nth-child(even)]:bg-[var(--color-surface-elevated)]',
)

/** Frozen sticky cells — keep in sync with CRM_TABLE_ROW_STRIPE. */
export const CRM_TABLE_STRIPE_FROZEN_COL_1_ODD =
  '[&_tbody_tr:nth-child(odd)_td:nth-child(1)]:bg-[var(--color-surface)]'
export const CRM_TABLE_STRIPE_FROZEN_COL_1_EVEN =
  '[&_tbody_tr:nth-child(even)_td:nth-child(1)]:bg-[var(--color-surface-elevated)]'
export const CRM_TABLE_STRIPE_FROZEN_COL_2_ODD =
  '[&_tbody_tr:nth-child(odd)_td:nth-child(2)]:bg-[var(--color-surface)]'
export const CRM_TABLE_STRIPE_FROZEN_COL_2_EVEN =
  '[&_tbody_tr:nth-child(even)_td:nth-child(2)]:bg-[var(--color-surface-elevated)]'

/** Frozen body column edge when scrolling horizontally. */
export const CRM_TABLE_FROZEN_COL_2_EDGE = '[&_td:nth-child(2)]:shadow-[inset_-1px_0_0_0_var(--color-border)]'

export const CRM_TABLE_HEAD_DIVIDER = 'border-r border-[var(--color-border)]/55 last:border-r-0'

/** Visual size of row-selection checkbox (Tailwind `size-5` / 20px). */
export const TABLE_SELECTION_CHECKBOX_CLASS = 'size-5'

/** Column width for the selection checkbox column. */
export const TABLE_SELECTION_COL_WIDTH = '2.75rem'

/** @deprecated Use TRIPS_TABLE_COLUMN_WIDTHS.tripId from trips-table-columns */
export const TABLE_TRIP_ID_COL_WIDTH = '5.75rem'

export const tableSelectionHeadClass = (extra?: string, compact = false) =>
  cn(
    'box-border cursor-pointer border-r border-[var(--color-border)]/70 px-1 text-center align-middle',
    CRM_TABLE_HEAD_BG,
    '[&_*]:cursor-pointer',
    compact ? 'h-8' : CRM_TABLE_HEAD_HEIGHT,
    extra,
  )

export const tableSelectionCellClass = (extra?: string) =>
  cn(
    'box-border cursor-default px-1 text-center align-middle touch-none',
    CRM_TABLE_ROW_PY,
    'border-r border-[var(--color-border)]/70',
    'transition-colors duration-150',
    extra,
  )

/** Navigable CRM list row — full-row hover wash; selection uses accent tint. */
export function crmInteractiveTableRowClass(options?: { selected?: boolean }) {
  return cn(
    'group/crm-row cursor-pointer',
    CRM_TABLE_ROW_BORDER,
    'transition-[background-color,box-shadow] duration-150 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-accent)]/35',
    options?.selected && 'bg-[var(--color-accent-muted)]/35',
  )
}

export const crmTableSelectionCellClass = (extra?: string) =>
  cn(tableSelectionCellClass(extra), 'cursor-default [&_button]:cursor-pointer')

export const crmTableActionsCellClass = (extra?: string) =>
  cn(tableActionsCellClass(extra), 'cursor-default [&_button]:cursor-pointer')

export const tableHeadClass = (align: TableAlign = 'left', extra?: string, compact = false) =>
  cn(
    compact ? 'px-2' : TABLE_CELL_X,
    'box-border py-0',
    compact ? 'h-8' : CRM_TABLE_HEAD_HEIGHT,
    CRM_TABLE_HEAD_BG,
    'whitespace-nowrap align-middle',
    TABLE_ALIGN[align],
    extra,
  )

export const tableCellClass = (
  align: TableAlign = 'left',
  options?: { numeric?: boolean; muted?: boolean; extra?: string },
) =>
  cn(
    TABLE_CELL_X,
    CRM_TABLE_ROW_PY,
    'text-sm leading-tight',
    TABLE_ALIGN[align],
    options?.numeric && 'tabular-nums',
    options?.muted ? 'text-[var(--color-muted)]' : 'text-[var(--color-foreground)]',
    options?.extra,
  )

export function tableHeaderButtonClass(align: TableAlign = 'left') {
  return cn(
    'group inline-flex w-full min-w-0 flex-nowrap items-center gap-1.5 whitespace-nowrap',
    TABLE_HEADER_FLEX[align],
  )
}

export const tableIconLabelClass = 'flex items-center gap-2'

export const tableActionsClass = 'flex items-center justify-center gap-1'

export const tableActionsCellClass = (extra?: string) =>
  cn('box-border overflow-visible px-1.5 text-center align-middle', CRM_TABLE_ROW_PY, extra)
