import { ProfileInput } from '@/features/clients/components/profile/ProfileCrmFieldRow'
import { CrmFieldGrid, CrmInputCell, CrmPanel } from '@/design-system/layout/CrmPanel'
import {
  isClientCommercialRegistrationProvided,
  isClientTaxRegistrationProvided,
  patchClientCommercialRegistration,
  patchClientTaxRegistration,
  type ClientCommercialRegistration,
  type ClientTaxRegistration,
} from '@/domain/entities/client-commercial'
import {
  ClientFormStepLayout,
} from '@/features/clients/components/client-form-shared'
import { ClientFormDatePicker, FormField, SegmentedField } from '@/features/clients/components/client-form-ui'
import { useClientFormProfileLayout } from '@/features/clients/components/client-form-profile-layout-context'
import type { ClientFormInput } from '@/features/clients/hooks/use-client-mutations'

type OnChange = <K extends keyof ClientFormInput>(key: K, value: ClientFormInput[K]) => void

const AVAILABILITY_OPTIONS = [
  { value: 'yes', label: 'Available' },
  { value: 'no', label: 'Not available' },
] as const

function OptionalDocumentAvailabilityField({
  label,
  available,
  onChange,
  disabled,
  fieldKey,
}: {
  label: string
  available: boolean
  onChange: (available: boolean) => void
  disabled?: boolean
  fieldKey?: string
}) {
  return (
    <FormField label={label} fieldKey={fieldKey}>
      <SegmentedField
        aria-label={label}
        value={available ? 'yes' : 'no'}
        onChange={(value) => onChange(value === 'yes')}
        disabled={disabled}
        options={[...AVAILABILITY_OPTIONS]}
      />
    </FormField>
  )
}

function CommercialRegistrationFields({
  registration,
  onPatch,
  disabled,
  layout,
}: {
  registration: ClientCommercialRegistration
  onPatch: (patch: Partial<ClientCommercialRegistration>) => void
  disabled?: boolean
  layout: 'compact' | 'panel'
}) {
  const isProfileLayout = useClientFormProfileLayout()

  if (layout === 'compact') {
    const fields = (
      <>
        <FormField label="Registration number" fieldKey="commercialRegistration">
          <ProfileInput
            value={registration.registrationNumber ?? ''}
            onChange={(event) => onPatch({ registrationNumber: event.target.value })}
            placeholder="e.g. 123456"
            disabled={disabled}
          />
        </FormField>
        <FormField label="Registered name" fieldKey="commercialRegistration">
          <ProfileInput
            value={registration.registeredName ?? ''}
            onChange={(event) => onPatch({ registeredName: event.target.value })}
            placeholder="Legal name on register"
            disabled={disabled}
          />
        </FormField>
        <FormField label="Issuing authority" fieldKey="commercialRegistration">
          <ProfileInput
            value={registration.issuingAuthority ?? ''}
            onChange={(event) => onPatch({ issuingAuthority: event.target.value })}
            placeholder="e.g. GAFI, Chamber of Commerce"
            disabled={disabled}
          />
        </FormField>
        <FormField label="Issue date" fieldKey="commercialRegistration">
          <ClientFormDatePicker
            value={registration.issuedDate ?? ''}
            onChange={(value) => onPatch({ issuedDate: value || undefined })}
            disabled={disabled}
            aria-label="Commercial registration issue date"
          />
        </FormField>
        <FormField label="Expiry date" fieldKey="commercialRegistration">
          <ClientFormDatePicker
            value={registration.expiresDate ?? ''}
            onChange={(value) => onPatch({ expiresDate: value || undefined })}
            min={registration.issuedDate}
            disabled={disabled}
            aria-label="Commercial registration expiry date"
          />
        </FormField>
        <FormField label="Registered address" fieldKey="commercialRegistration">
          <ProfileInput
            value={registration.registeredAddress ?? ''}
            onChange={(event) => onPatch({ registeredAddress: event.target.value })}
            placeholder="Address on commercial register"
            disabled={disabled}
          />
        </FormField>
      </>
    )

    if (isProfileLayout) return fields
    return <div className="grid min-w-0 grid-cols-1 gap-3.5 sm:grid-cols-2">{fields}</div>
  }

  return (
    <CrmFieldGrid columns={2}>
      <CrmInputCell label="Registration number">
        <ProfileInput
          value={registration.registrationNumber ?? ''}
          onChange={(event) => onPatch({ registrationNumber: event.target.value })}
          placeholder="e.g. 123456"
          disabled={disabled}
        />
      </CrmInputCell>
      <CrmInputCell label="Registered name">
        <ProfileInput
          value={registration.registeredName ?? ''}
          onChange={(event) => onPatch({ registeredName: event.target.value })}
          placeholder="Legal name on register"
          disabled={disabled}
        />
      </CrmInputCell>
      <CrmInputCell label="Issuing authority">
        <ProfileInput
          value={registration.issuingAuthority ?? ''}
          onChange={(event) => onPatch({ issuingAuthority: event.target.value })}
          placeholder="e.g. GAFI, Chamber of Commerce"
          disabled={disabled}
        />
      </CrmInputCell>
      <CrmInputCell label="Issue date">
        <ClientFormDatePicker
          value={registration.issuedDate ?? ''}
          onChange={(value) => onPatch({ issuedDate: value || undefined })}
          disabled={disabled}
          aria-label="Commercial registration issue date"
        />
      </CrmInputCell>
      <CrmInputCell label="Expiry date">
        <ClientFormDatePicker
          value={registration.expiresDate ?? ''}
          onChange={(value) => onPatch({ expiresDate: value || undefined })}
          min={registration.issuedDate}
          disabled={disabled}
          aria-label="Commercial registration expiry date"
        />
      </CrmInputCell>
      <CrmInputCell label="Registered address" className="sm:col-span-2">
        <ProfileInput
          value={registration.registeredAddress ?? ''}
          onChange={(event) => onPatch({ registeredAddress: event.target.value })}
          placeholder="Address on commercial register"
          disabled={disabled}
        />
      </CrmInputCell>
    </CrmFieldGrid>
  )
}

