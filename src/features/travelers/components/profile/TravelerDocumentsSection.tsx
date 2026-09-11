import { Plus, Trash2 } from 'lucide-react'
import {
  PASSPORT_TYPE_LABELS,
  PASSPORT_TYPES,
  VISA_ENTRY_TYPE_LABELS,
  VISA_ENTRY_TYPES,
  VISA_TYPE_LABELS,
  VISA_TYPES,
  TRAVELER_OTHER_DOCUMENT_KIND_LABELS,
  TRAVELER_OTHER_DOCUMENT_KINDS,
  resolvePassportStatus,
  resolveVisaStatus,
  type TravelerOtherDocument,
  type TravelerPassport,
  type TravelerVisa,
} from '@/domain/entities/traveler'
import { Button } from '@/design-system/components/Button'
import { ConfirmDialog } from '@/design-system/components/ConfirmDialog'
import { generateId } from '@/shared/utils/cn'
import { getCountryPicklistOptions } from '@/domain/catalog/location-utils'
import { TravelerFileUploadField } from '@/features/travelers/components/profile/TravelerFileUploadField'
import {
  PassportStatusBadge,
  VisaStatusBadge,
} from '@/features/travelers/components/profile/TravelerProfileBadges'
import {
  TravelerDateField,
  TravelerNotesField,
  TravelerPicklistField,
  TravelerTextField,
  TravelerToggleField,
  enumOptions,
} from '@/features/travelers/components/profile/TravelerProfileFieldControls'
import { useMemo, useState } from 'react'

function emptyPassport(): TravelerPassport {
  return {
    id: generateId('PPT'),
    passportNumber: '',
    passportType: 'ordinary',
    isPrimary: false,
  }
}

function emptyVisa(): TravelerVisa {
  return {
    id: generateId('VIS'),
    visaCountry: '',
    visaType: 'tourist',
  }
}

function emptyOtherDoc(): TravelerOtherDocument {
  return {
    id: generateId('DOC'),
    kind: 'national_id',
  }
}

interface TravelerDocumentsSectionProps {
  passports: TravelerPassport[]
  visas: TravelerVisa[]
  otherDocuments: TravelerOtherDocument[]
  onChangePassports: (passports: TravelerPassport[]) => void
  onChangeVisas: (visas: TravelerVisa[]) => void
  onChangeOtherDocuments: (docs: TravelerOtherDocument[]) => void
}

