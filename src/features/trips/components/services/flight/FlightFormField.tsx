import { useMemo, useState, forwardRef, type ChangeEvent, type ComponentProps, type FocusEvent } from 'react'
import { DatePickerField } from '@/design-system/components/DatePickerField'
import { Input } from '@/design-system/components/Input'
import { FormPicklist } from '@/design-system/components/FormPicklist'
import {
  DATE_PLACEHOLDER,
  formatDate,
  TIME_24H_PLACEHOLDER,
  normalizeTime24Input,
} from '@/shared/utils/date-format'
import { cn } from '@/shared/utils/cn'
import { FLIGHT_TABLE_FIELD_CLASS } from '@/features/trips/components/services/flight/flight-table-styles'

interface FlightTableInputProps extends Omit<ComponentProps<typeof Input>, 'error' | 'size'> {
  error?: string
  /** Show the full field value in a native tooltip on hover (for truncated cells). */
  showFullValueOnHover?: boolean
}

export const FlightTableInput = forwardRef<HTMLInputElement, FlightTableInputProps>(
  function FlightTableInput(
    {
      error,
      className,
      title,
      showFullValueOnHover = false,
      onMouseEnter,
      onMouseLeave,
      onInput,
      ...props
    },
    ref,
  ) {
    const [hoverTitle, setHoverTitle] = useState<string | undefined>()

    const syncHoverTitle = (element: HTMLInputElement) => {
      if (!showFullValueOnHover || error) {
        setHoverTitle(undefined)
        return
      }
      const value = element.value.trim()
      if (!value) {
        setHoverTitle(undefined)
        return
      }
      setHoverTitle(element.scrollWidth > element.clientWidth ? value : undefined)
    }

    return (
      <Input
        ref={ref}
        size="sm"
        title={error ? String(error) : title ?? hoverTitle}
        className={cn(
          'h-7 w-full min-w-0 px-1.5',
          FLIGHT_TABLE_FIELD_CLASS,
          props.readOnly && 'cursor-default bg-[var(--color-surface-muted)]/40 focus:ring-0',
          className,
        )}
        error={Boolean(error)}
        onMouseEnter={(event) => {
          syncHoverTitle(event.currentTarget)
          onMouseEnter?.(event)
        }}
        onMouseLeave={(event) => {
          if (showFullValueOnHover) setHoverTitle(undefined)
          onMouseLeave?.(event)
        }}
        onInput={(event) => {
          if (showFullValueOnHover) syncHoverTitle(event.currentTarget)
          onInput?.(event)
        }}
        {...props}
      />
    )
  },
)
FlightTableInput.displayName = 'FlightTableInput'

interface FlightTableTimeInputProps extends Omit<ComponentProps<typeof Input>, 'size' | 'error' | 'type'> {
  error?: string
}

function commitTime24Value(
  event: FocusEvent<HTMLInputElement>,
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void,
) {
  const normalized = normalizeTime24Input(event.target.value)
  if (normalized === event.target.value) return

  event.target.value = normalized
  onChange?.({
    ...event,
    target: event.target,
    currentTarget: event.currentTarget,
  } as ChangeEvent<HTMLInputElement>)
}

export const FlightTableTimeInput = forwardRef<HTMLInputElement, FlightTableTimeInputProps>(
  function FlightTableTimeInput({ error, className, onBlur, onChange, ...props }, ref) {
    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        spellCheck={false}
        placeholder={TIME_24H_PLACEHOLDER}
        maxLength={5}
        size="sm"
        title={error ? String(error) : undefined}
        className={cn(
          'h-7 w-full min-w-0 px-1.5 text-xs font-semibold tabular-nums tracking-wide',
          FLIGHT_TABLE_FIELD_CLASS,
          className,
        )}
        error={Boolean(error)}
        onChange={onChange}
        onBlur={(event) => {
          commitTime24Value(event, onChange)
          onBlur?.(event)
        }}
        {...props}
      />
    )
  },
)

export function FlightTableDatePicker(props: ComponentProps<typeof DatePickerField>) {
  return (
    <DatePickerField
      {...props}
      inputClassName={cn('uppercase placeholder:uppercase', props.inputClassName)}
    />
  )
}

