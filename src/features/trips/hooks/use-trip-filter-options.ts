import { useQuery } from '@tanstack/react-query'
import type { TripStage } from '@/domain/entities'
import { TRIP_STAGE_LABELS } from '@/domain/entities'
import { appContainer } from '@/app/container'

function tripDestination(trip: { destination?: string; branch: string }) {
  return trip.destination ?? trip.branch
}

function tripClientName(trip: { mainContactName?: string }) {
  return trip.mainContactName?.trim() ?? ''
}

function tripDateIso(trip: { startDate?: string; bookingStartedAt: string }) {
  return trip.startDate ?? trip.bookingStartedAt
}

function isPipelineTrip(stage: TripStage) {
  return stage !== 'closed' && stage !== 'lost'
}

function modeStage(stages: TripStage[]): TripStage | undefined {
  const counts = new Map<TripStage, number>()
  for (const stage of stages) {
    counts.set(stage, (counts.get(stage) ?? 0) + 1)
  }
  let best: TripStage | undefined
  let bestCount = 0
  for (const [stage, count] of counts) {
    if (count > bestCount) {
      best = stage
      bestCount = count
    }
  }
  return best
}

export interface TripFilterOptionItem {
  value: string
  count: number
  activeCount: number
  topStage?: TripStage
}

export interface TripFilterOptionsData {
  totalTrips: number
  owners: TripFilterOptionItem[]
  clients: TripFilterOptionItem[]
  destinations: TripFilterOptionItem[]
  dateBounds: { min: string; max: string } | null
}

export function useTripFilterOptions() {
  return useQuery({
    queryKey: ['trips', 'filter-options'],
    queryFn: async (): Promise<TripFilterOptionsData> => {
      const trips = await appContainer.uow.trips.findAll()

      const ownerMap = new Map<string, { count: number; activeCount: number }>()
      const clientMap = new Map<string, { count: number; activeCount: number }>()
      const destinationMap = new Map<string, { count: number; activeCount: number; stages: TripStage[] }>()
      let minDate: string | null = null
      let maxDate: string | null = null

      for (const trip of trips) {
        const owner = trip.ownerName
        const ownerEntry = ownerMap.get(owner) ?? { count: 0, activeCount: 0 }
        ownerEntry.count += 1
        if (isPipelineTrip(trip.stage)) ownerEntry.activeCount += 1
        ownerMap.set(owner, ownerEntry)

        const client = tripClientName(trip)
        if (client) {
          const clientEntry = clientMap.get(client) ?? { count: 0, activeCount: 0 }
          clientEntry.count += 1
          if (isPipelineTrip(trip.stage)) clientEntry.activeCount += 1
          clientMap.set(client, clientEntry)
        }

        const destination = tripDestination(trip)
        const destinationEntry = destinationMap.get(destination) ?? { count: 0, activeCount: 0, stages: [] }
        destinationEntry.count += 1
        destinationEntry.stages.push(trip.stage)
        if (isPipelineTrip(trip.stage)) destinationEntry.activeCount += 1
        destinationMap.set(destination, destinationEntry)

        const dateIso = tripDateIso(trip).slice(0, 10)
        if (!minDate || dateIso < minDate) minDate = dateIso
        if (!maxDate || dateIso > maxDate) maxDate = dateIso
      }

      const owners = [...ownerMap.entries()]
        .map(([value, stats]) => ({ value, ...stats }))
        .sort((a, b) => a.value.localeCompare(b.value))

      const clients = [...clientMap.entries()]
        .map(([value, stats]) => ({ value, ...stats }))
        .sort((a, b) => a.value.localeCompare(b.value))

      const destinations = [...destinationMap.entries()]
        .map(([value, stats]) => ({
          value,
          count: stats.count,
          activeCount: stats.activeCount,
          topStage: modeStage(stats.stages),
        }))
        .sort((a, b) => a.value.localeCompare(b.value))

      return {
        totalTrips: trips.length,
        owners,
        clients,
        destinations,
        dateBounds: minDate && maxDate ? { min: minDate, max: maxDate } : null,
      }
    },
    staleTime: 60_000,
  })
}

export function countActivePanelFilters(filters: {
  owner: string
  client: string
  destination: string
  dateFrom: string
  dateTo: string
  labelIds: string[]
}) {
  let count = 0
  if (filters.owner !== 'all') count += 1
  if (filters.client !== 'all') count += 1
  if (filters.destination !== 'all') count += 1
  if (filters.dateFrom) count += 1
  if (filters.dateTo) count += 1
  if ((filters.labelIds?.length ?? 0) > 0) count += 1
  return count
}

export function stageFilterLabel(stage: TripStage) {
  return TRIP_STAGE_LABELS[stage]
}
