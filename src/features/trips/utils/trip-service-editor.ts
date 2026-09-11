import type { TripService } from '@/domain/entities/trip-service'
import {
  categoryDetailsPatch,
  deriveCategoryServiceLabel,
  getCategoryDetails,
} from '@/domain/entities/trip-service-category-details'
import type { TripServiceEditorFormValues } from '@/features/trips/schemas/trip-service-editor.schema'

export function tripServiceToEditorValues(service: TripService): TripServiceEditorFormValues {
  const base = {
    name: service.name,
    status: service.status,
    supplierName: service.supplierName ?? '',
    startDate: service.startDate ?? '',
    endDate: service.endDate ?? '',
    cost: service.cost,
    selling: service.selling,
    currency: service.currency,
    notes: service.notes ?? '',
  }

  switch (service.category) {
    case 'activity':
      return { ...base, activityDetails: getCategoryDetails(service) as TripServiceEditorFormValues['activityDetails'] }
    case 'cruise':
      return { ...base, cruiseDetails: getCategoryDetails(service) as TripServiceEditorFormValues['cruiseDetails'] }
    case 'lodging':
      return { ...base, lodgingDetails: getCategoryDetails(service) as TripServiceEditorFormValues['lodgingDetails'] }
    case 'restaurant':
      return {
        ...base,
        restaurantDetails: getCategoryDetails(service) as TripServiceEditorFormValues['restaurantDetails'],
      }
    case 'tour':
      return { ...base, tourDetails: getCategoryDetails(service) as TripServiceEditorFormValues['tourDetails'] }
    case 'insurance':
      return {
        ...base,
        insuranceDetails: getCategoryDetails(service) as TripServiceEditorFormValues['insuranceDetails'],
      }
    case 'flight':
      return base
  }
}

export function editorValuesToTripServicePatch(
  service: TripService,
  values: TripServiceEditorFormValues,
): Partial<TripService> {
  const categoryDetails = (() => {
    switch (service.category) {
      case 'activity':
        return values.activityDetails
      case 'cruise':
        return values.cruiseDetails
      case 'lodging':
        return values.lodgingDetails
      case 'restaurant':
        return values.restaurantDetails
      case 'tour':
        return values.tourDetails
      case 'insurance':
        return values.insuranceDetails
      case 'flight':
        return undefined
    }
  })()

  const draft: TripService = {
    ...service,
    name: values.name.trim(),
    status: values.status,
    supplierName: values.supplierName.trim() || undefined,
    startDate: values.startDate || undefined,
    endDate: values.endDate || undefined,
    cost: values.cost,
    selling: values.selling,
    currency: values.currency,
    notes: values.notes.trim() || undefined,
    ...(categoryDetails ? categoryDetailsPatch(service.category, categoryDetails) : {}),
  }

  return {
    name: deriveCategoryServiceLabel(draft),
    status: values.status,
    supplierName: values.supplierName.trim() || undefined,
    startDate: values.startDate || undefined,
    endDate: values.endDate || undefined,
    cost: values.cost,
    selling: values.selling,
    currency: values.currency,
    notes: values.notes.trim() || undefined,
    ...(categoryDetails ? categoryDetailsPatch(service.category, categoryDetails) : {}),
  }
}
