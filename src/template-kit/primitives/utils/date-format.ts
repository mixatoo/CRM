/** Display format: `01 Jan 2026` (DD MMM YYYY) */
export const DATE_DISPLAY_FALLBACK = '—'
export const DATE_PLACEHOLDER = 'DD Mon YYYY'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const

const FULL_MONTHS = [
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

const MONTH_NAME_TO_INDEX: Record<string, number> = Object.fromEntries(
  [...MONTHS.map((month, index) => [month.toLowerCase(), index]), ...FULL_MONTHS.map((month, index) => [month.toLowerCase(), index])],
)

function calendarDate(year: number, monthIndex: number, day: number): Date | null {
  const date = new Date(year, monthIndex, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== monthIndex ||
    date.getDate() !== day
  ) {
    return null
  }
  return date
}

/** Parse user-typed dates: `01 Jan 2026`, `1/1/2026`, `2026-01-01`, etc. */
export function parseDisplayDate(value?: string | null): Date | null {
  if (value == null) return null
  const trimmed = value.trim()
  if (!trimmed) return null

  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
  if (iso) {
    return calendarDate(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
  }

  const dayMonthYear = /^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})$/.exec(trimmed)
  if (dayMonthYear) {
    const monthIndex = MONTH_NAME_TO_INDEX[dayMonthYear[2].toLowerCase()]
    if (monthIndex == null) return null
    return calendarDate(Number(dayMonthYear[3]), monthIndex, Number(dayMonthYear[1]))
  }

  const numeric = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(trimmed)
  if (numeric) {
    return calendarDate(Number(numeric[3]), Number(numeric[2]) - 1, Number(numeric[1]))
  }

  return parseDateInput(trimmed)
}

/** Convert typed/display date text to `YYYY-MM-DD`, or null when invalid. */
export function displayDateToIso(value?: string | null): string | null {
  const date = parseDisplayDate(value)
  return date ? toLocalIsoDate(date) : null
}

export function parseDateInput(value?: string | Date | null): Date | null {
  if (value == null || value === '') return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value

  const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (isoDate) {
    const date = new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]))
    return Number.isNaN(date.getTime()) ? null : date
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(value?: string | Date | null, fallback = DATE_DISPLAY_FALLBACK): string {
  const date = parseDateInput(value)
  if (!date) return fallback

  const day = String(date.getDate()).padStart(2, '0')
  const month = MONTHS[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

export function formatDateTime(value?: string | Date | null, fallback = DATE_DISPLAY_FALLBACK): string {
  const date = parseDateInput(value)
  if (!date) return fallback

  const time = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  return `${formatDate(date)} ${time}`
}

export function formatDateParts(value?: string | Date | null) {
  const date = parseDateInput(value)
  if (!date) {
    return { day: 'DD', month: 'Mon', year: 'YYYY', weekday: 'Day', valid: false as const }
  }

  return {
    day: String(date.getDate()).padStart(2, '0'),
    dayNumber: date.getDate(),
    month: MONTHS[date.getMonth()],
    year: String(date.getFullYear()),
    weekday: date.toLocaleDateString('en-GB', { weekday: 'short' }),
    valid: true as const,
  }
}

/** Local calendar date as `YYYY-MM-DD` (avoids UTC shift from `toISOString`). */
export function toLocalIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isSameCalendarDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function buildMonthGrid(viewYear: number, viewMonth: number) {
  const firstOfMonth = new Date(viewYear, viewMonth, 1)
  const startOffset = (firstOfMonth.getDay() + 6) % 7
  const gridStart = new Date(viewYear, viewMonth, 1 - startOffset)

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + index)
    return { date, inMonth: date.getMonth() === viewMonth }
  })
}

export function isDateWithinBounds(date: Date, min?: string, max?: string) {
  const time = date.getTime()
  const minDate = parseDateInput(min)
  const maxDate = parseDateInput(max)
  if (minDate && time < minDate.getTime()) return false
  if (maxDate && time > maxDate.getTime()) return false
  return true
}

/** 24-hour time placeholder and validation (`14:30`). */
export const TIME_24H_PLACEHOLDER = 'HH:MM'

export const TIME_24H_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/

export function isValidTime24(value?: string | null): boolean {
  if (value == null) return false
  const trimmed = value.trim()
  return trimmed === '' || TIME_24H_REGEX.test(trimmed)
}

/** Normalize typed times to `HH:MM` (24-hour), or return the raw value when invalid. */
export function normalizeTime24Input(value?: string | null): string {
  if (value == null) return ''
  const trimmed = value.trim()
  if (!trimmed) return ''

  if (TIME_24H_REGEX.test(trimmed)) return trimmed

  const colon = /^(\d{1,2}):(\d{1,2})$/.exec(trimmed)
  if (colon) {
    const hours = Number(colon[1])
    const minutes = Number(colon[2])
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    }
  }

  const digits = trimmed.replace(/\D/g, '')
  if (digits.length === 3) {
    const hours = Number(digits.slice(0, 1))
    const minutes = Number(digits.slice(1))
    if (hours <= 9 && minutes <= 59) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    }
  }

  if (digits.length === 4) {
    const hours = Number(digits.slice(0, 2))
    const minutes = Number(digits.slice(2))
    if (hours <= 23 && minutes <= 59) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    }
  }

  return trimmed
}
