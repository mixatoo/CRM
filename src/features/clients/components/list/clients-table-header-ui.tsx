import { tableSelectionHeadClass } from '@/design-system/components/table-styles'
import { cn } from '@/shared/utils/cn'

/** Matches body row height: py-[9px] + h-6 avatar (24px) = 42px. */
export const clientsTableRowHeightClass = 'h-[2.625rem] max-h-[2.625rem]'

/** Applied on each header <th> — fixed height matching body rows. */
export const clientsTableHeadCellClassName = cn(
  clientsTableRowHeightClass,
  '!min-h-0 !py-0 !leading-none',
)


/** Accounts table header — calm muted band, no per-column grid lines. */
export const clientsTableHeadRowClassName = cn(
  'bg-[var(--color-surface-muted)]/30',
  'border-t-0 border-b-0',
)

/** Accounts table header label — title case, aligned with travelers/trips lists. */
export const accountsTableHeadLabelClassName =
  'text-[12px] font-medium normal-case leading-none tracking-[-0.01em]'

/** Accounts table — flat white rows, no zebra stripes. */
export const clientsTableRowStripeClassName = cn(
  '[&_tbody_tr]:!bg-[var(--color-surface)]',
  '[&_tbody_tr_td:nth-child(1)]:!bg-[var(--color-surface)]',
  '[&_tbody_tr_td:nth-child(2)]:!bg-[var(--color-surface)]',
)

/** Accounts table — soft accent wash on hover. */
export const clientsTableRowInteractionClassName = cn(
  '[&_tbody_tr[data-interactive]]:transition-[background-color] [&_tbody_tr[data-interactive]]:duration-150 [&_tbody_tr[data-interactive]]:ease-out',
  '[&_tbody_tr[data-interactive]:not([data-selected=true]):hover]:!bg-[var(--color-accent-muted)]/70',
  '[&_tbody_tr[data-interactive]:not([data-selected=true]):hover]:!shadow-none',
  '[&_tbody_tr[data-interactive][data-selected=true]:hover]:!bg-[var(--color-accent-muted)]',
  '[&_tbody_tr[data-interactive][data-selected=true]:hover]:!shadow-none',
  '[&_tbody_tr[data-interactive]:not([data-selected=true]):hover_td:nth-child(1)]:!bg-[var(--color-accent-muted)]/70',
  '[&_tbody_tr[data-interactive]:not([data-selected=true]):hover_td:nth-child(2)]:!bg-[var(--color-accent-muted)]/70',
  '[&_tbody_tr[data-interactive][data-selected=true]:hover_td:nth-child(1)]:!bg-[var(--color-accent-muted)]',
  '[&_tbody_tr[data-interactive][data-selected=true]:hover_td:nth-child(2)]:!bg-[var(--color-accent-muted)]',
)

