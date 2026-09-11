import { useState } from 'react'
import { Input } from '@/design-system/components/Input'
import { FieldHeader } from '@/design-system/components/FieldLabel'
import { CrmFieldGrid, CrmInputCell, CrmPanel } from '@/design-system/layout/CrmPanel'
import { FormField } from '@/features/clients/components/client-form-ui'
import { DisplayNamePreview, DISPLAY_NAME_HINT } from '@/features/clients/components/IndividualNameFields'
import {
  DATE_PICKER_KEYBOARD_HINT,
  DERIVED_VALUE_HINT,
  INTERNAL_ONLY_HINT,
  MIDDLE_NAME_HINT,
  OPTIONAL_FIELD_HINT,
} from '@/features/ui-templates/patterns/forms/hint-constants'
import { PatternBlock } from '@/features/ui-templates/patterns/_shared/PatternBlock'

function displayNameHint(value?: string) {
  if (value?.trim()) return undefined
  return DISPLAY_NAME_HINT
}

function derivedFieldHint(value?: string) {
  if (value?.trim()) return undefined
  return DERIVED_VALUE_HINT
}

export function HintPatterns() {
  const [displayNamePreview, setDisplayNamePreview] = useState('Ibrahim Mohamed')
  const [hasDerivedValue, setHasDerivedValue] = useState(false)

  return (
    <div className="space-y-6">
      <PatternBlock
        title="FieldHeader tooltip"
        description="Default hint pattern — CircleHelp icon at the end of the label row. Hover or focus to read the hint."
        path="src/design-system/components/FieldLabel.tsx"
      >
        <div className="max-w-xs space-y-4">
          <FieldHeader label="Trip name" hint="Shown in lists, workspace header, and documents" required />
          <FieldHeader label="Date of birth" hint={DATE_PICKER_KEYBOARD_HINT} />
        </div>
      </PatternBlock>

      <PatternBlock
        title="FormField"
        description="Client and trip forms — pass hint to FormField; it wires FieldHeader automatically."
        path="src/features/clients/components/client-form-ui.tsx — FormField"
      >
        <div className="grid max-w-lg gap-4 sm:grid-cols-2">
          <FormField label="Display name" hint={displayNameHint(displayNamePreview)} className="sm:col-span-2">
            <DisplayNamePreview value={displayNamePreview} />
          </FormField>
          <button
            type="button"
            onClick={() =>
              setDisplayNamePreview((current) => (current ? '' : 'Ibrahim Mohamed'))
            }
            className="text-[11px] text-[var(--color-accent)] hover:underline sm:col-span-2"
          >
            {displayNamePreview ? 'Clear display name preview' : 'Simulate first + last name entered'}
          </button>
          <FormField label="Middle name" hint={MIDDLE_NAME_HINT}>
            <Input placeholder="Optional" />
          </FormField>
          <FormField label="Internal notes" hint={INTERNAL_ONLY_HINT} className="sm:col-span-2">
            <Input placeholder="Renewal notes, special arrangements…" />
          </FormField>
        </div>
      </PatternBlock>

      <PatternBlock
        title="CrmInputCell"
        description="Panel and dialog field grids — same hint API as FormField."
        path="src/design-system/layout/CrmPanel.tsx — CrmInputCell"
      >
        <CrmPanel title="Field hints in panels">
          <CrmFieldGrid columns={2}>
            <CrmInputCell label="Passport" hint="Required before ticket issue">
              <Input size="sm" placeholder="A12345678" />
            </CrmInputCell>
            <CrmInputCell label="Apply to invoice" hint={OPTIONAL_FIELD_HINT}>
              <Input size="sm" placeholder="Select invoice…" />
            </CrmInputCell>
          </CrmFieldGrid>
        </CrmPanel>
      </PatternBlock>

      <PatternBlock
        title="Shared constants"
        description="Define hint strings once in hint-constants.ts (or the owning feature) and reuse via the hint prop."
        path="src/features/ui-templates/patterns/forms/hint-constants.ts"
      >
        <dl className="grid gap-2 text-xs">
          <HintConstantRow name="DATE_PICKER_KEYBOARD_HINT" value={DATE_PICKER_KEYBOARD_HINT} />
          <HintConstantRow name="DISPLAY_NAME_HINT" value={DISPLAY_NAME_HINT} />
          <HintConstantRow name="OPTIONAL_FIELD_HINT" value={OPTIONAL_FIELD_HINT} />
          <HintConstantRow name="INTERNAL_ONLY_HINT" value={INTERNAL_ONLY_HINT} />
        </dl>
      </PatternBlock>

      <PatternBlock
        title="Dynamic hint"
        description="Return undefined when the hint is no longer needed — e.g. age after date of birth is set."
        path="src/features/clients/components/IndividualProfileDetailsFields.tsx — ageHint()"
      >
        <div className="max-w-xs space-y-2">
          <FormField label="Age" hint={derivedFieldHint(hasDerivedValue ? '32 years' : undefined)}>
            <Input
              value={hasDerivedValue ? '32 years' : ''}
              readOnly
              placeholder="—"
              className={hasDerivedValue ? 'bg-[var(--color-surface-muted)]/35' : undefined}
            />
          </FormField>
          <button
            type="button"
            onClick={() => setHasDerivedValue((current) => !current)}
            className="text-[11px] text-[var(--color-accent)] hover:underline"
          >
            {hasDerivedValue ? 'Clear date of birth' : 'Simulate date of birth selected'}
          </button>
        </div>
      </PatternBlock>
    </div>
  )
}

function HintConstantRow({ name, value }: { name: string; value: string }) {
  return (
    <div className="grid gap-0.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]/20 px-3 py-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-3">
      <dt className="font-mono text-[10px] text-[var(--color-subtle)]">{name}</dt>
      <dd className="text-[var(--color-foreground)]">{value}</dd>
    </div>
  )
}
