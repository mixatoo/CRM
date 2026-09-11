import { Briefcase, Eye, MoreHorizontal } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { TripService } from '@/domain/entities/trip-service'
import { DataTableEmptyRow } from '@/design-system/components/DataTableEmptyState'
import {
  DataTableColumnHeader,
  dataTableAriaSort,
} from '@/design-system/components/DataTableColumnHeader'
import { StickyDataTable } from '@/design-system/components/StickyDataTable'
import { Skeleton } from '@/design-system/components/Skeleton'
import { AccountingAmount } from '@/design-system/components/AccountingAmount'
import {
  type TableAlign,
  tableActionsCellClass,
  tableCellClass,
  tableSelectionCellClass,
  tableSelectionHeadClass,
} from '@/design-system/components/table-styles'
import { TableRowCheckbox } from '@/features/trips/components/list/TableRowCheckbox'
import type { TripRowSelection } from '@/features/trips/hooks/use-trip-row-selection'
import { TripServiceIdentityCell } from '@/features/trips/components/services/TripServiceIdentityCell'
import { TripServiceMarginCell } from '@/features/trips/components/services/TripServiceMarginCell'
import { TripServiceScheduleCell } from '@/features/trips/components/services/TripServiceScheduleCell'
import { TripServiceSupplierCell } from '@/features/trips/components/services/TripServiceSupplierCell'
import { TripServiceStatusBadge } from '@/features/trips/components/services/TripServiceStatusBadge'
import {
  TRIP_SERVICE_FINANCIAL_AMOUNT,
  TRIP_SERVICE_FINANCIAL_COST_CELL,
  TRIP_SERVICE_FINANCIAL_MARGIN_CELL,
  TRIP_SERVICE_FINANCIAL_SELLING_CELL,
  TRIP_SERVICE_STATUS_ROW_ACCENT,
} from '@/features/trips/components/services/service-styles'
import {
  SERVICES_TABLE_COLUMN_ORDER,
  ServicesTableColgroup,
  SERVICES_TABLE_COLUMN_WIDTHS,
  SERVICES_TABLE_MIN_WIDTH_CLASS,
  type ServicesTableColumnKey,
} from '@/features/trips/components/services/services-table-columns'
import { tripServiceSelling } from '@/features/trips/components/services/trip-service-financial'
import type {
  TripServiceSortDir,
  TripServiceSortField,
} from '@/features/trips/components/services/trip-services-list'
import { formatCount } from '@/features/trips/utils/format'
import type { TableColumnVisibility } from '@/shared/hooks/use-table-column-visibility'
import { cn } from '@/shared/utils/cn'

interface TripServicesTableProps {
  services: TripService[]
  currency: string
  isLoading?: boolean
  isEmpty?: boolean
  sortBy: TripServiceSortField
  sortDir: TripServiceSortDir
  onSort: (field: TripServiceSortField) => void
  selection: TripRowSelection
  tripId: string
  columnVisibility: TableColumnVisibility<ServicesTableColumnKey>
}

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
  field: TripServiceSortField
  sortBy: TripServiceSortField
  sortDir: TripServiceSortDir
  onSort: (field: TripServiceSortField) => void
  align?: TableAlign
  className?: string
}) {
  const active = sortBy === field

  return (
    <DataTableColumnHeader
      label={label}
      align={align}
      className={className}
      compact
      active={active}
      sortDir={sortDir}
      onSort={() => onSort(field)}
      aria-sort={dataTableAriaSort(active, sortDir)}
    />
  )
}

const SERVICES_ROW_CELL = 'py-2'

