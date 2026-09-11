export type TripServiceStatus = 'proposal' | 'confirmed' | 'canceled'

export const TRIP_SERVICE_STATUS_LABELS: Record<TripServiceStatus, string> = {
  proposal: 'Proposal',
  confirmed: 'Confirmed',
  canceled: 'Canceled',
}

export type ServiceCategory =
  | 'activity'
  | 'cruise'
  | 'flight'
  | 'insurance'
  | 'lodging'
  | 'restaurant'
  | 'tour'