function TaxRegistrationFields({
  registration,
  onPatch,
  disabled,
  layout,
}: {
  registration: ClientTaxRegistration
  onPatch: (patch: Partial<ClientTaxRegistration>) => void
  disabled?: boolean
  layout: 'compact' | 'panel'
}) {
  const isProfileLayout = useClientFormProfileLayout()

  if (layout === 'compact') {
    const fields = (
      <>
        <FormField label="Tax ID" fieldKey="taxRegistration">
          <ProfileInput
            value={registration.taxId ?? ''}
            onChange={(event) => onPatch({ taxId: event.target.value })}
            placeholder="TIN / VAT number"
            disabled={disabled}
          />
        </FormField>
        <FormField label="Card number" fieldKey="taxRegistration">
          <ProfileInput
            value={registration.cardNumber ?? ''}
            onChange={(event) => onPatch({ cardNumber: event.target.value })}
            placeholder="Tax card number"
            disabled={disabled}
          />
        </FormField>
        <FormField label="Registered name" fieldKey="taxRegistration">
          <ProfileInput
            value={registration.registeredName ?? ''}
            onChange={(event) => onPatch({ registeredName: event.target.value })}
            placeholder="Name on tax card"
            disabled={disabled}
          />
        </FormField>
        <FormField label="Issuing authority" fieldKey="taxRegistration">
          <ProfileInput
            value={registration.issuingAuthority ?? ''}
            onChange={(event) => onPatch({ issuingAuthority: event.target.value })}
            placeholder="e.g. Egyptian Tax Authority"
            disabled={disabled}
          />
        </FormField>
        <FormField label="Issue date" fieldKey="taxRegistration">
          <ClientFormDatePicker
            value={registration.issuedDate ?? ''}
            onChange={(value) => onPatch({ issuedDate: value || undefined })}
            disabled={disabled}
            aria-label="Tax card issue date"
          />
        </FormField>
        <FormField label="Expiry date" fieldKey="taxRegistration">
          <ClientFormDatePicker
            value={registration.expiresDate ?? ''}
            onChange={(value) => onPatch({ expiresDate: value || undefined })}
            min={registration.issuedDate}
            disabled={disabled}
            aria-label="Tax card expiry date"
          />
        </FormField>
        <FormField label="Activity code" fieldKey="taxRegistration">
          <ProfileInput
            value={registration.activityCode ?? ''}
            onChange={(event) => onPatch({ activityCode: event.target.value })}
            placeholder="Branch or activity code"
            disabled={disabled}
          />
        </FormField>
      </>
    )

    if (isProfileLayout) return fields
    return <div className="grid min-w-0 grid-cols-1 gap-3.5 sm:grid-cols-2">{fields}</div>
  }

  return (
    <CrmFieldGrid columns={2}>
      <CrmInputCell label="Tax ID">
        <ProfileInput
          value={registration.taxId ?? ''}
          onChange={(event) => onPatch({ taxId: event.target.value })}
          placeholder="TIN / VAT number"
          disabled={disabled}
        />
      </CrmInputCell>
      <CrmInputCell label="Card number">
        <ProfileInput
          value={registration.cardNumber ?? ''}
          onChange={(event) => onPatch({ cardNumber: event.target.value })}
          placeholder="Tax card number"
          disabled={disabled}
        />
      </CrmInputCell>
      <CrmInputCell label="Registered name">
        <ProfileInput
          value={registration.registeredName ?? ''}
          onChange={(event) => onPatch({ registeredName: event.target.value })}
          placeholder="Name on tax card"
          disabled={disabled}
        />
      </CrmInputCell>
      <CrmInputCell label="Issuing authority">
        <ProfileInput
          value={registration.issuingAuthority ?? ''}
          onChange={(event) => onPatch({ issuingAuthority: event.target.value })}
          placeholder="e.g. Egyptian Tax Authority"
          disabled={disabled}
        />
      </CrmInputCell>
      <CrmInputCell label="Issue date">
        <ClientFormDatePicker
          value={registration.issuedDate ?? ''}
          onChange={(value) => onPatch({ issuedDate: value || undefined })}
          disabled={disabled}
          aria-label="Tax card issue date"
        />
      </CrmInputCell>
      <CrmInputCell label="Expiry date">
        <ClientFormDatePicker
          value={registration.expiresDate ?? ''}
          onChange={(value) => onPatch({ expiresDate: value || undefined })}
          min={registration.issuedDate}
          disabled={disabled}
          aria-label="Tax card expiry date"
        />
      </CrmInputCell>
      <CrmInputCell label="Activity code">
        <ProfileInput
          value={registration.activityCode ?? ''}
          onChange={(event) => onPatch({ activityCode: event.target.value })}
          placeholder="Branch or activity code"
          disabled={disabled}
        />
      </CrmInputCell>
    </CrmFieldGrid>
  )
}

