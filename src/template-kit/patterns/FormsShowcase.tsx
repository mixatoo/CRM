import { TemplateSection } from '../components/TemplateSection'
import { CompositeFieldPatterns } from './forms/CompositeFieldPatterns'
import { DatePickerPatterns } from './forms/DatePickerPatterns'
import { HintPatterns } from './forms/HintPatterns'

export function FormsShowcase() {
  return (
    <div className="space-y-10">
      <TemplateSection
        title="Field hints"
        description="Tooltip hints via FieldHeader, shared constants, dynamic hints, and inline captions for mode-dependent copy."
        path="src/design-system/components/FieldLabel.tsx"
      >
        <HintPatterns />
      </TemplateSection>

      <TemplateSection
        title="Date pickers"
        description="FormDatePicker, EmbeddedFormDatePicker, and inline DateCalendar with keyboard navigation."
        path="src/design-system/components/DatePickerField.tsx"
      >
        <DatePickerPatterns />
      </TemplateSection>

      <TemplateSection
        title="Composite fields"
        description="Prefix rows and operation worksheet controls from the flight service module."
        path="src/features/trips/components/services/flight/operations/operation-worksheet-ui.tsx"
      >
        <CompositeFieldPatterns />
      </TemplateSection>
    </div>
  )
}
