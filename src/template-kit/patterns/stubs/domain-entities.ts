export type TripStage =
  | 'draft'
  | 'proposal'
  | 'negotiation'
  | 'confirmed'
  | 'upcoming'
  | 'active'
  | 'recent'
  | 'closed'
  | 'lost'

export type TripPipelineStage = Exclude<TripStage, 'closed' | 'lost'>

export type ServiceCategory =
  | 'activity'
  | 'cruise'
  | 'flight'
  | 'insurance'
  | 'lodging'
  | 'restaurant'
  | 'tour'

export interface ServiceCategoryCounts {
  category: ServiceCategory
  proposal: number
  confirmed: number
  canceled: number
}

export interface Trip {
  id: string
  reference: string
  name: string
  ownerName: string
  ownerId?: string
  branch: string
  destination?: string
  stage: TripStage
  tripType?: string
  currency: string
  totalCost: number
  totalCommission: number
  clientPaidAmount: number
  supplierBalanceDue: number
  adults: number
  minors: number
  bookingStartedAt: string
  startDate?: string
  endDate?: string
  mainContactName?: string
  mainContactEmail?: string
  agentName?: string
  agentEmail?: string
  serviceBreakdown: ServiceCategoryCounts[]
  createdAt: string
  updatedAt: string
}

export const TRIP_PIPELINE_STAGES: TripPipelineStage[] = [
  'draft',
  'proposal',
  'negotiation',
  'confirmed',
  'upcoming',
  'active',
  'recent',
]

export const TRIP_STAGES: TripStage[] = [...TRIP_PIPELINE_STAGES, 'closed', 'lost']

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  'activity',
  'cruise',
  'flight',
  'insurance',
  'lodging',
  'restaurant',
  'tour',
]

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  activity: 'Activity',
  cruise: 'Cruise',
  flight: 'Flight',
  insurance: 'Insurance',
  lodging: 'Lodging',
  restaurant: 'Restaurant',
  tour: 'Tour',
}
