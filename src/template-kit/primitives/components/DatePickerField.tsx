import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { CalendarDays } from 'lucide-react'
import { DateCalendar, isDateCalendarGridKey, type DateCalendarHandle } from '../components/DateCalendar'
import { Input, INPUT_FIELD_TEXT_CLASS } from '../components/Input'
import {
  getFormFieldAffordanceClassName,
  type FormPicklistSize,
} from '../components/form-picklist-ui'
import {
  DATE_PLACEHOLDER,
  formatDate,
  isDateWithinBounds,
  parseDisplayDate,
  toLocalIsoDate,
} from '../utils/date-format'
import { cn } from '../utils/cn'

export interface DatePickerFieldProps {
  id?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  min?: string
  max?: string
  error?: string
  'aria-label'?: string
  className?: string
  embedded?: boolean
  inputClassName?: string
  inputFocusStyle?: 'default' | 'neutral'
  readOnly?: boolean
  popoverContentClassName?: string
  calendarYearMonthPickers?: boolean
  size?: FormPicklistSize
}

const INVALID_DATE_MESSAGE = 'Use DD Mon YYYY, DD/MM/YYYY, or YYYY-MM-DD'
const OUT_OF_RANGE_MESSAGE = 'Date is outside the allowed range'
const DATE_PICKER_POPOVER_ATTR = 'data-date-picker-popover'

export const DATE_PICKER_KEYBOARD_HINT =
  'Arrow keys move days · Enter selects · Page Up/Down changes month · Month/year lists jump quickly'

