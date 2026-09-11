import { useMemo } from 'react'
import { ClientFormPicklist } from '@/features/clients/components/client-form-ui'
import { ProfileInput } from '@/features/clients/components/profile/ProfileCrmFieldRow'
import { NotesTextarea } from '@/design-system/components/NotesField'
import { CrmFieldGrid, CrmInputCell, CrmPanel } from '@/design-system/layout/CrmPanel'
import {
  CLIENT_SLA_LEVELS,
  CLIENT_SLA_LEVEL_LABELS,
  CLIENT_SLA_RESPONSE_TARGET_KEYS,
  CLIENT_SLA_RESPONSE_TARGET_LABELS,
  CLIENT_SLA_RESPONSE_TIME_LABELS,
  CLIENT_SLA_RESPONSE_TIMES,
  CLIENT_SLA_SUPPORT_COVERAGES,
  CLIENT_SLA_SUPPORT_COVERAGE_LABELS,
  applyVipSlaPresets,
  patchSlaAgreement,
  patchSlaResponseTarget,
  type ClientSlaAgreement,
  type ClientSlaLevel,
  type ClientSlaResponseTargetKey,
  type ClientSlaResponseTime,
} from '@/domain/entities/client-sla'
import type { ClientFormInput } from '@/features/clients/hooks/use-client-mutations'
import { ClientFormDatePicker, FormField } from '@/features/clients/components/client-form-ui'
import { FormStepCluster, ClientFormStepLayout } from '@/features/clients/components/client-form-shared'
import { useClientFormProfileLayout } from '@/features/clients/components/client-form-profile-layout-context'
import {
  SlaLevelField,
  SlaResponseTargetField,
  SlaSupportCoverageField,
} from '@/features/clients/components/sla/sla-form-ui'
import { slaFieldError, type SlaValidationErrors } from '@/features/clients/components/sla/sla-validation'
import { cn } from '@/shared/utils/cn'

type OnChange = <K extends keyof ClientFormInput>(key: K, value: ClientFormInput[K]) => void

type SlaAgreementFormFieldsProps = {
  form: ClientFormInput
  onChange: OnChange
  onPatchSla: (patch: Partial<ClientSlaAgreement>) => void
  disabled?: boolean
  compact?: boolean
  section?: boolean
  showErrors?: boolean
  errors?: SlaValidationErrors
}

function resolveErrors(showErrors: boolean, errors?: SlaValidationErrors): SlaValidationErrors {
  return showErrors ? (errors ?? {}) : {}
}

function SlaResponseTargets({
  agreement,
  patchTarget,
  disabled,
  errors,
}: {
  agreement: ClientSlaAgreement
  patchTarget: (key: ClientSlaResponseTargetKey, target: ClientSlaAgreement[typeof key]) => void
  disabled?: boolean
  errors: SlaValidationErrors
}) {
  const isProfileLayout = useClientFormProfileLayout()

  return (
    <div className={cn(isProfileLayout ? undefined : 'grid gap-3.5 sm:grid-cols-2')}>
      {CLIENT_SLA_RESPONSE_TARGET_KEYS.map((key) => (
        <SlaResponseTargetField
          key={key}
          label={CLIENT_SLA_RESPONSE_TARGET_LABELS[key]}
          target={agreement[key]}
          onChange={(target) => patchTarget(key, target)}
          disabled={disabled}
          error={slaFieldError(errors, key)}
        />
      ))}
    </div>
  )
}