/** Header table — fixed above scroll region (no vertical sticky needed). */
export const clientsTableHeaderGridClassName = cn(
  '[&_thead_th:not([data-client-row-selection])]:!border-r-0',
  '[&_thead_th]:![background-image:none]',
  '[&_thead_th]:!bg-[var(--color-surface-muted)]/30',
  '[&_th:nth-child(1)]:![background-image:none]',
  '[&_th:nth-child(1)]:!bg-[var(--color-surface-muted)]/30',
  '[&_th:nth-child(2)]:![background-image:none]',
  '[&_th:nth-child(2)]:!bg-[var(--color-surface-muted)]/30',
  '[&_thead_th]:!h-[2.625rem]',
  '[&_thead_th]:!max-h-[2.625rem]',
  '[&_thead_th]:!min-h-0',
  '[&_thead_th]:!py-0',
  '[&_thead_th]:!leading-none',
  '[&_thead_th_[data-table-sort-control]]:!flex [&_thead_th_[data-table-sort-control]]:!h-full [&_thead_th_[data-table-sort-control]]:!max-h-full [&_thead_th_[data-table-sort-control]]:!min-h-0 [&_thead_th_[data-table-sort-control]]:!items-center [&_thead_th_[data-table-sort-control]]:!gap-1 [&_thead_th_[data-table-sort-control]]:!py-0',
  '[&_thead_th_[data-table-sort-control]]:!justify-between',
  '[&_thead_th_[data-table-sort-control]_span:first-child]:!min-w-0 [&_thead_th_[data-table-sort-control]_span:first-child]:!flex-1 [&_thead_th_[data-table-sort-control]_span:first-child]:!text-left',
  '[&_thead_th_[data-table-sort-control]_span:first-child]:!normal-case [&_thead_th_[data-table-sort-control]_span:first-child]:!text-[12px] [&_thead_th_[data-table-sort-control]_span:first-child]:!font-medium [&_thead_th_[data-table-sort-control]_span:first-child]:!tracking-[-0.01em]',
  '[&_thead_th_[data-table-sort-control]_span:last-child]:!ml-1.5 [&_thead_th_[data-table-sort-control]_span:last-child]:!shrink-0',
  '[&_thead_th>div]:!flex [&_thead_th>div]:!h-full [&_thead_th>div]:!max-h-full [&_thead_th>div]:!min-h-0 [&_thead_th>div]:!items-center [&_thead_th>div]:!py-0',
  '[&_thead_th>div_span]:!normal-case [&_thead_th>div_span]:!text-[12px] [&_thead_th>div_span]:!font-medium [&_thead_th>div_span]:!tracking-[-0.01em]',
  '[&_thead_th_[data-table-sort-control]_span:last-child]:!size-4',
  '[&_thead_th_[data-table-sort-control]_span:last-child]:!-space-y-1',
  '[&_thead_th]:!border-t-0 [&_thead_th]:!border-b [&_thead_th]:!border-b-[var(--color-border-strong)] [&_thead_th]:!border-l-0 [&_thead_th]:!border-r-0',
  '[&_thead_th:nth-child(1)]:!shadow-none',
  '[&_thead_th:nth-child(2)]:!shadow-none',
  '[&_thead_th:not([data-client-row-selection])]:text-left',
  // Horizontal freeze for header when body scrolls sideways.
  '[&_th:nth-child(1)]:sticky [&_th:nth-child(1)]:left-0 [&_th:nth-child(1)]:z-30',
  '[&_th:nth-child(2)]:sticky [&_th:nth-child(2)]:left-[var(--sticky-col-1-width)] [&_th:nth-child(2)]:z-30',
)

/** Body table — scrollable rows with frozen leading columns. */
export const clientsTableBodyGridClassName = cn(
  '[&_tbody_td:not([data-client-row-selection])]:!border-r-0',
  '[&_tbody_td:not([data-client-row-selection])]:text-left',
  '[&_tbody_tr[data-interactive]]:transition-[background-color] [&_tbody_tr[data-interactive]]:duration-150 [&_tbody_tr[data-interactive]]:ease-out',
  '[&_td:nth-child(1)]:sticky [&_td:nth-child(1)]:left-0 [&_td:nth-child(1)]:z-10',
  '[&_td:nth-child(2)]:sticky [&_td:nth-child(2)]:left-[var(--sticky-col-1-width)] [&_td:nth-child(2)]:z-10',
  '[&_td:nth-child(1)]:bg-[var(--color-surface)]',
  '[&_td:nth-child(2)]:bg-[var(--color-surface)]',
  '[&_tbody_tr[data-interactive]:not([data-selected=true]):hover_td:nth-child(1)]:bg-[var(--color-accent-muted)]/70',
  '[&_tbody_tr[data-interactive]:not([data-selected=true]):hover_td:nth-child(2)]:bg-[var(--color-accent-muted)]/70',
  '[&_tbody_tr[data-interactive][data-selected=true]:hover_td:nth-child(1)]:bg-[var(--color-accent-muted)]',
  '[&_tbody_tr[data-interactive][data-selected=true]:hover_td:nth-child(2)]:bg-[var(--color-accent-muted)]',
  '[&_tbody_tr[data-interactive][data-selected=true]_td:nth-child(1)]:bg-[var(--color-accent-muted)]/35',
  '[&_tbody_tr[data-interactive][data-selected=true]_td:nth-child(2)]:bg-[var(--color-accent-muted)]/35',
  clientsTableRowStripeClassName,
  clientsTableRowInteractionClassName,
)

/** @deprecated Use clientsTableHeaderGridClassName + clientsTableBodyGridClassName */
export const clientsTableGridClassName = cn(
  clientsTableHeaderGridClassName,
  clientsTableBodyGridClassName,
)

export function clientsTableSelectionHeadClass(extra?: string) {
  return cn(
    tableSelectionHeadClass(extra),
    clientsTableHeadCellClassName,
    '![background-image:none]',
    '!bg-[var(--color-surface-muted)]/30',
    '!border-r-0',
    '!border-b !border-b-[var(--color-border-strong)]',
    'cursor-pointer !border-t-0 !text-center',
  )
}
