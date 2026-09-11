import { DATE_PICKER_KEYBOARD_HINT } from '@/design-system/components/DatePickerField'
import { CrmFieldGrid, CrmInputCell } from '@/design-system/layout/CrmPanel'
import {
  ClientAccountManagerField,
  ClientFormDatePicker,
  ClientGenderField,
  FormField,
} from '@/features/clients/components/client-form-ui'
import { clientFormRow3Class } from '@/features/clients/components/client-form-shared'
import { useClientFormProfileLayout } from '@/features/clients/components/client-form-profile-layout-context'
import { ProfileInput } from '@/features/clients/components/profile/ProfileCrmFieldRow'
import { formatClientAge } from '@/domain/entities/client'
import type { ClientFormInput } from '@/features/clients/hooks/use-client-mutations'

type OnChange = <K extends keyof ClientFormInput>(key: K, value: ClientFormInput[K]) => void

const todayIso = new Date().toISOString().slice(0, 10)

function ageHint(dateOfBirth?: string) {
  if (formatClientAge(dateOfBirth)) return undefined
  return 'Calculated automatically when a date is selected'
}

function ClientAgeDisplay({ dateOfBirth, disabled }: { dateOfBirth?: string; disabled?: boolean }) {
  return (
    <ProfileInput
      value={formatClientAge(dateOfBirth)}
      readOnly
      tabIndex={-1}
      placeholder="—"
      disabled={disabled}
      aria-readonly
    />
  )
}

function DemographicsFields({
  form,
  onChange,
  disabled,
  variant,
}: {
  form: ClientFormInput
  onChange: OnChange
  disabled?: boolean
  variant: 'form' | 'panel' | 'profile'
}) {
  const isProfileLayout = useClientFormProfileLayout()
  const useFormFields = variant === 'form' || variant === 'profile' || isProfileLayout

  const dateOfBirthField =
    useFormFields ? (
      <FormField label="Date of birth" optional hint={DATE_PICKER_KEYBOARD_HINT} fieldKey="dateOfBirth">
        <ClientFormDatePicker
          value={form.dateOfBirth ?? ''}
          onChange={(value) => onChange('dateOfBirth', value || undefined)}
          max={todayIso}
          disabled={disabled}
          aria-label="Date of birth"
        />
      </FormField>
    ) : (
      <CrmInputCell label="Date of birth" optional hint={DATE_PICKER_KEYBOARD_HINT}>
        <ClientFormDatePicker
          value={form.dateOfBirth ?? ''}
          onChange={(value) => onChange('dateOfBirth', value || undefined)}
          max={todayIso}
          disabled={disabled}
          aria-label="Date of birth"
        />
      </CrmInputCell>
    )

  const ageField =
    useFormFields ? (
      <FormField label="Age" optional hint={ageHint(form.dateOfBirth)} fieldKey="dateOfBirth">
        <ClientAgeDisplay dateOfBirth={form.dateOfBirth} disabled={disabled} />
      </FormField>
    ) : (
      <CrmInputCell label="Age" optional hint={ageHint(form.dateOfBirth)}>
        <ClientAgeDisplay dateOfBirth={form.dateOfBirth} disabled={disabled} />
      </CrmInputCell>
    )

  const genderField =
    useFormFields ? (
      <FormField label="Gender" optional fieldKey={isProfileLayout ? undefined : 'gender'}>
        <ClientGenderField
          value={form.gender}
          onChange={(value) => onChange('gender', value)}
          disabled={disabled}
        />
      </FormField>
    ) : (
      <CrmInputCell label="Gender" optional>
        <ClientGenderField
          value={form.gender}
          onChange={(value) => onChange('gender', value)}
          disabled={disabled}
        />
      </CrmInputCell>
    )

  if (useFormFields) {
    const fields = (
      <>
        {dateOfBirthField}
        {ageField}
        {genderField}
      </>
    )
    if (variant === 'profile' || isProfileLayout) return fields
    return <div className={clientFormRow3Class}>{fields}</div>
  }

  return (
    <div className="grid min-w-0 grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0 divide-[var(--color-border)]">
      {dateOfBirthField}
      {ageField}
      {genderField}
    </div>
  )
}

export function IndividualDemographicsFields({
  form,
  onChange,
  disabled,
  layout,
}: {
  form: ClientFormInput
  onChange: OnChange
  disabled?: boolean
  layout: 'form' | 'panel' | 'profile'
}) {
  return (
    <DemographicsFields
      form={form}
      onChange={onChange}
      disabled={disabled}
      variant={layout === 'panel' ? 'panel' : layout === 'profile' ? 'profile' : 'form'}
    />
  )
}

export function IndividualProfileDetailsFields({
  form,
  onChange,
  disabled,
  layout,
  includeAccountManager = true,
}: {
  form: ClientFormInput
  onChange: OnChange
  disabled?: boolean
  layout: 'form' | 'panel' | 'profile'
  includeAccountManager?: boolean
}) {
  if (layout === 'form' || layout === 'profile') {
    return (
      <div className={layout === 'profile' ? undefined : 'space-y-3'}>
        <DemographicsFields
          form={form}
          onChange={onChange}
          disabled={disabled}
          variant={layout === 'profile' ? 'profile' : 'form'}
        />
        {includeAccountManager ? (
          <FormField label="Account manager" hint="Internal owner for this client" fieldKey="accountManagerId">
            <ClientAccountManagerField
              value={form.accountManagerId}
              onChange={(value) => onChange('accountManagerId', value)}
              disabled={disabled}
            />
          </FormField>
        ) : null}
      </div>
    )
  }

  return (
    <>
      <DemographicsFields form={form} onChange={onChange} disabled={disabled} variant="panel" />
      {includeAccountManager ? (
        <CrmFieldGrid columns={2}>
          <CrmInputCell label="Account manager" hint="Internal owner for this client">
            <ClientAccountManagerField
              value={form.accountManagerId}
              onChange={(value) => onChange('accountManagerId', value)}
              disabled={disabled}
            />
          </CrmInputCell>
        </CrmFieldGrid>
      ) : null}
    </>
  )
}
