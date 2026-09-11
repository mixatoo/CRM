import type { LucideIcon } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { Award, Building2, CreditCard, MapPin, Percent, Timer, UserCircle, Wallet } from 'lucide-react'
import type { ClientFormInput } from '@/features/clients/hooks/use-client-mutations'
import { handleRadiogroupKeyDown } from '@/shared/utils/form-keyboard'
import type { ClientFormStepId } from '@/features/clients/components/client-form-step-completion'
import { CRM_LABELS } from '@/features/clients/config/crm-labels'
import { AmountInput } from '@/design-system/components/AmountInput'
import { FormPicklist, type FormPicklistOption } from '@/design-system/components/FormPicklist'
import { FormMultiPicklist } from '@/design-system/components/FormMultiPicklist'
import { FieldHeader } from '@/design-system/components/FieldLabel'
import { Skeleton } from '@/design-system/components/Skeleton'
import {
  paymentTermsToPicklistOptions,
  useActivePaymentTerms,
  usePaymentTerm,
} from '@/features/payment-terms/hooks/use-payment-terms'
import { buildCurrencyOptions, getCurrencyName } from '@/domain/currency'
import {
  CLIENT_CUSTOMER_TIER_LABELS,
  CLIENT_CUSTOMER_TIERS,
  CLIENT_INDUSTRIES,
  CLIENT_INDUSTRY_LABELS,
  CLIENT_STATUS_LABELS,
  CLIENT_STATUSES,
  CLIENT_TYPE_LABELS,
  CLIENT_TYPES,
  CLIENT_MEMBERSHIPS,
  CLIENT_MEMBERSHIP_LABELS,
  type ClientMembership,
  CLIENT_PAYMENT_METHODS,
  CLIENT_PAYMENT_METHOD_LABELS,
  CLIENT_BILLING_ACCOUNTS,
  CLIENT_BILLING_ACCOUNT_DESCRIPTIONS,
  CLIENT_BILLING_ACCOUNT_LABELS,
  type ClientBillingAccount,
  type ClientPaymentMethod,
  type ClientCustomerTier,
  type ClientIndustry,
  type ClientStatus,
  type ClientType,
  CLIENT_ACQUISITION_CHANNEL_LABELS,
  CLIENT_ACQUISITION_SOURCES,
  CLIENT_ACQUISITION_SOURCE_LABELS,
  resolveClientAcquisitionChannels,
  type ClientAcquisitionChannel,
  type ClientAcquisitionSource,
  CLIENT_GENDERS,
  type ClientGender,
} from '@/domain/entities/client'
import {
  accountManagersToPicklistOptions,
  useAccountManagers,
  useUser,
} from '@/features/clients/hooks/use-account-managers'
import { FormDatePicker } from '@/design-system/components/DatePickerField'
import { cn } from '@/shared/utils/cn'
import { useClientFormFieldState } from '@/features/clients/components/client-form-modified-context'
import { useClientFormProfileLayout } from '@/features/clients/components/client-form-profile-layout-context'
import { profileCrmDateInputClassName, profileCrmPicklistClassName, ProfileCrmFieldRow, useProfileCrmFocusStyle } from '@/features/clients/components/profile/ProfileCrmFieldRow'
import {
  useClientFormWizardCrm,
  wizardCrmPicklistClassName,
} from '@/features/clients/components/client-form-wizard-ui'

export { ClientFormStepSidebar } from '@/features/clients/components/client-form-step-sidebar-ui'

export function ClientFormPicklist(props: ComponentProps<typeof FormPicklist>) {
  const profileFocusStyle = useProfileCrmFocusStyle()
  const isWizardCrm = useClientFormWizardCrm()
  return (
    <FormPicklist
      {...props}
      focusStyle={props.focusStyle ?? profileFocusStyle}
      className={cn(
        profileFocusStyle === 'neutral' && profileCrmPicklistClassName,
        isWizardCrm && wizardCrmPicklistClassName,
        props.className,
      )}
    />
  )
}

export type { FormPicklistOption }

export const CLIENT_FORM_STICKY_BAR =
  'bg-[var(--color-surface)]/95 backdrop-blur-sm supports-[backdrop-filter]:bg-[var(--color-surface)]/90'

