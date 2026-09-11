import { formatServiceCategory } from '@/domain/entities/trip-service'
import type { ServiceCategory } from '@/domain/entities'
import {
  TRIP_SERVICE_CATEGORY_ICON,
  TRIP_SERVICE_CATEGORY_SHELL,
  TRIP_SERVICE_CATEGORY_VISUAL,
} from '@/features/trips/components/services/service-styles'
import { cn } from '@/shared/utils/cn'

interface TripServiceIdentityCellProps {
  category: ServiceCategory
  name: string
  canceled?: boolean
  className?: string
}

export function TripServiceIdentityCell({ category, name, canceled, className }: TripServiceIdentityCellProps) {
  const Icon = TRIP_SERVICE_CATEGORY_ICON[category]
  const categoryLabel = formatServiceCategory(category)

  return (
    <div className={cn('min-w-0', className)} title={`${categoryLabel} — ${name}`}>
      <span
        className={cn(
          'inline-flex max-w-full items-center gap-1 rounded-[var(--radius-sm)] border px-1.5 py-0.5',
          TRIP_SERVICE_CATEGORY_SHELL[category],
        )}
      >
        <Icon className={cn('h-3 w-3 shrink-0', TRIP_SERVICE_CATEGORY_VISUAL[category])} aria-hidden />
        <span className={cn('truncate text-[11px] font-semibold leading-none', TRIP_SERVICE_CATEGORY_VISUAL[category])}>
          {categoryLabel}
        </span>
      </span>
      <p
        className={cn(
          'mt-1.5 truncate text-xs leading-snug text-[var(--color-muted)]',
          canceled && 'line-through decoration-[var(--color-muted)]',
        )}
      >
        {name}
      </p>
    </div>
  )
}
