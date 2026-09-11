import { useQuery } from '@tanstack/react-query'
import { useDatabaseReady } from '@/app/providers'
import { db } from '@/infrastructure/database/db'
import { TRIP_PIPELINE_STAGES, TRIP_STAGE_LABELS, tripTotalSelling } from '@/domain/entities'

export function usePipelineData() {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: ['pipeline'],
    queryFn: async () => {
      const trips = await db.trips.toArray()
      const active = trips.filter((trip) => trip.stage !== 'lost')

      const columns = TRIP_PIPELINE_STAGES.map((stage) => {
        const items = active
          .filter((trip) => trip.stage === stage)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .map((trip) => ({
            id: trip.id,
            reference: trip.reference,
            name: trip.name,
            clientName: trip.mainContactName,
            destination: trip.destination,
            startDate: trip.startDate,
            value: tripTotalSelling(trip),
            currency: trip.currency,
          }))

        return {
          stage,
          label: TRIP_STAGE_LABELS[stage],
          count: items.length,
          value: items.reduce((sum, item) => sum + item.value, 0),
          items,
        }
      })

      return {
        columns,
        totalActive: active.filter((trip) => trip.stage !== 'closed').length,
        pipelineValue: active
          .filter((trip) => !['closed', 'lost'].includes(trip.stage))
          .reduce((sum, trip) => sum + tripTotalSelling(trip), 0),
      }
    },
    enabled: dbReady,
  })
}
