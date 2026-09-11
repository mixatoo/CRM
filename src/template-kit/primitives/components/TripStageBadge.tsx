import type { TripStage } from '../types/domain-entities'
import { TRIP_STAGE_LABELS } from '../types/domain-entities'
import { TRIP_STAGE_CHIP_SIZE, TRIP_STAGE_VISUAL } from './trip-stage-styles'
import { cn } from '../utils/cn'

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
        TRIP_STAGE_CHIP_SIZE,
        visual.shell,
        visual.text,
        className,
      )}
    >
      <span className="truncate">{TRIP_STAGE_LABELS[stage]}</span>
    </span>
  )
}
