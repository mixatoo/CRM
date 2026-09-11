import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { INPUT_FIELD_TEXT_CLASS } from '../components/Input'
import {
  buildMonthGrid,
  isDateWithinBounds,
  isSameCalendarDay,
  parseDateInput,
  toLocalIsoDate,
} from '../utils/date-format'
import { cn } from '../utils/cn'

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] as const

const MONTH_OPTIONS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

const GRID_NAV_KEYS = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
  'PageUp',
  'PageDown',
  'Enter',
  ' ',
])

const calendarSelectClassName = cn(
  'h-7 min-w-0 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20',
  INPUT_FIELD_TEXT_CLASS,
)

function resolveYearBounds(min?: string, max?: string) {
  const maxDate = parseDateInput(max) ?? new Date()
  const minDate = parseDateInput(min)
  const maxYear = maxDate.getFullYear()
  const minYear = minDate?.getFullYear() ?? maxYear - 120
  return { minYear, maxYear }
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function findFirstEnabledInMonth(year: number, month: number, min?: string, max?: string) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  for (let day = 1; day <= daysInMonth; day += 1) {
    const candidate = new Date(year, month, day)
    if (isDateWithinBounds(candidate, min, max)) return candidate
  }
  return new Date(year, month, 1)
}

function resolveActiveDate(
  selected: Date | null,
  viewYear: number,
  viewMonth: number,
  fallback: Date,
  min?: string,
  max?: string,
) {
  if (selected && isDateWithinBounds(selected, min, max)) return selected

  const preferred = new Date(viewYear, viewMonth, fallback.getDate())
  if (isDateWithinBounds(preferred, min, max)) return preferred

  return findFirstEnabledInMonth(viewYear, viewMonth, min, max)
}

function moveActiveDate(
  current: Date,
  deltaDays: number,
  min?: string,
  max?: string,
  maxAttempts = 42,
) {
  let next = addDays(current, deltaDays)
  let attempts = 0

  while (!isDateWithinBounds(next, min, max) && attempts < maxAttempts) {
    next = addDays(next, deltaDays > 0 ? 1 : -1)
    attempts += 1
  }

  return isDateWithinBounds(next, min, max) ? next : current
}

export interface DateCalendarHandle {
  focusGrid: (key?: string) => void
}

export interface DateCalendarProps {
  value?: string
  onChange: (value: string) => void
  min?: string
  max?: string
  onClear?: () => void
  className?: string
  /** Month/year dropdowns for jumping quickly to distant dates (e.g. date of birth). */
  yearMonthPickers?: boolean
  /** When true, focuses the day grid on mount (inline calendars). */
  autoFocusGrid?: boolean
}

