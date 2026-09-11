import { useQuery } from '@tanstack/react-query'
import { useDatabaseReady } from '@/app/providers'
import { db } from '@/infrastructure/database/db'
import { TRIP_PIPELINE_STAGES, TRIP_STAGE_LABELS, tripTotalSelling } from '@/domain/entities'
import { sumActivePayments } from '@/domain/entities/trip-payment'
import { openInvoiceReceivables } from '@/domain/trip/trip-financial-sync'

export function useReportsData() {
  const dbReady = useDatabaseReady()

  return useQuery({
    queryKey: ['reports', 'summary'],
    queryFn: async () => {
      const [trips, payments, invoices, services] = await Promise.all([
        db.trips.toArray(),
        db.tripPayments.toArray(),
        db.invoices.toArray(),
        db.tripServices.toArray(),
      ])

      const activeTrips = trips.filter((trip) => trip.stage !== 'lost' && trip.stage !== 'closed')
      const pipeline = TRIP_PIPELINE_STAGES.map((stage) => ({
        stage,
        label: TRIP_STAGE_LABELS[stage],
        count: trips.filter((trip) => trip.stage === stage).length,
      }))

      const totalSelling = activeTrips.reduce((sum, trip) => sum + tripTotalSelling(trip), 0)
      const totalCost = activeTrips.reduce((sum, trip) => sum + trip.totalCost, 0)
      const totalMargin = totalSelling - totalCost

      const inbound = sumActivePayments(payments, 'inbound')
      const outbound = sumActivePayments(payments, 'outbound')
      const openReceivables = openInvoiceReceivables(invoices)
      const supplierExposure = activeTrips.reduce((sum, trip) => sum + Math.max(0, trip.supplierBalanceDue), 0)

      const topTrips = [...activeTrips]
        .map((trip) => ({
          id: trip.id,
          reference: trip.reference,
          name: trip.name,
          stage: trip.stage,
          selling: tripTotalSelling(trip),
          cost: trip.totalCost,
          margin: tripTotalSelling(trip) - trip.totalCost,
          currency: trip.currency,
        }))
        .sort((a, b) => b.margin - a.margin)
        .slice(0, 8)

      const supplierMap = new Map<string, number>()
      for (const service of services) {
        if (service.status === 'canceled') continue
        const key = service.supplierName?.trim() || 'Unassigned'
        supplierMap.set(key, (supplierMap.get(key) ?? 0) + service.cost)
      }
      const topSuppliers = [...supplierMap.entries()]
        .map(([name, exposure]) => ({ name, exposure }))
        .sort((a, b) => b.exposure - a.exposure)
        .slice(0, 6)

      return {
        tripCount: trips.length,
        activeTripCount: activeTrips.length,
        pipeline,
        financial: {
          totalSelling,
          totalCost,
          totalMargin,
          inbound,
          outbound,
          openReceivables,
          supplierExposure,
          currency: 'EGP',
        },
        topTrips,
        topSuppliers,
      }
    },
    enabled: dbReady,
  })
}
