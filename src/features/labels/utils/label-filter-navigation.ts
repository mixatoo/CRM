import type { LabelTargetType } from '@/domain/entities/label'

const LIST_ROUTES: Partial<Record<LabelTargetType, string>> = {
  client: '/clients',
  trip: '/trips',
  supplier: '/suppliers',
  invoice: '/invoices',
  payment: '/transactions',
  reminder: '/reminders',
  activity: '/activity',
}

export function buildLabelFilterListHref(targetType: LabelTargetType, labelId: string): string | undefined {
  const basePath = LIST_ROUTES[targetType]
  if (!basePath) return undefined
  return `${basePath}?labelIds=${encodeURIComponent(labelId)}`
}

export function parseLabelIdsSearchParam(value: string | null): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
}

/** Remove `labelIds` from the current URL without touching other params. */
export function clearLabelIdsFromSearchParams(
  searchParams: URLSearchParams,
  setSearchParams: (next: URLSearchParams, opts?: { replace?: boolean }) => void,
) {
  if (!searchParams.has('labelIds')) return
  const next = new URLSearchParams(searchParams)
  next.delete('labelIds')
  setSearchParams(next, { replace: true })
}

/** Drop one-shot action params (`create`, `quickAdd`) while keeping filters like `labelIds`. */
export function removeActionSearchParams(
  searchParams: URLSearchParams,
  setSearchParams: (next: URLSearchParams, opts?: { replace?: boolean }) => void,
  keys: string[],
) {
  const next = new URLSearchParams(searchParams)
  let changed = false
  for (const key of keys) {
    if (next.has(key)) {
      next.delete(key)
      changed = true
    }
  }
  if (changed) setSearchParams(next, { replace: true })
}
