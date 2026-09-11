import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Search } from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'
import { cn } from '@/shared/utils/cn'
import { SEARCH_PANEL_INPUT_SURFACE_CLASS } from '@/design-system/components/SearchField'
import {
  FORM_PICKLIST_MENU_ITEM_CLASS,
  FORM_PICKLIST_PANEL_CLASS,
  FormPicklistChevron,
  FormPicklistPanelHeader,
  getFormPicklistTriggerClassName,
  handleFormPicklistCloseAutoFocus,
  handlePicklistPanelTabKey,
  PicklistRadio,
  type FormPicklistSize,
  type FormPicklistVariant,
} from '@/design-system/components/form-picklist-ui'

export type FormPicklistOption = {
  value: string
  label: string
  description?: string
  badge?: ReactNode
}

type SelectablePicklistRow =
  | { kind: 'empty'; value: string; option: FormPicklistOption }
  | { kind: 'option'; value: string; option: FormPicklistOption }
  | { kind: 'quickAdd'; value: string; label: string }

interface FormPicklistProps {
  value: string
  onChange: (value: string) => void
  options: FormPicklistOption[]
  placeholder?: string
  emptyOption?: FormPicklistOption
  panelTitle?: string
  ariaLabel: string
  disabled?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  loading?: boolean
  className?: string
  size?: FormPicklistSize
  variant?: FormPicklistVariant
  fullWidth?: boolean
  error?: boolean
  focusStyle?: 'default' | 'neutral'
  onBlur?: () => void
  id?: string
  /** When searchable, allow adding the search text as a custom value. */
  allowQuickAdd?: boolean
  formatQuickAdd?: (value: string) => string
  panelClassName?: string
}

function isMenuNavigationKey(key: string) {
  return key === 'ArrowDown' || key === 'ArrowUp' || key === 'Home' || key === 'End' || key === 'Enter' || key === 'Escape'
}

