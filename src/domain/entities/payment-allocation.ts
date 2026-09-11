export interface PaymentAllocation {
  id: string
  paymentId: string
  invoiceId: string
  amount: number
  createdAt: string
}

export type PaymentAllocationInput = {
  invoiceId: string
  amount: number
}

export function sumAllocationAmounts(allocations: Pick<PaymentAllocation, 'amount'>[]): number {
  return allocations.reduce((sum, row) => sum + row.amount, 0)
}

export function paymentUnallocatedAmount(
  paymentAmount: number,
  allocations: Pick<PaymentAllocation, 'amount'>[],
): number {
  return Math.max(0, Math.round((paymentAmount - sumAllocationAmounts(allocations)) * 100) / 100)
}
