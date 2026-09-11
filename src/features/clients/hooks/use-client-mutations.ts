import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { appContainer } from '@/app/container'
import type { Client, ClientMembership } from '@/domain/entities/client'
import {
  finalizeClientNameFields,
  isClientIdentityComplete,
  normalizeClientFormInput,
  resolveClientBillingAccount,
  resolveClientMembership,
  normalizeClientPaymentMethods,
  normalizeClientPaymentCurrencies,
  clientPrimaryLabel,
  validateCreditAccountSetup,
} from '@/domain/entities/client'
import { clientToCloneFormInput } from '@/features/clients/components/ClientProfileFields'
import { resolveMembershipFields } from '@/domain/membership/program'
import { resolveCountryName } from '@/domain/catalog/location-utils'
import { nextClientReference, nextMembershipNumber } from '@/infrastructure/database/client-seed'
import { syncClientSlaRenewalReminder } from '@/features/clients/utils/sync-sla-renewal-reminder'
import { useToast } from '@/design-system/components/Toast'
import { toLocalIsoDate } from '@/shared/utils/date-format'

async function resolveClientPaymentTermId(
  paymentTermId?: string,
  existingPaymentTermId?: string,
): Promise<string | undefined> {
  const id = paymentTermId?.trim()
  if (!id) return undefined
  const term = await appContainer.uow.paymentTerms.findById(id)
  if (!term) {
    throw new Error('Selected payment terms are invalid or inactive.')
  }
  if (!term.isActive && id !== existingPaymentTermId?.trim()) {
    throw new Error('Selected payment terms are invalid or inactive.')
  }
  return term.id
}

export type ClientFormInput = Omit<Client, 'id' | 'reference' | 'createdAt' | 'updatedAt'>

function resolvePersistedClientNames(normalized: ReturnType<typeof normalizeClientFormInput>) {
  if (normalized.type === 'individual') {
    return finalizeClientNameFields(normalized)
  }
  const accountName = normalized.company?.trim() ?? ''
  return {
    firstName: undefined,
    middleName: undefined,
    lastName: undefined,
    displayName: accountName,
  }
}

function withTimestamps(input: ClientFormInput, reference: string, paymentTermId?: string): Omit<Client, 'id'> {
  const normalized = normalizeClientFormInput(input)
  validateCreditAccountSetup(normalized)
  const names = resolvePersistedClientNames(normalized)
  const now = new Date().toISOString()
  return {
    ...normalized,
    ...names,
    status: 'active',
    reference,
    displayName: clientPrimaryLabel({ ...normalized, ...names }),
    email: normalized.email?.trim() || undefined,
    phone: normalized.phone?.trim() || undefined,
    company: normalized.type === 'corporate' ? normalized.company?.trim() || undefined : undefined,
    industry: normalized.type === 'corporate' ? normalized.industry : undefined,
    jobTitle: normalized.type === 'individual' ? normalized.jobTitle?.trim() || undefined : undefined,
    country: resolveCountryName(normalized.country?.trim() ?? '') || undefined,
    city: normalized.city?.trim() || undefined,
    address: normalized.address?.trim() || undefined,
    preferredPaymentMethods: normalizeClientPaymentMethods(normalized.preferredPaymentMethods),
    preferredPaymentMethod: undefined,
    paymentCurrencies: normalizeClientPaymentCurrencies(normalized.paymentCurrencies),
    paymentTermId,
    paymentTerms: undefined,
    billingAccount: resolveClientBillingAccount(normalized),
    creditLimit:
      resolveClientBillingAccount(normalized) === 'credit' && normalized.creditLimit && normalized.creditLimit > 0
        ? normalized.creditLimit
        : undefined,
    sla: normalized.sla,
    slaAgreement: normalized.slaAgreement,
    market: normalized.market,
    segment: normalized.segment?.trim() || undefined,
    customerTier: normalized.customerTier,
    membership: normalized.membership,
    membershipNumber: normalized.membershipNumber,
    membershipEnrolledAt: normalized.membershipEnrolledAt,
    membershipExpiresAt: normalized.membershipExpiresAt,
    membershipNotes: normalized.membershipNotes,
    preferredDestination: normalized.preferredDestination?.trim() || undefined,
    nationalityFocus: normalized.nationalityFocus?.trim() || undefined,
    billingNotes: normalized.billingNotes?.trim() || undefined,
    commercialRegistration:
      normalized.type === 'corporate' ? normalized.commercialRegistration : undefined,
    taxRegistration: normalized.type === 'corporate' ? normalized.taxRegistration : undefined,
    notes: normalized.notes?.trim() || undefined,
    joinedAt: toLocalIsoDate(new Date()),
    createdAt: now,
    updatedAt: now,
  }
}

