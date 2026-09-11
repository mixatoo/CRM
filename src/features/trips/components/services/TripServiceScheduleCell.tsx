import type { TripService } from '@/domain/entities/trip-service'
import { formatDateParts, parseDateInput } from '@/shared/utils/date-format'
import { cn } from '@/shared/utils/cn'

interface TripServiceScheduleCellProps {
  service: TripService
  className?: string
}

function serviceDurationLabel(service: TripService) {
  if (!service.startDate || !service.endDate) return null

  const start = parseDateInput(service.startDate)
  const end = parseDateInput(service.endDate)
  if (!start || !end) return null

  const days = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1
  if (days <= 1) return null

  return service.category === 'lodging' ? `${days - 1}N` : `${days}D`
}

function formatSchedulePrimary(start?: string, end?: string) {
  const startParts = formatDateParts(start)
  if (!startParts.valid) return '—'

  if (!end || end === start) {
    return `${startParts.day} ${startParts.month} ${startParts.year}`
  }

  const endParts = formatDateParts(end)
  if (!endParts.valid) {
    return `${startParts.day} ${startParts.month} ${startParts.year}`
  }

  if (startParts.year === endParts.year && startParts.month === endParts.month) {
    return `${startParts.day}–${endParts.day} ${startParts.month} ${startParts.year}`
  }

  if (startParts.year === endParts.year) {
    return `${startParts.day} ${startParts.month} – ${endParts.day} ${endParts.month} ${startParts.year}`
  }

  return `${startParts.day} ${startParts.month} ${startParts.year} – ${endParts.day} ${endParts.month} ${endParts.year}`
}

function formatScheduleMeta(start?: string, duration?: string | null) {
  const { weekday, valid } = formatDateParts(start)
  if (!valid) return duration ?? null

  const parts = [weekday]
  if (duration) parts.push(duration)
  return parts.join(' · ')
}

export function TripServiceScheduleCell({ service, className }: TripServiceScheduleCellProps) {
  const duration = serviceDurationLabel(service)
  const primary = formatSchedulePrimary(service.startDate, service.endDate)
  const meta = formatScheduleMeta(service.startDate, duration)

  return (
    <div
      className={cn(
        'min-w-0 border-l-2 border-[var(--color-accent)]/30 pl-2',
        className,
      )}
    >
      <time
        dateTime={service.endDate ?? service.startDate}
        className="block min-w-0"
      >
        <p className="truncate text-xs font-medium tabular-nums text-[var(--color-foreground)]">{primary}</p>
        {meta ? (
          <p className="mt-0.5 truncate text-[10px] tabular-nums text-[var(--color-muted)]">{meta}</p>
        ) : null}
      </time>
    </div>
  )
}
