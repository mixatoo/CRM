import type { TripServiceStatus } from '../../primitives/types/domain-trip-service'

export type { TripServiceStatus } from '../../primitives/types/domain-trip-service'
export { TRIP_SERVICE_STATUS_LABELS } from '../../primitives/types/domain-trip-service'

export const TRIP_SERVICE_STATUSES: TripServiceStatus[] = ['proposal', 'confirmed', 'canceled']
