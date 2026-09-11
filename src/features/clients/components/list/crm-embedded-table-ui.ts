import {
  clientsTableHeadRowClassName,
  clientsTableRowInteractionClassName,
  clientsTableRowStripeClassName,
} from '@/features/clients/components/list/clients-table-header-ui'
import { cn } from '@/shared/utils/cn'

/** Shared table chrome for CRM list tables embedded in profile/detail panels. */
export const crmEmbeddedTableBaseClassName =
  'w-full min-w-full table-fixed border-collapse text-sm'

export const crmEmbeddedTableHeaderGridClassName = cn(
  clientsTableHeadRowClassName,
  '[&_thead_th]:!h-[2.625rem]',
  '[&_thead_th]:!max-h-[2.625rem]',
  '[&_thead_th]:!min-h-0',
  '[&_thead_th]:!py-0',
  '[&_thead_th]:!leading-none',
  '[&_thead_th]:!bg-[var(--color-surface-elevated)]',
  '[&_thead_th]:!border-t-0 [&_thead_th]:!border-b-0 [&_thead_th]:!border-l-0 [&_thead_th]:!border-r-0',
  '[&_thead_th]:!shadow-[inset_0_-1px_0_0_var(--color-border-strong),inset_1px_0_0_0_var(--color-border)]',
  '[&_thead_th]:text-left',
)

export const crmEmbeddedTableBodyGridClassName = cn(
  '[&_tbody_td]:!border-r-0',
  '[&_tbody_td]:text-left',
  clientsTableRowStripeClassName,
  clientsTableRowInteractionClassName,
)

export const crmEmbeddedTableClassName = cn(
  crmEmbeddedTableBaseClassName,
  crmEmbeddedTableHeaderGridClassName,
  crmEmbeddedTableBodyGridClassName,
)

export const crmEmbeddedTableCellMetaClassName = 'truncate text-xs'
