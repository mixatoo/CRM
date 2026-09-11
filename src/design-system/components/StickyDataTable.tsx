import type { CSSProperties, ReactNode } from 'react'
import {
  CRM_TABLE_HEAD_STICKY_BOTTOM_SHADOW_TABLE,
  CRM_TABLE_ROW_HOVER,
  CRM_TABLE_ROW_HOVER_FROZEN_COL_1,
  CRM_TABLE_ROW_HOVER_FROZEN_COL_2,
  CRM_TABLE_ROW_SELECTED_HOVER,
  CRM_TABLE_ROW_SELECTED_HOVER_FROZEN_COL_1,
  CRM_TABLE_ROW_SELECTED_HOVER_FROZEN_COL_2,
  CRM_TABLE_ROW_STRIPE,
  CRM_TABLE_STRIPE_FROZEN_COL_1_EVEN,
  CRM_TABLE_STRIPE_FROZEN_COL_1_ODD,
  CRM_TABLE_STRIPE_FROZEN_COL_2_EVEN,
  CRM_TABLE_STRIPE_FROZEN_COL_2_ODD,
} from '@/design-system/components/table-styles'
import { cn } from '@/shared/utils/cn'

interface StickyDataTableProps {
  children: ReactNode
  className?: string
  tableClassName?: string
  /** When true, fills the parent flex region instead of using maxHeight. */
  fill?: boolean
  maxHeight?: string
  /** @deprecated Use freezeLeadingColumns */
  freezeFirstColumn?: boolean
  /** Number of left columns to keep visible while scrolling horizontally. */
  freezeLeadingColumns?: number
  /** Width of the first frozen column (used to offset the second frozen column). */
  freezeLeadingColumnWidth?: string
  /** Alternating row tint — default on for enterprise CRM scanning. */
  striped?: boolean
}

export function StickyDataTable({
  children,
  className,
  tableClassName,
  fill = false,
  maxHeight = 'calc(100vh - 16rem)',
  freezeFirstColumn = true,
  freezeLeadingColumns,
  freezeLeadingColumnWidth = '2.25rem',
  striped = true,
}: StickyDataTableProps) {
  const leadingColumns = freezeLeadingColumns ?? (freezeFirstColumn ? 1 : 0)

  return (
    <div
      className={cn(
        'min-w-0 overflow-auto overscroll-x-contain bg-[var(--color-surface)]',
        fill ? 'h-full min-h-0 flex-1' : undefined,
        className,
      )}
      style={{
        ...(fill ? undefined : { maxHeight }),
        ...(leadingColumns >= 2
          ? ({ '--sticky-col-1-width': freezeLeadingColumnWidth } as CSSProperties)
          : undefined),
      }}
      data-freeze-leading-columns={leadingColumns > 0 ? String(leadingColumns) : undefined}
    >
      <table
        className={cn(
          'w-full border-collapse text-sm',
          tableClassName,
          '[&_thead_th:not([data-client-row-selection]):not([data-trip-row-selection]):not([data-supplier-row-selection])]:border-r-0',
          '[&_tbody_td:not([data-client-row-selection]):not([data-trip-row-selection]):not([data-supplier-row-selection])]:border-r-0',
          striped && CRM_TABLE_ROW_STRIPE,
          '[&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-20',
          CRM_TABLE_HEAD_STICKY_BOTTOM_SHADOW_TABLE,
          '[&_tbody_tr[data-interactive]]:transition-[background-color] [&_tbody_tr[data-interactive]]:duration-150 [&_tbody_tr[data-interactive]]:ease-out',
          CRM_TABLE_ROW_HOVER,
          CRM_TABLE_ROW_SELECTED_HOVER,
          leadingColumns >= 1 && '[&_th:nth-child(1)]:sticky [&_th:nth-child(1)]:left-0 [&_th:nth-child(1)]:z-30',
          leadingColumns >= 1 && '[&_td:nth-child(1)]:sticky [&_td:nth-child(1)]:left-0 [&_td:nth-child(1)]:z-10',
          leadingColumns >= 1 && '[&_th:nth-child(1)]:bg-[var(--color-surface-elevated)]',
          leadingColumns >= 1 && '[&_td:nth-child(1)]:bg-[var(--color-surface)]',
          leadingColumns >= 1 && CRM_TABLE_ROW_HOVER_FROZEN_COL_1,
          leadingColumns >= 1 && CRM_TABLE_ROW_SELECTED_HOVER_FROZEN_COL_1,
          leadingColumns >= 1 &&
            '[&_tbody_tr[data-interactive][data-selected=true]_td:nth-child(1)]:bg-[var(--color-accent-muted)]/35',
          leadingColumns >= 1 && striped && CRM_TABLE_STRIPE_FROZEN_COL_1_ODD,
          leadingColumns >= 1 && striped && CRM_TABLE_STRIPE_FROZEN_COL_1_EVEN,
          leadingColumns >= 1 && '[&_thead_th:nth-child(1)]:z-40',
          leadingColumns >= 2 && '[&_th:nth-child(2)]:sticky [&_th:nth-child(2)]:left-[var(--sticky-col-1-width)] [&_th:nth-child(2)]:z-30',
          leadingColumns >= 2 && '[&_td:nth-child(2)]:sticky [&_td:nth-child(2)]:left-[var(--sticky-col-1-width)] [&_td:nth-child(2)]:z-10',
          leadingColumns >= 2 && '[&_th:nth-child(2)]:bg-[var(--color-surface-elevated)]',
          leadingColumns >= 2 && '[&_td:nth-child(2)]:bg-[var(--color-surface)]',
          leadingColumns >= 2 && CRM_TABLE_ROW_HOVER_FROZEN_COL_2,
          leadingColumns >= 2 && CRM_TABLE_ROW_SELECTED_HOVER_FROZEN_COL_2,
          leadingColumns >= 2 &&
            '[&_tbody_tr[data-interactive][data-selected=true]_td:nth-child(2)]:bg-[var(--color-accent-muted)]/35',
          leadingColumns >= 2 && striped && CRM_TABLE_STRIPE_FROZEN_COL_2_ODD,
          leadingColumns >= 2 && striped && CRM_TABLE_STRIPE_FROZEN_COL_2_EVEN,
        )}
      >
        {children}
      </table>
    </div>
  )
}
