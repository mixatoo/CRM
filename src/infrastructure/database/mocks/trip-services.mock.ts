import type { TripService, TripServiceStatus } from '@/domain/entities/trip-service'
import type {
  ActivityServiceDetails,
  CruiseServiceDetails,
  InsuranceServiceDetails,
  LodgingServiceDetails,
  RestaurantServiceDetails,
  TourServiceDetails,
} from '@/domain/entities/trip-service-category-details'
import type { ServiceCategory, Trip } from '@/domain/entities'
import { SERVICE_CATEGORIES } from '@/domain/entities'
import type { FlightServiceDetails } from '@/domain/entities/trip-service-flight'
import {
  createEmptyFlightPassenger,
  createEmptyFlightSegment,
  createEmptyFlightTicket,
  createFlightPassengerId,
  createFlightSegmentId,
  createFlightTicketId,
  deriveFlightServiceSummary,
} from '@/domain/flight/ticket'
import { migrateFlightServiceDetails, type LegacyFlightServiceDetailsInput } from '@/domain/flight/migration'

export const TRIP_SERVICES_MOCK_VERSION = 19

export const DEMO_TRIP_ID = 'TRP-504567'

export const MIN_DEMO_TRIP_SERVICES = SERVICE_CATEGORIES.length

export type TripServiceMarginProfile =
  | 'high_profit'
  | 'moderate_profit'
  | 'low_profit'
  | 'break_even'
  | 'loss_mild'
  | 'loss_heavy'
  | 'no_revenue'

const MARGIN_MULTIPLIERS: Record<TripServiceMarginProfile, number> = {
  high_profit: 1.35,
  moderate_profit: 1.18,
  low_profit: 1.06,
  break_even: 1,
  loss_mild: 0.92,
  loss_heavy: 0.78,
  no_revenue: 0,
}

export interface TripServiceMockTemplate {
  category: ServiceCategory
  name: string
  supplierName: string
  status: TripServiceStatus
  cost: number
  selling?: number
  marginProfile?: TripServiceMarginProfile
  dayOffset?: number
  durationDays?: number
  notes?: string
  flightDetails?: FlightServiceDetails
  activityDetails?: ActivityServiceDetails
  cruiseDetails?: CruiseServiceDetails
  lodgingDetails?: LodgingServiceDetails
  restaurantDetails?: RestaurantServiceDetails
  tourDetails?: TourServiceDetails
  insuranceDetails?: InsuranceServiceDetails
}

const DEMO_FLIGHT_DETAILS = migrateFlightServiceDetails({
  tripType: 'round_trip',
  bookingPnr: 'GRP2026',
  passengers: [
    {
      id: createFlightPassengerId(),
      passengerTitle: 'Mr',
      passengerName: 'Ahmed Hassan',
      tickets: [
        {
          id: createFlightTicketId(),
          pnr: 'AHMD01',
          fareClass: 'Y',
          segments: [
            {
              id: createFlightSegmentId(),
              airline: 'EgyptAir',
              flightNumber: 'MS360',
              departureAirport: 'CAI',
              arrivalAirport: 'HRG',
              departureDate: '',
              departureTime: '06:15',
              arrivalDate: '',
              arrivalTime: '07:30',
              cabinClass: 'Economy',
            },
            {
              id: createFlightSegmentId(),
              airline: 'EgyptAir',
              flightNumber: 'MS361',
              departureAirport: 'HRG',
              arrivalAirport: 'CAI',
              departureDate: '',
              departureTime: '18:00',
              arrivalDate: '',
              arrivalTime: '19:15',
              cabinClass: 'Economy',
            },
          ],
        },
      ],
    },
    {
      id: createFlightPassengerId(),
      passengerTitle: 'Mrs',
      passengerName: 'Sara Ibrahim',
      tickets: [
        {
          id: createFlightTicketId(),
          pnr: 'SARA02',
          fareClass: 'Y',
          segments: [
            {
              id: createFlightSegmentId(),
              airline: 'EgyptAir',
              flightNumber: 'MS201',
              departureAirport: 'CAI',
              arrivalAirport: 'LXR',
              departureDate: '',
              departureTime: '09:10',
              arrivalDate: '',
              arrivalTime: '10:25',
              cabinClass: 'Economy',
            },
            {
              id: createFlightSegmentId(),
              airline: 'EgyptAir',
              flightNumber: 'MS202',
              departureAirport: 'LXR',
              arrivalAirport: 'CAI',
              departureDate: '',
              departureTime: '17:40',
              arrivalDate: '',
              arrivalTime: '18:55',
              cabinClass: 'Economy',
            },
          ],
        },
      ],
    },
  ],
} as LegacyFlightServiceDetailsInput)

