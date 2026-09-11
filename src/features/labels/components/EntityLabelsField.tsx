import { useCallback, useMemo } from 'react'
import type { Label, LabelTargetType } from '@/domain/entities/label'
import { EntityLabelChips } from '@/features/labels/components/EntityLabelChips'
import { LabelAssignPopover } from '@/features/labels/components/LabelAssignPopover'
import { useEntityLabelAssignments } from '@/features/labels/hooks/use-labels'
import { buildLabelFilterListHref } from '@/features/labels/utils/label-filter-navigation'
import { cn } from '@/shared/utils/cn'

interface EntityLabelsFieldProps {
  targetType: LabelTargetType
  targetId: string
  disabled?: boolean
  className?: string
  maxVisible?: number
  showManageWhenEmpty?: boolean
  layout?: 'inline' | 'split'
  linkLabels?: boolean
  nowrap?: boolean
}

export function EntityLabelsField({
  targetType,
  targetId,
  disabled,
  className,
  maxVisible = 2,
  showManageWhenEmpty = true,
  layout = 'inline',
  linkLabels = true,
  nowrap = false,
}: EntityLabelsFieldProps) {
  const targetIds = useMemo(() => [targetId], [targetId])
  const { data: labelsByTarget } = useEntityLabelAssignments(targetType, targetIds)
  const labels = labelsByTarget?.get(targetId) ?? []
  const currentLabelIds = useMemo(() => labels.map((label) => label.id), [labels])

  const showManage = !disabled && (showManageWhenEmpty || labels.length > 0)

  const getLabelHref = useCallback(
    (label: Label) => (linkLabels ? buildLabelFilterListHref(targetType, label.id) : undefined),
    [linkLabels, targetType],
  )

  if (!showManage && labels.length === 0) {
    return null
  }

  const chips = (
    <EntityLabelChips
      labels={labels}
      maxVisible={maxVisible}
      fitContainer={layout === 'split'}
      getLabelHref={getLabelHref}
      showEmpty={false}
      nowrap={nowrap || layout === 'split'}
      className={cn('min-w-0', layout === 'split' || !showManage ? 'w-full' : 'flex-1')}
    />
  )

  const manageButton = showManage ? (
    <LabelAssignPopover
      targetType={targetType}
      targetIds={[targetId]}
      currentLabelIds={currentLabelIds}
      mode="replace"
      triggerLabel={labels.length === 0 ? 'Add labels' : 'Manage labels'}
      iconOnly
      className="shrink-0"
    />
  ) : null

  if (layout === 'split') {
    return (
      <div className={cn('flex w-full min-w-0 flex-nowrap items-center', className)}>
        <div className="flex min-w-0 flex-1 flex-nowrap items-center overflow-hidden">{chips}</div>
        <div className="flex w-[10%] shrink-0 items-center justify-end">{manageButton}</div>
      </div>
    )
  }

  return (
    <div className={cn('flex min-w-0 items-center gap-2', nowrap ? 'flex-nowrap' : 'flex-wrap', className)}>
      {chips}
      {manageButton}
    </div>
  )
}
