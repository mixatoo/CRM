import type { TripStage } from '@/domain/entities'
import { TRIP_STAGE_LABELS } from '@/domain/entities'
import { TRIP_STAGE_VISUAL, TRIP_STAGE_CHIP_SIZE } from '@/features/trips/components/list/trip-stage-styles'
import { cn } from '@/shared/utils/cn'

const BADGE_SIZE_CLASS = TRIP_STAGE_CHIP_SIZE

interface TripStageBadgeProps {
  stage: TripStage
  className?: string
}

export function TripStageBadge({ stage, className }: TripStageBadgeProps) {
  const visual = TRIP_STAGE_VISUAL[stage]

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-[var(--radius-sm)] border px-2 text-center text-xs font-normal leading-none',
        BADGE_SIZE_CLASS,
        visual.shell,
        visual.text,
        className,
      )}
    >
      <span className="truncate">{TRIP_STAGE_LABELS[stage]}</span>
    </span>
  )
}
