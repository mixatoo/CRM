import { ProfileInput } from '@/features/clients/components/profile/ProfileCrmFieldRow'
import { ClientFormPicklist } from '@/features/clients/components/client-form-ui'
import { CrmFieldGrid, CrmInputCell, CrmPanel } from '@/design-system/layout/CrmPanel'
import type { ReactNode } from 'react'
import type { ClientFormInput } from '@/features/clients/hooks/use-client-mutations'
import { DATE_PICKER_KEYBOARD_HINT } from '@/design-system/components/DatePickerField'
import {
  ClientAccountManagerField,
  ClientAcquisitionChannelField,
  ClientAcquisitionSourceField,
  ClientFormDatePicker,
  FormField,
} from '@/features/clients/components/client-form-ui'
import {
  getCityPicklistOptions,
  getCountryPicklistOptions,
  isCityValidForCountry,
  resolveCountryName,
} from '@/domain/catalog/location-utils'
import {
  CLIENT_ACQUISITION_SOURCE_LABELS,
  CLIENT_JOINED_COMPANY_LABEL,
  resolveClientAcquisitionPair,
} from '@/domain/entities/client'
import { toTitleCase } from '@/shared/utils/text-format'
import { cn } from '@/shared/utils/cn'
import { useMemo } from 'react'
import { useClientFormProfileLayout } from '@/features/clients/components/client-form-profile-layout-context'

export function FormStepCluster({ children, className }: { children: ReactNode; className?: string }) {
  const isProfileLayout = useClientFormProfileLayout()
  if (isProfileLayout) return <>{children}</>
  return <div className={cn('space-y-3.5', className)}>{children}</div>
}

export function ClientFormStepLayout({ children }: { children: ReactNode }) {
  const isProfileLayout = useClientFormProfileLayout()
  if (isProfileLayout) return <>{children}</>
  return <div className="flex flex-col gap-3.5">{children}</div>
}

const clientFormRowClass = 'grid min-w-0 grid-cols-2 gap-3'
export const clientFormRow3Class = 'grid min-w-0 grid-cols-3 gap-3'

export function applyTitleCaseOnBlur(value: string, onFormatted: (value: string) => void) {
  const formatted = toTitleCase(value)
  if (formatted !== value) onFormatted(formatted)
}

