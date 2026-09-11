import type { Control } from 'react-hook-form'
import type { ServiceCategory } from '@/domain/entities'
import type { TripServiceEditorFormValues } from '@/features/trips/schemas/trip-service-editor.schema'
import {
  CategoryFieldGrid,
  CompositeCheckboxField,
  CompositeNumberField,
  CompositeTextField,
} from '@/features/trips/components/services/TripServiceFormFields'

interface TripServiceCategoryFieldsProps {
  category: ServiceCategory
  control: Control<TripServiceEditorFormValues>
  disabled?: boolean
}

export function TripServiceCategoryFields({ category, control, disabled }: TripServiceCategoryFieldsProps) {
  switch (category) {
    case 'activity':
      return (
        <CategoryFieldGrid columns={3}>
          <CompositeTextField control={control} name="activityDetails.activityType" label="Type" disabled={disabled} />
          <CompositeNumberField
            control={control}
            name="activityDetails.durationHours"
            label="Duration (h)"
            decimals={1}
            disabled={disabled}
          />
          <CompositeNumberField control={control} name="activityDetails.pax" label="Pax" disabled={disabled} />
          <CompositeTextField
            control={control}
            name="activityDetails.pickupLocation"
            label="Pickup"
            disabled={disabled}
          />
          <CompositeTextField
            control={control}
            name="activityDetails.dropoffLocation"
            label="Drop-off"
            disabled={disabled}
          />
          <CompositeTextField
            control={control}
            name="activityDetails.confirmationNumber"
            label="Confirmation"
            mono
            disabled={disabled}
          />
        </CategoryFieldGrid>
      )
    case 'lodging':
      return (
        <CategoryFieldGrid columns={3}>
          <CompositeTextField
            control={control}
            name="lodgingDetails.propertyName"
            label="Property"
            disabled={disabled}
          />
          <CompositeTextField control={control} name="lodgingDetails.roomType" label="Room type" disabled={disabled} />
          <CompositeTextField control={control} name="lodgingDetails.boardBasis" label="Board" disabled={disabled} />
          <CompositeNumberField control={control} name="lodgingDetails.rooms" label="Rooms" disabled={disabled} />
          <CompositeNumberField control={control} name="lodgingDetails.nights" label="Nights" disabled={disabled} />
          <CompositeTextField
            control={control}
            name="lodgingDetails.confirmationNumber"
            label="Confirmation"
            mono
            disabled={disabled}
          />
        </CategoryFieldGrid>
      )
    case 'cruise':
      return (
        <CategoryFieldGrid columns={3}>
          <CompositeTextField control={control} name="cruiseDetails.vesselName" label="Vessel" disabled={disabled} />
          <CompositeTextField
            control={control}
            name="cruiseDetails.cabinCategory"
            label="Cabin"
            disabled={disabled}
          />
          <CompositeTextField control={control} name="cruiseDetails.boardBasis" label="Board" disabled={disabled} />
          <CompositeNumberField control={control} name="cruiseDetails.nights" label="Nights" disabled={disabled} />
          <CompositeTextField control={control} name="cruiseDetails.embarkPort" label="Embark" disabled={disabled} />
          <CompositeTextField
            control={control}
            name="cruiseDetails.disembarkPort"
            label="Disembark"
            disabled={disabled}
          />
          <CompositeTextField
            control={control}
            name="cruiseDetails.confirmationNumber"
            label="Confirmation"
            mono
            disabled={disabled}
          />
        </CategoryFieldGrid>
      )
    case 'tour':
      return (
        <CategoryFieldGrid columns={3}>
          <CompositeTextField control={control} name="tourDetails.destination" label="Destination" disabled={disabled} />
          <CompositeNumberField
            control={control}
            name="tourDetails.durationHours"
            label="Duration (h)"
            decimals={1}
            disabled={disabled}
          />
          <CompositeNumberField control={control} name="tourDetails.pax" label="Pax" disabled={disabled} />
          <CompositeTextField control={control} name="tourDetails.pickupLocation" label="Pickup" disabled={disabled} />
          <CompositeTextField control={control} name="tourDetails.language" label="Language" disabled={disabled} />
          <CompositeCheckboxField
            control={control}
            name="tourDetails.guideIncluded"
            label="Guide included"
            disabled={disabled}
          />
        </CategoryFieldGrid>
      )
    case 'restaurant':
      return (
        <CategoryFieldGrid columns={3}>
          <CompositeTextField
            control={control}
            name="restaurantDetails.venueName"
            label="Venue"
            disabled={disabled}
          />
          <CompositeTextField control={control} name="restaurantDetails.mealType" label="Meal" disabled={disabled} />
          <CompositeNumberField control={control} name="restaurantDetails.pax" label="Pax" disabled={disabled} />
          <CompositeTextField
            control={control}
            name="restaurantDetails.reservationTime"
            label="Time"
            disabled={disabled}
          />
          <CompositeTextField
            control={control}
            name="restaurantDetails.dietaryNotes"
            label="Dietary notes"
            notes
            disabled={disabled}
          />
        </CategoryFieldGrid>
      )
    case 'insurance':
      return (
        <CategoryFieldGrid columns={3}>
          <CompositeTextField
            control={control}
            name="insuranceDetails.providerPlan"
            label="Provider / plan"
            disabled={disabled}
          />
          <CompositeTextField
            control={control}
            name="insuranceDetails.policyType"
            label="Policy type"
            disabled={disabled}
          />
          <CompositeTextField
            control={control}
            name="insuranceDetails.coverageLevel"
            label="Coverage"
            disabled={disabled}
          />
          <CompositeNumberField
            control={control}
            name="insuranceDetails.insuredPax"
            label="Insured pax"
            disabled={disabled}
          />
          <CompositeTextField
            control={control}
            name="insuranceDetails.policyNumber"
            label="Policy #"
            mono
            disabled={disabled}
          />
        </CategoryFieldGrid>
      )
    case 'flight':
      return null
  }
}
