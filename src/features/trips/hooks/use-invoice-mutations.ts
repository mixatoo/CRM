import { useMutation, useQueryClient } from '@tanstack/react-query'
import { appContainer } from '@/app/container'
import { isClientBillingBlocked } from '@/domain/client/client-financial'
import type { Trip } from '@/domain/entities'
import type { Invoice, InvoiceStatus } from '@/domain/entities/invoice'
import { canEditInvoice, computeInvoiceTotals } from '@/domain/entities/invoice'
import { useToast } from '@/design-system/components/Toast'
import {
  buildInvoiceDraft,
  billableTripServices,
  serviceToInvoiceLineItem,
  type CreateInvoiceInput,
} from '@/features/trips/utils/create-invoice'
import { logTripActivity } from '@/infrastructure/database/trip-sync'

async function createTripInvoice({
  trip,
  input,
}: {
  trip: Trip
  input: CreateInvoiceInput
}): Promise<Invoice> {
  if (trip.clientId) {
    const client = await appContainer.uow.clients.findById(trip.clientId)
    if (client && isClientBillingBlocked(client)) {
      throw new Error('This account is blocked and cannot accept new invoices.')
    }
  }

  const [services, existingCount, existingInvoices] = await Promise.all([
    appContainer.uow.tripServices.findByTripId(trip.id),
    appContainer.uow.invoices.countByTripId(trip.id),
    appContainer.uow.invoices.findByTripId(trip.id),
  ])

  if (input.serviceIds.length === 0) {
    throw new Error('Select at least one service line')
  }

  const alreadyInvoiced = new Set<string>()
  for (const invoice of existingInvoices) {
    if (invoice.status === 'void') continue
    for (const line of invoice.lineItems) {
      if (line.serviceId) alreadyInvoiced.add(line.serviceId)
    }
  }
  const duplicates = input.serviceIds.filter((id) => alreadyInvoiced.has(id))
  if (duplicates.length > 0) {
    throw new Error('One or more selected services are already on an active invoice')
  }

  const invoice = await appContainer.uow.invoices.create(
    buildInvoiceDraft(trip, services, input, existingCount),
  )

  await logTripActivity({
    tripId: trip.id,
    type: 'invoice',
    action: 'created',
    summary: `Invoice ${invoice.number} created as draft.`,
  })

  return invoice
}

export interface UpdateInvoiceInput {
  clientName?: string
  clientEmail?: string
  issuedAt?: string
  dueDate?: string
  taxRate?: number
  notes?: string
  serviceIds?: string[]
}

async function updateTripInvoice({
  tripId,
  invoiceId,
  input,
}: {
  tripId: string
  invoiceId: string
  input: UpdateInvoiceInput
}): Promise<Invoice> {
  const [invoice, services, allInvoices] = await Promise.all([
    appContainer.uow.invoices.findById(invoiceId),
    appContainer.uow.tripServices.findByTripId(tripId),
    appContainer.uow.invoices.findByTripId(tripId),
  ])
  if (!invoice || invoice.tripId !== tripId) throw new Error('Invoice not found')
  if (!canEditInvoice(invoice)) throw new Error('Only draft invoices can be edited')

  const patch: Partial<Invoice> = {}
  if (input.clientName?.trim()) patch.clientName = input.clientName.trim()
  if (input.clientEmail !== undefined) patch.clientEmail = input.clientEmail.trim() || undefined
  if (input.issuedAt) patch.issuedAt = input.issuedAt
  if (input.dueDate) patch.dueDate = input.dueDate
  if (input.notes !== undefined) patch.notes = input.notes.trim() || undefined

  if (input.serviceIds) {
    const alreadyInvoiced = new Set<string>()
    for (const row of allInvoices) {
      if (row.id === invoiceId || row.status === 'void') continue
      for (const line of row.lineItems) {
        if (line.serviceId) alreadyInvoiced.add(line.serviceId)
      }
    }
    const duplicates = input.serviceIds.filter((id) => alreadyInvoiced.has(id))
    if (duplicates.length > 0) throw new Error('One or more services are already invoiced elsewhere')

    const selected = billableTripServices(services).filter((service) => input.serviceIds!.includes(service.id))
    patch.lineItems = selected.map(serviceToInvoiceLineItem)
  }

  const taxRate = input.taxRate ?? invoice.taxRate
  const lineItems = patch.lineItems ?? invoice.lineItems
  const totals = computeInvoiceTotals(lineItems, taxRate)
  Object.assign(patch, totals, { taxRate })

  const updated = await appContainer.uow.invoices.update(invoiceId, patch)
  await logTripActivity({
    tripId,
    type: 'invoice',
    action: 'updated',
    summary: `Draft invoice ${updated.number} was updated.`,
  })
  return updated
}

