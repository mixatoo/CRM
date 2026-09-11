import { cva, type VariantProps } from 'class-variance-authority'
import { Search } from 'lucide-react'
import { useEffect, useRef, useState, type InputHTMLAttributes } from 'react'
import { CloseButton } from '../components/CloseButton'
import { cn } from '../utils/cn'
import { INPUT_FIELD_TEXT_CLASS } from '../components/Input'

/** No blue outline/ring/border when a search control is focused. */
export const SEARCH_INPUT_NO_FOCUS_CLASS =
  '!outline-none outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:border-transparent focus-visible:border-transparent'

export const SEARCH_PANEL_INPUT_SURFACE_CLASS = [
  'h-8 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] py-0 pl-8 pr-2.5',
  'focus:border-[var(--color-border)] focus-visible:border-[var(--color-border)]',
  SEARCH_INPUT_NO_FOCUS_CLASS,
  INPUT_FIELD_TEXT_CLASS,
].join(' ')

export const SEARCH_PANEL_INPUT_MUTED_CLASS = [
  'h-8 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]/25 py-0 pl-8 pr-2.5',
  'focus:border-[var(--color-border)] focus-visible:border-[var(--color-border)]',
  SEARCH_INPUT_NO_FOCUS_CLASS,
  INPUT_FIELD_TEXT_CLASS,
].join(' ')

const searchFieldVariants = cva('relative min-w-0', {
  variants: {
    density: {
      toolbar: 'order-first w-full sm:order-none sm:w-60 md:w-72',
      compact: 'w-full',
      global: 'w-full max-w-[400px]',
    },
  },
  defaultVariants: { density: 'toolbar' },
})

const searchShellVariants = cva(
  [
    'group/search flex w-full items-stretch overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]',
    'transition-[border-color,box-shadow]',
    'focus-within:border-[var(--color-border)] focus-within:shadow-none',
  ].join(' '),
  {
    variants: {
      density: {
        toolbar: 'h-8',
        compact: 'h-8',
        global: 'h-8',
      },
    },
    defaultVariants: { density: 'toolbar' },
  },
)

const searchAccentVariants = cva('shrink-0 bg-[var(--color-accent)]', {
  variants: {
    density: {
      toolbar: 'w-0.5',
      compact: 'w-0.5',
      global: 'w-0.5',
    },
  },
  defaultVariants: { density: 'toolbar' },
})

const searchBodyVariants = cva('flex min-w-0 flex-1 items-center', {
  variants: {
    density: {
      toolbar: 'gap-1.5 px-2',
      compact: 'gap-1 px-1.5',
      global: 'gap-2 px-2.5',
    },
  },
  defaultVariants: { density: 'toolbar' },
})

const searchIconVariants = cva('shrink-0 text-[var(--color-foreground)]', {
  variants: {
    density: {
      toolbar: 'h-3.5 w-3.5',
      compact: 'h-3.5 w-3.5',
      global: 'h-3.5 w-3.5',
    },
  },
  defaultVariants: { density: 'toolbar' },
})

const searchInputVariants = cva(
  [
    'min-w-0 flex-1 border-0 bg-transparent p-0',
    SEARCH_INPUT_NO_FOCUS_CLASS,
    INPUT_FIELD_TEXT_CLASS,
    'disabled:cursor-not-allowed disabled:opacity-50',
  ].join(' '),
  {
    variants: {
      density: {
        toolbar: '',
        compact: '',
        global: '',
      },
    },
    defaultVariants: { density: 'toolbar' },
  },
)

const searchCollapsedVariants = cva(
  [
    'flex items-stretch overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-left transition-[border-color,box-shadow] outline-none',
    'hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-card)]',
    'focus:border-[var(--color-border)] focus:outline-none focus-visible:border-[var(--color-border)] focus-visible:outline-none',
  ].join(' '),
  {
    variants: {
      density: {
        compact: 'h-8 w-full',
        toolbar: 'h-8 w-8 shrink-0',
        global: 'h-8 w-8 shrink-0',
      },
    },
    defaultVariants: { density: 'toolbar' },
  },
)

