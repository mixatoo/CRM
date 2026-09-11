import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDatabaseReady } from '@/app/providers'
import { appContainer } from '@/app/container'
import type { Label, LabelInput, LabelTargetType } from '@/domain/entities/label'
import {
  normalizeLabelInput,
  slugifyLabelName,
  sortLabels,
  validateLabelInput,
} from '@/domain/entities/label'
import { useToast } from '@/design-system/components/Toast'
import { useAuthStore } from '@/features/auth/store/auth-store'

export const LABELS_QUERY_KEY = ['labels'] as const
export const LABEL_ASSIGNMENTS_QUERY_KEY = ['label-assignments'] as const

export function useLabels() {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: LABELS_QUERY_KEY,
    queryFn: async () => sortLabels(await appContainer.uow.labels.findAll()),
    enabled: dbReady,
  })
}

export function useActiveLabels() {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: [...LABELS_QUERY_KEY, 'active'],
    queryFn: () => appContainer.uow.labels.findActive(),
    enabled: dbReady,
  })
}

export function useLabelsForTarget(targetType: LabelTargetType) {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: [...LABELS_QUERY_KEY, 'available', targetType],
    queryFn: () => appContainer.uow.labels.findAvailableForTarget(targetType),
    enabled: dbReady,
  })
}

export function useEntityLabelAssignments(targetType: LabelTargetType, targetIds: string[]) {
  const dbReady = useDatabaseReady()
  const stableKey = [...targetIds].sort().join(',')

  return useQuery({
    queryKey: [...LABEL_ASSIGNMENTS_QUERY_KEY, targetType, stableKey],
    queryFn: async () => {
      const [labels, assignments] = await Promise.all([
        appContainer.uow.labels.findActive(),
        appContainer.uow.labelAssignments.findByTargets(targetType, targetIds),
      ])
      const labelById = new Map(labels.map((label) => [label.id, label]))
      const map = new Map<string, Label[]>()

      for (const targetId of targetIds) {
        map.set(targetId, [])
      }

      for (const assignment of assignments) {
        const label = labelById.get(assignment.labelId)
        if (!label || !label.isActive) continue
        const current = map.get(assignment.targetId) ?? []
        current.push(label)
        map.set(assignment.targetId, current)
      }

      for (const [targetId, targetLabels] of map) {
        map.set(targetId, sortLabels(targetLabels))
      }

      return map
    },
    enabled: dbReady && targetIds.length > 0,
  })
}

function invalidateLabelQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: LABELS_QUERY_KEY })
  queryClient.invalidateQueries({ queryKey: LABEL_ASSIGNMENTS_QUERY_KEY })
}

export function useLabelMutations() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const createLabel = useMutation({
    mutationFn: async (input: LabelInput) => {
      const normalized = normalizeLabelInput(input)
      const error = validateLabelInput(normalized)
      if (error) throw new Error(error)
      const slug = slugifyLabelName(normalized.name)
      if (!slug) throw new Error('Name must include letters or numbers.')
      const existing = await appContainer.uow.labels.findAll()
      if (existing.some((label) => label.slug === slug)) {
        throw new Error('A label with this name already exists.')
      }
      const now = new Date().toISOString()
      return appContainer.uow.labels.create({
        ...normalized,
        slug,
        createdAt: now,
        updatedAt: now,
      })
    },
    onSuccess: (label) => {
      invalidateLabelQueries(queryClient)
      toast({ intent: 'updated', title: 'Label created', description: label.name })
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Could not create label', description: error.message })
    },
  })

  const updateLabel = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: LabelInput }) => {
      const normalized = normalizeLabelInput(input)
      const error = validateLabelInput(normalized)
      if (error) throw new Error(error)
      const slug = slugifyLabelName(normalized.name)
      if (!slug) throw new Error('Name must include letters or numbers.')
      const existing = await appContainer.uow.labels.findAll()
      if (existing.some((label) => label.id !== id && label.slug === slug)) {
        throw new Error('A label with this name already exists.')
      }
      return appContainer.uow.labels.update(id, {
        ...normalized,
        slug,
        updatedAt: new Date().toISOString(),
      })
    },
    onSuccess: (label) => {
      invalidateLabelQueries(queryClient)
      toast({ intent: 'updated', title: 'Label updated', description: label.name })
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Could not update label', description: error.message })
    },
  })

  const deleteLabel = useMutation({
    mutationFn: async (id: string) => {
      await appContainer.uow.labels.delete(id)
    },
    onSuccess: () => {
      invalidateLabelQueries(queryClient)
      toast({ intent: 'deleted', title: 'Label deleted' })
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Could not delete label', description: error.message })
    },
  })

  return {
    createLabel,
    updateLabel,
    deleteLabel,
    isPending: createLabel.isPending || updateLabel.isPending || deleteLabel.isPending,
  }
}

export function useLabelAssignmentMutations() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const userId = useAuthStore((state) => state.user?.id)

  const setLabelsForTarget = useMutation({
    mutationFn: async ({
      targetType,
      targetId,
      labelIds,
    }: {
      targetType: LabelTargetType
      targetId: string
      labelIds: string[]
    }) => {
      await appContainer.uow.labelAssignments.setLabelsForTarget(
        targetType,
        targetId,
        labelIds,
        userId,
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LABEL_ASSIGNMENTS_QUERY_KEY })
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Could not update labels', description: error.message })
    },
  })

  const addLabelsToTargets = useMutation({
    mutationFn: async ({
      targetType,
      targetIds,
      labelIds,
    }: {
      targetType: LabelTargetType
      targetIds: string[]
      labelIds: string[]
    }) => {
      await appContainer.uow.labelAssignments.addLabelsToTargets(
        targetType,
        targetIds,
        labelIds,
        userId,
      )
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: LABEL_ASSIGNMENTS_QUERY_KEY })
      toast({
        intent: 'updated',
        title: 'Labels applied',
        description: `Added to ${variables.targetIds.length} record${variables.targetIds.length === 1 ? '' : 's'}`,
      })
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Could not apply labels', description: error.message })
    },
  })

  const removeLabelsFromTargets = useMutation({
    mutationFn: async ({
      targetType,
      targetIds,
      labelIds,
    }: {
      targetType: LabelTargetType
      targetIds: string[]
      labelIds: string[]
    }) => {
      await appContainer.uow.labelAssignments.removeLabelsFromTargets(targetType, targetIds, labelIds)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: LABEL_ASSIGNMENTS_QUERY_KEY })
      toast({
        intent: 'updated',
        title: 'Labels removed',
        description: `Updated ${variables.targetIds.length} record${variables.targetIds.length === 1 ? '' : 's'}`,
      })
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Could not remove labels', description: error.message })
    },
  })

  return {
    setLabelsForTarget,
    addLabelsToTargets,
    removeLabelsFromTargets,
    isPending:
      setLabelsForTarget.isPending ||
      addLabelsToTargets.isPending ||
      removeLabelsFromTargets.isPending,
  }
}

export function labelsToPicklistOptions(labels: Label[]) {
  return labels.map((label) => ({
    value: label.id,
    label: label.name,
    description: label.description,
  }))
}
