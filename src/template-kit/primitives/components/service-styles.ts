import {
  Activity,
  Anchor,
  Building2,
  MapPinned,
  Plane,
  ShieldCheck,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import type { ServiceCategory, TripServiceStatus } from '../types/domain-trip-service'

export const TRIP_SERVICE_STATUS_VISUAL: Record<
  TripServiceStatus,
  { shell: string; text: string; dot: string }
> = {
  proposal: {
    shell: 'border-[var(--color-warning)]/30 bg-[var(--color-warning-muted)]',
    text: 'text-[var(--color-warning)]',
    dot: 'bg-[var(--color-warning)]',
  },
  confirmed: {
    shell: 'border-[var(--color-success)]/30 bg-[var(--color-success-muted)]',
    text: 'text-[var(--color-success)]',
    dot: 'bg-[var(--color-success)]',
  },
  canceled: {
    shell: 'border-[var(--color-border)] bg-[var(--color-surface-muted)]',
    text: 'text-[var(--color-muted)]',
    dot: 'bg-[var(--color-muted)]',
  },
}

export const TRIP_SERVICE_CATEGORY_ICON: Record<ServiceCategory, LucideIcon> = {
  activity: Activity,
  cruise: Anchor,
  flight: Plane,
  insurance: ShieldCheck,
  lodging: Building2,
  restaurant: UtensilsCrossed,
  tour: MapPinned,
}

export const TRIP_SERVICE_CATEGORY_VISUAL: Record<ServiceCategory, string> = {
  activity: 'text-[var(--color-info)]',
  cruise: 'text-[var(--color-accent)]',
  flight: 'text-[var(--color-accent)]',
  insurance: 'text-[var(--color-muted)]',
  lodging: 'text-[var(--color-vip)]',
  restaurant: 'text-[var(--color-warning)]',
  tour: 'text-[var(--color-success)]',
}

export const TRIP_SERVICE_CATEGORY_SHELL: Record<ServiceCategory, string> = {
  activity: 'border-[var(--color-info)]/25 bg-[var(--color-info-muted)]',
  cruise: 'border-[var(--color-accent)]/25 bg-[var(--color-accent-muted)]',
  flight: 'border-[var(--color-accent)]/25 bg-[var(--color-accent-muted)]',
  insurance: 'border-[var(--color-border)] bg-[var(--color-surface-muted)]',
  lodging: 'border-[var(--color-vip)]/25 bg-[var(--color-vip-muted)]',
  restaurant: 'border-[var(--color-warning)]/25 bg-[var(--color-warning-muted)]',
  tour: 'border-[var(--color-success)]/25 bg-[var(--color-success-muted)]',
}
