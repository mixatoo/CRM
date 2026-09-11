import type { MouseEvent, ReactNode } from 'react'
import type { Trip } from '@/domain/entities'
import type { Label } from '@/domain/entities/label'
import { ClientReferenceCopy } from '@/features/clients/components/ClientReferenceCopy'
import {
  ACCOUNT_NAME_AVATAR_PALETTE,
  accountNameAvatarPaletteIndex,
  accountNameInitials,
} from '@/features/clients/components/list/account-name-avatar'
import type { ClientLinkedTripsTableColumnKey } from '@/features/clients/components/trips/client-linked-trips-table-columns'
import { EntityLabelChips } from '@/features/labels/components/EntityLabelChips'
import { TripRowActions } from '@/features/trips/components/list/TripRowActions'
import { TripStageBadge } from '@/features/trips/components/list/TripStageBadge'
import { TableRowCheckbox } from '@/features/trips/components/list/TableRowCheckbox'
import {
  DataTableColumnHeader,
  dataTableAriaSort,
} from '@/design-system/components/DataTableColumnHeader'
import { AccountingAmount } from '@/design-system/components/AccountingAmount'
import {
  clientsTableHeadCellClassName,
  clientsTableSelectionHeadClass,
} from '@/features/clients/components/list/clients-table-header-ui'
import { formatPersonCount, formatTripDate } from '@/features/trips/utils/format'
import type { TripSortDir, TripSortField } from '@/repositories/interfaces'
import {
  crmTableActionsCellClass,
  crmTableSelectionCellClass,
  tableCellClass,
  type TableAlign,
} from '@/design-system/components/table-styles'
import { cn } from '@/shared/utils/cn'

const CELL_META = 'truncate text-xs'
const CELL_ID = 'truncate text-xs text-[var(--color-accent)]'
const REFERENCE_COLUMN_X = 'px-1'
const CELL_NUMERIC = 'tabular-nums [direction:ltr] [unicode-bidi:plaintext]'
const COMPACT_COLUMN_X = 'px-2'
const NARROW_COLUMN_X = 'px-1.5'

function tripDestination(trip: Trip) {
  return trip.destination ?? trip.branch
}

function TripNameCell({ trip }: { trip: Trip }) {
  const initials = accountNameInitials(trip.name)
  const palette = ACCOUNT_NAME_AVATAR_PALETTE[accountNameAvatarPaletteIndex(trip.id)]

  return (
    <span className="flex min-w-0 items-center gap-2">
      <span
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[10px] font-semibold leading-none',
          palette.shell,
          palette.text,
        )}
        aria-hidden
      >
        {initials}
      </span>
      <span className="min-w-0 truncate font-medium">{trip.name}</span>
    </span>
  )
}

type SortableHeaderProps = {
  label: string
  field: TripSortField
  sortBy: TripSortField
  sortDir: TripSortDir
  onSort: (field: TripSortField) => void
  align?: TableAlign
  className?: string
}

function linkedTripsHeadClass(extra?: string) {
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
      className={linkedTripsHeadClass(className)}
      active={active}
      sortDir={sortDir}
      onSort={() => onSort(field)}
      aria-sort={dataTableAriaSort(active, sortDir)}
    />
  )
}

type HeaderContext = {
  sortBy: TripSortField
  sortDir: TripSortDir
  onSort: (field: TripSortField) => void
  allPageSelected: boolean
  somePageSelected: boolean
  onTogglePage: () => void
}

export function renderClientLinkedTripsTableHeader(
  key: ClientLinkedTripsTableColumnKey,
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
    case 'reference':
      return (
        <SortableHeader
          key={key}
          label="ID"
          field="reference"
          sortBy={ctx.sortBy}
          sortDir={ctx.sortDir}
          onSort={ctx.onSort}
          className={REFERENCE_COLUMN_X}
        />
      )
    case 'name':
      return (
        <DataTableColumnHeader
          key={key}
          label="Trip"
          align="left"
          sortable={false}
          className={linkedTripsHeadClass()}
        />
      )
    case 'date':
      return (
        <SortableHeader
          key={key}
          label="Date"
          field="date"
          sortBy={ctx.sortBy}
          sortDir={ctx.sortDir}
          onSort={ctx.onSort}
          className={COMPACT_COLUMN_X}
        />
      )
    case 'destination':
      return (
        <SortableHeader
          key={key}
          label="Destination"
          field="destination"
          sortBy={ctx.sortBy}
          sortDir={ctx.sortDir}
          onSort={ctx.onSort}
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
          className={COMPACT_COLUMN_X}
        />
      )
    case 'stage':
      return (
        <SortableHeader
          key={key}
          label="Stage"
          field="stage"
          sortBy={ctx.sortBy}
          sortDir={ctx.sortDir}
          onSort={ctx.onSort}
          align="center"
          className={COMPACT_COLUMN_X}
        />
      )
    case 'persons':
      return (
        <SortableHeader
          key={key}
          label="Persons"
          field="persons"
          sortBy={ctx.sortBy}
          sortDir={ctx.sortDir}
          onSort={ctx.onSort}
          className={NARROW_COLUMN_X}
        />
      )
    case 'owner':
      return (
        <SortableHeader
          key={key}
          label="Owner"
          field="owner"
          sortBy={ctx.sortBy}
          sortDir={ctx.sortDir}
          onSort={ctx.onSort}
          className={COMPACT_COLUMN_X}
        />
      )
    case 'labels':
      return (
        <DataTableColumnHeader
          key={key}
          label="Labels"
          align="left"
          sortable={false}
          className={linkedTripsHeadClass(COMPACT_COLUMN_X)}
        />
      )
    case 'actions':
      return (
        <DataTableColumnHeader
          key={key}
          label="Actions"
          align="center"
          sortable={false}
          className={linkedTripsHeadClass()}
        />
      )
    default:
      return null
  }
}

