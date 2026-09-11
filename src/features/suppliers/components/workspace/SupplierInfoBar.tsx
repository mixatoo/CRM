import { Link } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import type { Supplier } from '@/domain/entities/supplier'
import { SUPPLIER_CATEGORY_LABELS, supplierPrimaryLabel } from '@/domain/entities/supplier'
import { TravelCard } from '@/design-system/layout/TravelCard'
import { SupplierStatusBadge } from '@/features/suppliers/components/SupplierStatusBadge'
import { useSupplierLinkedServices } from '@/features/suppliers/hooks/use-suppliers'
import { WorkspaceEntityLabels } from '@/features/labels/components/WorkspaceEntityLabels'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { layout } from '@/design-system/tokens/layout'
import { cn } from '@/shared/utils/cn'

interface SupplierInfoBarProps {
  supplier: Supplier
}

export function SupplierInfoBar({ supplier }: SupplierInfoBarProps) {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const { data: linkedServices = [] } = useSupplierLinkedServices(supplier.id)

  return (
    <TravelCard className="animate-fade-in" contentClassName="p-0 sm:p-0">
      <div className="px-3 py-2 sm:px-4">
        <div className="grid items-start gap-3 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-y-2">
        <div className="min-w-0">
          <h2 className={cn('mb-0.5 flex items-center gap-1.5 leading-tight', layout.entityTitle)}>
            <span className="truncate">{supplierPrimaryLabel(supplier)}</span>
            <Link
              to={`/suppliers/${supplier.id}/profile`}
              aria-label="Edit supplier profile"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-accent)] hover:bg-[var(--color-surface-muted)] sm:h-auto sm:w-auto sm:p-0"
            >
              <Pencil className="h-3 w-3" />
            </Link>
          </h2>
          <p className={cn('flex flex-wrap items-center gap-1.5 leading-snug', layout.caption)}>
            <span>ID: {supplier.reference}</span>
            <span className="text-[var(--color-border-strong)]">·</span>
            <SupplierStatusBadge status={supplier.status} />
            <span className="text-[var(--color-border-strong)]">·</span>
            <span>{SUPPLIER_CATEGORY_LABELS[supplier.category]}</span>
            {supplier.city ? (
              <>
                <span className="text-[var(--color-border-strong)]">·</span>
                <span className="truncate">{supplier.city}</span>
              </>
            ) : null}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-[var(--color-border)] pt-3 sm:flex sm:items-stretch sm:gap-8 sm:border-0 sm:pt-0 lg:gap-16">
          <MetricBlock label="Linked services" value={String(linkedServices.length)} />
          <div aria-hidden className="hidden w-px shrink-0 bg-[var(--color-border)] sm:block" />
          <MetricBlock label="Display name" value={supplier.displayName} />
        </div>
        </div>
      </div>
      <WorkspaceEntityLabels targetType="supplier" targetId={supplier.id} role={role} />
    </TravelCard>
  )
}

function MetricBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 flex-1 px-1">
      <div className={cn('mb-1 leading-tight', layout.statLabel)}>{label}</div>
      <div className="truncate text-base font-bold text-[var(--color-accent)]">{value}</div>
    </div>
  )
}
