import { db } from '@/infrastructure/database/db'
import type { PaymentAllocation } from '@/domain/entities/payment-allocation'
import type { PaymentAllocationRepository } from '@/repositories/interfaces'
import { generateId } from '@/shared/utils/cn'

export class DexiePaymentAllocationRepository implements PaymentAllocationRepository {
  async findByPaymentId(paymentId: string) {
    return db.paymentAllocations.where('paymentId').equals(paymentId).toArray()
  }

  async findByPaymentIds(paymentIds: string[]) {
    if (paymentIds.length === 0) return []
    return db.paymentAllocations.where('paymentId').anyOf(paymentIds).toArray()
  }

  async findByInvoiceId(invoiceId: string) {
    return db.paymentAllocations.where('invoiceId').equals(invoiceId).toArray()
  }

  async createMany(
    paymentId: string,
    rows: Array<Pick<PaymentAllocation, 'invoiceId' | 'amount'>>,
  ): Promise<PaymentAllocation[]> {
    const now = new Date().toISOString()
    const items: PaymentAllocation[] = rows.map((row) => ({
      id: generateId('PAL'),
      paymentId,
      invoiceId: row.invoiceId,
      amount: row.amount,
      createdAt: now,
    }))
    await db.paymentAllocations.bulkAdd(items)
    return items
  }

  async deleteByPaymentId(paymentId: string) {
    await db.paymentAllocations.where('paymentId').equals(paymentId).delete()
  }
}
