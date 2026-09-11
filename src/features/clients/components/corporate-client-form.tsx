import { CorporateCommercialFormFields } from '@/features/clients/components/CorporateCommercialFormFields'
import { ProfileInput } from '@/features/clients/components/profile/ProfileCrmFieldRow'
import { requiredFieldControlProps } from '@/design-system/components/FieldLabel'
import { CrmFieldGrid, CrmInputCell, CrmPanel } from '@/design-system/layout/CrmPanel'
import type { ClientFormInput } from '@/features/clients/hooks/use-client-mutations'
import {
  ClientAccountManagerField,
  ClientIndustryField,
  ClientStatusField,
  ClientTypeField,
  FormField,
  type ClientFormStepId,
} from '@/features/clients/components/client-form-ui'
import { FinancialFieldsBlock } from '@/features/clients/components/FinancialFormFields'
import {
  ContactFieldsBlock,
  AcquisitionFieldsBlock,
  ClientFormStepLayout,
  ProfileAcquisitionAssignmentFields,
  applyTitleCaseOnBlur,
  ClientJoinedAtFieldBlock,
} from '@/features/clients/components/client-form-shared'
import { MembershipFieldsBlock } from '@/features/clients/components/membership/MembershipFormFields'
import {
  createSlaPatchHandler,
  SlaAgreementFormFields,
} from '@/features/clients/components/sla/SlaAgreementFormFields'
import type { SlaValidationErrors } from '@/features/clients/components/sla/sla-validation'
import type { ClientType } from '@/domain/entities/client'

type OnChange = <K extends keyof ClientFormInput>(key: K, value: ClientFormInput[K]) => void

interface CorporateClientFormProps {
  form: ClientFormInput
  onChange: OnChange
  onPatch?: (patch: Partial<ClientFormInput>) => void
  disabled?: boolean
  showStatus?: boolean
  showJoinedAt?: boolean
  showNameHint?: boolean
  layout: 'panels' | 'step' | 'section' | 'profile'
  step?: ClientFormStepId
  lockClientType?: boolean
  showSlaErrors?: boolean
  slaErrors?: SlaValidationErrors
}