async function createClientRecord(input: ClientFormInput): Promise<Client> {
  if (!isClientIdentityComplete(input)) {
    throw new Error(
      input.type === 'corporate' ? 'Company name is required.' : 'First name and last name are required.',
    )
  }
  const reference = await nextClientReference()
  const paymentTermId = await resolveClientPaymentTermId(input.paymentTermId)
  const base = withTimestamps(input, reference, paymentTermId)
  const willBeMember = resolveClientMembership(input.membership) === 'member'
  if (!willBeMember) {
    const client = await appContainer.uow.clients.create(base)
    await syncClientSlaRenewalReminder(client)
    return client
  }
  const generatedNumber = await nextMembershipNumber()
  const membershipFields = resolveMembershipFields(
    {
      membership: 'non_member',
      membershipNumber: undefined,
      membershipEnrolledAt: undefined,
      membershipExpiresAt: undefined,
      membershipNotes: undefined,
    },
    {
      membership: input.membership,
      membershipNotes: input.membershipNotes,
      membershipEnrolledAt: input.membershipEnrolledAt,
      membershipExpiresAt: input.membershipExpiresAt,
    },
    generatedNumber,
  )
  const client = await appContainer.uow.clients.create({ ...base, ...membershipFields })
  await syncClientSlaRenewalReminder(client)
  return client
}

