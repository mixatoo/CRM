import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { Input } from '../../primitives/components/Input'
import { FormDatePicker } from '../../primitives/components/DatePickerField'
import { FieldHeader } from '../../primitives/components/FieldLabel'
import { cn } from '../../primitives/utils/cn'
import type { ClientFormInput } from './use-client-mutations'
import type { ClientGender, ClientStatus, ClientType } from './domain-client'

export type ClientFormStepId = 'basics' | 'contact' | 'financial' | 'membership' | 'notes'

export const CLIENT_FORM_STICKY_BAR =
  'sticky bottom-0 z-10 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 px-4 py-3 backdrop-blur-sm'

export function getClientFormSteps(type: ClientType): Array<{ id: ClientFormStepId; label: string }> {
  void type
  return [
    { id: 'basics', label: 'Basics' },
    { id: 'contact', label: 'Contact' },
    { id: 'financial', label: 'Financial' },
    { id: 'membership', label: 'Membership' },
    { id: 'notes', label: 'Notes' },
  ]
}

export function getClientFormStepOrder(type: ClientType): ClientFormStepId[] {
  return getClientFormSteps(type).map((step) => step.id)
}

export function FormField({
  label,
  hint,
  children,
  className,
}: {
  label: string
  hint?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <FieldHeader label={label} hint={hint} />
      {children}
    </div>
  )
}

export function ClientFormDatePicker({
  value,
  onChange,
  label = 'Date',
}: {
  value: string
  onChange: (value: string) => void
  label?: string
}) {
  return (
    <FormField label={label}>
      <FormDatePicker value={value} onChange={onChange} />
    </FormField>
  )
}

export function ClientGenderField({
  value,
  onChange,
}: {
  value?: ClientGender
  onChange: (value: ClientGender) => void
}) {
  const options: ClientGender[] = ['male', 'female']
  return (
    <FormField label="Gender">
      <div className="flex gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              'rounded-[var(--radius-md)] border px-3 py-1.5 text-xs capitalize transition-colors',
              value === option
                ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                : 'border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)]',
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </FormField>
  )
}

export function ClientTypeField({
  value,
  onChange,
}: {
  value: ClientType
  onChange: (value: ClientType) => void
}) {
  const options: ClientType[] = ['individual', 'corporate']
  return (
    <FormField label="Client type">
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs capitalize',
              value === option
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                : 'border-[var(--color-border)]',
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </FormField>
  )
}

export function ClientStatusField({
  value,
  onChange,
}: {
  value: ClientStatus
  onChange: (value: ClientStatus) => void
}) {
  const options: ClientStatus[] = ['active', 'inactive', 'blocked']
  return (
    <FormField label="Status">
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs capitalize',
              value === option
                ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)]'
                : 'border-[var(--color-border)]',
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </FormField>
  )
}

export function ClientFormStepSidebar({
  steps,
  current,
  visited,
  onSelect,
}: {
  steps: Array<{ id: ClientFormStepId; label: string }>
  current: ClientFormStepId
  visited: Set<ClientFormStepId>
  onSelect: (step: ClientFormStepId) => void
}) {
  return (
    <nav className="space-y-1 border-r border-[var(--color-border)] p-3">
      {steps.map((step) => (
        <button
          key={step.id}
          type="button"
          onClick={() => onSelect(step.id)}
          className={cn(
            'flex w-full items-center rounded-[var(--radius-md)] px-3 py-2 text-left text-sm',
            current === step.id
              ? 'bg-[var(--color-accent-muted)] font-medium text-[var(--color-accent)]'
              : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-elevated)]',
            visited.has(step.id) && current !== step.id && 'text-[var(--color-foreground)]',
          )}
        >
          {step.label}
        </button>
      ))}
    </nav>
  )
}

export function ClientProfileFieldsStub({
  form,
  onChange,
  step = 'basics',
}: {
  form: ClientFormInput
  onChange: <K extends keyof ClientFormInput>(key: K, value: ClientFormInput[K]) => void
  step?: ClientFormStepId
}) {
  if (step === 'contact') {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Email">
          <Input value={form.email} onChange={(e) => onChange('email', e.target.value)} />
        </FormField>
        <FormField label="Phone">
          <Input value={form.phone} onChange={(e) => onChange('phone', e.target.value)} />
        </FormField>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <ClientTypeField value={form.type} onChange={(value) => onChange('type', value)} />
      <ClientStatusField value={form.status} onChange={(value) => onChange('status', value)} />
      <FormField label="First name">
        <Input value={form.firstName} onChange={(e) => onChange('firstName', e.target.value)} />
      </FormField>
      <FormField label="Last name">
        <Input value={form.lastName} onChange={(e) => onChange('lastName', e.target.value)} />
      </FormField>
    </div>
  )
}
