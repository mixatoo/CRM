import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import type { Client, ClientMembership } from '@/domain/entities/client'
import {
  CLIENT_MEMBERSHIP_DESCRIPTIONS,
  CLIENT_MEMBERSHIP_LABELS,
  CLIENT_MEMBERSHIP_PROGRAM_NAME,
  isClientMember,
  resolveClientMembership,
} from '@/domain/entities/client'
import { MEMBERSHIP_PROGRAM_BENEFITS } from '@/domain/membership/program'
import {
  DEFAULT_MEMBERSHIP_DURATION_MONTHS,
  addMonthsToMembershipDate,
  formatMembershipDuration,
  getDaysUntilMembershipExpiry,
  getMembershipTermStatus,
  matchMembershipDurationPreset,
  toMembershipStartDate,
} from '@/domain/membership/term'
import { canMutate } from '@/domain/policies/permissions'
import { Button } from '@/design-system/components/Button'
import { CrmFieldGrid, CrmPanel, CrmMetricCell } from '@/design-system/layout/CrmPanel'
import { ClientMembershipBadge } from '@/features/clients/components/membership/ClientMembershipBadge'
import { ClientMembershipField } from '@/features/clients/components/membership/ClientMembershipEnrollment'
import { MembershipTermEditor } from '@/features/clients/components/membership/MembershipTermEditor'
import { MembershipTermStatusBadge } from '@/features/clients/components/membership/MembershipTermStatusBadge'
import { FormField } from '@/features/clients/components/client-form-ui'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useClientMutations } from '@/features/clients/hooks/use-client-mutations'
import { formatDate } from '@/shared/utils/date-format'

interface ClientMembershipTabProps {
  client: Client
}

function buildTermState(source: Client) {
  const enrolled = isClientMember(source.membership)
  const startDate = enrolled ? toMembershipStartDate(source.membershipEnrolledAt) : toMembershipStartDate()
  const expiresAt =
    source.membershipExpiresAt ??
    (enrolled ? addMonthsToMembershipDate(startDate, DEFAULT_MEMBERSHIP_DURATION_MONTHS) : '')
  return {
    startDate,
    expiresAt,
    durationPreset: enrolled ? matchMembershipDurationPreset(startDate, expiresAt) : DEFAULT_MEMBERSHIP_DURATION_MONTHS,
  }
}

