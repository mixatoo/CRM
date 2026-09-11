export type TripActivityType = 'trip' | 'service' | 'invoice' | 'payment' | 'client'

export interface TripActivity {
  id: string
  tripId: string
  type: TripActivityType
  action: string
  summary: string
  actorName?: string
  createdAt: string
}
