import { TRIP_SERVICE_STATUS_LABELS, type TripServiceStatus } from '@/domain/entities/trip-service'
import { TRIP_SERVICE_STATUS_VISUAL } from '@/features/trips/components/services/service-styles'
import { cn } from '@/shared/utils/cn'

const BADGE_SIZE_CLASS = 'h-6 w-[6.5rem]'

interface TripServiceStatusBadgeProps {
  status: TripServiceStatus
  className?: string
}

export function TripServiceStatusBadge({ status, className }: TripServiceStatusBadgeProps) {
  const visual = TRIP_SERVICE_STATUS_VISUAL[status]

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border px-2 text-center text-xs font-normal leading-none',
        BADGE_SIZE_CLASS,
        visual.shell,
        visual.text,
        className,
      )}
    >
      <span className={cn('size-1.5 shrink-0 rounded-full', visual.dot)} aria-hidden />
      <span className="truncate">{TRIP_SERVICE_STATUS_LABELS[status]}</span>
    </span>
  )
}
