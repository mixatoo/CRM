import type { ReactNode } from 'react'
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { AmountInput } from '@/design-system/components/AmountInput'
import { Input } from '@/design-system/components/Input'
import type { ServiceCategory } from '@/domain/entities'
import {
  compositeFieldClassName,
  formFieldPrefixClassName,
  formInputAmountClassName,
  formInputClassName,
} from '@/features/trips/components/services/flight/operations/operation-worksheet-ui'
import { EmbeddedFormDatePicker } from '@/design-system/components/DatePickerField'
import { formatNotesText } from '@/shared/utils/text-format'
import { cn } from '@/shared/utils/cn'

interface CompositeTextFieldProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label: string
  placeholder?: string
  mono?: boolean
  notes?: boolean
  disabled?: boolean
}

export function CompositeTextField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  mono,
  notes,
  disabled,
}: CompositeTextFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className={compositeFieldClassName}>
          <span className={formFieldPrefixClassName}>{label}</span>
          <Input
            value={field.value ?? ''}
            onChange={(event) =>
              field.onChange(notes ? formatNotesText(event.target.value) : event.target.value)
            }
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(formInputClassName, mono && 'font-mono uppercase tracking-wide')}
          />
        </div>
      )}
    />
  )
}

interface CompositeNumberFieldProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label: string
  disabled?: boolean
  decimals?: number
}

export function CompositeNumberField<T extends FieldValues>({
  control,
  name,
  label,
  disabled,
  decimals = 0,
}: CompositeNumberFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className={compositeFieldClassName}>
          <span className={formFieldPrefixClassName}>{label}</span>
          <AmountInput
            value={Number(field.value) || 0}
            onChange={field.onChange}
            decimals={decimals}
            disabled={disabled}
            emptyWhenZero
            className={cn(formInputClassName, formInputAmountClassName, 'text-left')}
          />
        </div>
      )}
    />
  )
}

interface CompositeDateFieldProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label: string
  disabled?: boolean
}

export function CompositeDateField<T extends FieldValues>({
  control,
  name,
  label,
  disabled,
}: CompositeDateFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className={compositeFieldClassName}>
          <span className={formFieldPrefixClassName}>{label}</span>
          <EmbeddedFormDatePicker
            value={field.value ?? ''}
            onChange={field.onChange}
            readOnly={disabled}
            aria-label={label}
            inputClassName={cn(formInputClassName, 'pr-7 pl-2 tabular-nums')}
          />
        </div>
      )}
    />
  )
}

interface CompositeCheckboxFieldProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label: string
  disabled?: boolean
}

export function CompositeCheckboxField<T extends FieldValues>({
  control,
  name,
  label,
  disabled,
}: CompositeCheckboxFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <label
          className={cn(
            compositeFieldClassName,
            'cursor-pointer gap-2 px-2.5',
            disabled && 'cursor-not-allowed opacity-60',
          )}
        >
          <input
            type="checkbox"
            checked={Boolean(field.value)}
            onChange={(event) => field.onChange(event.target.checked)}
            disabled={disabled}
            className="h-3.5 w-3.5 rounded border-[var(--color-border)] text-[var(--color-accent)]"
          />
          <span className="text-[13px] text-[var(--color-foreground)]">{label}</span>
        </label>
      )}
    />
  )
}

interface CompositeTextareaFieldProps {
  value: string
  onChange: (value: string) => void
  label: string
  disabled?: boolean
  rows?: number
}

export function CompositeTextareaField({ value, onChange, label, disabled, rows = 4 }: CompositeTextareaFieldProps) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] focus-within:border-[var(--color-accent)] focus-within:ring-2 focus-within:ring-[var(--color-accent)]/20">
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/40 px-2.5 py-1.5 text-[11px] font-medium tracking-wide text-[var(--color-muted)]">
        {label}
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(formatNotesText(event.target.value))}
        disabled={disabled}
        rows={rows}
        className="min-h-[6rem] w-full resize-y rounded-none border-0 bg-transparent px-2.5 py-2 shadow-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  )
}

interface CategoryFieldGridProps {
  children: ReactNode
  columns?: 2 | 3
}

export function CategoryFieldGrid({ children, columns = 2 }: CategoryFieldGridProps) {
  return (
    <div className={cn('grid min-w-0 gap-2', columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2')}>{children}</div>
  )
}

export function categoryFieldSectionTitle(category: ServiceCategory): string {
  switch (category) {
    case 'activity':
      return 'Activity details'
    case 'cruise':
      return 'Cruise details'
    case 'lodging':
      return 'Lodging details'
    case 'restaurant':
      return 'Restaurant details'
    case 'tour':
      return 'Tour details'
    case 'insurance':
      return 'Insurance details'
    case 'flight':
      return 'Flight details'
  }
}
