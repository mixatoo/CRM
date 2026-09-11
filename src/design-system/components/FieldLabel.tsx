import type { ReactNode } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { CircleHelp } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

interface FieldHeaderProps {
  label: string
  hint?: string
  required?: boolean
  optional?: boolean
  className?: string
  labelClassName?: string
  title?: string
  trailing?: ReactNode
}

/** Subtle optional suffix on labels. */
export const fieldOptionalLabelClassName =
  'ml-1.5 text-[10px] font-normal normal-case tracking-normal text-[var(--color-subtle)]'

/** In-field placeholder when a required value is missing after validation. */
export const REQUIRED_FIELD_PLACEHOLDER = '(required)'

export const requiredFieldPlaceholderClassName =
  'placeholder:text-[9px] placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-[var(--color-danger)]/85'

export function resolveRequiredFieldPlaceholder(
  value: string | undefined | null,
  showRequiredHint: boolean | undefined,
  fallbackPlaceholder: string,
): string {
  if (!value?.trim() && showRequiredHint) return REQUIRED_FIELD_PLACEHOLDER
  return fallbackPlaceholder
}

export function requiredFieldInputProps(
  value: string | undefined | null,
  showRequiredHint: boolean | undefined,
  fallbackPlaceholder: string,
): { placeholder: string; className?: string } {
  const showRequired = !value?.trim() && Boolean(showRequiredHint)
  return {
    placeholder: resolveRequiredFieldPlaceholder(value, showRequiredHint, fallbackPlaceholder),
    className: showRequired ? requiredFieldPlaceholderClassName : undefined,
  }
}

export function requiredFieldControlProps(
  value: string | undefined | null,
  showPlaceholderHint: boolean | undefined,
  fallbackPlaceholder: string,
  options?: { showError?: boolean },
) {
  const placeholderProps = requiredFieldInputProps(value, showPlaceholderHint, fallbackPlaceholder)
  const showError = options?.showError ?? Boolean(showPlaceholderHint)
  const missing = !value?.trim() && showError
  return {
    ...placeholderProps,
    error: missing,
    'aria-invalid': missing || undefined,
  } as const
}

const tooltipContentClassName =
  'z-[620] max-w-[min(16rem,calc(100vw-1rem))] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-[11px] leading-snug text-[var(--color-foreground)] shadow-md'

function FieldHint({ hint }: { hint: string }) {
  return (
    <Tooltip.Root delayDuration={200}>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          tabIndex={-1}
          className="inline-flex shrink-0 rounded-[var(--radius-sm)] p-0.5 text-[var(--color-muted)] opacity-45 transition-[color,opacity] hover:text-[var(--color-accent)] hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/30"
          aria-label={hint}
          onClick={(event) => event.preventDefault()}
        >
          <CircleHelp className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="top"
          align="end"
          sideOffset={6}
          className={tooltipContentClassName}
        >
          {hint}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

/** Label with optional hint — help icon at the far end of the label row. */
export function FieldHeader({
  label,
  hint,
  required,
  optional,
  className,
  labelClassName,
  title,
  trailing,
}: FieldHeaderProps) {
  return (
    <div
      className={cn(
        hint ? 'flex w-full min-w-0 items-center justify-between gap-2' : 'inline-flex min-w-0 items-center',
        className,
      )}
    >
      <span className="inline-flex min-w-0 items-center gap-1.5">
        <span
          className={cn(
            'inline-flex min-w-0 items-baseline text-xs font-medium text-[var(--color-foreground)]',
            labelClassName,
          )}
          title={title ?? label}
        >
          <span className="min-w-0 truncate">{label}</span>
          {optional ? <span className={fieldOptionalLabelClassName}>(optional)</span> : null}
        </span>
        {trailing}
      </span>
      {hint ? <FieldHint hint={hint} /> : null}
    </div>
  )
}

/** @deprecated Use FieldHeader. */
export function FieldLabel(props: Omit<FieldHeaderProps, 'hint'>) {
  return <FieldHeader {...props} />
}
