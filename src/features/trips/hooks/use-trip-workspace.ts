import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { appContainer } from '@/app/container'
import type { Trip, TripStage } from '@/domain/entities'
import { useToast } from '@/design-system/components/Toast'
import { logTripActivity, syncTripFinancials } from '@/infrastructure/database/trip-sync'

async function updateTripRecord({
  tripId,
  patch,
}: {
  tripId: string
  patch: Partial<Trip>
}): Promise<Trip> {
  return appContainer.uow.trips.update(tripId, { ...patch, updatedAt: new Date().toISOString() })
}

export function useTripWorkspaceMutations(tripId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['trips', tripId] })
    void queryClient.invalidateQueries({ queryKey: ['trips'] })
  }

  const updateMutation = useMutation({
    mutationFn: updateTripRecord,
    onSuccess: async (trip, variables) => {
      invalidate()
      await logTripActivity({
        tripId,
        type: 'trip',
        action: 'updated',
        summary: 'Trip details were updated.',
      })
      void queryClient.invalidateQueries({ queryKey: ['trip-activities', tripId] })
      toast({ intent: 'updated', title: 'Trip updated', description: trip.name })
      return variables
    },
    onError: () => {
      toast({ intent: 'failed', title: 'Update failed', description: 'Trip could not be saved.' })
    },
  })

  const updateStageMutation = useMutation({
    mutationFn: async (stage: TripStage) => {
      const trip = await updateTripRecord({ tripId, patch: { stage } })
      await logTripActivity({
        tripId,
        type: 'trip',
        action: 'stage_changed',
        summary: `Stage changed to ${stage}.`,
      })
      return trip
    },
    onSuccess: (trip) => {
      invalidate()
      void queryClient.invalidateQueries({ queryKey: ['trip-activities', tripId] })
      toast({ intent: 'updated', title: 'Stage updated', description: trip.stage })
    },
    onError: () => {
      toast({ intent: 'failed', title: 'Stage update failed' })
    },
  })

  const refreshFinancialsMutation = useMutation({
    mutationFn: () => syncTripFinancials(tripId),
    onSuccess: () => {
      invalidate()
      toast({ intent: 'info', title: 'Financials refreshed', description: 'Totals synced from services and payments.' })
    },
  })

  return {
    updateTrip: (patch: Partial<Trip>) => updateMutation.mutate({ tripId, patch }),
    updateTripAsync: (patch: Partial<Trip>) => updateMutation.mutateAsync({ tripId, patch }),
    updateTripStage: updateStageMutation.mutate,
    refreshFinancials: refreshFinancialsMutation.mutate,
    isUpdating: updateMutation.isPending || updateStageMutation.isPending,
  }
}

export function useTripActivities(tripId: string) {
  return useQuery({
    queryKey: ['trip-activities', tripId],
    queryFn: () => appContainer.uow.tripActivities.findByTripId(tripId),
    enabled: Boolean(tripId),
  })
}

export function useTripPayments(tripId: string) {
  return useQuery({
    queryKey: ['trip-payments', tripId],
    queryFn: () => appContainer.uow.payments.findByTripId(tripId),
    enabled: Boolean(tripId),
  })
}
