import { type VariantProps, cva } from 'class-variance-authority'
import { X } from 'lucide-react'
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

const iconSizeClass = {
  xs: 'h-2.5 w-2.5',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
} as const

export const closeButtonVariants = cva(
  'inline-flex shrink-0 items-center justify-center transition-colors hover:text-[var(--color-danger)] focus-visible:outline-none',
  {
    variants: {
      variant: {
        default:
          'rounded-[var(--radius-sm)] p-1 text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)]',
        elevated:
          'rounded-[var(--radius-md)] p-1 text-[var(--color-muted)] hover:bg-[var(--color-surface-elevated)]',
        pill: 'rounded-full text-[var(--color-subtle)] hover:bg-[var(--color-surface-muted)]',
        toolbar:
          'rounded-[var(--radius-sm)] p-1 text-[var(--color-muted)] hover:bg-[var(--color-surface-elevated)]',
      },
      size: {
        xs: 'h-5 w-5',
        sm: 'h-7 w-7 p-0',
        md: '',
      },
    },
    defaultVariants: {
      variant: 'elevated',
      size: 'md',
    },
  },
)

export interface CloseButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof closeButtonVariants> {
  iconSize?: keyof typeof iconSizeClass
}

export const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>(
  (
    {
      className,
      variant,
      size,
      iconSize,
      'aria-label': ariaLabel = 'Close',
      ...props
    },
    ref,
  ) => {
    const resolvedIconSize = iconSize ?? (size === 'xs' ? 'xs' : size === 'sm' ? 'sm' : 'md')

    return (
      <button
        ref={ref}
        type="button"
        aria-label={ariaLabel}
        className={cn(closeButtonVariants({ variant, size, className }))}
        {...props}
      >
        <X className={iconSizeClass[resolvedIconSize]} />
      </button>
    )
  },
)
CloseButton.displayName = 'CloseButton'
