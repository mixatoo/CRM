import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Search } from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'
import { cn } from '@/shared/utils/cn'
import { SEARCH_PANEL_INPUT_SURFACE_CLASS } from '@/design-system/components/SearchField'
import type { FormPicklistOption } from '@/design-system/components/FormPicklist'
import {
  FORM_PICKLIST_MENU_ITEM_CLASS,
  FORM_PICKLIST_PANEL_CLASS,
  FormPicklistChevron,
  FormPicklistPanelHeader,
  getFormPicklistTriggerClassName,
  handleFormPicklistCloseAutoFocus,
  handlePicklistPanelTabKey,
  type FormPicklistSize,
} from '@/design-system/components/form-picklist-ui'

function PicklistCheckbox({ selected }: { selected: boolean }) {
  return (
    <span
      className={cn(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border transition-colors',
        selected
          ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
          : 'border-[var(--color-border-strong)] bg-[var(--color-surface)]',
      )}
      aria-hidden
    >
      {selected ? (
        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth={3}>
          <path d="M2.5 6l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </span>
  )
}

interface FormMultiPicklistProps {
  value: string[]
  onChange: (value: string[]) => void
  options: FormPicklistOption[]
  placeholder?: string
  panelTitle?: string
  ariaLabel: string
  disabled?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  className?: string
  size?: FormPicklistSize
  fullWidth?: boolean
}

const MAX_VISIBLE_SELECTION_LABELS = 5

function formatSelectionLabel(value: string[], options: FormPicklistOption[], placeholder: string) {
  if (value.length === 0) return placeholder

  const labels = value
    .map((item) => options.find((option) => option.value === item)?.label ?? item)
    .filter(Boolean)

  if (labels.length === 0) return placeholder
  if (labels.length <= MAX_VISIBLE_SELECTION_LABELS) return labels.join(', ')

  const visible = labels.slice(0, MAX_VISIBLE_SELECTION_LABELS).join(', ')
  const remaining = labels.length - MAX_VISIBLE_SELECTION_LABELS
  return `${visible} +${remaining}`
}

function isMenuNavigationKey(key: string) {
  return key === 'ArrowDown' || key === 'ArrowUp' || key === 'Home' || key === 'End' || key === 'Enter' || key === 'Escape'
}

export function FormMultiPicklist({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  panelTitle,
  ariaLabel,
  disabled,
  searchable,
  searchPlaceholder = 'Search…',
  className,
  size = 'md',
  fullWidth = true,
}: FormMultiPicklistProps) {
  const listboxId = useId()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [highlightIndex, setHighlightIndex] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listboxRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])
  const selected = useMemo(() => new Set(value), [value])
  const hasValue = value.length > 0
  const activeLabel = formatSelectionLabel(value, options, placeholder)

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return options
    return options.filter((option) => {
      const haystack = [option.label, option.description, option.value].filter(Boolean).join(' ').toLowerCase()
      return haystack.includes(q)
    })
  }, [options, search])

  const toggleValue = (next: string) => {
    if (selected.has(next)) {
      onChange(value.filter((item) => item !== next))
      return
    }
    onChange([...value, next])
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) setSearch('')
  }

  const commitHighlighted = () => {
    const option = filteredOptions[highlightIndex]
    if (!option) return
    toggleValue(option.value)
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

    if (filteredOptions.length === 0) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        event.stopPropagation()
        setHighlightIndex((index) => Math.min(index + 1, filteredOptions.length - 1))
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
        setHighlightIndex(filteredOptions.length - 1)
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

    if (!open && (event.key === 'Backspace' || event.key === 'Delete') && value.length > 0) {
      event.preventDefault()
      event.stopPropagation()
      onChange(value.slice(0, -1))
      return
    }

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
    setHighlightIndex(0)
  }, [open])

  useEffect(() => {
    if (!open) return
    setHighlightIndex((current) => {
      if (filteredOptions.length === 0) return 0
      return Math.min(current, filteredOptions.length - 1)
    })
  }, [search, filteredOptions.length, open])

  useEffect(() => {
    if (!open) return
    itemRefs.current[highlightIndex]?.scrollIntoView({ block: 'nearest' })
  }, [highlightIndex, open])

  const optionCount = filteredOptions.length
  const activeDescendantId =
    open && filteredOptions.length > 0 ? `${listboxId}-opt-${highlightIndex}` : undefined

  return (
    <Popover.Root modal={false} open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild disabled={disabled}>
        <button
          ref={triggerRef}
          type="button"
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
          onKeyDown={handleTriggerKeyDown}
          onPointerDown={(event) => event.preventDefault()}
          className={getFormPicklistTriggerClassName({
            size,
            fullWidth,
            hasValue,
            open,
            disabled,
            className,
          })}
        >
          <span
            className={cn(
              'min-w-0 flex-1 truncate text-left',
              hasValue
                ? 'font-medium text-[var(--color-foreground)]'
                : 'font-normal text-[var(--color-muted)]',
            )}
          >
            {activeLabel}
          </span>
          <FormPicklistChevron size={size} open={open} hasValue={hasValue} disabled={disabled} />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          data-form-picklist-panel=""
          className={FORM_PICKLIST_PANEL_CLASS}
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
            aria-multiselectable
            aria-activedescendant={activeDescendantId}
            onKeyDown={searchable ? undefined : handleMenuKeyDown}
            onWheel={(event) => event.stopPropagation()}
            onTouchMove={(event) => event.stopPropagation()}
          >
            {filteredOptions.length === 0 ? (
              <p className="px-2 py-4 text-center text-[11px] text-[var(--color-muted)]">No matches found.</p>
            ) : (
              filteredOptions.map((option, index) => (
                <MultiPicklistItem
                  key={option.value}
                  id={`${listboxId}-opt-${index}`}
                  itemRef={(node) => {
                    itemRefs.current[index] = node
                  }}
                  option={option}
                  selected={selected.has(option.value)}
                  highlighted={highlightIndex === index}
                  onMouseEnter={() => setHighlightIndex(index)}
                  onToggle={() => toggleValue(option.value)}
                />
              ))
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

function MultiPicklistItem({
  option,
  selected,
  highlighted,
  id,
  itemRef,
  onMouseEnter,
  onToggle,
}: {
  option: FormPicklistOption
  selected: boolean
  highlighted?: boolean
  id?: string
  itemRef?: (node: HTMLButtonElement | null) => void
  onMouseEnter?: () => void
  onToggle: () => void
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
        selected
          ? 'bg-[var(--color-accent-muted)]/45 font-medium text-[var(--color-foreground)] ring-1 ring-[var(--color-accent)]/15'
          : 'font-normal text-[var(--color-foreground)] hover:bg-[var(--color-surface-elevated)]',
        highlighted && !selected && 'bg-[var(--color-surface-elevated)] ring-2 ring-inset ring-[var(--color-accent)]/25',
      )}
      onMouseEnter={onMouseEnter}
      onClick={onToggle}
    >
      <PicklistCheckbox selected={selected} />
      <span className="min-w-0 flex-1">
        <span className="block truncate">{option.label}</span>
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
