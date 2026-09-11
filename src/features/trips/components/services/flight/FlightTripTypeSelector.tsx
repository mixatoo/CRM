import { FLIGHT_TRIP_TYPES, FLIGHT_TRIP_TYPE_LABELS, type FlightTripType } from '@/domain/entities/trip-service-flight'
import { FormPicklist } from '@/design-system/components/FormPicklist'
import { cn } from '@/shared/utils/cn'

interface FlightTripTypeSelectorProps {
  value: FlightTripType
  onChange: (type: FlightTripType) => void
  error?: string
  className?: string
}

export function FlightTripTypeSelector({ value, onChange, error, className }: FlightTripTypeSelectorProps) {
  return (
    <div className={cn('min-w-0', className)}>
      <FormPicklist
        size="xs"
        value={value}
        onChange={(next) => onChange(next as FlightTripType)}
        options={FLIGHT_TRIP_TYPES.map((type) => ({
          value: type,
          label: FLIGHT_TRIP_TYPE_LABELS[type],
        }))}
        panelTitle="Trip type"
        ariaLabel="Trip type"
        error={Boolean(error)}
      />
      {error ? <p className="mt-0.5 text-[10px] text-[var(--color-danger)]">{error}</p> : null}
    </div>
  )
}
