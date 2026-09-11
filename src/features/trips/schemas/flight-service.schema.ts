import { z } from 'zod'
import type { FlightPassenger } from '@/domain/flight/types'
import { FLIGHT_TRIP_TYPES, PASSENGER_TYPES, TICKET_STATUSES } from '@/domain/flight/types'
import {
  validateFlightPassengers,
  validateFlightSegmentChronology,
  validateFlightSegmentCount,
} from '@/features/trips/utils/flight-service'
import { isValidTime24 } from '@/shared/utils/date-format'

const iataCode = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, 'Use a 3-letter IATA airport code')

const optionalTime = z
  .string()
  .trim()
  .refine(isValidTime24, { message: 'Use HH:MM (24-hour)' })

const optionalIsoDate = z
  .string()
  .trim()
  .refine((value) => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value), { message: 'Pick a valid date' })

const moneyField = z.number().min(0)

export const flightSegmentSchema = z.object({
  id: z.string().min(1),
  airline: z.string().trim().min(1, 'Airline is required'),
  flightNumber: z.string().trim().min(1, 'Flight number is required'),
  departureAirport: iataCode,
  arrivalAirport: iataCode,
  departureDate: z.string().trim().min(1, 'Departure date is required').regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a valid date'),
  departureTime: optionalTime,
  arrivalDate: optionalIsoDate,
  arrivalTime: optionalTime,
  cabinClass: z.string().trim().optional(),
  segmentStatus: z.string().trim().optional(),
})

export const ticketPricingSchema = z.object({
  fare: moneyField,
  taxes: moneyField,
  airlineFees: moneyField,
  supplierFees: moneyField,
  agencyServiceFees: moneyField,
  commission: moneyField,
  clientDiscount: moneyField,
  supplierCost: moneyField,
  sellingPrice: moneyField,
  profit: moneyField,
  currency: z.string().trim().min(1),
  exchangeRate: z.number().positive(),
})

export const flightTicketSchema = z.object({
  id: z.string().min(1),
  passengerId: z.string().min(1),
  pnr: z.string().trim(),
  ticketNumber: z.string().trim(),
  airline: z.string().trim(),
  supplierId: z.string().trim().optional(),
  supplierName: z.string().trim(),
  route: z.string().trim(),
  cabinClass: z.string().trim(),
  issueDate: optionalIsoDate.optional(),
  status: z.enum(TICKET_STATUSES),
  pricing: ticketPricingSchema,
  segments: z.array(flightSegmentSchema).min(1, 'Add at least one segment'),
  fareClass: z.string().trim().optional(),
  baggageAllowance: z.string().trim().optional(),
  seats: z.string().trim().optional(),
  clientId: z.string().trim().optional(),
})

export const flightPassengerSchema = z.object({
  id: z.string().min(1),
  passengerTitle: z.string().trim().optional(),
  passengerName: z.string().trim().min(1, 'Passenger name is required'),
  passengerType: z.enum(PASSENGER_TYPES),
  dateOfBirth: optionalIsoDate.optional(),
  tickets: z.array(flightTicketSchema).min(1, 'Add at least one ticket'),
})

export const flightServiceDetailsSchema = z
  .object({
    tripType: z.enum(FLIGHT_TRIP_TYPES),
    bookingPnr: z.string().trim().optional(),
    passengers: z.array(flightPassengerSchema),
    schemaVersion: z.number().optional(),
  })
  .superRefine((data, ctx) => {
    const passengersError = validateFlightPassengers(data.passengers as unknown as FlightPassenger[], data.tripType)
    if (passengersError) {
      ctx.addIssue({
        code: 'custom',
        message: passengersError,
        path: ['passengers'],
      })
    }

    data.passengers.forEach((passenger, passengerIndex) => {
      passenger.tickets.forEach((ticket, ticketIndex) => {
        const countError = validateFlightSegmentCount(data.tripType, ticket.segments.length)
        if (countError) {
          ctx.addIssue({
            code: 'custom',
            message: countError,
            path: ['passengers', passengerIndex, 'tickets', ticketIndex, 'segments'],
          })
        }

        const chronologyError = validateFlightSegmentChronology(ticket.segments)
        if (chronologyError) {
          ctx.addIssue({
            code: 'custom',
            message: chronologyError,
            path: ['passengers', passengerIndex, 'tickets', ticketIndex, 'segments'],
          })
        }
      })
    })
  })

export type FlightServiceDetailsFormValues = z.infer<typeof flightServiceDetailsSchema>
export type FlightSegmentFormValues = z.infer<typeof flightSegmentSchema>
export type FlightTicketFormValues = z.infer<typeof flightTicketSchema>
export type FlightPassengerFormValues = z.infer<typeof flightPassengerSchema>
export type TicketPricingFormValues = z.infer<typeof ticketPricingSchema>
