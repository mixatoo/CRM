import { CrmFieldGrid, CrmInputCell, CrmPanel } from '@/design-system/layout/CrmPanel'
import type { ClientFormInput } from '@/features/clients/hooks/use-client-mutations'
import {
  ClientAccountManagerField,
  ClientStatusField,
  ClientTypeField,
  FormField,
  type ClientFormStepId,
} from '@/features/clients/components/client-form-ui'
import { FinancialFieldsBlock } from '@/features/clients/components/FinancialFormFields'
import {
  ClientFormStepLayout,
  ProfileAcquisitionAssignmentFields,
  AcquisitionFieldsBlock,
  AccountManagerFieldBlock,
  ContactFieldsBlock,
  ClientJoinedAtFieldBlock,
} from '@/features/clients/components/client-form-shared'
import {
  createSlaPatchHandler,
  SlaAgreementFormFields,
} from '@/features/clients/components/sla/SlaAgreementFormFields'
import type { SlaValidationErrors } from '@/features/clients/components/sla/sla-validation'
import { IndividualDisplayNameField, IndividualNameFields } from '@/features/clients/components/IndividualNameFields'
import {
  IndividualDemographicsFields,
  IndividualProfileDetailsFields,
} from '@/features/clients/components/IndividualProfileDetailsFields'
import { MembershipFieldsBlock } from '@/features/clients/components/membership/MembershipFormFields'
import type { ClientType } from '@/domain/entities/client'

type OnChange = <K extends keyof ClientFormInput>(key: K, value: ClientFormInput[K]) => void

interface IndividualClientFormProps {
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

function IndividualProfileFields({
  form,
  onChange,
  onPatch,
  disabled,
  compact,
  showStatus,
  showJoinedAt,
  showNameHint,
  onTypeChange,
  lockClientType,
  section,
  fieldLayout = 'form',
}: {
  form: ClientFormInput
  onChange: OnChange
  onPatch?: (patch: Partial<ClientFormInput>) => void
  disabled?: boolean
  compact?: boolean
  showStatus?: boolean
  showJoinedAt?: boolean
  showNameHint?: boolean
  onTypeChange: (type: ClientType) => void
  lockClientType?: boolean
  section?: boolean
  fieldLayout?: 'form' | 'panel' | 'profile'
}) {
  if (section) {
    return (
      <>
        <CrmFieldGrid columns={2}>
          <IndividualNameFields
            form={form}
            onChange={onChange}
            onPatch={onPatch}
            disabled={disabled}
            layout="panel"
            showNameHint={showNameHint}
            includeDisplayName={false}
          />
          <div className="sm:col-span-2">
            <IndividualDemographicsFields form={form} onChange={onChange} disabled={disabled} layout="panel" />
          </div>
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
        <IndividualDisplayNameField form={form} disabled={disabled} layout="panel" />
      </>
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

        <IndividualNameFields
          form={form}
          onChange={onChange}
          onPatch={onPatch}
          disabled={disabled}
          layout={fieldLayout}
          showNameHint={showNameHint}
          includeDisplayName={false}
        />
        <IndividualDemographicsFields form={form} onChange={onChange} disabled={disabled} layout={fieldLayout} />

        <ProfileAcquisitionAssignmentFields form={form} onChange={onChange} disabled={disabled} />

        <IndividualDisplayNameField form={form} disabled={disabled} layout={fieldLayout} />

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
          <ClientJoinedAtFieldBlock
            form={form}
            onChange={onChange}
            disabled={disabled}
            variant={fieldLayout === 'panel' ? 'panel' : 'form'}
          />
        ) : null}
      </ClientFormStepLayout>
    )
  }

  return (
    <CrmPanel title="Personal profile">
      <CrmFieldGrid columns={2}>
        {!lockClientType ? (
          <CrmInputCell label="Type" className="sm:col-span-2">
            <ClientTypeField value={form.type} onChange={onTypeChange} disabled={disabled} />
          </CrmInputCell>
        ) : null}
        <IndividualNameFields
          form={form}
          onChange={onChange}
          onPatch={onPatch}
          disabled={disabled}
          layout="panel"
          showNameHint={showNameHint}
          includeDisplayName={false}
        />
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
      </CrmFieldGrid>
      <IndividualProfileDetailsFields
        form={form}
        onChange={onChange}
        disabled={disabled}
        layout="panel"
        includeAccountManager={false}
      />
      <AcquisitionFieldsBlock form={form} onChange={onChange} disabled={disabled} />
      <AccountManagerFieldBlock form={form} onChange={onChange} disabled={disabled} />
      <IndividualDisplayNameField form={form} disabled={disabled} layout="panel" />
    </CrmPanel>
  )
}

export function IndividualClientForm({
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
}: IndividualClientFormProps) {
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
    const profile = layout === 'profile'
    const basicsShowStatus = section ? showStatus : false
    const basicsShowJoinedAt = showJoinedAt
    const fieldLayout = profile ? 'profile' : compact ? 'form' : 'panel'

    if (step === 'basics') {
      return (
        <IndividualProfileFields
          form={form}
          onChange={onChange}
          onPatch={patchForm}
          disabled={disabled}
          compact={compact}
          section={section}
          showStatus={basicsShowStatus}
          showJoinedAt={basicsShowJoinedAt}
          showNameHint={showNameHint}
          onTypeChange={onTypeChange}
          lockClientType={lockClientType}
          fieldLayout={fieldLayout}
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
          emailPlaceholder="traveler@email.com"
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
    return null
  }

  return (
    <div className="space-y-3">
      <IndividualProfileFields
        form={form}
        onChange={onChange}
        onPatch={patchForm}
        disabled={disabled}
        showStatus={showStatus}
        showJoinedAt={showJoinedAt}
        showNameHint={showNameHint}
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
    </div>
  )
}
