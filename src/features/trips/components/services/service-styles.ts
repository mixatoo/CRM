import type { ServiceCategory } from '@/domain/entities'
import type { TripServiceStatus } from '@/domain/entities/trip-service'
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

export const TRIP_SERVICE_STATUS_ROW_ACCENT: Record<TripServiceStatus, string> = {
  proposal: 'border-l-[var(--color-warning)]',
  confirmed: 'border-l-[var(--color-success)]',
  canceled: 'border-l-[var(--color-border-strong)]',
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

export const TRIP_SERVICE_FINANCIAL_AMOUNT = {
  grid: 'grid-cols-[1.75rem_minmax(0,1fr)] gap-x-1',
  currency: 'text-xs',
  amount: 'text-xs',
} as const

export const TRIP_SERVICE_COMMERCIAL_HEAD =
  'border-l border-[var(--color-border)]/70 bg-[var(--color-surface-muted)]/55'

export const TRIP_SERVICE_FINANCIAL_HEAD =
  'border-l border-[var(--color-border)]/70 bg-[var(--color-surface-muted)]/40'

export const TRIP_SERVICE_FINANCIAL_COST_CELL =
  'border-l border-[var(--color-border)]/45 bg-[var(--color-surface-muted)]/28'

export const TRIP_SERVICE_FINANCIAL_SELLING_CELL =
  'border-l border-[var(--color-border)]/45 bg-[var(--color-accent-muted)]/16'

export const TRIP_SERVICE_FINANCIAL_MARGIN_CELL =
  'border-x border-[var(--color-border)]/45 bg-[var(--color-surface-muted)]/18'

export const TRIP_SERVICE_CATEGORY_BORDER: Record<ServiceCategory, string> = {
  activity: 'border-[var(--color-info)]',
  cruise: 'border-[var(--color-accent)]',
  flight: 'border-[var(--color-accent)]',
  insurance: 'border-[var(--color-border-strong)]',
  lodging: 'border-[var(--color-vip)]',
  restaurant: 'border-[var(--color-warning)]',
  tour: 'border-[var(--color-success)]',
}
