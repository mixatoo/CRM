import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { appContainer } from '@/app/container'
import { formatServiceCategory } from '@/domain/entities/trip-service'
import type { TripService } from '@/domain/entities/trip-service'
import type { FlightServiceDetails } from '@/domain/flight/types'
import { deriveFlightServiceSummary, migrateFlightServiceDetails, refreshFlightServiceDetails } from '@/domain/flight'
import { useToast } from '@/design-system/components/Toast'
import type { TripServiceEditorFormValues } from '@/features/trips/schemas/trip-service-editor.schema'
import { editorValuesToTripServicePatch } from '@/features/trips/utils/trip-service-editor'

function buildFlightServicePatch(
  service: TripService,
  flightDetails: FlightServiceDetails,
): Partial<TripService> {
  const migrated = migrateFlightServiceDetails(flightDetails, service.currency)
  const refreshed = refreshFlightServiceDetails(migrated, service.currency)
  const summary = deriveFlightServiceSummary(refreshed)
  const financials = refreshed.financialSummary

  return {
    flightDetails: refreshed,
    name: summary.name,
    supplierName: summary.supplierName,
    startDate: summary.startDate,
    endDate: summary.endDate,
    cost: financials?.supplierCost ?? service.cost,
    selling: financials?.sellingPrice ?? service.selling,
    currency: financials?.currency ?? service.currency,
  }
}

export function useUpdateTripService(
  tripId: string,
  serviceId: string,
  options?: {
    successTitle?: string
    successDescription?: string
  },
) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (patch: Partial<TripService>) => appContainer.uow.tripServices.update(serviceId, patch),
    onSuccess: (updated) => {
      queryClient.setQueryData(['trip-service', serviceId], updated)
      void queryClient.invalidateQueries({ queryKey: ['trip-services', tripId] })
      void queryClient.invalidateQueries({ queryKey: ['trips', tripId] })
      toast({
        intent: 'updated',
        title: options?.successTitle ?? 'Service saved',
        description: options?.successDescription ?? `${updated.name} was updated.`,
      })
    },
    onError: () => {
      toast({
        intent: 'failed',
        title: 'Save failed',
        description: 'The service could not be saved. Check the form and try again.',
      })
    },
  })
}

export function useSaveFlightDetails(tripId: string, service: TripService) {
  const mutation = useUpdateTripService(tripId, service.id, {
    successTitle: 'Flight service saved',
    successDescription: 'Itinerary and financial totals were updated.',
  })

  return {
    ...mutation,
    saveFlightDetails: (
      flightDetails: FlightServiceDetails,
      options?: UseMutationOptions<TripService, Error, Partial<TripService>, unknown>,
    ) => mutation.mutate(buildFlightServicePatch(service, flightDetails), options),
  }
}

export function useSaveTripServiceEditor(tripId: string, service: TripService) {
  const categoryLabel = formatServiceCategory(service.category)
  const mutation = useUpdateTripService(tripId, service.id, {
    successTitle: `${categoryLabel} service saved`,
    successDescription: 'Service details and financials were updated.',
  })

  return {
    ...mutation,
    saveEditor: (values: TripServiceEditorFormValues) => {
      mutation.mutate(editorValuesToTripServicePatch(service, values))
    },
    isPending: mutation.isPending,
  }
}
