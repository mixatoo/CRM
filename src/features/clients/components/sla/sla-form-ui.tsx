import type { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { FormPicklist } from '@/design-system/components/FormPicklist'
import { Input } from '@/design-system/components/Input'
import {
  CLIENT_SLA_BREACH_ALERTS,
  CLIENT_SLA_BREACH_ALERT_LABELS,
  CLIENT_SLA_KPI_FREQUENCIES,
  CLIENT_SLA_KPI_FREQUENCY_LABELS,
  CLIENT_SLA_LEVELS,
  CLIENT_SLA_LEVEL_LABELS,
  CLIENT_SLA_RENEWAL_PERIODS,
  CLIENT_SLA_RENEWAL_PERIOD_LABELS,
  CLIENT_SLA_RESPONSE_TIME_LABELS,
  CLIENT_SLA_RESPONSE_TIMES,
  CLIENT_SLA_SUPPORT_COVERAGES,
  CLIENT_SLA_SUPPORT_COVERAGE_LABELS,
  type ClientSlaBreachAlert,
  type ClientSlaKpiReviewFrequency,
  type ClientSlaLevel,
  type ClientSlaRenewalPeriod,
  type ClientSlaResponseTarget,
  type ClientSlaResponseTime,
  type ClientSlaSupportCoverage,
} from '@/domain/entities/client-sla'
import { FormField, SegmentedField } from '@/features/clients/components/client-form-ui'
import { cn } from '@/shared/utils/cn'

export function SlaFormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/25 px-3 py-2">
        <h4 className="text-[12px] font-semibold text-[var(--color-foreground)]">{title}</h4>
        {description ? <p className="mt-0.5 text-[11px] leading-snug text-[var(--color-muted)]">{description}</p> : null}
      </header>
      <div className="space-y-3 p-3">{children}</div>
    </section>
  )
}

