import { useMemo } from 'react'
import type { LabelTargetType } from '@/domain/entities/label'
import type { UserRole } from '@/domain/entities'
import type { Resource } from '@/domain/policies/permissions'
import { canMutate } from '@/domain/policies/permissions'
import { EntityLabelsField } from '@/features/labels/components/EntityLabelsField'
import { useEntityLabelAssignments } from '@/features/labels/hooks/use-labels'
import { cn } from '@/shared/utils/cn'

function labelTargetResource(targetType: LabelTargetType): Resource | null {
  switch (targetType) {
    case 'client':
      return 'passenger'
    case 'trip':
      return 'order'
    case 'supplier':
      return 'directory'
    case 'invoice':
      return 'invoice'
    case 'payment':
      return 'payment'
    default:
      return null
  }
}

export function canManageEntityLabels(role: UserRole, targetType: LabelTargetType): boolean {
  const resource = labelTargetResource(targetType)
  if (!resource) return false
  return canMutate(role, resource, 'update')
}

interface WorkspaceEntityLabelsProps {
  targetType: LabelTargetType
  targetId: string
  role: UserRole
  className?: string
}

export function WorkspaceEntityLabels({
  targetType,
  targetId,
  role,
  className,
}: WorkspaceEntityLabelsProps) {
  const targetIds = useMemo(() => [targetId], [targetId])
  const { data: labelsByTarget } = useEntityLabelAssignments(targetType, targetIds)
  const labels = labelsByTarget?.get(targetId) ?? []
  const canEdit = canManageEntityLabels(role, targetType)

  if (!canEdit && labels.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[var(--color-border)] px-3 py-2 sm:px-4',
        className,
      )}
    >
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
        Labels
      </span>
      <EntityLabelsField
        targetType={targetType}
        targetId={targetId}
        disabled={!canEdit}
        className="min-w-0 flex-1"
      />
    </div>
  )
}
