import { useEffect, useState } from 'react'
import {
  Ban,
  Banknote,
  CreditCard,
  Download,
  Printer,
  RefreshCw,
  RotateCcw,
  Send,
  Ticket,
  XCircle,
} from 'lucide-react'
import type { FlightPassenger, FlightTicket } from '@/domain/flight/types'
import {
  PASSENGER_TYPE_LABELS,
  TICKET_STATUS_LABELS,
} from '@/domain/flight/types'
import { normalizeTicketPricing } from '@/domain/flight/financial'
import { Button } from '@/design-system/components/Button'
import { Input } from '@/design-system/components/Input'
import { FormDatePicker } from '@/design-system/components/DatePickerField'
import { FormPicklist } from '@/design-system/components/FormPicklist'
import { AccountingAmount } from '@/design-system/components/AccountingAmount'
import { FlightDrawer } from '@/features/trips/components/services/flight/FlightDrawer'
import { FlightTicketLedger, FlightTicketHistory } from '@/features/trips/components/services/flight/FlightTicketLedger'
import { listTicketOperationAvailability } from '@/domain/flight/transitions'
import type { TicketOperationContext } from '@/domain/flight/transitions'
import type { FlightOperationType } from '@/features/trips/components/services/flight/FlightOperationModal'
import { cn } from '@/shared/utils/cn'
import { layout } from '@/design-system/tokens/layout'
import {
  CABIN_CLASS_OPTIONS,
  FLIGHT_AIRLINE_OPTIONS,
  FLIGHT_SEGMENT_STATUS_OPTIONS,
} from '@/domain/flight/types'

type TicketDetailTab = 'details' | 'segments' | 'ledger' | 'history'

interface FlightTicketDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticket: FlightTicket | null
  passenger: FlightPassenger | null
  onTicketChange: (ticket: FlightTicket) => void
  onOperation: (operation: FlightOperationType) => void
  onReverseTransaction?: (transactionId: string, reason: string) => void
  onCorrectTransaction?: (transactionId: string, reason: string) => void
  isReversingTransaction?: boolean
  readOnly?: boolean
  operationContext?: TicketOperationContext
  initialTab?: TicketDetailTab
}

