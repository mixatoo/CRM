import { useMemo, useState } from 'react'
import { MembershipTermEditor } from '@/features/clients/components/membership/MembershipTermEditor'
import { membershipStartToIso } from '@/domain/membership/term'
import { createMockClientForm } from '@/features/ui-templates/data/mock-client-form'
import { PatternBlock } from '@/features/ui-templates/patterns/_shared/PatternBlock'

export function MembershipPatterns() {
  const form = useMemo(() => createMockClientForm({ membership: 'member' }), [])
  const [startDate, setStartDate] = useState('2026-01-15')
  const [expiresAt, setExpiresAt] = useState('2027-01-14')
  const [durationPreset, setDurationPreset] = useState<number | 'custom'>(12)
  const [notes, setNotes] = useState('Renewal discussed on last trip.')

  const termEditorProps = useMemo(
    () => ({
      form,
      startDate,
      expiresAt,
      durationPreset,
      notes,
      onStartDateChange: setStartDate,
      onExpiresAtChange: setExpiresAt,
      onDurationPresetChange: setDurationPreset,
      onNotesChange: setNotes,
    }),
    [durationPreset, expiresAt, form, notes, startDate],
  )

  return (
    <PatternBlock
      title="MembershipTermEditor"
      description="Enrollment term with start/end dates, duration presets, live summary, and optional notes."
      path="src/features/clients/components/membership/MembershipTermEditor.tsx"
    >
      <div className="max-w-3xl space-y-6">
        <div>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-[var(--color-subtle)]">Form layout</p>
          <MembershipTermEditor layout="form" {...termEditorProps} />
        </div>
        <div>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-[var(--color-subtle)]">Panel layout</p>
          <MembershipTermEditor layout="panel" {...termEditorProps} />
        </div>
        <p className="text-[11px] text-[var(--color-muted)]">
          Enrolled at ISO: <span className="font-mono">{membershipStartToIso(startDate)}</span>
        </p>
      </div>
    </PatternBlock>
  )
}
