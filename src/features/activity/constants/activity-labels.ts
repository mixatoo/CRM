import type { TripActivityType } from '@/domain/entities/trip-activity'

export const ACTIVITY_TYPE_LABELS: Record<TripActivityType, string> = {
  trip: 'Trip',
  service: 'Service',
  invoice: 'Invoice',
  payment: 'Payment',
  client: 'Client',
}

export const ACTIVITY_TYPE_TONE: Record<TripActivityType, string> = {
  trip: 'text-[var(--color-accent)]',
  service: 'text-[var(--color-foreground)]',
  invoice: 'text-[var(--color-warning)]',
  payment: 'text-[var(--color-success)]',
  client: 'text-[var(--color-muted)]',
}

export function formatActivityAction(action: string) {
  return action.replace(/_/g, ' ')
}
