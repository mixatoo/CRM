import { Plus, Users, Wand2 } from 'lucide-react'
import type { FlightPassenger, FlightTripType } from '@/domain/flight/types'
import { PASSENGER_TYPE_OPTIONS, PASSENGER_TITLE_OPTIONS } from '@/domain/flight/types'
import { createEmptyFlightPassenger } from '@/domain/flight/ticket'
import { Button } from '@/design-system/components/Button'
import { Input } from '@/design-system/components/Input'
import { FormPicklist } from '@/design-system/components/FormPicklist'
import { cn } from '@/shared/utils/cn'
import { layout } from '@/design-system/tokens/layout'

interface FlightPassengersPanelProps {
  passengers: FlightPassenger[]
  tripType: FlightTripType
  readOnly?: boolean
  onChange: (passengers: FlightPassenger[]) => void
  onGenerateTickets: () => void
}

export function FlightPassengersPanel({
  passengers,
  tripType,
  readOnly,
  onChange,
  onGenerateTickets,
}: FlightPassengersPanelProps) {
  const updatePassenger = (index: number, patch: Partial<FlightPassenger>) => {
    onChange(passengers.map((p, i) => (i === index ? { ...p, ...patch } : p)))
  }

  const addPassenger = () => {
    onChange([...passengers, createEmptyFlightPassenger(tripType)])
  }

  const removePassenger = (index: number) => {
    if (passengers.length <= 1) return
    onChange(passengers.filter((_, i) => i !== index))
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] px-3 py-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[var(--color-muted)]" />
          <span className="text-xs font-medium">Passengers ({passengers.length})</span>
        </div>
        <div className="flex gap-1">
          <Button variant="secondary" size="sm" className="h-7 gap-1 text-[11px]" onClick={onGenerateTickets} disabled={readOnly}>
            <Wand2 className="h-3.5 w-3.5" />
            Generate tickets
          </Button>
          <Button variant="secondary" size="sm" className="h-7 gap-1 text-[11px]" onClick={addPassenger} disabled={readOnly}>
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      </div>
      <div className="divide-y divide-[var(--color-border)]">
        {passengers.map((passenger, index) => (
          <div key={passenger.id} className="grid gap-2 px-3 py-2 sm:grid-cols-[auto_1fr_1fr_auto_auto] sm:items-center">
            <span className={cn(layout.caption, 'w-6 tabular-nums')}>{index + 1}</span>
            <FormPicklist
              size="sm"
              value={passenger.passengerTitle ?? ''}
              onChange={(value) => updatePassenger(index, { passengerTitle: value })}
              options={PASSENGER_TITLE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              panelTitle="Title"
              ariaLabel="Passenger title"
              disabled={readOnly}
            />
            <Input
              size="sm"
              placeholder="Passenger name"
              value={passenger.passengerName}
              disabled={readOnly}
              onChange={(e) => updatePassenger(index, { passengerName: e.target.value })}
            />
            <FormPicklist
              size="sm"
              value={passenger.passengerType}
              onChange={(value) =>
                updatePassenger(index, { passengerType: value as FlightPassenger['passengerType'] })
              }
              options={PASSENGER_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              panelTitle="Passenger type"
              ariaLabel="Passenger type"
              disabled={readOnly}
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] text-red-600"
              onClick={() => removePassenger(index)}
              disabled={readOnly || passengers.length <= 1}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