function SlaTermFields({
  agreement,
  onPatchSla,
  disabled,
  errors,
}: {
  agreement: ClientSlaAgreement
  onPatchSla: (patch: Partial<ClientSlaAgreement>) => void
  disabled?: boolean
  errors: SlaValidationErrors
}) {
  const isProfileLayout = useClientFormProfileLayout()

  return (
    <div className={cn(isProfileLayout ? undefined : 'grid gap-3.5 sm:grid-cols-2')}>
      <FormField label="Effective date" fieldKey="slaAgreement">
        <ClientFormDatePicker
          value={agreement.effectiveDate ?? ''}
          onChange={(value) => onPatchSla({ effectiveDate: value || undefined })}
          disabled={disabled}
          aria-label="SLA effective date"
        />
      </FormField>
      <FormField label="Expiry date" fieldKey="slaAgreement">
        <ClientFormDatePicker
          value={agreement.expiryDate ?? ''}
          onChange={(value) => onPatchSla({ expiryDate: value || undefined })}
          min={agreement.effectiveDate}
          disabled={disabled}
          aria-label="SLA expiry date"
        />
        {slaFieldError(errors, 'expiryDate') ? (
          <p className="text-[11px] text-[var(--color-danger)]">{slaFieldError(errors, 'expiryDate')}</p>
        ) : null}
      </FormField>
    </div>
  )
}

function toPicklistOptions<T extends string>(values: readonly T[], labels: Record<T, string>) {
  return values.map((value) => ({ value, label: labels[value] }))
}

function SlaResponseTargetCell({
  label,
  target,
  onChange,
  disabled,
  error,
}: {
  label: string
  target?: ClientSlaAgreement[ClientSlaResponseTargetKey]
  onChange: (target: ClientSlaAgreement[ClientSlaResponseTargetKey] | undefined) => void
  disabled?: boolean
  error?: string
}) {
  return (
    <CrmInputCell label={label}>
      <ClientFormPicklist
        value={target?.preset ?? ''}
        onChange={(next) => {
          const preset = next ? (next as ClientSlaResponseTime) : undefined
          if (!preset) {
            onChange(undefined)
            return
          }
          onChange({ preset, customValue: preset === 'custom' ? target?.customValue : undefined })
        }}
        options={toPicklistOptions(CLIENT_SLA_RESPONSE_TIMES, CLIENT_SLA_RESPONSE_TIME_LABELS)}
        placeholder="Select target"
        emptyOption={{ value: '', label: 'Select target' }}
        panelTitle={label}
        ariaLabel={label}
        disabled={disabled}
        error={Boolean(error)}
      />
      {target?.preset === 'custom' ? (
        <ProfileInput
          value={target.customValue ?? ''}
          onChange={(event) => onChange({ preset: 'custom', customValue: event.target.value })}
          placeholder="e.g. 45 minutes"
          disabled={disabled}
          error={Boolean(error)}
          className="mt-1.5"
        />
      ) : null}
      {error ? <p className="text-[11px] text-[var(--color-danger)]">{error}</p> : null}
    </CrmInputCell>
  )
}

