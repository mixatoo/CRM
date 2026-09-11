import type { ServiceCategory } from '@/domain/entities/trip'
import type { TripService } from '@/domain/entities/trip-service'

export interface ActivityServiceDetails {
  activityType: string
  durationHours: number
  pax: number
  pickupLocation: string
  dropoffLocation: string
  confirmationNumber: string
}

export interface CruiseServiceDetails {
  vesselName: string
  cabinCategory: string
  boardBasis: string
  nights: number
  embarkPort: string
  disembarkPort: string
  confirmationNumber: string
}

export interface LodgingServiceDetails {
  propertyName: string
  roomType: string
  boardBasis: string
  rooms: number
  nights: number
  confirmationNumber: string
}

export interface RestaurantServiceDetails {
  venueName: string
  mealType: string
  pax: number
  reservationTime: string
  dietaryNotes: string
}

export interface TourServiceDetails {
  destination: string
  durationHours: number
  pax: number
  pickupLocation: string
  language: string
  guideIncluded: boolean
}

export interface InsuranceServiceDetails {
  providerPlan: string
  policyType: string
  coverageLevel: string
  insuredPax: number
  policyNumber: string
}

export type NonFlightCategoryDetails =
  | ActivityServiceDetails
  | CruiseServiceDetails
  | LodgingServiceDetails
  | RestaurantServiceDetails
  | TourServiceDetails
  | InsuranceServiceDetails

export function emptyActivityDetails(): ActivityServiceDetails {
  return {
    activityType: '',
    durationHours: 0,
    pax: 0,
    pickupLocation: '',
    dropoffLocation: '',
    confirmationNumber: '',
  }
}

export function emptyCruiseDetails(): CruiseServiceDetails {
  return {
    vesselName: '',
    cabinCategory: '',
    boardBasis: '',
    nights: 0,
    embarkPort: '',
    disembarkPort: '',
    confirmationNumber: '',
  }
}

export function emptyLodgingDetails(): LodgingServiceDetails {
  return {
    propertyName: '',
    roomType: '',
    boardBasis: '',
    rooms: 0,
    nights: 0,
    confirmationNumber: '',
  }
}

export function emptyRestaurantDetails(): RestaurantServiceDetails {
  return {
    venueName: '',
    mealType: '',
    pax: 0,
    reservationTime: '',
    dietaryNotes: '',
  }
}

export function emptyTourDetails(): TourServiceDetails {
  return {
    destination: '',
    durationHours: 0,
    pax: 0,
    pickupLocation: '',
    language: '',
    guideIncluded: false,
  }
}

export function emptyInsuranceDetails(): InsuranceServiceDetails {
  return {
    providerPlan: '',
    policyType: '',
    coverageLevel: '',
    insuredPax: 0,
    policyNumber: '',
  }
}

export function emptyCategoryDetailsForCategory(category: ServiceCategory): Partial<TripService> {
  switch (category) {
    case 'activity':
      return { activityDetails: emptyActivityDetails() }
    case 'cruise':
      return { cruiseDetails: emptyCruiseDetails() }
    case 'lodging':
      return { lodgingDetails: emptyLodgingDetails() }
    case 'restaurant':
      return { restaurantDetails: emptyRestaurantDetails() }
    case 'tour':
      return { tourDetails: emptyTourDetails() }
    case 'insurance':
      return { insuranceDetails: emptyInsuranceDetails() }
    case 'flight':
      return {}
  }
}

export function getCategoryDetails(service: TripService): NonFlightCategoryDetails {
  switch (service.category) {
    case 'activity':
      return service.activityDetails ?? emptyActivityDetails()
    case 'cruise':
      return service.cruiseDetails ?? emptyCruiseDetails()
    case 'lodging':
      return service.lodgingDetails ?? emptyLodgingDetails()
    case 'restaurant':
      return service.restaurantDetails ?? emptyRestaurantDetails()
    case 'tour':
      return service.tourDetails ?? emptyTourDetails()
    case 'insurance':
      return service.insuranceDetails ?? emptyInsuranceDetails()
    case 'flight':
      return emptyActivityDetails()
  }
}

export function categoryDetailsPatch(
  category: ServiceCategory,
  details: NonFlightCategoryDetails,
): Partial<TripService> {
  switch (category) {
    case 'activity':
      return { activityDetails: details as ActivityServiceDetails }
    case 'cruise':
      return { cruiseDetails: details as CruiseServiceDetails }
    case 'lodging':
      return { lodgingDetails: details as LodgingServiceDetails }
    case 'restaurant':
      return { restaurantDetails: details as RestaurantServiceDetails }
    case 'tour':
      return { tourDetails: details as TourServiceDetails }
    case 'insurance':
      return { insuranceDetails: details as InsuranceServiceDetails }
    case 'flight':
      return {}
  }
}

export function deriveCategoryServiceLabel(service: Pick<TripService, 'category' | 'name'> & Partial<TripService>): string {
  const trimmedName = service.name.trim()
  if (trimmedName && !trimmedName.startsWith('New ')) return trimmedName

  switch (service.category) {
    case 'lodging': {
      const details = service.lodgingDetails
      return details?.propertyName.trim() || trimmedName || 'Lodging'
    }
    case 'cruise': {
      const details = service.cruiseDetails
      const vessel = details?.vesselName.trim()
      return vessel ? `${vessel} cruise` : trimmedName || 'Cruise'
    }
    case 'restaurant': {
      const details = service.restaurantDetails
      return details?.venueName.trim() || trimmedName || 'Restaurant'
    }
    case 'tour': {
      const details = service.tourDetails
      const destination = details?.destination.trim()
      return destination ? `${destination} tour` : trimmedName || 'Tour'
    }
    case 'activity': {
      const details = service.activityDetails
      const type = details?.activityType.trim()
      return type || trimmedName || 'Activity'
    }
    case 'insurance': {
      const details = service.insuranceDetails
      return details?.providerPlan.trim() || trimmedName || 'Insurance'
    }
    case 'flight':
      return trimmedName || 'Flight'
  }
}
