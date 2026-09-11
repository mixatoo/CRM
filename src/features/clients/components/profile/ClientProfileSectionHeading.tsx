import { cn } from '@/shared/utils/cn'

interface ClientProfileSectionHeadingProps {
  label: string
  description?: string
  /** Section bar (full width) or compact rail title. */
  variant?: 'bar' | 'rail'
  stepIndex?: number
  stepCount?: number
  className?: string
}

export function ClientProfileSectionHeading({
  label,
  description,
  variant = 'rail',
  stepIndex,
  stepCount,
  className,
}: ClientProfileSectionHeadingProps) {
  const showStepMeta =
    variant === 'bar' && stepIndex !== undefined && stepCount !== undefined && stepCount > 0

  return (
    <div
      className={cn(
        'min-w-0 shrink-0',
        variant === 'bar' && 'flex min-h-8 w-full items-center justify-between gap-3',
        className,
      )}
    >
      <div className="min-w-0">
        <p
          className={cn(
            'font-semibold leading-snug text-[var(--color-foreground)]',
            variant === 'bar' ? 'text-sm' : 'text-xs',
          )}
        >
          {label}
        </p>
        {description ? (
          <p className="mt-0.5 text-[11px] leading-snug text-[var(--color-muted)]">{description}</p>
        ) : null}
      </div>

      {showStepMeta ? (
        <span className="shrink-0 text-[10px] tabular-nums text-[var(--color-subtle)]">
          {stepIndex + 1}/{stepCount}
        </span>
      ) : null}
    </div>
  )
}
