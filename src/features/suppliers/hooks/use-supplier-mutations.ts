import { useMutation, useQueryClient } from '@tanstack/react-query'
import { appContainer } from '@/app/container'
import type { Supplier } from '@/domain/entities/supplier'
import { nextSupplierReference } from '@/infrastructure/database/supplier-seed'
import { useToast } from '@/design-system/components/Toast'

export type SupplierFormInput = Omit<Supplier, 'id' | 'reference' | 'createdAt' | 'updatedAt'>

function withTimestamps(input: SupplierFormInput, reference: string): Omit<Supplier, 'id'> {
  const now = new Date().toISOString()
  return {
    ...input,
    reference,
    displayName: input.displayName.trim(),
    contactName: input.contactName?.trim() || undefined,
    email: input.email?.trim() || undefined,
    phone: input.phone?.trim() || undefined,
    country: input.country?.trim() || undefined,
    city: input.city?.trim() || undefined,
    address: input.address?.trim() || undefined,
    website: input.website?.trim() || undefined,
    paymentTerms: input.paymentTerms?.trim() || undefined,
    billingNotes: input.billingNotes?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  }
}

export function useSupplierMutations() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    void queryClient.invalidateQueries({ queryKey: ['trip-services'] })
  }

  const createSupplier = useMutation({
    mutationFn: async (input: SupplierFormInput) => {
      const reference = await nextSupplierReference()
      return appContainer.uow.suppliers.create(withTimestamps(input, reference))
    },
    onSuccess: (supplier) => {
      invalidate()
      toast({ intent: 'updated', title: 'Supplier created', description: supplier.reference })
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Could not create supplier', description: error.message })
    },
  })

  const updateSupplier = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<SupplierFormInput> }) => {
      const existing = await appContainer.uow.suppliers.findById(id)
      if (!existing) throw new Error('Supplier not found')
      return appContainer.uow.suppliers.update(id, {
        ...patch,
        displayName: patch.displayName?.trim() ?? existing.displayName,
        contactName: patch.contactName?.trim() || undefined,
        email: patch.email?.trim() || undefined,
        phone: patch.phone?.trim() || undefined,
        country: patch.country?.trim() || undefined,
        city: patch.city?.trim() || undefined,
        address: patch.address?.trim() || undefined,
        website: patch.website?.trim() || undefined,
        paymentTerms: patch.paymentTerms?.trim() || undefined,
        billingNotes: patch.billingNotes?.trim() || undefined,
        notes: patch.notes?.trim() || undefined,
        updatedAt: new Date().toISOString(),
      })
    },
    onSuccess: (supplier) => {
      invalidate()
      toast({ intent: 'updated', title: 'Supplier updated', description: supplier.reference })
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Could not update supplier', description: error.message })
    },
  })

  const deleteSupplier = useMutation({
    mutationFn: async (id: string) => {
      const linked = await appContainer.uow.suppliers.countLinkedServices(id)
      if (linked > 0) {
        throw new Error(`Supplier is linked to ${linked} service(s). Unlink services before deleting.`)
      }
      await appContainer.uow.suppliers.delete(id)
    },
    onSuccess: () => {
      invalidate()
      toast({ intent: 'deleted', title: 'Supplier deleted' })
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Could not delete supplier', description: error.message })
    },
  })

  const bulkDeleteSuppliers = useMutation({
    mutationFn: async (supplierIds: string[]) => {
      for (const id of supplierIds) {
        const linked = await appContainer.uow.suppliers.countLinkedServices(id)
        if (linked > 0) {
          const supplier = await appContainer.uow.suppliers.findById(id)
          throw new Error(
            `${supplier?.reference ?? 'Supplier'} is linked to ${linked} service(s). Unlink services before deleting.`,
          )
        }
        await appContainer.uow.suppliers.delete(id)
      }
      return supplierIds.length
    },
    onSuccess: (count) => {
      invalidate()
      toast({ intent: 'deleted', title: `${count} supplier${count === 1 ? '' : 's'} deleted` })
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Could not delete suppliers', description: error.message })
    },
  })

  const bulkUpdateSuppliers = useMutation({
    mutationFn: async ({
      supplierIds,
      patch,
    }: {
      supplierIds: string[]
      patch: Partial<Pick<SupplierFormInput, 'status' | 'category'>>
    }) => {
      const now = new Date().toISOString()
      await Promise.all(
        supplierIds.map(async (id) => {
          const existing = await appContainer.uow.suppliers.findById(id)
          if (!existing) return
          await appContainer.uow.suppliers.update(id, { ...patch, updatedAt: now })
        }),
      )
      return supplierIds.length
    },
    onSuccess: (count) => {
      invalidate()
      toast({ intent: 'updated', title: `Updated ${count} supplier${count === 1 ? '' : 's'}` })
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Could not update suppliers', description: error.message })
    },
  })

  return {
    createSupplier,
    updateSupplier,
    deleteSupplier,
    bulkDeleteSuppliers,
    bulkUpdateSuppliers,
    isPending:
      createSupplier.isPending ||
      updateSupplier.isPending ||
      deleteSupplier.isPending ||
      bulkDeleteSuppliers.isPending ||
      bulkUpdateSuppliers.isPending,
    isBulkPending: bulkDeleteSuppliers.isPending || bulkUpdateSuppliers.isPending,
  }
}
