import type { MouseEvent, ReactNode } from 'react'
import { Building2, UserRound } from 'lucide-react'
import type { Client } from '@/domain/entities/client'
import type { ClientType } from '@/domain/entities/client'
import type { Label } from '@/domain/entities/label'
import {
  CLIENT_BILLING_ACCOUNT_LABELS,
  CLIENT_INDUSTRY_LABELS,
  CLIENT_TYPE_LABELS,
  clientPrimaryLabel,
  resolveClientBillingAccount,
  resolveClientJoinedAt,
} from '@/domain/entities/client'
import { resolveCountryName } from '@/domain/catalog/location-utils'
import { ClientMembershipBadge } from '@/features/clients/components/membership/ClientMembershipBadge'
import { ClientStatusBadge } from '@/features/clients/components/ClientStatusBadge'
import { ClientRowActions } from '@/features/clients/components/list/ClientRowActions'
import { EntityLabelChips } from '@/features/labels/components/EntityLabelChips'
import { TableRowCheckbox } from '@/features/trips/components/list/TableRowCheckbox'
import {
  DataTableColumnHeader,
  dataTableAriaSort,
} from '@/design-system/components/DataTableColumnHeader'
import { clientsTableSelectionHeadClass } from '@/features/clients/components/list/clients-table-header-ui'
import { CLIENTS_TABLE_CRM_HEADERS } from '@/features/clients/components/list/clients-table-crm-headers'
import type { ClientsTableColumnKey } from '@/features/clients/components/list/clients-table-columns'
import { maskClientField } from '@/features/clients/utils/client-format'
import type { ClientSortDir, ClientSortField } from '@/repositories/interfaces'
import {
  crmTableActionsCellClass,
  crmTableSelectionCellClass,
  tableCellClass,
  type TableAlign,
} from '@/design-system/components/table-styles'
import { formatDate } from '@/shared/utils/date-format'
import { cn } from '@/shared/utils/cn'

/** Accounts table body typography — keep row hierarchy consistent with CRM list tables. */
const CELL_META = 'truncate text-xs'
const CELL_ID = 'truncate text-xs text-[var(--color-accent)]'
const REFERENCE_COLUMN_X = 'px-1'
const CELL_NUMERIC = 'tabular-nums [direction:ltr] [unicode-bidi:plaintext]'

const COMPACT_COLUMN_X = 'px-2'
const TYPE_COLUMN_X = 'px-1.5'
const NARROW_COLUMN_X = 'px-1.5'

function accountNameInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase()
  return `${parts[0]!.charAt(0)}${parts[1]!.charAt(0)}`.toUpperCase()
}

function AccountNameCell({ client }: { client: Client }) {
  const accountName = clientPrimaryLabel(client)
  const initials = accountNameInitials(accountName)
  const isCorporate = client.type === 'corporate'

  return (
    <span className="flex min-w-0 items-center gap-2">
      <span
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[10px] font-semibold leading-none',
          isCorporate
            ? 'bg-[var(--color-info-muted)]/60 text-[var(--color-info)]'
            : 'bg-[var(--color-accent-muted)]/60 text-[var(--color-accent)]',
        )}
        aria-hidden
      >
        {initials}
      </span>
      <span className="min-w-0 truncate font-medium transition-[font-weight,color] duration-150 group-hover/crm-row:font-semibold group-hover/crm-row:text-[var(--color-foreground)]">
        {accountName}
      </span>
    </span>
  )
}

function AccountTypeCell({ type }: { type: ClientType }) {
  const Icon = type === 'corporate' ? Building2 : UserRound

  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-1 text-xs leading-none text-[var(--color-muted)]">
      <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--color-subtle)]" strokeWidth={2} aria-hidden />
      <span className="truncate">{CLIENT_TYPE_LABELS[type]}</span>
    </span>
  )
}

type SortableHeaderProps = {
  label: string
  field: ClientSortField
  sortBy: ClientSortField
  sortDir: ClientSortDir
  onSort: (field: ClientSortField) => void
  align?: TableAlign
  className?: string
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
      className={className}
      active={active}
      sortDir={sortDir}
      onSort={() => onSort(field)}
      aria-sort={dataTableAriaSort(active, sortDir)}
    />
  )
}

type HeaderContext = {
  sortBy: ClientSortField
  sortDir: ClientSortDir
  onSort: (field: ClientSortField) => void
  allPageSelected: boolean
  somePageSelected: boolean
  onTogglePage: () => void
}