/** Demo trip — one service per category for field-mapping review. */
const DEMO_TRIP_SERVICES: TripServiceMockTemplate[] = [
  {
    category: 'activity',
    name: 'Desert safari — white dunes',
    supplierName: 'Desert Adventures Co.',
    status: 'proposal',
    cost: 310,
    marginProfile: 'moderate_profit',
    dayOffset: 0,
    notes: 'Half-day desert experience with dune bashing.',
    activityDetails: {
      activityType: 'Desert safari',
      durationHours: 6,
      pax: 4,
      pickupLocation: 'Marriott Cairo',
      dropoffLocation: 'Marriott Cairo',
      confirmationNumber: 'ACT-2026-0142',
    },
  },
  {
    category: 'cruise',
    name: 'Nile cruise — Aswan to Luxor',
    supplierName: 'Oberoi Zahra',
    status: 'proposal',
    cost: 6_200,
    marginProfile: 'moderate_profit',
    dayOffset: 1,
    durationDays: 3,
    cruiseDetails: {
      vesselName: 'Oberoi Zahra',
      cabinCategory: 'Deluxe Suite',
      boardBasis: 'Full board',
      nights: 3,
      embarkPort: 'Aswan',
      disembarkPort: 'Luxor',
      confirmationNumber: 'CRZ-88421',
    },
  },
  {
    category: 'flight',
    name: 'CAI · HRG · LXR — multi passenger demo',
    supplierName: 'EgyptAir',
    status: 'proposal',
    cost: 2_400,
    marginProfile: 'moderate_profit',
    dayOffset: 2,
    notes: 'Demo — 2 passengers, round-trip segments.',
    flightDetails: DEMO_FLIGHT_DETAILS,
  },
  {
    category: 'insurance',
    name: 'Comprehensive travel cover',
    supplierName: 'Allianz Travel',
    status: 'proposal',
    cost: 320,
    marginProfile: 'moderate_profit',
    dayOffset: 3,
    insuranceDetails: {
      providerPlan: 'Allianz Comprehensive',
      policyType: 'Group',
      coverageLevel: 'Standard',
      insuredPax: 4,
      policyNumber: 'INS-2026-9912',
    },
  },
  {
    category: 'lodging',
    name: 'Four Seasons Nile Plaza — 2 nights',
    supplierName: 'Four Seasons Nile Plaza',
    status: 'proposal',
    cost: 4_850,
    marginProfile: 'moderate_profit',
    dayOffset: 4,
    durationDays: 2,
    lodgingDetails: {
      propertyName: 'Four Seasons Nile Plaza',
      roomType: 'Deluxe Nile View',
      boardBasis: 'Bed & breakfast',
      rooms: 2,
      nights: 2,
      confirmationNumber: 'HTL-77301',
    },
  },
  {
    category: 'restaurant',
    name: 'Sequoia Cairo — dinner',
    supplierName: 'Sequoia Cairo',
    status: 'proposal',
    cost: 420,
    marginProfile: 'moderate_profit',
    dayOffset: 5,
    restaurantDetails: {
      venueName: 'Sequoia Cairo',
      mealType: 'Dinner',
      pax: 4,
      reservationTime: '19:30',
      dietaryNotes: 'One vegetarian guest',
    },
  },
  {
    category: 'tour',
    name: 'Luxor day tour — West Bank',
    supplierName: 'Luxor Day Tours',
    status: 'proposal',
    cost: 520,
    marginProfile: 'moderate_profit',
    dayOffset: 6,
    tourDetails: {
      destination: 'Luxor West Bank',
      durationHours: 8,
      pax: 4,
      pickupLocation: 'Hilton Luxor',
      language: 'English',
      guideIncluded: true,
    },
  },
]

