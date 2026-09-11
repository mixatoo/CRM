import { useMemo, useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {
  ArrowDown,
  ArrowUp,
  Ban,
  Banknote,
  ChevronRight,
  Circle,
  Copy,
  CreditCard,
  FileText,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Ticket,
  Trash2,
  Undo2,
  XCircle,
} from 'lucide-react'
import {
  FLIGHT_SEGMENT_STATUS_OPTIONS,
  type FlightFieldOption,
  type FlightTicket,
} from '@/domain/entities/trip-service-flight'
import {
  listTicketOperationAvailability,
  ticketOperationLabel,
  type TicketOperation,
  type TicketOperationContext,
} from '@/domain/flight/transitions'
import { tableActionsClass } from '@/design-system/components/table-styles'
import { cn } from '@/shared/utils/cn'

const menuItemClassName =
  'flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-2 text-xs font-normal text-[var(--color-foreground)] outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-45 data-[highlighted]:bg-[var(--color-surface-elevated)]'

const submenuContentClassName =
  'z-[500] min-w-[11.5rem] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-lg'

const STATUS_EMPTY_VALUE = '__none__'

export type TicketRowOperation = TicketOperation

const TICKET_OPERATIONS: Array<{
  id: TicketRowOperation
  label: string
  icon: typeof Ticket
  variant?: 'danger'
}> = [
  { id: 'issue', label: 'Issue', icon: Ticket },
  { id: 'void', label: 'Void', icon: XCircle, variant: 'danger' },
  { id: 'refund', label: 'Refund', icon: Undo2 },
  { id: 'partial_refund', label: 'Partial refund', icon: Undo2 },
  { id: 'reissue', label: 'Reissue', icon: RefreshCw },
  { id: 'cancel', label: 'Cancel', icon: Ban, variant: 'danger' },
  { id: 'client_payment', label: 'Receive payment', icon: CreditCard },
  { id: 'supplier_payment', label: 'Pay supplier', icon: Banknote },
]

function resolveStatusOptions(
  segmentStatus: string,
  options: readonly FlightFieldOption[],
): FlightFieldOption[] {
  const normalized = segmentStatus ?? ''
  const hasKnownValue = options.some((option) => option.value === normalized)
  if (!normalized || hasKnownValue) return [...options]
  return [{ value: normalized, label: normalized }, ...options]
}

interface TripFlightSegmentRowActionsProps {
  readOnly: boolean
  segmentLabel: string
  segmentStatus: string
  onSegmentStatusChange: (value: string) => void
  onSegmentStatusBlur?: () => void
  statusError?: string
  canAdd: boolean
  canClone: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  isTicketHeadRow: boolean
  canRemoveSegment: boolean
  canRemoveTicket: boolean
  ticketSegmentCount: number
  ticketLabel?: string
  ticket?: FlightTicket | null
  ticketOperationContext?: TicketOperationContext
  onAdd: () => void
  onClone: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onRemoveSegment: () => void
  onRemoveTicket: () => void
  onTicketOperation?: (operation: TicketRowOperation) => void
  onOpenTicketDetails?: () => void
}

export function TripFlightSegmentRowActions({
  readOnly,
  segmentLabel,
  segmentStatus,
  onSegmentStatusChange,
  onSegmentStatusBlur,
  statusError,
  canAdd,
  canClone,
  canMoveUp,
  canMoveDown,
  isTicketHeadRow,
  canRemoveSegment,
  canRemoveTicket,
  ticketSegmentCount,
  ticketLabel,
  ticket,
  ticketOperationContext,
  onAdd,
  onClone,
  onMoveUp,
  onMoveDown,
  onRemoveSegment,
  onRemoveTicket,
  onTicketOperation,
  onOpenTicketDetails,
}: TripFlightSegmentRowActionsProps) {
  const [open, setOpen] = useState(false)
  const statusOptions = resolveStatusOptions(segmentStatus, FLIGHT_SEGMENT_STATUS_OPTIONS)
  const selectedStatusLabel =
    statusOptions.find((option) => option.value === (segmentStatus ?? ''))?.label ?? '—'

  const operationAvailability = useMemo(() => {
    if (!ticket || !isTicketHeadRow) return []
    return listTicketOperationAvailability(ticket, ticketOperationContext)
  }, [ticket, isTicketHeadRow, ticketOperationContext])

  const availabilityByOp = useMemo(
    () => new Map(operationAvailability.map((row) => [row.operation, row])),
    [operationAvailability],
  )

  const hasAllowedTicketOperation = operationAvailability.some((row) => row.allowed)
  const showTicketDelete = isTicketHeadRow && canRemoveTicket && !readOnly
  const showSegmentDelete = !isTicketHeadRow && canRemoveSegment && !readOnly
  const hasDeleteActions = showTicketDelete || showSegmentDelete
  const hasTicketOperations = isTicketHeadRow && Boolean(onTicketOperation) && ticket
  const canOpenTicketDetails = isTicketHeadRow && Boolean(onOpenTicketDetails) && ticket
  const hasSegmentActions = !readOnly && (canAdd || canClone || canMoveUp || canMoveDown || hasDeleteActions)
  const showMenu = hasTicketOperations || canOpenTicketDetails || hasSegmentActions
  const radioValue = segmentStatus || STATUS_EMPTY_VALUE
  const ticketDeleteLabel = ticketLabel?.trim()
    ? `Remove PNR (${ticketLabel.trim()})`
    : `Remove ticket (${ticketSegmentCount} segments)`

  const handleStatusChange = (value: string) => {
    if (readOnly) return
    onSegmentStatusChange(value === STATUS_EMPTY_VALUE ? '' : value)
    onSegmentStatusBlur?.()
  }

  if (!showMenu) {
    return (
      <div className={tableActionsClass}>
        <span
          className="inline-flex h-7 min-w-7 items-center justify-center px-1 text-[10px] font-medium text-[var(--color-muted)]"
          title={`Status: ${selectedStatusLabel}`}
        >
          {selectedStatusLabel}
        </span>
      </div>
    )
  }

  const ticketOperationsSubmenu = hasTicketOperations ? (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger
        className={cn(
          menuItemClassName,
          'w-full justify-between data-[state=open]:bg-[var(--color-surface-elevated)]',
          !hasAllowedTicketOperation && 'opacity-60',
        )}
      >
        <span className="min-w-0 truncate">Ticket</span>
        <ChevronRight className="h-3.5 w-3.5 text-[var(--color-subtle)]" />
      </DropdownMenu.SubTrigger>
      <DropdownMenu.Portal>
        <DropdownMenu.SubContent className={submenuContentClassName} sideOffset={4} collisionPadding={12}>
          {onOpenTicketDetails ? (
            <DropdownMenu.Item
              className={menuItemClassName}
              onSelect={() => onOpenTicketDetails()}
            >
              <FileText className="h-3.5 w-3.5 text-[var(--color-muted)]" />
              <span className="min-w-0 flex-1 truncate">Details & ledger</span>
            </DropdownMenu.Item>
          ) : null}
          {onOpenTicketDetails ? <DropdownMenu.Separator className="my-1 h-px bg-[var(--color-border)]" /> : null}
          {TICKET_OPERATIONS.map(({ id, label, icon: Icon, variant }) => {
            const availability = availabilityByOp.get(id)
            const allowed = availability?.allowed ?? false
            const reason = availability?.reason
            return (
              <DropdownMenu.Item
                key={id}
                className={cn(
                  menuItemClassName,
                  variant === 'danger' && allowed && 'text-[var(--color-danger)] data-[highlighted]:bg-[var(--color-danger-muted)]',
                )}
                disabled={!allowed}
                title={reason ?? ticketOperationLabel(id)}
                onSelect={(event) => {
                  if (!allowed) {
                    event.preventDefault()
                    return
                  }
                  onTicketOperation?.(id)
                }}
              >
                <Icon className="h-3.5 w-3.5 text-[var(--color-muted)]" />
                <span className="min-w-0 flex-1 truncate">{label}</span>
              </DropdownMenu.Item>
            )
          })}
        </DropdownMenu.SubContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Sub>
  ) : null

  const statusSubmenu = !readOnly ? (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger
        className={cn(
          menuItemClassName,
          'w-full justify-between data-[state=open]:bg-[var(--color-surface-elevated)]',
          statusError && 'text-[var(--color-danger)]',
        )}
      >
        <span className="min-w-0 truncate">Status</span>
        <span className="ml-2 flex min-w-0 shrink-0 items-center gap-1">
          <span className="max-w-[6.5rem] truncate text-[10px] text-[var(--color-muted)]">
            {selectedStatusLabel}
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-[var(--color-subtle)]" />
        </span>
      </DropdownMenu.SubTrigger>
      <DropdownMenu.Portal>
        <DropdownMenu.SubContent className={submenuContentClassName} sideOffset={4} collisionPadding={12}>
          <DropdownMenu.RadioGroup value={radioValue} onValueChange={handleStatusChange}>
            {statusOptions.map((option) => {
              const radioItemValue = option.value || STATUS_EMPTY_VALUE
              return (
                <DropdownMenu.RadioItem
                  key={radioItemValue}
                  value={radioItemValue}
                  className={cn(
                    menuItemClassName,
                    'relative pl-7 data-[state=checked]:font-medium data-[state=checked]:text-[var(--color-accent)]',
                  )}
                  onSelect={(event) => event.preventDefault()}
                >
                  <DropdownMenu.ItemIndicator className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <Circle className="h-2 w-2 fill-current" />
                  </DropdownMenu.ItemIndicator>
                  {option.label}
                </DropdownMenu.RadioItem>
              )
            })}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.SubContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Sub>
  ) : null

  return (
    <div className={tableActionsClass}>
      <DropdownMenu.Root open={open} onOpenChange={setOpen}>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className={cn(
              'inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border transition-colors',
              'border-transparent bg-transparent text-[var(--color-muted)]',
              'hover:border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-foreground)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/35',
              'data-[state=open]:border-[var(--color-accent)] data-[state=open]:bg-[var(--color-accent-muted)]/40 data-[state=open]:text-[var(--color-accent)]',
              statusError && 'border-[var(--color-danger)] text-[var(--color-danger)]',
            )}
            aria-label={`Actions for segment ${segmentLabel}, status ${selectedStatusLabel}`}
            title={statusError ? String(statusError) : `Status: ${selectedStatusLabel}`}
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" strokeWidth={2} />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className={submenuContentClassName}
            align="end"
            side="bottom"
            sideOffset={4}
            collisionPadding={12}
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            {statusSubmenu}

            {hasTicketOperations && statusSubmenu ? (
              <DropdownMenu.Separator className="my-1 h-px bg-[var(--color-border)]" />
            ) : null}

            {ticketOperationsSubmenu}

            {hasTicketOperations && hasSegmentActions ? (
              <DropdownMenu.Separator className="my-1 h-px bg-[var(--color-border)]" />
            ) : null}

            {hasSegmentActions && !hasTicketOperations && statusSubmenu ? (
              <DropdownMenu.Separator className="my-1 h-px bg-[var(--color-border)]" />
            ) : null}

            {canAdd ? (
              <DropdownMenu.Item
                className={cn(menuItemClassName, 'text-[var(--color-accent)]')}
                onSelect={() => onAdd()}
              >
                <Plus className="h-3.5 w-3.5" />
                Add segment
              </DropdownMenu.Item>
            ) : null}
            {canClone ? (
              <DropdownMenu.Item className={menuItemClassName} onSelect={() => onClone()}>
                <Copy className="h-3.5 w-3.5 text-[var(--color-muted)]" />
                Clone segment
              </DropdownMenu.Item>
            ) : null}
            {canMoveUp ? (
              <DropdownMenu.Item className={menuItemClassName} onSelect={() => onMoveUp()}>
                <ArrowUp className="h-3.5 w-3.5 text-[var(--color-muted)]" />
                Move up
              </DropdownMenu.Item>
            ) : null}
            {canMoveDown ? (
              <DropdownMenu.Item className={menuItemClassName} onSelect={() => onMoveDown()}>
                <ArrowDown className="h-3.5 w-3.5 text-[var(--color-muted)]" />
                Move down
              </DropdownMenu.Item>
            ) : null}
            {hasDeleteActions && (canAdd || canClone || canMoveUp || canMoveDown) ? (
              <DropdownMenu.Separator className="my-1 h-px bg-[var(--color-border)]" />
            ) : null}
            {hasDeleteActions ? (
              <>
                <DropdownMenu.Label className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  Delete
                </DropdownMenu.Label>
                {showTicketDelete ? (
                  <DropdownMenu.Item
                    className={cn(menuItemClassName, 'text-[var(--color-danger)] data-[highlighted]:bg-[var(--color-danger-muted)]')}
                    onSelect={() => onRemoveTicket()}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {ticketDeleteLabel}
                  </DropdownMenu.Item>
                ) : null}
                {showSegmentDelete ? (
                  <DropdownMenu.Item
                    className={cn(menuItemClassName, 'text-[var(--color-danger)] data-[highlighted]:bg-[var(--color-danger-muted)]')}
                    onSelect={() => onRemoveSegment()}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove segment
                  </DropdownMenu.Item>
                ) : null}
              </>
            ) : null}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  )
}
