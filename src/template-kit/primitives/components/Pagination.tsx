import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../utils/cn'
import { PAGE_SIZE_OPTIONS, type PageSizeOption } from '../types/pagination'

export interface PaginationProps {
  page: number
  totalPages: number
  total: number
  pageSize: number
  from?: number
  to?: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: PageSizeOption) => void
  className?: string
  compact?: boolean
  /** Keep footer visible when there are no rows (e.g. workspace tables). */
  showWhenEmpty?: boolean
}

function PageSizeSelect({
  pageSize,
  onPageSizeChange,
  compact,
}: {
  pageSize: number
  onPageSizeChange: (pageSize: PageSizeOption) => void
  compact?: boolean
}) {
  const textSize = compact ? 'text-xs' : 'text-sm'

  return (
    <div className={cn('flex flex-wrap items-center gap-2', textSize)}>
      <span className="shrink-0 text-[var(--color-muted)]">
        <span className="hidden sm:inline">Rows per page</span>
        <span className="sm:hidden">Rows</span>
      </span>

      <div
        className="inline-flex rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]/50 p-0.5"
        role="radiogroup"
        aria-label="Rows per page"
      >
        {PAGE_SIZE_OPTIONS.map((size) => {
          const selected = pageSize === size
          return (
            <button
              key={size}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onPageSizeChange(size)}
              className={cn(
                'min-w-[2.35rem] rounded-[var(--radius-sm)] px-2 py-1 text-center text-xs font-medium tabular-nums transition-colors',
                selected
                  ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-sm ring-1 ring-inset ring-[var(--color-accent)]/25'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]',
              )}
            >
              {size}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  from,
  to,
  onPageChange,
  onPageSizeChange,
  className,
  compact = false,
  showWhenEmpty = false,
}: PaginationProps) {
  if (total === 0 && !showWhenEmpty) return null

  const safePage = total === 0 ? 1 : page
  const safeTotalPages = total === 0 ? 1 : totalPages
  const rangeFrom = total === 0 ? 0 : (from ?? (safePage - 1) * pageSize + 1)
  const rangeTo = total === 0 ? 0 : (to ?? Math.min(safePage * pageSize, total))
  const textSize = compact ? 'text-xs' : 'text-sm'
  const iconSize = compact ? 'h-3.5 w-3.5' : 'h-4 w-4'
  const navBtnClass =
    'inline-flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-foreground)] disabled:pointer-events-none disabled:opacity-35'
  const navBtnSize = compact ? 'h-9 w-9 sm:h-7 sm:w-7' : 'h-10 w-10 sm:h-8 sm:w-8'

  return (
    <nav
      className={cn(
        'flex flex-col gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface)] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-4 sm:gap-y-2',
        compact ? 'px-2 py-2 sm:px-3' : 'px-2 py-2.5 sm:px-4',
        className,
      )}
      aria-label="Pagination"
    >
      <p className={cn('shrink-0 tabular-nums text-[var(--color-muted)]', textSize)}>
        {total === 0 ? (
          <>0 of 0</>
        ) : (
          <>
            <span className="text-[var(--color-foreground)]">
              {rangeFrom}–{rangeTo}
            </span>{' '}
            of {total}
          </>
        )}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end sm:gap-4">
        {onPageSizeChange ? (
          <PageSizeSelect pageSize={pageSize} onPageSizeChange={onPageSizeChange} compact={compact} />
        ) : null}

        <div
          className={cn('flex items-center gap-1', textSize)}
          role="group"
          aria-label="Page navigation"
        >
          <button
            type="button"
            className={cn(navBtnClass, navBtnSize)}
            aria-label="Previous page"
            disabled={safePage <= 1}
            onClick={() => onPageChange(safePage - 1)}
          >
            <ChevronLeft className={iconSize} />
          </button>

          <span
            className="min-w-[5.5rem] px-1 text-center tabular-nums text-[var(--color-muted)]"
            aria-current="page"
          >
            Page{' '}
            <span className="text-[var(--color-foreground)]">{safePage}</span>
            {' '}of{' '}
            <span className="text-[var(--color-foreground)]">{safeTotalPages}</span>
          </span>

          <button
            type="button"
            className={cn(navBtnClass, navBtnSize)}
            aria-label="Next page"
            disabled={safePage >= safeTotalPages || total === 0}
            onClick={() => onPageChange(safePage + 1)}
          >
            <ChevronRight className={iconSize} />
          </button>
        </div>
      </div>
    </nav>
  )
}
