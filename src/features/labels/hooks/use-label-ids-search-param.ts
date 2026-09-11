import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { parseLabelIdsSearchParam } from '@/features/labels/utils/label-filter-navigation'

export function useLabelIdsSearchParam(onLabelIds: (labelIds: string[]) => void) {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const labelIds = parseLabelIdsSearchParam(searchParams.get('labelIds'))
    if (labelIds.length > 0) onLabelIds(labelIds)
  }, [onLabelIds, searchParams])
}
