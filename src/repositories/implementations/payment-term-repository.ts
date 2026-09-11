import { db } from '@/infrastructure/database/db'
import { createGenericRepository } from '@/repositories/implementations/dexie-repositories'
import type { PaymentTermRepository } from '@/repositories/interfaces'
import type { PaymentTerm } from '@/domain/entities/payment-term'
import { sortPaymentTerms } from '@/domain/entities/payment-term'
import { countClientsUsingPaymentTerm } from '@/infrastructure/database/payment-term-seed'

export class DexiePaymentTermRepository implements PaymentTermRepository {
  private readonly generic = createGenericRepository<PaymentTerm>(db.paymentTerms, 'PTM')

  findAll() {
    return this.generic.findAll()
  }

  findById(id: string) {
    return this.generic.findById(id)
  }

  create(data: Omit<PaymentTerm, 'id'>) {
    return this.generic.create(data)
  }

  update(id: string, data: Partial<PaymentTerm>) {
    return this.generic.update(id, data)
  }

  delete(id: string) {
    return this.generic.delete(id)
  }

  async findActive(): Promise<PaymentTerm[]> {
    const terms = await db.paymentTerms.filter((term) => term.isActive).toArray()
    return sortPaymentTerms(terms)
  }

  countLinkedClients(paymentTermId: string) {
    return countClientsUsingPaymentTerm(paymentTermId)
  }
}
