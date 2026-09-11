import type { SupplierStatus } from '@/domain/entities/supplier'
import { SUPPLIER_STATUS_LABELS } from '@/domain/entities/supplier'
import {
  SUPPLIER_STATUS_CHIP_SIZE,
  SUPPLIER_STATUS_VISUAL,
} from '@/features/suppliers/components/list/supplier-status-styles'
import { cn } from '@/shared/utils/cn'

interface SupplierStatusBadgeProps {
  status: SupplierStatus
  className?: string
}

export function SupplierStatusBadge({ status, className }: SupplierStatusBadgeProps) {
  const visual = SUPPLIER_STATUS_VISUAL[status]

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-[var(--radius-sm)] border px-2 text-center text-xs font-normal leading-none',
        SUPPLIER_STATUS_CHIP_SIZE,
        visual.shell,
        visual.text,
        className,
      )}
    >
      <span className="truncate">{SUPPLIER_STATUS_LABELS[status]}</span>
    </span>
  )
}