export function DatePickerField({
  id,
  value,
  onChange,
  onBlur,
  min,
  max,
  error,
  'aria-label': ariaLabel,
  className,
  embedded = false,
  inputClassName,
  inputFocusStyle = 'default',
  readOnly = false,
  popoverContentClassName,
  calendarYearMonthPickers = false,
  size = 'sm',
}: DatePickerFieldProps) {
  const fallbackId = useId()
  const inputId = id ?? fallbackId
  const inputRef = useRef<HTMLInputElement>(null)
  const calendarRef = useRef<DateCalendarHandle>(null)
  const skipDraftCommitRef = useRef(false)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(() => (value ? formatDate(value, '') : ''))
  const [focused, setFocused] = useState(false)
  const [localError, setLocalError] = useState<string | undefined>()

  const committedDraft = value ? formatDate(value, '') : ''
  const displayDraft = focused ? draft : committedDraft
  const displayError = error ?? (focused ? localError : undefined)
  const affordance = getFormFieldAffordanceClassName(size, { open, disabled: readOnly })

  const resetDraft = () => {
    setDraft(value ? formatDate(value, '') : '')
    setLocalError(undefined)
  }

  const commitDraft = (): boolean => {
    const trimmed = draft.trim()

    if (!trimmed) {
      onChange('')
      setDraft('')
      setLocalError(undefined)
      return true
    }

    const parsed = parseDisplayDate(trimmed)
    if (!parsed) {
      setLocalError(INVALID_DATE_MESSAGE)
      resetDraft()
      return false
    }

    if (!isDateWithinBounds(parsed, min, max)) {
      setLocalError(OUT_OF_RANGE_MESSAGE)
      resetDraft()
      return false
    }

    const iso = toLocalIsoDate(parsed)
    onChange(iso)
    setDraft(formatDate(iso, ''))
    setLocalError(undefined)
    return true
  }

  const applyCalendarSelection = (iso: string) => {
    skipDraftCommitRef.current = true
    onChange(iso)
    setDraft(iso ? formatDate(iso, '') : '')
    setLocalError(undefined)
    setFocused(false)
    setOpen(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (readOnly) return
    if (!next) {
      if (!skipDraftCommitRef.current && focused) {
        commitDraft()
      }
      skipDraftCommitRef.current = false
    }
    setOpen(next)
    if (!next) onBlur?.()
  }

  const shouldSkipDraftCommit = (relatedTarget: EventTarget | null) => {
    if (skipDraftCommitRef.current) return true
    if (!(relatedTarget instanceof HTMLElement)) return false
    return Boolean(relatedTarget.closest(`[${DATE_PICKER_POPOVER_ATTR}]`))
  }

  const handleInputBlur = (event: FocusEvent<HTMLInputElement>) => {
    if (shouldSkipDraftCommit(event.relatedTarget)) return
    setFocused(false)
    const committed = commitDraft()
    if (committed) onBlur?.()
  }

  useEffect(() => {
    if (!open) return
    const frame = requestAnimationFrame(() => calendarRef.current?.focusGrid())
    return () => cancelAnimationFrame(frame)
  }, [open])

  useEffect(() => {
    if (focused) return
    setDraft(value ? formatDate(value, '') : '')
  }, [value, focused])

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (open && isDateCalendarGridKey(event.key)) {
      event.preventDefault()
      if (event.key === 'Enter' || event.key === ' ') {
        event.stopPropagation()
      }
      calendarRef.current?.focusGrid(event.key)
      if (event.key === 'Enter' || event.key === ' ') {
        setOpen(false)
        onBlur?.()
        inputRef.current?.focus()
      }
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      if (commitDraft()) {
        setOpen(false)
        onBlur?.()
        inputRef.current?.blur()
      }
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      resetDraft()
      setOpen(false)
      inputRef.current?.blur()
      onBlur?.()
      return
    }

    if (event.key === 'ArrowDown' && !open) {
      event.preventDefault()
      setOpen(true)
    }
  }

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <div className={cn('relative min-w-0', !embedded && 'min-w-[6.5rem]', className)} data-date-picker-field>
        <Input
          ref={inputRef}
          id={inputId}
          size="sm"
          focusStyle={inputFocusStyle}
          value={displayDraft}
          readOnly={readOnly}
          onChange={(event) => {
            if (readOnly) return
            setDraft(event.target.value)
            if (localError) setLocalError(undefined)
          }}
          onFocus={() => {
            if (readOnly) return
            setDraft(committedDraft)
            setFocused(true)
          }}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          placeholder={DATE_PLACEHOLDER}
          aria-label={ariaLabel}
          autoComplete="off"
          spellCheck={false}
          title={displayError ? String(displayError) : undefined}
          className={cn(
            'h-7 w-full min-w-0 pl-1.5 tabular-nums',
            affordance.inputAffordancePad,
            INPUT_FIELD_TEXT_CLASS,
            !displayDraft && 'text-[var(--color-subtle)]',
            readOnly && 'cursor-default bg-[var(--color-surface-muted)]/40 focus:ring-0',
            embedded && 'rounded-none border-0 bg-transparent shadow-none focus:ring-0',
            embedded && readOnly && 'bg-transparent',
            inputClassName,
          )}
          error={Boolean(displayError)}
        />

        {!readOnly ? (
          <Popover.Trigger asChild>
            <button
              type="button"
              aria-label={ariaLabel ? `Open calendar for ${ariaLabel}` : 'Open calendar'}
              aria-expanded={open}
              className={cn(
                'absolute top-1/2 right-1 -translate-y-1/2 text-[var(--color-muted)] transition-colors',
                affordance.box,
                open && 'text-[var(--color-accent)]',
              )}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.stopPropagation()
                }
                if (event.altKey && event.key === 'ArrowDown') {
                  event.preventDefault()
                  event.stopPropagation()
                  setOpen(true)
                }
              }}
              onMouseDown={(event) => event.preventDefault()}
            >
              <CalendarDays
                className={cn(
                  affordance.icon,
                  open ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]',
                )}
              />
            </button>
          </Popover.Trigger>
        ) : null}
      </div>

      <Popover.Portal>
        <Popover.Content
          align="end"
          side="bottom"
          sideOffset={4}
          collisionPadding={8}
          {...{ [DATE_PICKER_POPOVER_ATTR]: '' }}
          className={cn('z-[510] w-[17rem] outline-none', popoverContentClassName)}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onPointerDownCapture={() => {
            skipDraftCommitRef.current = true
          }}
        >
          <DateCalendar
            ref={calendarRef}
            value={value}
            min={min}
            max={max}
            yearMonthPickers={calendarYearMonthPickers}
            onChange={applyCalendarSelection}
            onClear={() => applyCalendarSelection('')}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export type FormDatePickerProps = Omit<DatePickerFieldProps, 'embedded' | 'calendarYearMonthPickers'> & {
  calendarYearMonthPickers?: boolean
}

/** Standard form date field — keyboard nav, month/year jump lists, typed entry. */
export function FormDatePicker({
  calendarYearMonthPickers = true,
  popoverContentClassName,
  inputClassName,
  ...props
}: FormDatePickerProps) {
  return (
    <DatePickerField
      {...props}
      size="md"
      calendarYearMonthPickers={calendarYearMonthPickers}
      popoverContentClassName={cn('z-[620] w-[19rem]', popoverContentClassName)}
      inputClassName={cn('h-9 pl-3 tabular-nums', INPUT_FIELD_TEXT_CLASS, inputClassName)}
    />
  )
}

/** Composite-prefix date field (h-8 rows) — same calendar behavior as FormDatePicker. */
export function EmbeddedFormDatePicker({
  popoverContentClassName,
  inputClassName,
  ...props
}: Omit<DatePickerFieldProps, 'embedded' | 'calendarYearMonthPickers'>) {
  return (
    <DatePickerField
      {...props}
      embedded
      size="sm"
      calendarYearMonthPickers
      popoverContentClassName={cn('z-[620]', popoverContentClassName)}
      inputClassName={inputClassName}
    />
  )
}