export type ClientLinkedTripsTableCellContext = {
  trip: Trip
  labels: Label[]
  selected: boolean
  isDeleting: boolean
  isDragSelecting: boolean
  cloningTripId?: string
  onOpen: (tripId: string, event?: MouseEvent) => void
  onClone: (trip: Trip) => void
  onDelete: (tripId: string) => void
  onSelectionPointerDown: (tripId: string, button: number) => void
  onSelectionPointerEnter: (tripId: string) => void
  onSelectionClick: (tripId: string, shiftKey: boolean) => void
}

export function renderClientLinkedTripsTableCell(
  key: ClientLinkedTripsTableColumnKey,
  ctx: ClientLinkedTripsTableCellContext,
): ReactNode {
  const destination = tripDestination(ctx.trip)

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
          data-trip-id={ctx.trip.id}
          onPointerDown={(event) => {
            event.stopPropagation()
            ctx.onSelectionPointerDown(ctx.trip.id, event.button)
          }}
          onPointerEnter={() => ctx.onSelectionPointerEnter(ctx.trip.id)}
          onClick={(event) => {
            event.stopPropagation()
            ctx.onSelectionClick(ctx.trip.id, event.shiftKey)
          }}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <TableRowCheckbox
            checked={ctx.selected}
            onChange={(shiftKey) => ctx.onSelectionClick(ctx.trip.id, shiftKey ?? false)}
            aria-label={`Select trip ${ctx.trip.reference}`}
          />
        </td>
      )
    case 'reference':
      return (
        <td
          key={key}
          className={tableCellClass('left', { numeric: true, extra: cn(REFERENCE_COLUMN_X, CELL_ID) })}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <ClientReferenceCopy reference={ctx.trip.reference} variant="inline" className="text-xs" />
        </td>
      )
    case 'name':
      return (
        <td key={key} className={tableCellClass('left')} title={ctx.trip.name}>
          <TripNameCell trip={ctx.trip} />
        </td>
      )
    case 'date':
      return (
        <td
          key={key}
          className={tableCellClass('left', {
            numeric: true,
            muted: true,
            extra: cn(NARROW_COLUMN_X, CELL_META, 'truncate'),
          })}
          title={formatTripDate(ctx.trip)}
        >
          {formatTripDate(ctx.trip)}
        </td>
      )
    case 'destination':
      return (
        <td key={key} className={tableCellClass('left', { extra: 'truncate' })} title={destination}>
          {destination}
        </td>
      )
    case 'cost':
      return (
        <td key={key} className={tableCellClass('left', { extra: COMPACT_COLUMN_X })}>
          <AccountingAmount amount={ctx.trip.totalCost} currency={ctx.trip.currency} className="min-w-0" />
        </td>
      )
    case 'stage':
      return (
        <td key={key} className={tableCellClass('left', { extra: NARROW_COLUMN_X })}>
          <TripStageBadge stage={ctx.trip.stage} />
        </td>
      )
    case 'persons':
      return (
        <td
          key={key}
          className={tableCellClass('left', { numeric: true, extra: cn(NARROW_COLUMN_X, CELL_NUMERIC) })}
          dir="ltr"
        >
          {formatPersonCount(ctx.trip.adults, ctx.trip.minors)}
        </td>
      )
    case 'labels':
      return (
        <td key={key} className={tableCellClass('left', { extra: COMPACT_COLUMN_X })}>
          <EntityLabelChips labels={ctx.labels} maxVisible={2} nowrap />
        </td>
      )
    case 'owner':
      return (
        <td
          key={key}
          className={tableCellClass('left', { extra: cn(COMPACT_COLUMN_X, 'truncate') })}
          title={ctx.trip.ownerName}
        >
          {ctx.trip.ownerName}
        </td>
      )
    case 'actions':
      return (
        <td
          key={key}
          className={crmTableActionsCellClass('!text-center')}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <div className="flex justify-center">
            <TripRowActions
              trip={ctx.trip}
              onClone={ctx.onClone}
              onDelete={ctx.onDelete}
              isCloning={ctx.cloningTripId === ctx.trip.id}
              isDeleting={ctx.isDeleting}
            />
          </div>
        </td>
      )
    default:
      return null
  }
}