function SlaSectionForm({
  agreement,
  onPatchSla,
  disabled,
  errors,
}: {
  agreement: ClientSlaAgreement
  onPatchSla: (patch: Partial<ClientSlaAgreement>) => void
  disabled?: boolean
  errors: SlaValidationErrors
}) {
  const handleLevelChange = (level: ClientSlaLevel | undefined) => {
    if (level === 'vip') {
      onPatchSla(applyVipSlaPresets({ ...agreement, level: 'vip' }))
      return
    }
    onPatchSla(
      patchSlaAgreement(agreement, {
        level,
        customName: level === 'custom' ? agreement.customName : undefined,
      }),
    )
  }

  const patchTarget = (key: ClientSlaResponseTargetKey, target: ClientSlaAgreement[typeof key]) => {
    onPatchSla(patchSlaResponseTarget(agreement, key, target!))
  }

  const levelError = slaFieldError(errors, 'customName') ?? slaFieldError(errors, 'level')

  return (
    <CrmFieldGrid columns={2}>
      <CrmInputCell label="SLA level" hint="Service tier for this client account">
        <ClientFormPicklist
          value={agreement.level ?? ''}
          onChange={(next) =>
            handleLevelChange(next ? (next as ClientSlaLevel) : undefined)
          }
          options={toPicklistOptions(CLIENT_SLA_LEVELS, CLIENT_SLA_LEVEL_LABELS)}
          placeholder="Select SLA level"
          emptyOption={{ value: '', label: 'Select SLA level' }}
          panelTitle="SLA level"
          ariaLabel="SLA level"
          disabled={disabled}
          error={Boolean(levelError)}
        />
        {levelError ? <p className="text-[11px] text-[var(--color-danger)]">{levelError}</p> : null}
      </CrmInputCell>
      <CrmInputCell label="Support coverage" hint="When the client can reach support">
        <ClientFormPicklist
          value={agreement.supportCoverage ?? ''}
          onChange={(next) =>
            onPatchSla({
              supportCoverage: next ? (next as (typeof CLIENT_SLA_SUPPORT_COVERAGES)[number]) : undefined,
            })
          }
          options={toPicklistOptions(CLIENT_SLA_SUPPORT_COVERAGES, CLIENT_SLA_SUPPORT_COVERAGE_LABELS)}
          placeholder="Select coverage"
          emptyOption={{ value: '', label: 'Select coverage' }}
          panelTitle="Support coverage"
          ariaLabel="Support coverage"
          disabled={disabled}
        />
      </CrmInputCell>
      {agreement.level === 'custom' ? (
        <CrmInputCell label="SLA name" className="sm:col-span-2">
          <ProfileInput
            value={agreement.customName ?? ''}
            onChange={(event) => onPatchSla({ customName: event.target.value })}
            placeholder="e.g. Enterprise Platinum"
            disabled={disabled}
            error={Boolean(slaFieldError(errors, 'customName'))}
          />
          {slaFieldError(errors, 'customName') ? (
            <p className="text-[11px] text-[var(--color-danger)]">{slaFieldError(errors, 'customName')}</p>
          ) : null}
        </CrmInputCell>
      ) : null}
      {CLIENT_SLA_RESPONSE_TARGET_KEYS.map((key) => (
        <SlaResponseTargetCell
          key={key}
          label={CLIENT_SLA_RESPONSE_TARGET_LABELS[key]}
          target={agreement[key]}
          onChange={(target) => patchTarget(key, target)}
          disabled={disabled}
          error={slaFieldError(errors, key)}
        />
      ))}
      <CrmInputCell label="Effective date">
        <ClientFormDatePicker
          value={agreement.effectiveDate ?? ''}
          onChange={(value) => onPatchSla({ effectiveDate: value || undefined })}
          disabled={disabled}
          aria-label="SLA effective date"
        />
      </CrmInputCell>
      <CrmInputCell label="Expiry date">
        <ClientFormDatePicker
          value={agreement.expiryDate ?? ''}
          onChange={(value) => onPatchSla({ expiryDate: value || undefined })}
          min={agreement.effectiveDate}
          disabled={disabled}
          aria-label="SLA expiry date"
        />
        {slaFieldError(errors, 'expiryDate') ? (
          <p className="text-[11px] text-[var(--color-danger)]">{slaFieldError(errors, 'expiryDate')}</p>
        ) : null}
      </CrmInputCell>
      <CrmInputCell label="Internal SLA notes" className="sm:col-span-2">
        <NotesTextarea
          value={agreement.internalNotes ?? ''}
          onChange={(event) => onPatchSla({ internalNotes: event.target.value })}
          placeholder="Operational notes, review history, or handover context…"
          disabled={disabled}
          className="min-h-[4.5rem]"
        />
      </CrmInputCell>
    </CrmFieldGrid>
  )
}

