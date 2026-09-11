import { useMemo, useRef, useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { Check, Columns3, Search } from 'lucide-react'
import { Button } from '../components/Button'
import type { TableColumnVisibility } from '../hooks/use-table-column-visibility'
import { cn } from '../utils/cn'
import { SEARCH_PANEL_INPUT_MUTED_CLASS } from '../components/SearchField'

interface TableColumnPickerProps<T extends string> {
  columnVisibility: TableColumnVisibility<T>
  className?: string
}

const PANEL_CLASS_NAME =
  'z-[500] w-[14.5rem] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg outline-none'

const MENU_ITEM_CLASS =
  'flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-2 text-left text-xs transition-colors'

function ColumnCheckbox({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border transition-colors',
        checked
          ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
          : 'border-[var(--color-border-strong)] bg-[var(--color-surface)]',
      )}
      aria-hidden
    >
      {checked && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
    </span>
  )
}

export function TableColumnPicker<T extends string>({ columnVisibility, className }: TableColumnPickerProps<T>) {
  const { toggleableColumns, visibleToggleableCount, isVisible, toggle, reset } = columnVisibility
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  const filteredColumns = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return toggleableColumns
    return toggleableColumns.filter((column) => column.label.toLowerCase().includes(query))
  }, [toggleableColumns, search])

  if (toggleableColumns.length === 0) return null

  const totalToggleable = toggleableColumns.length
  const isCustomized = visibleToggleableCount < totalToggleable
  const activeLabel = `${visibleToggleableCount} of ${totalToggleable} visible`

  const focusSearchInput = () => {
    window.requestAnimationFrame(() => {
      searchRef.current?.focus({ preventScroll: true })
    })
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) setSearch('')
  }

  return (
    <Popover.Root modal open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          aria-expanded={open}
          aria-haspopup="dialog"
          onMouseDown={(event) => event.preventDefault()}
          className={cn(
            'h-8 w-8 shrink-0 p-0',
            isCustomized && 'border-[var(--color-accent)] text-[var(--color-accent)]',
            open && 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/20',
            className,
          )}
          aria-label={`Choose visible columns. ${activeLabel}`}
        >
          <Columns3 className="h-3.5 w-3.5" />
        </Button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className={PANEL_CLASS_NAME}
          align="end"
          side="bottom"
          sideOffset={6}
          collisionPadding={12}
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            focusSearchInput()
          }}
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <div className="border-b border-[var(--color-border)] px-3 py-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--color-foreground)]">Columns</p>
                {search.trim() ? (
                  <p className="mt-0.5 truncate text-[11px] font-normal text-[var(--color-muted)]">
                    {filteredColumns.length} match{filteredColumns.length === 1 ? '' : 'es'}
                  </p>
                ) : (
                  <p className="mt-0.5 truncate text-[11px] font-normal text-[var(--color-muted)]">{activeLabel}</p>
                )}
              </div>
              {isCustomized ? (
                <button
                  type="button"
                  className="shrink-0 text-[11px] font-medium text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent)]/80"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={reset}
                >
                  Reset
                </button>
              ) : null}
            </div>
          </div>

          <div className="border-b border-[var(--color-border)] p-2">
            <div className="relative" data-search-control>
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-muted)]"
                aria-hidden
              />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') event.stopPropagation()
                }}
                placeholder="Search columns…"
                aria-label="Search columns"
                className={SEARCH_PANEL_INPUT_MUTED_CLASS}
              />
            </div>
          </div>

          <div
            className="max-h-[min(14rem,40vh)] overflow-y-auto overscroll-contain p-1"
            role="group"
            aria-label="Visible columns"
          >
            {filteredColumns.length === 0 ? (
              <p className="px-2.5 py-3 text-center text-[11px] text-[var(--color-muted)]">No columns match your search.</p>
            ) : (
              filteredColumns.map((column) => {
                const checked = isVisible(column.key)
                const isLastVisible = checked && visibleToggleableCount === 1

                return (
                  <button
                    key={column.key}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    aria-disabled={isLastVisible}
                    title={isLastVisible ? 'At least one column must stay visible' : undefined}
                    className={cn(
                      MENU_ITEM_CLASS,
                      checked
                        ? 'bg-[var(--color-accent-muted)]/40 font-medium text-[var(--color-foreground)]'
                        : 'font-normal text-[var(--color-foreground)] hover:bg-[var(--color-surface-elevated)]',
                      isLastVisible && 'cursor-not-allowed opacity-60',
                    )}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      if (!isLastVisible) toggle(column.key)
                    }}
                  >
                    <ColumnCheckbox checked={checked} />
                    <span className="min-w-0 flex-1 truncate">{column.label}</span>
                  </button>
                )
              })
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
