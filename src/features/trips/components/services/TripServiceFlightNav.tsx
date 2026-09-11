import { Link } from 'react-router-dom'
import { Plane, ScrollText } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

export type TripServiceFlightView = 'overview' | 'flight' | 'operations'

interface TripServiceFlightNavProps {
  tripId: string
  serviceId: string
  active: TripServiceFlightView
  className?: string
}

const TAB_CLASS =
  'inline-flex h-6 items-center gap-1 rounded-[var(--radius-sm)] px-2 text-[11px] font-medium leading-none transition-colors'

export function TripServiceFlightNav({ tripId, serviceId, active, className }: TripServiceFlightNavProps) {
  const base = `/trips/${tripId}/services/${serviceId}`

  return (
    <nav className={cn('inline-flex items-center gap-0.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]/60 p-0.5', className)}>
      <Link
        to={base}
        className={cn(
          TAB_CLASS,
          active === 'overview'
            ? 'bg-[var(--color-surface)] text-[var(--color-foreground)] shadow-sm'
            : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]',
        )}
        aria-current={active === 'overview' ? 'page' : undefined}
      >
        Overview
      </Link>
      <Link
        to={`${base}/flight`}
        className={cn(
          TAB_CLASS,
          active === 'flight'
            ? 'bg-[var(--color-surface)] text-[var(--color-foreground)] shadow-sm'
            : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]',
        )}
        aria-current={active === 'flight' ? 'page' : undefined}
      >
        <Plane className="h-3 w-3" aria-hidden />
        Flight
      </Link>
      <Link
        to={`${base}/operations`}
        className={cn(
          TAB_CLASS,
          active === 'operations'
            ? 'bg-[var(--color-surface)] text-[var(--color-foreground)] shadow-sm'
            : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]',
        )}
        aria-current={active === 'operations' ? 'page' : undefined}
      >
        <ScrollText className="h-3 w-3" aria-hidden />
        Transactions
      </Link>
    </nav>
  )
}