/** Service templates keyed by trip index (0–9). */
const TRIP_SERVICE_TEMPLATES: TripServiceMockTemplate[][] = [
  DEMO_TRIP_SERVICES,
  [
    {
      category: 'cruise',
      name: 'Sonesta St. George — 4 nights',
      supplierName: 'Sonesta St. George',
      status: 'confirmed',
      cost: 18_400,
      marginProfile: 'moderate_profit',
      dayOffset: 0,
      durationDays: 4,
      cruiseDetails: {
        vesselName: 'Sonesta St. George',
        cabinCategory: 'Standard Cabin',
        boardBasis: 'Full board',
        nights: 4,
        embarkPort: 'Luxor',
        disembarkPort: 'Aswan',
        confirmationNumber: 'CRZ-55201',
      },
    },
    {
      category: 'lodging',
      name: 'Hilton Luxor — pre-cruise night',
      supplierName: 'Hilton Luxor',
      status: 'confirmed',
      cost: 2_100,
      marginProfile: 'low_profit',
      dayOffset: -1,
      durationDays: 1,
      lodgingDetails: {
        propertyName: 'Hilton Luxor',
        roomType: 'King Deluxe',
        boardBasis: 'Bed & breakfast',
        rooms: 2,
        nights: 1,
        confirmationNumber: 'HTL-44102',
      },
    },
    {
      category: 'flight',
      name: 'CAI → LXR — group block',
      supplierName: 'EgyptAir',
      status: 'confirmed',
      cost: 8_600,
      marginProfile: 'moderate_profit',
      dayOffset: -2,
    },
    {
      category: 'tour',
      name: 'Karnak Temple — private guide',
      supplierName: 'Nile Heritage Tours',
      status: 'confirmed',
      cost: 680,
      marginProfile: 'high_profit',
      dayOffset: 2,
      tourDetails: {
        destination: 'Karnak Temple',
        durationHours: 4,
        pax: 6,
        pickupLocation: 'Hilton Luxor',
        language: 'English',
        guideIncluded: true,
      },
    },
  ],
  [
    {
      category: 'activity',
      name: 'PADI open-water dives — Giftun',
      supplierName: 'Red Sea Divers',
      status: 'proposal',
      cost: 1_850,
      marginProfile: 'moderate_profit',
      dayOffset: 1,
      activityDetails: {
        activityType: 'Scuba diving',
        durationHours: 8,
        pax: 2,
        pickupLocation: 'Steigenberger Hurghada',
        dropoffLocation: 'Steigenberger Hurghada',
        confirmationNumber: 'ACT-7733',
      },
    },
    {
      category: 'lodging',
      name: 'Steigenberger Hurghada — 5 nights',
      supplierName: 'Steigenberger Hurghada',
      status: 'proposal',
      cost: 9_200,
      marginProfile: 'moderate_profit',
      dayOffset: 0,
      durationDays: 5,
      lodgingDetails: {
        propertyName: 'Steigenberger Al Dau Beach',
        roomType: 'Superior Sea View',
        boardBasis: 'All inclusive',
        rooms: 1,
        nights: 5,
        confirmationNumber: 'HTL-99201',
      },
    },
    {
      category: 'flight',
      name: 'CAI → HRG — direct',
      supplierName: 'Nile Air',
      status: 'proposal',
      cost: 3_400,
      marginProfile: 'low_profit',
      dayOffset: -1,
    },
  ],
  [
    {
      category: 'flight',
      name: 'CAI → SSH — group charter',
      supplierName: 'EgyptAir',
      status: 'confirmed',
      cost: 28_000,
      marginProfile: 'moderate_profit',
      dayOffset: -1,
    },
    {
      category: 'lodging',
      name: 'Rixos Premium Seagate — 4 nights',
      supplierName: 'Rixos Premium Seagate',
      status: 'confirmed',
      cost: 32_500,
      marginProfile: 'moderate_profit',
      dayOffset: 0,
      durationDays: 4,
      lodgingDetails: {
        propertyName: 'Rixos Premium Seagate',
        roomType: 'Superior Room',
        boardBasis: 'Ultra all inclusive',
        rooms: 12,
        nights: 4,
        confirmationNumber: 'HTL-88100',
      },
    },
    {
      category: 'restaurant',
      name: 'Gala dinner — beach venue',
      supplierName: 'Rixos Premium Seagate',
      status: 'proposal',
      cost: 4_800,
      marginProfile: 'high_profit',
      dayOffset: 2,
      restaurantDetails: {
        venueName: 'Rixos Beach Pavilion',
        mealType: 'Dinner',
        pax: 24,
        reservationTime: '20:00',
        dietaryNotes: '',
      },
    },
    {
      category: 'activity',
      name: 'Team-building catamaran sail',
      supplierName: 'Egyliere Transport',
      status: 'proposal',
      cost: 3_200,
      marginProfile: 'moderate_profit',
      dayOffset: 1,
      activityDetails: {
        activityType: 'Boat trip',
        durationHours: 4,
        pax: 24,
        pickupLocation: 'Rixos Marina',
        dropoffLocation: 'Rixos Marina',
        confirmationNumber: 'ACT-4401',
      },
    },
  ],
  [
    {
      category: 'activity',
      name: 'White Desert overnight camp',
      supplierName: 'Desert Adventures Co.',
      status: 'confirmed',
      cost: 2_400,
      marginProfile: 'moderate_profit',
      dayOffset: 0,
      durationDays: 2,
      activityDetails: {
        activityType: 'Desert camp',
        durationHours: 30,
        pax: 6,
        pickupLocation: 'Bahariya Oasis',
        dropoffLocation: 'Bahariya Oasis',
        confirmationNumber: 'ACT-3301',
      },
    },
    {
      category: 'lodging',
      name: 'Desert camp — 1 night',
      supplierName: 'Desert Adventures Co.',
      status: 'confirmed',
      cost: 1_100,
      marginProfile: 'low_profit',
      dayOffset: 1,
      durationDays: 1,
      lodgingDetails: {
        propertyName: 'White Desert Camp',
        roomType: 'Bedouin tent',
        boardBasis: 'Full board',
        rooms: 3,
        nights: 1,
        confirmationNumber: 'HTL-CAMP01',
      },
    },
    {
      category: 'tour',
      name: 'Black Desert & Crystal Mountain',
      supplierName: 'Egypt Excursions',
      status: 'confirmed',
      cost: 890,
      marginProfile: 'high_profit',
      dayOffset: 0,
      tourDetails: {
        destination: 'Black Desert',
        durationHours: 6,
        pax: 6,
        pickupLocation: 'Bahariya Oasis',
        language: 'Arabic',
        guideIncluded: true,
      },
    },
  ],
  [
    {
      category: 'tour',
      name: 'Bibliotheca Alexandrina & Citadel',
      supplierName: 'Cairo Insider',
      status: 'confirmed',
      cost: 420,
      marginProfile: 'moderate_profit',
      dayOffset: 0,
      tourDetails: {
        destination: 'Alexandria',
        durationHours: 6,
        pax: 2,
        pickupLocation: 'Hilton Alexandria Corniche',
        language: 'English',
        guideIncluded: true,
      },
    },
    {
      category: 'restaurant',
      name: 'Fish market lunch — Montaza',
      supplierName: 'La Palmeraie',
      status: 'confirmed',
      cost: 280,
      marginProfile: 'moderate_profit',
      dayOffset: 0,
      restaurantDetails: {
        venueName: 'Montaza Fish Market',
        mealType: 'Lunch',
        pax: 2,
        reservationTime: '13:00',
        dietaryNotes: '',
      },
    },
    {
      category: 'lodging',
      name: 'Hilton Alexandria Corniche — 2 nights',
      supplierName: 'Hilton Alexandria Corniche',
      status: 'confirmed',
      cost: 3_600,
      marginProfile: 'low_profit',
      dayOffset: -1,
      durationDays: 2,
      lodgingDetails: {
        propertyName: 'Hilton Alexandria Corniche',
        roomType: 'Sea View King',
        boardBasis: 'Bed & breakfast',
        rooms: 1,
        nights: 2,
        confirmationNumber: 'HTL-22001',
      },
    },
  ],
  [
    {
      category: 'tour',
      name: 'Philae Temple & Nubian village',
      supplierName: 'Egypt Excursions',
      status: 'confirmed',
      cost: 760,
      marginProfile: 'moderate_profit',
      dayOffset: 0,
      tourDetails: {
        destination: 'Aswan',
        durationHours: 7,
        pax: 8,
        pickupLocation: 'Mövenpick Aswan',
        language: 'English',
        guideIncluded: true,
      },
    },
    {
      category: 'cruise',
      name: 'Felucca sunset sail — 2 hours',
      supplierName: 'Nour El Nil',
      status: 'confirmed',
      cost: 480,
      marginProfile: 'high_profit',
      dayOffset: 1,
      cruiseDetails: {
        vesselName: 'Felucca Al Nil',
        cabinCategory: 'N/A',
        boardBasis: 'Snacks included',
        nights: 0,
        embarkPort: 'Aswan',
        disembarkPort: 'Aswan',
        confirmationNumber: 'CRZ-FEL01',
      },
    },
    {
      category: 'flight',
      name: 'CAI → ASW — morning flight',
      supplierName: 'EgyptAir',
      status: 'confirmed',
      cost: 5_200,
      marginProfile: 'moderate_profit',
      dayOffset: -1,
    },
    {
      category: 'lodging',
      name: 'Mövenpick Aswan — 3 nights',
      supplierName: 'Mövenpick Aswan',
      status: 'confirmed',
      cost: 6_800,
      marginProfile: 'moderate_profit',
      dayOffset: 0,
      durationDays: 3,
      lodgingDetails: {
        propertyName: 'Mövenpick Resort Aswan',
        roomType: 'Standard Garden View',
        boardBasis: 'Bed & breakfast',
        rooms: 4,
        nights: 3,
        confirmationNumber: 'HTL-66001',
      },
    },
  ],
  [
    {
      category: 'tour',
      name: 'Pyramids & Sphinx — half day',
      supplierName: 'Cairo Insider',
      status: 'proposal',
      cost: 1_200,
      marginProfile: 'moderate_profit',
      dayOffset: 0,
      tourDetails: {
        destination: 'Giza Plateau',
        durationHours: 5,
        pax: 16,
        pickupLocation: 'Mena House',
        language: 'English',
        guideIncluded: true,
      },
    },
    {
      category: 'lodging',
      name: 'Mena House — Pyramids view',
      supplierName: 'Marriott Mena House',
      status: 'proposal',
      cost: 14_400,
      marginProfile: 'low_profit',
      dayOffset: 0,
      durationDays: 3,
      lodgingDetails: {
        propertyName: 'Marriott Mena House',
        roomType: 'Pyramids View Deluxe',
        boardBasis: 'Bed & breakfast',
        rooms: 8,
        nights: 3,
        confirmationNumber: 'HTL-77001',
      },
    },
    {
      category: 'activity',
      name: 'Sound & light show — Pyramids',
      supplierName: 'Egyliere Transport',
      status: 'proposal',
      cost: 960,
      marginProfile: 'high_profit',
      dayOffset: 1,
      activityDetails: {
        activityType: 'Evening show',
        durationHours: 2,
        pax: 16,
        pickupLocation: 'Mena House',
        dropoffLocation: 'Mena House',
        confirmationNumber: 'ACT-5501',
      },
    },
  ],
  [
    {
      category: 'activity',
      name: 'Blue Hole snorkeling day',
      supplierName: 'Red Sea Divers',
      status: 'canceled',
      cost: 420,
      marginProfile: 'no_revenue',
      dayOffset: 1,
      activityDetails: {
        activityType: 'Snorkeling',
        durationHours: 6,
        pax: 2,
        pickupLocation: 'Dahab Lagoon',
        dropoffLocation: 'Dahab Lagoon',
        confirmationNumber: 'ACT-CXL01',
      },
    },
    {
      category: 'lodging',
      name: 'Dahab Lagoon Resort — 5 nights',
      supplierName: 'Dahab Lagoon Resort',
      status: 'canceled',
      cost: 4_200,
      marginProfile: 'loss_heavy',
      dayOffset: 0,
      durationDays: 5,
      lodgingDetails: {
        propertyName: 'Dahab Lagoon Resort',
        roomType: 'Standard Double',
        boardBasis: 'Half board',
        rooms: 1,
        nights: 5,
        confirmationNumber: 'HTL-CXL02',
      },
    },
    {
      category: 'insurance',
      name: 'Adventure sports cover',
      supplierName: 'AXA Egypt',
      status: 'canceled',
      cost: 180,
      marginProfile: 'no_revenue',
      dayOffset: -1,
      insuranceDetails: {
        providerPlan: 'AXA Adventure',
        policyType: 'Individual',
        coverageLevel: 'Enhanced',
        insuredPax: 2,
        policyNumber: 'INS-CXL01',
      },
    },
  ],
  [
    {
      category: 'tour',
      name: 'Suez Canal transit observation',
      supplierName: 'Egypt Excursions',
      status: 'proposal',
      cost: 380,
      marginProfile: 'moderate_profit',
      dayOffset: 0,
      tourDetails: {
        destination: 'Suez Canal',
        durationHours: 4,
        pax: 10,
        pickupLocation: 'Suez Port Authority',
        language: 'Arabic',
        guideIncluded: true,
      },
    },
    {
      category: 'restaurant',
      name: 'Harbor lunch — fresh seafood',
      supplierName: 'Abou El Sid',
      status: 'proposal',
      cost: 220,
      marginProfile: 'high_profit',
      dayOffset: 0,
      restaurantDetails: {
        venueName: 'Suez Harbor Restaurant',
        mealType: 'Lunch',
        pax: 10,
        reservationTime: '12:30',
        dietaryNotes: '',
      },
    },
  ],
]