function CountryCityFields({
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
  const country = resolveCountryName(form.country)
  const countryOptions = useMemo(() => getCountryPicklistOptions(), [])
  const cityOptions = useMemo(
    () => getCityPicklistOptions(country, form.city),
    [country, form.city],
  )

  const picklistQuickAdd = { allowQuickAdd: true, formatQuickAdd: toTitleCase } as const
  const isProfileLayout = useClientFormProfileLayout()

  const handleCountryChange = (value: string) => {
    onChange('country', value)
    if (form.city && !isCityValidForCountry(value, form.city)) {
      onChange('city', '')
    }
  }

  if (section) {
    return (
      <>
        <CrmInputCell label="Country">
          <ClientFormPicklist
            value={country}
            onChange={handleCountryChange}
            options={countryOptions}
            placeholder="Select country"
            emptyOption={{ value: '', label: 'Select country' }}
            ariaLabel="Country"
            disabled={disabled}
            searchable
            searchPlaceholder="Search countries…"
            {...picklistQuickAdd}
          />
        </CrmInputCell>
        <CrmInputCell label="City">
          <ClientFormPicklist
            value={form.city ?? ''}
            onChange={(value) => onChange('city', value)}
            options={cityOptions}
            placeholder={country ? 'Select city' : 'Select country first'}
            emptyOption={{ value: '', label: 'Select city' }}
            ariaLabel="City"
            disabled={disabled || !country}
            searchable
            searchPlaceholder="Search cities…"
            {...picklistQuickAdd}
          />
        </CrmInputCell>
      </>
    )
  }

  if (compact) {
    const countryCityFields = (
      <>
        <FormField label="Country" fieldKey="country">
          <ClientFormPicklist
            value={country}
            onChange={handleCountryChange}
            options={countryOptions}
            placeholder="Select country"
            emptyOption={{ value: '', label: 'Select country' }}
            ariaLabel="Country"
            disabled={disabled}
            searchable
            searchPlaceholder="Search countries…"
            {...picklistQuickAdd}
          />
        </FormField>
        <FormField label="City" fieldKey="city">
          <ClientFormPicklist
            value={form.city ?? ''}
            onChange={(value) => onChange('city', value)}
            options={cityOptions}
            placeholder={country ? 'Select city' : 'Select country first'}
            emptyOption={{ value: '', label: 'Select city' }}
            ariaLabel="City"
            disabled={disabled || !country}
            searchable
            searchPlaceholder="Search cities…"
            {...picklistQuickAdd}
          />
        </FormField>
      </>
    )

    if (isProfileLayout) return countryCityFields

    return <div className="grid gap-4 sm:grid-cols-2">{countryCityFields}</div>
  }

  return (
    <>
      <CrmInputCell label="Country">
        <ClientFormPicklist
          value={country}
          onChange={handleCountryChange}
          options={countryOptions}
          placeholder="Select country"
          emptyOption={{ value: '', label: 'Select country' }}
          ariaLabel="Country"
          disabled={disabled}
          searchable
          searchPlaceholder="Search countries…"
          {...picklistQuickAdd}
        />
      </CrmInputCell>
      <CrmInputCell label="City">
        <ClientFormPicklist
          value={form.city ?? ''}
          onChange={(value) => onChange('city', value)}
          options={cityOptions}
          placeholder={country ? 'Select city' : 'Select country first'}
          emptyOption={{ value: '', label: 'Select city' }}
          ariaLabel="City"
          disabled={disabled || !country}
          searchable
          searchPlaceholder="Search cities…"
          {...picklistQuickAdd}
        />
      </CrmInputCell>
    </>
  )
}

export function ContactFieldsBlock({
  form,
  onChange,
  disabled,
  compact,
  section,
  emailPlaceholder = 'name@email.com',
}: {
  form: ClientFormInput
  onChange: OnChange
  disabled?: boolean
  compact?: boolean
  section?: boolean
  emailPlaceholder?: string
}) {
  const isProfileLayout = useClientFormProfileLayout()

  if (section) {
    return (
      <CrmFieldGrid columns={2}>
        <CrmInputCell label="Email">
          <ProfileInput
            type="email"
            value={form.email ?? ''}
            onChange={(event) => onChange('email', event.target.value)}
            placeholder={emailPlaceholder}
            disabled={disabled}
          />
        </CrmInputCell>
        <CrmInputCell label="Phone">
          <ProfileInput
            type="tel"
            value={form.phone ?? ''}
            onChange={(event) => onChange('phone', event.target.value)}
            disabled={disabled}
          />
        </CrmInputCell>
        <CountryCityFields form={form} onChange={onChange} disabled={disabled} section />
        <CrmInputCell label="Address" className="sm:col-span-2">
          <ProfileInput
            value={form.address ?? ''}
            onChange={(event) => onChange('address', event.target.value)}
            disabled={disabled}
          />
        </CrmInputCell>
      </CrmFieldGrid>
    )
  }

  if (compact) {
    const emailField = (
      <FormField label="Email" fieldKey="email">
        <ProfileInput
          type="email"
          value={form.email ?? ''}
          onChange={(event) => onChange('email', event.target.value)}
          placeholder={emailPlaceholder}
          disabled={disabled}
          autoFocus={!isProfileLayout}
        />
      </FormField>
    )

    const phoneField = (
      <FormField label="Phone" fieldKey="phone">
        <ProfileInput
          type="tel"
          value={form.phone ?? ''}
          onChange={(event) => onChange('phone', event.target.value)}
          placeholder="+20 …"
          disabled={disabled}
        />
      </FormField>
    )

    const addressField = (
      <FormField label="Address" fieldKey="address">
        <ProfileInput
          value={form.address ?? ''}
          onChange={(event) => onChange('address', event.target.value)}
          placeholder="Street, district, postal code"
          disabled={disabled}
        />
      </FormField>
    )

    if (isProfileLayout) {
      return (
        <ClientFormStepLayout>
          {emailField}
          {phoneField}
          <CountryCityFields form={form} onChange={onChange} disabled={disabled} compact />
          {addressField}
        </ClientFormStepLayout>
      )
    }

    return (
      <ClientFormStepLayout>
        <div className="grid gap-3.5 sm:grid-cols-2">
          {emailField}
          {phoneField}
        </div>

        <FormStepCluster>
          <CountryCityFields form={form} onChange={onChange} disabled={disabled} compact />
          {addressField}
        </FormStepCluster>
      </ClientFormStepLayout>
    )
  }

  return (
    <CrmPanel title="Contact">
      <CrmFieldGrid columns={2}>
        <CrmInputCell label="Email">
          <ProfileInput
            type="email"
            value={form.email ?? ''}
            onChange={(event) => onChange('email', event.target.value)}
            disabled={disabled}
          />
        </CrmInputCell>
        <CrmInputCell label="Phone">
          <ProfileInput
            type="tel"
            value={form.phone ?? ''}
            onChange={(event) => onChange('phone', event.target.value)}
            disabled={disabled}
          />
        </CrmInputCell>
        <CountryCityFields form={form} onChange={onChange} disabled={disabled} />
        <CrmInputCell label="Address" className="sm:col-span-2">
          <ProfileInput
            value={form.address ?? ''}
            onChange={(event) => onChange('address', event.target.value)}
            disabled={disabled}
          />
        </CrmInputCell>
      </CrmFieldGrid>
    </CrmPanel>
  )
}

export function AcquisitionFieldsBlock({
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
  const isProfileLayout = useClientFormProfileLayout()

  const handleSourceChange = (source: ClientFormInput['acquisitionSource']) => {
    const resolved = resolveClientAcquisitionPair(source, form.acquisitionChannel)
    onChange('acquisitionSource', resolved.acquisitionSource)
    onChange('acquisitionChannel', resolved.acquisitionChannel)
  }

  const fields = (
    <>
      <FormField label="Source" fieldKey="acquisitionSource">
        <ClientAcquisitionSourceField
          value={form.acquisitionSource}
          onChange={handleSourceChange}
          disabled={disabled}
        />
      </FormField>
      <FormField label="Channel" fieldKey="acquisitionChannel">
        <ClientAcquisitionChannelField
          source={form.acquisitionSource}
          value={form.acquisitionChannel}
          onChange={(value) => onChange('acquisitionChannel', value)}
          disabled={disabled}
        />
      </FormField>
    </>
  )

  if (section) {
    return (
      <>
        <CrmInputCell label="Source" hint="Primary category — where the client came from">
          <ClientAcquisitionSourceField
            value={form.acquisitionSource}
            onChange={handleSourceChange}
            disabled={disabled}
          />
        </CrmInputCell>
        <CrmInputCell
          label="Channel"
          hint={
            form.acquisitionSource
              ? `Sub-category within ${CLIENT_ACQUISITION_SOURCE_LABELS[form.acquisitionSource]}`
              : 'Pick a source first'
          }
        >
          <ClientAcquisitionChannelField
            source={form.acquisitionSource}
            value={form.acquisitionChannel}
            onChange={(value) => onChange('acquisitionChannel', value)}
            disabled={disabled}
          />
        </CrmInputCell>
      </>
    )
  }

  if (compact) {
    if (isProfileLayout) return fields
    return <div className={clientFormRowClass}>{fields}</div>
  }

  return (
    <CrmFieldGrid columns={2}>
      <CrmInputCell label="Source" hint="Primary category — where the client came from">
        <ClientAcquisitionSourceField
          value={form.acquisitionSource}
          onChange={handleSourceChange}
          disabled={disabled}
        />
      </CrmInputCell>
      <CrmInputCell
        label="Channel"
        hint={
          form.acquisitionSource
            ? `Sub-category within ${CLIENT_ACQUISITION_SOURCE_LABELS[form.acquisitionSource]}`
            : 'Pick a source first'
        }
      >
        <ClientAcquisitionChannelField
          source={form.acquisitionSource}
          value={form.acquisitionChannel}
          onChange={(value) => onChange('acquisitionChannel', value)}
          disabled={disabled}
        />
      </CrmInputCell>
    </CrmFieldGrid>
  )
}

export function AccountManagerFieldBlock({
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
  if (section) {
    return (
      <CrmInputCell label="Account manager" hint="Internal owner for this client" className="sm:col-span-2">
        <ClientAccountManagerField
          value={form.accountManagerId}
          onChange={(value) => onChange('accountManagerId', value)}
          disabled={disabled}
        />
      </CrmInputCell>
    )
  }

  if (compact) {
    return (
      <FormField label="Account manager" fieldKey="accountManagerId">
        <ClientAccountManagerField
          value={form.accountManagerId}
          onChange={(value) => onChange('accountManagerId', value)}
          disabled={disabled}
        />
      </FormField>
    )
  }

  return (
    <CrmFieldGrid columns={2}>
      <CrmInputCell label="Account manager" hint="Internal owner for this client" className="sm:col-span-2">
        <ClientAccountManagerField
          value={form.accountManagerId}
          onChange={(value) => onChange('accountManagerId', value)}
          disabled={disabled}
        />
      </CrmInputCell>
    </CrmFieldGrid>
  )
}

export function ProfileAcquisitionAssignmentFields({
  form,
  onChange,
  disabled,
}: {
  form: ClientFormInput
  onChange: OnChange
  disabled?: boolean
}) {
  return (
    <>
      <AcquisitionFieldsBlock form={form} onChange={onChange} disabled={disabled} compact />
      <AccountManagerFieldBlock form={form} onChange={onChange} disabled={disabled} compact />
    </>
  )
}

const todayIso = new Date().toISOString().slice(0, 10)

export function ClientJoinedAtFieldBlock({
  form,
  onChange,
  disabled,
  variant,
}: {
  form: ClientFormInput
  onChange: OnChange
  disabled?: boolean
  variant: 'form' | 'panel'
}) {
  const joinedAt = form.joinedAt ?? ''

  if (variant === 'form') {
    return (
      <FormField
        label={CLIENT_JOINED_COMPANY_LABEL}
        hint={`When this account joined the company. ${DATE_PICKER_KEYBOARD_HINT}`}
        fieldKey="joinedAt"
      >
        <ClientFormDatePicker
          value={joinedAt}
          onChange={(value) => onChange('joinedAt', value || undefined)}
          disabled={disabled}
          max={todayIso}
        />
      </FormField>
    )
  }

  return (
    <CrmInputCell
      label={CLIENT_JOINED_COMPANY_LABEL}
      hint={`When this account joined the company. ${DATE_PICKER_KEYBOARD_HINT}`}
    >
      <ClientFormDatePicker
        value={joinedAt}
        onChange={(value) => onChange('joinedAt', value || undefined)}
        disabled={disabled}
        max={todayIso}
      />
    </CrmInputCell>
  )
}