export function renderClientsTableHeader(key: ClientsTableColumnKey, ctx: HeaderContext): ReactNode {
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
          <div className="flex h-9 items-center justify-center px-1">
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
          label={CLIENTS_TABLE_CRM_HEADERS.reference}
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
          label={CLIENTS_TABLE_CRM_HEADERS.name}
          field="displayName"
          sortBy={ctx.sortBy}
          sortDir={ctx.sortDir}
          onSort={ctx.onSort}
        />
      )
    case 'type':
      return (
        <SortableHeader
          key={key}
          label={CLIENTS_TABLE_CRM_HEADERS.type}
          field="type"
          sortBy={ctx.sortBy}
          sortDir={ctx.sortDir}
          onSort={ctx.onSort}
          className={TYPE_COLUMN_X}
        />
      )
    case 'billing':
      return (
        <DataTableColumnHeader
          key={key}
          label={CLIENTS_TABLE_CRM_HEADERS.billing}
          align="left"
          sortable={false}
        />
      )
    case 'trips':
      return (
        <DataTableColumnHeader
          key={key}
          label={CLIENTS_TABLE_CRM_HEADERS.trips}
          sortable={false}
          className={NARROW_COLUMN_X}
        />
      )
    case 'membership':
      return (
        <DataTableColumnHeader
          key={key}
          label={CLIENTS_TABLE_CRM_HEADERS.membership}
          sortable={false}
          className={NARROW_COLUMN_X}
        />
      )
    case 'labels':
      return (
        <DataTableColumnHeader
          key={key}
          label={CLIENTS_TABLE_CRM_HEADERS.labels}
          align="left"
          sortable={false}
        />
      )
    case 'updated':
      return (
        <SortableHeader
          key={key}
          label={CLIENTS_TABLE_CRM_HEADERS.updated}
          field="createdAt"
          sortBy={ctx.sortBy}
          sortDir={ctx.sortDir}
          onSort={ctx.onSort}
          className={NARROW_COLUMN_X}
        />
      )
    case 'status':
      return (
        <SortableHeader
          key={key}
          label={CLIENTS_TABLE_CRM_HEADERS.status}
          field="status"
          sortBy={ctx.sortBy}
          sortDir={ctx.sortDir}
          onSort={ctx.onSort}
          className={NARROW_COLUMN_X}
        />
      )
    case 'email':
      return (
        <SortableHeader
          key={key}
          label={CLIENTS_TABLE_CRM_HEADERS.email}
          field="email"
          sortBy={ctx.sortBy}
          sortDir={ctx.sortDir}
          onSort={ctx.onSort}
        />
      )
    case 'phone':
      return (
        <DataTableColumnHeader
          key={key}
          label={CLIENTS_TABLE_CRM_HEADERS.phone}
          align="left"
          sortable={false}
        />
      )
    case 'country':
      return (
        <DataTableColumnHeader
          key={key}
          label={CLIENTS_TABLE_CRM_HEADERS.country}
          align="left"
          sortable={false}
        />
      )
    case 'city':
      return (
        <DataTableColumnHeader
          key={key}
          label={CLIENTS_TABLE_CRM_HEADERS.city}
          align="left"
          sortable={false}
        />
      )
    case 'industry':
      return (
        <DataTableColumnHeader
          key={key}
          label={CLIENTS_TABLE_CRM_HEADERS.industry}
          align="left"
          sortable={false}
        />
      )
    case 'actions':
      return (
        <DataTableColumnHeader
          key={key}
          label={CLIENTS_TABLE_CRM_HEADERS.actions}
          align="center"
          sortable={false}
          className="px-1.5"
        />
      )
    default:
      return null
  }
}

type CellContext = {
  client: Client
  role: string
  tripCount: number
  labels: Label[]
  selected: boolean
  isDeleting: boolean
  isDragSelecting: boolean
  onOpen: (clientId: string, event?: MouseEvent) => void
  onEdit: (client: Client) => void
  onClone?: (client: Client) => void
  onDelete: (id: string) => void
  cloningClientId?: string
  onSelectionPointerDown: (clientId: string, button: number) => void
  onSelectionPointerEnter: (clientId: string) => void
  onSelectionClick: (clientId: string, shiftKey: boolean) => void
}

