export interface TripItineraryNote {
  id: string
  tripId: string
  /** Calendar day key (`YYYY-MM-DD`) or `__unscheduled__`. */
  dayKey: string
  sortOrder: number
  title: string
  body?: string
  timeLabel?: string
  createdAt: string
  updatedAt: string
}

export const ITINERARY_UNSCHEDULED_DAY_KEY = '__unscheduled__'