/** @deprecated Prefer {@link clientProfileBrowseGridClassName} from client-profile-browse-ui */
export { clientProfileBrowseGridClassName as CLIENT_PROFILE_BROWSE_GRID_CLASS } from '@/features/clients/components/profile/client-profile-browse-ui'

export type { ClientFormStepId } from '@/features/clients/components/client-form-step-completion'

type StepMeta = {
  id: ClientFormStepId
  label: string
  description: string
  icon: LucideIcon
}

const SHARED_STEP_META = {
  contact: { id: 'contact' as const, label: CRM_LABELS.communication, description: 'Email, phone & address', icon: MapPin },
  financial: {
    id: 'financial' as const,
    label: 'Financial information',
    description: 'Payment terms & credit',
    icon: Wallet,
  },
  serviceFees: {
    id: 'service-fees' as const,
    label: 'Service fees',
    description: 'Agency commission per service',
    icon: Percent,
  },
  creditCards: {
    id: 'credit-cards' as const,
    label: 'Credit cards',
    description: 'Saved cards for charging this account',
    icon: CreditCard,
  },
  membership: {
    id: 'membership' as const,
    label: 'Membership',
    description: 'Program enrollment & term',
    icon: Award,
  },
  sla: {
    id: 'sla' as const,
    label: 'SLA',
    description: 'Service level agreement',
    icon: Timer,
  },
}

const INDIVIDUAL_STEP_META: Record<
  'basics' | 'contact' | 'financial' | 'service-fees' | 'credit-cards' | 'membership' | 'sla',
  StepMeta
> = {
  basics: { id: 'basics', label: 'Profile', description: 'Name, source & account type', icon: UserCircle },
  contact: SHARED_STEP_META.contact,
  financial: SHARED_STEP_META.financial,
  'service-fees': SHARED_STEP_META.serviceFees,
  'credit-cards': SHARED_STEP_META.creditCards,
  membership: SHARED_STEP_META.membership,
  sla: SHARED_STEP_META.sla,
}

const CORPORATE_STEP_META: Record<
  'basics' | 'commercial' | 'contact' | 'financial' | 'service-fees' | 'credit-cards' | 'membership' | 'sla',
  StepMeta
> = {
  basics: {
    id: 'basics',
    label: 'Profile',
    description: 'Company name & industry',
    icon: Building2,
  },
  contact: SHARED_STEP_META.contact,
  financial: SHARED_STEP_META.financial,
  'service-fees': SHARED_STEP_META.serviceFees,
  'credit-cards': SHARED_STEP_META.creditCards,
  membership: SHARED_STEP_META.membership,
  sla: SHARED_STEP_META.sla,
  commercial: {
    id: 'commercial',
    label: 'Commercial information',
    description: 'Commercial register & tax card',
    icon: Building2,
  },
}

export function getClientFormStepOrder(
  type: ClientType,
  options?: { includeCreditCards?: boolean; includeServiceFees?: boolean },
): ClientFormStepId[] {
  const includeCreditCards = options?.includeCreditCards ?? true
  const includeServiceFees = options?.includeServiceFees ?? true
  const creditCardsStep: ClientFormStepId[] = includeCreditCards ? ['credit-cards'] : []
  const serviceFeesStep: ClientFormStepId[] = includeServiceFees ? ['service-fees'] : []

  if (type === 'corporate') {
    return ['basics', 'contact', 'financial', ...serviceFeesStep, ...creditCardsStep, 'membership', 'sla', 'commercial']
  }
  return ['basics', 'contact', 'financial', ...serviceFeesStep, ...creditCardsStep, 'membership', 'sla']
}

export function getClientFormSteps(type: ClientType, options?: { includeCreditCards?: boolean; includeServiceFees?: boolean }): StepMeta[] {
  const order = getClientFormStepOrder(type, options)
  if (type === 'corporate') {
    return order.map((id) => CORPORATE_STEP_META[id as keyof typeof CORPORATE_STEP_META])
  }
  return order.map((id) => INDIVIDUAL_STEP_META[id as keyof typeof INDIVIDUAL_STEP_META])
}

