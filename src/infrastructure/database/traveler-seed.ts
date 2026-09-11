import type { Traveler } from '@/domain/entities/traveler'
import { db } from '@/infrastructure/database/db'

function formatTravelerReference(sequence: number): string {
  return `TRV-${String(sequence).padStart(4, '0')}`
}

function maxTravelerReferenceSequence(travelers: Pick<Traveler, 'reference'>[]): number {
  return travelers.reduce((max, traveler) => {
    const match = traveler.reference?.match(/^TRV-(\d+)$/)
    if (!match) return max
    return Math.max(max, Number.parseInt(match[1], 10))
  }, 0)
}

export async function nextTravelerReference(): Promise<string> {
  const travelers = await db.travelers.toArray()
  return formatTravelerReference(maxTravelerReferenceSequence(travelers) + 1)
}

export { formatTravelerReference, maxTravelerReferenceSequence }