export function useInvoiceMutations(tripId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['invoices', tripId] })
    void queryClient.invalidateQueries({ queryKey: ['trips', tripId] })
    void queryClient.invalidateQueries({ queryKey: ['trips'] })
    void queryClient.invalidateQueries({ queryKey: ['trip-activities', tripId] })
  }

  const createMutation = useMutation({
    mutationFn: createTripInvoice,
    onSuccess: (invoice) => {
      invalidate()
      toast({
        intent: 'info',
        title: 'Invoice created',
        description: `${invoice.number} was saved as a draft.`,
      })
    },
    onError: (error: Error) => {
      toast({
        intent: 'failed',
        title: 'Could not create invoice',
        description: error.message || 'Please try again.',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateTripInvoice,
    onSuccess: (invoice) => {
      invalidate()
      toast({ intent: 'updated', title: 'Invoice saved', description: invoice.number })
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Save failed', description: error.message })
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ invoiceId, status }: { invoiceId: string; status: InvoiceStatus }) => {
      const existing = await appContainer.uow.invoices.findById(invoiceId)
      if (!existing) throw new Error('Invoice not found')

      const patch: Partial<Invoice> = { status }
      if (status === 'paid') {
        patch.amountPaid = existing.total
      }

      const updated = await appContainer.uow.invoices.update(invoiceId, patch)
      await logTripActivity({
        tripId,
        type: 'invoice',
        action: 'status_changed',
        summary: `Invoice ${updated.number} marked ${status}.`,
      })
      return updated
    },
    onSuccess: (invoice) => {
      invalidate()
      toast({
        intent: 'updated',
        title: 'Invoice updated',
        description: `${invoice.number} is now ${invoice.status}.`,
      })
    },
    onError: () => {
      toast({
        intent: 'failed',
        title: 'Update failed',
        description: 'Invoice status could not be changed.',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const existing = await appContainer.uow.invoices.findById(invoiceId)
      if (!existing) throw new Error('Invoice not found')
      if (!canEditInvoice(existing)) throw new Error('Only draft invoices can be deleted')
      await appContainer.uow.invoices.delete(invoiceId)
      await logTripActivity({
        tripId,
        type: 'invoice',
        action: 'deleted',
        summary: `Draft invoice ${existing.number} was deleted.`,
      })
      return existing
    },
    onSuccess: (invoice) => {
      invalidate()
      toast({
        intent: 'deleted',
        title: 'Invoice deleted',
        description: `${invoice.number} was removed.`,
      })
    },
    onError: (error: Error) => {
      toast({
        intent: 'failed',
        title: 'Delete failed',
        description: error.message || 'Invoice could not be deleted.',
      })
    },
  })

  return {
    createInvoice: createMutation.mutate,
    createInvoiceAsync: createMutation.mutateAsync,
    updateInvoice: updateMutation.mutate,
    updateInvoiceAsync: updateMutation.mutateAsync,
    updateInvoiceStatus: updateStatusMutation.mutate,
    deleteInvoice: deleteMutation.mutate,
    isCreatePending: createMutation.isPending,
    isUpdatePending: updateMutation.isPending || updateStatusMutation.isPending,
    isDeletePending: deleteMutation.isPending,
  }
}