function SlaEssentialsForm({
  agreement,
  onPatchSla,
  disabled,
  errors,
}: {
  agreement: ClientSlaAgreement
  onPatchSla: (patch: Partial<ClientSlaAgreement>) => void
  disabled?: boolean
  errors: SlaValidationErrors
}) {
  const handleLevelChange = (level: ClientSlaLevel | undefined) => {
    if (level === 'vip') {
      onPatchSla(applyVipSlaPresets({ ...agreement, level: 'vip' }))
      return
    }
    onPatchSla(
      patchSlaAgreement(agreement, {
        level,
        customName: level === 'custom' ? agreement.customName : undefined,
      }),
    )
  }

  const patchTarget = (key: ClientSlaResponseTargetKey, target: ClientSlaAgreement[typeof key]) => {
    onPatchSla(patchSlaResponseTarget(agreement, key, target!))
  }

  const isProfileLayout = useClientFormProfileLayout()
  const levelFields = (
    <>
      <SlaLevelField
        value={agreement.level}
        onChange={handleLevelChange}
        disabled={disabled}
        error={slaFieldError(errors, 'customName') ?? slaFieldError(errors, 'level')}
      />
      <SlaSupportCoverageField
        value={agreement.supportCoverage}
        onChange={(supportCoverage) => onPatchSla({ supportCoverage })}
        disabled={disabled}
      />
    </>
  )

  return (
    <ClientFormStepLayout>
      <FormStepCluster>
        {isProfileLayout ? levelFields : <div className="grid gap-3.5 sm:grid-cols-2">{levelFields}</div>}

        {agreement.level === 'custom' ? (
          <FormField label="SLA name" required fieldKey="slaAgreement">
            <ProfileInput
              value={agreement.customName ?? ''}
              onChange={(event) => onPatchSla({ customName: event.target.value })}
              placeholder="e.g. Enterprise Platinum"
              disabled={disabled}
              error={Boolean(slaFieldError(errors, 'customName'))}
            />
            {slaFieldError(errors, 'customName') ? (
              <p className="text-[11px] text-[var(--color-danger)]">{slaFieldError(errors, 'customName')}</p>
            ) : null}
          </FormField>
        ) : null}
      </FormStepCluster>

      <FormStepCluster>
        <SlaResponseTargets
          agreement={agreement}
          patchTarget={patchTarget}
          disabled={disabled}
          errors={errors}
        />
      </FormStepCluster>

      <FormStepCluster>
        <SlaTermFields agreement={agreement} onPatchSla={onPatchSla} disabled={disabled} errors={errors} />
        <FormField label="Internal SLA notes" fieldKey="slaAgreement">
          <NotesTextarea
            value={agreement.internalNotes ?? ''}
            onChange={(event) => onPatchSla({ internalNotes: event.target.value })}
            placeholder="Operational notes, review history, or handover context…"
            disabled={disabled}
            className="min-h-[5.5rem]"
          />
        </FormField>
      </FormStepCluster>
    </ClientFormStepLayout>
  )
}

export function SlaAgreementFormFields({
  form,
  onPatchSla,
  disabled,
  compact = true,
  section,
  showErrors = false,
  errors,
}: SlaAgreementFormFieldsProps) {
  const agreement = form.slaAgreement ?? {}
  const resolvedErrors = useMemo(() => resolveErrors(showErrors, errors), [showErrors, errors])

  if (section) {
    return (
      <SlaSectionForm
        agreement={agreement}
        onPatchSla={onPatchSla}
        disabled={disabled}
        errors={resolvedErrors}
      />
    )
  }

  const body = (
    <SlaEssentialsForm
      agreement={agreement}
      onPatchSla={onPatchSla}
      disabled={disabled}
      errors={resolvedErrors}
    />
  )

  if (compact) return body

  return <CrmPanel title="SLA">{body}</CrmPanel>
}

export function createSlaPatchHandler(
  form: ClientFormInput,
  onChange: OnChange,
): (patch: Partial<ClientSlaAgreement>) => void {
  return (patch) => {
    onChange('slaAgreement', patchSlaAgreement(form.slaAgreement, patch))
  }
}
