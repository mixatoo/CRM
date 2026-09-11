import { db } from '@/infrastructure/database/db'
import {
  DEFAULT_LABELS,
  slugifyLabelName,
  type Label,
  type LabelAssignment,
} from '@/domain/entities/label'
import { generateId } from '@/shared/utils/cn'

export const LABELS_DIRECTORY_VERSION = 1

function buildDefaultLabel(
  seed: (typeof DEFAULT_LABELS)[number],
  timestamp: string,
): Label {
  return {
    id: seed.id,
    name: seed.name,
    slug: slugifyLabelName(seed.name),
    color: seed.color,
    description: seed.description,
    scopes: seed.scopes ? [...seed.scopes] : [],
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

async function seedDefaultLabels(): Promise<void> {
  const timestamp = new Date().toISOString()
  const labels = DEFAULT_LABELS.map((seed) => buildDefaultLabel(seed, timestamp))
  await db.labels.bulkPut(labels)
}

async function syncMissingDefaultLabels(): Promise<void> {
  const timestamp = new Date().toISOString()
  const existing = await db.labels.toArray()
  const existingIds = new Set(existing.map((label) => label.id))
  const missing = DEFAULT_LABELS.filter((seed) => !existingIds.has(seed.id)).map((seed) =>
    buildDefaultLabel(seed, timestamp),
  )
  if (missing.length > 0) {
    await db.labels.bulkPut(missing)
  }
}

/** Attach a few demo labels so directories look populated on first run. */
async function seedDemoAssignmentsIfEmpty(): Promise<void> {
  const assignmentCount = await db.labelAssignments.count()
  if (assignmentCount > 0) return

  const now = new Date().toISOString()
  const assignments: LabelAssignment[] = []

  const clients = await db.clients.limit(8).toArray()
  for (const [index, client] of clients.entries()) {
    const labelId = index % 3 === 0 ? 'LBL-001' : index % 3 === 1 ? 'LBL-003' : 'LBL-005'
    assignments.push({
      id: generateId('LAS'),
      labelId,
      targetType: 'client',
      targetId: client.id,
      createdAt: now,
    })
  }

  const trips = await db.trips.limit(6).toArray()
  for (const [index, trip] of trips.entries()) {
    assignments.push({
      id: generateId('LAS'),
      labelId: index % 2 === 0 ? 'LBL-002' : 'LBL-006',
      targetType: 'trip',
      targetId: trip.id,
      createdAt: now,
    })
  }

  const suppliers = await db.suppliers.limit(4).toArray()
  for (const supplier of suppliers) {
    assignments.push({
      id: generateId('LAS'),
      labelId: 'LBL-008',
      targetType: 'supplier',
      targetId: supplier.id,
      createdAt: now,
    })
  }

  if (assignments.length > 0) {
    await db.labelAssignments.bulkAdd(assignments)
  }
}

export async function ensureLabelsDirectory(): Promise<void> {
  const settings = await db.settings.get('SET-001')
  const version = settings?.labelsDirectoryVersion ?? 0
  const count = await db.labels.count()

  if (count === 0) {
    await seedDefaultLabels()
  } else {
    await syncMissingDefaultLabels()
  }

  await seedDemoAssignmentsIfEmpty()

  if (settings && version < LABELS_DIRECTORY_VERSION) {
    await db.settings.update('SET-001', { labelsDirectoryVersion: LABELS_DIRECTORY_VERSION })
  }
}

export async function countAssignmentsForLabel(labelId: string): Promise<number> {
  return db.labelAssignments.where('labelId').equals(labelId).count()
}
