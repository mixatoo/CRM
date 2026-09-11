/**
 * Living catalog of field hints — import re-exports in production code when possible.
 * Add new shared hints here when they are reused across forms.
 */
export { DATE_PICKER_KEYBOARD_HINT } from '../../primitives/components/DatePickerField'
export { DISPLAY_NAME_HINT } from '../stubs/IndividualNameFields'

/** Shown on optional picklists and secondary fields. */
export const OPTIONAL_FIELD_HINT = 'Optional'

/** Internal-only notes and admin context. */
export const INTERNAL_ONLY_HINT = 'Team-only — not shown on documents'

/** Read-only derived values (age, display name preview, etc.). */
export const DERIVED_VALUE_HINT = 'Calculated automatically when a date is selected'

/** Middle name — profile only, not on trips or invoices. */
export const MIDDLE_NAME_HINT = 'Stored on profile only — not shown on trips or invoices'

/** Caption class for mode-dependent hints below toggles (cost entry, tax mode, fulfillment). */
export const INLINE_HINT_CAPTION_CLASS = 'mt-1.5 leading-snug'
