import { useState } from 'react'
import { DATE_PICKER_KEYBOARD_HINT } from '../../primitives/components/DatePickerField'
import { Input } from '../../primitives/components/Input'
import { ClientFormDatePicker, ClientGenderField, FormField } from '../stubs/client-form-ui'
import { formatClientAge } from '../stubs/domain-client'
import { createMockClientForm } from '../data/mock-client-form'
import { DERIVED_VALUE_HINT } from '../forms/hint-constants'
import { PatternBlock } from '../_shared/PatternBlock'
import type { ClientFormInput } from '../stubs/use-client-mutations'

const todayIso = new Date().toISOString().slice(0, 10)

function ageHint(dateOfBirth?: string) {
  if (formatClientAge(dateOfBirth)) return undefined
  return DERIVED_VALUE_HINT
}

export function DemographicsPatterns() {
  const [form, setForm] = useState(() => createMockClientForm())

  const onChange = <K extends keyof ClientFormInput>(key: K, value: ClientFormInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <PatternBlock
        title="Date of birth & age"
        description="DOB uses FormDatePicker with keyboard hint; age is read-only and derived from the selected date."
        path="src/features/clients/components/IndividualProfileDetailsFields.tsx"
      >
        <div className="grid max-w-2xl gap-4 sm:grid-cols-4">
          <FormField label="Date of birth" className="sm:col-span-2" hint={DATE_PICKER_KEYBOARD_HINT}>
            <ClientFormDatePicker
              value={form.dateOfBirth ?? ''}
              onChange={(value) => onChange('dateOfBirth', value || undefined)}
              max={todayIso}
              aria-label="Date of birth"
            />
          </FormField>
          <FormField label="Age" hint={ageHint(form.dateOfBirth)}>
            <Input
              value={formatClientAge(form.dateOfBirth)}
              readOnly
              tabIndex={-1}
              placeholder="—"
              aria-readonly
              className="bg-[var(--color-surface-muted)]/35"
            />
          </FormField>
          <FormField label="Gender">
            <ClientGenderField value={form.gender} onChange={(value) => onChange('gender', value)} />
          </FormField>
        </div>
      </PatternBlock>
    </div>
  )
}
