import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Client } from '@/domain/entities/client'
import type { ClientStatus } from '@/domain/entities/client'
import { canManageClientStatus, canMutate } from '@/domain/policies/permissions'
import { Page } from '@/design-system/layout/Page'
import { ClientsTableColumnPicker } from '@/features/clients/components/list/ClientsTableColumnPicker'
import { useClientsTableLayout } from '@/features/clients/hooks/use-clients-table-layout'
import { TableRowSelectionProvider } from '@/shared/hooks/table-row-selection-context'
import { ClientsTable } from '@/features/clients/components/list/ClientsTable'
import { ClientsFiltersBar } from '@/features/clients/components/list/ClientsFiltersBar'
import { ClientsBulkEditDialog } from '@/features/clients/components/list/ClientsBulkEditDialog'
import { ClientFormDialog } from '@/features/clients/components/ClientFormDialog'
import { ClientQuickAddDialog } from '@/features/clients/components/ClientQuickAddDialog'
import { useClientsList } from '@/features/clients/hooks/use-clients'
import { useClientMutations } from '@/features/clients/hooks/use-client-mutations'
import { useClientRowSelection } from '@/features/clients/hooks/use-client-row-selection'
import { useClientTabNavigation } from '@/features/clients/hooks/use-client-tab-navigation'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { usePagination } from '@/shared/hooks/use-pagination'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import { CLIENTS_PAGE_SIZE_STORAGE_KEY } from '@/types/pagination'
import {
  EMPTY_CLIENT_PANEL_FILTERS,
  type ClientFilters,
  type ClientPanelFilters,
  type ClientSortDir,
  type ClientSortField,
} from '@/repositories/interfaces'
import { useLabelIdsSearchParam } from '@/features/labels/hooks/use-label-ids-search-param'
import { removeActionSearchParams } from '@/features/labels/utils/label-filter-navigation'