export function useClientMutations() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { toast } = useToast()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['clients'] })
    void queryClient.invalidateQueries({ queryKey: ['trips'] })
  }

  const createClient = useMutation({
    mutationFn: createClientRecord,
    onSuccess: (client) => {
      invalidate()
      toast({ intent: 'updated', title: 'Client created', description: client.reference })
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Could not create client', description: error.message })
    },
  })

  const cloneClient = useMutation({
    mutationFn: (source: Client) => createClientRecord(clientToCloneFormInput(source)),
    onSuccess: (cloned) => {
      invalidate()
      toast({
        intent: 'cloned',
        title: clientPrimaryLabel(cloned),
        description: cloned.reference,
      })
      navigate(`/clients/${cloned.id}/profile`)
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Clone failed', description: error.message })
    },
  })

  const updateClient = useMutation({
    mutationFn: async ({
      id,
      patch,
      silent: _silent,
    }: {
      id: string
      patch: Partial<ClientFormInput>
      silent?: boolean
    }) => {
      const existing = await appContainer.uow.clients.findById(id)
      if (!existing) throw new Error('Client not found')
      const normalized = normalizeClientFormInput({ ...existing, ...patch })
      validateCreditAccountSetup(normalized)
      const nextType = normalized.type
      const names = resolvePersistedClientNames(normalized)

      const touchesMembership =
        'membership' in patch ||
        'membershipNotes' in patch ||
        'membershipNumber' in patch ||
        'membershipEnrolledAt' in patch ||
        'membershipExpiresAt' in patch

      let membershipFields: {
        membership?: ClientMembership
        membershipNumber?: string
        membershipEnrolledAt?: string
        membershipExpiresAt?: string
        membershipNotes?: string
      } = {
        membership: normalized.membership,
        membershipNumber: normalized.membershipNumber,
        membershipEnrolledAt: normalized.membershipEnrolledAt,
        membershipExpiresAt: normalized.membershipExpiresAt,
        membershipNotes: normalized.membershipNotes,
      }

      if (touchesMembership) {
        const willBeMember = resolveClientMembership(patch.membership ?? existing.membership) === 'member'
        const generatedNumber =
          willBeMember && !existing.membershipNumber ? await nextMembershipNumber() : undefined
        membershipFields = resolveMembershipFields(
          existing,
          {
            membership: patch.membership,
            membershipNotes: patch.membershipNotes,
            membershipEnrolledAt: patch.membershipEnrolledAt,
            membershipExpiresAt: patch.membershipExpiresAt,
          },
          generatedNumber,
        )
      }

      const paymentTermId =
        'paymentTermId' in patch
          ? await resolveClientPaymentTermId(normalized.paymentTermId, existing.paymentTermId)
          : existing.paymentTermId

      const client = await appContainer.uow.clients.update(id, {
        ...patch,
        type: nextType,
        displayName: clientPrimaryLabel({ ...normalized, ...names, type: nextType }),
        firstName: nextType === 'individual' ? names.firstName : undefined,
        middleName: nextType === 'individual' ? names.middleName : undefined,
        lastName: nextType === 'individual' ? names.lastName : undefined,
        email: normalized.email?.trim() || undefined,
        phone: normalized.phone?.trim() || undefined,
        company: nextType === 'corporate' ? normalized.company?.trim() || undefined : undefined,
        industry: nextType === 'corporate' ? normalized.industry : undefined,
        jobTitle: nextType === 'corporate' ? normalized.jobTitle?.trim() || undefined : undefined,
        country: resolveCountryName(normalized.country?.trim() ?? '') || undefined,
        city: normalized.city?.trim() || undefined,
        address: normalized.address?.trim() || undefined,
        preferredPaymentMethods: normalizeClientPaymentMethods(normalized.preferredPaymentMethods),
        preferredPaymentMethod: undefined,
        paymentCurrencies: normalizeClientPaymentCurrencies(normalized.paymentCurrencies),
        paymentTermId,
        paymentTerms: undefined,
        billingAccount: resolveClientBillingAccount(normalized),
        creditLimit:
          resolveClientBillingAccount(normalized) === 'credit' && normalized.creditLimit && normalized.creditLimit > 0
            ? normalized.creditLimit
            : undefined,
        sla: normalized.sla,
        slaAgreement: normalized.slaAgreement,
        market: normalized.market,
        segment: normalized.segment?.trim() || undefined,
        customerTier: normalized.customerTier,
        acquisitionSource: normalized.acquisitionSource,
        acquisitionChannel: normalized.acquisitionChannel,
        dateOfBirth: nextType === 'individual' ? normalized.dateOfBirth : undefined,
        gender: nextType === 'individual' ? normalized.gender : undefined,
        accountManagerId: normalized.accountManagerId,
        ...membershipFields,
        preferredDestination: normalized.preferredDestination?.trim() || undefined,
        nationalityFocus: normalized.nationalityFocus?.trim() || undefined,
        billingNotes: normalized.billingNotes?.trim() || undefined,
        commercialRegistration:
          nextType === 'corporate' ? normalized.commercialRegistration : undefined,
        taxRegistration: nextType === 'corporate' ? normalized.taxRegistration : undefined,
        notes: normalized.notes?.trim() || undefined,
        joinedAt: normalized.joinedAt,
        updatedAt: new Date().toISOString(),
      })
      await syncClientSlaRenewalReminder(client)
      return client
    },
    onSuccess: (client, variables) => {
      invalidate()
      if (!variables.silent) {
        toast({ intent: 'updated', title: 'Client updated', description: client.reference })
      }
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Could not update client', description: error.message })
    },
  })

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      const linked = await appContainer.uow.clients.countLinkedTrips(id)
      if (linked > 0) {
        throw new Error(`Client is linked to ${linked} trip(s). Unlink trips before deleting.`)
      }
      await appContainer.uow.clientCreditCards.deleteByClientId(id)
      await appContainer.uow.clientServiceFees.deleteByClientId(id)
      await appContainer.uow.travelers.deleteByAccountId(id)
      await appContainer.uow.clients.delete(id)
    },
    onSuccess: () => {
      invalidate()
      toast({ intent: 'deleted', title: 'Client deleted' })
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Could not delete client', description: error.message })
    },
  })

  const bulkDeleteClients = useMutation({
    mutationFn: async (clientIds: string[]) => {
      for (const id of clientIds) {
        const linked = await appContainer.uow.clients.countLinkedTrips(id)
        if (linked > 0) {
          const client = await appContainer.uow.clients.findById(id)
          throw new Error(
            `${client?.reference ?? 'Client'} is linked to ${linked} trip(s). Unlink trips before deleting.`,
          )
        }
        await appContainer.uow.clientCreditCards.deleteByClientId(id)
        await appContainer.uow.clientServiceFees.deleteByClientId(id)
        await appContainer.uow.travelers.deleteByAccountId(id)
        await appContainer.uow.clients.delete(id)
      }
      return clientIds.length
    },
    onSuccess: (count) => {
      invalidate()
      toast({ intent: 'deleted', title: `${count} client${count === 1 ? '' : 's'} deleted` })
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Could not delete clients', description: error.message })
    },
  })

  const bulkUpdateClients = useMutation({
    mutationFn: async ({
      clientIds,
      patch,
    }: {
      clientIds: string[]
      patch: Partial<Pick<ClientFormInput, 'status' | 'type'>>
    }) => {
      const now = new Date().toISOString()
      await Promise.all(
        clientIds.map(async (id) => {
          const existing = await appContainer.uow.clients.findById(id)
          if (!existing) return
          await appContainer.uow.clients.update(id, { ...patch, updatedAt: now })
        }),
      )
      return clientIds.length
    },
    onSuccess: (count) => {
      invalidate()
      toast({ intent: 'updated', title: `Updated ${count} client${count === 1 ? '' : 's'}` })
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Could not update clients', description: error.message })
    },
  })

  return {
    createClient,
    cloneClient,
    updateClient,
    deleteClient,
    bulkDeleteClients,
    bulkUpdateClients,
    isFormPending: createClient.isPending || updateClient.isPending,
    isPending:
      createClient.isPending ||
      cloneClient.isPending ||
      updateClient.isPending ||
      deleteClient.isPending ||
      bulkDeleteClients.isPending ||
      bulkUpdateClients.isPending,
    isBulkPending: bulkDeleteClients.isPending || bulkUpdateClients.isPending,
    cloningClientId: cloneClient.isPending ? cloneClient.variables?.id : undefined,
    deletingClientId: deleteClient.isPending ? deleteClient.variables : undefined,
  }
}
