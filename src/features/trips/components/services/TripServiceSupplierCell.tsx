import { cn } from '@/shared/utils/cn'

interface TripServiceSupplierCellProps {
  name?: string
  className?: string
}

function supplierInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function TripServiceSupplierCell({ name, className }: TripServiceSupplierCellProps) {
  const label = name?.trim() || '—'
  const hasSupplier = label !== '—'

  return (
    <div className={cn('flex min-w-0 items-center gap-2', className)} title={label}>
      <span
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold leading-none',
          hasSupplier
            ? 'border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-muted)]'
            : 'border-[var(--color-border)]/60 bg-transparent text-[var(--color-subtle)]',
        )}
        aria-hidden
      >
        {hasSupplier ? supplierInitials(label) : '—'}
      </span>
      <span className="min-w-0 truncate text-xs text-[var(--color-muted)]">{label}</span>
    </div>
  )
}
