import type { ReactNode } from 'react'
import { ProfileCrmFieldRow, ProfileInput } from '@/features/clients/components/profile/ProfileCrmFieldRow'
import { FormPicklist, type FormPicklistOption } from '@/design-system/components/FormPicklist'
import { FormMultiPicklist } from '@/design-system/components/FormMultiPicklist'
import { FormDatePicker } from '@/design-system/components/DatePickerField'
import { NotesTextarea } from '@/design-system/components/NotesField'
import {
  profileCrmDateInputClassName,
  profileCrmPicklistClassName,
} from '@/features/clients/components/profile/ProfileCrmFieldRow'
import { ClientFormProfileLayoutProvider } from '@/features/clients/components/client-form-profile-layout-context'
import { cn } from '@/shared/utils/cn'

export function TravelerProfileFieldsShell({ children }: { children: ReactNode }) {
  return (
    <ClientFormProfileLayoutProvider>
      <div className="space-y-0.5">{children}</div>
    </ClientFormProfileLayoutProvider>
  )
}

export function TravelerTextField({
  label,
  value,
  onChange,
  required,
  readOnly,
  placeholder,
  type = 'text',
}: {
  label: string
  value?: string
  onChange?: (value: string) => void
  required?: boolean
  readOnly?: boolean
  placeholder?: string
  type?: string
}) {
  return (
    <ProfileCrmFieldRow label={label} required={required}>
      <ProfileInput
        value={value ?? ''}
        readOnly={readOnly}
        placeholder={placeholder}
        type={type}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </ProfileCrmFieldRow>
  )
}

export function TravelerPicklistField({
  label,
  value,
  options,
  onChange,
  required,
  placeholder = 'Select…',
}: {
  label: string
  value?: string
  options: FormPicklistOption[]
  onChange: (value: string | undefined) => void
  required?: boolean
  placeholder?: string
}) {
  return (
    <ProfileCrmFieldRow label={label} required={required}>
      <FormPicklist
        value={value ?? ''}
        options={options}
        placeholder={placeholder}
        ariaLabel={label}
        focusStyle="neutral"
        className={profileCrmPicklistClassName}
        onChange={(next) => onChange(next || undefined)}
      />
    </ProfileCrmFieldRow>
  )
}

export function TravelerMultiPicklistField({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select…',
}: {
  label: string
  value: string[]
  options: FormPicklistOption[]
  onChange: (value: string[]) => void
  placeholder?: string
}) {
  return (
    <ProfileCrmFieldRow label={label}>
      <FormMultiPicklist
        value={value}
        options={options}
        placeholder={placeholder}
        ariaLabel={label}
        className={profileCrmPicklistClassName}
        onChange={onChange}
      />
    </ProfileCrmFieldRow>
  )
}

export function TravelerDateField({
  label,
  value,
  onChange,
  required,
}: {
  label: string
  value?: string
  onChange: (value: string | undefined) => void
  required?: boolean
}) {
  return (
    <ProfileCrmFieldRow label={label} required={required}>
      <FormDatePicker
        value={value ?? ''}
        onChange={(next) => onChange(next || undefined)}
        inputClassName={profileCrmDateInputClassName}
        inputFocusStyle="neutral"
        aria-label={label}
      />
    </ProfileCrmFieldRow>
  )
}

export function TravelerNotesField({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string
  value?: string
  onChange: (value: string) => void
  rows?: number
}) {
  return (
    <ProfileCrmFieldRow label={label} className="!items-start">
      <NotesTextarea
        value={value ?? ''}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          '!min-h-[4.5rem] !rounded-[var(--radius-md)] !border-0 bg-transparent !shadow-none !ring-0',
          'hover:bg-[var(--color-surface-muted)]/18 focus:!border-[0.5px] focus:!border-[var(--color-border-strong)] focus:bg-[var(--color-surface)]/85',
        )}
      />
    </ProfileCrmFieldRow>
  )
}

export function TravelerToggleField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked?: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <ProfileCrmFieldRow label={label}>
      <label className="inline-flex h-9 cursor-pointer items-center gap-2 text-xs text-[var(--color-foreground)]">
        <input
          type="checkbox"
          checked={Boolean(checked)}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]/30"
        />
        {checked ? 'Yes' : 'No'}
      </label>
    </ProfileCrmFieldRow>
  )
}

export function enumOptions<T extends string>(
  values: readonly T[],
  labels: Record<T, string>,
): FormPicklistOption[] {
  return values.map((value) => ({ value, label: labels[value] }))
}
