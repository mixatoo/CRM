import { useQuery } from '@tanstack/react-query'
import { useDatabaseReady } from '@/app/providers'
import { db } from '@/infrastructure/database/db'
import type { Client } from '@/domain/entities/client'
import {
  resolveClientDashboardAnalytics,
  type ClientDashboardAnalytics,
} from '@/features/clients/utils/client-dashboard-analytics'

export type ClientDashboardMetrics = ClientDashboardAnalytics

export function useClientDashboard(clientId: string | undefined, client?: Client | null) {
  const dbReady = useDatabaseReady()

  return useQuery({
    queryKey: ['clients', clientId, 'dashboard', client?.billingAccount, client?.creditLimit],
    queryFn: async (): Promise<ClientDashboardAnalytics> => {
      const trips = await db.trips.where('clientId').equals(clientId!).toArray()
      const tripIds = trips.map((trip) => trip.id)

      const [invoices, services] =
        tripIds.length > 0
          ? await Promise.all([
              db.invoices.where('tripId').anyOf(tripIds).toArray(),
              db.tripServices.where('tripId').anyOf(tripIds).toArray(),
            ])
          : [[], []]

      if (!client) {
        return resolveClientDashboardAnalytics(
          {
            billingAccount: 'cash',
            preferredCurrency: 'EGP',
            paymentCurrencies: ['EGP'],
          } as Client,
          trips,
          invoices,
          services,
        )
      }

      return resolveClientDashboardAnalytics(client, trips, invoices, services)
    },
    enabled: dbReady && !!clientId,
    staleTime: 30_000,
  })
}
