import { useCallback, useEffect, useMemo, useState } from 'react'
import { Save, TicketPlus } from 'lucide-react'
import type { TripService } from '@/domain/entities/trip-service'
import type { FlightServiceDetails, FlightTicket } from '@/domain/flight/types'
import { FLIGHT_TRIP_TYPE_LABELS, FLIGHT_TRIP_TYPES } from '@/domain/flight/types'
import {
  createEmptyFlightTicket,
  defaultFlightServiceDetails,
  executeTicketOperation,
  generateTicketsForAllPassengers,
  migrateFlightServiceDetails,
  refreshFlightServiceDetails,
  validateTicketOperation,
} from '@/domain/flight'
import { useToast } from '@/design-system/components/Toast'
import { refreshTicketComputedFields } from '@/domain/flight/financial'
import { Button } from '@/design-system/components/Button'
import { Input } from '@/design-system/components/Input'
import { FormPicklist } from '@/design-system/components/FormPicklist'
import { FlightFinancialSummaryBar } from '@/features/trips/components/services/flight/FlightFinancialSummaryBar'
import { FlightPassengersPanel } from '@/features/trips/components/services/flight/FlightPassengersPanel'
import { FlightReportsView } from '@/features/trips/components/services/flight/FlightReportsView'
import { FlightTicketsTable, type FlatTicketRow } from '@/features/trips/components/services/flight/FlightTicketsTable'
import { FlightTicketDetailDrawer } from '@/features/trips/components/services/flight/FlightTicketDetailDrawer'
import {
  FlightOperationModal,
  type FlightOperationType,
} from '@/features/trips/components/services/flight/FlightOperationModal'
import { useSaveFlightDetails } from '@/features/trips/hooks/use-update-trip-service'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { cn } from '@/shared/utils/cn'
import { layout } from '@/design-system/tokens/layout'

type WorkspaceTab = 'tickets' | 'passengers' | 'reports'

interface FlightServiceWorkspaceProps {
  service: TripService
  clientName?: string
}

function toDetails(service: TripService): FlightServiceDetails {
  if (service.flightDetails) {
    return migrateFlightServiceDetails(service.flightDetails, service.currency)
  }
  return defaultFlightServiceDetails('one_way', service.currency)
}

