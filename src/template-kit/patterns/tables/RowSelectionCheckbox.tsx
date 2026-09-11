import { Check, Minus } from 'lucide-react'
import { TABLE_SELECTION_CHECKBOX_CLASS } from '../../primitives/components/table-styles'
import { cn } from '../../primitives/utils/cn'

interface RowSelectionCheckboxProps {
  checked: boolean
  indeterminate?: boolean
  onChange: (shiftKey?: boolean) => void
  'aria-label': string
  className?: string
}

/** Circular row checkbox used in selectable list tables. */
export function RowSelectionCheckbox({
  checked,
  indeterminate = false,
  onChange,
  'aria-label': ariaLabel,
  className,
}: RowSelectionCheckboxProps) {
  const active = checked || indeterminate

  return (
    <span className="inline-flex size-8 items-center justify-center">
      <button
        type="button"
        role="checkbox"
        aria-checked={indeterminate ? 'mixed' : checked}
        aria-label={ariaLabel}
        onClick={(event) => {
          event.stopPropagation()
          onChange(event.shiftKey)
        }}
        onKeyDown={(event) => event.stopPropagation()}
        className={cn(
          'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border transition-all duration-150',
          TABLE_SELECTION_CHECKBOX_CLASS,
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/40 focus-visible:ring-offset-2',
          active
            ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white shadow-[0_1px_3px_rgba(37,99,235,0.35)]'
            : 'border-[var(--color-border-strong)] bg-[var(--color-surface)] hover:border-[var(--color-accent)]/50 hover:shadow-sm',
          className,
        )}
      >
        {checked && <Check className="h-3 w-3" strokeWidth={3} aria-hidden />}
        {!checked && indeterminate && <Minus className="h-3 w-3" strokeWidth={3} aria-hidden />}
      </button>
    </span>
  )
}