export function resolveTripServiceSelling(
  template: Pick<TripServiceMockTemplate, 'cost' | 'selling' | 'marginProfile' | 'status'>,
): number {
  if (template.selling != null) return template.selling

  let profile = template.marginProfile
  if (!profile) {
    profile = template.status === 'canceled' ? 'no_revenue' : 'moderate_profit'
  }

  return Math.round(template.cost * MARGIN_MULTIPLIERS[profile])
}

export function buildTripServiceMock(
  trip: Trip,
  lineNumber: number,
  template: TripServiceMockTemplate,
  index: number,
): TripService {
  const created = new Date(Date.now() - index * 3_600_000).toISOString()
  const startDate = addDays(trip.startDate ?? trip.bookingStartedAt, template.dayOffset ?? 0)
  const endDate =
    template.durationDays != null && startDate
      ? addDays(startDate, template.durationDays - 1)
      : startDate

  const flightDetails: FlightServiceDetails | undefined =
    template.category === 'flight'
      ? migrateFlightServiceDetails(
          template.flightDetails ?? {
            tripType: 'one_way',
            passengers: [
              (() => {
                const passengerId = createFlightPassengerId()
                return createEmptyFlightPassenger('one_way', {
                  id: passengerId,
                  tickets: [
                    createEmptyFlightTicket(passengerId, 'one_way', {
                      segments: [
                        createEmptyFlightSegment({
                          departureDate: startDate || '',
                          airline: template.supplierName,
                        }),
                      ],
                    }),
                  ],
                })
              })(),
            ],
          },
        )
      : undefined

  if (flightDetails && startDate) {
    flightDetails.passengers = flightDetails.passengers.map((passenger) => ({
      ...passenger,
      tickets: passenger.tickets.map((ticket) => ({
        ...ticket,
        segments: ticket.segments.map((segment, segmentIndex) => {
          const legDate = addDays(startDate, segmentIndex) ?? startDate
          return {
            ...segment,
            departureDate: segment.departureDate || legDate,
            arrivalDate: segment.arrivalDate || legDate,
            airline: segment.airline || template.supplierName,
          }
        }),
      })),
    }))
  }

  const flightSummary = flightDetails ? deriveFlightServiceSummary(flightDetails) : null

  return {
    id: `SRV-${trip.id}-${String(lineNumber).padStart(2, '0')}`,
    tripId: trip.id,
    lineNumber,
    category: template.category,
    status: template.status,
    name: flightSummary?.name ?? template.name,
    supplierName: flightSummary?.supplierName || template.supplierName,
    startDate: flightSummary?.startDate ?? startDate,
    endDate: flightSummary?.endDate ?? endDate,
    cost: template.cost,
    selling: resolveTripServiceSelling(template),
    currency: trip.currency,
    notes: template.notes,
    flightDetails,
    activityDetails: template.activityDetails,
    cruiseDetails: template.cruiseDetails,
    lodgingDetails: template.lodgingDetails,
    restaurantDetails: template.restaurantDetails,
    tourDetails: template.tourDetails,
    insuranceDetails: template.insuranceDetails,
    createdAt: created,
    updatedAt: created,
  }
}

function addDays(isoDate: string | undefined, days: number): string | undefined {
  if (!isoDate) return undefined
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return undefined
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export function mockServicesForTrip(trip: Trip, tripIndex: number): TripService[] {
  const templates = TRIP_SERVICE_TEMPLATES[tripIndex] ?? TRIP_SERVICE_TEMPLATES[0]
  return templates.map((template, index) => buildTripServiceMock(trip, index + 1, template, index))
}
