import { ArrowLeft, Save } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { TripService } from '@/domain/entities/trip-service'
import { formatServiceCategory } from '@/domain/entities/trip-service'
import { Button } from '@/design-system/components/Button'
import { layout } from '@/design-system/tokens/layout'
import {
  TripServiceFlightNav,
  type TripServiceFlightView,
} from '@/features/trips/components/services/TripServiceFlightNav'
import { TripServiceStatusBadge } from '@/features/trips/components/services/TripServiceStatusBadge'
import {
  TRIP_SERVICE_CATEGORY_ICON,
  TRIP_SERVICE_CATEGORY_SHELL,
  TRIP_SERVICE_CATEGORY_VISUAL,
} from '@/features/trips/components/services/service-styles'
import { formatCount } from '@/features/trips/utils/format'
import { cn } from '@/shared/utils/cn'

interface TripServiceDetailToolbarProps {
  tripId: string
  service: TripService
  activeView?: TripServiceFlightView
  onSave?: () => void
  canSave?: boolean
  isSaving?: boolean
}

function ToolbarDivider() {
  return <span className="shrink-0 text-[var(--color-border-strong)]" aria-hidden>·</span>
}

export function TripServiceDetailToolbar({
  tripId,
  service,
  activeView = 'overview',
  onSave,
  canSave = false,
  isSaving = false,
}: TripServiceDetailToolbarProps) {
  const CategoryIcon = TRIP_SERVICE_CATEGORY_ICON[service.category]
  const categoryLabel = formatServiceCategory(service.category)
  const canceled = service.status === 'canceled'
  const meta = [
    `Line ${formatCount(service.lineNumber)}`,
    service.supplierName,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div
      className={cn(
        'flex flex-nowrap items-center gap-2 overflow-x-auto px-2 py-2 sm:gap-2.5 sm:px-3',
        layout.hideScrollbar,
      )}
    >
      <Button asChild variant="secondary" size="sm" className="h-7 shrink-0 gap-1 px-2 font-normal">
        <Link to={`/trips/${tripId}/services`}>
          <ArrowLeft className="h-3.5 w-3.5" />
          Services
        </Link>
      </Button>

      <span
        className={cn(
          'inline-flex shrink-0 items-center gap-1 rounded-[var(--radius-sm)] border px-1.5 py-0.5',
          TRIP_SERVICE_CATEGORY_SHELL[service.category],
        )}
      >
        <CategoryIcon
          className={cn('h-3 w-3 shrink-0', TRIP_SERVICE_CATEGORY_VISUAL[service.category])}
          aria-hidden
        />
        <span
          className={cn(
            'text-[11px] font-semibold leading-none',
            TRIP_SERVICE_CATEGORY_VISUAL[service.category],
          )}
        >
          {categoryLabel}
        </span>
      </span>

      <h1
        className={cn(
          'min-w-0 shrink truncate text-sm font-semibold leading-none text-[var(--color-foreground)]',
          canceled && 'text-[var(--color-muted)] line-through decoration-[var(--color-muted)]',
        )}
        title={service.name}
      >
        {service.name}
      </h1>

      {meta ? (
        <>
          <ToolbarDivider />
          <p className={cn('shrink-0 whitespace-nowrap leading-none', layout.caption)}>{meta}</p>
        </>
      ) : null}

      {service.category === 'flight' ? (
        <TripServiceFlightNav tripId={tripId} serviceId={service.id} active={activeView} className="shrink-0" />
      ) : null}

      <div className="ml-auto flex shrink-0 items-center gap-2 pl-1">
        {onSave ? (
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="h-7 gap-1 px-2 font-normal"
            disabled={!canSave || isSaving}
            onClick={onSave}
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        ) : null}
        <TripServiceStatusBadge status={service.status} />
      </div>
    </div>
  )
}
