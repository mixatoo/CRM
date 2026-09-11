import { useMemo } from 'react'
import { ClientFormPicklist } from '@/features/clients/components/client-form-ui'
import { NotesTextarea } from '@/design-system/components/NotesField'
import { CrmFieldGrid, CrmInputCell } from '@/design-system/layout/CrmPanel'
import { ClientFormDatePicker, FormField } from '@/features/clients/components/client-form-ui'
import { useClientFormProfileLayout } from '@/features/clients/components/client-form-profile-layout-context'
import {
  MEMBERSHIP_DURATION_PRESETS,
  formatMembershipDuration,
  getDaysUntilMembershipExpiry,
  getMembershipTermStatus,
  membershipStartToIso,
} from '@/domain/membership/term'
import type { ClientFormInput } from '@/features/clients/hooks/use-client-mutations'
import { formatDate } from '@/shared/utils/date-format'
import { cn } from '@/shared/utils/cn'

const DURATION_OPTIONS = [
  ...MEMBERSHIP_DURATION_PRESETS.map((preset) => ({
    value: String(preset.months),
    label: preset.label,
  })),
  { value: 'custom', label: 'Custom end date' },
]

function membershipTermSummary(
  startDate: string,
  expiresAt: string,
  termStatus: ReturnType<typeof getMembershipTermStatus>,
) {
  if (termStatus === 'expired') {
    return 'Term expired — extend the end date to restore active benefits.'
  }

  const duration = formatMembershipDuration(startDate, expiresAt)
  const through = formatDate(expiresAt)

  if (termStatus === 'expiring_soon') {
    const days = getDaysUntilMembershipExpiry(expiresAt)
    if (days != null) {
      return `Expires in ${days} day${days === 1 ? '' : 's'} · ${duration} through ${through}`
    }
  }

  return `${duration} term · benefits through ${through}`
}

interface MembershipTermEditorProps {
  form: Pick<ClientFormInput, 'membership'>
  startDate: string
  expiresAt: string
  durationPreset: number | 'custom'
  disabled?: boolean
  layout: 'form' | 'panel'
  notes?: string
  onNotesChange?: (value: string) => void
  onStartDateChange: (value: string) => void
  onDurationPresetChange: (months: number | 'custom') => void
  onExpiresAtChange: (value: string) => void
}

export function MembershipTermEditor({
  form,
  startDate,
  expiresAt,
  durationPreset,
  disabled,
  layout,
  notes,
  onNotesChange,
  onStartDateChange,
  onDurationPresetChange,
  onExpiresAtChange,
}: MembershipTermEditorProps) {
  const preview = useMemo(
    () => ({
      membership: form.membership,
      membershipEnrolledAt: membershipStartToIso(startDate),
      membershipExpiresAt: expiresAt,
    }),
    [expiresAt, form.membership, startDate],
  )
  const termStatus = getMembershipTermStatus(preview)
  const summary = membershipTermSummary(startDate, expiresAt, termStatus)
  const durationValue = durationPreset === 'custom' ? 'custom' : String(durationPreset)
  const isProfileLayout = useClientFormProfileLayout()

  const durationControl = (
    <ClientFormPicklist
      value={durationValue}
      onChange={(value) => {
        if (value === 'custom') {
          onDurationPresetChange('custom')
          return
        }
        onDurationPresetChange(Number.parseInt(value, 10))
      }}
      options={DURATION_OPTIONS}
      placeholder="Select duration"
      panelTitle="Duration"
      ariaLabel="Membership duration"
      disabled={disabled}
    />
  )

  const startControl = (
    <ClientFormDatePicker
      value={startDate}
      onChange={onStartDateChange}
      max={expiresAt || undefined}
      disabled={disabled}
      aria-label="Start date"
    />
  )

  const endControl = (
    <ClientFormDatePicker
      value={expiresAt}
      onChange={onExpiresAtChange}
      min={startDate || undefined}
      disabled={disabled}
      aria-label="End date"
    />
  )

  const summaryClassName = cn(
    'text-[11px] leading-snug',
    termStatus === 'expired'
      ? 'text-[var(--color-danger)]'
      : termStatus === 'expiring_soon'
        ? 'text-[var(--color-warning)]'
        : 'text-[var(--color-muted)]',
  )

  const notesControl =
    onNotesChange != null ? (
      <NotesTextarea
        value={notes ?? ''}
        onChange={(event) => onNotesChange(event.target.value)}
        placeholder="Renewal notes, special arrangements…"
        disabled={disabled}
        className="min-h-[5rem]"
      />
    ) : null

  if (layout === 'form') {
    const termFields = (
      <>
        <FormField label="Start date" fieldKey="membershipEnrolledAt">{startControl}</FormField>
        <FormField label="End date" fieldKey="membershipExpiresAt">{endControl}</FormField>
        <FormField label="Duration" fieldKey="membershipExpiresAt">{durationControl}</FormField>
      </>
    )

    return (
      <div className={isProfileLayout ? undefined : 'space-y-4'}>
        {isProfileLayout ? termFields : (
          <div className="grid min-w-0 grid-cols-3 gap-3">{termFields}</div>
        )}
        {!isProfileLayout ? <p className={summaryClassName}>{summary}</p> : null}

        {notesControl ? (
          <FormField label="Notes" hint="Internal enrollment context" fieldKey="membershipNotes">
            {notesControl}
          </FormField>
        ) : null}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <CrmFieldGrid columns={3}>
        <CrmInputCell label="Start date">{startControl}</CrmInputCell>
        <CrmInputCell label="End date">{endControl}</CrmInputCell>
        <CrmInputCell label="Duration">{durationControl}</CrmInputCell>
      </CrmFieldGrid>
      <p className={summaryClassName}>{summary}</p>
      {notesControl ? (
        <CrmInputCell label="Notes" className="sm:col-span-2">
          <p className="mb-1.5 text-[11px] text-[var(--color-muted)]">Internal enrollment context</p>
          {notesControl}
        </CrmInputCell>
      ) : null}
    </div>
  )
}
