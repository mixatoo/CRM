import { useEffect, useState } from 'react'
import {
  CLIENT_MEMBERSHIP_DESCRIPTIONS,
  isClientMember,
  resolveClientMembership,
  type ClientMembership,
} from '@/domain/entities/client'
import {
  DEFAULT_MEMBERSHIP_DURATION_MONTHS,
  addMonthsToMembershipDate,
  matchMembershipDurationPreset,
  membershipStartToIso,
  toMembershipStartDate,
} from '@/domain/membership/term'
import { Input } from '@/design-system/components/Input'
import { CrmFieldGrid, CrmInputCell, CrmPanel } from '@/design-system/layout/CrmPanel'
import { ClientMembershipField, FormField } from '@/features/clients/components/client-form-ui'
import { ClientFormStepLayout, FormStepCluster } from '@/features/clients/components/client-form-shared'
import { MembershipTermEditor } from '@/features/clients/components/membership/MembershipTermEditor'
import type { ClientFormInput } from '@/features/clients/hooks/use-client-mutations'

type OnPatch = (patch: Partial<ClientFormInput>) => void

function buildTermFromForm(form: ClientFormInput) {
  const enrolled = isClientMember(form.membership)
  const startDate = enrolled ? toMembershipStartDate(form.membershipEnrolledAt) : toMembershipStartDate()
  const expiresAt =
    form.membershipExpiresAt ??
    (enrolled ? addMonthsToMembershipDate(startDate, DEFAULT_MEMBERSHIP_DURATION_MONTHS) : '')
  return {
    startDate,
    expiresAt,
    durationPreset: enrolled ? matchMembershipDurationPreset(startDate, expiresAt) : DEFAULT_MEMBERSHIP_DURATION_MONTHS,
  }
}

function membershipEnrollmentHint(membership: ClientMembership) {
  return CLIENT_MEMBERSHIP_DESCRIPTIONS[resolveClientMembership(membership)]
}

export function MembershipFieldsBlock({
  form,
  onPatch,
  disabled,
  compact,
}: {
  form: ClientFormInput
  onPatch: OnPatch
  disabled?: boolean
  compact?: boolean
}) {
  const membership = resolveClientMembership(form.membership)
  const enrolled = isClientMember(membership)
  const term = buildTermFromForm(form)
  const [startDate, setStartDate] = useState(term.startDate)
  const [expiresAt, setExpiresAt] = useState(term.expiresAt)
  const [durationPreset, setDurationPreset] = useState<number | 'custom'>(term.durationPreset)

  useEffect(() => {
    const next = buildTermFromForm(form)
    setStartDate(next.startDate)
    setExpiresAt(next.expiresAt)
    setDurationPreset(next.durationPreset)
  }, [form.membership, form.membershipEnrolledAt, form.membershipExpiresAt])

  const applyDurationPreset = (months: number | 'custom', nextStart = startDate) => {
    setDurationPreset(months)
    const nextExpires = months === 'custom' ? expiresAt : addMonthsToMembershipDate(nextStart, months)
    if (months !== 'custom') setExpiresAt(nextExpires)
    if (enrolled) {
      onPatch({
        membershipEnrolledAt: membershipStartToIso(nextStart),
        membershipExpiresAt: nextExpires,
      })
    }
  }

  const handleMembershipChange = (value: ClientMembership) => {
    if (value === 'member') {
      const start = toMembershipStartDate(form.membershipEnrolledAt)
      const end = form.membershipExpiresAt ?? addMonthsToMembershipDate(start, DEFAULT_MEMBERSHIP_DURATION_MONTHS)
      onPatch({
        membership: 'member',
        membershipEnrolledAt: form.membershipEnrolledAt ?? membershipStartToIso(start),
        membershipExpiresAt: end,
      })
      return
    }
    onPatch({
      membership: 'non_member',
      membershipEnrolledAt: undefined,
      membershipExpiresAt: undefined,
      membershipNumber: undefined,
    })
  }

  const handleStartDateChange = (value: string) => {
    setStartDate(value)
    const nextExpires = durationPreset === 'custom' ? expiresAt : addMonthsToMembershipDate(value, durationPreset)
    if (durationPreset !== 'custom') setExpiresAt(nextExpires)
    onPatch({
      membershipEnrolledAt: membershipStartToIso(value),
      membershipExpiresAt: nextExpires,
    })
  }

  const handleExpiresAtChange = (value: string) => {
    setExpiresAt(value)
    setDurationPreset(matchMembershipDurationPreset(startDate, value))
    onPatch({ membershipExpiresAt: value })
  }

  const memberNumberHint = form.membershipNumber
    ? undefined
    : enrolled
      ? 'Assigned automatically when the client is saved'
      : undefined

  const termEditorProps = {
    form,
    startDate,
    expiresAt,
    durationPreset,
    disabled,
    notes: form.membershipNotes ?? '',
    onNotesChange: (value: string) => onPatch({ membershipNotes: value }),
    onStartDateChange: handleStartDateChange,
    onDurationPresetChange: applyDurationPreset,
    onExpiresAtChange: handleExpiresAtChange,
  }

  if (compact) {
    return (
      <ClientFormStepLayout>
        <FormField label="Membership" fieldKey="membership">
          <ClientMembershipField value={membership} onChange={handleMembershipChange} disabled={disabled} />
        </FormField>
        {form.membershipNumber ? (
          <FormField label="Member number" fieldKey="membershipNumber">
            <Input value={form.membershipNumber} disabled className="font-mono" />
          </FormField>
        ) : memberNumberHint ? (
          <p className="text-[11px] text-[var(--color-muted)]">{memberNumberHint}</p>
        ) : null}

        {enrolled ? (
          <FormStepCluster>
            <MembershipTermEditor layout="form" {...termEditorProps} />
          </FormStepCluster>
        ) : null}
      </ClientFormStepLayout>
    )
  }

  return (
    <CrmPanel title="Membership">
      <CrmFieldGrid columns={2}>
        <CrmInputCell label="Enrollment" className="sm:col-span-2">
          <ClientMembershipField value={membership} onChange={handleMembershipChange} disabled={disabled} />
          <p className="mt-1.5 text-[11px] leading-snug text-[var(--color-muted)]">
            {membershipEnrollmentHint(membership)}
          </p>
        </CrmInputCell>

        {form.membershipNumber ? (
          <CrmInputCell label="Member number" className="sm:col-span-2">
            <Input value={form.membershipNumber} disabled className="max-w-[14rem] font-mono" />
          </CrmInputCell>
        ) : memberNumberHint ? (
          <CrmInputCell label="Member number" className="sm:col-span-2">
            <p className="text-xs text-[var(--color-muted)]">{memberNumberHint}</p>
          </CrmInputCell>
        ) : null}

        {enrolled ? (
          <div className="sm:col-span-2">
            <MembershipTermEditor layout="panel" {...termEditorProps} />
          </div>
        ) : null}
      </CrmFieldGrid>
    </CrmPanel>
  )
}
