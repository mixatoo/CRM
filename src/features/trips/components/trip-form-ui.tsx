import type { LucideIcon } from 'lucide-react'
import { CalendarRange, Check, MapPin, User } from 'lucide-react'
import type { TripFormInput } from '@/features/trips/utils/create-trip'
import { TRIP_TYPE_OPTIONS } from '@/features/trips/utils/create-trip'
import { TripStageBadge } from '@/features/trips/components/list/TripStageBadge'
import { formatDate } from '@/shared/utils/date-format'
import { cn } from '@/shared/utils/cn'

export const TRIP_FORM_STICKY_BAR =
  'bg-[var(--color-surface)]/95 backdrop-blur-sm supports-[backdrop-filter]:bg-[var(--color-surface)]/90'

export type TripFormStepId = 'basics' | 'client' | 'schedule'

export const TRIP_FORM_STEPS: Array<{
  id: TripFormStepId
  label: string
  description: string
  icon: LucideIcon
}> = [
  { id: 'basics', label: 'Trip', description: 'Name, destination & owner', icon: MapPin },
  { id: 'client', label: 'Client', description: 'Select from client directory', icon: User },
  { id: 'schedule', label: 'Schedule', description: 'Dates, pax & currency', icon: CalendarRange },
]

export function TripFormStepNav({
  step,
  onStepChange,
  completedSteps,
}: {
  step: TripFormStepId
  onStepChange: (step: TripFormStepId) => void
  completedSteps: Set<TripFormStepId>
}) {
  return (
    <nav aria-label="Form steps" className="flex min-h-0 flex-col gap-1">
      {TRIP_FORM_STEPS.map((item, index) => {
        const selected = step === item.id
        const completed = completedSteps.has(item.id)
        const Icon = item.icon

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onStepChange(item.id)}
            className={cn(
              'flex w-full items-start gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2 text-left transition-colors',
              selected
                ? 'bg-[var(--color-accent-muted)]/40 ring-1 ring-[var(--color-accent)]/25'
                : 'hover:bg-[var(--color-surface-elevated)]',
            )}
          >
            <span
              className={cn(
                'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold tabular-nums',
                selected
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                  : completed
                    ? 'border-[var(--color-success)]/40 bg-[var(--color-success-muted)]/50 text-[var(--color-success)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)]',
              )}
              aria-hidden
            >
              {completed && !selected ? <Check className="h-3 w-3" strokeWidth={3} /> : index + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-[var(--color-foreground)]">{item.label}</span>
              <span className="mt-0.5 block text-[11px] font-normal leading-snug text-[var(--color-muted)]">
                {selected ? 'Current step' : item.description}
              </span>
            </span>
            <Icon className="mt-1 h-3.5 w-3.5 shrink-0 text-[var(--color-subtle)]" aria-hidden />
          </button>
        )
      })}
    </nav>
  )
}

export function TripFormPreview({ form }: { form: TripFormInput }) {
  const hasDates = Boolean(form.startDate || form.endDate)
  const hasClient = Boolean(form.clientId || form.mainContactName?.trim() || form.mainContactEmail?.trim())

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]/40 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-subtle)]">Preview</p>
      <div className="mt-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--color-foreground)]">
            {form.name.trim() || 'Untitled trip'}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-[var(--color-muted)]">
            {[form.destination, form.branch].filter(Boolean).join(' · ') || 'No destination yet'}
          </p>
        </div>
        <TripStageBadge stage="draft" className="shrink-0" />
      </div>
      <dl className="mt-2.5 space-y-1 text-[11px] text-[var(--color-muted)]">
        <div className="truncate">
          <dt className="sr-only">Type</dt>
          <dd>
            {form.tripType}
            {form.ownerName.trim() ? ` · ${form.ownerName.trim()}` : ''}
          </dd>
        </div>
        {hasClient ? (
          <div className="truncate">
            <dt className="sr-only">Client</dt>
            <dd>
              {form.mainContactName?.trim() || '—'}
              {form.mainContactEmail?.trim() ? ` · ${form.mainContactEmail.trim()}` : ''}
            </dd>
          </div>
        ) : null}
        {hasDates ? (
          <div className="truncate">
            <dt className="sr-only">Dates</dt>
            <dd>
              {form.startDate ? formatDate(form.startDate) : '—'}
              {form.endDate && form.endDate !== form.startDate ? ` → ${formatDate(form.endDate)}` : ''}
            </dd>
          </div>
        ) : null}
        <div className="truncate">
          <dt className="sr-only">Pax</dt>
          <dd>
            {form.adults} adult{form.adults === 1 ? '' : 's'}
            {form.minors > 0 ? ` · ${form.minors} minor${form.minors === 1 ? '' : 's'}` : ''}
            {' · '}
            {form.currency}
          </dd>
        </div>
      </dl>
    </div>
  )
}

export function TripTypeField({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Trip type"
      className="flex flex-wrap gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]/60 p-1"
    >
      {TRIP_TYPE_OPTIONS.map((type) => {
        const selected = value === type
        return (
          <button
            key={type}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(type)}
            className={cn(
              'min-h-8 flex-1 rounded-[var(--radius-sm)] px-2.5 text-xs font-medium transition-colors',
              selected
                ? 'bg-[var(--color-surface)] text-[var(--color-foreground)] shadow-sm ring-1 ring-[var(--color-border)]'
                : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            {type}
          </button>
        )
      })}
    </div>
  )
}