export function FlightServiceWorkspace({ service, clientName }: FlightServiceWorkspaceProps) {
  const user = useAuthStore((s) => s.user)
  const { toast } = useToast()
  const { saveFlightDetails, isPending } = useSaveFlightDetails(service.tripId, service)

  const [details, setDetails] = useState<FlightServiceDetails>(() => toDetails(service))
  const [tab, setTab] = useState<WorkspaceTab>('tickets')
  const [selectedRow, setSelectedRow] = useState<FlatTicketRow | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [operation, setOperation] = useState<FlightOperationType | null>(null)
  const [operationOpen, setOperationOpen] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    setDetails(toDetails(service))
    setIsDirty(false)
    setSelectedRow(null)
    setDrawerOpen(false)
  }, [service])

  const refreshed = useMemo(() => refreshFlightServiceDetails(details, service.currency), [details, service.currency])

  const persist = useCallback(
    (next: FlightServiceDetails) => {
      const migrated = refreshFlightServiceDetails(next, service.currency)
      setDetails(migrated)
      setIsDirty(true)
      return migrated
    },
    [service.currency],
  )

  const handleSave = () => {
    saveFlightDetails(refreshed)
    setIsDirty(false)
  }

  const updateTicketAtRow = (row: FlatTicketRow, ticket: FlightTicket) => {
    const nextPassengers = details.passengers.map((passenger, pi) => {
      if (pi !== row.passengerIndex) return passenger
      return {
        ...passenger,
        tickets: passenger.tickets.map((t, ti) =>
          ti === row.ticketIndex ? refreshTicketComputedFields(ticket) : t,
        ),
      }
    })
    persist({ ...details, passengers: nextPassengers })
    if (selectedRow?.ticket.id === ticket.id) {
      setSelectedRow({ ...row, ticket: refreshTicketComputedFields(ticket) })
    }
  }

  const handleOperation = (op: FlightOperationType, data: unknown) => {
    if (!selectedRow) return
    const ticketId = selectedRow.ticket.id

    const gate = validateTicketOperation(selectedRow.ticket, op, {
      serviceStatus: service.status,
      userRole: user?.role,
    })
    if (!gate.ok) {
      toast({ intent: 'failed', title: 'Operation not available', description: gate.error.message })
      return
    }

    const result = executeTicketOperation(details, ticketId, op, data, {
      serviceStatus: service.status,
      userRole: user?.role,
      userId: user?.id,
      userName: user?.name,
    })

    if (!result.ok) {
      toast({ intent: 'failed', title: 'Could not complete operation', description: result.error.message })
      return
    }

    const migrated = persist(result.value)
    const updatedRow = migrated.passengers
      .flatMap((p, pi) => p.tickets.map((t, ti) => ({ ticket: t, passenger: p, passengerIndex: pi, ticketIndex: ti })))
      .find((r) => r.ticket.id === ticketId)
    if (updatedRow) setSelectedRow(updatedRow)
    setOperationOpen(false)
    setOperation(null)
    saveFlightDetails(migrated)
  }

  const addTicket = () => {
    if (details.passengers.length === 0) return
    const passengerIndex = 0
    const passenger = details.passengers[passengerIndex]
    const newTicket = createEmptyFlightTicket(passenger.id, details.tripType, {}, service.currency)
    const nextPassengers = details.passengers.map((p, i) =>
      i === passengerIndex ? { ...p, tickets: [...p.tickets, newTicket] } : p,
    )
    persist({ ...details, passengers: nextPassengers })
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-3 sm:p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <label>
            <span className={cn(layout.caption, 'mb-1 block')}>Trip type</span>
            <FormPicklist
              size="sm"
              value={details.tripType}
              onChange={(value) =>
                persist({
                  ...details,
                  tripType: value as FlightServiceDetails['tripType'],
                })
              }
              options={FLIGHT_TRIP_TYPES.map((t) => ({
                value: t,
                label: FLIGHT_TRIP_TYPE_LABELS[t],
              }))}
              panelTitle="Trip type"
              ariaLabel="Trip type"
            />
          </label>
          <label>
            <span className={cn(layout.caption, 'mb-1 block')}>Booking PNR</span>
            <Input
              size="sm"
              className="w-36"
              value={details.bookingPnr ?? ''}
              onChange={(e) => persist({ ...details, bookingPnr: e.target.value })}
              placeholder="GRP2026"
            />
          </label>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="gap-1" onClick={addTicket}>
            <TicketPlus className="h-4 w-4" />
            Add ticket
          </Button>
          <Button size="sm" className="gap-1" onClick={handleSave} disabled={isPending || !isDirty}>
            <Save className="h-4 w-4" />
            {isPending ? 'Saving…' : isDirty ? 'Save changes' : 'Saved'}
          </Button>
        </div>
      </div>

      <FlightFinancialSummaryBar summary={refreshed.financialSummary} />

      <div className="flex gap-1 border-b border-[var(--color-border)]">
        {(['tickets', 'passengers', 'reports'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium capitalize',
              tab === t
                ? 'border-b-2 border-[var(--color-accent)] text-[var(--color-foreground)]'
                : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === 'tickets' ? (
          <FlightTicketsTable
            details={refreshed}
            selectedTicketId={selectedRow?.ticket.id}
            onSelectTicket={(row) => {
              setSelectedRow(row)
              setDrawerOpen(true)
            }}
            onTicketInlineChange={updateTicketAtRow}
          />
        ) : null}

        {tab === 'passengers' ? (
          <FlightPassengersPanel
            passengers={details.passengers}
            tripType={details.tripType}
            onChange={(passengers) => persist({ ...details, passengers })}
            onGenerateTickets={() =>
              persist({
                ...details,
                passengers: generateTicketsForAllPassengers(details.passengers, details.tripType, undefined, service.currency),
              })
            }
          />
        ) : null}

        {tab === 'reports' ? <FlightReportsView details={refreshed} clientName={clientName} /> : null}
      </div>

      <FlightTicketDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        ticket={selectedRow?.ticket ?? null}
        passenger={selectedRow?.passenger ?? null}
        onTicketChange={(ticket) => {
          if (selectedRow) updateTicketAtRow(selectedRow, ticket)
        }}
        onOperation={(op) => {
          const gate = validateTicketOperation(selectedRow!.ticket, op, {
            serviceStatus: service.status,
            userRole: user?.role,
          })
          if (!gate.ok) {
            toast({ intent: 'failed', title: 'Operation not available', description: gate.error.message })
            return
          }
          setOperation(op)
          setOperationOpen(true)
        }}
        operationContext={{ serviceStatus: service.status, userRole: user?.role }}
      />

      <FlightOperationModal
        open={operationOpen}
        onOpenChange={setOperationOpen}
        operation={operation}
        ticket={selectedRow?.ticket ?? null}
        onConfirm={handleOperation}
        isPending={isPending}
        operationContext={{ serviceStatus: service.status, userRole: user?.role }}
      />
    </div>
  )
}
