import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { appContainer } from '@/app/container'
import type { Trip, TripStage } from '@/domain/entities'
import { useToast } from '@/design-system/components/Toast'
import { logTripActivity } from '@/infrastructure/database/trip-sync'
import {
  buildNewTrip,
  nextTripReference,
  type TripFormInput,
} from '@/features/trips/utils/create-trip'

async function cloneTripRecord(trip: Trip): Promise<Trip> {
  const all = await appContainer.uow.trips.findAll()
  const maxRef = all.reduce((max, item) => Math.max(max, Number.parseInt(item.reference, 10) || 0), 0)
  const now = new Date().toISOString()

  const rest = (({ id, createdAt, updatedAt, reference, ...keep }) => keep)(trip)

  return appContainer.uow.trips.create({
    ...rest,
    reference: String(maxRef + 1),
    name: `${trip.name} (Copy)`,
    stage: 'draft',
    createdAt: now,
    updatedAt: now,
  })
}

async function bulkDeleteTripIds(tripIds: string[]): Promise<number> {
  await Promise.all(tripIds.map((id) => appContainer.uow.trips.delete(id)))
  return tripIds.length
}

async function bulkCloneTripIds(tripIds: string[]): Promise<number> {
  const trips = (
    await Promise.all(tripIds.map((id) => appContainer.uow.trips.findById(id)))
  ).filter((trip): trip is Trip => trip != null)

  for (const trip of trips) {
    await cloneTripRecord(trip)
  }

  return trips.length
}

async function bulkUpdateTripIds({
  tripIds,
  patch,
}: {
  tripIds: string[]
  patch: Pick<Trip, 'stage'>
}): Promise<number> {
  const now = new Date().toISOString()
  await Promise.all(
    tripIds.map((id) => appContainer.uow.trips.update(id, { ...patch, updatedAt: now })),
  )
  return tripIds.length
}

export function useTripMutations() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { toast } = useToast()

  const invalidateTrips = () => {
    void queryClient.invalidateQueries({ queryKey: ['trips'] })
  }

  const deleteMutation = useMutation({
    mutationFn: (tripId: string) => appContainer.uow.trips.delete(tripId),
    onSuccess: () => {
      invalidateTrips()
      toast({ intent: 'deleted', title: 'Trip removed from workspace' })
    },
    onError: () => {
      toast({ intent: 'failed', title: 'Delete failed', description: 'The trip could not be removed.' })
    },
  })

  const cloneMutation = useMutation({
    mutationFn: cloneTripRecord,
    onSuccess: (cloned) => {
      invalidateTrips()
      toast({
        intent: 'cloned',
        title: cloned.name,
        description: `#${cloned.reference}`,
      })
      navigate(`/trips/${cloned.id}/dashboard`)
    },
    onError: () => {
      toast({ intent: 'failed', title: 'Clone failed', description: 'The trip could not be duplicated.' })
    },
  })

  const createMutation = useMutation({
    mutationFn: async ({
      input,
      initialStage,
    }: {
      input: TripFormInput
      initialStage?: TripStage
    }) => {
      const reference = await nextTripReference()
      const base = buildNewTrip(input, reference)
      const trip = await appContainer.uow.trips.create(
        initialStage ? { ...base, stage: initialStage } : base,
      )
      await logTripActivity({
        tripId: trip.id,
        type: 'trip',
        action: 'trip_created',
        summary:
          initialStage === 'proposal'
            ? 'Quote workspace opened for client inquiry.'
            : 'New trip workspace created.',
        actorName: input.ownerName.trim() || undefined,
      })
      return trip
    },
    onSuccess: (trip) => {
      invalidateTrips()
      void queryClient.invalidateQueries({ queryKey: ['clients', trip.clientId, 'dashboard'] })
      void queryClient.invalidateQueries({ queryKey: ['clients', trip.clientId, 'linked-trips'] })
      void queryClient.invalidateQueries({ queryKey: ['clients', trip.clientId, 'linked-services'] })
      void queryClient.invalidateQueries({ queryKey: ['trip-activities', trip.id] })
      toast({
        intent: 'updated',
        title: 'Trip created',
        description: `#${trip.reference} · ${trip.name}`,
      })
      navigate(`/trips/${trip.id}/dashboard`)
    },
    onError: () => {
      toast({ intent: 'failed', title: 'Could not create trip', description: 'Please try again.' })
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: bulkDeleteTripIds,
    onSuccess: (count) => {
      invalidateTrips()
      toast({
        intent: 'deleted',
        title: count === 1 ? '1 trip removed' : `${count} trips removed`,
      })
    },
    onError: () => {
      toast({
        intent: 'failed',
        title: 'Bulk delete failed',
        description: 'Selected trips could not be removed.',
      })
    },
  })

  const bulkCloneMutation = useMutation({
    mutationFn: bulkCloneTripIds,
    onSuccess: (count) => {
      invalidateTrips()
      toast({
        intent: 'cloned',
        title: count === 1 ? '1 trip cloned' : `${count} trips cloned`,
        description: 'Draft copies were created.',
      })
    },
    onError: () => {
      toast({
        intent: 'failed',
        title: 'Bulk clone failed',
        description: 'Selected trips could not be duplicated.',
      })
    },
  })

  const bulkUpdateMutation = useMutation({
    mutationFn: bulkUpdateTripIds,
    onSuccess: (count) => {
      invalidateTrips()
      toast({
        intent: 'updated',
        title: count === 1 ? '1 trip updated' : `${count} trips updated`,
        description: 'Stage changes were applied.',
      })
    },
    onError: () => {
      toast({
        intent: 'failed',
        title: 'Bulk update failed',
        description: 'Selected trips could not be updated.',
      })
    },
  })

  return {
    createTrip: createMutation.mutate,
    deleteTrip: deleteMutation.mutate,
    cloneTrip: cloneMutation.mutate,
    bulkDeleteTrips: bulkDeleteMutation.mutate,
    bulkCloneTrips: bulkCloneMutation.mutate,
    bulkUpdateTrips: bulkUpdateMutation.mutate,
    deletingTripId: deleteMutation.isPending ? deleteMutation.variables : undefined,
    cloningTripId: cloneMutation.isPending ? cloneMutation.variables?.id : undefined,
    isCreating: createMutation.isPending,
    isBulkPending:
      bulkDeleteMutation.isPending || bulkCloneMutation.isPending || bulkUpdateMutation.isPending,
  }
}
