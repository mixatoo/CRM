import type {
  TripPipelineStage,
  TripStage,
  TripTerminalStage,
} from '@/domain/entities/trip'
import {
  TRIP_PIPELINE_STAGES,
  TRIP_STAGE_LABELS,
  TRIP_TERMINAL_STAGES,
  isTripPipelineStage,
  isTripTerminalStage,
  resolveTripPipelineAnchor,
  tripStageChangePatch,
} from '@/domain/entities/trip'

export type TransferKind =
  | 'airport_transfer'
  | 'point_to_point'
  | 'disposal'
  | 'multi_destination'

export type TransferStage = TripStage
export type TransferPipelineStage = TripPipelineStage
export type TransferTerminalStage = TripTerminalStage

export type TransferWorkspaceTab =
  | 'route'
  | 'service'
  | 'passengers'
  | 'fleet'
  | 'cost'
  | 'notes'
  | 'activity'

export interface Transfer {
  id: string
  reference: string
  kind: TransferKind
  stage: TransferStage
  lastPipelineStage?: TransferPipelineStage
  tripId?: string
  tripReference?: string
  clientName?: string
  supplierId?: string
  supplierName?: string
  pickupLocation: string
  dropoffLocation: string
  serviceDate?: string
  serviceTime?: string
  vehicleType?: string
  vehiclePlate?: string
  driverName?: string
  passengerCount: number
  passengerNames?: string
  currency: string
  sellingPrice: number
  supplierCost: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export const TRANSFER_KINDS: TransferKind[] = [
  'airport_transfer',
  'point_to_point',
  'disposal',
  'multi_destination',
]

export const TRANSFER_KIND_LABELS: Record<TransferKind, string> = {
  airport_transfer: 'Airport Transfer',
  point_to_point: 'Point-To-Point',
  disposal: 'Disposal',
  multi_destination: 'Multi Destinations',
}

export const TRANSFER_KIND_SHORT: Record<TransferKind, string> = {
  airport_transfer: 'APTT',
  point_to_point: 'PTOP',
  disposal: 'DSPL',
  multi_destination: 'MLTI',
}

export const TRANSFER_PIPELINE_STAGES = TRIP_PIPELINE_STAGES
export const TRANSFER_TERMINAL_STAGES = TRIP_TERMINAL_STAGES
export const TRANSFER_STAGE_LABELS = TRIP_STAGE_LABELS

export const TRANSFER_VEHICLE_TYPES = [
  'Mercedes E-Class',
  'Mercedes S-Class',
  'Mercedes V-Class',
  'BMW 5 Series',
  'Cadillac Escalade',
  'Toyota Hiace',
  'Mercedes Sprinter',
  'Bus',
  'Other',
] as const

export function transferPrimaryLabel(transfer: Pick<Transfer, 'pickupLocation' | 'dropoffLocation' | 'kind'>): string {
  const from = transfer.pickupLocation.trim()
  const to = transfer.dropoffLocation.trim()
  if (from && to) return `${from} → ${to}`
  if (from) return from
  if (to) return to
  return TRANSFER_KIND_LABELS[transfer.kind]
}

export function isTransferPipelineStage(stage: TransferStage): stage is TransferPipelineStage {
  return isTripPipelineStage(stage)
}

export function isTransferTerminalStage(stage: TransferStage): stage is TransferTerminalStage {
  return isTripTerminalStage(stage)
}

export function resolveTransferPipelineAnchor(
  transfer: Pick<Transfer, 'stage' | 'lastPipelineStage'>,
): TransferPipelineStage {
  return resolveTripPipelineAnchor(transfer)
}

export function transferStageChangePatch(
  transfer: Pick<Transfer, 'stage' | 'lastPipelineStage'>,
  nextStage: TransferStage,
): Pick<Transfer, 'stage' | 'lastPipelineStage'> {
  return tripStageChangePatch(transfer, nextStage)
}

export function transferMargin(transfer: Pick<Transfer, 'sellingPrice' | 'supplierCost'>): number {
  return Math.max(0, transfer.sellingPrice - transfer.supplierCost)
}