function CorporateProfileFields({
  form,
  onChange,
  disabled,
  compact,
  section,
  showStatus,
  showJoinedAt,
  showNameHint,
  onTypeChange,
  lockClientType,
}: {
  form: ClientFormInput
  onChange: OnChange
  disabled?: boolean
  compact?: boolean
  section?: boolean
  showStatus?: boolean
  showJoinedAt?: boolean
  showNameHint?: boolean
  onTypeChange: (type: ClientType) => void
  lockClientType?: boolean
}) {
  const companyRequired = requiredFieldControlProps(form.company, showNameHint, 'Legal or trading name')

  if (section) {
    return (
      <CrmFieldGrid columns={2}>
        <CrmInputCell label="Company name" required>
          <ProfileInput
            value={form.company ?? ''}
            onChange={(event) => onChange('company', event.target.value)}
            onBlur={() => applyTitleCaseOnBlur(form.company ?? '', (value) => onChange('company', value))}
            disabled={disabled}
            {...companyRequired}
          />
        </CrmInputCell>
        <CrmInputCell label="Industry">
          <ClientIndustryField
            value={form.industry}
            onChange={(value) => onChange('industry', value)}
            disabled={disabled}
          />
        </CrmInputCell>
        {showStatus ? (
          <CrmInputCell label="Status">
            <ClientStatusField
              value={form.status}
              onChange={(value) => onChange('status', value)}
              disabled={disabled}
            />
          </CrmInputCell>
        ) : null}
        {showJoinedAt ? (
          <ClientJoinedAtFieldBlock form={form} onChange={onChange} disabled={disabled} variant="panel" />
        ) : null}
        <AcquisitionFieldsBlock form={form} onChange={onChange} disabled={disabled} section />
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

  if (compact) {
    return (
      <ClientFormStepLayout>
        {!lockClientType ? (
          <FormField label="Client type" stacked>
            <ClientTypeField value={form.type} onChange={onTypeChange} disabled={disabled} />
          </FormField>
        ) : null}

        <FormField label="Company name" required fieldKey="company">
          <ProfileInput
            value={form.company ?? ''}
            onChange={(event) => onChange('company', event.target.value)}
            onBlur={() => applyTitleCaseOnBlur(form.company ?? '', (value) => onChange('company', value))}
            disabled={disabled}
            autoFocus
            {...requiredFieldControlProps(form.company, showNameHint, 'e.g. Acme Holdings')}
          />
        </FormField>
        <FormField label="Industry" fieldKey="industry">
          <ClientIndustryField
            value={form.industry}
            onChange={(value) => onChange('industry', value)}
            disabled={disabled}
          />
        </FormField>

        <ProfileAcquisitionAssignmentFields form={form} onChange={onChange} disabled={disabled} />

        {showStatus ? (
          <FormField label="Status" fieldKey="status">
            <ClientStatusField
              value={form.status}
              onChange={(value) => onChange('status', value)}
              disabled={disabled}
            />
          </FormField>
        ) : null}
        {showJoinedAt ? (
          <ClientJoinedAtFieldBlock form={form} onChange={onChange} disabled={disabled} variant="form" />
        ) : null}
      </ClientFormStepLayout>
    )
  }

  return (
    <CrmPanel title="Company profile">
      <CrmFieldGrid columns={2}>
        {!lockClientType ? (
          <CrmInputCell label="Type" className="sm:col-span-2">
            <ClientTypeField value={form.type} onChange={onTypeChange} disabled={disabled} />
          </CrmInputCell>
        ) : null}
        <CrmInputCell label="Company name" className={showStatus ? undefined : 'sm:col-span-2'}>
          <ProfileInput
            value={form.company ?? ''}
            onChange={(event) => onChange('company', event.target.value)}
            onBlur={() => applyTitleCaseOnBlur(form.company ?? '', (value) => onChange('company', value))}
            placeholder="Legal or trading name"
            disabled={disabled}
          />
        </CrmInputCell>
        {showStatus ? (
          <CrmInputCell label="Status">
            <ClientStatusField
              value={form.status}
              onChange={(value) => onChange('status', value)}
              disabled={disabled}
            />
          </CrmInputCell>
        ) : null}
        {showJoinedAt ? (
          <ClientJoinedAtFieldBlock form={form} onChange={onChange} disabled={disabled} variant="panel" />
        ) : null}
        <CrmInputCell label="Industry" className="sm:col-span-2">
          <ClientIndustryField
            value={form.industry}
            onChange={(value) => onChange('industry', value)}
            disabled={disabled}
          />
        </CrmInputCell>
      </CrmFieldGrid>
      <AcquisitionFieldsBlock form={form} onChange={onChange} disabled={disabled} />
      <CrmFieldGrid columns={2}>
        <CrmInputCell label="Account manager" hint="Internal owner for this client" className="sm:col-span-2">
          <ClientAccountManagerField
            value={form.accountManagerId}
            onChange={(value) => onChange('accountManagerId', value)}
            disabled={disabled}
          />
        </CrmInputCell>
      </CrmFieldGrid>
    </CrmPanel>
  )
}

export function CorporateClientForm({
  form,
  onChange,
  onPatch,
  disabled,
  showStatus = false,
  showJoinedAt = false,
  showNameHint,
  layout,
  step = 'basics',
  lockClientType,
  showSlaErrors,
  slaErrors,
}: CorporateClientFormProps) {
  const onTypeChange = (type: ClientType) => {
    if (onPatch) {
      onPatch({ type })
      return
    }
    onChange('type', type)
  }
  const patchForm =
    onPatch ??
    ((patch: Partial<ClientFormInput>) => {
      ;(Object.keys(patch) as Array<keyof ClientFormInput>).forEach((key) => {
        const value = patch[key]
        if (value !== undefined) onChange(key, value as ClientFormInput[typeof key])
      })
    })

  if (layout === 'step' || layout === 'section' || layout === 'profile') {
    const compact = layout === 'step' || layout === 'profile'
    const section = layout === 'section'
    const basicsShowStatus = section ? showStatus : false
    const basicsShowJoinedAt = showJoinedAt

    if (step === 'basics') {
      return (
        <CorporateProfileFields
          form={form}
          onChange={onChange}
          disabled={disabled}
          compact={compact}
          section={section}
          showStatus={basicsShowStatus}
          showJoinedAt={basicsShowJoinedAt}
          showNameHint={showNameHint}
          onTypeChange={onTypeChange}
          lockClientType={lockClientType}
        />
      )
    }
    if (step === 'contact') {
      return (
        <ContactFieldsBlock
          form={form}
          onChange={onChange}
          disabled={disabled}
          compact={compact}
          section={section}
          emailPlaceholder="name@company.com"
        />
      )
    }
    if (step === 'financial') {
      return (
        <FinancialFieldsBlock
          form={form}
          onChange={onChange}
          disabled={disabled}
          compact={compact}
          section={section}
        />
      )
    }
    if (step === 'membership') {
      return <MembershipFieldsBlock form={form} onPatch={patchForm} disabled={disabled} compact={compact} />
    }
    if (step === 'sla') {
      return (
        <SlaAgreementFormFields
          form={form}
          onChange={onChange}
          onPatchSla={createSlaPatchHandler(form, onChange)}
          disabled={disabled}
          compact={compact}
          section={section}
          showErrors={showSlaErrors}
          errors={slaErrors}
        />
      )
    }
    if (step === 'commercial') {
      return (
        <CorporateCommercialFormFields
          form={form}
          onChange={onChange}
          disabled={disabled}
          compact={compact}
          section={section}
        />
      )
    }
    return null
  }

  return (
    <div className="space-y-3">
      <CorporateProfileFields
        form={form}
        onChange={onChange}
        disabled={disabled}
        showStatus={showStatus}
        showJoinedAt={showJoinedAt}
        onTypeChange={onTypeChange}
        lockClientType={lockClientType}
      />
      <ContactFieldsBlock form={form} onChange={onChange} disabled={disabled} />
      <FinancialFieldsBlock form={form} onChange={onChange} disabled={disabled} />
      <MembershipFieldsBlock form={form} onPatch={patchForm} disabled={disabled} />
      <SlaAgreementFormFields
        form={form}
        onChange={onChange}
        onPatchSla={createSlaPatchHandler(form, onChange)}
        disabled={disabled}
        compact={false}
      />
      <CorporateCommercialFormFields form={form} onChange={onChange} disabled={disabled} />
    </div>
  )
}
