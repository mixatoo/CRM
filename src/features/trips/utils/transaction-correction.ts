import type { TicketTransaction, TicketTransactionType } from '@/domain/flight/types'
import type { TicketOperation } from '@/domain/flight/transitions'

export function transactionTypeToOperation(type: TicketTransactionType): TicketOperation | null {
  switch (type) {
    case 'issue':
      return 'issue'
    case 'refund':
      return 'refund'
    case 'partial_refund':
      return 'partial_refund'
    case 'reissue':
    case 'partial_reissue':
      return 'reissue'
    case 'void':
      return 'void'
    case 'cancellation':
      return 'cancel'
    case 'client_payment':
      return 'client_payment'
    case 'supplier_payment':
      return 'supplier_payment'
    default:
      return null
  }
}

export function extractTransactionSeed(txn: TicketTransaction): unknown {
  if (txn.issue) return txn.issue
  if (txn.refund) return txn.refund
  if (txn.reissue) return txn.reissue
  if (txn.void) return txn.void
  if (txn.cancellation) return txn.cancellation
  if (txn.payment) return txn.payment
  return undefined
}
