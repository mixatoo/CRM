import type { ReactNode } from 'react'
import { forwardRef } from 'react'
import { Check } from 'lucide-react'
import { Input, type InputProps } from '@/design-system/components/Input'
import {
  dashboardFieldLabelClassName,
} from '@/features/clients/components/dashboard/client-dashboard-chrome'
import { useClientFormWizardCrm, wizardCrmDerivedInputClassName, wizardCrmInputClassName } from '@/features/clients/components/client-form-wizard-ui'
import { useClientFormFieldState } from '@/features/clients/components/client-form-modified-context'
import { useClientFormProfileLayout } from '@/features/clients/components/client-form-profile-layout-context'
import { fieldOptionalLabelClassName } from '@/design-system/components/FieldLabel'
import { cn } from '@/shared/utils/cn'

export const profileCrmFieldControlClassName =
  'w-sm shrink-0 [&_input]:w-full [&_textarea]:w-full [&_button[aria-haspopup=listbox]]:w-full [&_[data-date-picker-field]]:relative [&_[data-date-picker-field]>button]:!pointer-events-auto [&_[data-date-picker-field]>button]:!absolute [&_[data-date-picker-field]>button]:!right-1 [&_[data-date-picker-field]>button]:!top-1/2 [&_[data-date-picker-field]>button]:!w-auto [&_[data-date-picker-field]>button]:!-translate-y-1/2 [&_[data-date-picker-field]>button]:!shrink-0'

const profileFocusReset =
  'focus:outline-none focus-visible:!outline-none focus-visible:!outline-offset-0'

const profileBoxChrome =
  '!rounded-[var(--radius-md)] !shadow-none !ring-0 transition-[background-color,border-color,box-shadow]'

/** Editable: ghost at rest → boxed while editing. */
export const profileCrmInputClassName =
  `${profileBoxChrome} ${profileFocusReset} !border-0 bg-transparent hover:bg-[var(--color-surface-muted)]/18 focus:!border-[0.5px] focus:!border-[var(--color-border-strong)] focus:bg-[var(--color-surface)]/85 focus:!ring-0 focus:!shadow-none`

/** Read-only: plain text, no fill or frame. */
export const profileCrmReadOnlyInputClassName =
  `${profileBoxChrome} ${profileFocusReset} !border-0 bg-transparent cursor-default hover:bg-transparent focus:!ring-0`

export const profileCrmDateInputClassName = `${profileCrmInputClassName} !pr-9`

export const profileCrmPicklistClassName =
  `${profileBoxChrome} ${profileFocusReset} !border-0 bg-transparent hover:bg-[var(--color-surface-muted)]/18 focus:!border-[0.5px] focus:!border-[var(--color-border-strong)] focus:bg-[var(--color-surface)]/85 focus:!ring-0 focus:!shadow-none`

export const profileCrmInputErrorClassName =
  'bg-[var(--color-danger-muted)]/20 focus:!border-[var(--color-danger)]/65 focus:!ring-0'

export function useProfileCrmInputProps(
  className?: string,
  options?: { error?: boolean; readOnly?: boolean },
) {
  const isProfileLayout = useClientFormProfileLayout()
  const isWizardCrm = useClientFormWizardCrm()
  if (!isProfileLayout) {
    return {
      className: cn(
        isWizardCrm && (options?.readOnly ? wizardCrmDerivedInputClassName : wizardCrmInputClassName),
        className,
      ),
      focusStyle: (isWizardCrm ? 'neutral' : 'default') as const,
    }
  }
  return {
    className: cn(
      options?.readOnly ? profileCrmReadOnlyInputClassName : profileCrmInputClassName,
      options?.error && profileCrmInputErrorClassName,
      className,
    ),
    focusStyle: 'neutral' as const,
  }
}

export function useProfileCrmFocusStyle(): 'default' | 'neutral' {
  const isProfileLayout = useClientFormProfileLayout()
  const isWizardCrm = useClientFormWizardCrm()
  return isProfileLayout || isWizardCrm ? 'neutral' : 'default'
}

