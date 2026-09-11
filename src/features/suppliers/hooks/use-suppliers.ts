import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useDatabaseReady } from '@/app/providers'
import { appContainer } from '@/app/container'
import { db } from '@/infrastructure/database/db'
import { paginatedListQueryOptions } from '@/shared/config/query-options'
import type { SupplierFilters } from '@/repositories/interfaces'

export function useSuppliers() {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: () => appContainer.uow.suppliers.findAll(),
    enabled: dbReady,
  })
}

export function useSuppliersList(filters: SupplierFilters, page: number, pageSize: number) {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: ['suppliers', 'list', filters, page, pageSize],
    queryFn: () => appContainer.uow.suppliers.findPaginated(filters, { page, pageSize }),
    enabled: dbReady,
    ...paginatedListQueryOptions,
  })
}

export function useSupplier(supplierId: string | undefined) {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: ['suppliers', supplierId],
    queryFn: () => appContainer.uow.suppliers.findById(supplierId!),
    enabled: dbReady && !!supplierId,
  })
}

export function useSupplierServiceCounts(supplierIds: string[]) {
  const dbReady = useDatabaseReady()
  const stableIds = useMemo(() => [...supplierIds].sort(), [supplierIds])
  return useQuery({
    queryKey: ['suppliers', 'service-counts', stableIds],
    queryFn: async () => {
      if (stableIds.length === 0) return {} as Record<string, number>

      const counts = Object.fromEntries(stableIds.map((id) => [id, 0])) as Record<string, number>
      const services = await db.tripServices.where('supplierId').anyOf(stableIds).toArray()
      for (const service of services) {
        if (service.supplierId) counts[service.supplierId] = (counts[service.supplierId] ?? 0) + 1
      }
      return counts
    },
    enabled: dbReady && stableIds.length > 0,
    staleTime: 60_000,
  })
}

export function useSupplierLinkedServices(supplierId: string | undefined) {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: ['suppliers', supplierId, 'linked-services'],
    queryFn: async () => {
      const supplier = await appContainer.uow.suppliers.findById(supplierId!)
      if (!supplier) return []

      const byId = await db.tripServices.where('supplierId').equals(supplierId!).toArray()
      if (byId.length > 0) return byId

      const name = supplier.displayName.trim().toLowerCase()
      const services = await db.tripServices.toArray()
      return services.filter((service) => service.supplierName?.trim().toLowerCase() === name)
    },
    enabled: dbReady && !!supplierId,
  })
}