export const DateCalendar = forwardRef<DateCalendarHandle, DateCalendarProps>(function DateCalendar(
  { value, onChange, min, max, onClear, className, yearMonthPickers = false, autoFocusGrid = false },
  ref,
) {
  const selected = parseDateInput(value)
  const today = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now
  }, [])

  const [view, setView] = useState(() => {
    const base = selected ?? parseDateInput(max) ?? today
    return { year: base.getFullYear(), month: base.getMonth() }
  })

  const [activeDate, setActiveDate] = useState(() =>
    resolveActiveDate(selected, view.year, view.month, selected ?? parseDateInput(max) ?? today, min, max),
  )

  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!selected) return
    setView({ year: selected.getFullYear(), month: selected.getMonth() })
    setActiveDate(selected)
  }, [value])

  const { minYear, maxYear } = useMemo(() => resolveYearBounds(min, max), [min, max])
  const years = useMemo(() => {
    const options: number[] = []
    for (let year = maxYear; year >= minYear; year -= 1) {
      options.push(year)
    }
    return options
  }, [minYear, maxYear])

  const monthLabel = new Date(view.year, view.month, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })

  const days = buildMonthGrid(view.year, view.month)
  const activeIso = toLocalIsoDate(activeDate)
  const activeEnabled = isDateWithinBounds(activeDate, min, max)

  const syncViewToDate = useCallback((date: Date) => {
    setView({ year: date.getFullYear(), month: date.getMonth() })
    setActiveDate(date)
  }, [])

  const goMonth = useCallback(
    (delta: number) => {
      const next = new Date(view.year, view.month + delta, 1)
      const year = next.getFullYear()
      const month = next.getMonth()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const day = Math.min(activeDate.getDate(), daysInMonth)
      const candidate = new Date(year, month, day)
      const resolved = isDateWithinBounds(candidate, min, max)
        ? candidate
        : findFirstEnabledInMonth(year, month, min, max)
      syncViewToDate(resolved)
    },
    [activeDate, max, min, syncViewToDate, view.month, view.year],
  )

  const jumpToMonth = useCallback(
    (year: number, month: number) => {
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const preferredDay =
        selected && selected.getFullYear() === year && selected.getMonth() === month
          ? selected.getDate()
          : activeDate.getFullYear() === year && activeDate.getMonth() === month
            ? activeDate.getDate()
            : 1
      const day = Math.min(preferredDay, daysInMonth)
      const candidate = new Date(year, month, day)
      const resolved = isDateWithinBounds(candidate, min, max)
        ? candidate
        : findFirstEnabledInMonth(year, month, min, max)
      syncViewToDate(resolved)
    },
    [activeDate, max, min, selected, syncViewToDate],
  )

  const setMonth = (month: number) => {
    jumpToMonth(view.year, month)
  }

  const setYear = (year: number) => {
    jumpToMonth(year, view.month)
  }

  const moveActive = useCallback(
    (deltaDays: number) => {
      setActiveDate((current) => {
        const next = moveActiveDate(current, deltaDays, min, max)
        setView({ year: next.getFullYear(), month: next.getMonth() })
        return next
      })
    },
    [max, min],
  )

  const focusBoundaryDay = useCallback(
    (boundary: 'start' | 'end') => {
      const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()
      const start = boundary === 'start' ? 1 : daysInMonth
      const end = boundary === 'start' ? daysInMonth : 1
      const step = boundary === 'start' ? 1 : -1

      for (let day = start; boundary === 'start' ? day <= end : day >= end; day += step) {
        const candidate = new Date(view.year, view.month, day)
        if (isDateWithinBounds(candidate, min, max)) {
          setActiveDate(candidate)
          return
        }
      }
    },
    [max, min, view.month, view.year],
  )

  const handleGridKey = useCallback(
    (key: string) => {
      switch (key) {
        case 'ArrowLeft':
          moveActive(-1)
          return true
        case 'ArrowRight':
          moveActive(1)
          return true
        case 'ArrowUp':
          moveActive(-7)
          return true
        case 'ArrowDown':
          moveActive(7)
          return true
        case 'Home':
          focusBoundaryDay('start')
          return true
        case 'End':
          focusBoundaryDay('end')
          return true
        case 'PageUp':
          goMonth(-1)
          return true
        case 'PageDown':
          goMonth(1)
          return true
        case 'Enter':
        case ' ':
          if (activeEnabled) onChange(activeIso)
          return true
        default:
          return false
      }
    },
    [activeEnabled, activeIso, focusBoundaryDay, goMonth, moveActive, onChange],
  )

  const focusGrid = useCallback(
    (key?: string) => {
      gridRef.current?.focus()
      if (key) handleGridKey(key)
    },
    [handleGridKey],
  )

  useImperativeHandle(ref, () => ({ focusGrid }), [focusGrid])

  useEffect(() => {
    if (!autoFocusGrid) return
    const frame = requestAnimationFrame(() => gridRef.current?.focus())
    return () => cancelAnimationFrame(frame)
  }, [autoFocusGrid])

  const handleGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!handleGridKey(event.key)) return
    event.preventDefault()
    if (event.key === 'Enter' || event.key === ' ') {
      event.stopPropagation()
    }
  }

  const todayIso = toLocalIsoDate(today)
  const todayAllowed = isDateWithinBounds(today, min, max)

  return (
    <div
      data-date-calendar
      className={cn(
        'rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]',
        className,
      )}
    >
      <div className="border-b border-[var(--color-border)] px-3 py-2.5">
        {yearMonthPickers ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => goMonth(-1)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-foreground)]"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <select
              aria-label="Month"
              value={view.month}
              onChange={(event) => setMonth(Number(event.target.value))}
              className={cn(calendarSelectClassName, 'min-w-0 flex-1')}
            >
              {MONTH_OPTIONS.map((label, index) => (
                <option key={label} value={index}>
                  {label}
                </option>
              ))}
            </select>
            <select
              aria-label="Year"
              value={view.year}
              onChange={(event) => setYear(Number(event.target.value))}
              className={cn(calendarSelectClassName, 'w-[4.75rem] shrink-0 font-mono tabular-nums')}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => goMonth(1)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-foreground)]"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => goMonth(-1)}
              className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-foreground)]"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-semibold text-[var(--color-foreground)]">{monthLabel}</p>
            <button
              type="button"
              onClick={() => goMonth(1)}
              className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-foreground)]"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="mb-1 grid grid-cols-7 gap-0.5">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="flex h-7 items-center justify-center text-[10px] font-semibold uppercase tracking-wide text-[var(--color-subtle)]"
            >
              {day}
            </div>
          ))}
        </div>

        <div
          ref={gridRef}
          role="grid"
          tabIndex={0}
          aria-label={monthLabel}
          aria-activedescendant={`date-cell-${activeIso}`}
          onKeyDown={handleGridKeyDown}
          className="grid grid-cols-7 gap-0.5 rounded-[var(--radius-sm)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/30"
        >
          {days.map(({ date, inMonth }, index) => {
            const iso = toLocalIsoDate(date)
            const isSelected = selected ? isSameCalendarDay(date, selected) : false
            const isActive = isSameCalendarDay(date, activeDate)
            const isToday = isSameCalendarDay(date, today)
            const disabled = !isDateWithinBounds(date, min, max)
            const ariaLabel = date.toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })

            return (
              <button
                key={`${iso}-${index}`}
                id={`date-cell-${iso}`}
                type="button"
                role="gridcell"
                tabIndex={-1}
                disabled={disabled}
                aria-label={ariaLabel}
                aria-selected={isSelected}
                aria-current={isToday ? 'date' : undefined}
                onMouseEnter={() => setActiveDate(date)}
                onClick={() => onChange(iso)}
                className={cn(
                  'relative flex h-8 w-full items-center justify-center rounded-[var(--radius-sm)] text-xs font-normal tabular-nums transition-colors',
                  !inMonth && 'text-[var(--color-subtle)]',
                  inMonth && !isSelected && !disabled && 'text-[var(--color-foreground)] hover:bg-[var(--color-surface-elevated)]',
                  isSelected &&
                    'bg-[var(--color-accent)] font-medium text-white shadow-sm hover:bg-[var(--color-accent-hover)]',
                  isToday &&
                    !isSelected &&
                    'font-medium text-[var(--color-accent)] ring-1 ring-inset ring-[var(--color-accent)]/35',
                  isActive &&
                    !isSelected &&
                    'ring-2 ring-[var(--color-accent)] ring-offset-1 ring-offset-[var(--color-surface)]',
                  disabled && 'cursor-not-allowed opacity-35 hover:bg-transparent',
                )}
              >
                {date.getDate()}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-[var(--color-border)] px-3 py-2">
        <button
          type="button"
          onClick={onClear}
          disabled={!value}
          className="rounded-[var(--radius-sm)] px-2 py-1 text-xs font-normal text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent-muted)]/50 disabled:cursor-not-allowed disabled:text-[var(--color-subtle)] disabled:hover:bg-transparent"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => todayAllowed && onChange(todayIso)}
          disabled={!todayAllowed}
          className="rounded-[var(--radius-sm)] px-2 py-1 text-xs font-normal text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-foreground)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Today
        </button>
      </div>
    </div>
  )
})

export function isDateCalendarGridKey(key: string) {
  return GRID_NAV_KEYS.has(key)
}