export const ProfileInput = forwardRef<HTMLInputElement, InputProps>(function ProfileInput(
  { className, focusStyle, error, readOnly, ...props },
  ref,
) {
  const profileProps = useProfileCrmInputProps(className, {
    error: Boolean(error),
    readOnly: Boolean(readOnly),
  })
  return (
    <Input
      ref={ref}
      {...props}
      readOnly={readOnly}
      error={error}
      focusStyle={focusStyle ?? profileProps.focusStyle}
      className={profileProps.className}
    />
  )
})
ProfileInput.displayName = 'ProfileInput'

/** Ghost controls that box on focus/open — no accent outline. */
export const profileCrmInputInteractionClassName =
  [
    '[&_input:not([readonly])]:!rounded-[var(--radius-md)] [&_input:not([readonly])]:!border-0 [&_input:not([readonly])]:bg-transparent [&_input:not([readonly])]:!ring-0 [&_input:not([readonly])]:!shadow-none',
    '[&_input:not([readonly])]:transition-[background-color,border-color,box-shadow]',
    '[&_input:not([readonly])]:hover:bg-[var(--color-surface-muted)]/18',
    '[&_input:not([readonly])]:focus:outline-none [&_input:not([readonly])]:focus-visible:!outline-none [&_input:not([readonly])]:focus-visible:!outline-offset-0 [&_input:not([readonly])]:focus:!ring-0 [&_input:not([readonly])]:focus:!shadow-none [&_input:not([readonly])]:focus-visible:!ring-0',
    '[&_input:not([readonly])]:focus:!border-[0.5px] [&_input:not([readonly])]:focus:!border-[var(--color-border-strong)] [&_input:not([readonly])]:focus:bg-[var(--color-surface)]/85',
    '[&_input[readonly]]:!rounded-[var(--radius-md)] [&_input[readonly]]:!border-0 [&_input[readonly]]:bg-transparent [&_input[readonly]]:focus:!ring-0',
    '[&_textarea]:!rounded-[var(--radius-md)] [&_textarea]:!border-0 [&_textarea]:bg-transparent [&_textarea]:!ring-0 [&_textarea]:!shadow-none',
    '[&_textarea]:transition-[background-color,border-color,box-shadow]',
    '[&_textarea]:hover:bg-[var(--color-surface-muted)]/18',
    '[&_textarea]:focus:outline-none [&_textarea]:focus-visible:!outline-none [&_textarea]:focus-visible:!outline-offset-0 [&_textarea]:focus:!ring-0 [&_textarea]:focus:!shadow-none [&_textarea]:focus-visible:!ring-0',
    '[&_textarea]:focus:!border-[0.5px] [&_textarea]:focus:!border-[var(--color-border-strong)] [&_textarea]:focus:bg-[var(--color-surface)]/85',
    '[&_button[aria-haspopup=listbox]]:!rounded-[var(--radius-md)] [&_button[aria-haspopup=listbox]]:!border-0 [&_button[aria-haspopup=listbox]]:bg-transparent [&_button[aria-haspopup=listbox]]:!ring-0 [&_button[aria-haspopup=listbox]]:!shadow-none',
    '[&_button[aria-haspopup=listbox]]:transition-[background-color,border-color,box-shadow]',
    '[&_button[aria-haspopup=listbox]]:hover:bg-[var(--color-surface-muted)]/18',
    '[&_button[aria-haspopup=listbox]]:focus:outline-none [&_button[aria-haspopup=listbox]]:focus-visible:!outline-none [&_button[aria-haspopup=listbox]]:focus-visible:!outline-offset-0 [&_button[aria-haspopup=listbox]]:focus:!ring-0 [&_button[aria-haspopup=listbox]]:focus:!shadow-none [&_button[aria-haspopup=listbox]]:focus-visible:!ring-0',
    '[&_button[aria-haspopup=listbox]]:focus:!border-[0.5px] [&_button[aria-haspopup=listbox]]:focus:!border-[var(--color-border-strong)] [&_button[aria-haspopup=listbox]]:focus:bg-[var(--color-surface)]/85',
    '[&_button[aria-haspopup=listbox][aria-expanded=true]]:!ring-0 [&_button[aria-haspopup=listbox][aria-expanded=true]]:!shadow-none',
    '[&_button[aria-haspopup=listbox][aria-expanded=true]]:!border-[0.5px] [&_button[aria-haspopup=listbox][aria-expanded=true]]:!border-[var(--color-border-strong)] [&_button[aria-haspopup=listbox][aria-expanded=true]]:bg-[var(--color-surface)]/85',
    '[&_[data-date-picker-field]>button]:!flex [&_[data-date-picker-field]>button]:!h-6 [&_[data-date-picker-field]>button]:!w-6 [&_[data-date-picker-field]>button]:!items-center [&_[data-date-picker-field]>button]:!justify-center [&_[data-date-picker-field]>button]:!rounded-[var(--radius-sm)] [&_[data-date-picker-field]>button]:!border-0 [&_[data-date-picker-field]>button]:!bg-transparent [&_[data-date-picker-field]>button]:!shadow-none',
    '[&_[data-date-picker-field]>button]:hover:!border-[var(--color-border-strong)] [&_[data-date-picker-field]>button]:hover:!bg-[var(--color-surface-muted)]',
    '[&_[data-date-picker-field]>button]:focus:!border-[var(--color-border-strong)] [&_[data-date-picker-field]>button]:focus:!bg-[var(--color-surface-muted)] [&_[data-date-picker-field]>button]:focus-visible:!outline-none',
    '[&_[role=radiogroup]]:border-0 [&_[role=radiogroup]]:bg-transparent [&_[role=radiogroup]]:p-0',
    '[&_[role=radiogroup]:not([data-profile-segmented])_button]:!bg-transparent [&_[role=radiogroup]:not([data-profile-segmented])_button]:!shadow-none [&_[role=radiogroup]:not([data-profile-segmented])_button]:!ring-0',
    '[&_[role=radiogroup]_button]:focus-visible:!outline-none [&_[role=radiogroup]_button]:focus-visible:!outline-offset-0 [&_[role=radiogroup]_button]:focus-visible:!ring-0',
  ].join(' ')