const searchCollapsedBodyVariants = cva('flex min-w-0 flex-1 items-center text-[var(--color-subtle)]', {
  variants: {
    density: {
      compact: 'gap-1 px-1.5 text-[10px] leading-none',
      toolbar: 'items-center justify-center',
      global: 'items-center justify-center',
    },
  },
  defaultVariants: { density: 'toolbar' },
})

export interface SearchFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'onChange'>,
    VariantProps<typeof searchFieldVariants> {
  value: string
  onValueChange: (value: string) => void
  collapsible?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  inputClassName?: string
}

export function SearchField({
  value,
  onValueChange,
  placeholder = 'Type to filter…',
  'aria-label': ariaLabel = 'Search',
  density = 'toolbar',
  collapsible = true,
  open: openProp,
  onOpenChange,
  className,
  inputClassName,
  ...inputProps
}: SearchFieldProps) {
  const hasValue = value.trim().length > 0
  const [internalOpen, setInternalOpen] = useState(() => hasValue || !collapsible)
  const open = openProp ?? internalOpen
  const setOpen = (next: boolean) => {
    if (openProp === undefined) {
      setInternalOpen(next)
    }
    onOpenChange?.(next)
  }
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    if (hasValue) {
      setOpen(true)
    }
  }, [hasValue])

  const handleClear = () => {
    if (hasValue) {
      onValueChange('')
      inputRef.current?.focus()
      return
    }
    if (collapsible) {
      setOpen(false)
    }
  }

  const handleKeyDown: InputHTMLAttributes<HTMLInputElement>['onKeyDown'] = (event) => {
    if (event.key === 'Escape') {
      if (hasValue) {
        onValueChange('')
      } else if (collapsible) {
        setOpen(false)
      }
    }
    inputProps.onKeyDown?.(event)
  }

  if (collapsible && !open) {
    const collapsedDensity = density === 'global' ? 'global' : density === 'compact' ? 'compact' : 'toolbar'

    return (
      <button
        type="button"
        data-search-control
        onClick={() => setOpen(true)}
        aria-label={ariaLabel}
        aria-expanded={false}
        className={cn(
          searchCollapsedVariants({ density: collapsedDensity }),
          hasValue && 'border-[var(--color-border-strong)] shadow-[var(--shadow-card)]',
          className,
        )}
      >
        <span className={searchAccentVariants({ density: collapsedDensity })} aria-hidden />
        <span className={searchCollapsedBodyVariants({ density: collapsedDensity })}>
          {density === 'compact' ? (
            <>
              <Search className="h-3.5 w-3.5 shrink-0 text-[var(--color-foreground)]" />
              <span className={cn('truncate', hasValue && 'text-[var(--color-foreground)]')}>
                {hasValue ? value : placeholder}
              </span>
            </>
          ) : (
            <Search className={searchIconVariants({ density: collapsedDensity })} />
          )}
        </span>
      </button>
    )
  }

  return (
    <div className={cn(searchFieldVariants({ density }), className)}>
      <div className={searchShellVariants({ density })} data-search-control>
        <span className={searchAccentVariants({ density })} aria-hidden />
        <div className={searchBodyVariants({ density })}>
          <Search className={searchIconVariants({ density })} aria-hidden />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label={ariaLabel}
            className={cn(searchInputVariants({ density }), inputClassName)}
            {...inputProps}
          />
          <CloseButton
            iconSize={density === 'compact' ? 'xs' : 'sm'}
            className="!p-0 outline-none focus:outline-none focus-visible:outline-none"
            onClick={handleClear}
            aria-label={hasValue ? 'Clear search' : collapsible ? 'Close search' : 'Clear search'}
          />
        </div>
      </div>
    </div>
  )
}
