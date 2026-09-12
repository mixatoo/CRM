import { useQuery } from '@tanstack/react-query'
import { useDatabaseReady } from '@/app/providers'
import { appContainer } from '@/app/container'
import { paginatedListQueryOptions } from '@/shared/config/query-options'
import type { TransferFilters } from '@/repositories/interfaces'

export const TRANSFERS_QUERY_KEY = ['transfers'] as const

export function useTransfers() {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: TRANSFERS_QUERY_KEY,
    queryFn: () => appContainer.uow.transfers.findAll(),
    enabled: dbReady,
  })
}

export function useTransfersList(filters: TransferFilters, page: number, pageSize: number) {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: [...TRANSFERS_QUERY_KEY, 'list', filters, page, pageSize],
    queryFn: () => appContainer.uow.transfers.findPaginated(filters, { page, pageSize }),
    enabled: dbReady,
    ...paginatedListQueryOptions,
  })
}

export function useTransfer(transferId: string | undefined) {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: [...TRANSFERS_QUERY_KEY, transferId],
    queryFn: () => appContainer.uow.transfers.findById(transferId!),
    enabled: dbReady && !!transferId,
  })
}
