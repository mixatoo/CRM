import { useCallback, useMemo } from 'react'
import { FormMultiPicklist } from '@/design-system/components/FormMultiPicklist'
import { useActiveLabels, labelsToPicklistOptions } from '@/features/labels/hooks/use-labels'
import type { LabelTargetType } from '@/domain/entities/label'
import { labelAppliesToTarget } from '@/domain/entities/label'

const EMPTY_LABEL_IDS: string[] = []

interface LabelFilterFieldProps {
  value: string[]
  onChange: (value: string[]) => void
  targetType?: LabelTargetType
  ariaLabel?: string
  placeholder?: string
  className?: string
  size?: 'sm' | 'md'
}

export function LabelFilterField({
  value,
  onChange,
  targetType,
  ariaLabel = 'Filter by labels',
  placeholder = 'All labels',
  className,
  size = 'sm',
}: LabelFilterFieldProps) {
  const { data: labels = [] } = useActiveLabels()
  const options = useMemo(
    () =>
      labelsToPicklistOptions(
        targetType ? labels.filter((label) => labelAppliesToTarget(label, targetType)) : labels,
      ),
    [labels, targetType],
  )

  const handleChange = useCallback(
    (next: string[]) => {
      if (
        next.length === value.length &&
        next.every((id, index) => id === value[index])
      ) {
        return
      }
      onChange(next)
    },
    [onChange, value],
  )

  return (
    <FormMultiPicklist
      value={value ?? EMPTY_LABEL_IDS}
      onChange={handleChange}
      options={options}
      placeholder={placeholder}
      panelTitle="Labels"
      ariaLabel={ariaLabel}
      searchable
      searchPlaceholder="Search labels…"
      size={size}
      className={className}
    />
  )
}
