import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Client } from '@/domain/entities/client'
import type { Traveler } from '@/domain/entities/traveler'
import { clientPrimaryLabel } from '@/domain/entities/client'
import { canMutate } from '@/domain/policies/permissions'
import { ClientTravelersTable } from '@/features/travelers/components/ClientTravelersTable'
import { ClientTravelersTableColumnPicker } from '@/features/travelers/components/ClientTravelersTableColumnPicker'
import { ClientTravelersToolbar } from '@/features/travelers/components/ClientTravelersToolbar'
import { TravelerFormDialog } from '@/features/travelers/components/TravelerFormDialog'
import { useClientTravelersList } from '@/features/travelers/hooks/use-client-travelers-list'
import { useClientTravelersRowSelection } from '@/features/travelers/hooks/use-client-travelers-row-selection'
import { useClientTravelersTableLayout } from '@/features/travelers/hooks/use-client-travelers-table-layout'
import { useTravelerMutations } from '@/features/travelers/hooks/use-traveler-mutations'
import type { ClientTravelerSortDir, ClientTravelerSortField } from '@/features/travelers/utils/client-travelers-list'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { TableRowSelectionProvider } from '@/shared/hooks/table-row-selection-context'
import { usePagination } from '@/shared/hooks/use-pagination'
import { CLIENTS_PAGE_SIZE_STORAGE_KEY } from '@/types/pagination'

interface ClientTravelersTabProps {
  client: Client
}

export function ClientTravelersTab({ client }: ClientTravelersTabProps) {
  const navigate = useNavigate()
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const canCreate = canMutate(role, 'passenger', 'create')
  const canDelete = canMutate(role, 'passenger', 'delete')

  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<ClientTravelerSortField>('name')
  const [sortDir, setSortDir] = useState<ClientTravelerSortDir>('asc')
  const [formOpen, setFormOpen] = useState(false)
  const [editingTraveler, setEditingTraveler] = useState<Traveler | null>(null)

  const { page, pageSize, setPage, setPageSize, resetPage } = usePagination({
    persistKey: CLIENTS_PAGE_SIZE_STORAGE_KEY,
  })
  const tableLayout = useClientTravelersTableLayout()
  const {
    createTraveler,
    updateTraveler,
    deleteTraveler,
    isFormPending,
    deletingTravelerId,
  } = useTravelerMutations()

  const { data: result, isLoading, isFetching } = useClientTravelersList(
    client.id,
    sortBy,
    sortDir,
    page,
    pageSize,
    search,
  )
  const pageTravelerIds = useMemo(() => result?.items.map((traveler) => traveler.id) ?? [], [result?.items])
  const selection = useClientTravelersRowSelection(pageTravelerIds)

  const handleSort = useCallback((field: ClientTravelerSortField) => {
    setSortBy((current) => {
      if (current === field) {
        setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
        return current
      }
      setSortDir('asc')
      return field
    })
  }, [])

  useEffect(() => {
    resetPage()
  }, [client.id, pageSize, search, sortBy, sortDir, resetPage])

  const isListRefreshing = isFetching && !isLoading

  const openCreate = useCallback(() => {
    setEditingTraveler(null)
    setFormOpen(true)
  }, [])

  const openEdit = useCallback((traveler: Traveler) => {
    setEditingTraveler(traveler)
    setFormOpen(true)
  }, [])

  const openProfile = useCallback(
    (traveler: Traveler) => {
      navigate(`/travelers/${traveler.id}`)
    },
    [navigate],
  )

  const handleDelete = useCallback(
    (id: string) => {
      if (!canDelete) return
      deleteTraveler.mutate(id)
    },
    [canDelete, deleteTraveler],
  )

  const handleFormSubmit = useCallback(
    (input: Parameters<typeof createTraveler.mutate>[0]) => {
      if (editingTraveler) {
        updateTraveler.mutate(
          { id: editingTraveler.id, patch: { ...input, accountId: client.id } },
          {
            onSuccess: () => {
              setFormOpen(false)
              setEditingTraveler(null)
            },
          },
        )
        return
      }

      createTraveler.mutate(
        { ...input, accountId: client.id },
        {
          onSuccess: () => {
            setFormOpen(false)
          },
        },
      )
    },
    [client.id, createTraveler, updateTraveler, editingTraveler],
  )

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <TableRowSelectionProvider store={selection.store}>
        <ClientTravelersTable
          toolbar={
            <ClientTravelersToolbar
              total={result?.total}
              isFetching={isListRefreshing}
              search={search}
              onSearchChange={setSearch}
              canCreate={canCreate}
              onCreate={openCreate}
              columnPicker={<ClientTravelersTableColumnPicker layout={tableLayout} />}
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
          hasActiveSearch={search.trim().length > 0}
          onEditTraveler={openEdit}
          onOpenProfile={openProfile}
          onDeleteTraveler={canDelete ? handleDelete : undefined}
          deletingTravelerId={deletingTravelerId}
        />
      </TableRowSelectionProvider>

      <TravelerFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingTraveler(null)
        }}
        traveler={editingTraveler}
        lockedAccountId={client.id}
        lockedAccountLabel={clientPrimaryLabel(client)}
        isPending={isFormPending}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
