import { useMemo, useState } from 'react'
import {
  ClientFormStepSidebar,
  ClientGenderField,
  ClientStatusField,
  ClientTypeField,
  FormField,
  getClientFormStepOrder,
  getClientFormSteps,
  type ClientFormStepId,
} from '@/features/clients/components/client-form-ui'
import { IndividualNameFields } from '@/features/clients/components/IndividualNameFields'
import { createMockClientForm } from '@/features/ui-templates/data/mock-client-form'
import { PatternBlock } from '@/features/ui-templates/patterns/_shared/PatternBlock'
import type { ClientFormInput } from '@/features/clients/hooks/use-client-mutations'

export function ClientFormPatterns() {
  const [step, setStep] = useState<ClientFormStepId>('basics')
  const [form, setForm] = useState(() => createMockClientForm({ firstName: 'Ibrahim', lastName: 'Mohamed' }))
  const steps = useMemo(() => getClientFormSteps('individual'), [])
  const order = useMemo(() => getClientFormStepOrder('individual'), [])
  const visitedSteps = useMemo(() => new Set<ClientFormStepId>(['basics', 'contact']), [])

  const onChange = <K extends keyof ClientFormInput>(key: K, value: ClientFormInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <PatternBlock
        title="ClientFormStepSidebar"
        description="Sidebar step list with section completion — used inside ClientFormWizard."
        path="src/features/clients/components/client-form-step-sidebar-ui.tsx"
      >
        <div className="max-w-[15rem] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-2">
          <ClientFormStepSidebar
            step={step}
            steps={steps}
            order={order}
            form={form}
            visitedSteps={visitedSteps}
            canGoToStep={() => true}
            onStepChange={setStep}
            layout="vertical"
          />
        </div>
      </PatternBlock>

      <PatternBlock
        title="SegmentedField"
        description="Pill radiogroup for 2–4 options — client type, status, membership tier."
        path="src/features/clients/components/client-form-ui.tsx — SegmentedField"
      >
        <div className="grid max-w-lg gap-4 sm:grid-cols-2">
          <FormField label="Client type">
            <ClientTypeField value={form.type} onChange={(value) => onChange('type', value)} />
          </FormField>
          <FormField label="Status">
            <ClientStatusField value={form.status} onChange={(value) => onChange('status', value)} />
          </FormField>
        </div>
      </PatternBlock>

      <PatternBlock
        title="ClientGenderField"
        description="Two-option toggle with sliding surface indicator — tap again to clear."
        path="src/features/clients/components/client-form-ui.tsx — ClientGenderField"
      >
        <div className="max-w-xs">
          <FormField label="Gender">
            <ClientGenderField value={form.gender} onChange={(value) => onChange('gender', value)} />
          </FormField>
        </div>
      </PatternBlock>

      <PatternBlock
        title="IndividualNameFields"
        description="Name trio with format-while-typing, blur normalization, and display-name preview."
        path="src/features/clients/components/IndividualNameFields.tsx"
      >
        <IndividualNameFields form={form} onChange={onChange} layout="form" includeDisplayName />
      </PatternBlock>
    </div>
  )
}
