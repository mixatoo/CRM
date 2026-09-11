import { z } from 'zod'
import type { TripServiceStatus } from '@/domain/entities/trip-service'

const tripServiceStatusSchema = z.enum(['proposal', 'confirmed', 'canceled'] satisfies [TripServiceStatus, ...TripServiceStatus[]])

const nonNegativeInt = z.number().int().min(0)
const nonNegativeNumber = z.number().min(0)

export const activityDetailsSchema = z.object({
  activityType: z.string(),
  durationHours: nonNegativeNumber,
  pax: nonNegativeInt,
  pickupLocation: z.string(),
  dropoffLocation: z.string(),
  confirmationNumber: z.string(),
})

export const cruiseDetailsSchema = z.object({
  vesselName: z.string(),
  cabinCategory: z.string(),
  boardBasis: z.string(),
  nights: nonNegativeInt,
  embarkPort: z.string(),
  disembarkPort: z.string(),
  confirmationNumber: z.string(),
})

export const lodgingDetailsSchema = z.object({
  propertyName: z.string(),
  roomType: z.string(),
  boardBasis: z.string(),
  rooms: nonNegativeInt,
  nights: nonNegativeInt,
  confirmationNumber: z.string(),
})

export const restaurantDetailsSchema = z.object({
  venueName: z.string(),
  mealType: z.string(),
  pax: nonNegativeInt,
  reservationTime: z.string(),
  dietaryNotes: z.string(),
})

export const tourDetailsSchema = z.object({
  destination: z.string(),
  durationHours: nonNegativeNumber,
  pax: nonNegativeInt,
  pickupLocation: z.string(),
  language: z.string(),
  guideIncluded: z.boolean(),
})

export const insuranceDetailsSchema = z.object({
  providerPlan: z.string(),
  policyType: z.string(),
  coverageLevel: z.string(),
  insuredPax: nonNegativeInt,
  policyNumber: z.string(),
})

export const tripServiceEditorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  status: tripServiceStatusSchema,
  supplierName: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  cost: nonNegativeNumber,
  selling: nonNegativeNumber.optional(),
  currency: z.string().min(1),
  notes: z.string(),
  activityDetails: activityDetailsSchema.optional(),
  cruiseDetails: cruiseDetailsSchema.optional(),
  lodgingDetails: lodgingDetailsSchema.optional(),
  restaurantDetails: restaurantDetailsSchema.optional(),
  tourDetails: tourDetailsSchema.optional(),
  insuranceDetails: insuranceDetailsSchema.optional(),
})

export type TripServiceEditorFormValues = z.infer<typeof tripServiceEditorSchema>