export function ProfileCrmFieldsShell({ children }: { children: ReactNode }) {
  return <div data-profile-crm-field>{children}</div>
}

function ProfileFieldModifiedBadge() {
  return (
    <span
      data-profile-modified-badge
      className={cn(
        'pointer-events-none absolute top-1/2 z-10 flex -translate-y-1/2 items-center justify-center text-[var(--color-success)]',
        'right-2.5',
        '[[data-profile-crm-field-control]:has([data-date-picker-field])_&]:right-9',
      )}
      title="Modified"
      aria-label="Modified"
    >
      <Check className="h-2.5 w-2.5" strokeWidth={3} aria-hidden />
    </span>
  )
}

export const profileCrmModifiedFieldClassName =
  '[&_input:not([readonly])]:!pr-8 [&_input[readonly]]:!pr-8 [&_textarea]:!pr-8 [&_button[aria-haspopup=listbox]]:!pr-8 [&:has([data-date-picker-field])_input]:!pr-16'

export function ProfileCrmFieldRow({
  label,
  optional,
  fieldKey,
  children,
  className,
}: {
  label: string
  required?: boolean
  optional?: boolean
  fieldKey?: string
  children: ReactNode
  className?: string
}) {
  const { isModified } = useClientFormFieldState(fieldKey)

  return (
    <div
      className={cn(
        'flex min-h-11 w-full min-w-0 items-center justify-between gap-x-6 border-b border-[var(--color-border)]/40 px-3 py-2.5 last:border-b-0 sm:gap-x-10 sm:px-5',
        className,
      )}
    >
      <div className="flex min-w-0 items-baseline gap-1.5 pr-4">
        <span className={dashboardFieldLabelClassName}>
          {label}
          {optional ? <span className={fieldOptionalLabelClassName}>(optional)</span> : null}
        </span>
      </div>
      <div
        data-profile-crm-field
        data-profile-crm-field-control
        className={cn(
          'relative',
          profileCrmFieldControlClassName,
          profileCrmInputInteractionClassName,
          isModified && profileCrmModifiedFieldClassName,
        )}
      >
        {children}
        {isModified ? <ProfileFieldModifiedBadge /> : null}
      </div>
    </div>
  )
}
