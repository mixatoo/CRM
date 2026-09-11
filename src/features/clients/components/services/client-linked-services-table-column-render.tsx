import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { AccountingAmount } from '@/design-system/components/AccountingAmount'
import { formatServiceCategory } from '@/domain/entities/trip-service'
import type { ClientLinkedServicesTableColumnKey } from '@/features/clients/components/services/client-linked-services-table-columns'
import type { ClientLinkedServiceRow } from '@/features/clients/utils/client-linked-services-list'
import type { ClientLinkedServiceSortDir, ClientLinkedServiceSortField } from '@/features/clients/utils/client-linked-services-list'
import { TripServiceStatusBadge } from '@/features/trips/components/services/TripServiceStatusBadge'
import {
  TRIP_SERVICE_CATEGORY_ICON,
  TRIP_SERVICE_CATEGORY_SHELL,
  TRIP_SERVICE_CATEGORY_VISUAL,
} from '@/features/trips/components/services/service-styles'
import { TableRowCheckbox } from '@/features/trips/components/list/TableRowCheckbox'
import {
  DataTableColumnHeader,
  dataTableAriaSort,
} from '@/design-system/components/DataTableColumnHeader'
import {
  clientsTableHeadCellClassName,
  clientsTableSelectionHeadClass,
} from '@/features/clients/components/list/clients-table-header-ui'
import {
  crmTableActionsCellClass,
  crmTableSelectionCellClass,
  tableCellClass,
  type TableAlign,
} from '@/design-system/components/table-styles'
import { cn } from '@/shared/utils/cn'

const CELL_META = 'truncate text-xs'
const SERVICE_COLUMN_X = 'px-1'
const COMPACT_COLUMN_X = 'px-2'

function ServiceNameCell({ service }: { service: ClientLinkedServiceRow }) {
  const Icon = TRIP_SERVICE_CATEGORY_ICON[service.category]

  return (
    <span className="flex min-w-0 items-center gap-2">
      <span
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border',
          TRIP_SERVICE_CATEGORY_SHELL[service.category],
          TRIP_SERVICE_CATEGORY_VISUAL[service.category],
        )}
        aria-hidden
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      </span>
      <span className="min-w-0 truncate font-medium">{service.name}</span>
    </span>
  )
}

type SortableHeaderProps = {
  label: string
  field: ClientLinkedServiceSortField
  sortBy: ClientLinkedServiceSortField
  sortDir: ClientLinkedServiceSortDir
  onSort: (field: ClientLinkedServiceSortField) => void
  align?: TableAlign
  className?: string
}

function servicesHeadClass(extra?: string) {
  return cn(clientsTableHeadCellClassName, extra)
}

function SortableHeader({
  label,
  field,
  sortBy,
  sortDir,
  onSort,
  align = 'left',
  className,
}: SortableHeaderProps) {
  const active = sortBy === field

  return (
    <DataTableColumnHeader
      label={label}
      align={align}
      className={servicesHeadClass(className)}
      active={active}
      sortDir={sortDir}
      onSort={() => onSort(field)}
      aria-sort={dataTableAriaSort(active, sortDir)}
    />
  )
}

type HeaderContext = {
  sortBy: ClientLinkedServiceSortField
  sortDir: ClientLinkedServiceSortDir
  onSort: (field: ClientLinkedServiceSortField) => void
  allPageSelected: boolean
  somePageSelected: boolean
  onTogglePage: () => void
}

export function renderClientLinkedServicesTableHeader(
  key: ClientLinkedServicesTableColumnKey,
  ctx: HeaderContext,
): ReactNode {
  switch (key) {
    case 'selection':
      return (
        <th
          key={key}
          scope="col"
          className={clientsTableSelectionHeadClass()}
          data-client-row-selection=""
          onClick={(event) => {
            event.stopPropagation()
            ctx.onTogglePage()
          }}
        >
          <TableRowCheckbox
            checked={ctx.allPageSelected}
            indeterminate={ctx.somePageSelected}
            onChange={() => ctx.onTogglePage()}
            aria-label={ctx.allPageSelected ? 'Deselect all on this page' : 'Select all on this page'}
          />
        </th>
      )
    case 'service':
      return (
        <SortableHeader
          key={key}
          label="Service"
          field="service"
          sortBy={ctx.sortBy}
          sortDir={ctx.sortDir}
          onSort={ctx.onSort}
          className={SERVICE_COLUMN_X}
        />
      )
    case 'category':
      return (
        <SortableHeader
          key={key}
          label="Category"
          field="category"
          sortBy={ctx.sortBy}
          sortDir={ctx.sortDir}
          onSort={ctx.onSort}
        />
      )
    case 'trip':
      return (
        <SortableHeader
          key={key}
          label="Trip"
          field="trip"
          sortBy={ctx.sortBy}
          sortDir={ctx.sortDir}
          onSort={ctx.onSort}
          className={COMPACT_COLUMN_X}
        />
      )
    case 'supplier':
      return (
        <SortableHeader
          key={key}
          label="Supplier"
          field="supplier"
          sortBy={ctx.sortBy}
          sortDir={ctx.sortDir}
          onSort={ctx.onSort}
        />
      )
    case 'selling':
      return (
        <SortableHeader
          key={key}
          label="Selling"
          field="selling"
          sortBy={ctx.sortBy}
          sortDir={ctx.sortDir}
          onSort={ctx.onSort}
          align="left"
          className={COMPACT_COLUMN_X}
        />
      )
    case 'cost':
      return (
        <SortableHeader
          key={key}
          label="Cost"
          field="cost"
          sortBy={ctx.sortBy}
          sortDir={ctx.sortDir}
          onSort={ctx.onSort}
          align="left"
          className={COMPACT_COLUMN_X}
        />
      )
    case 'status':
      return (
        <SortableHeader
          key={key}
          label="Status"
          field="status"
          sortBy={ctx.sortBy}
          sortDir={ctx.sortDir}
          onSort={ctx.onSort}
          align="center"
        />
      )
    case 'startDate':
      return (
        <SortableHeader
          key={key}
          label="Start date"
          field="startDate"
          sortBy={ctx.sortBy}
          sortDir={ctx.sortDir}
          onSort={ctx.onSort}
          className={COMPACT_COLUMN_X}
        />
      )
    case 'actions':
      return (
        <DataTableColumnHeader
          key={key}
          label="Actions"
          align="center"
          sortable={false}
          className={servicesHeadClass()}
        />
      )
    default:
      return null
  }
}

