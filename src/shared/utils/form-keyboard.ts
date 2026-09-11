import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { isFormPicklistKeyboardTarget } from '@/design-system/components/form-picklist-ui'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"]):not([readonly])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function isVisible(el: HTMLElement) {
  return el.offsetParent !== null || el.getClientRects().length > 0
}

/** Tab-ordered focusable elements inside a form section (excludes tabIndex=-1). */
export function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute('disabled') && el.tabIndex !== -1 && isVisible(el),
  )
}

export function focusFirstFocusable(container: HTMLElement | null | undefined) {
  const elements = container ? getFocusableElements(container) : []
  elements[0]?.focus({ preventScroll: true })
}

export function focusFirstInvalid(container: HTMLElement | null | undefined) {
  if (!container) return false
  const invalid = container.querySelector<HTMLElement>('[aria-invalid="true"]')
  if (invalid && typeof invalid.focus === 'function') {
    invalid.focus({ preventScroll: true })
    return true
  }
  return false
}

/** Skip dialog-level Enter advance when the target is a nested interactive widget. */
export function shouldSkipFormEnterAdvance(target: HTMLElement) {
  if (target.tagName === 'TEXTAREA') return true
  if (target.tagName === 'SELECT') return true
  if (target.closest('[data-date-calendar]')) return true
  if (target.closest('[data-date-picker-field]')) return true
  if (isFormPicklistKeyboardTarget(target)) return true
  if (target.closest('[role="radiogroup"]')) return true
  if (target.closest('[role="listbox"]')) return true
  if (target.closest('[contenteditable="true"]')) return true
  return false
}

/**
 * Enter moves to the next focusable field in the form section.
 * On the last field, runs `onLastField` (continue step / save).
 */
export function handleFormEnterAdvance(
  event: ReactKeyboardEvent,
  formContainer: HTMLElement | null | undefined,
  onLastField: () => void,
) {
  if (event.key !== 'Enter' || event.shiftKey) return false
  const target = event.target as HTMLElement
  if (shouldSkipFormEnterAdvance(target)) return false
  if (!formContainer?.contains(target)) return false

  const focusable = getFocusableElements(formContainer)
  const currentIndex = focusable.indexOf(target)
  if (currentIndex === -1) return false

  event.preventDefault()
  event.stopPropagation()

  if (currentIndex < focusable.length - 1) {
    focusable[currentIndex + 1]?.focus({ preventScroll: true })
  } else {
    onLastField()
  }
  return true
}

export function handleRadiogroupKeyDown<T extends string>(
  event: ReactKeyboardEvent,
  options: Array<{ value: T }>,
  value: T,
  onChange: (value: T) => void,
  axis: 'horizontal' | 'vertical' = 'horizontal',
) {
  const prevKey = axis === 'horizontal' ? 'ArrowLeft' : 'ArrowUp'
  const nextKey = axis === 'horizontal' ? 'ArrowRight' : 'ArrowDown'

  if (event.key === 'Enter' || event.key === ' ') {
    event.stopPropagation()
    return
  }

  if (event.key !== prevKey && event.key !== nextKey) return

  event.preventDefault()
  event.stopPropagation()

  const currentIndex = options.findIndex((option) => option.value === value)
  const startIndex = currentIndex >= 0 ? currentIndex : 0
  const delta = event.key === nextKey ? 1 : -1
  const nextIndex = (startIndex + delta + options.length) % options.length
  onChange(options[nextIndex].value)
}
