import type { FlightServiceDetails } from '@/domain/flight/types'
import type { CancellationTransactionData, IssueTransactionData, PaymentTransactionData, RefundTransactionData, ReissueTransactionData, VoidTransactionData } from '@/domain/flight/types'
import {
  applyCancelTicket,
  applyClientPayment,
  applyIssueTicket,
  applyRefundTicket,
  applyReissueTicket,
  applySupplierPayment,
  applyVoidTicket,
  type OperationContext,
} from '@/domain/flight/ticket'
import type { TicketOperation } from '@/domain/flight/transitions'
import type { Result } from '@/shared/result'

export type { TicketOperation }

export function executeTicketOperation(
  details: FlightServiceDetails,
  ticketId: string,
  operation: TicketOperation,
  data: unknown,
  ctx: OperationContext = {},
): Result<FlightServiceDetails> {
  switch (operation) {
    case 'issue':
      return applyIssueTicket(details, ticketId, data as IssueTransactionData, ctx)
    case 'refund':
      return applyRefundTicket(details, ticketId, data as RefundTransactionData, false, ctx)
    case 'partial_refund':
      return applyRefundTicket(details, ticketId, data as RefundTransactionData, true, ctx)
    case 'reissue':
      return applyReissueTicket(details, ticketId, data as ReissueTransactionData, false, ctx)
    case 'void':
      return applyVoidTicket(details, ticketId, data as VoidTransactionData, ctx)
    case 'cancel':
      return applyCancelTicket(details, ticketId, data as CancellationTransactionData, ctx)
    case 'client_payment':
      return applyClientPayment(details, ticketId, data as PaymentTransactionData, ctx)
    case 'supplier_payment':
      return applySupplierPayment(details, ticketId, data as PaymentTransactionData, ctx)
    default:
      return {
        ok: false,
        error: { code: 'VALIDATION', message: `Unknown ticket operation: ${operation}` },
      }
  }
}
