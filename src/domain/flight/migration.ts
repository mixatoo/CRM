import { refreshFlightServiceDetails } from '@/domain/flight/financial'
import { BASE_CURRENCY } from '@/domain/currency'
import {
  createEmptyFlightPassenger,
  createEmptyFlightTicket,
  createFlightPassengerId,
  createFlightTicketId,
  normalizeFlightPassenger,
  normalizeFlightSegment,
  normalizeFlightTicket,
  normalizeSegmentsForTripType,
  cloneFlightSegments,
} from '@/domain/flight/ticket'
import type {
  FlightPassenger,
  FlightSegment,
  FlightServiceDetails,
  FlightTicket,
  FlightTripType,
} from '@/domain/flight/types'
import { FLIGHT_SCHEMA_VERSION } from '@/domain/flight/types'

/** @deprecated Legacy segment shape kept for migration only. */
interface LegacyFlightSegmentInput extends Partial<FlightSegment> {
  id: string
  passengerTitle?: string
  passengerName?: string
  fareClass?: string
  pnr?: string
  ticketNumber?: string
  baggageAllowance?: string
  seats?: string
}

interface LegacyPassengerOnTicketInput extends Partial<FlightTicket> {
  id: string
  passengerTitle?: string
  passengerName?: string
  segmentIds?: string[]
  segments?: FlightSegment[]
  ticketStatus?: string
}

/** @deprecated All pre-v17 flight details shapes. */
export type LegacyFlightServiceDetailsInput = Omit<Partial<FlightServiceDetails>, 'tripType' | 'passengers'> & {
  tripType?: FlightTripType | 'multi_city'
  segments?: LegacyFlightSegmentInput[]
  tickets?: LegacyPassengerOnTicketInput[]
  passengers?: Array<Partial<FlightPassenger> & { tickets?: Array<Partial<FlightTicket>> }>
  schemaVersion?: number
}

function legacySegmentHasPassengerData(segment: LegacyFlightSegmentInput): boolean {
  return Boolean(
    segment.passengerTitle?.trim() ||
      segment.passengerName?.trim() ||
      segment.ticketNumber?.trim() ||
      segment.pnr?.trim() ||
      segment.fareClass?.trim() ||
      segment.baggageAllowance?.trim() ||
      segment.seats?.trim(),
  )
}

function resolveTicketSegments(
  ticket: LegacyPassengerOnTicketInput,
  sharedSegments: FlightSegment[],
  tripType: FlightTripType,
): FlightSegment[] {
  if (ticket.segments && ticket.segments.length > 0) {
    return normalizeSegmentsForTripType(
      tripType,
      ticket.segments.map((segment) => normalizeFlightSegment(segment)),
    )
  }

  const segmentIds = ticket.segmentIds ?? []
  const picked =
    segmentIds.length > 0
      ? sharedSegments.filter((segment) => segmentIds.includes(segment.id))
      : sharedSegments

  const source = picked.length > 0 ? picked : sharedSegments
  return normalizeSegmentsForTripType(tripType, cloneFlightSegments(source))
}

function passengerFromLegacyTicket(
  ticket: LegacyPassengerOnTicketInput,
  tripType: FlightTripType,
  sharedSegments: FlightSegment[],
  defaultCurrency: string,
): FlightPassenger {
  const passengerId = createFlightPassengerId()
  return normalizeFlightPassenger(
    {
      id: passengerId,
      passengerTitle: ticket.passengerTitle,
      passengerName: ticket.passengerName ?? '',
      passengerType: 'adult',
      tickets: [
        normalizeFlightTicket(
          {
            id: ticket.id ?? createFlightTicketId(),
            passengerId,
            pnr: ticket.pnr ?? '',
            ticketNumber: ticket.ticketNumber ?? '',
            fareClass: ticket.fareClass,
            baggageAllowance: ticket.baggageAllowance,
            seats: ticket.seats,
            clientId: ticket.clientId,
          status: ticket.ticketStatus === 'issued' ? 'issued' : 'draft',
          segments: resolveTicketSegments(ticket, sharedSegments, tripType),
          pricing: { currency: defaultCurrency, exchangeRate: 1, fare: 0, taxes: 0, airlineFees: 0, supplierFees: 0, agencyServiceFees: 0, commission: 0, clientDiscount: 0, sellingPrice: 0, supplierCost: 0, profit: 0 },
          },
          passengerId,
          defaultCurrency,
        ),
      ],
    },
    tripType,
    defaultCurrency,
  )
}

function passengerFromLegacySegment(segment: LegacyFlightSegmentInput, tripType: FlightTripType, defaultCurrency: string): FlightPassenger {
  const passengerId = createFlightPassengerId()
  return normalizeFlightPassenger(
    {
      id: passengerId,
      passengerTitle: segment.passengerTitle,
      passengerName: segment.passengerName ?? '',
      passengerType: 'adult',
      tickets: [
        createEmptyFlightTicket(
          passengerId,
          tripType,
          {
            pnr: segment.pnr,
            ticketNumber: segment.ticketNumber,
            fareClass: segment.fareClass,
            baggageAllowance: segment.baggageAllowance,
            seats: segment.seats,
            segments: [normalizeFlightSegment(segment)],
          },
          defaultCurrency,
        ),
      ],
    },
    tripType,
    defaultCurrency,
  )
}

