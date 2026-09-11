import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

export const INPUT_FIELD_TEXT_CLASS =
  'text-xs font-light tracking-[0.04em] text-[var(--color-foreground)] placeholder:text-[var(--color-muted)]'

const inputVariants = cva(
  cn(
    'flex w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
    INPUT_FIELD_TEXT_CLASS,
  ),
  {
    variants: {
      size: {
        sm: 'h-8 py-1',
        md: 'h-9 py-1',
      },
      error: {
        true: 'border-[var(--color-danger)]',
        false: '',
      },
      focusStyle: {
        default: 'focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20',
        neutral:
          'focus:border-[var(--color-border-strong)] focus:outline-none focus:ring-0 focus:shadow-none focus-visible:outline-none focus-visible:outline-offset-0 focus-visible:ring-0',
      },
    },
    compoundVariants: [
      {
        error: true,
        focusStyle: 'default',
        class: 'focus:ring-[var(--color-danger)]/20',
      },
      {
        error: true,
        focusStyle: 'neutral',
        class: 'focus:border-[var(--color-danger)]/60 focus:ring-0 focus:shadow-none',
      },
    ],
    defaultVariants: { size: 'md', error: false, focusStyle: 'default' },
  },
)

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, error, focusStyle, ...props }, ref) => (
    <input ref={ref} className={cn(inputVariants({ size, error, focusStyle }), className)} {...props} />
  ),
)
Input.displayName = 'Input'

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  InputHTMLAttributes<HTMLTextAreaElement> & { error?: boolean; focusStyle?: 'default' | 'neutral' }
>(({ className, error, focusStyle = 'default', ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[80px] w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 focus:outline-none',
      INPUT_FIELD_TEXT_CLASS,
      focusStyle === 'neutral'
        ? 'focus:border-[var(--color-border-strong)] focus:outline-none focus:ring-0 focus:shadow-none focus-visible:outline-none focus-visible:outline-offset-0 focus-visible:ring-0'
        : 'focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20',
      error &&
        (focusStyle === 'neutral'
          ? 'border-[var(--color-danger)]/60 focus:border-[var(--color-danger)]/60 focus:ring-0'
          : 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]/20'),
      className,
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'