export function TravelerDocumentsSection({
  passports,
  visas,
  otherDocuments,
  onChangePassports,
  onChangeVisas,
  onChangeOtherDocuments,
}: TravelerDocumentsSectionProps) {
  const countryOptions = useMemo(() => getCountryPicklistOptions(), [])
  const [pendingDelete, setPendingDelete] = useState<
    | { kind: 'passport' | 'visa' | 'other'; id: string; label: string }
    | null
  >(null)

  const updatePassport = (id: string, patch: Partial<TravelerPassport>) => {
    onChangePassports(
      passports.map((passport) => {
        if (passport.id !== id) {
          if (patch.isPrimary) return { ...passport, isPrimary: false }
          return passport
        }
        return { ...passport, ...patch }
      }),
    )
  }

  const updateVisa = (id: string, patch: Partial<TravelerVisa>) => {
    onChangeVisas(visas.map((visa) => (visa.id === id ? { ...visa, ...patch } : visa)))
  }

  const updateOther = (id: string, patch: Partial<TravelerOtherDocument>) => {
    onChangeOtherDocuments(otherDocuments.map((doc) => (doc.id === id ? { ...doc, ...patch } : doc)))
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    if (pendingDelete.kind === 'passport') {
      onChangePassports(passports.filter((item) => item.id !== pendingDelete.id))
    } else if (pendingDelete.kind === 'visa') {
      onChangeVisas(visas.filter((item) => item.id !== pendingDelete.id))
    } else {
      onChangeOtherDocuments(otherDocuments.filter((item) => item.id !== pendingDelete.id))
    }
    setPendingDelete(null)
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2 px-3 sm:px-5">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-foreground)]">Passports</h3>
            <p className="text-[11px] text-[var(--color-muted)]">Add multiple passports; mark one as primary.</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => onChangePassports([...passports, emptyPassport()])}
          >
            <Plus className="h-3.5 w-3.5" />
            Add passport
          </Button>
        </div>

        {passports.length === 0 ? (
          <p className="px-3 text-xs text-[var(--color-muted)] sm:px-5">No passports added yet.</p>
        ) : (
          passports.map((passport, index) => {
            const status = resolvePassportStatus(passport)
            return (
              <div
                key={passport.id}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)]/70 bg-[var(--color-surface)]"
              >
                <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)]/50 px-3 py-2 sm:px-5">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--color-foreground)]">
                      Passport {index + 1}
                      {passport.passportNumber ? ` · ${passport.passportNumber}` : ''}
                    </span>
                    <PassportStatusBadge status={status} />
                    {passport.isPrimary ? (
                      <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-accent)]">
                        Primary
                      </span>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[var(--color-danger)]"
                    onClick={() =>
                      setPendingDelete({
                        kind: 'passport',
                        id: passport.id,
                        label: passport.passportNumber || `Passport ${index + 1}`,
                      })
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <TravelerTextField
                  label="Passport number"
                  value={passport.passportNumber}
                  required
                  onChange={(value) => updatePassport(passport.id, { passportNumber: value })}
                />
                <TravelerPicklistField
                  label="Passport type"
                  value={passport.passportType}
                  options={enumOptions(PASSPORT_TYPES, PASSPORT_TYPE_LABELS)}
                  onChange={(value) =>
                    updatePassport(passport.id, { passportType: value as TravelerPassport['passportType'] })
                  }
                />
                <TravelerPicklistField
                  label="Country of issue"
                  value={passport.countryOfIssue}
                  options={countryOptions}
                  onChange={(value) => updatePassport(passport.id, { countryOfIssue: value })}
                />
                <TravelerPicklistField
                  label="Nationality on passport"
                  value={passport.nationalityOnPassport}
                  options={countryOptions}
                  onChange={(value) => updatePassport(passport.id, { nationalityOnPassport: value })}
                />
                <TravelerTextField
                  label="Place of issue"
                  value={passport.placeOfIssue}
                  onChange={(value) => updatePassport(passport.id, { placeOfIssue: value })}
                />
                <TravelerDateField
                  label="Issue date"
                  value={passport.issueDate}
                  onChange={(value) => updatePassport(passport.id, { issueDate: value })}
                />
                <TravelerDateField
                  label="Expiry date"
                  value={passport.expiryDate}
                  onChange={(value) => updatePassport(passport.id, { expiryDate: value })}
                />
                <TravelerToggleField
                  label="Primary passport"
                  checked={passport.isPrimary}
                  onChange={(checked) => updatePassport(passport.id, { isPrimary: checked })}
                />
                <div className="border-b border-[var(--color-border)]/40 px-3 py-3 sm:px-5">
                  <TravelerFileUploadField
                    label="Passport copy"
                    value={passport.copy}
                    onChange={(copy) => updatePassport(passport.id, { copy })}
                  />
                </div>
                <TravelerNotesField
                  label="Notes"
                  value={passport.notes}
                  onChange={(value) => updatePassport(passport.id, { notes: value })}
                />
              </div>
            )
          })
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2 px-3 sm:px-5">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-foreground)]">Visas</h3>
            <p className="text-[11px] text-[var(--color-muted)]">Track visas with expiry warnings.</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => onChangeVisas([...visas, emptyVisa()])}
          >
            <Plus className="h-3.5 w-3.5" />
            Add visa
          </Button>
        </div>

        {visas.length === 0 ? (
          <p className="px-3 text-xs text-[var(--color-muted)] sm:px-5">No visas added yet.</p>
        ) : (
          visas.map((visa, index) => {
            const status = resolveVisaStatus(visa)
            return (
              <div
                key={visa.id}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)]/70 bg-[var(--color-surface)]"
              >
                <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)]/50 px-3 py-2 sm:px-5">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--color-foreground)]">
                      Visa {index + 1}
                      {visa.visaCountry ? ` · ${visa.visaCountry}` : ''}
                    </span>
                    <VisaStatusBadge status={status} />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[var(--color-danger)]"
                    onClick={() =>
                      setPendingDelete({
                        kind: 'visa',
                        id: visa.id,
                        label: visa.visaNumber || visa.visaCountry || `Visa ${index + 1}`,
                      })
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <TravelerPicklistField
                  label="Visa country"
                  value={visa.visaCountry}
                  options={countryOptions}
                  required
                  onChange={(value) => updateVisa(visa.id, { visaCountry: value ?? '' })}
                />
                <TravelerPicklistField
                  label="Visa type"
                  value={visa.visaType}
                  options={enumOptions(VISA_TYPES, VISA_TYPE_LABELS)}
                  onChange={(value) => updateVisa(visa.id, { visaType: value as TravelerVisa['visaType'] })}
                />
                <TravelerTextField
                  label="Visa number"
                  value={visa.visaNumber}
                  onChange={(value) => updateVisa(visa.id, { visaNumber: value })}
                />
                <TravelerPicklistField
                  label="Entry type"
                  value={visa.entryType}
                  options={enumOptions(VISA_ENTRY_TYPES, VISA_ENTRY_TYPE_LABELS)}
                  onChange={(value) =>
                    updateVisa(visa.id, { entryType: value as TravelerVisa['entryType'] })
                  }
                />
                <TravelerDateField
                  label="Issue date"
                  value={visa.issueDate}
                  onChange={(value) => updateVisa(visa.id, { issueDate: value })}
                />
                <TravelerDateField
                  label="Expiry date"
                  value={visa.expiryDate}
                  onChange={(value) => updateVisa(visa.id, { expiryDate: value })}
                />
                <TravelerTextField
                  label="Duration of stay"
                  value={visa.durationOfStay}
                  onChange={(value) => updateVisa(visa.id, { durationOfStay: value })}
                />
                <TravelerTextField
                  label="Sponsor / issuing authority"
                  value={visa.sponsor}
                  onChange={(value) => updateVisa(visa.id, { sponsor: value })}
                />
                <div className="border-b border-[var(--color-border)]/40 px-3 py-3 sm:px-5">
                  <TravelerFileUploadField
                    label="Visa copy"
                    value={visa.copy}
                    onChange={(copy) => updateVisa(visa.id, { copy })}
                  />
                </div>
                <TravelerNotesField
                  label="Notes"
                  value={visa.notes}
                  onChange={(value) => updateVisa(visa.id, { notes: value })}
                />
              </div>
            )
          })
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2 px-3 sm:px-5">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-foreground)]">Other documents</h3>
            <p className="text-[11px] text-[var(--color-muted)]">
              National ID, residence permit, insurance, and more.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => onChangeOtherDocuments([...otherDocuments, emptyOtherDoc()])}
          >
            <Plus className="h-3.5 w-3.5" />
            Add document
          </Button>
        </div>

        {otherDocuments.length === 0 ? (
          <p className="px-3 text-xs text-[var(--color-muted)] sm:px-5">No other documents yet.</p>
        ) : (
          otherDocuments.map((doc, index) => (
            <div
              key={doc.id}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)]/70 bg-[var(--color-surface)]"
            >
              <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)]/50 px-3 py-2 sm:px-5">
                <span className="text-xs font-semibold text-[var(--color-foreground)]">
                  {TRAVELER_OTHER_DOCUMENT_KIND_LABELS[doc.kind]} {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[var(--color-danger)]"
                  onClick={() =>
                    setPendingDelete({
                      kind: 'other',
                      id: doc.id,
                      label: doc.label || TRAVELER_OTHER_DOCUMENT_KIND_LABELS[doc.kind],
                    })
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <TravelerPicklistField
                label="Document type"
                value={doc.kind}
                options={enumOptions(TRAVELER_OTHER_DOCUMENT_KINDS, TRAVELER_OTHER_DOCUMENT_KIND_LABELS)}
                onChange={(value) =>
                  updateOther(doc.id, { kind: (value as TravelerOtherDocument['kind']) ?? 'other' })
                }
              />
              <TravelerTextField
                label="Label"
                value={doc.label}
                onChange={(value) => updateOther(doc.id, { label: value })}
              />
              <TravelerTextField
                label="Number"
                value={doc.number}
                onChange={(value) => updateOther(doc.id, { number: value })}
              />
              <TravelerPicklistField
                label="Country"
                value={doc.country}
                options={countryOptions}
                onChange={(value) => updateOther(doc.id, { country: value })}
              />
              <TravelerDateField
                label="Issue date"
                value={doc.issueDate}
                onChange={(value) => updateOther(doc.id, { issueDate: value })}
              />
              <TravelerDateField
                label="Expiry date"
                value={doc.expiryDate}
                onChange={(value) => updateOther(doc.id, { expiryDate: value })}
              />
              <div className="border-b border-[var(--color-border)]/40 px-3 py-3 sm:px-5">
                <TravelerFileUploadField
                  label="Attachment"
                  value={doc.attachment}
                  onChange={(attachment) => updateOther(doc.id, { attachment })}
                />
              </div>
              <TravelerNotesField
                label="Notes"
                value={doc.notes}
                onChange={(value) => updateOther(doc.id, { notes: value })}
              />
            </div>
          ))
        )}
      </section>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
        variant="danger"
        entityType="Document"
        title="Delete document"
        description="This permanently removes the document record and any uploaded copy from the profile."
        meta={pendingDelete ? [{ label: 'Document', value: pendingDelete.label }] : []}
        confirmLabel="Delete document"
        onConfirm={confirmDelete}
      />
    </div>
  )
}