export function FormPicklist({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  emptyOption,
  panelTitle,
  ariaLabel,
  disabled,
  searchable,
  searchPlaceholder = 'Search…',
  loading,
  className,
  size = 'md',
  variant = 'default',
  fullWidth = true,
  error,
  focusStyle = 'default',
  onBlur,
  id,
  allowQuickAdd,
  formatQuickAdd,
  panelClassName,
}: FormPicklistProps) {
  const listboxId = useId()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [highlightIndex, setHighlightIndex] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listboxRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])

  const selectedOption =
    options.find((option) => option.value === value) ??
    (emptyOption && value === emptyOption.value ? emptyOption : undefined)

  const hasValue = Boolean(value.trim())
  const activeLabel = selectedOption?.label ?? (hasValue ? value : placeholder)

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return options
    return options.filter((option) => {
      const haystack = [option.label, option.description, option.value].filter(Boolean).join(' ').toLowerCase()
      return haystack.includes(q)
    })
  }, [options, search])

  const quickAddQuery = search.trim()
  const quickAddValue = quickAddQuery ? (formatQuickAdd?.(quickAddQuery) ?? quickAddQuery) : ''
  const hasExactQuickAddMatch = useMemo(() => {
    if (!quickAddQuery) return true
    const q = quickAddQuery.toLowerCase()
    return options.some(
      (option) => option.label.toLowerCase() === q || option.value.toLowerCase() === q,
    )
  }, [options, quickAddQuery])

  const showQuickAdd = Boolean(allowQuickAdd && searchable && quickAddQuery && !hasExactQuickAddMatch)

  const selectableRows = useMemo(() => {
    const rows: SelectablePicklistRow[] = []
    if (emptyOption) rows.push({ kind: 'empty', value: emptyOption.value, option: emptyOption })
    for (const option of filteredOptions) rows.push({ kind: 'option', value: option.value, option })
    if (showQuickAdd) rows.push({ kind: 'quickAdd', value: quickAddValue, label: quickAddValue })
    return rows
  }, [emptyOption, filteredOptions, showQuickAdd, quickAddValue])

  const handleQuickAdd = () => {
    if (!quickAddValue) return
    onChange(quickAddValue)
    setOpen(false)
    setSearch('')
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setSearch('')
      onBlur?.()
    }
  }

  const commitHighlighted = () => {
    const row = selectableRows[highlightIndex]
    if (!row || loading) return
    if (row.kind === 'quickAdd') {
      handleQuickAdd()
      return
    }
    onChange(row.value)
    setOpen(false)
    setSearch('')
  }

  const handleMenuKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      setOpen(false)
      return
    }

    if (handlePicklistPanelTabKey(event)) {
      setOpen(false)
      return
    }

    if (selectableRows.length === 0 || loading) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        event.stopPropagation()
        setHighlightIndex((index) => Math.min(index + 1, selectableRows.length - 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        event.stopPropagation()
        setHighlightIndex((index) => Math.max(index - 1, 0))
        break
      case 'Home':
        event.preventDefault()
        event.stopPropagation()
        setHighlightIndex(0)
        break
      case 'End':
        event.preventDefault()
        event.stopPropagation()
        setHighlightIndex(selectableRows.length - 1)
        break
      case 'Enter':
        event.preventDefault()
        event.stopPropagation()
        commitHighlighted()
        break
      default:
        break
    }
  }

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.stopPropagation()
      if (!open) {
        setOpen(true)
        return
      }
      handleMenuKeyDown(event)
      return
    }

    if (event.altKey && event.key === 'ArrowDown') {
      event.preventDefault()
      event.stopPropagation()
      setOpen(true)
      return
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      event.stopPropagation()
      if (!open) {
        setOpen(true)
        return
      }
      handleMenuKeyDown(event)
    }
  }

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (isMenuNavigationKey(event.key)) {
      handleMenuKeyDown(event)
      return
    }
    event.stopPropagation()
  }

  useEffect(() => {
    if (!open) return
    if (search.trim()) {
      setHighlightIndex(0)
      return
    }
    const selectedIndex = selectableRows.findIndex((row) => row.value === value)
    setHighlightIndex(selectedIndex >= 0 ? selectedIndex : 0)
  }, [open, search, selectableRows, value])

  useEffect(() => {
    if (!open) return
    setHighlightIndex((current) => {
      if (selectableRows.length === 0) return 0
      return Math.min(current, selectableRows.length - 1)
    })
  }, [selectableRows.length, open])

  useEffect(() => {
    if (!open) return
    itemRefs.current[highlightIndex]?.scrollIntoView({ block: 'nearest' })
  }, [highlightIndex, open])

  const optionCount = filteredOptions.length
  const activeDescendantId =
    open && selectableRows.length > 0 ? `${listboxId}-opt-${highlightIndex}` : undefined

  return (
    <Popover.Root modal={false} open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild disabled={disabled}>
        <button
          ref={triggerRef}
          id={id}
          type="button"
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
          onKeyDown={handleTriggerKeyDown}
          onPointerDown={(event) => event.preventDefault()}
          className={getFormPicklistTriggerClassName({
            size,
            variant,
            fullWidth,
            hasValue,
            open,
            disabled,
            error,
            focusStyle,
            className,
          })}
        >
          <span
            className={cn(
              'min-w-0 flex-1 truncate text-left',
              hasValue
                ? 'font-medium text-[var(--color-foreground)]'
                : 'font-normal text-[var(--color-muted)]',
              disabled && !hasValue && 'text-[var(--color-muted)]',
            )}
          >
            {loading ? 'Loading…' : activeLabel}
          </span>
          <FormPicklistChevron size={size} variant={variant} open={open} hasValue={hasValue} disabled={disabled} />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          data-form-picklist-panel=""
          className={cn(FORM_PICKLIST_PANEL_CLASS, panelClassName)}
          align="start"
          side="bottom"
          sideOffset={6}
          avoidCollisions
          collisionPadding={8}
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            if (searchable) {
              searchInputRef.current?.focus()
              return
            }
            listboxRef.current?.focus()
          }}
          onCloseAutoFocus={(event) => handleFormPicklistCloseAutoFocus(event, triggerRef.current)}
        >
          <FormPicklistPanelHeader
            panelTitle={panelTitle}
            ariaLabel={ariaLabel}
            activeLabel={activeLabel}
            hasValue={hasValue}
            loading={loading}
            optionCount={optionCount}
          />

          {searchable ? (
            <div className="shrink-0 border-b border-[var(--color-border)] p-2">
              <div className="relative" data-search-control>
                <Search
                  className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-muted)]"
                  aria-hidden
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder={searchPlaceholder}
                  aria-label={`Search ${panelTitle ?? ariaLabel}`}
                  className={SEARCH_PANEL_INPUT_SURFACE_CLASS}
                />
              </div>
            </div>
          ) : null}

          <div
            ref={listboxRef}
            tabIndex={searchable ? undefined : -1}
            className="min-h-[6rem] flex-1 overflow-y-auto overscroll-contain p-1.5 outline-none"
            role="listbox"
            aria-label={ariaLabel}
            aria-activedescendant={activeDescendantId}
            onKeyDown={searchable ? undefined : handleMenuKeyDown}
            onWheel={(event) => event.stopPropagation()}
            onTouchMove={(event) => event.stopPropagation()}
          >
            {loading ? (
              <p className="px-2 py-4 text-center text-[11px] text-[var(--color-muted)]">Loading options…</p>
            ) : selectableRows.length === 0 ? (
              <p className="px-2 py-4 text-center text-[11px] text-[var(--color-muted)]">No matches found.</p>
            ) : (
              selectableRows.map((row, index) => {
                if (row.kind === 'quickAdd') {
                  return (
                    <button
                      key="quick-add"
                      id={`${listboxId}-opt-${index}`}
                      ref={(node) => {
                        itemRefs.current[index] = node
                      }}
                      type="button"
                      role="option"
                      tabIndex={-1}
                      aria-selected={false}
                      className={cn(
                        FORM_PICKLIST_MENU_ITEM_CLASS,
                        'mt-0.5 border-t border-[var(--color-border)] font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent-muted)]/30',
                        highlightIndex === index &&
                          'bg-[var(--color-accent-muted)]/25 ring-2 ring-inset ring-[var(--color-accent)]/25',
                      )}
                      onMouseEnter={() => setHighlightIndex(index)}
                      onClick={handleQuickAdd}
                    >
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center text-[10px] font-bold" aria-hidden>
                        +
                      </span>
                      <span className="min-w-0 flex-1 truncate">Quick add: {row.label}</span>
                    </button>
                  )
                }

                return (
                  <PicklistItem
                    key={`${row.kind}-${row.value}`}
                    id={`${listboxId}-opt-${index}`}
                    itemRef={(node) => {
                      itemRefs.current[index] = node
                    }}
                    option={row.option}
                    selected={value === row.value}
                    highlighted={highlightIndex === index}
                    isEmptyOption={row.kind === 'empty'}
                    onMouseEnter={() => setHighlightIndex(index)}
                    onSelect={() => {
                      onChange(row.value)
                      setOpen(false)
                      setSearch('')
                    }}
                  />
                )
              })
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

function PicklistItem({
  option,
  selected,
  highlighted,
  isEmptyOption,
  id,
  itemRef,
  onMouseEnter,
  onSelect,
}: {
  option: FormPicklistOption
  selected: boolean
  highlighted?: boolean
  isEmptyOption?: boolean
  id?: string
  itemRef?: (node: HTMLButtonElement | null) => void
  onMouseEnter?: () => void
  onSelect: () => void
}) {
  return (
    <button
      id={id}
      ref={itemRef}
      type="button"
      role="option"
      tabIndex={-1}
      aria-selected={selected}
      className={cn(
        FORM_PICKLIST_MENU_ITEM_CLASS,
        isEmptyOption
          ? cn(
              'mb-0.5 border border-dashed border-[var(--color-border)] text-[var(--color-muted)]',
              selected
                ? 'bg-[var(--color-surface-muted)]/50'
                : 'hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-muted)]/30 hover:text-[var(--color-foreground)]',
            )
          : selected
            ? 'bg-[var(--color-accent-muted)]/45 font-medium text-[var(--color-foreground)] ring-1 ring-[var(--color-accent)]/15'
            : 'font-normal text-[var(--color-foreground)] hover:bg-[var(--color-surface-elevated)]',
        highlighted &&
          !selected &&
          'bg-[var(--color-surface-elevated)] ring-2 ring-inset ring-[var(--color-accent)]/25',
      )}
      onMouseEnter={onMouseEnter}
      onClick={onSelect}
    >
      <PicklistRadio selected={selected} muted={isEmptyOption} />
      <span className="min-w-0 flex-1">
        <span className={cn('block truncate', isEmptyOption && 'text-[11px]')}>{option.label}</span>
        {option.description ? (
          <span className="mt-0.5 block truncate text-[10px] font-normal leading-snug text-[var(--color-muted)]">
            {option.description}
          </span>
        ) : null}
      </span>
      {option.badge}
    </button>
  )
}
