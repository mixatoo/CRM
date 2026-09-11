import { db } from '@/infrastructure/database/db'
import type { LabelTargetType } from '@/domain/entities/label'

/**
 * Returns target IDs that have ANY of the given labels (OR semantics).
 * Empty labelIds means "no label filter" — returns null so callers skip filtering.
 */
export async function resolveTargetIdsForLabelFilter(
  targetType: LabelTargetType,
  labelIds: string[] | undefined,
): Promise<Set<string> | null> {
  if (!labelIds || labelIds.length === 0) return null

  const uniqueLabelIds = [...new Set(labelIds)]
  const matches = await Promise.all(
    uniqueLabelIds.map((labelId) =>
      db.labelAssignments.where('labelId').equals(labelId).toArray(),
    ),
  )

  const targetIds = new Set<string>()
  for (const group of matches) {
    for (const assignment of group) {
      if (assignment.targetType === targetType) {
        targetIds.add(assignment.targetId)
      }
    }
  }
  return targetIds
}

export function filterItemsByLabelTargetIds<T extends { id: string }>(
  items: T[],
  allowedIds: Set<string> | null,
): T[] {
  if (!allowedIds) return items
  return items.filter((item) => allowedIds.has(item.id))
}