interface FlightTableDateTimeFieldProps {
  idPrefix: string
  kind: 'departure' | 'arrival'
  dateValue: string
  onDateChange: (value: string) => void
  onDateBlur?: () => void
  minDate?: string
  dateError?: string
  timeError?: string
  dateAriaLabel?: string
  timeInputProps: Omit<ComponentProps<typeof FlightTableTimeInput>, 'error'>
  readOnly?: boolean
}

const FLIGHT_DATETIME_KIND_STYLES = {
  departure: 'border-l-[var(--color-accent)]',
  arrival: 'border-l-[var(--color-success)]',
} as const

export function FlightTableDateTimeField({
  idPrefix,
  kind,
  dateValue,
  onDateChange,
  onDateBlur,
  minDate,
  dateError,
  timeError,
  dateAriaLabel,
  timeInputProps,
  readOnly = false,
}: FlightTableDateTimeFieldProps) {
  const displayError = dateError ?? timeError
  const dateLabel = dateValue ? formatDate(dateValue, '') : DATE_PLACEHOLDER

  return (
    <div
      title={displayError ? String(displayError) : dateLabel}
      className={cn(
        'flex h-7 min-w-0 items-stretch overflow-hidden rounded-[var(--radius-md)] border border-l-2 bg-[var(--color-surface)]',
        FLIGHT_DATETIME_KIND_STYLES[kind],
        displayError
          ? 'border-[var(--color-danger)]'
          : readOnly
            ? 'border-[var(--color-border)]'
            : 'border-[var(--color-border)] focus-within:border-[var(--color-accent)] focus-within:ring-1 focus-within:ring-[var(--color-accent)]/20',
      )}
    >
      <div className="min-w-0 flex-1 basis-[76%]">
        <FlightTableDatePicker
          id={`${idPrefix}-date`}
          aria-label={dateAriaLabel}
          value={dateValue}
          onChange={onDateChange}
          onBlur={onDateBlur}
          min={minDate}
          embedded
          readOnly={readOnly}
          className="h-full w-full"
          inputClassName="h-7 pr-7 pl-1.5 whitespace-nowrap"
        />
      </div>
      <FlightTableTimeInput
        id={`${idPrefix}-time`}
        aria-label={dateAriaLabel ? `${dateAriaLabel} time` : 'Time'}
        error={timeError}
        readOnly={readOnly}
        className="h-7 w-[3.4rem] max-w-[3.4rem] shrink-0 rounded-none border-0 border-l border-[var(--color-border)] bg-[var(--color-surface-muted)]/50 px-0.5 shadow-none focus:ring-0"
        {...timeInputProps}
      />
    </div>
  )
}

interface FlightTableOptionSelectProps {
  id?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  options: readonly { value: string; label: string }[]
  error?: string
  'aria-label'?: string
  className?: string
  /** Keep values that are not in `options` (e.g. migrated data). */
  preserveUnknownValue?: boolean
  readOnly?: boolean
}

export function FlightTableOptionSelect({
  id,
  value,
  onChange,
  onBlur,
  options,
  error,
  'aria-label': ariaLabel,
  className,
  preserveUnknownValue = true,
  readOnly = false,
}: FlightTableOptionSelectProps) {
  const normalizedValue = value ?? ''
  const hasKnownValue = options.some((option) => option.value === normalizedValue)
  const showUnknown = preserveUnknownValue && normalizedValue && !hasKnownValue

  const picklistOptions = useMemo(() => {
    const list = options.map((option) => ({ value: option.value, label: option.label }))
    if (showUnknown) {
      return [{ value: normalizedValue, label: normalizedValue }, ...list]
    }
    return list
  }, [options, showUnknown, normalizedValue])

  return (
    <FormPicklist
      id={id}
      size="xs"
      value={normalizedValue}
      onChange={onChange}
      onBlur={onBlur}
      options={picklistOptions}
      ariaLabel={ariaLabel ?? 'Select'}
      disabled={readOnly}
      error={Boolean(error)}
      searchable={picklistOptions.length > 6}
      className={cn('min-w-0', readOnly && 'opacity-100', className)}
    />
  )
}
