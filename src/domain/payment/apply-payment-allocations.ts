import type { Invoice } from '@/domain/entities/invoice'
import { applyInvoicePayment, invoiceBalanceDue } from '@/domain/entities/invoice'
import type { PaymentAllocationInput } from '@/domain/entities/payment-allocation'
import { sumAllocationAmounts } from '@/domain/entities/payment-allocation'

export function normalizeAllocationInputs(allocations: PaymentAllocationInput[]): PaymentAllocationInput[] {
  return allocations
    .map((row) => ({
      invoiceId: row.invoiceId,
      amount: Math.round(row.amount * 100) / 100,
    }))
    .filter((row) => row.invoiceId && row.amount > 0)
}

export function validatePaymentAllocations(
  paymentAmount: number,
  allocations: PaymentAllocationInput[],
  invoicesById: Map<string, Invoice>,
): void {
  if (paymentAmount <= 0) throw new Error('Amount must be greater than zero')

  const normalized = normalizeAllocationInputs(allocations)
  const allocated = sumAllocationAmounts(normalized)

  if (allocated > paymentAmount + 0.001) {
    throw new Error('Allocated amount cannot exceed the receipt total.')
  }

  for (const row of normalized) {
    const invoice = invoicesById.get(row.invoiceId)
    if (!invoice) throw new Error('One or more invoices could not be found.')
    if (invoice.status === 'void' || invoice.status === 'paid') {
      throw new Error(`Invoice ${invoice.number} cannot accept payments.`)
    }
    const balance = invoiceBalanceDue(invoice)
    if (row.amount > balance + 0.001) {
      throw new Error(`Allocation for ${invoice.number} exceeds the open balance.`)
    }
  }
}

export function buildInvoicePatchesFromAllocations(
  allocations: PaymentAllocationInput[],
  invoicesById: Map<string, Invoice>,
): Map<string, ReturnType<typeof applyInvoicePayment>> {
  const patches = new Map<string, ReturnType<typeof applyInvoicePayment>>()
  const normalized = normalizeAllocationInputs(allocations)

  for (const row of normalized) {
    const invoice = invoicesById.get(row.invoiceId)
    if (!invoice) continue
    const current = patches.get(invoice.id)
      ? { ...invoice, ...patches.get(invoice.id)! }
      : invoice
    patches.set(invoice.id, applyInvoicePayment(current, row.amount))
  }

  return patches
}

export function buildInvoiceReversalPatches(
  allocations: PaymentAllocationInput[],
  invoicesById: Map<string, Invoice>,
): Map<string, Pick<Invoice, 'amountPaid' | 'status'>> {
  const patches = new Map<string, Pick<Invoice, 'amountPaid' | 'status'>>()
  const normalized = normalizeAllocationInputs(allocations)

  for (const row of normalized) {
    const invoice = invoicesById.get(row.invoiceId)
    if (!invoice) continue

    const prior = patches.get(invoice.id)
    const amountPaid = Math.max(
      0,
      Math.round(((prior?.amountPaid ?? invoice.amountPaid) - row.amount) * 100) / 100,
    )
    let status = invoice.status
    if (amountPaid <= 0) {
      status = invoice.status === 'paid' ? 'sent' : invoice.status
    } else if (amountPaid < invoice.total) {
      status = invoice.status === 'paid' ? 'sent' : invoice.status
    }

    patches.set(invoice.id, { amountPaid, status })
  }

  return patches
}
