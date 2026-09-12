import type { Traveler } from '@/domain/entities/traveler'
import { TravelCard } from '@/design-system/layout/TravelCard'
import { layout } from '@/design-system/tokens/layout'
import { cn } from '@/shared/utils/cn'

interface TravelerNotesTabProps {
  traveler: Traveler
}

export function TravelerNotesTab({ traveler }: TravelerNotesTabProps) {
  const notes = traveler.notes?.trim()

  return (
    <TravelCard contentClassName="px-4 py-4">
      <h3 className={cn(layout.sectionTitle, 'mb-2')}>Notes</h3>
      {notes ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-foreground)]">{notes}</p>
      ) : (
        <p className="text-sm text-[var(--color-muted)]">
          No profile notes yet. Add notes from the Profile tab.
        </p>
      )}
    </TravelCard>
  )
}