export function FormField({
  label,
  hint,
  required,
  optional,
  fieldKey,
  children,
  className,
  stacked,
}: {
  label: string
  hint?: string
  required?: boolean
  optional?: boolean
  fieldKey?: string
  children: ReactNode
  className?: string
  stacked?: boolean
}) {
  const { isModified } = useClientFormFieldState(fieldKey)
  const isProfileLayout = useClientFormProfileLayout()

  if (isProfileLayout && !stacked) {
    return (
      <ProfileCrmFieldRow
        label={label}
        required={required}
        optional={optional}
        fieldKey={fieldKey}
        className={className}
      >
        {children}
      </ProfileCrmFieldRow>
    )
  }

  return (
    <label className={cn('flex flex-col gap-1.5', className)}>
      <FieldHeader
        label={label}
        hint={hint}
        required={required}
        optional={optional}
        labelClassName={cn(isModified && 'text-[var(--color-accent)]')}
        trailing={
          isModified ? (
            <span className="shrink-0 text-[10px] font-medium text-[var(--color-accent)]">Edited</span>
          ) : undefined
        }
      />
      <div
        className={cn(
          isModified &&
            '[&_input:not(:focus)]:border-[var(--color-accent)]/45 [&_input:not(:focus)]:shadow-[inset_3px_0_0_0_var(--color-accent)] [&_textarea:not(:focus)]:border-[var(--color-accent)]/45 [&_textarea:not(:focus)]:shadow-[inset_3px_0_0_0_var(--color-accent)] [&_button:not(:focus)]:border-[var(--color-accent)]/45 [&_button:not(:focus)]:shadow-[inset_3px_0_0_0_var(--color-accent)]',
        )}
      >
        {children}
      </div>
    </label>
  )
}

export function ClientFormDatePicker({
  value,
  onChange,
  onBlur,
  min,
  max,
  disabled,
  'aria-label': ariaLabel,
}: {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  min?: string
  max?: string
  disabled?: boolean
  'aria-label'?: string
}) {
  const profileFocusStyle = useProfileCrmFocusStyle()
  const isWizardCrm = useClientFormWizardCrm()

  return (
    <FormDatePicker
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      min={min}
      max={max}
      readOnly={disabled}
      aria-label={ariaLabel}
      inputClassName={cn(
        profileFocusStyle === 'neutral' && profileCrmDateInputClassName,
        isWizardCrm && wizardCrmPicklistClassName,
      )}
      inputFocusStyle={profileFocusStyle}
    />
  )
}

