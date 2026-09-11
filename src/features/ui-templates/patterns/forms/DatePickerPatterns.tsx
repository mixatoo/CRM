import { useEffect, useRef, useState } from 'react'
import { DateCalendar, type DateCalendarHandle } from '@/design-system/components/DateCalendar'
import {
  DATE_PICKER_KEYBOARD_HINT,
  EmbeddedFormDatePicker,
  FormDatePicker,
} from '@/design-system/components/DatePickerField'
import { FormField } from '@/features/clients/components/client-form-ui'
import {
  compositeFieldClassName,
  formFieldPrefixClassName,
  formInputClassName,
} from '@/features/trips/components/services/flight/operations/operation-worksheet-ui'
import { cn } from '@/shared/utils/cn'
import { PatternBlock } from '@/features/ui-templates/patterns/_shared/PatternBlock'

export function DatePickerPatterns() {
  const [formDate, setFormDate] = useState('')
  const [embeddedDate, setEmbeddedDate] = useState('')
  const [rangeFrom, setRangeFrom] = useState('')
  const [rangeTo, setRangeTo] = useState('')
  const [openRangeField, setOpenRangeField] = useState<'from' | 'to' | null>(null)
  const inlineCalendarRef = useRef<DateCalendarHandle>(null)

  useEffect(() => {
    if (!openRangeField) return
    const frame = requestAnimationFrame(() => inlineCalendarRef.current?.focusGrid())
    return () => cancelAnimationFrame(frame)
  }, [openRangeField])

  return (
    <div className="space-y-6">
      <PatternBlock
        title="FormDatePicker"
        description="Standard form fields — typed entry, month/year jump lists, arrow-key calendar navigation."
      >
        <div className="max-w-xs">
          <FormField label="Date of birth" hint={DATE_PICKER_KEYBOARD_HINT}>
            <FormDatePicker value={formDate} onChange={setFormDate} aria-label="Example date" />
          </FormField>
        </div>
      </PatternBlock>

      <PatternBlock
        title="EmbeddedFormDatePicker"
        description="Composite prefix rows (h-8) in dialogs and operation worksheets."
      >
        <div className="max-w-sm">
          <div className={compositeFieldClassName}>
            <span className={formFieldPrefixClassName}>Date</span>
            <div className="min-w-0 flex-1">
              <EmbeddedFormDatePicker
                value={embeddedDate}
                onChange={setEmbeddedDate}
                aria-label="Embedded example date"
                inputClassName={cn(formInputClassName, 'pr-7 pl-2 tabular-nums')}
              />
            </div>
          </div>
        </div>
      </PatternBlock>

      <PatternBlock
        title="Inline DateCalendar"
        description="Range filters and slot pickers — use yearMonthPickers + autoFocusGrid when the panel opens."
      >
        <div className="max-w-sm rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
          <div className="flex gap-2">
            <RangeSlotButton
              label="From"
              value={rangeFrom}
              active={openRangeField === 'from'}
              onClick={() => setOpenRangeField((current) => (current === 'from' ? null : 'from'))}
            />
            <RangeSlotButton
              label="To"
              value={rangeTo}
              active={openRangeField === 'to'}
              onClick={() => setOpenRangeField((current) => (current === 'to' ? null : 'to'))}
            />
          </div>
          {openRangeField ? (
            <div className="mt-3 border-t border-[var(--color-border)] pt-3">
              <DateCalendar
                ref={inlineCalendarRef}
                value={openRangeField === 'from' ? rangeFrom : rangeTo}
                min={openRangeField === 'to' ? rangeFrom || undefined : undefined}
                max={openRangeField === 'from' ? rangeTo || undefined : undefined}
                yearMonthPickers
                autoFocusGrid
                onChange={(iso) => {
                  if (openRangeField === 'from') setRangeFrom(iso)
                  else setRangeTo(iso)
                }}
                onClear={() => {
                  if (openRangeField === 'from') setRangeFrom('')
                  else setRangeTo('')
                }}
              />
            </div>
          ) : null}
        </div>
      </PatternBlock>
    </div>
  )
}

function RangeSlotButton({
  label,
  value,
  active,
  onClick,
}: {
  label: string
  value: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-w-0 flex-1 flex-col rounded-[var(--radius-md)] border px-2.5 py-2 text-left transition-colors',
        active
          ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)]/30'
          : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/30',
      )}
    >
      <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-subtle)]">{label}</span>
      <span className="mt-0.5 truncate text-sm tabular-nums text-[var(--color-foreground)]">
        {value || 'Select…'}
      </span>
    </button>
  )
}