export function CorporateCommercialFormFields({
  form,
  onChange,
  disabled,
  compact,
  section,
}: {
  form: ClientFormInput
  onChange: OnChange
  disabled?: boolean
  compact?: boolean
  section?: boolean
}) {
  const commercialRegistration = form.commercialRegistration
  const taxRegistration = form.taxRegistration
  const fieldLayout = compact ? 'compact' : 'panel'
  const commercialAvailable = isClientCommercialRegistrationProvided(commercialRegistration) || commercialRegistration != null
  const taxAvailable = isClientTaxRegistrationProvided(taxRegistration) || taxRegistration != null

  const patchCommercial = (patch: Partial<ClientCommercialRegistration>) => {
    onChange(
      'commercialRegistration',
      patchClientCommercialRegistration(commercialRegistration, patch),
    )
  }

  const patchTax = (patch: Partial<ClientTaxRegistration>) => {
    onChange('taxRegistration', patchClientTaxRegistration(taxRegistration, patch))
  }

  const handleCommercialAvailability = (available: boolean) => {
    onChange('commercialRegistration', available ? commercialRegistration ?? {} : undefined)
  }

  const handleTaxAvailability = (available: boolean) => {
    onChange('taxRegistration', available ? taxRegistration ?? {} : undefined)
  }

  if (section) {
    const fieldLayout = 'panel' as const
    return (
      <div className="divide-y divide-[var(--color-border)]">
        <div className="space-y-3 px-4 py-3.5">
          <OptionalDocumentAvailabilityField
            label="Commercial register"
            available={commercialAvailable}
            onChange={handleCommercialAvailability}
            disabled={disabled}
          />
          {commercialAvailable ? (
            <CommercialRegistrationFields
              registration={commercialRegistration ?? {}}
              onPatch={patchCommercial}
              disabled={disabled}
              layout={fieldLayout}
            />
          ) : null}
        </div>
        <div className="space-y-3 px-4 py-3.5">
          <OptionalDocumentAvailabilityField
            label="Tax card"
            available={taxAvailable}
            onChange={handleTaxAvailability}
            disabled={disabled}
          />
          {taxAvailable ? (
            <TaxRegistrationFields
              registration={taxRegistration ?? {}}
              onPatch={patchTax}
              disabled={disabled}
              layout={fieldLayout}
            />
          ) : null}
        </div>
      </div>
    )
  }

  if (compact) {
    return (
      <ClientFormStepLayout>
        <OptionalDocumentAvailabilityField
          label="Commercial register"
          available={commercialAvailable}
          onChange={handleCommercialAvailability}
          disabled={disabled}
          fieldKey="commercialRegistration"
        />
        {commercialAvailable ? (
          <CommercialRegistrationFields
            registration={commercialRegistration ?? {}}
            onPatch={patchCommercial}
            disabled={disabled}
            layout={fieldLayout}
          />
        ) : null}

        <OptionalDocumentAvailabilityField
          label="Tax card"
          available={taxAvailable}
          onChange={handleTaxAvailability}
          disabled={disabled}
          fieldKey="taxRegistration"
        />
        {taxAvailable ? (
          <TaxRegistrationFields
            registration={taxRegistration ?? {}}
            onPatch={patchTax}
            disabled={disabled}
            layout={fieldLayout}
          />
        ) : null}
      </ClientFormStepLayout>
    )
  }

  return (
    <CrmPanel title="Commercial information">
      <div className="space-y-4">
        <OptionalDocumentAvailabilityField
          label="Commercial register"
          available={commercialAvailable}
          onChange={handleCommercialAvailability}
          disabled={disabled}
          fieldKey="commercialRegistration"
        />
        {commercialAvailable ? (
          <CommercialRegistrationFields
            registration={commercialRegistration ?? {}}
            onPatch={patchCommercial}
            disabled={disabled}
            layout={fieldLayout}
          />
        ) : null}

        <OptionalDocumentAvailabilityField
          label="Tax card"
          available={taxAvailable}
          onChange={handleTaxAvailability}
          disabled={disabled}
          fieldKey="taxRegistration"
        />
        {taxAvailable ? (
          <TaxRegistrationFields
            registration={taxRegistration ?? {}}
            onPatch={patchTax}
            disabled={disabled}
            layout={fieldLayout}
          />
        ) : null}
      </div>
    </CrmPanel>
  )
}