export function SlaFormGroup({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('space-y-3', className)}>
      <div className="border-b border-[var(--color-border)] pb-2">
        <h3 className="text-xs font-semibold text-[var(--color-foreground)]">{title}</h3>
        {description ? <p className="mt-0.5 text-[11px] leading-snug text-[var(--color-muted)]">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

export function SlaToggleField({
  label,
  hint,
  value,
  onChange,
  disabled,
}: {
  label: string
  hint?: string
  value: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
}) {
  return (
    <FormField label={label} hint={hint}>
      <SegmentedField
        aria-label={label}
        value={value ? 'yes' : 'no'}
        disabled={disabled}
        onChange={(next) => onChange(next === 'yes')}
        options={[
          { value: 'yes', label: 'Enabled' },
          { value: 'no', label: 'Disabled' },
        ]}
      />
    </FormField>
  )
}

function toPicklistOptions<T extends string>(values: T[], labels: Record<T, string>) {
  return values.map((value) => ({ value, label: labels[value] }))
}

export function SlaLevelField({
  value,
  onChange,
  disabled,
  error,
  fieldKey = 'slaAgreement',
}: {
  value?: ClientSlaLevel
  onChange: (value: ClientSlaLevel | undefined) => void
  disabled?: boolean
  error?: string
  fieldKey?: string
}) {
  return (
    <FormField label="SLA level" required hint="Service tier for this client account" fieldKey={fieldKey}>
      <FormPicklist
        value={value ?? ''}
        onChange={(next) => onChange(next ? (next as ClientSlaLevel) : undefined)}
        options={toPicklistOptions(CLIENT_SLA_LEVELS, CLIENT_SLA_LEVEL_LABELS)}
        placeholder="Select SLA level"
        emptyOption={{ value: '', label: 'Select SLA level' }}
        panelTitle="SLA level"
        ariaLabel="SLA level"
        disabled={disabled}
        error={Boolean(error)}
      />
      {error ? <p className="text-[11px] text-[var(--color-danger)]">{error}</p> : null}
    </FormField>
  )
}

export function SlaSupportCoverageField({
  value,
  onChange,
  disabled,
  fieldKey = 'slaAgreement',
}: {
  value?: ClientSlaSupportCoverage
  onChange: (value: ClientSlaSupportCoverage | undefined) => void
  disabled?: boolean
  fieldKey?: string
}) {
  return (
    <FormField label="Support coverage" hint="When the client can reach support" fieldKey={fieldKey}>
      <FormPicklist
        value={value ?? ''}
        onChange={(next) => onChange(next ? (next as ClientSlaSupportCoverage) : undefined)}
        options={toPicklistOptions(CLIENT_SLA_SUPPORT_COVERAGES, CLIENT_SLA_SUPPORT_COVERAGE_LABELS)}
        placeholder="Select coverage"
        emptyOption={{ value: '', label: 'Select coverage' }}
        panelTitle="Support coverage"
        ariaLabel="Support coverage"
        disabled={disabled}
      />
    </FormField>
  )
}

export function SlaResponseTimeField({
  label,
  value,
  customValue,
  onChange,
  disabled,
  required,
  error,
  fieldKey = 'slaAgreement',
}: {
  label: string
  value?: ClientSlaResponseTime
  customValue?: string
  onChange: (preset: ClientSlaResponseTime | undefined, customValue?: string) => void
  disabled?: boolean
  required?: boolean
  error?: string
  fieldKey?: string
}) {
  return (
    <>
      <FormField label={label} required={required} fieldKey={fieldKey}>
        <FormPicklist
          value={value ?? ''}
          onChange={(next) => {
            const preset = next ? (next as ClientSlaResponseTime) : undefined
            onChange(preset, preset === 'custom' ? customValue : undefined)
          }}
          options={toPicklistOptions(CLIENT_SLA_RESPONSE_TIMES, CLIENT_SLA_RESPONSE_TIME_LABELS)}
          placeholder="Select target"
          emptyOption={{ value: '', label: 'Select target' }}
          panelTitle={label}
          ariaLabel={label}
          disabled={disabled}
          error={Boolean(error)}
        />
      </FormField>
      {value === 'custom' ? (
        <FormField label={`${label} (custom)`} required fieldKey={fieldKey}>
          <Input
            value={customValue ?? ''}
            onChange={(event) => onChange('custom', event.target.value)}
            placeholder="e.g. 45 minutes"
            disabled={disabled}
            error={Boolean(error)}
          />
        </FormField>
      ) : null}
      {error ? <p className="text-[11px] text-[var(--color-danger)]">{error}</p> : null}
    </>
  )
}

export function SlaResponseTargetField({
  label,
  target,
  onChange,
  disabled,
  error,
}: {
  label: string
  target?: ClientSlaResponseTarget
  onChange: (target: ClientSlaResponseTarget | undefined) => void
  disabled?: boolean
  error?: string
}) {
  return (
    <SlaResponseTimeField
      label={label}
      value={target?.preset}
      customValue={target?.customValue}
      onChange={(preset, customValue) => {
        if (!preset) {
          onChange(undefined)
          return
        }
        onChange({ preset, customValue: preset === 'custom' ? customValue : undefined })
      }}
      disabled={disabled}
      error={error}
    />
  )
}

export function SlaRenewalPeriodField({
  value,
  onChange,
  disabled,
  error,
}: {
  value?: ClientSlaRenewalPeriod
  onChange: (value: ClientSlaRenewalPeriod | undefined) => void
  disabled?: boolean
  error?: string
}) {
  return (
    <FormField label="Renewal period" required hint="How often the SLA renews automatically">
      <FormPicklist
        value={value ?? ''}
        onChange={(next) => onChange(next ? (next as ClientSlaRenewalPeriod) : undefined)}
        options={toPicklistOptions(CLIENT_SLA_RENEWAL_PERIODS, CLIENT_SLA_RENEWAL_PERIOD_LABELS)}
        placeholder="Select period"
        emptyOption={{ value: '', label: 'Select period' }}
        panelTitle="Renewal period"
        ariaLabel="Renewal period"
        disabled={disabled}
        error={Boolean(error)}
      />
      {error ? <p className="text-[11px] text-[var(--color-danger)]">{error}</p> : null}
    </FormField>
  )
}

export function SlaKpiFrequencyField({
  value,
  onChange,
  disabled,
  error,
}: {
  value?: ClientSlaKpiReviewFrequency
  onChange: (value: ClientSlaKpiReviewFrequency | undefined) => void
  disabled?: boolean
  error?: string
}) {
  return (
    <FormField label="KPI review frequency" required>
      <FormPicklist
        value={value ?? ''}
        onChange={(next) => onChange(next ? (next as ClientSlaKpiReviewFrequency) : undefined)}
        options={toPicklistOptions(CLIENT_SLA_KPI_FREQUENCIES, CLIENT_SLA_KPI_FREQUENCY_LABELS)}
        placeholder="Select frequency"
        emptyOption={{ value: '', label: 'Select frequency' }}
        panelTitle="KPI review frequency"
        ariaLabel="KPI review frequency"
        disabled={disabled}
        error={Boolean(error)}
      />
      {error ? <p className="text-[11px] text-[var(--color-danger)]">{error}</p> : null}
    </FormField>
  )
}

export function SlaBreachAlertField({
  value,
  onChange,
  disabled,
  error,
}: {
  value?: ClientSlaBreachAlert
  onChange: (value: ClientSlaBreachAlert | undefined) => void
  disabled?: boolean
  error?: string
}) {
  return (
    <FormField label="Alert before SLA breach" required>
      <FormPicklist
        value={value ?? ''}
        onChange={(next) => onChange(next ? (next as ClientSlaBreachAlert) : undefined)}
        options={toPicklistOptions(CLIENT_SLA_BREACH_ALERTS, CLIENT_SLA_BREACH_ALERT_LABELS)}
        placeholder="Select alert window"
        emptyOption={{ value: '', label: 'Select alert window' }}
        panelTitle="Alert before breach"
        ariaLabel="Alert before SLA breach"
        disabled={disabled}
        error={Boolean(error)}
      />
      {error ? <p className="text-[11px] text-[var(--color-danger)]">{error}</p> : null}
    </FormField>
  )
}

export function SlaExpiryWarning({ expiryDate, expired }: { expiryDate?: string; expired: boolean }) {
  if (!expiryDate || !expired) return null
  return (
    <div className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-warning)]/30 bg-[var(--color-warning-muted)]/20 px-3 py-2">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-warning)]" aria-hidden />
      <p className="text-[11px] leading-snug text-[var(--color-foreground)]">
        This SLA expired on {expiryDate}. Update the expiry date or enable auto renew.
      </p>
    </div>
  )
}
