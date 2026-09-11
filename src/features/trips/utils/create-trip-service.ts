import { type ServiceCategory, SERVICE_CATEGORY_LABELS, type Trip } from '@/domain/entities'
import type { TripService, TripServiceStatus } from '@/domain/entities/trip-service'
import { emptyCategoryDetailsForCategory } from '@/domain/entities/trip-service-category-details'
import { migrateFlightServiceDetails, refreshFlightServiceDetails } from '@/domain/entities/trip-service-flight'

export interface CreateTripServiceInput {
  category: ServiceCategory
  startDate: string
  status: TripServiceStatus
}

export function defaultTripServiceStartDate(trip: Trip): string {
  return (trip.startDate ?? trip.bookingStartedAt).slice(0, 10)
}

function applyFlightScheduleDate(
  flightDetails: NonNullable<TripService['flightDetails']>,
  startDate: string,
): NonNullable<TripService['flightDetails']> {
  return {
    ...flightDetails,
    passengers: flightDetails.passengers.map((passenger) => ({
      ...passenger,
      tickets: passenger.tickets.map((ticket) => ({
        ...ticket,
        segments: ticket.segments.map((segment) => ({
          ...segment,
          departureDate: startDate,
          arrivalDate: startDate,
        })),
      })),
    })),
  }
}

export function buildNewTripService(
  trip: Trip,
  input: CreateTripServiceInput,
  existingServices: TripService[],
): Omit<TripService, 'id'> {
  const now = new Date().toISOString()
  const lineNumber = existingServices.reduce((max, service) => Math.max(max, service.lineNumber), 0) + 1

  const base: Omit<TripService, 'id'> = {
    tripId: trip.id,
    lineNumber,
    category: input.category,
    status: input.status,
    name: `New ${SERVICE_CATEGORY_LABELS[input.category]}`,
    cost: 0,
    currency: trip.currency,
    startDate: input.startDate,
    endDate: input.startDate,
    createdAt: now,
    updatedAt: now,
    ...emptyCategoryDetailsForCategory(input.category),
  }

  if (input.category !== 'flight') return base

  const flightDetails = applyFlightScheduleDate(
    refreshFlightServiceDetails(
      migrateFlightServiceDetails(
        {
          tripType: 'one_way',
          passengers: [],
        },
        trip.currency,
      ),
      trip.currency,
    ),
    input.startDate,
  )

  return {
    ...base,
    flightDetails,
  }
}
