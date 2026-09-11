import { ChevronDown, Check } from 'lucide-react'
import { cn } from '../utils/cn'
import { INPUT_FIELD_TEXT_CLASS } from '../components/Input'

export type FormPicklistSize = 'xs' | 'sm' | 'md'
export type FormPicklistVariant = 'default' | 'ghost'

export const FORM_PICKLIST_MENU_ITEM_CLASS =
  'flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2.5 text-left text-xs transition-colors'

export const FORM_PICKLIST_PANEL_CLASS =
  'z-[620] flex max-h-[min(20rem,var(--radix-popover-content-available-height))] w-[var(--radix-popover-trigger-width)] min-w-[min(100%,18rem)] max-w-[min(24rem,calc(100vw-1rem))] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] shadow-[0_8px_30px_rgba(0,0,0,0.12)] outline-none'

export const FORM_PICKLIST_PANEL_SELECTOR = '[data-form-picklist-panel]'

export function isFormPicklistKeyboardTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return Boolean(
    target.closest(FORM_PICKLIST_PANEL_SELECTOR) ||
      target.closest('button[aria-haspopup="listbox"][aria-expanded="true"]'),
  )
}

export function focusFormPicklistTrigger(trigger: HTMLElement | null | undefined) {
  requestAnimationFrame(() => {
    trigger?.focus({ preventScroll: true })
  })
}

export function handleFormPicklistCloseAutoFocus(event: Event, trigger: HTMLElement | null | undefined) {
  event.preventDefault()
  focusFormPicklistTrigger(trigger)
}

/** Close picklist panel on Tab and restore trigger focus (listbox arrow-key pattern). */
export function handlePicklistPanelTabKey(event: { key: string; preventDefault: () => void; stopPropagation: () => void }) {
  if (event.key !== 'Tab') return false
  event.preventDefault()
  event.stopPropagation()
  return true
}

const SIZE_CONFIG: Record<
  FormPicklistSize,
  { height: string; padding: string; chevronBox: string; chevronIcon: string; inputAffordancePad: string }
> = {
  xs: {
    height: 'h-7',
    padding: 'pl-2 pr-1',
    chevronBox: 'h-5 w-5',
    chevronIcon: 'h-3 w-3',
    inputAffordancePad: 'pr-7',
  },
  sm: {
    height: 'h-8',
    padding: 'pl-2 pr-1',
    chevronBox: 'h-5 w-5',
    chevronIcon: 'h-3 w-3',
    inputAffordancePad: 'pr-7',
  },
  md: {
    height: 'h-9',
    padding: 'pl-2.5 pr-1.5',
    chevronBox: 'h-6 w-6',
    chevronIcon: 'h-3.5 w-3.5',
    inputAffordancePad: 'pr-9',
  },
}

export const FORM_PICKLIST_SIZE_CONFIG = SIZE_CONFIG

export function getFormFieldAffordanceClassName(
  size: FormPicklistSize = 'md',
  { open, disabled }: { open?: boolean; disabled?: boolean } = {},
) {
  const sizeConfig = SIZE_CONFIG[size]

  return {
    box: cn(
      'flex shrink-0 items-center justify-center rounded-[var(--radius-sm)] transition-colors',
      sizeConfig.chevronBox,
      'border border-[var(--color-border)] bg-[var(--color-surface-muted)]/70',
      'hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-muted)]',
      open && 'border-[var(--color-accent)]/30 bg-[var(--color-accent-muted)]/35',
      disabled && 'border-[var(--color-border)] bg-[var(--color-surface-muted)]/50 opacity-70',
    ),
    icon: sizeConfig.chevronIcon,
    inputAffordancePad: sizeConfig.inputAffordancePad,
  }
}

export function PicklistRadio({ selected, muted }: { selected: boolean; muted?: boolean }) {
  return (
    <span
      className={cn(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors',
        selected
          ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
          : muted
            ? 'border-[var(--color-border)] bg-transparent'
            : 'border-[var(--color-border-strong)] bg-[var(--color-surface)]',
      )}
      aria-hidden
    >
      {selected ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : null}
    </span>
  )
}

