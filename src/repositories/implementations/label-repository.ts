import { db } from '@/infrastructure/database/db'
import { createGenericRepository } from '@/repositories/implementations/dexie-repositories'
import type { LabelRepository, LabelAssignmentRepository } from '@/repositories/interfaces'
import type { Label, LabelAssignment, LabelTargetType } from '@/domain/entities/label'
import { labelAppliesToTarget, sortLabels } from '@/domain/entities/label'
import { countAssignmentsForLabel } from '@/infrastructure/database/label-seed'
import { generateId } from '@/shared/utils/cn'

export class DexieLabelRepository implements LabelRepository {
  private readonly generic = createGenericRepository<Label>(db.labels, 'LBL')

  findAll() {
    return this.generic.findAll()
  }

  findById(id: string) {
    return this.generic.findById(id)
  }

  create(data: Omit<Label, 'id'>) {
    return this.generic.create(data)
  }

  update(id: string, data: Partial<Label>) {
    return this.generic.update(id, data)
  }

  async delete(id: string) {
    await db.transaction('rw', db.labels, db.labelAssignments, async () => {
      await db.labelAssignments.where('labelId').equals(id).delete()
      await this.generic.delete(id)
    })
  }

  async findActive(): Promise<Label[]> {
    const labels = await db.labels.filter((label) => label.isActive).toArray()
    return sortLabels(labels)
  }

  async findAvailableForTarget(targetType: LabelTargetType): Promise<Label[]> {
    const labels = await this.findActive()
    return labels.filter((label) => labelAppliesToTarget(label, targetType))
  }

  countAssignments(labelId: string) {
    return countAssignmentsForLabel(labelId)
  }
}

export class DexieLabelAssignmentRepository implements LabelAssignmentRepository {
  findAll() {
    return db.labelAssignments.toArray()
  }

  async findById(id: string) {
    return (await db.labelAssignments.get(id)) ?? null
  }

  async create(data: Omit<LabelAssignment, 'id'>) {
    const item: LabelAssignment = { ...data, id: generateId('LAS') }
    await db.labelAssignments.add(item)
    return item
  }

  async update(id: string, data: Partial<LabelAssignment>) {
    const existing = await db.labelAssignments.get(id)
    if (!existing) throw new Error('Record not found')
    const updated = { ...existing, ...data }
    await db.labelAssignments.put(updated)
    return updated
  }

  async delete(id: string) {
    await db.labelAssignments.delete(id)
  }

  async findByTarget(targetType: LabelTargetType, targetId: string): Promise<LabelAssignment[]> {
    return db.labelAssignments
      .where('[targetType+targetId]')
      .equals([targetType, targetId])
      .toArray()
  }

  async findByTargets(
    targetType: LabelTargetType,
    targetIds: string[],
  ): Promise<LabelAssignment[]> {
    if (targetIds.length === 0) return []
    const uniqueIds = [...new Set(targetIds)]
    const assignments = await db.labelAssignments.where('targetType').equals(targetType).toArray()
    const idSet = new Set(uniqueIds)
    return assignments.filter((assignment) => idSet.has(assignment.targetId))
  }

  async findByLabelId(labelId: string): Promise<LabelAssignment[]> {
    return db.labelAssignments.where('labelId').equals(labelId).toArray()
  }

  async findTargetIdsByLabelIds(
    targetType: LabelTargetType,
    labelIds: string[],
  ): Promise<string[]> {
    if (labelIds.length === 0) return []
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
    return [...targetIds]
  }

  async setLabelsForTarget(
    targetType: LabelTargetType,
    targetId: string,
    labelIds: string[],
    createdBy?: string,
  ): Promise<void> {
    const uniqueLabelIds = [...new Set(labelIds)]
    await db.transaction('rw', db.labelAssignments, async () => {
      const existing = await db.labelAssignments
        .where('[targetType+targetId]')
        .equals([targetType, targetId])
        .toArray()

      const existingByLabel = new Map(existing.map((item) => [item.labelId, item]))
      const nextSet = new Set(uniqueLabelIds)
      const now = new Date().toISOString()

      const toDelete = existing.filter((item) => !nextSet.has(item.labelId)).map((item) => item.id)
      if (toDelete.length > 0) {
        await db.labelAssignments.bulkDelete(toDelete)
      }

      const toCreate: LabelAssignment[] = []
      for (const labelId of uniqueLabelIds) {
        if (existingByLabel.has(labelId)) continue
        toCreate.push({
          id: generateId('LAS'),
          labelId,
          targetType,
          targetId,
          createdAt: now,
          createdBy,
        })
      }
      if (toCreate.length > 0) {
        await db.labelAssignments.bulkAdd(toCreate)
      }
    })
  }

  async addLabelsToTargets(
    targetType: LabelTargetType,
    targetIds: string[],
    labelIds: string[],
    createdBy?: string,
  ): Promise<void> {
    const uniqueTargetIds = [...new Set(targetIds)]
    const uniqueLabelIds = [...new Set(labelIds)]
    if (uniqueTargetIds.length === 0 || uniqueLabelIds.length === 0) return

    await db.transaction('rw', db.labelAssignments, async () => {
      const existing = await this.findByTargets(targetType, uniqueTargetIds)
      const existingKeys = new Set(existing.map((item) => `${item.targetId}::${item.labelId}`))
      const now = new Date().toISOString()
      const toCreate: LabelAssignment[] = []

      for (const targetId of uniqueTargetIds) {
        for (const labelId of uniqueLabelIds) {
          const key = `${targetId}::${labelId}`
          if (existingKeys.has(key)) continue
          toCreate.push({
            id: generateId('LAS'),
            labelId,
            targetType,
            targetId,
            createdAt: now,
            createdBy,
          })
        }
      }

      if (toCreate.length > 0) {
        await db.labelAssignments.bulkAdd(toCreate)
      }
    })
  }

  async removeLabelsFromTargets(
    targetType: LabelTargetType,
    targetIds: string[],
    labelIds: string[],
  ): Promise<void> {
    const uniqueTargetIds = [...new Set(targetIds)]
    const uniqueLabelIds = new Set(labelIds)
    if (uniqueTargetIds.length === 0 || uniqueLabelIds.size === 0) return

    await db.transaction('rw', db.labelAssignments, async () => {
      const existing = await this.findByTargets(targetType, uniqueTargetIds)
      const toDelete = existing
        .filter((item) => uniqueLabelIds.has(item.labelId))
        .map((item) => item.id)
      if (toDelete.length > 0) {
        await db.labelAssignments.bulkDelete(toDelete)
      }
    })
  }
}