export function ClientsPage() {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const canCreate = canMutate(role, 'passenger', 'create')
  const [searchParams, setSearchParams] = useSearchParams()
  const { navigateToClient } = useClientTabNavigation()

  const [searchInput, setSearchInput] = useState('')
  const [panelFilters, setPanelFilters] = useState<ClientPanelFilters>(EMPTY_CLIENT_PANEL_FILTERS)
  const applyLabelIdsFromUrl = useCallback((labelIds: string[]) => {
    setPanelFilters((current) => ({ ...current, labelIds }))
  }, [])
  useLabelIdsSearchParam(applyLabelIdsFromUrl)
  const [sortBy, setSortBy] = useState<ClientSortField>('reference')
  const [sortDir, setSortDir] = useState<ClientSortDir>('desc')
  const [bulkEditOpen, setBulkEditOpen] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  const search = useDebouncedValue(searchInput, 300)
  const { page, pageSize, setPage, setPageSize, resetPage } = usePagination({
    persistKey: CLIENTS_PAGE_SIZE_STORAGE_KEY,
  })
  const tableLayout = useClientsTableLayout()
  const {
    createClient,
    cloneClient,
    updateClient,
    deleteClient,
    bulkDeleteClients,
    bulkUpdateClients,
    isFormPending,
    isBulkPending,
    cloningClientId,
    deletingClientId,
  } = useClientMutations()

  const filters: ClientFilters = {
    search,
    status: panelFilters.status,
    type: panelFilters.type,
    country: panelFilters.country,
    city: panelFilters.city,
    company: panelFilters.company,
    labelIds: panelFilters.labelIds,
    sortBy,
    sortDir,
  }
  const { data: result, isLoading, isFetching, isPlaceholderData } = useClientsList(filters, page, pageSize)
  const isListRefreshing = isFetching && !isLoading && !isPlaceholderData
  const pageClientIds = useMemo(() => result?.items.map((client) => client.id) ?? [], [result?.items])
  const selection = useClientRowSelection(pageClientIds)

  useEffect(() => {
    resetPage()
  }, [search, panelFilters, pageSize, sortBy, sortDir, resetPage])

  useEffect(() => {
    if (searchParams.get('create') === '1' && canCreate) {
      setEditingClient(null)
      setFormOpen(true)
      removeActionSearchParams(searchParams, setSearchParams, ['create'])
      return
    }
    if (searchParams.get('quickAdd') === '1' && canCreate) {
      setQuickAddOpen(true)
      removeActionSearchParams(searchParams, setSearchParams, ['quickAdd'])
    }
  }, [searchParams, setSearchParams, canCreate])

  const handleSort = useCallback(
    (field: ClientSortField) => {
      if (sortBy === field) {
        setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
        return
      }
      setSortBy(field)
      const defaultAsc =
        field === 'displayName' || field === 'email' || field === 'status' || field === 'type'
      setSortDir(field === 'reference' || field === 'createdAt' ? 'desc' : defaultAsc ? 'asc' : 'desc')
    },
    [sortBy],
  )

  const openCreate = useCallback(() => {
    setEditingClient(null)
    setFormOpen(true)
  }, [])

  const openQuickAdd = useCallback(() => {
    setQuickAddOpen(true)
  }, [])

  const openEdit = useCallback((client: Client) => {
    setEditingClient(client)
    setFormOpen(true)
  }, [])

  const handleClone = useCallback(
    (client: Client) => {
      if (!canCreate) return
      cloneClient.mutate(client)
    },
    [canCreate, cloneClient],
  )

  const handleBulkDelete = useCallback(() => {
    const ids = Array.from(selection.selectedIds)
    if (ids.length === 0) return
    bulkDeleteClients.mutate(ids, {
      onSuccess: () => selection.clear(),
    })
  }, [bulkDeleteClients, selection])

  const handleBulkEdit = useCallback(() => {
    const ids = Array.from(selection.selectedIds)
    if (ids.length === 0) return
    if (ids.length === 1) {
      navigateToClient(ids[0], { tab: 'profile' })
      return
    }
    setBulkEditOpen(true)
  }, [navigateToClient, selection.selectedIds])

  const handleBulkUpdate = useCallback(
    (patch: { status?: ClientStatus; type?: Client['type'] }) => {
      const ids = Array.from(selection.selectedIds)
      if (ids.length === 0) return
      const safePatch = { ...patch }
      if (!canManageClientStatus(role)) delete safePatch.status
      if (Object.keys(safePatch).length === 0) return
      bulkUpdateClients.mutate(
        { clientIds: ids, patch: safePatch },
        {
          onSuccess: () => {
            selection.clear()
            setBulkEditOpen(false)
          },
        },
      )
    },
    [bulkUpdateClients, selection, role],
  )

  const handleDeleteClient = useCallback(
    (id: string) => {
      deleteClient.mutate(id)
    },
    [deleteClient],
  )

  const handleQuickAddSubmit = useCallback(
    (input: Parameters<typeof createClient.mutate>[0]) => {
      const patch: Partial<typeof input> = { ...input }
      if (!canManageClientStatus(role)) {
        delete patch.status
        delete patch.joinedAt
      }

      createClient.mutate(patch as Parameters<typeof createClient.mutate>[0], {
        onSuccess: (created) => {
          setQuickAddOpen(false)
          navigateToClient(created.id, { tab: 'profile' })
        },
      })
    },
    [createClient, navigateToClient, role],
  )

  const handleFormSubmit = useCallback(
    (input: Parameters<typeof createClient.mutate>[0]) => {
      const patch: Partial<typeof input> = { ...input }
      if (!canManageClientStatus(role)) {
        delete patch.status
        delete patch.joinedAt
      }

      if (editingClient) {
        updateClient.mutate(
          { id: editingClient.id, patch },
          {
            onSuccess: () => {
              setFormOpen(false)
              setEditingClient(null)
            },
          },
        )
        return
      }

      createClient.mutate(patch as Parameters<typeof createClient.mutate>[0], {
        onSuccess: (created) => {
          setFormOpen(false)
          navigateToClient(created.id, { tab: 'profile' })
        },
      })
    },
    [createClient, updateClient, editingClient, navigateToClient, role],
  )

  return (
    <Page layout="viewportFlush" className="min-h-0 flex-1">
      <TableRowSelectionProvider store={selection.store}>
        <div className="flex h-full min-h-0 flex-1 flex-col">
          <ClientsTable
            toolbar={
              <ClientsFiltersBar
                searchInput={searchInput}
                onSearchChange={setSearchInput}
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={handleSort}
                onSortDirChange={setSortDir}
                panelFilters={panelFilters}
                onPanelFiltersChange={setPanelFilters}
                matchCount={result?.total}
                isFetching={isListRefreshing}
                selection={selection}
                pageClientCount={result?.items.length ?? 0}
                isBulkPending={isBulkPending}
                onBulkEdit={handleBulkEdit}
                onBulkDelete={handleBulkDelete}
                canCreate={canCreate}
                onCreate={openCreate}
                onQuickAdd={openQuickAdd}
                columnPicker={<ClientsTableColumnPicker layout={tableLayout} />}
              />
            }
            selection={selection}
            result={result}
            page={page}
            pageSize={pageSize}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            isLoading={isLoading}
            isFetching={isListRefreshing}
            layout={tableLayout}
            onEditClient={openEdit}
            onCloneClient={canCreate ? handleClone : undefined}
            cloningClientId={cloningClientId}
            onDeleteClient={handleDeleteClient}
            deletingClientId={deletingClientId}
          />

          <ClientsBulkEditDialog
          open={bulkEditOpen}
          onOpenChange={setBulkEditOpen}
          selectedCount={selection.selectedCount}
          isPending={isBulkPending}
          canEditStatus={canManageClientStatus(role)}
          onApply={handleBulkUpdate}
        />

        <ClientQuickAddDialog
          open={quickAddOpen}
          onOpenChange={setQuickAddOpen}
          isPending={isFormPending}
          onSubmit={handleQuickAddSubmit}
          onOpenFullForm={openCreate}
        />

        <ClientFormDialog
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open)
            if (!open) setEditingClient(null)
          }}
          client={editingClient}
          isPending={isFormPending}
          onSubmit={handleFormSubmit}
        />
        </div>
      </TableRowSelectionProvider>
    </Page>
  )
}