export function ClientMembershipTab({ client }: ClientMembershipTabProps) {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const canEdit = canMutate(role, 'passenger', 'update')
  const { updateClient, isPending } = useClientMutations()
  const [membership, setMembership] = useState<ClientMembership>(() => resolveClientMembership(client.membership))
  const [membershipNotes, setMembershipNotes] = useState(client.membershipNotes ?? '')
  const [startDate, setStartDate] = useState(() => buildTermState(client).startDate)
  const [expiresAt, setExpiresAt] = useState(() => buildTermState(client).expiresAt)
  const [durationPreset, setDurationPreset] = useState<number | 'custom'>(() => buildTermState(client).durationPreset)

  useEffect(() => {
    const term = buildTermState(client)
    setMembership(resolveClientMembership(client.membership))
    setMembershipNotes(client.membershipNotes ?? '')
    setStartDate(term.startDate)
    setExpiresAt(term.expiresAt)
    setDurationPreset(term.durationPreset)
  }, [client])

  const enrolled = isClientMember(membership)

  const previewClient = useMemo(
    (): Client => ({
      ...client,
      membership,
      membershipEnrolledAt: enrolled ? startDate : undefined,
      membershipExpiresAt: enrolled ? expiresAt : undefined,
    }),
    [client, enrolled, expiresAt, membership, startDate],
  )

  const dirty =
    membership !== resolveClientMembership(client.membership) ||
    membershipNotes.trim() !== (client.membershipNotes ?? '').trim() ||
    (enrolled &&
      (startDate !== toMembershipStartDate(client.membershipEnrolledAt) ||
        expiresAt !== (client.membershipExpiresAt ?? '')))

  const applyDurationPreset = (months: number | 'custom', nextStart = startDate) => {
    setDurationPreset(months)
    if (months !== 'custom') {
      setExpiresAt(addMonthsToMembershipDate(nextStart, months))
    }
  }

  const handleStartDateChange = (value: string) => {
    setStartDate(value)
    if (durationPreset !== 'custom') {
      setExpiresAt(addMonthsToMembershipDate(value, durationPreset))
    }
  }

  const handleExpiresAtChange = (value: string) => {
    setExpiresAt(value)
    setDurationPreset(matchMembershipDurationPreset(startDate, value))
  }

  const handleMembershipChange = (value: ClientMembership) => {
    setMembership(value)
    if (value === 'member' && !isClientMember(client.membership)) {
      const term = buildTermState({ ...client, membership: 'member' })
      setStartDate(term.startDate)
      setExpiresAt(term.expiresAt)
      setDurationPreset(term.durationPreset)
    }
  }

  const handleSave = () => {
    if (!canEdit) return
    updateClient.mutate({
      id: client.id,
      patch: {
        membership,
        membershipNotes,
        membershipEnrolledAt: enrolled ? startDate : undefined,
        membershipExpiresAt: enrolled ? expiresAt : undefined,
      },
    })
  }

  return (
    <div className="space-y-3">
      <CrmPanel title="Enrollment status">
        <div className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <ClientMembershipBadge membership={membership} className="h-7 min-w-[6.5rem] px-2.5" />
              {enrolled ? <MembershipTermStatusBadge client={previewClient} /> : null}
            </div>
            <p className="text-sm font-medium text-[var(--color-foreground)]">
              {CLIENT_MEMBERSHIP_LABELS[membership]}
            </p>
            <p className="max-w-lg text-xs leading-relaxed text-[var(--color-muted)]">
              {CLIENT_MEMBERSHIP_PROGRAM_NAME} — one program for all clients. Set the membership term below.
            </p>
          </div>
          {enrolled ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <CrmMetricCell label="Member number">{client.membershipNumber ?? 'Assigned on save'}</CrmMetricCell>
              <CrmMetricCell label="Duration">
                {formatMembershipDuration(startDate, expiresAt)}
              </CrmMetricCell>
              <CrmMetricCell label="Expires on">{expiresAt ? formatDate(expiresAt) : '—'}</CrmMetricCell>
            </div>
          ) : null}
        </div>
      </CrmPanel>

      <CrmPanel title="Manage enrollment">
        {canEdit ? (
          <div className="space-y-4 px-4 py-4">
            <FormField label="Enrollment" hint={CLIENT_MEMBERSHIP_DESCRIPTIONS[membership]}>
              <ClientMembershipField value={membership} onChange={handleMembershipChange} disabled={isPending} />
            </FormField>
            {enrolled && !client.membershipNumber ? (
              <p className="text-[11px] text-[var(--color-muted)]">
                Member number is assigned automatically when you save.
              </p>
            ) : null}
          </div>
        ) : (
          <p className="px-4 py-3 text-xs text-[var(--color-muted)]">You do not have permission to change enrollment.</p>
        )}
      </CrmPanel>

      {enrolled ? (
        <CrmPanel title="Membership term">
          <div className="px-4 py-4">
            {canEdit ? (
              <MembershipTermEditor
                layout="panel"
                form={{ membership }}
                startDate={startDate}
                expiresAt={expiresAt}
                durationPreset={durationPreset}
                disabled={isPending}
                notes={membershipNotes}
                onNotesChange={setMembershipNotes}
                onStartDateChange={handleStartDateChange}
                onDurationPresetChange={applyDurationPreset}
                onExpiresAtChange={handleExpiresAtChange}
              />
            ) : (
              <div className="space-y-4">
                <CrmFieldGrid columns={3}>
                  <CrmMetricCell label="Start date">{formatDate(startDate)}</CrmMetricCell>
                  <CrmMetricCell label="End date">{formatDate(expiresAt)}</CrmMetricCell>
                  <CrmMetricCell label="Duration">{formatMembershipDuration(startDate, expiresAt)}</CrmMetricCell>
                </CrmFieldGrid>
                {membershipNotes.trim() ? (
                  <CrmMetricCell label="Notes">{membershipNotes}</CrmMetricCell>
                ) : null}
              </div>
            )}
          </div>
        </CrmPanel>
      ) : null}

      <CrmPanel title="Program benefits">
        <ul className="space-y-2 px-4 py-4">
          {MEMBERSHIP_PROGRAM_BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2 text-xs text-[var(--color-foreground)]">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]" aria-hidden />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </CrmPanel>

      {canEdit ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] text-[var(--color-muted)]">
            Unenrolling clears the member number, term dates, and enrollment record.
          </p>
          <Button type="button" size="sm" disabled={!dirty || isPending} onClick={handleSave}>
            {isPending ? 'Saving…' : 'Save membership'}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export function ClientMembershipOverviewCard({ client }: { client: Client }) {
  const enrolled = isClientMember(client.membership)
  const termStatus = getMembershipTermStatus(client)

  return (
    <CrmPanel title={CLIENT_MEMBERSHIP_PROGRAM_NAME}>
      <div className="space-y-3 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <ClientMembershipBadge membership={client.membership} />
            {enrolled ? <MembershipTermStatusBadge client={client} /> : null}
            {enrolled && client.membershipNumber ? (
              <span className="text-xs text-[var(--color-muted)]">{client.membershipNumber}</span>
            ) : null}
          </div>
          <Link
            to={`/clients/${client.id}/membership`}
            className="text-xs font-medium text-[var(--color-accent)] hover:underline"
          >
            Open membership tab →
          </Link>
        </div>
        {enrolled ? (
          <div className="grid gap-2 text-xs text-[var(--color-muted)] sm:grid-cols-3">
            <span>Duration: {formatMembershipDuration(client.membershipEnrolledAt, client.membershipExpiresAt)}</span>
            <span>Expires: {client.membershipExpiresAt ? formatDate(client.membershipExpiresAt) : '—'}</span>
            <span>
              {termStatus === 'expired'
                ? 'Membership expired'
                : termStatus === 'expiring_soon'
                  ? `Expires in ${getDaysUntilMembershipExpiry(client.membershipExpiresAt) ?? '—'} days`
                  : 'Term active'}
            </span>
          </div>
        ) : null}
      </div>
    </CrmPanel>
  )
}
