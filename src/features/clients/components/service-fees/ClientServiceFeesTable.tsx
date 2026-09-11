import type { ClientServiceFee } from '@/domain/entities/client-service-fee'
import {
  CLIENT_SERVICE_FEE_TYPE_LABELS,
  formatClientServiceFeeValue,
} from '@/domain/entities/client-service-fee'
import { SERVICE_CATEGORY_LABELS } from '@/domain/entities/trip'
import { DataTableColumnHeader } from '@/design-system/components/DataTableColumnHeader'
import { Skeleton } from '@/design-system/components/Skeleton'
import {
  crmEmbeddedTableCellMetaClassName,
  crmEmbeddedTableClassName,
} from '@/features/clients/components/list/crm-embedded-table-ui'
import { clientsTableHeadCellClassName } from '@/features/clients/components/list/clients-table-header-ui'
import { ServiceFeeRowActions } from '@/features/clients/components/service-fees/ServiceFeeRowActions'
import {
  crmInteractiveTableRowClass,
  crmTableActionsCellClass,
  tableCellClass,
} from '@/design-system/components/table-styles'
import { cn } from '@/shared/utils/cn'
import { Percent } from 'lucide-react'

const COLUMN_COUNT = 5

interface ClientServiceFeesTableProps {
  fees: ClientServiceFee[]
  disabled?: boolean
  busy?: boolean
  isLoading?: boolean
  onEdit?: (fee: ClientServiceFee) => void
  onDelete?: (feeId: string) => void
}

function ClientServiceFeesTableSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-[var(--color-border)]/45">
          {Array.from({ length: COLUMN_COUNT }).map((__, colIndex) => (
            <td key={colIndex} className={tableCellClass('left')}>
              <Skeleton className="h-3.5 w-full max-w-[6rem]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

function ServiceNameCell({ name, notes }: { name: string; notes?: string | null }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-accent-muted)]/45 text-[var(--color-accent)]"
        aria-hidden
      >
        <Percent className="h-3.5 w-3.5" strokeWidth={2} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-medium leading-none">{name}</span>
        {notes?.trim() ? (
          <span className="mt-0.5 block truncate text-[11px] leading-snug text-[var(--color-muted)]">
            {notes.trim()}
          </span>
        ) : null}
      </span>
    </span>
  )
}

const SERVICE_FEE_HEADERS = [
  { key: 'service', label: 'Service', align: 'left' as const },
  { key: 'category', label: 'Category', align: 'left' as const },
  { key: 'feeType', label: 'Fee type', align: 'left' as const },
  { key: 'fee', label: 'Fee', align: 'left' as const },
  { key: 'actions', label: 'Actions', align: 'center' as const },
]

export function ClientServiceFeesTable({
  fees,
  disabled,
  busy,
  isLoading,
  onEdit,
  onDelete,
}: ClientServiceFeesTableProps) {
  return (
    <div className="overflow-x-auto bg-[var(--color-surface)]">
      <table className={crmEmbeddedTableClassName}>
        <colgroup>
          <col className="w-[30%]" />
          <col className="w-[18%]" />
          <col className="w-[16%]" />
          <col className="w-[18%]" />
          <col className="w-[18%]" />
        </colgroup>
        <thead>
          <tr>
            {SERVICE_FEE_HEADERS.map((header) => (
              <DataTableColumnHeader
                key={header.key}
                label={header.label}
                align={header.align}
                sortable={false}
                className={clientsTableHeadCellClassName}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <ClientServiceFeesTableSkeleton />
          ) : fees.length === 0 ? null : (
            fees.map((fee) => (
              <tr key={fee.id} data-interactive="true" className={crmInteractiveTableRowClass()}>
                <td className={tableCellClass('left')}>
                  <ServiceNameCell name={fee.serviceName} notes={fee.notes} />
                </td>
                <td className={tableCellClass('left', { muted: true, extra: crmEmbeddedTableCellMetaClassName })}>
                  {fee.category ? SERVICE_CATEGORY_LABELS[fee.category] : '—'}
                </td>
                <td className={tableCellClass('left', { extra: crmEmbeddedTableCellMetaClassName })}>
                  {CLIENT_SERVICE_FEE_TYPE_LABELS[fee.feeType]}
                </td>
                <td className={tableCellClass('left', { numeric: true, extra: cn(crmEmbeddedTableCellMetaClassName, '[direction:ltr] [unicode-bidi:plaintext]') })}>
                  <span className="font-mono">{formatClientServiceFeeValue(fee)}</span>
                </td>
                <td
                  className={crmTableActionsCellClass('!text-center')}
                  onClick={(event) => event.stopPropagation()}
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  {!disabled && onEdit && onDelete ? (
                    <div className="flex justify-center">
                      <ServiceFeeRowActions fee={fee} onEdit={onEdit} onDelete={onDelete} busy={busy} />
                    </div>
                  ) : (
                    <span className={crmEmbeddedTableCellMetaClassName}>—</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