function TripServicesSkeleton({ colCount }: { colCount: number }) {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <tr key={i} className="border-b border-[var(--color-border)]">
          {Array.from({ length: colCount }).map((__, j) => (
            <td key={j} className={j === 0 ? tableSelectionCellClass(SERVICES_ROW_CELL) : tableCellClass('left', { extra: SERVICES_ROW_CELL })}>
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

export function TripServicesTable({
  services,
  currency,
  isLoading,
  isEmpty = false,
  sortBy,
  sortDir,
  onSort,
  selection,
  tripId,
  columnVisibility,
}: TripServicesTableProps) {
  const navigate = useNavigate()
  const { isVisible } = columnVisibility
  const visibleKeys = useMemo(
    () => new Set(SERVICES_TABLE_COLUMN_ORDER.filter((key) => isVisible(key))),
    [isVisible],
  )
  const visibleColCount = visibleKeys.size
  const show = isVisible

  const openService = (service: TripService) => {
    if (service.category === 'flight') {
      navigate(`/trips/${tripId}/services/${service.id}/flight`)
      return
    }
    navigate(`/trips/${tripId}/services/${service.id}`)
  }

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

  return (
    <StickyDataTable
      fill
      freezeLeadingColumns={2}
      freezeLeadingColumnWidth={SERVICES_TABLE_COLUMN_WIDTHS.selection}
      className={SERVICES_TABLE_MIN_WIDTH_CLASS}
      tableClassName={cn('w-full table-fixed text-sm', SERVICES_TABLE_MIN_WIDTH_CLASS, isDragSelecting && 'select-none')}
    >
      <ServicesTableColgroup visibleKeys={visibleKeys} />
      <thead>
        <tr>
          <th
            className={tableSelectionHeadClass(undefined, true)}
            data-service-row-selection=""
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
          <SortableHeader
            label="#"
            field="lineNumber"
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={onSort}
            className="px-2"
          />
          {show('date') ? (
            <SortableHeader
              label="Date"
              field="startDate"
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={onSort}
              className="px-2"
            />
          ) : null}
          <SortableHeader label="Service" field="category" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
          {show('supplier') ? (
            <SortableHeader label="Supplier" field="supplierName" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
          ) : null}
          {show('cost') ? (
            <SortableHeader
              label="Cost"
              field="cost"
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={onSort}
              className="px-2"
            />
          ) : null}
          {show('selling') ? (
            <SortableHeader
              label="Selling"
              field="selling"
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={onSort}
              className="px-2"
            />
          ) : null}
          {show('margin') ? (
            <SortableHeader
              label="Margin"
              field="margin"
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={onSort}
              className="px-2"
            />
          ) : null}
          {show('status') ? (
            <SortableHeader label="Status" field="status" sortBy={sortBy} sortDir={sortDir} onSort={onSort} align="center" />
          ) : null}
          <DataTableColumnHeader label="Actions" align="center" sortable={false} compact />
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          <TripServicesSkeleton colCount={visibleColCount} />
        ) : isEmpty ? (
          <DataTableEmptyRow
            colSpan={visibleColCount}
            icon={Briefcase}
            title="No services yet"
            description="Add the first service to start building this itinerary."
          />
        ) : (
          services.map((service) => {
            const selected = isSelected(service.id)
            const canceled = service.status === 'canceled'
            const selling = tripServiceSelling(service)

            return (
              <tr
                key={service.id}
                data-selected={selected ? 'true' : undefined}
                className={cn(
                  'group/service-row border-b border-[var(--color-border)] last:border-0',
                  selected && 'bg-[var(--color-accent-muted)]/55 hover:bg-[var(--color-accent-muted)]/70',
                  canceled && 'opacity-70',
                )}
              >
                <td
                  className={tableSelectionCellClass(
                    cn(selected && 'bg-[var(--color-accent-muted)]/60', isDragSelecting && 'cursor-grabbing', SERVICES_ROW_CELL),
                  )}
                  data-service-row-selection=""
                  data-service-id={service.id}
                  onPointerDown={(e) => {
                    e.stopPropagation()
                    handleSelectionPointerDown(service.id, e.button)
                  }}
                  onPointerEnter={() => handleSelectionPointerEnter(service.id)}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelectionClick(service.id, e.shiftKey)
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <TableRowCheckbox
                    checked={selected}
                    onChange={(shiftKey) => handleSelectionClick(service.id, shiftKey ?? false)}
                    aria-label={`Select service ${service.name}`}
                  />
                </td>
                <td
                  className={tableCellClass('left', {
                    numeric: true,
                    extra: cn('px-2 font-medium tabular-nums text-[var(--color-accent)]', SERVICES_ROW_CELL),
                  })}
                >
                  {formatCount(service.lineNumber)}
                </td>
                {show('date') ? (
                <td className={tableCellClass('left', { numeric: true, extra: cn('px-2', SERVICES_ROW_CELL) })}>
                  <TripServiceScheduleCell service={service} />
                </td>
                ) : null}
                <td
                  className={tableCellClass('left', {
                    extra: cn(
                      'min-w-0 cursor-pointer border-l-[3px] pl-2.5 hover:bg-[var(--color-surface-muted)]/60',
                      TRIP_SERVICE_STATUS_ROW_ACCENT[service.status],
                      SERVICES_ROW_CELL,
                    ),
                  })}
                  onClick={() => openService(service)}
                >
                  <TripServiceIdentityCell
                    category={service.category}
                    name={service.name}
                    canceled={canceled}
                  />
                </td>
                {show('supplier') ? (
                <td className={tableCellClass('left', { extra: cn('truncate', SERVICES_ROW_CELL) })}>
                  <TripServiceSupplierCell name={service.supplierName} />
                </td>
                ) : null}
                {show('cost') ? (
                <td className={tableCellClass('left', { extra: cn('px-2', TRIP_SERVICE_FINANCIAL_COST_CELL, SERVICES_ROW_CELL) })}>
                  <AccountingAmount
                    amount={service.cost}
                    currency={currency}
                    className={cn('min-w-0', TRIP_SERVICE_FINANCIAL_AMOUNT.grid)}
                    currencyClassName={TRIP_SERVICE_FINANCIAL_AMOUNT.currency}
                    amountClassName={TRIP_SERVICE_FINANCIAL_AMOUNT.amount}
                  />
                </td>
                ) : null}
                {show('selling') ? (
                <td className={tableCellClass('left', { extra: cn('px-2', TRIP_SERVICE_FINANCIAL_SELLING_CELL, SERVICES_ROW_CELL) })}>
                  <AccountingAmount
                    amount={selling}
                    currency={currency}
                    className={cn('min-w-0', TRIP_SERVICE_FINANCIAL_AMOUNT.grid)}
                    currencyClassName={TRIP_SERVICE_FINANCIAL_AMOUNT.currency}
                    amountClassName={cn(TRIP_SERVICE_FINANCIAL_AMOUNT.amount, 'font-medium text-[var(--color-foreground)]')}
                  />
                </td>
                ) : null}
                {show('margin') ? (
                <td className={tableCellClass('center', { extra: cn('px-2', TRIP_SERVICE_FINANCIAL_MARGIN_CELL, SERVICES_ROW_CELL) })}>
                  <TripServiceMarginCell
                    cost={service.cost}
                    selling={selling}
                    currency={currency}
                    inactive={canceled}
                  />
                </td>
                ) : null}
                {show('status') ? (
                <td className={tableCellClass('center', { extra: cn('px-2', SERVICES_ROW_CELL) })}>
                  <div className="flex justify-center">
                    <TripServiceStatusBadge status={service.status} />
                  </div>
                </td>
                ) : null}
                <td
                  className={tableActionsCellClass(SERVICES_ROW_CELL)}
                  data-service-row-action=""
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-center gap-0.5 opacity-70 transition-opacity group-hover/service-row:opacity-100">
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-accent)]"
                      aria-label={`View ${service.name}`}
                      onClick={() => openService(service)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-foreground)]"
                      aria-label={`More actions for ${service.name}`}
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })
        )}
      </tbody>
    </StickyDataTable>
  )
}
