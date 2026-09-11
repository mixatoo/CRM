import type { MouseEvent, ReactNode } from 'react'
import { useMemo } from 'react'
import { Inbox } from 'lucide-react'
import type { Supplier } from '@/domain/entities/supplier'
import { SUPPLIER_CATEGORY_LABELS } from '@/domain/entities/supplier'
import { DataTableEmptyRow } from '@/design-system/components/DataTableEmptyState'
import { DataTableShell } from '@/design-system/layout/DataTableShell'
import { StickyDataTable } from '@/design-system/components/StickyDataTable'
import {
  DataTableColumnHeader,
  dataTableAriaSort,
} from '@/design-system/components/DataTableColumnHeader'
import { Pagination } from '@/design-system/components/Pagination'
import { Skeleton } from '@/design-system/components/Skeleton'
import { SupplierStatusBadge } from '@/features/suppliers/components/SupplierStatusBadge'
import { SupplierRowActions } from '@/features/suppliers/components/list/SupplierRowActions'
import { EntityLabelChips } from '@/features/labels/components/EntityLabelChips'
import { useEntityLabelAssignments } from '@/features/labels/hooks/use-labels'
import { TableRowCheckbox } from '@/features/trips/components/list/TableRowCheckbox'
import {
  SuppliersTableColgroup,
  SUPPLIERS_TABLE_COLUMN_ORDER,
  SUPPLIERS_TABLE_COLUMN_WIDTHS,
  type SuppliersTableColumnKey,
} from '@/features/suppliers/components/list/suppliers-table-columns'
import { maskSupplierField } from '@/features/suppliers/utils/supplier-format'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useSupplierMutations } from '@/features/suppliers/hooks/use-supplier-mutations'
import { useSupplierServiceCounts } from '@/features/suppliers/hooks/use-suppliers'
import type { SupplierRowSelection } from '@/features/suppliers/hooks/use-supplier-row-selection'
import { isBackgroundSupplierOpen, useSupplierTabNavigation } from '@/features/suppliers/hooks/use-supplier-tab-navigation'
import { formatDate } from '@/shared/utils/date-format'
import type { TableColumnVisibility } from '@/shared/hooks/use-table-column-visibility'
import type { PaginatedResult, PageSizeOption } from '@/types/pagination'
import type { SupplierSortDir, SupplierSortField } from '@/repositories/interfaces'
import {
  type TableAlign,
  crmInteractiveTableRowClass,
  crmTableActionsCellClass,
  crmTableSelectionCellClass,
  tableCellClass,
  tableSelectionCellClass,
  tableSelectionHeadClass,
} from '@/design-system/components/table-styles'
import { cn } from '@/shared/utils/cn'

function SortableHeader({
  label,
  field,
  sortBy,
  sortDir,
  onSort,
  align = 'left',
  className,
}: {
  label: string
  field: SupplierSortField
  sortBy: SupplierSortField
  sortDir: SupplierSortDir
  onSort: (field: SupplierSortField) => void
  align?: TableAlign
  className?: string
}) {
  const active = sortBy === field

  return (
    <DataTableColumnHeader
      label={label}
      align={align}
      className={className}
      active={active}
      sortDir={sortDir}
      onSort={() => onSort(field)}
      aria-sort={dataTableAriaSort(active, sortDir)}
    />
  )
}

