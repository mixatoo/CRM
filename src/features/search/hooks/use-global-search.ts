import { useQuery } from '@tanstack/react-query'
import { useDatabaseReady } from '@/app/providers'
import { db } from '@/infrastructure/database/db'
import { travelerDisplayName } from '@/domain/entities/traveler'
import { clientPrimaryLabel } from '@/domain/entities/client'

export type SearchResultKind = 'trip' | 'client' | 'supplier' | 'reminder' | 'traveler'

export interface SearchResult {
  id: string
  kind: SearchResultKind
  title: string
  subtitle: string
  href: string
}

const MAX_RESULTS = 50

function matchesQuery(haystack: string, query: string) {
  return haystack.includes(query)
}

async function collectMatches(
  results: SearchResult[],
  scan: (push: (result: SearchResult) => void) => Promise<void>,
) {
  if (results.length >= MAX_RESULTS) return

  await scan((result) => {
    if (results.length < MAX_RESULTS) results.push(result)
  })
}

export function useGlobalSearch(query: string) {
  const dbReady = useDatabaseReady()
  const q = query.trim().toLowerCase()

  return useQuery({
    queryKey: ['search', q],
    queryFn: async () => {
      if (!q) return { results: [] as SearchResult[], total: 0 }

      const results: SearchResult[] = []

      await collectMatches(results, async (push) => {
        await db.trips.each((trip) => {
          if (results.length >= MAX_RESULTS) return false
          const haystack = [trip.reference, trip.name, trip.mainContactName, trip.destination, trip.ownerName]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
          if (!matchesQuery(haystack, q)) return
          push({
            id: trip.id,
            kind: 'trip',
            title: trip.name,
            subtitle: `${trip.reference} · ${trip.mainContactName ?? '—'}`,
            href: `/trips/${trip.id}/dashboard`,
          })
        })
      })

      await collectMatches(results, async (push) => {
        await db.clients.each((client) => {
          if (results.length >= MAX_RESULTS) return false
          const haystack = [client.reference, client.displayName, client.company, client.email, client.phone]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
          if (!matchesQuery(haystack, q)) return
          push({
            id: client.id,
            kind: 'client',
            title: client.displayName,
            subtitle: `${client.reference} · ${client.company ?? client.email ?? '—'}`,
            href: `/clients/${client.id}/profile`,
          })
        })
      })

      await collectMatches(results, async (push) => {
        await db.suppliers.each((supplier) => {
          if (results.length >= MAX_RESULTS) return false
          const haystack = [supplier.reference, supplier.displayName, supplier.email, supplier.category]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
          if (!matchesQuery(haystack, q)) return
          push({
            id: supplier.id,
            kind: 'supplier',
            title: supplier.displayName,
            subtitle: `${supplier.reference} · ${supplier.category}`,
            href: `/suppliers/${supplier.id}/overview`,
          })
        })
      })

      await collectMatches(results, async (push) => {
        await db.reminders.each((reminder) => {
          if (results.length >= MAX_RESULTS) return false
          const haystack = [reminder.reference, reminder.title, reminder.assigneeName, reminder.description]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
          if (!matchesQuery(haystack, q)) return
          push({
            id: reminder.id,
            kind: 'reminder',
            title: reminder.title,
            subtitle: `${reminder.reference} · ${reminder.status}`,
            href: reminder.tripId ? `/trips/${reminder.tripId}/dashboard` : '/reminders',
          })
        })
      })

      await collectMatches(results, async (push) => {
        const clients = await db.clients.toArray()
        const accountNames = new Map(clients.map((client) => [client.id, clientPrimaryLabel(client)] as const))

        await db.travelers.each((traveler) => {
          if (results.length >= MAX_RESULTS) return false
          const accountName = accountNames.get(traveler.accountId) ?? 'Unknown account'
          const haystack = [
            traveler.reference,
            travelerDisplayName(traveler),
            traveler.jobTitle,
            traveler.email,
            traveler.phone,
            accountName,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
          if (!matchesQuery(haystack, q)) return
          push({
            id: traveler.id,
            kind: 'traveler',
            title: travelerDisplayName(traveler),
            subtitle: `${traveler.reference} · ${accountName}${traveler.jobTitle ? ` · ${traveler.jobTitle}` : ''}`,
            href: `/clients/${traveler.accountId}/travelers`,
          })
        })
      })

      return { results, total: results.length }
    },
    enabled: dbReady && q.length > 0,
    staleTime: 30_000,
  })
}
