import type { ReactNode } from 'react'
import type { Traveler } from '@/domain/entities/traveler'
import { travelerDisplayName, travelerInitials } from '@/domain/entities/traveler'
import type { ClientTravelersTableColumnKey } from '@/features/travelers/components/client-travelers-table-columns'
import { TravelerRowActions } from '@/features/travelers/components/list/TravelerRowActions'
import type { ClientTravelerSortDir, ClientTravelerSortField } from '@/features/travelers/utils/client-travelers-list'
import {
  isTravelerSharedDataColumn,
  renderTravelerSharedDataCell,
  renderTravelerSharedDataHeader,
} from '@/features/travelers/components/list/travelers-table-shared-column-render'
import {
  ACCOUNT_NAME_AVATAR_PALETTE,
  accountNameAvatarPaletteIndex,
} from '@/features/clients/components/list/account-name-avatar'
import { ClientReferenceCopy } from '@/features/clients/components/ClientReferenceCopy'
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
  crmTableSelectionCellClass,
  tableCellClass,
  type TableAlign,
} from '@/design-system/components/table-styles'
import { cn } from '@/shared/utils/cn'

const CELL_ID = 'truncate text-xs text-[var(--color-accent)]'
const REFERENCE_COLUMN_X = 'px-1'

function TravelerNameCell({ traveler }: { traveler: Traveler }) {
  const name = travelerDisplayName(traveler)
  const initials = travelerInitials(traveler)
  const palette = ACCOUNT_NAME_AVATAR_PALETTE[accountNameAvatarPaletteIndex(traveler.id)]

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
      <span className="min-w-0 truncate font-medium">{name}</span>
    </span>
  )
}

type SortableHeaderProps = {
  label: string
  field: ClientTravelerSortField
  sortBy: ClientTravelerSortField
  sortDir: ClientTravelerSortDir
  onSort: (field: ClientTravelerSortField) => void
  align?: TableAlign
  className?: string
}

function travelersHeadClass(extra?: string) {
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
      className={travelersHeadClass(className)}
      active={active}
      sortDir={sortDir}
      onSort={() => onSort(field)}
      aria-sort={dataTableAriaSort(active, sortDir)}
    />
  )
}

type HeaderContext = {
  sortBy: ClientTravelerSortField
  sortDir: ClientTravelerSortDir
  onSort: (field: ClientTravelerSortField) => void
  allPageSelected: boolean
  somePageSelected: boolean
  onTogglePage: () => void
}

export function renderClientTravelersTableHeader(
  key: ClientTravelersTableColumnKey,
  ctx: HeaderContext,
): ReactNode {
  if (isTravelerSharedDataColumn(key)) {
    return renderTravelerSharedDataHeader(key, ctx)
  }

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
          <div className="flex h-full items-center justify-center px-1">
            <TableRowCheckbox
              checked={ctx.allPageSelected}
              indeterminate={ctx.somePageSelected}
              onChange={() => ctx.onTogglePage()}
              aria-label={ctx.allPageSelected ? 'Deselect all on this page' : 'Select all on this page'}
            />
          </div>
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
        <SortableHeader
          key={key}
          label="Name"
          field="name"
          sortBy={ctx.sortBy}
          sortDir={ctx.sortDir}
          onSort={ctx.onSort}
        />
      )
    case 'actions':
      return (
        <DataTableColumnHeader
          key={key}
          label=""
          align="right"
          sortable={false}
          className={travelersHeadClass('px-1.5')}
        />
      )
    default:
      return null
  }
}

export type ClientTravelersTableCellContext = {
  traveler: Traveler
  selected: boolean
  isDragSelecting: boolean
  onSelectionPointerDown: (travelerId: string, button: number) => void
  onSelectionPointerEnter: (travelerId: string) => void
  onSelectionClick: (travelerId: string, shiftKey: boolean) => void
  onEdit?: (traveler: Traveler) => void
  onDelete?: (travelerId: string) => void
  onOpenProfile?: (traveler: Traveler) => void
  deletingTravelerId?: string
}

export function renderClientTravelersTableCell(
  key: ClientTravelersTableColumnKey,
  ctx: ClientTravelersTableCellContext,
): ReactNode {
  if (isTravelerSharedDataColumn(key)) {
    return renderTravelerSharedDataCell(key, ctx.traveler)
  }

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
          data-traveler-id={ctx.traveler.id}
          onPointerDown={(event) => {
            event.stopPropagation()
            ctx.onSelectionPointerDown(ctx.traveler.id, event.button)
          }}
          onPointerEnter={() => ctx.onSelectionPointerEnter(ctx.traveler.id)}
          onClick={(event) => {
            event.stopPropagation()
            ctx.onSelectionClick(ctx.traveler.id, event.shiftKey)
          }}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <TableRowCheckbox
            checked={ctx.selected}
            onChange={(shiftKey) => ctx.onSelectionClick(ctx.traveler.id, shiftKey ?? false)}
            aria-label={`Select ${travelerDisplayName(ctx.traveler)}`}
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
          <ClientReferenceCopy reference={ctx.traveler.reference} variant="inline" className="text-xs" />
        </td>
      )
    case 'name':
      return (
        <td key={key} className={tableCellClass('left')} title={travelerDisplayName(ctx.traveler)}>
          <TravelerNameCell traveler={ctx.traveler} />
        </td>
      )
    case 'actions':
      return (
        <td
          key={key}
          className={tableCellClass('right', { extra: 'px-1.5' })}
          onClick={(event) => event.stopPropagation()}
        >
          {ctx.onEdit || ctx.onOpenProfile ? (
            <TravelerRowActions
              traveler={ctx.traveler}
              onOpenProfile={ctx.onOpenProfile}
              onEdit={ctx.onEdit ?? (() => undefined)}
              onDelete={ctx.onDelete ?? (() => undefined)}
              isDeleting={ctx.deletingTravelerId === ctx.traveler.id}
            />
          ) : null}
        </td>
      )
    default:
      return null
  }
}