export function getFormPicklistTriggerClassName({
  size = 'md',
  variant = 'default',
  fullWidth = true,
  hasValue,
  open,
  disabled,
  error,
  focusStyle = 'default',
  className,
}: {
  size?: FormPicklistSize
  variant?: FormPicklistVariant
  fullWidth?: boolean
  hasValue: boolean
  open: boolean
  disabled?: boolean
  error?: boolean
  focusStyle?: 'default' | 'neutral'
  className?: string
}) {
  const sizeConfig = SIZE_CONFIG[size]

  return cn(
    'group flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] transition-[border-color,box-shadow,background-color]',
    INPUT_FIELD_TEXT_CLASS,
    sizeConfig.height,
    sizeConfig.padding,
    fullWidth ? 'w-full' : 'w-auto min-w-[8rem] shrink-0',
    variant === 'ghost'
      ? cn(
          'border-0 bg-transparent shadow-none',
          'hover:bg-[var(--color-surface-muted)]/45',
          open && 'bg-[var(--color-surface-muted)]/35 ring-0',
        )
      : cn(
          focusStyle === 'neutral'
            ? cn(
                'rounded-[var(--radius-md)] border-0 bg-transparent shadow-none',
                'hover:bg-[var(--color-surface-muted)]/18',
                'focus:border focus:border-[var(--color-border-strong)] focus:bg-[var(--color-surface)]/85 focus:outline-none focus:ring-0 focus:shadow-none focus-visible:outline-none focus-visible:outline-offset-0 focus-visible:ring-0',
                open && 'border border-[var(--color-border-strong)] bg-[var(--color-surface)]/85 ring-0',
                disabled && 'cursor-not-allowed opacity-50',
              )
            : cn(
                'border bg-[var(--color-surface)]',
                hasValue ? 'border-[var(--color-border-strong)]' : 'border-[var(--color-border)]',
                'hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-elevated)]/40',
                'focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20',
                open && 'border-[var(--color-accent)] bg-[var(--color-surface)] ring-2 ring-[var(--color-accent)]/20',
                disabled &&
                  'cursor-not-allowed border-[var(--color-border)] bg-[var(--color-surface-muted)]/45 hover:bg-[var(--color-surface-muted)]/45',
              ),
          focusStyle === 'neutral' && error && 'border-[var(--color-danger)]/65 bg-[var(--color-danger-muted)]/20',
          focusStyle === 'default' && error && 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]/20',
        ),
    className,
  )
}

export function FormPicklistChevron({
  size = 'md',
  variant = 'default',
  open,
  hasValue,
  disabled,
}: {
  size?: FormPicklistSize
  variant?: FormPicklistVariant
  open: boolean
  hasValue: boolean
  disabled?: boolean
}) {
  const affordance = getFormFieldAffordanceClassName(size, { open, disabled })

  return (
    <span
      className={cn(
        affordance.box,
        variant === 'ghost' && 'border-0 bg-transparent',
        variant !== 'ghost' &&
          'group-hover:border-[var(--color-border-strong)] group-hover:bg-[var(--color-surface-muted)]',
      )}
      aria-hidden
    >
      <ChevronDown
        className={cn(
          affordance.icon,
          'text-[var(--color-muted)] transition-transform duration-200',
          open && 'rotate-180 text-[var(--color-accent)]',
          hasValue && !open && 'text-[var(--color-foreground)]/70',
        )}
      />
    </span>
  )
}

export function FormPicklistPanelHeader({
  panelTitle,
  ariaLabel,
  activeLabel,
  hasValue,
  loading,
  optionCount,
}: {
  panelTitle?: string
  ariaLabel: string
  activeLabel: string
  hasValue: boolean
  loading?: boolean
  optionCount: number
}) {
  return (
    <div className="shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/30 px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-[var(--color-foreground)]">{panelTitle ?? ariaLabel}</p>
        {!loading && optionCount > 0 ? (
          <span className="shrink-0 rounded-full bg-[var(--color-surface)] px-1.5 py-0.5 text-[10px] tabular-nums text-[var(--color-muted)] ring-1 ring-[var(--color-border)]">
            {optionCount}
          </span>
        ) : null}
      </div>
      <p
        className={cn(
          'mt-0.5 truncate text-[11px]',
          hasValue ? 'font-medium text-[var(--color-foreground)]' : 'text-[var(--color-muted)]',
        )}
      >
        {loading ? 'Loading…' : activeLabel}
      </p>
    </div>
  )
}