export type ClientLinkedServicesTableCellContext = {
  service: ClientLinkedServiceRow
  selected: boolean
  isDragSelecting: boolean
  onSelectionPointerDown: (serviceId: string, button: number) => void
  onSelectionPointerEnter: (serviceId: string) => void
  onSelectionClick: (serviceId: string, shiftKey: boolean) => void
}

function formatServiceDate(value?: string) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function renderClientLinkedServicesTableCell(
  key: ClientLinkedServicesTableColumnKey,
  ctx: ClientLinkedServicesTableCellContext,
): ReactNode {
  const amount = ctx.service.selling ?? ctx.service.cost

  switch (key) {
    case 'selection':
      return (
        <td
          key={key}
          className={crmTableSelectionCellClass(
            cn(
              '!text-center',
              ctx.selected && 'bg-[var(--color-accent-muted)]/35',
              ctx.isDragSelecting && 'cursor-grabbing',
            ),
          )}
          data-client-row-selection=""
          data-service-id={ctx.service.id}
          onPointerDown={(event) => {
            event.stopPropagation()
            ctx.onSelectionPointerDown(ctx.service.id, event.button)
          }}
          onPointerEnter={() => ctx.onSelectionPointerEnter(ctx.service.id)}
          onClick={(event) => {
            event.stopPropagation()
            ctx.onSelectionClick(ctx.service.id, event.shiftKey)
          }}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <TableRowCheckbox
            checked={ctx.selected}
            onChange={(shiftKey) => ctx.onSelectionClick(ctx.service.id, shiftKey ?? false)}
            aria-label={`Select ${ctx.service.name}`}
          />
        </td>
      )
    case 'service':
      return (
        <td key={key} className={tableCellClass('left', { extra: SERVICE_COLUMN_X })} title={ctx.service.name}>
          <ServiceNameCell service={ctx.service} />
        </td>
      )
    case 'category':
      return (
        <td
          key={key}
          className={tableCellClass('left', { muted: true, extra: cn(CELL_META, 'truncate') })}
        >
          {formatServiceCategory(ctx.service.category)}
        </td>
      )
    case 'trip':
      return (
        <td
          key={key}
          className={tableCellClass('left', { extra: cn(COMPACT_COLUMN_X, CELL_META, 'font-mono') })}
        >
          {ctx.service.tripReference ? (
            <Link
              to={`/trips/${ctx.service.tripId}/services`}
              className="text-[var(--color-accent)] hover:underline"
              onClick={(event) => event.stopPropagation()}
            >
              {ctx.service.tripReference}
            </Link>
          ) : (
            '—'
          )}
        </td>
      )
    case 'supplier':
      return (
        <td
          key={key}
          className={tableCellClass('left', { muted: true, extra: cn(CELL_META, 'truncate') })}
          title={ctx.service.supplierName ?? undefined}
        >
          {ctx.service.supplierName?.trim() || '—'}
        </td>
      )
    case 'selling':
      return (
        <td key={key} className={tableCellClass('left', { extra: COMPACT_COLUMN_X })}>
          <AccountingAmount amount={amount} currency={ctx.service.currency} className="min-w-0" />
        </td>
      )
    case 'cost':
      return (
        <td key={key} className={tableCellClass('left', { extra: COMPACT_COLUMN_X })}>
          <AccountingAmount amount={ctx.service.cost} currency={ctx.service.currency} className="min-w-0" />
        </td>
      )
    case 'status':
      return (
        <td key={key} className={tableCellClass('center')}>
          <TripServiceStatusBadge status={ctx.service.status} />
        </td>
      )
    case 'startDate':
      return (
        <td
          key={key}
          className={tableCellClass('left', { muted: true, extra: cn(COMPACT_COLUMN_X, CELL_META) })}
        >
          {formatServiceDate(ctx.service.startDate)}
        </td>
      )
    case 'actions':
      return (
        <td
          key={key}
          className={crmTableActionsCellClass('!text-center')}
          data-service-row-action=""
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <div className="flex justify-center">
            <Link
              to={`/trips/${ctx.service.tripId}/services/${ctx.service.id}`}
              className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-accent)]"
              aria-label={`Open ${ctx.service.name} on trip ${ctx.service.tripReference || ctx.service.tripId}`}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </td>
      )
    default:
      return null
  }
}
