import { createContext, useContext, type ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

const ClientFormWizardCrmContext = createContext(false)

export function ClientFormWizardCrmProvider({ children }: { children: ReactNode }) {
  return (
    <ClientFormWizardCrmContext.Provider value={true}>
      <div data-client-form-wizard="">{children}</div>
    </ClientFormWizardCrmContext.Provider>
  )
}

export function useClientFormWizardCrm() {
  return useContext(ClientFormWizardCrmContext)
}

const wizardCrmTransition = 'transition-[background-color,border-color,box-shadow] duration-150 ease-out'

/** Clear active field — accent border + soft glow (single layer, no outline gap). */
const wizardCrmActiveClassName = cn(
  'focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)]',
  'focus:shadow-[0_0_0_3px_var(--color-accent-muted)]',
  'focus:outline-none focus:ring-0',
  'focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-[0_0_0_3px_var(--color-accent-muted)]',
)

/** New-client wizard — calm at rest, obvious when focused. */
export const wizardCrmInputClassName = cn(
  wizardCrmTransition,
  'border-[var(--color-border)] bg-[var(--color-surface-muted)]/25 font-normal tracking-normal',
  'hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-muted)]/40',
  wizardCrmActiveClassName,
)

/** Read-only derived values — no focus affordance. */
export const wizardCrmDerivedInputClassName = cn(
  wizardCrmTransition,
  'border-[var(--color-border)]/70 bg-[var(--color-surface-muted)]/45 font-normal tracking-normal text-[var(--color-muted)]',
  'hover:border-[var(--color-border)]/70 hover:bg-[var(--color-surface-muted)]/45',
  'focus:border-[var(--color-border)]/70 focus:bg-[var(--color-surface-muted)]/45 focus:ring-0 focus:shadow-none',
  'focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none',
  'cursor-default',
)

export const wizardCrmPicklistClassName = cn(
  wizardCrmInputClassName,
  'aria-expanded:border-[var(--color-accent)] aria-expanded:bg-[var(--color-surface)]',
  'aria-expanded:shadow-[0_0_0_3px_var(--color-accent-muted)] aria-expanded:ring-0',
)