function SuppliersTableSkeleton({ colCount }: { colCount: number }) {
  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => (
        <tr key={i} className="border-b border-[var(--color-border)]">
          {Array.from({ length: colCount }).map((__, j) => (
            <td key={j} className={j === 0 ? tableSelectionCellClass() : tableCellClass('left')}>
              {j === 0 ? (
                <Skeleton className="mx-auto size-5 rounded-full" />
              ) : (
                <Skeleton className="h-3.5 w-full max-w-[6rem]" />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

interface SuppliersTableProps {
  toolbar?: ReactNode
  selection: SupplierRowSelection
  result?: PaginatedResult<Supplier>
  page: number
  pageSize: number
  sortBy: SupplierSortField
  sortDir: SupplierSortDir
  onSort: (field: SupplierSortField) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: PageSizeOption) => void
  isLoading?: boolean
  isFetching?: boolean
  columnVisibility: TableColumnVisibility<SuppliersTableColumnKey>
  onEditSupplier: (supplier: Supplier) => void
}

export function SuppliersTable({
  toolbar,
  selection,
  result,
  page,
  pageSize,
  sortBy,
  sortDir,
  onSort,
  onPageChange,
  onPageSizeChange,
  isLoading,
  isFetching,
  columnVisibility,
  onEditSupplier,
}: SuppliersTableProps) {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const { navigateToSupplier } = useSupplierTabNavigation()
  const { isVisible } = columnVisibility
  const visibleKeys = useMemo(
    () => new Set(SUPPLIERS_TABLE_COLUMN_ORDER.filter((key) => isVisible(key))),
    [isVisible],
  )
  const visibleColCount = visibleKeys.size
  const show = isVisible

  const suppliers = result?.items ?? []
  const supplierIds = useMemo(() => suppliers.map((supplier) => supplier.id), [suppliers])
  const { data: serviceCounts } = useSupplierServiceCounts(supplierIds)
  const { data: labelsByTarget } = useEntityLabelAssignments('supplier', supplierIds)
  const { deleteSupplier, isPending: isMutating } = useSupplierMutations()

  const total = result?.total ?? 0
  const totalPages = total > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1

  const {
    allPageSelected,
    somePageSelected,
    isDragSelecting,
    isSelected,
    togglePage,
    handleSelectionPointerDown,
    handleSelectionPointerEnter,
    handleSelectionClick,
  } = selection

  const openSupplier = (supplierId: string, event?: MouseEvent) => {
    navigateToSupplier(supplierId, {
      background: event ? isBackgroundSupplierOpen(event) : false,
    })
  }

  return (
    <DataTableShell
      className="h-full"
      header={toolbar}
      headerClassName="p-0"
      isFetching={isFetching && !isLoading}
      footer={
        <Pagination
          compact
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      }
    >
      <StickyDataTable
        fill
        freezeLeadingColumns={2}
        freezeLeadingColumnWidth={SUPPLIERS_TABLE_COLUMN_WIDTHS.selection}
        tableClassName={cn('table-fixed text-sm', isDragSelecting && 'select-none')}
      >
        <SuppliersTableColgroup visibleKeys={visibleKeys} />
        <thead>
          <tr>
            <th
              className={tableSelectionHeadClass()}
              data-supplier-row-selection=""
              onClick={(e) => {
                e.stopPropagation()
                togglePage()
              }}
            >
              <TableRowCheckbox
                checked={allPageSelected}
                indeterminate={somePageSelected}
                onChange={() => togglePage()}
                aria-label={allPageSelected ? 'Deselect all on this page' : 'Select all on this page'}
              />
            </th>
            {show('reference') ? (
              <SortableHeader label="ID" field="reference" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
            ) : null}
            {show('name') ? (
              <SortableHeader label="Name" field="displayName" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
            ) : null}
            {show('category') ? (
              <SortableHeader label="Category" field="category" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
            ) : null}
            {show('country') ? (
              <SortableHeader label="Country" field="country" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
            ) : null}
            {show('email') ? (
              <SortableHeader label="Email" field="email" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
            ) : null}
            {show('phone') ? (
              <DataTableColumnHeader label="Phone" align="left" sortable={false} />
            ) : null}
            {show('status') ? (
              <SortableHeader label="Status" field="status" sortBy={sortBy} sortDir={sortDir} onSort={onSort} align="center" />
            ) : null}
            {show('services') ? (
              <DataTableColumnHeader label="Services" align="right" sortable={false} className="px-2" />
            ) : null}
            {show('labels') ? (
              <DataTableColumnHeader label="Labels" align="left" sortable={false} />
            ) : null}
            {show('updated') ? (
              <SortableHeader label="Updated" field="updatedAt" sortBy={sortBy} sortDir={sortDir} onSort={onSort} className="px-2" />
            ) : null}
            <DataTableColumnHeader label="Actions" align="center" sortable={false} />
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <SuppliersTableSkeleton colCount={visibleColCount} />
          ) : suppliers.length === 0 ? (
            <DataTableEmptyRow
              colSpan={visibleColCount}
              icon={Inbox}
              title="No suppliers found"
              description="Adjust search or filters."
            />
          ) : (
            suppliers.map((supplier) => {
              const selected = isSelected(supplier.id)
              return (
                <tr
                  key={supplier.id}
                  data-interactive="true"
                  data-selected={selected ? 'true' : undefined}
                  tabIndex={0}
                  role="link"
                  onClick={(e) => {
                    const target = e.target as HTMLElement
                    if (target.closest('[data-supplier-row-action]')) return
                    if (target.closest('[data-supplier-row-selection]')) return
                    openSupplier(supplier.id, e)
                  }}
                  onAuxClick={(e) => {
                    if (e.button !== 1) return
                    e.preventDefault()
                    openSupplier(supplier.id, e)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      openSupplier(supplier.id)
                    }
                  }}
                  className={crmInteractiveTableRowClass({ selected })}
                >
                  <td
                    className={crmTableSelectionCellClass(
                      cn(selected && 'bg-[var(--color-accent-muted)]/60', isDragSelecting && 'cursor-grabbing'),
                    )}
                    data-supplier-row-selection=""
                    data-supplier-id={supplier.id}
                    onPointerDown={(e) => {
                      e.stopPropagation()
                      handleSelectionPointerDown(supplier.id, e.button)
                    }}
                    onPointerEnter={() => handleSelectionPointerEnter(supplier.id)}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelectionClick(supplier.id, e.shiftKey)
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <TableRowCheckbox
                      checked={selected}
                      onChange={(shiftKey) => handleSelectionClick(supplier.id, shiftKey ?? false)}
                      aria-label={`Select supplier ${supplier.reference}`}
                    />
                  </td>
                  {show('reference') ? (
                    <td className={tableCellClass('left', { numeric: true, extra: 'px-2 text-[var(--color-accent)]' })}>
                      {supplier.reference}
                    </td>
                  ) : null}
                  {show('name') ? (
                    <td className={tableCellClass('left', { extra: 'truncate font-medium' })} title={supplier.displayName}>
                      {supplier.displayName}
                    </td>
                  ) : null}
                  {show('category') ? (
                    <td className={tableCellClass('left', { muted: true, extra: 'text-xs' })}>
                      {SUPPLIER_CATEGORY_LABELS[supplier.category]}
                    </td>
                  ) : null}
                  {show('country') ? (
                    <td className={tableCellClass('left', { extra: 'truncate' })} title={supplier.country ?? undefined}>
                      {supplier.country ?? '—'}
                    </td>
                  ) : null}
                  {show('email') ? (
                    <td className={tableCellClass('left', { extra: 'truncate' })} title={supplier.email ?? undefined}>
                      {maskSupplierField(role, supplier.email)}
                    </td>
                  ) : null}
                  {show('phone') ? (
                    <td className={tableCellClass('left')}>{maskSupplierField(role, supplier.phone)}</td>
                  ) : null}
                  {show('status') ? (
                    <td className={tableCellClass('center', { extra: 'px-2' })}>
                      <div className="flex justify-center">
                        <SupplierStatusBadge status={supplier.status} />
                      </div>
                    </td>
                  ) : null}
                  {show('services') ? (
                    <td className={tableCellClass('right', { numeric: true, extra: 'px-2' })}>
                      {serviceCounts?.[supplier.id] ?? 0}
                    </td>
                  ) : null}
                  {show('labels') ? (
                    <td className={tableCellClass('left', { extra: 'px-2' })}>
                      <EntityLabelChips labels={labelsByTarget?.get(supplier.id) ?? []} maxVisible={2} nowrap />
                    </td>
                  ) : null}
                  {show('updated') ? (
                    <td className={tableCellClass('left', { numeric: true, muted: true, extra: 'px-2 text-xs' })}>
                      {formatDate(supplier.updatedAt)}
                    </td>
                  ) : null}
                  <td
                    className={crmTableActionsCellClass()}
                    data-supplier-row-action=""
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <SupplierRowActions
                      supplier={supplier}
                      onView={(row) => openSupplier(row.id)}
                      onEdit={onEditSupplier}
                      onDelete={(id) => deleteSupplier.mutate(id)}
                      isDeleting={isMutating}
                    />
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </StickyDataTable>
    </DataTableShell>
  )
}
