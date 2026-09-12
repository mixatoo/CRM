import { Link } from 'react-router-dom'
import type { Traveler } from '@/domain/entities/traveler'
import { TravelCard } from '@/design-system/layout/TravelCard'
import { layout } from '@/design-system/tokens/layout'
import { cn } from '@/shared/utils/cn'

interface TravelerDocumentsTabProps {
  traveler: Traveler
}

export function TravelerDocumentsTab({ traveler }: TravelerDocumentsTabProps) {
  const passportCount = traveler.passports?.length ?? 0
  const visaCount = traveler.visas?.length ?? 0
  const otherCount = traveler.otherDocuments?.length ?? 0

  return (
    <TravelCard contentClassName="px-4 py-4">
      <h3 className={cn(layout.sectionTitle, 'mb-2')}>Documents</h3>
      <p className="text-sm text-[var(--color-muted)]">
        Passports, visas, and attachments are managed in the profile documents section.
      </p>
      <ul className="mt-3 space-y-1 text-xs text-[var(--color-foreground)]">
        <li>Passports: {passportCount}</li>
        <li>Visas: {visaCount}</li>
        <li>Other documents: {otherCount}</li>
      </ul>
      <Link
        to={`/travelers/${traveler.id}/profile`}
        className="mt-4 inline-flex text-xs font-medium text-[var(--color-accent)] hover:underline"
      >
        Open profile documents
      </Link>
    </TravelCard>
  )
}
