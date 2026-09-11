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

export type TripPipelineStage =
  | 'draft'
  | 'proposal'
  | 'negotiation'
  | 'confirmed'
  | 'upcoming'
  | 'active'
  | 'recent'

export type TripTerminalStage = 'closed' | 'lost'

export type TripWorkspaceTab =
  | 'dashboard'
  | 'clients'
  | 'services'
  | 'itinerary'
  | 'documents'
  | 'payments'
  | 'revenue'
  | 'tasks'
  | 'changelog'

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
  /** Pipeline step preserved when the trip is marked lost (or closed). */
  lastPipelineStage?: TripPipelineStage
  tripType?: string
  currency: string
  totalCost: number
  totalCommission: number
  /** Client sale price; defaults to totalCost when omitted. */
  totalSelling?: number
  /** Supplier / land cost; defaults to totalCost − commission when omitted. */
  totalSupplierCost?: number
  clientPaidAmount: number
  supplierBalanceDue: number
  adults: number
  minors: number
  bookingStartedAt: string
  startDate?: string
  endDate?: string
  mainContactName?: string
  mainContactEmail?: string
  /** Link to global client directory record */
  clientId?: string
  agentName?: string
  agentEmail?: string
  serviceBreakdown: ServiceCategoryCounts[]
  createdAt: string
  updatedAt: string
}

/** Ordered in-progress pipeline steps (excludes terminal outcomes). */
export const TRIP_PIPELINE_STAGES: TripPipelineStage[] = [
  'draft',
  'proposal',
  'negotiation',
  'confirmed',
  'upcoming',
  'active',
  'recent',
]

export const TRIP_TERMINAL_STAGES: TripTerminalStage[] = ['closed', 'lost']

/** All trip statuses in lifecycle order. */
export const TRIP_STAGES: TripStage[] = [...TRIP_PIPELINE_STAGES, ...TRIP_TERMINAL_STAGES]

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

export const TRIP_STAGE_LABELS: Record<TripStage, string> = {
  draft: 'Draft',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  confirmed: 'Confirmed',
  upcoming: 'Upcoming',
  active: 'Active',
  recent: 'Recent',
  closed: 'Closed',
  lost: 'Lost',
}

/** Stages counted as active pipeline work (excludes draft, recent, closed, and lost). */
export const TRIP_ACTIVE_STAGES = [
  'proposal',
  'negotiation',
  'confirmed',
  'upcoming',
  'active',
] as const satisfies readonly TripStage[]

export type TripActiveStage = (typeof TRIP_ACTIVE_STAGES)[number]

export type TripProgressStage = TripStage

/** All stages shown on the workspace progress bar, in lifecycle order. */
export const TRIP_PROGRESS_STAGES = TRIP_STAGES

export function isTripActiveStage(stage: TripStage): stage is TripActiveStage {
  return (TRIP_ACTIVE_STAGES as readonly TripStage[]).includes(stage)
}

export function isTripTerminalStage(stage: TripStage): stage is TripTerminalStage {
  return (TRIP_TERMINAL_STAGES as readonly TripStage[]).includes(stage)
}

export function isTripPipelineStage(stage: TripStage): stage is TripPipelineStage {
  return (TRIP_PIPELINE_STAGES as readonly TripStage[]).includes(stage)
}

/** Pipeline position shown on the progress bar (current step or frozen anchor when lost). */
export function resolveTripPipelineAnchor(trip: Pick<Trip, 'stage' | 'lastPipelineStage'>): TripPipelineStage {
  if (isTripPipelineStage(trip.stage)) return trip.stage
  return trip.lastPipelineStage ?? 'draft'
}

export function tripStageChangePatch(
  trip: Pick<Trip, 'stage' | 'lastPipelineStage'>,
  nextStage: TripStage,
): Pick<Trip, 'stage' | 'lastPipelineStage'> {
  if (nextStage === 'lost') {
    const anchor = isTripPipelineStage(trip.stage) ? trip.stage : trip.lastPipelineStage ?? 'draft'
    return { stage: 'lost', lastPipelineStage: anchor }
  }

  if (nextStage === 'closed') {
    const anchor = isTripPipelineStage(trip.stage) ? trip.stage : trip.lastPipelineStage
    return anchor ? { stage: 'closed', lastPipelineStage: anchor } : { stage: 'closed' }
  }

  if (isTripPipelineStage(nextStage)) {
    return { stage: nextStage, lastPipelineStage: nextStage }
  }

  return { stage: nextStage }
}

export function tripStageIndex(stage: TripStage): number {
  return TRIP_STAGES.indexOf(stage)
}

export type TripClientPaymentStatus = 'Paid' | 'Partial' | 'Unpaid'

export function tripClientPaymentStatus(trip: {
  totalCost: number
  clientPaidAmount?: number
}): TripClientPaymentStatus {
  const paid = trip.clientPaidAmount ?? 0
  if (trip.totalCost <= 0 || paid <= 0) return 'Unpaid'
  if (paid >= trip.totalCost) return 'Paid'
  return 'Partial'
}

export function tripClientBalanceDue(trip: { totalCost: number; clientPaidAmount?: number }): number {
  const paid = trip.clientPaidAmount ?? 0
  return Math.max(0, trip.totalCost - paid)
}

export function tripClientPaidPercent(
  trip: Pick<Trip, 'totalCost' | 'totalSelling' | 'clientPaidAmount'>,
): number {
  const total = tripTotalSelling(trip)
  if (total <= 0) return 0
  return Math.round(((trip.clientPaidAmount ?? 0) / total) * 100)
}

export function tripTotalSelling(trip: Pick<Trip, 'totalCost' | 'totalSelling'>): number {
  return trip.totalSelling ?? trip.totalCost
}

export function tripSupplierTotalCost(
  trip: Pick<Trip, 'totalCost' | 'totalCommission' | 'totalSupplierCost'>,
): number {
  if (trip.totalSupplierCost != null) return trip.totalSupplierCost
  return Math.max(0, trip.totalCost - trip.totalCommission)
}

/** Selling price minus supplier / land cost. */
export function tripMarkUp(
  trip: Pick<Trip, 'totalCost' | 'totalSelling' | 'totalCommission' | 'totalSupplierCost'>,
): number {
  return Math.max(0, tripTotalSelling(trip) - tripSupplierTotalCost(trip))
}

/** Agency net profit (commission retained). */
export function tripNetProfit(trip: Pick<Trip, 'totalCommission'>): number {
  return trip.totalCommission
}

export function tripSupplierAmountPaid(
  trip: Pick<Trip, 'totalCost' | 'totalCommission' | 'totalSupplierCost' | 'supplierBalanceDue'>,
): number {
  const total = tripSupplierTotalCost(trip)
  const due = trip.supplierBalanceDue ?? 0
  return Math.max(0, total - due)
}

export function tripSupplierPaidPercent(
  trip: Pick<Trip, 'totalCost' | 'totalCommission' | 'totalSupplierCost' | 'supplierBalanceDue'>,
): number {
  const total = tripSupplierTotalCost(trip)
  if (total <= 0) return 0
  return Math.round((tripSupplierAmountPaid(trip) / total) * 100)
}
