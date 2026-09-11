import { Input } from '../../primitives/components/Input'
import { FormField } from './client-form-ui'
import type { ClientFormInput } from './use-client-mutations'

export const DISPLAY_NAME_HINT = 'Shown on invoices and trip documents.'

export function DisplayNamePreview({ form }: { form: ClientFormInput }) {
  const name = [form.firstName, form.middleName, form.lastName].filter(Boolean).join(' ').trim()
  return (
    <p className="text-xs text-[var(--color-muted)]">
      Display name preview: <span className="font-medium text-[var(--color-foreground)]">{name || '—'}</span>
    </p>
  )
}

export function IndividualNameFields({
  form,
  onChange,
}: {
  form: ClientFormInput
  onChange: <K extends keyof ClientFormInput>(key: K, value: ClientFormInput[K]) => void
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <FormField label="First name">
        <Input value={form.firstName} onChange={(e) => onChange('firstName', e.target.value)} />
      </FormField>
      <FormField label="Middle name">
        <Input value={form.middleName} onChange={(e) => onChange('middleName', e.target.value)} />
      </FormField>
      <FormField label="Last name">
        <Input value={form.lastName} onChange={(e) => onChange('lastName', e.target.value)} />
      </FormField>
      <div className="sm:col-span-3">
        <DisplayNamePreview form={form} />
      </div>
    </div>
  )
}
