import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Trip, ServiceCategory } from '@/domain/entities'
import type { TripServiceStatus } from '@/domain/entities/trip-service'
import { DataTableShell } from '@/design-system/layout/DataTableShell'
import { Pagination } from '@/design-system/components/Pagination'
import { TripServicesAddDialog } from '@/features/trips/components/services/TripServicesAddDialog'
import { TripServicesBulkEditDialog } from '@/features/trips/components/services/TripServicesBulkEditDialog'
import { TripServicesTable } from '@/features/trips/components/services/TripServicesTable'
import { TripServicesToolbar } from '@/features/trips/components/services/TripServicesToolbar'
import {
  paginateTripServices,
  sortTripServices,
  type TripServiceSortDir,
  type TripServiceSortField,
} from '@/features/trips/components/services/trip-services-list'
import { useTripServiceMutations } from '@/features/trips/hooks/use-trip-service-mutations'
import { useTripServices } from '@/features/trips/hooks/use-trip-services'
import { useTripRowSelection } from '@/features/trips/hooks/use-trip-row-selection'
import { usePagination } from '@/shared/hooks/use-pagination'
import { useTableColumnVisibility } from '@/shared/hooks/use-table-column-visibility'
import { TRIP_SERVICES_PAGE_SIZE_STORAGE_KEY } from '@/types/pagination'
import { TRIP_SERVICES_TABLE_COLUMNS_STORAGE_KEY } from '@/types/table-columns'
import { TableColumnPicker } from '@/design-system/components/TableColumnPicker'
import { SERVICES_TABLE_COLUMN_OPTIONS } from '@/features/trips/components/services/services-table-columns'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { canMutate } from '@/domain/policies/permissions'
import { defaultTripServiceStartDate, type CreateTripServiceInput } from '@/features/trips/utils/create-trip-service'

interface TripServicesTabProps {
  trip: Trip
}

