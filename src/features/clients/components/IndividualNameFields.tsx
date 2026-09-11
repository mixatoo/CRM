import type { Ref } from 'react'
import { Lock } from 'lucide-react'
import { CrmFieldGrid, CrmInputCell } from '@/design-system/layout/CrmPanel'
import { FormField } from '@/features/clients/components/client-form-ui'
import { clientFormRow3Class } from '@/features/clients/components/client-form-shared'
import { useClientFormProfileLayout } from '@/features/clients/components/client-form-profile-layout-context'
import { requiredFieldControlProps } from '@/design-system/components/FieldLabel'
import { ProfileInput } from '@/features/clients/components/profile/ProfileCrmFieldRow'
import { patchIndividualNameFields, previewClientDisplayName } from '@/domain/entities/client'
import type { ClientFormInput } from '@/features/clients/hooks/use-client-mutations'
import { cn } from '@/shared/utils/cn'
import { formatNameWhileTyping, normalizeNameField } from '@/shared/utils/text-format'

type OnChange = <K extends keyof ClientFormInput>(key: K, value: ClientFormInput[K]) => void

interface IndividualNameFieldsProps {
  form: ClientFormInput
  onChange: OnChange
  onPatch?: (patch: Partial<ClientFormInput>) => void
  disabled?: boolean
  layout: 'form' | 'panel' | 'profile'
  firstNameRef?: Ref<HTMLInputElement>
  showNameHint?: boolean
  includeDisplayName?: boolean
}

function applyNamePatch(
  form: ClientFormInput,
  patch: Partial<Pick<ClientFormInput, 'firstName' | 'middleName' | 'lastName'>>,
  onChange: OnChange,
  onPatch?: (patch: Partial<ClientFormInput>) => void,
) {
  const next = patchIndividualNameFields(form, patch)
  if (onPatch) {
    onPatch(next)
    return
  }
  ;(Object.keys(next) as Array<keyof typeof next>).forEach((key) => {
    onChange(key, next[key])
  })
}

type NameField = 'firstName' | 'middleName' | 'lastName'

const MIDDLE_NAME_HINT = 'Stored on profile only — not shown on trips or invoices'
export const DISPLAY_NAME_HINT = 'Built from first and last name — shown on trips, lists, and invoices'

function displayNameHint(value?: string) {
  if (value?.trim()) return undefined
  return DISPLAY_NAME_HINT
}

export function DisplayNamePreview({ value, disabled }: { value: string; disabled?: boolean }) {
  const hasValue = Boolean(value.trim())

  return (
    <div className="relative min-w-0" aria-live="polite">
      <ProfileInput
        value={value}
        readOnly
        tabIndex={-1}
        placeholder="—"
        disabled={disabled}
        aria-readonly
        aria-label={hasValue ? `Display name preview: ${value}` : 'Display name preview pending first and last name'}
        className={cn(
          'cursor-default pr-9',
          hasValue ? 'font-medium text-[var(--color-foreground)]' : 'text-[var(--color-muted)]',
        )}
      />
      <Lock
        className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-subtle)]"
        aria-hidden
      />
    </div>
  )
}

function NameInputs({
  form,
  onChange,
  onPatch,
  disabled,
  firstNameRef,
  showNameHint,
}: {
  form: ClientFormInput
  onChange: OnChange
  onPatch?: (patch: Partial<ClientFormInput>) => void
  disabled?: boolean
  firstNameRef?: Ref<HTMLInputElement>
  showNameHint?: boolean
}) {
  const isProfileLayout = useClientFormProfileLayout()
  const firstShowPlaceholder = showNameHint || (isProfileLayout && !form.firstName?.trim())
  const lastShowPlaceholder = showNameHint || (isProfileLayout && !form.lastName?.trim())
  const firstRequired = requiredFieldControlProps(
    form.firstName,
    firstShowPlaceholder,
    isProfileLayout ? '' : 'Ibrahim',
    { showError: Boolean(showNameHint) },
  )
  const lastRequired = requiredFieldControlProps(
    form.lastName,
    lastShowPlaceholder,
    isProfileLayout ? '' : 'Mohamed',
    { showError: Boolean(showNameHint) },
  )

  const handleBlur = (field: NameField, value: string) => {
    const collapsed = value.trim().replace(/\s+/g, ' ')
    const formatted = normalizeNameField(value)
    if (formatted !== collapsed) {
      applyNamePatch(form, { [field]: formatted }, onChange, onPatch)
    }
  }

  return {
    first: (
      <ProfileInput
        ref={firstNameRef}
        value={form.firstName ?? ''}
        onChange={(event) =>
          applyNamePatch(
            form,
            { firstName: formatNameWhileTyping(event.target.value) },
            onChange,
            onPatch,
          )
        }
        onBlur={() => handleBlur('firstName', form.firstName ?? '')}
        disabled={disabled}
        autoFocus={!isProfileLayout && firstNameRef == null}
        aria-required
        {...firstRequired}
      />
    ),
    middle: (
      <ProfileInput
        value={form.middleName ?? ''}
        onChange={(event) =>
          applyNamePatch(
            form,
            { middleName: formatNameWhileTyping(event.target.value) },
            onChange,
            onPatch,
          )
        }
        onBlur={() => handleBlur('middleName', form.middleName ?? '')}
        placeholder="Mahmoud"
        disabled={disabled}
      />
    ),
    last: (
      <ProfileInput
        value={form.lastName ?? ''}
        onChange={(event) =>
          applyNamePatch(
            form,
            { lastName: formatNameWhileTyping(event.target.value) },
            onChange,
            onPatch,
          )
        }
        onBlur={() => handleBlur('lastName', form.lastName ?? '')}
        disabled={disabled}
        aria-required
        {...lastRequired}
      />
    ),
  }
}

