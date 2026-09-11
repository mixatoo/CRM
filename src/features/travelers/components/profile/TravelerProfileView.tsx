import { useEffect, useMemo, useRef, useState } from 'react'
import type { Traveler } from '@/domain/entities/traveler'
import { travelerDisplayName } from '@/domain/entities/traveler'
import { ClientProfileBrowseFooter } from '@/features/clients/components/profile/ClientProfileBrowseFooter'
import {
  clientProfileBrowseGridClassName,
  clientProfileContentFadeClassName,
  clientProfileDetailBodyClassName,
  clientProfileDetailColumnClassName,
  clientProfileDetailDescClassName,
  clientProfileDetailHeaderClassName,
  clientProfileDetailScrollClassName,
  clientProfileDetailTitleClassName,
  clientProfileListColumnClassName,
} from '@/features/clients/components/profile/client-profile-browse-ui'
import { ProfileCrmFieldsShell } from '@/features/clients/components/profile/ProfileCrmFieldRow'
import { TravelerProfileFields } from '@/features/travelers/components/profile/TravelerProfileFields'
import { TravelerProfileSectionList } from '@/features/travelers/components/profile/TravelerProfileSectionList'
import {
  getTravelerProfileModifiedCount,
  isTravelerProfilePersistable,
  travelerProfileSnapshot,
  travelerToProfileInput,
} from '@/features/travelers/components/profile/traveler-profile-form'
import {
  TRAVELER_PROFILE_SECTION_ORDER,
  TRAVELER_PROFILE_SECTIONS,
  type TravelerProfileSectionId,
} from '@/features/travelers/components/profile/traveler-profile-sections'
import type { TravelerProfileInput } from '@/features/travelers/hooks/use-traveler-mutations'
import type { FormPicklistOption } from '@/design-system/components/FormPicklist'
import { cn } from '@/shared/utils/cn'

interface TravelerProfileViewProps {
  traveler: Traveler
  accountOptions: FormPicklistOption[]
  accountOwnerOptions: FormPicklistOption[]
  accountOwnerName?: string
  canEdit?: boolean
  isSaving?: boolean
  onSave?: (patch: TravelerProfileInput, options?: { silent?: boolean }) => void
  className?: string
}

export function TravelerProfileView({
  traveler,
  accountOptions,
  accountOwnerOptions,
  accountOwnerName,
  canEdit = false,
  isSaving = false,
  onSave,
  className,
}: TravelerProfileViewProps) {
  const [section, setSection] = useState<TravelerProfileSectionId>('summary')
  const [form, setForm] = useState<TravelerProfileInput>(() => travelerToProfileInput(traveler))
  const savedSnapshot = useMemo(
    () => travelerProfileSnapshot(travelerToProfileInput(traveler)),
    [traveler],
  )
  const savedForm = useMemo(() => travelerToProfileInput(traveler), [traveler])
  const unsavedCount = useMemo(
    () => (canEdit ? getTravelerProfileModifiedCount(savedForm, form) : 0),
    [canEdit, form, savedForm],
  )
  const detailScrollRef = useRef<HTMLDivElement>(null)
  const persistInFlightRef = useRef(false)

  useEffect(() => {
    setForm((current) =>
      travelerProfileSnapshot(current) === savedSnapshot
        ? travelerToProfileInput(traveler)
        : current,
    )
  }, [savedSnapshot, traveler])

  useEffect(() => {
    detailScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [section])

  const sectionMeta = TRAVELER_PROFILE_SECTIONS.find((item) => item.id === section)
  const sectionIndex = TRAVELER_PROFILE_SECTION_ORDER.indexOf(section)
  const isFirstStep = sectionIndex <= 0
  const isLastStep = sectionIndex >= TRAVELER_PROFILE_SECTION_ORDER.length - 1
  const canSave = canEdit && unsavedCount > 0 && isTravelerProfilePersistable(form)

  const persist = (options?: { silent?: boolean }) => {
    if (!onSave || !canSave || persistInFlightRef.current) return
    persistInFlightRef.current = true
    onSave(form, options)
    window.setTimeout(() => {
      persistInFlightRef.current = false
    }, 400)
  }

  const goTo = (next: TravelerProfileSectionId) => {
    setSection(next)
  }

  return (
    <div
      className={cn(
        'grid h-full min-h-0 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]',
        clientProfileBrowseGridClassName,
        className,
      )}
    >
      <aside className={clientProfileListColumnClassName}>
        <TravelerProfileSectionList
          section={section}
          form={form}
          onSectionChange={goTo}
          className="min-h-0 flex-1"
        />
      </aside>

      <section className={clientProfileDetailColumnClassName}>
        <header className={clientProfileDetailHeaderClassName}>
          <h2 className={clientProfileDetailTitleClassName}>
            {sectionMeta?.label ?? 'Passenger profile'}
          </h2>
          <p className={clientProfileDetailDescClassName}>
            {sectionMeta?.description ??
              `${traveler.reference} · ${travelerDisplayName(traveler)}`}
          </p>
        </header>

        <div className={clientProfileDetailBodyClassName}>
          <div
            ref={detailScrollRef}
            className={cn(clientProfileDetailScrollClassName, clientProfileContentFadeClassName)}
            key={section}
          >
            <ProfileCrmFieldsShell>
              <TravelerProfileFields
                section={section}
                form={form}
                reference={traveler.reference}
                createdAt={traveler.createdAt}
                updatedAt={traveler.updatedAt}
                accountOptions={accountOptions}
                accountOwnerOptions={accountOwnerOptions}
                accountOwnerName={accountOwnerName}
                onChange={(patch) => {
                  if (!canEdit) return
                  setForm((current) => ({ ...current, ...patch }))
                }}
              />
            </ProfileCrmFieldsShell>
          </div>

          <ClientProfileBrowseFooter
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            onBack={() => {
              if (isFirstStep) return
              goTo(TRAVELER_PROFILE_SECTION_ORDER[sectionIndex - 1]!)
            }}
            onNext={() => {
              if (isLastStep) return
              goTo(TRAVELER_PROFILE_SECTION_ORDER[sectionIndex + 1]!)
            }}
            onSaveNow={canEdit ? () => persist() : undefined}
            isSaving={isSaving}
            unsavedCount={unsavedCount}
            canSave={canSave}
            sectionLabel={sectionMeta?.label}
            stepIndex={sectionIndex}
            stepCount={TRAVELER_PROFILE_SECTION_ORDER.length}
          />
        </div>
      </section>
    </div>
  )
}