function resolveFlightTripType(raw: LegacyFlightServiceDetailsInput['tripType']): FlightTripType {
  if (raw === 'multi_city') return 'multi_city'
  if (raw === 'round_trip' || raw === 'one_way') return raw
  return 'one_way'
}

function isEnterpriseSchema(raw: LegacyFlightServiceDetailsInput): boolean {
  return (raw.schemaVersion ?? 0) >= FLIGHT_SCHEMA_VERSION
}

function migratePassengerToEnterprise(
  passenger: Partial<FlightPassenger> & { tickets?: Partial<FlightTicket>[] },
  tripType: FlightTripType,
  defaultCurrency: string,
): FlightPassenger {
  const passengerId = passenger.id ?? createFlightPassengerId()
  const tickets = (passenger.tickets ?? []).map((ticket) => {
    if (ticket.pricing && ticket.financials) {
      return normalizeFlightTicket({ ...ticket, id: ticket.id ?? createFlightTicketId() }, passengerId, defaultCurrency)
    }
    return normalizeFlightTicket(
      {
        ...ticket,
        id: ticket.id ?? createFlightTicketId(),
        passengerId,
        pnr: ticket.pnr ?? '',
        ticketNumber: ticket.ticketNumber ?? '',
        airline: ticket.airline ?? '',
        supplierName: ticket.supplierName ?? '',
        route: ticket.route ?? '',
        cabinClass: ticket.cabinClass ?? '',
        status: (ticket.status as FlightTicket['status']) ?? ((ticket as { ticketStatus?: string }).ticketStatus === 'issued' ? 'issued' : 'draft'),
            segments: ticket.segments ?? [],
            transactions: ticket.transactions ?? [],
            ledger: ticket.ledger ?? [],
            pricing: {
              currency: ticket.pricing?.currency ?? defaultCurrency,
              exchangeRate: ticket.pricing?.exchangeRate ?? 1,
              fare: ticket.pricing?.fare ?? 0,
              taxes: ticket.pricing?.taxes ?? 0,
              airlineFees: ticket.pricing?.airlineFees ?? 0,
              supplierFees: ticket.pricing?.supplierFees ?? 0,
              agencyServiceFees: ticket.pricing?.agencyServiceFees ?? 0,
              commission: ticket.pricing?.commission ?? 0,
              clientDiscount: ticket.pricing?.clientDiscount ?? 0,
              sellingPrice: ticket.pricing?.sellingPrice ?? 0,
              supplierCost: ticket.pricing?.supplierCost ?? 0,
              profit: ticket.pricing?.profit ?? 0,
            },
      },
      passengerId,
      defaultCurrency,
    )
  })

  return normalizeFlightPassenger(
    {
      ...passenger,
      id: passengerId,
      passengerType: passenger.passengerType ?? 'adult',
      tickets: tickets.length > 0 ? tickets : undefined,
    },
    tripType,
    defaultCurrency,
  )
}

export function migrateFlightServiceDetails(
  raw: LegacyFlightServiceDetailsInput,
  defaultCurrency = BASE_CURRENCY,
): FlightServiceDetails {
  if (isEnterpriseSchema(raw) && raw.passengers && raw.passengers.length > 0) {
    const tripType = resolveFlightTripType(raw.tripType)
    return refreshFlightServiceDetails(
      {
        tripType,
        bookingPnr: raw.bookingPnr ?? '',
        passengers: raw.passengers.map((p) => migratePassengerToEnterprise(p, tripType, defaultCurrency)),
        schemaVersion: FLIGHT_SCHEMA_VERSION,
      },
      defaultCurrency,
    )
  }

  const tripType = resolveFlightTripType(raw.tripType)
  const sharedSegments = normalizeSegmentsForTripType(
    tripType,
    (raw.segments ?? []).map((segment) => normalizeFlightSegment(segment)),
  )

  if (raw.passengers && raw.passengers.length > 0) {
    return refreshFlightServiceDetails(
      {
        tripType,
        bookingPnr: raw.bookingPnr ?? '',
        passengers: raw.passengers.map((passenger) => migratePassengerToEnterprise(passenger, tripType, defaultCurrency)),
        schemaVersion: FLIGHT_SCHEMA_VERSION,
      },
      defaultCurrency,
    )
  }

  const legacyTickets = raw.tickets ?? []
  let passengers = legacyTickets.map((ticket) => passengerFromLegacyTicket(ticket, tripType, sharedSegments, defaultCurrency))

  if (passengers.length === 0) {
    const fromSegments = (raw.segments ?? [])
      .filter(legacySegmentHasPassengerData)
      .map((segment) => passengerFromLegacySegment(segment, tripType, defaultCurrency))
    passengers =
      fromSegments.length > 0
        ? fromSegments
        : [createEmptyFlightPassenger(tripType, {}, defaultCurrency)]
  }

  const bookingPnr = raw.bookingPnr?.trim() || passengers[0]?.tickets[0]?.pnr || ''

  return refreshFlightServiceDetails(
    {
      tripType,
      bookingPnr,
      passengers,
      schemaVersion: FLIGHT_SCHEMA_VERSION,
    },
    defaultCurrency,
  )
}

export function flattenTickets(details: FlightServiceDetails): Array<FlightTicket & { passengerName: string; passengerType: string }> {
  return details.passengers.flatMap((passenger) =>
    passenger.tickets.map((ticket) => ({
      ...ticket,
      passengerName: passenger.passengerName,
      passengerType: passenger.passengerType,
    })),
  )
}
