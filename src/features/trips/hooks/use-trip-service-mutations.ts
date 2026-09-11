import { useMutation, useQueryClient } from '@tanstack/react-query'
import { appContainer } from '@/app/container'
import type { Trip } from '@/domain/entities'
import type { TripService, TripServiceStatus } from '@/domain/entities/trip-service'
import { useToast } from '@/design-system/components/Toast'
import { buildNewTripService, type CreateTripServiceInput } from '@/features/trips/utils/create-trip-service'

async function createTripService({
  trip,
  input,
}: {
  trip: Trip
  input: CreateTripServiceInput
}): Promise<TripService> {
  const existing = await appContainer.uow.tripServices.findByTripId(trip.id)
  return appContainer.uow.tripServices.create(buildNewTripService(trip, input, existing))
}

async function bulkDeleteTripServiceIds(serviceIds: string[]): Promise<number> {
  await Promise.all(serviceIds.map((id) => appContainer.uow.tripServices.delete(id)))
  return serviceIds.length
}

async function bulkCloneTripServices(tripId: string, serviceIds: string[]): Promise<number> {
  const all = await appContainer.uow.tripServices.findByTripId(tripId)
  let maxLine = all.reduce((max, service) => Math.max(max, service.lineNumber), 0)
  const toClone = all
    .filter((service) => serviceIds.includes(service.id))
    .sort((a, b) => a.lineNumber - b.lineNumber)

  const now = new Date().toISOString()

  for (const service of toClone) {
    maxLine += 1
    const rest = (({ id, createdAt, updatedAt, lineNumber, ...keep }) => keep)(service)
    await appContainer.uow.tripServices.create({
      ...rest,
      tripId,
      lineNumber: maxLine,
      name: `${service.name} (Copy)`,
      status: 'proposal',
      createdAt: now,
      updatedAt: now,
    })
  }

  return toClone.length
}

async function bulkUpdateTripServiceStatus({
  serviceIds,
  status,
}: {
  serviceIds: string[]
  status: TripServiceStatus
}): Promise<number> {
  await Promise.all(serviceIds.map((id) => appContainer.uow.tripServices.update(id, { status })))
  return serviceIds.length
}

export function useTripServiceMutations(tripId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const invalidateServices = () => {
    void queryClient.invalidateQueries({ queryKey: ['trip-services', tripId] })
    void queryClient.invalidateQueries({ queryKey: ['trips', tripId] })
  }

  const createMutation = useMutation({
    mutationFn: createTripService,
    onSuccess: (service) => {
      invalidateServices()
      toast({
        intent: 'info',
        title: 'Service added',
        description: `${service.name} was created as a proposal.`,
      })
    },
    onError: () => {
      toast({
        intent: 'failed',
        title: 'Could not add service',
        description: 'Please try again.',
      })
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: bulkDeleteTripServiceIds,
    onSuccess: (count) => {
      invalidateServices()
      toast({
        intent: 'deleted',
        title: count === 1 ? '1 service removed' : `${count} services removed`,
      })
    },
    onError: () => {
      toast({
        intent: 'failed',
        title: 'Bulk delete failed',
        description: 'Selected services could not be removed.',
      })
    },
  })

  const bulkCloneMutation = useMutation({
    mutationFn: (serviceIds: string[]) => bulkCloneTripServices(tripId, serviceIds),
    onSuccess: (count) => {
      invalidateServices()
      toast({
        intent: 'cloned',
        title: count === 1 ? '1 service cloned' : `${count} services cloned`,
        description: 'Copies were added as proposals.',
      })
    },
    onError: () => {
      toast({
        intent: 'failed',
        title: 'Bulk clone failed',
        description: 'Selected services could not be duplicated.',
      })
    },
  })

  const bulkUpdateMutation = useMutation({
    mutationFn: bulkUpdateTripServiceStatus,
    onSuccess: (count) => {
      invalidateServices()
      toast({
        intent: 'updated',
        title: count === 1 ? '1 service updated' : `${count} services updated`,
        description: 'Status changes were applied.',
      })
    },
    onError: () => {
      toast({
        intent: 'failed',
        title: 'Bulk update failed',
        description: 'Selected services could not be updated.',
      })
    },
  })

  return {
    createService: createMutation.mutate,
    createServiceAsync: createMutation.mutateAsync,
    bulkDeleteServices: bulkDeleteMutation.mutate,
    bulkCloneServices: bulkCloneMutation.mutate,
    bulkUpdateServices: bulkUpdateMutation.mutate,
    isCreatePending: createMutation.isPending,
    isBulkPending:
      bulkDeleteMutation.isPending || bulkCloneMutation.isPending || bulkUpdateMutation.isPending,
  }
}

export type { TripService }