export function TripServicesTab({ trip }: TripServicesTabProps) {
  const navigate = useNavigate()
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const canCreate = canMutate(role, 'service', 'create')
  const canBulkMutate = canMutate(role, 'service', 'update') || canMutate(role, 'service', 'delete')
  const { data: services = [], isLoading, isFetching } = useTripServices(trip.id)
  const { page, pageSize, setPage, setPageSize, resetPage } = usePagination({
    persistKey: TRIP_SERVICES_PAGE_SIZE_STORAGE_KEY,
  })
  const servicesColumnVisibility = useTableColumnVisibility(
    TRIP_SERVICES_TABLE_COLUMNS_STORAGE_KEY,
    SERVICES_TABLE_COLUMN_OPTIONS,
  )
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<ServiceCategory | 'all'>('all')
  const [status, setStatus] = useState<TripServiceStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<TripServiceSortField>('lineNumber')
  const [sortDir, setSortDir] = useState<TripServiceSortDir>('asc')
  const [bulkEditOpen, setBulkEditOpen] = useState(false)
  const [addServiceOpen, setAddServiceOpen] = useState(false)

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase()
    return services.filter((service) => {
      if (category !== 'all' && service.category !== category) return false
      if (status !== 'all' && service.status !== status) return false
      if (!query) return true
      return (
        service.name.toLowerCase().includes(query) ||
        (service.supplierName?.toLowerCase().includes(query) ?? false)
      )
    })
  }, [services, search, category, status])

  const sortedServices = useMemo(
    () => sortTripServices(filteredServices, sortBy, sortDir),
    [filteredServices, sortBy, sortDir],
  )

  const total = sortedServices.length
  const totalPages = total > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1
  const pageServices = useMemo(
    () => paginateTripServices(sortedServices, page, pageSize),
    [sortedServices, page, pageSize],
  )
  const pageServiceIds = useMemo(() => pageServices.map((service) => service.id), [pageServices])
  const selection = useTripRowSelection(pageServiceIds)
  const { createServiceAsync, bulkDeleteServices, bulkCloneServices, bulkUpdateServices, isCreatePending, isBulkPending } =
    useTripServiceMutations(trip.id)

  const handleBulkDelete = useCallback(() => {
    const ids = Array.from(selection.selectedIds)
    if (ids.length === 0) return
    bulkDeleteServices(ids, {
      onSuccess: () => selection.clear(),
    })
  }, [bulkDeleteServices, selection])

  const handleBulkClone = useCallback(() => {
    const ids = Array.from(selection.selectedIds)
    if (ids.length === 0) return
    bulkCloneServices(ids, {
      onSuccess: () => selection.clear(),
    })
  }, [bulkCloneServices, selection])

  const handleBulkEdit = useCallback(() => {
    if (selection.selectedCount === 0) return
    setBulkEditOpen(true)
  }, [selection.selectedCount])

  const handleBulkUpdateStatus = useCallback(
    (nextStatus: TripServiceStatus) => {
      const ids = Array.from(selection.selectedIds)
      if (ids.length === 0) return
      bulkUpdateServices(
        { serviceIds: ids, status: nextStatus },
        {
          onSuccess: () => {
            selection.clear()
            setBulkEditOpen(false)
          },
        },
      )
    },
    [bulkUpdateServices, selection],
  )

  useEffect(() => {
    selection.clear()
  }, [trip.id, selection.clear])

  useEffect(() => {
    resetPage()
  }, [trip.id, search, category, status, sortBy, sortDir, resetPage])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages, setPage])

  const handleSortField = (field: TripServiceSortField) => {
    if (sortBy === field) return
    setSortBy(field)
    setSortDir('asc')
  }

  const handleSortDirChange = (dir: TripServiceSortDir) => {
    setSortDir(dir)
  }

  const handleSort = (field: TripServiceSortField) => {
    if (sortBy === field) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortBy(field)
    setSortDir('asc')
  }

  const handleAddService = () => {
    setAddServiceOpen(true)
  }

  const handleCreateService = useCallback(
    (input: CreateTripServiceInput) => {
      void createServiceAsync(
        { trip, input },
        {
          onSuccess: (service) => {
            setAddServiceOpen(false)
            if (service.category === 'flight') {
              navigate(`/trips/${trip.id}/services/${service.id}/flight`)
              return
            }
            navigate(`/trips/${trip.id}/services/${service.id}`)
          },
        },
      )
    },
    [createServiceAsync, navigate, trip],
  )

  return (
    <div className="flex h-full min-h-0 flex-col">
      <DataTableShell
        className="h-full min-h-0 flex-1"
        isFetching={isFetching && !isLoading}
        header={
          <TripServicesToolbar
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
            status={status}
            onStatusChange={setStatus}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSortField}
            onSortDirChange={handleSortDirChange}
            onAddService={handleAddService}
            canCreate={canCreate}
            canBulkMutate={canBulkMutate}
            selection={selection}
            pageServiceCount={pageServices.length}
            isBulkPending={isBulkPending}
            onBulkClone={handleBulkClone}
            onBulkEdit={handleBulkEdit}
            onBulkDelete={handleBulkDelete}
            columnPicker={
              <TableColumnPicker columnVisibility={servicesColumnVisibility} />
            }
          />
        }
        headerClassName="p-0"
        footer={
          <Pagination
            compact
            showWhenEmpty
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        }
      >
        <TripServicesTable
          services={pageServices}
          currency={trip.currency}
          isLoading={isLoading}
          isEmpty={total === 0}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          selection={selection}
          tripId={trip.id}
          columnVisibility={servicesColumnVisibility}
        />
      </DataTableShell>

      <TripServicesBulkEditDialog
        open={bulkEditOpen}
        onOpenChange={setBulkEditOpen}
        selectedCount={selection.selectedCount}
        isPending={isBulkPending}
        onApply={handleBulkUpdateStatus}
      />

      <TripServicesAddDialog
        open={addServiceOpen}
        onOpenChange={setAddServiceOpen}
        defaultStartDate={defaultTripServiceStartDate(trip)}
        isPending={isCreatePending}
        onCreate={handleCreateService}
      />
    </div>
  )
}