export function renderClientsTableCell(key: ClientsTableColumnKey, ctx: CellContext): ReactNode {
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
          data-client-id={ctx.client.id}
          onPointerDown={(event) => {
            event.stopPropagation()
            ctx.onSelectionPointerDown(ctx.client.id, event.button)
          }}
          onPointerEnter={() => ctx.onSelectionPointerEnter(ctx.client.id)}
          onClick={(event) => {
            event.stopPropagation()
            ctx.onSelectionClick(ctx.client.id, event.shiftKey)
          }}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <TableRowCheckbox
            checked={ctx.selected}
            onChange={(shiftKey) => ctx.onSelectionClick(ctx.client.id, shiftKey ?? false)}
            aria-label={`Select client ${ctx.client.reference}`}
          />
        </td>
      )
    case 'reference':
      return (
        <td
          key={key}
          className={tableCellClass('left', { numeric: true, extra: cn(REFERENCE_COLUMN_X, CELL_ID) })}
          title={ctx.client.reference}
        >
          {ctx.client.reference}
        </td>
      )
    case 'name':
      return (
        <td key={key} className={tableCellClass('left')} title={clientPrimaryLabel(ctx.client)}>
          <AccountNameCell client={ctx.client} />
        </td>
      )
    case 'type':
      return (
        <td
          key={key}
          className={tableCellClass('left', { extra: TYPE_COLUMN_X })}
          title={CLIENT_TYPE_LABELS[ctx.client.type]}
        >
          <AccountTypeCell type={ctx.client.type} />
        </td>
      )
    case 'billing': {
      const billing = resolveClientBillingAccount(ctx.client)
      const limit = ctx.client.creditLimit
      const currency = ctx.client.preferredCurrency?.trim() || 'EGP'
      const label =
        billing === 'credit' && limit && limit > 0
          ? `${CLIENT_BILLING_ACCOUNT_LABELS[billing]} · ${limit.toLocaleString()} ${currency}`
          : CLIENT_BILLING_ACCOUNT_LABELS[billing]
      return (
        <td key={key} className={tableCellClass('left', { muted: true, extra: CELL_META })} title={label}>
          {label}
        </td>
      )
    }
    case 'trips':
      return (
        <td
          key={key}
          className={tableCellClass('left', { numeric: true, extra: cn(NARROW_COLUMN_X, CELL_NUMERIC) })}
          dir="ltr"
        >
          {ctx.tripCount}
        </td>
      )
    case 'membership':
      return (
        <td key={key} className={tableCellClass('left', { extra: NARROW_COLUMN_X })}>
          <ClientMembershipBadge membership={ctx.client.membership} />
        </td>
      )
    case 'labels':
      return (
        <td key={key} className={tableCellClass('left', { extra: 'px-2' })}>
          <EntityLabelChips labels={ctx.labels} maxVisible={2} nowrap />
        </td>
      )
    case 'updated': {
      const joinedLabel = formatDate(resolveClientJoinedAt(ctx.client))
      return (
        <td
          key={key}
          className={tableCellClass('left', { numeric: true, muted: true, extra: cn(NARROW_COLUMN_X, CELL_META, 'truncate') })}
          title={joinedLabel}
        >
          {joinedLabel}
        </td>
      )
    }
    case 'status':
      return (
        <td key={key} className={tableCellClass('left', { extra: NARROW_COLUMN_X })}>
          <ClientStatusBadge status={ctx.client.status} />
        </td>
      )
    case 'email':
      return (
        <td key={key} className={tableCellClass('left', { extra: 'truncate' })} title={ctx.client.email ?? undefined}>
          {maskClientField(ctx.role, ctx.client.email)}
        </td>
      )
    case 'phone':
      return <td key={key} className={tableCellClass('left')}>{maskClientField(ctx.role, ctx.client.phone)}</td>
    case 'country':
      return (
        <td key={key} className={tableCellClass('left', { extra: 'truncate' })}>
          {resolveCountryName(ctx.client.country) || '—'}
        </td>
      )
    case 'city':
      return (
        <td key={key} className={tableCellClass('left', { extra: 'truncate' })} title={ctx.client.city ?? undefined}>
          {ctx.client.city?.trim() || '—'}
        </td>
      )
    case 'industry':
      return (
        <td key={key} className={tableCellClass('left', { muted: true, extra: CELL_META })}>
          {ctx.client.type === 'corporate' && ctx.client.industry
            ? CLIENT_INDUSTRY_LABELS[ctx.client.industry]
            : '—'}
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
            <ClientRowActions
              client={ctx.client}
              onView={(row) => ctx.onOpen(row.id)}
              onEdit={ctx.onEdit}
              onClone={ctx.onClone}
              onDelete={ctx.onDelete}
              isCloning={ctx.cloningClientId === ctx.client.id}
              isDeleting={ctx.isDeleting}
            />
          </div>
        </td>
      )
    default:
      return null
  }
}
