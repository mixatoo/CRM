import { describe, expect, it } from 'vitest'
import { buildMonthGrid, displayDateToIso, formatDate, formatDateParts, formatDateTime, normalizeTime24Input, parseDateInput, parseDisplayDate, toLocalIsoDate } from '@/shared/utils/date-format'

describe('date-format', () => {
  it('formats ISO date-only strings as DD MMM YYYY', () => {
    expect(formatDate('2026-01-01')).toBe('01 Jan 2026')
    expect(formatDate('2028-02-06')).toBe('06 Feb 2028')
    expect(formatDate('2027-12-15')).toBe('15 Dec 2027')
  })

  it('returns fallback for missing or invalid values', () => {
    expect(formatDate(undefined)).toBe('—')
    expect(formatDate('')).toBe('—')
    expect(formatDate('not-a-date')).toBe('—')
  })

  it('parses ISO date-only as local calendar date', () => {
    const date = parseDateInput('2023-08-31')
    expect(date?.getFullYear()).toBe(2023)
    expect(date?.getMonth()).toBe(7)
    expect(date?.getDate()).toBe(31)
  })

  it('builds a Monday-first month grid', () => {
    const grid = buildMonthGrid(2026, 0)
    expect(grid).toHaveLength(42)
    expect(grid[0]?.date.getDay()).toBe(1)
    expect(toLocalIsoDate(grid.find((cell) => cell.inMonth && cell.date.getDate() === 1)!.date)).toBe('2026-01-01')
  })

  it('formats date parts for picker display', () => {
    expect(formatDateParts('2026-01-01')).toEqual({
      day: '01',
      dayNumber: 1,
      month: 'Jan',
      year: '2026',
      weekday: 'Thu',
      valid: true,
    })
    expect(formatDateParts(undefined)).toEqual({
      day: 'DD',
      month: 'Mon',
      year: 'YYYY',
      weekday: 'Day',
      valid: false,
    })
  })

  it('formats date-time with the same date portion', () => {
    const value = formatDateTime(new Date(2026, 0, 1, 14, 30))
    expect(value.startsWith('01 Jan 2026')).toBe(true)
  })

  it('parses display and keyboard date formats', () => {
    expect(displayDateToIso('01 Jan 2026')).toBe('2026-01-01')
    expect(displayDateToIso('6 Feb 2028')).toBe('2028-02-06')
    expect(displayDateToIso('06/02/2028')).toBe('2028-02-06')
    expect(displayDateToIso('2028-02-06')).toBe('2028-02-06')
    expect(displayDateToIso('31 February 2028')).toBe(null)
    expect(parseDisplayDate('')).toBe(null)
  })

  it('normalizes 24-hour times', () => {
    expect(normalizeTime24Input('14:30')).toBe('14:30')
    expect(normalizeTime24Input('9:5')).toBe('09:05')
    expect(normalizeTime24Input('1430')).toBe('14:30')
    expect(normalizeTime24Input('930')).toBe('09:30')
    expect(normalizeTime24Input('')).toBe('')
  })
})