export function SegmentedField<T extends string>({
  value,
  options,
  onChange,
  disabled,
  'aria-label': ariaLabel,
}: {
  value: T
  options: Array<{ value: T; label: string }>
  onChange: (value: T) => void
  disabled?: boolean
  'aria-label'?: string
}) {
  const isProfileLayout = useClientFormProfileLayout()

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      data-profile-segmented={isProfileLayout ? '' : undefined}
      onKeyDown={(event) => {
        if (disabled) return
        handleRadiogroupKeyDown(event, options, value, onChange, 'horizontal')
      }}
      className={cn(
        'relative flex h-9 w-full',
        isProfileLayout
          ? 'gap-2 border-0 bg-transparent p-0'
          : 'flex-wrap gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]/60 p-1',
      )}
    >
      {options.map((option) => {
        const selected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => {
              if (disabled) return
              onChange(option.value)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') event.stopPropagation()
            }}
            className={cn(
              'relative z-[1] flex flex-1 basis-0 items-center justify-center text-xs transition-[color,background-color,border-color,font-weight] duration-200',
              isProfileLayout
                ? cn(
                    'min-h-8 min-w-[3.5rem] rounded-[var(--radius-sm)] border px-2.5',
                    selected
                      ? 'border-[var(--color-accent)] !bg-[var(--color-accent)] font-semibold !text-white'
                      : 'border-[var(--color-border)] bg-transparent font-medium text-[var(--color-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-foreground)]',
                    'focus-visible:outline-none focus-visible:!ring-0',
                  )
                : cn(
                    'min-h-8 rounded-[var(--radius-sm)] px-2.5 font-medium',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/25',
                    selected
                      ? 'bg-[var(--color-surface)] text-[var(--color-foreground)] shadow-sm ring-1 ring-[var(--color-border)]'
                      : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]',
                  ),
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function ClientTypeField({
  value,
  onChange,
  disabled,
}: {
  value: ClientType
  onChange: (value: ClientType) => void
  disabled?: boolean
}) {
  const options = CLIENT_TYPES.map((type) => ({ value: type, label: CLIENT_TYPE_LABELS[type] }))

  return (
    <div
      role="radiogroup"
      aria-label="Client type"
      onKeyDown={(event) => {
        if (disabled) return
        handleRadiogroupKeyDown(event, options, value, onChange, 'horizontal')
      }}
      className="flex flex-wrap gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]/60 p-1"
    >
      {options.map((option) => {
        const selected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => {
              if (disabled) return
              onChange(option.value)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') event.stopPropagation()
            }}
            className={cn(
              'min-h-8 flex-1 rounded-[var(--radius-sm)] px-2.5 text-xs font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/25',
              selected
                ? 'bg-[var(--color-surface)] text-[var(--color-foreground)] shadow-sm ring-1 ring-[var(--color-border)]'
                : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

const CLIENT_INDUSTRY_OPTIONS = CLIENT_INDUSTRIES.map((industry) => ({
  value: industry,
  label: CLIENT_INDUSTRY_LABELS[industry],
}))

export function ClientIndustryField({
  value,
  onChange,
  disabled,
}: {
  value?: ClientIndustry
  onChange: (value: ClientIndustry | undefined) => void
  disabled?: boolean
}) {
  return (
    <ClientFormPicklist
      value={value ?? ''}
      onChange={(next) => onChange(next ? (next as ClientIndustry) : undefined)}
      options={CLIENT_INDUSTRY_OPTIONS}
      placeholder="Select industry"
      emptyOption={{ value: '', label: 'Select industry' }}
      panelTitle="Industry"
      ariaLabel="Industry"
      disabled={disabled}
      searchable
      searchPlaceholder="Search industries…"
    />
  )
}

export function ClientPaymentMethodsField({
  value,
  onChange,
  disabled,
}: {
  value?: ClientPaymentMethod[]
  onChange: (value: ClientPaymentMethod[]) => void
  disabled?: boolean
}) {
  const options = CLIENT_PAYMENT_METHODS.map((method) => ({
    value: method,
    label: CLIENT_PAYMENT_METHOD_LABELS[method],
  }))

  return (
    <FormMultiPicklist
      value={value ?? []}
      onChange={(next) => onChange(next as ClientPaymentMethod[])}
      options={options}
      placeholder="Select payment methods"
      panelTitle="Payment methods"
      ariaLabel="Payment methods"
      disabled={disabled}
      searchable
      searchPlaceholder="Search methods…"
    />
  )
}

export function ClientPaymentTermsField({
  value,
  onChange,
  disabled,
}: {
  value?: string
  onChange: (value: string | undefined) => void
  disabled?: boolean
}) {
  const { data: activeTerms = [], isLoading: loadingActive } = useActivePaymentTerms()
  const { data: selectedTerm, isLoading: loadingSelected } = usePaymentTerm(value)

  const options = paymentTermsToPicklistOptions(activeTerms)
  if (selectedTerm && !selectedTerm.isActive && !options.some((option) => option.value === selectedTerm.id)) {
    options.unshift({
      value: selectedTerm.id,
      label: `${selectedTerm.name} (inactive)`,
      description: `${selectedTerm.days} days`,
    })
  }

  if (loadingActive || (value && loadingSelected && !selectedTerm)) {
    return <Skeleton className="h-9 w-full rounded-[var(--radius-md)]" />
  }

  return (
    <ClientFormPicklist
      value={value ?? ''}
      onChange={(next) => onChange(next.trim() ? next : undefined)}
      options={options}
      placeholder="Select payment terms"
      panelTitle="Payment terms"
      ariaLabel="Payment terms"
      disabled={disabled}
      searchable
      searchPlaceholder="Search terms…"
      loading={loadingActive}
    />
  )
}

const CLIENT_ACQUISITION_SOURCE_OPTIONS = CLIENT_ACQUISITION_SOURCES.map((source) => ({
  value: source,
  label: CLIENT_ACQUISITION_SOURCE_LABELS[source],
}))

function acquisitionChannelOptions(source?: ClientAcquisitionSource) {
  return resolveClientAcquisitionChannels(source).map((channel) => ({
    value: channel,
    label: CLIENT_ACQUISITION_CHANNEL_LABELS[channel],
  }))
}

export function ClientAcquisitionSourceField({
  value,
  onChange,
  disabled,
}: {
  value?: ClientAcquisitionSource
  onChange: (value: ClientAcquisitionSource | undefined) => void
  disabled?: boolean
}) {
  return (
    <ClientFormPicklist
      value={value ?? ''}
      onChange={(next) => onChange(next ? (next as ClientAcquisitionSource) : undefined)}
      options={CLIENT_ACQUISITION_SOURCE_OPTIONS}
      placeholder="Select source"
      emptyOption={{ value: '', label: 'Select source' }}
      panelTitle="Source"
      ariaLabel="Client source"
      disabled={disabled}
      searchable
      searchPlaceholder="Search sources…"
    />
  )
}

export function ClientAcquisitionChannelField({
  source,
  value,
  onChange,
  disabled,
}: {
  source?: ClientAcquisitionSource
  value?: ClientAcquisitionChannel
  onChange: (value: ClientAcquisitionChannel | undefined) => void
  disabled?: boolean
}) {
  const options = acquisitionChannelOptions(source)
  const channelDisabled = disabled || !source
  const waitingForSource = !source

  return (
    <ClientFormPicklist
      value={value ?? ''}
      onChange={(next) => onChange(next ? (next as ClientAcquisitionChannel) : undefined)}
      options={options}
      placeholder={source ? 'Select channel' : 'Select source first'}
      emptyOption={{ value: '', label: source ? 'No channel specified' : 'Select source first' }}
      panelTitle={source ? `${CLIENT_ACQUISITION_SOURCE_LABELS[source]} — channel` : 'Channel'}
      ariaLabel="Client channel"
      disabled={channelDisabled}
      searchable={Boolean(source)}
      searchPlaceholder="Search channels…"
      className={waitingForSource ? 'border-dashed' : undefined}
    />
  )
}

const CLIENT_GENDER_ARIA_LABELS: Record<ClientGender, string> = {
  male: 'Male',
  female: 'Female',
}

const CLIENT_GENDER_FORM_LABELS: Record<ClientGender, string> = {
  male: 'M',
  female: 'F',
}

const CLIENT_GENDER_OPTIONS = CLIENT_GENDERS.map((gender) => ({
  value: gender,
  label: CLIENT_GENDER_FORM_LABELS[gender],
  ariaLabel: CLIENT_GENDER_ARIA_LABELS[gender],
}))

export function ClientGenderField({
  value,
  onChange,
  disabled,
  readOnly,
}: {
  value?: ClientGender
  onChange: (value: ClientGender | undefined) => void
  disabled?: boolean
  readOnly?: boolean
}) {
  const isProfileLayout = useClientFormProfileLayout()
  const isReadOnly = Boolean(readOnly)

  return (
    <div
      role="radiogroup"
      aria-label="Gender"
      data-profile-segmented={isProfileLayout ? '' : undefined}
      onKeyDown={(event) => {
        if (isReadOnly || disabled) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.stopPropagation()
          return
        }
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
        event.preventDefault()
        event.stopPropagation()
        const current = value ?? CLIENT_GENDERS[0]
        const index = CLIENT_GENDERS.indexOf(current)
        const delta = event.key === 'ArrowRight' ? 1 : -1
        const next = CLIENT_GENDERS[(index + delta + CLIENT_GENDERS.length) % CLIENT_GENDERS.length]
        onChange(next)
      }}
      className={cn(
        'relative flex h-9 w-full',
        isProfileLayout
          ? 'gap-2 border-0 bg-transparent p-0'
          : 'isolate rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]/55 p-1',
        isReadOnly && 'pointer-events-none',
      )}
    >
      {!isProfileLayout ? (
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-y-1 rounded-[var(--radius-sm)] bg-[var(--color-surface)] shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-[var(--color-border)] transition-[left,opacity,transform] duration-200 ease-out',
            value ? 'opacity-100' : 'pointer-events-none scale-[0.98] opacity-0',
          )}
          style={{
            width: 'calc(50% - 0.375rem)',
            left: value === 'female' ? 'calc(50% + 0.125rem)' : '0.25rem',
          }}
        />
      ) : null}
      {CLIENT_GENDER_OPTIONS.map((option) => {
        const selected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.ariaLabel}
            aria-readonly={isReadOnly || undefined}
            disabled={disabled}
            tabIndex={isReadOnly ? -1 : undefined}
            onClick={() => {
              if (isReadOnly || disabled) return
              onChange(option.value)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') event.stopPropagation()
            }}
            className={cn(
              'relative z-[1] flex flex-1 basis-0 items-center justify-center px-3 text-xs transition-[color,background-color,font-weight] duration-200',
              isProfileLayout
                ? cn(
                    'min-h-8 min-w-[3.5rem] rounded-[var(--radius-sm)] border px-2.5',
                    selected
                      ? 'border-[var(--color-accent)] !bg-[var(--color-accent)] font-semibold !text-white'
                      : 'border-[var(--color-border)] bg-transparent font-medium text-[var(--color-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-foreground)]',
                    'focus-visible:outline-none focus-visible:!ring-0',
                  )
                : cn(
                    selected
                      ? 'font-semibold text-[var(--color-accent)]'
                      : 'font-medium text-[var(--color-muted)] hover:text-[var(--color-foreground)]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/25 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-surface-muted)]',
                  ),
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function ClientAccountManagerField({
  value,
  onChange,
  disabled,
}: {
  value?: string
  onChange: (value: string | undefined) => void
  disabled?: boolean
}) {
  const { data: managers = [], isLoading } = useAccountManagers()
  const { data: selectedUser, isLoading: loadingSelected } = useUser(value)

  const options = accountManagersToPicklistOptions(managers)
  if (selectedUser && !selectedUser.isActive && !options.some((option) => option.value === selectedUser.id)) {
    options.unshift({
      value: selectedUser.id,
      label: `${selectedUser.name} (inactive)`,
    })
  }

  if (isLoading || (value && loadingSelected && !selectedUser)) {
    return <Skeleton className="h-9 w-full rounded-[var(--radius-md)]" />
  }

  return (
    <ClientFormPicklist
      value={value ?? ''}
      onChange={(next) => onChange(next.trim() ? next : undefined)}
      options={options}
      placeholder="Select account manager"
      emptyOption={{ value: '', label: 'Unassigned' }}
      panelTitle="Account manager"
      ariaLabel="Account manager"
      disabled={disabled}
      searchable
      searchPlaceholder="Search team members…"
      loading={isLoading}
    />
  )
}

const CLIENT_BILLING_ACCOUNT_PICKLIST_OPTIONS = CLIENT_BILLING_ACCOUNTS.map((account) => ({
  value: account,
  label: CLIENT_BILLING_ACCOUNT_LABELS[account],
  description: CLIENT_BILLING_ACCOUNT_DESCRIPTIONS[account],
}))

export function ClientBillingAccountField({
  value,
  onChange,
  disabled,
}: {
  value: ClientBillingAccount
  onChange: (value: ClientBillingAccount) => void
  disabled?: boolean
}) {
  return (
    <ClientFormPicklist
      value={value}
      onChange={(next) => onChange(next as ClientBillingAccount)}
      options={CLIENT_BILLING_ACCOUNT_PICKLIST_OPTIONS}
      placeholder="Select billing account"
      panelTitle="Billing account"
      ariaLabel="Billing account"
      disabled={disabled}
    />
  )
}

const CLIENT_CURRENCY_OPTIONS = buildCurrencyOptions().map((option) => ({
  value: option.value,
  label: option.value,
  description: getCurrencyName(option.value),
}))

export function ClientPaymentCurrenciesField({
  value,
  onChange,
  disabled,
}: {
  value?: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
}) {
  return (
    <FormMultiPicklist
      value={value ?? []}
      onChange={onChange}
      options={CLIENT_CURRENCY_OPTIONS}
      placeholder="Select payment currencies"
      panelTitle="Payment currencies"
      ariaLabel="Payment currencies"
      disabled={disabled}
      searchable
      searchPlaceholder="Search code or name…"
    />
  )
}

export function ClientCreditCurrencyField({
  value,
  onChange,
  disabled,
}: {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  return (
    <ClientFormPicklist
      value={value?.trim() || 'EGP'}
      onChange={onChange}
      options={CLIENT_CURRENCY_OPTIONS}
      placeholder="Select credit currency"
      panelTitle="Credit currency"
      ariaLabel="Credit currency"
      disabled={disabled}
      searchable
      searchPlaceholder="Search code or name…"
    />
  )
}

export function ClientCreditLimitField({
  creditLimit,
  currency,
  onCreditLimitChange,
  onCurrencyChange,
  disabled,
}: {
  creditLimit?: number
  currency?: string
  onCreditLimitChange: (value: number) => void
  onCurrencyChange: (value: string) => void
  disabled?: boolean
}) {
  return (
    <div
      className={cn(
        'flex h-9 items-stretch overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors focus-within:border-[var(--color-accent)] focus-within:ring-2 focus-within:ring-[var(--color-accent)]/20',
      )}
    >
      <div className="w-[6.75rem] shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface-muted)]/40">
        <ClientFormPicklist
          value={currency?.trim() || 'EGP'}
          onChange={onCurrencyChange}
          options={CLIENT_CURRENCY_OPTIONS}
          variant="ghost"
          size="md"
          fullWidth
          searchable
          searchPlaceholder="Search code or name…"
          panelTitle="Currency"
          ariaLabel="Credit limit currency"
          disabled={disabled}
          panelClassName="!w-[20rem]"
          className="h-full rounded-none"
        />
      </div>
      <AmountInput
        value={creditLimit ?? 0}
        onChange={onCreditLimitChange}
        disabled={disabled}
        decimals={0}
        emptyWhenZero
        dir="ltr"
        className="h-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-2.5 text-left font-mono tabular-nums shadow-none focus-visible:ring-0"
      />
    </div>
  )
}

/** @deprecated Use ClientCreditCurrencyField for client credit line currency. */
export function ClientCurrencyField({
  value,
  onChange,
  disabled,
}: {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  return (
    <ClientFormPicklist
      value={value?.trim() || 'EGP'}
      onChange={onChange}
      options={CLIENT_CURRENCY_OPTIONS}
      placeholder="Select currency"
      panelTitle="Currency"
      ariaLabel="Currency"
      disabled={disabled}
      searchable
      searchPlaceholder="Search code or name…"
    />
  )
}

export function ClientCustomerTierField({
  value,
  onChange,
  disabled,
}: {
  value?: ClientCustomerTier
  onChange: (value: ClientCustomerTier | undefined) => void
  disabled?: boolean
}) {
  const options = CLIENT_CUSTOMER_TIERS.map((tier) => ({
    value: tier,
    label: CLIENT_CUSTOMER_TIER_LABELS[tier],
  }))

  return (
    <ClientFormPicklist
      value={value ?? ''}
      onChange={(next) => onChange(next ? (next as ClientCustomerTier) : undefined)}
      options={options}
      placeholder="Select tier"
      emptyOption={{ value: '', label: 'Select tier' }}
      panelTitle="Customer tier"
      ariaLabel="Customer tier"
      disabled={disabled}
      searchable
      searchPlaceholder="Search tiers…"
    />
  )
}

export function ClientStatusField({
  value,
  onChange,
  disabled,
}: {
  value: ClientStatus
  onChange: (value: ClientStatus) => void
  disabled?: boolean
}) {
  return (
    <SegmentedField
      aria-label="Client status"
      value={value}
      disabled={disabled}
      onChange={onChange}
      options={CLIENT_STATUSES.map((status) => ({ value: status, label: CLIENT_STATUS_LABELS[status] }))}
    />
  )
}

export function ClientMembershipField({
  value,
  onChange,
  disabled,
}: {
  value: ClientMembership
  onChange: (value: ClientMembership) => void
  disabled?: boolean
}) {
  return (
    <SegmentedField
      aria-label="Membership enrollment"
      value={value}
      disabled={disabled}
      onChange={onChange}
      options={CLIENT_MEMBERSHIPS.map((membership) => ({
        value: membership,
        label: CLIENT_MEMBERSHIP_LABELS[membership],
      }))}
    />
  )
}