export function FlightTicketDetailDrawer({
  open,
  onOpenChange,
  ticket,
  passenger,
  onTicketChange,
  onOperation,
  onReverseTransaction,
  onCorrectTransaction,
  isReversingTransaction = false,
  readOnly,
  operationContext,
  initialTab = 'details',
}: FlightTicketDetailDrawerProps) {
  const [tab, setTab] = useState<TicketDetailTab>(initialTab)

  useEffect(() => {
    if (open) setTab(initialTab)
  }, [open, initialTab])

  if (!ticket || !passenger) return null

  const availability = listTicketOperationAvailability(ticket, operationContext)
  const availabilityByOp = new Map(availability.map((row) => [row.operation, row]))

  const updatePricing = (field: keyof FlightTicket['pricing'], value: number | string) => {
    const nextPricing = normalizeTicketPricing({ ...ticket.pricing, [field]: value })
    onTicketChange({ ...ticket, pricing: nextPricing })
  }

  const updateSegment = (segmentId: string, field: string, value: string) => {
    onTicketChange({
      ...ticket,
      segments: ticket.segments.map((s) => (s.id === segmentId ? { ...s, [field]: value } : s)),
    })
  }

  const ops: { op: FlightOperationType; label: string; icon: React.ReactNode; variant?: 'danger' }[] = [
    { op: 'issue', label: 'Issue', icon: <Ticket className="h-3.5 w-3.5" /> },
    { op: 'refund', label: 'Refund', icon: <RotateCcw className="h-3.5 w-3.5" /> },
    { op: 'partial_refund', label: 'Partial Refund', icon: <RotateCcw className="h-3.5 w-3.5" /> },
    { op: 'reissue', label: 'Reissue', icon: <RefreshCw className="h-3.5 w-3.5" /> },
    { op: 'void', label: 'Void', icon: <XCircle className="h-3.5 w-3.5" />, variant: 'danger' },
    { op: 'cancel', label: 'Cancel', icon: <Ban className="h-3.5 w-3.5" />, variant: 'danger' },
    { op: 'client_payment', label: 'Receive Payment', icon: <CreditCard className="h-3.5 w-3.5" /> },
    { op: 'supplier_payment', label: 'Pay Supplier', icon: <Banknote className="h-3.5 w-3.5" /> },
  ]

  return (
    <FlightDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={passenger.passengerName || 'Ticket'}
      description={`${TICKET_STATUS_LABELS[ticket.status]} · ${PASSENGER_TYPE_LABELS[passenger.passengerType]} · ${ticket.route}`}
      width="xl"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-1">
          {ops.map(({ op, label, icon, variant }) => {
            const row = availabilityByOp.get(op)
            const allowed = row?.allowed ?? false
            return (
            <Button
              key={op}
              variant={variant === 'danger' ? 'secondary' : 'secondary'}
              size="sm"
              className={cn('h-7 gap-1 text-[11px]', variant === 'danger' && allowed && 'text-red-600')}
              onClick={() => onOperation(op)}
              disabled={readOnly || !allowed}
              title={row?.reason}
            >
              {icon}
              {label}
            </Button>
            )
          })}
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-[11px]">
            <Printer className="h-3.5 w-3.5" /> Print
          </Button>
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-[11px]">
            <Download className="h-3.5 w-3.5" /> Download
          </Button>
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-[11px]">
            <Send className="h-3.5 w-3.5" /> Send
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] p-2">
          {(
            [
              ['Supplier Cost', ticket.financials.supplierCost],
              ['Selling', ticket.financials.sellingPrice],
              ['Profit', ticket.financials.netProfit],
              ['Outstanding', ticket.financials.amountOutstanding],
            ] as const
          ).map(([label, amount]) => (
            <div key={label}>
              <p className={layout.caption}>{label}</p>
              <AccountingAmount amount={amount} currency={ticket.pricing.currency} />
            </div>
          ))}
        </div>

        <div className="flex gap-1 border-b border-[var(--color-border)]">
          {(['details', 'segments', 'ledger', 'history'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium capitalize',
                tab === t
                  ? 'border-b-2 border-[var(--color-accent)] text-[var(--color-foreground)]'
                  : 'text-[var(--color-muted)]',
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'details' ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="PNR">
              <Input size="sm" value={ticket.pnr} disabled={readOnly} onChange={(e) => onTicketChange({ ...ticket, pnr: e.target.value })} />
            </Field>
            <Field label="Ticket number">
              <Input size="sm" value={ticket.ticketNumber} disabled={readOnly} onChange={(e) => onTicketChange({ ...ticket, ticketNumber: e.target.value })} />
            </Field>
            <Field label="Airline">
              <FormPicklist
                size="sm"
                value={ticket.airline}
                onChange={(value) => onTicketChange({ ...ticket, airline: value })}
                options={FLIGHT_AIRLINE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                panelTitle="Airline"
                ariaLabel="Airline"
                disabled={readOnly}
                searchable
                searchPlaceholder="Search airlines…"
              />
            </Field>
            <Field label="Supplier">
              <Input size="sm" value={ticket.supplierName} disabled={readOnly} onChange={(e) => onTicketChange({ ...ticket, supplierName: e.target.value })} />
            </Field>
            <Field label="Cabin">
              <FormPicklist
                size="sm"
                value={ticket.cabinClass}
                onChange={(value) => onTicketChange({ ...ticket, cabinClass: value })}
                options={CABIN_CLASS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                panelTitle="Cabin class"
                ariaLabel="Cabin class"
                disabled={readOnly}
              />
            </Field>
            <Field label="Issue date">
              <FormDatePicker
                value={ticket.issueDate ?? ''}
                onChange={(value) => onTicketChange({ ...ticket, issueDate: value })}
                readOnly={readOnly}
                aria-label="Issue date"
              />
            </Field>
            <Field label="Fare">
              <Input type="number" size="sm" value={ticket.pricing.fare} disabled={readOnly} onChange={(e) => updatePricing('fare', Number(e.target.value))} />
            </Field>
            <Field label="Taxes">
              <Input type="number" size="sm" value={ticket.pricing.taxes} disabled={readOnly} onChange={(e) => updatePricing('taxes', Number(e.target.value))} />
            </Field>
            <Field label="Airline fees">
              <Input type="number" size="sm" value={ticket.pricing.airlineFees} disabled={readOnly} onChange={(e) => updatePricing('airlineFees', Number(e.target.value))} />
            </Field>
            <Field label="Supplier fees">
              <Input type="number" size="sm" value={ticket.pricing.supplierFees} disabled={readOnly} onChange={(e) => updatePricing('supplierFees', Number(e.target.value))} />
            </Field>
            <Field label="Commission">
              <Input type="number" size="sm" value={ticket.pricing.commission ?? 0} disabled={readOnly} onChange={(e) => updatePricing('commission', Number(e.target.value))} />
            </Field>
            <Field label="Client discount">
              <Input type="number" size="sm" value={ticket.pricing.clientDiscount ?? 0} disabled={readOnly} onChange={(e) => updatePricing('clientDiscount', Number(e.target.value))} />
            </Field>
            <Field label="Mark-up">
              <Input type="number" size="sm" value={ticket.pricing.agencyServiceFees} disabled={readOnly} onChange={(e) => updatePricing('agencyServiceFees', Number(e.target.value))} />
            </Field>
            <Field label="Selling price">
              <Input type="number" size="sm" value={ticket.pricing.sellingPrice} disabled={readOnly} onChange={(e) => updatePricing('sellingPrice', Number(e.target.value))} />
            </Field>
            <Field label="Currency">
              <Input size="sm" value={ticket.pricing.currency} disabled={readOnly} onChange={(e) => updatePricing('currency', e.target.value)} />
            </Field>
            <Field label="Exchange rate">
              <Input type="number" step="0.0001" size="sm" value={ticket.pricing.exchangeRate} disabled={readOnly} onChange={(e) => updatePricing('exchangeRate', Number(e.target.value))} />
            </Field>
          </div>
        ) : null}

        {tab === 'segments' ? (
          <div className="space-y-3">
            {ticket.segments.map((segment, index) => (
              <div key={segment.id} className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
                <p className="mb-2 text-xs font-medium">Segment {index + 1}</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  <Field label="Flight">
                    <Input size="sm" value={segment.flightNumber} disabled={readOnly} onChange={(e) => updateSegment(segment.id, 'flightNumber', e.target.value)} />
                  </Field>
                  <Field label="From">
                    <Input size="sm" value={segment.departureAirport} disabled={readOnly} onChange={(e) => updateSegment(segment.id, 'departureAirport', e.target.value.toUpperCase())} />
                  </Field>
                  <Field label="To">
                    <Input size="sm" value={segment.arrivalAirport} disabled={readOnly} onChange={(e) => updateSegment(segment.id, 'arrivalAirport', e.target.value.toUpperCase())} />
                  </Field>
                  <Field label="Departure">
                    <FormDatePicker
                      value={segment.departureDate}
                      onChange={(value) => updateSegment(segment.id, 'departureDate', value)}
                      readOnly={readOnly}
                      aria-label="Departure date"
                    />
                  </Field>
                  <Field label="Time">
                    <Input size="sm" value={segment.departureTime} disabled={readOnly} onChange={(e) => updateSegment(segment.id, 'departureTime', e.target.value)} />
                  </Field>
                  <Field label="Status">
                    <FormPicklist
                      size="sm"
                      value={segment.segmentStatus ?? ''}
                      onChange={(value) => updateSegment(segment.id, 'segmentStatus', value)}
                      options={FLIGHT_SEGMENT_STATUS_OPTIONS.map((o) => ({
                        value: o.value,
                        label: o.label,
                      }))}
                      panelTitle="Segment status"
                      ariaLabel="Segment status"
                      disabled={readOnly}
                    />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {tab === 'ledger' ? <FlightTicketLedger ticket={ticket} /> : null}
        {tab === 'history' ? (
          <FlightTicketHistory
            ticket={ticket}
            readOnly={readOnly}
            onReverseTransaction={onReverseTransaction}
            onCorrectTransaction={onCorrectTransaction}
            isReversing={isReversingTransaction}
          />
        ) : null}
      </div>
    </FlightDrawer>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label>
      <span className={cn(layout.caption, 'mb-1 block')}>{label}</span>
      {children}
    </label>
  )
}
