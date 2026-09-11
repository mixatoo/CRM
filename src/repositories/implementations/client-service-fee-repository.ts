import { db } from '@/infrastructure/database/db'
import type { ClientServiceFee } from '@/domain/entities/client-service-fee'
import type { ClientServiceFeeRepository } from '@/repositories/interfaces'
import { createGenericRepository } from '@/repositories/implementations/dexie-repositories'

export class DexieClientServiceFeeRepository implements ClientServiceFeeRepository {
  private generic = createGenericRepository<ClientServiceFee>(db.clientServiceFees, 'CSF')

  findAll() {
    return this.generic.findAll()
  }

  findById(id: string) {
    return this.generic.findById(id)
  }

  create(data: Omit<ClientServiceFee, 'id'>) {
    return this.generic.create(data)
  }

  update(id: string, data: Partial<ClientServiceFee>) {
    return this.generic.update(id, data)
  }

  delete(id: string) {
    return this.generic.delete(id)
  }

  async findByClientId(clientId: string) {
    const fees = await db.clientServiceFees.where('clientId').equals(clientId).toArray()
    return fees.sort((a, b) => a.serviceName.localeCompare(b.serviceName))
  }

  async deleteByClientId(clientId: string) {
    const fees = await db.clientServiceFees.where('clientId').equals(clientId).toArray()
    await Promise.all(fees.map((fee) => db.clientServiceFees.delete(fee.id)))
  }
}
