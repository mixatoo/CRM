import { tableSelectionHeadClass } from '../../primitives/components/table-styles'
import { cn } from '../../primitives/utils/cn'

export const clientsTableRowHeightClass = 'h-[2.625rem] max-h-[2.625rem]'

export const clientsTableHeadCellClassName = cn(
  clientsTableRowHeightClass,
  '!min-h-0 !py-0 !leading-none',
)

export const clientsTableHeadRowClassName = cn(
  'bg-[var(--color-surface-elevated)]',
  'border-t-0 border-b-0',
)

export const clientsTableRowStripeClassName = cn(
  '[&_tbody_tr]:!bg-[var(--color-surface)]',
  '[&_tbody_tr_td:nth-child(1)]:!bg-[var(--color-surface)]',
  '[&_tbody_tr_td:nth-child(2)]:!bg-[var(--color-surface)]',
)

export const clientsTableRowInteractionClassName = cn(
  '[&_tbody_tr[data-interactive]]:transition-[background-color] [&_tbody_tr[data-interactive]]:duration-150 [&_tbody_tr[data-interactive]]:ease-out',
  '[&_tbody_tr[data-interactive]:not([data-selected=true]):hover]:!bg-[var(--color-accent-muted)]/70',
  '[&_tbody_tr[data-interactive][data-selected=true]:hover]:!bg-[var(--color-accent-muted)]',
  '[&_tbody_tr[data-interactive]:not([data-selected=true]):hover_td:nth-child(1)]:!bg-[var(--color-accent-muted)]/70',
  '[&_tbody_tr[data-interactive]:not([data-selected=true]):hover_td:nth-child(2)]:!bg-[var(--color-accent-muted)]/70',
  '[&_tbody_tr[data-interactive][data-selected=true]:hover_td:nth-child(1)]:!bg-[var(--color-accent-muted)]',
  '[&_tbody_tr[data-interactive][data-selected=true]:hover_td:nth-child(2)]:!bg-[var(--color-accent-muted)]',
)

export const clientsTableHeaderGridClassName = cn(
  '[&_thead_th:not([data-client-row-selection])]:!border-r-0',
  '[&_thead_th]:!bg-[var(--color-surface-elevated)]',
  '[&_thead_th]:!h-[2.625rem]',
  '[&_thead_th]:!max-h-[2.625rem]',
  '[&_thead_th]:!min-h-0',
  '[&_thead_th]:!py-0',
  '[&_th:nth-child(1)]:sticky [&_th:nth-child(1)]:left-0 [&_th:nth-child(1)]:z-30',
  '[&_th:nth-child(2)]:sticky [&_th:nth-child(2)]:left-[var(--sticky-col-1-width)] [&_th:nth-child(2)]:z-30',
)

export const clientsTableBodyGridClassName = cn(
  '[&_tbody_td:not([data-client-row-selection])]:!border-r-0',
  '[&_td:nth-child(1)]:sticky [&_td:nth-child(1)]:left-0 [&_td:nth-child(1)]:z-10',
  '[&_td:nth-child(2)]:sticky [&_td:nth-child(2)]:left-[var(--sticky-col-1-width)] [&_td:nth-child(2)]:z-10',
  clientsTableRowStripeClassName,
  clientsTableRowInteractionClassName,
)

export function clientsTableSelectionHeadClass(extra?: string) {
  return cn(
    tableSelectionHeadClass(extra),
    clientsTableHeadCellClassName,
    '![background-image:none]',
    '!bg-[var(--color-surface-elevated)]',
    '!border-r-0',
    'cursor-pointer !border-t-0 !text-center',
  )
}
