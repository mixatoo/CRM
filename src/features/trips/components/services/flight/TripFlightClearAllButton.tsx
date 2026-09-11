import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/design-system/components/Button'
import { ConfirmDialog } from '@/design-system/components/ConfirmDialog'

interface TripFlightClearAllButtonProps {
  passengerCount: number
  ticketCount: number
  segmentCount: number
  onConfirm: () => void
}

export function TripFlightClearAllButton({
  passengerCount,
  ticketCount,
  segmentCount,
  onConfirm,
}: TripFlightClearAllButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 shrink-0 gap-1.5 px-2.5 text-xs font-normal text-[var(--color-danger)] hover:bg-[var(--color-danger-muted)]"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Clear all</span>
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        variant="danger"
        entityType="Flight table"
        title="Clear all segments and tickets"
        description="This removes every passenger, ticket, and segment from the flight table. Save to persist the cleared itinerary."
        meta={[
          { label: 'Passengers', value: String(passengerCount) },
          { label: 'Tickets', value: String(ticketCount) },
          { label: 'Segments', value: String(segmentCount) },
        ]}
        confirmLabel="Clear all"
        onConfirm={() => {
          onConfirm()
          setOpen(false)
        }}
      />
    </>
  )
}