export function IndividualDisplayNameField({
  form,
  disabled,
  layout,
  embedded = false,
}: {
  form: ClientFormInput
  disabled?: boolean
  layout: 'form' | 'panel' | 'profile'
  embedded?: boolean
}) {
  const displayPreview = previewClientDisplayName(form.firstName, form.lastName)

  if (layout === 'form' || layout === 'profile') {
    return (
      <FormField label="Display name">
        <DisplayNamePreview value={displayPreview} disabled={disabled} />
      </FormField>
    )
  }

  const panelContent = (
    <CrmFieldGrid columns={2}>
      <CrmInputCell label="Display name" hint={displayNameHint(displayPreview)} className="sm:col-span-2">
        <DisplayNamePreview value={displayPreview} disabled={disabled} />
      </CrmInputCell>
    </CrmFieldGrid>
  )

  if (embedded) return panelContent

  return (
    <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-muted)]/10">
      {panelContent}
    </div>
  )
}

export function IndividualNameFields({
  form,
  onChange,
  onPatch,
  disabled,
  layout,
  firstNameRef,
  showNameHint,
  includeDisplayName = true,
}: IndividualNameFieldsProps) {
  const displayPreview = previewClientDisplayName(form.firstName, form.lastName)
  const inputs = NameInputs({ form, onChange, onPatch, disabled, firstNameRef, showNameHint })

  const isProfileLayout = useClientFormProfileLayout()
  const useFormLayout = layout === 'form' || layout === 'profile'

  if (useFormLayout) {
    const nameFields = (
      <>
        <FormField label="First name" required fieldKey="firstName">
          {inputs.first}
        </FormField>
        <FormField label="Middle name" optional hint={MIDDLE_NAME_HINT} fieldKey="middleName">
          {inputs.middle}
        </FormField>
        <FormField label="Last name" required fieldKey="lastName">
          {inputs.last}
        </FormField>
      </>
    )

    return (
      <>
        {layout === 'profile' || isProfileLayout ? (
          nameFields
        ) : (
          <div className="flex flex-col gap-1.5">
            <div className={clientFormRow3Class}>{nameFields}</div>
          </div>
        )}
        {includeDisplayName ? (
          <FormField label="Display name" hint={displayNameHint(displayPreview)}>
            <DisplayNamePreview value={displayPreview} disabled={disabled} />
          </FormField>
        ) : null}
      </>
    )
  }

  return (
    <div className="space-y-2 sm:col-span-2">
      <CrmFieldGrid columns={3}>
        <CrmInputCell label="First name" required>{inputs.first}</CrmInputCell>
        <CrmInputCell label="Middle name" optional hint={MIDDLE_NAME_HINT}>
          {inputs.middle}
        </CrmInputCell>
        <CrmInputCell label="Last name" required>{inputs.last}</CrmInputCell>
        {includeDisplayName ? (
          <CrmInputCell label="Display name" hint={displayNameHint(displayPreview)} className="sm:col-span-3">
            <DisplayNamePreview value={displayPreview} disabled={disabled} />
          </CrmInputCell>
        ) : null}
      </CrmFieldGrid>
    </div>
  )
}
