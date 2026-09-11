import { useMutation, useQueryClient } from '@tanstack/react-query'
import { appContainer } from '@/app/container'
import { travelerDisplayName, type Traveler } from '@/domain/entities/traveler'
import { useToast } from '@/design-system/components/Toast'
import { CLIENT_TRAVELERS_QUERY_KEY } from '@/features/travelers/hooks/use-client-travelers'
import { TRAVELERS_QUERY_KEY } from '@/features/travelers/hooks/use-travelers'
import { CRM_LABELS } from '@/features/clients/config/crm-labels'
import { emptyTravelerProfileDefaults } from '@/domain/entities/traveler'
import { nextTravelerReference } from '@/infrastructure/database/traveler-seed'

export type TravelerFormInput = {
  accountId: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  jobTitle?: string
  notes?: string
}

/** Full profile patch used by the passenger profile page. */
export type TravelerProfileInput = Omit<Traveler, 'id' | 'reference' | 'createdAt' | 'updatedAt'>

function normalizeTravelerInput(
  input: TravelerFormInput,
): Omit<Traveler, 'id' | 'reference' | 'createdAt' | 'updatedAt'> {
  return {
    ...emptyTravelerProfileDefaults(),
    accountId: input.accountId.trim(),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email?.trim() || undefined,
    phone: input.phone?.trim() || undefined,
    jobTitle: input.jobTitle?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
  }
}

export function useTravelerMutations() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: TRAVELERS_QUERY_KEY })
    void queryClient.invalidateQueries({ queryKey: CLIENT_TRAVELERS_QUERY_KEY })
    void queryClient.invalidateQueries({ queryKey: ['search'] })
  }

  const createTraveler = useMutation({
    mutationFn: async (input: TravelerFormInput) => {
      if (!input.accountId.trim()) throw new Error('Account is required')
      if (!input.firstName.trim() || !input.lastName.trim()) {
        throw new Error('First and last name are required')
      }
      const account = await appContainer.uow.clients.findById(input.accountId.trim())
      if (!account) throw new Error('Account not found')

      const now = new Date().toISOString()
      const reference = await nextTravelerReference()
      return appContainer.uow.travelers.create({
        ...normalizeTravelerInput(input),
        reference,
        createdAt: now,
        updatedAt: now,
      })
    },
    onSuccess: (traveler) => {
      invalidate()
      toast({
        intent: 'updated',
        title: `${CRM_LABELS.traveler} created`,
        description: `${traveler.reference} · ${travelerDisplayName(traveler)}`,
      })
    },
    onError: (error: Error) => {
      toast({
        intent: 'failed',
        title: `Could not create ${CRM_LABELS.traveler.toLowerCase()}`,
        description: error.message,
      })
    },
  })

  const updateTraveler = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: TravelerFormInput }) => {
      const existing = await appContainer.uow.travelers.findById(id)
      if (!existing) throw new Error(`${CRM_LABELS.traveler} not found`)
      if (!patch.accountId.trim()) throw new Error('Account is required')
      if (!patch.firstName.trim() || !patch.lastName.trim()) {
        throw new Error('First and last name are required')
      }
      const account = await appContainer.uow.clients.findById(patch.accountId.trim())
      if (!account) throw new Error('Account not found')

      return appContainer.uow.travelers.update(id, {
        accountId: patch.accountId.trim(),
        firstName: patch.firstName.trim(),
        lastName: patch.lastName.trim(),
        email: patch.email?.trim() || undefined,
        phone: patch.phone?.trim() || undefined,
        jobTitle: patch.jobTitle?.trim() || undefined,
        notes: patch.notes?.trim() || undefined,
        updatedAt: new Date().toISOString(),
      })
    },
    onSuccess: (traveler) => {
      invalidate()
      toast({
        intent: 'updated',
        title: `${CRM_LABELS.traveler} updated`,
        description: travelerDisplayName(traveler),
      })
    },
    onError: (error: Error) => {
      toast({
        intent: 'failed',
        title: `Could not update ${CRM_LABELS.traveler.toLowerCase()}`,
        description: error.message,
      })
    },
  })

  const updateTravelerProfile = useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string
      patch: Partial<TravelerProfileInput>
    }) => {
      const existing = await appContainer.uow.travelers.findById(id)
      if (!existing) throw new Error(`${CRM_LABELS.traveler} not found`)

      const nextAccountId = (patch.accountId ?? existing.accountId).trim()
      const nextFirstName = (patch.firstName ?? existing.firstName).trim()
      const nextLastName = (patch.lastName ?? existing.lastName).trim()
      if (!nextAccountId) throw new Error('Account is required')
      if (!nextFirstName || !nextLastName) throw new Error('First and last name are required')

      const account = await appContainer.uow.clients.findById(nextAccountId)
      if (!account) throw new Error('Account not found')

      return appContainer.uow.travelers.update(id, {
        ...patch,
        accountId: nextAccountId,
        firstName: nextFirstName,
        lastName: nextLastName,
        updatedAt: new Date().toISOString(),
      })
    },
    onSuccess: (traveler, variables) => {
      invalidate()
      if (variables.patch && 'silent' in (variables as object)) return
      toast({
        intent: 'updated',
        title: 'Profile saved',
        description: `${traveler.reference} · ${travelerDisplayName(traveler)}`,
      })
    },
    onError: (error: Error) => {
      toast({
        intent: 'failed',
        title: 'Could not save profile',
        description: error.message,
      })
    },
  })

  const deleteTraveler = useMutation({
    mutationFn: async (id: string) => {
      const existing = await appContainer.uow.travelers.findById(id)
      if (!existing) throw new Error(`${CRM_LABELS.traveler} not found`)
      await appContainer.uow.travelers.delete(id)
      return existing
    },
    onSuccess: (traveler) => {
      invalidate()
      toast({
        intent: 'deleted',
        title: `${CRM_LABELS.traveler} deleted`,
        description: travelerDisplayName(traveler),
      })
    },
    onError: (error: Error) => {
      toast({
        intent: 'failed',
        title: `Could not delete ${CRM_LABELS.traveler.toLowerCase()}`,
        description: error.message,
      })
    },
  })

  const bulkDeleteTravelers = useMutation({
    mutationFn: async (travelerIds: string[]) => {
      for (const id of travelerIds) {
        await appContainer.uow.travelers.delete(id)
      }
      return travelerIds.length
    },
    onSuccess: (count) => {
      invalidate()
      toast({
        intent: 'deleted',
        title: `${count} ${count === 1 ? CRM_LABELS.traveler.toLowerCase() : CRM_LABELS.travelers.toLowerCase()} deleted`,
      })
    },
    onError: (error: Error) => {
      toast({
        intent: 'failed',
        title: `Could not delete ${CRM_LABELS.travelers.toLowerCase()}`,
        description: error.message,
      })
    },
  })

  return {
    createTraveler,
    updateTraveler,
    updateTravelerProfile,
    deleteTraveler,
    bulkDeleteTravelers,
    isPending:
      createTraveler.isPending ||
      updateTraveler.isPending ||
      updateTravelerProfile.isPending ||
      deleteTraveler.isPending ||
      bulkDeleteTravelers.isPending,
    isFormPending: createTraveler.isPending || updateTraveler.isPending,
    isProfileSaving: updateTravelerProfile.isPending,
    isBulkPending: bulkDeleteTravelers.isPending,
    deletingTravelerId: deleteTraveler.isPending
      ? (deleteTraveler.variables as string | undefined)
      : undefined,
  }
}
