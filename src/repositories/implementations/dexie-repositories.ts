import type { EntityTable, IDType } from 'dexie'
import { generateId } from '@/shared/utils/cn'
import type { GenericRepository } from '@/repositories/interfaces'

export function createGenericRepository<T extends { id: string }>(
  table: EntityTable<T, 'id'>,
  idPrefix: string,
): GenericRepository<T> {
  return {
    async findAll() {
      return table.toArray()
    },
    async findById(id: string) {
      return (await table.get(id as IDType<T, 'id'>)) ?? null
    },
    async create(data) {
      const item = { ...data, id: generateId(idPrefix) } as T
      await table.add(item)
      return item
    },
    async update(id, data) {
      const existing = await table.get(id as IDType<T, 'id'>)
      if (!existing) throw new Error('Record not found')
      const updated = { ...existing, ...data } as T
      await table.put(updated)
      return updated
    },
    async delete(id) {
      await table.delete(id as IDType<T, 'id'>)
    },
  }
}
