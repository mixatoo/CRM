import { formatServiceCategory } from '@/domain/entities/trip-service'
import type { ServiceCategory } from '@/domain/entities'
import {
  TRIP_SERVICE_CATEGORY_ICON,
  TRIP_SERVICE_CATEGORY_VISUAL,
} from '@/features/trips/components/services/service-styles'
import { cn } from '@/shared/utils/cn'

interface TripServiceCategoryLabelProps {
  category: ServiceCategory
  className?: string
}

export function TripServiceCategoryLabel({ category, className }: TripServiceCategoryLabelProps) {
  const Icon = TRIP_SERVICE_CATEGORY_ICON[category]

  return (
    <span className={cn('inline-flex min-w-0 items-center gap-1.5', className)}>
      <Icon className={cn('h-3.5 w-3.5 shrink-0', TRIP_SERVICE_CATEGORY_VISUAL[category])} aria-hidden />
      <span className="truncate text-sm text-[var(--color-foreground)]">
        {formatServiceCategory(category)}
      </span>
    </span>
  )
}
