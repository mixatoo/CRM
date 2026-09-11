export type PaymentDirection = 'inbound' | 'outbound'
export type PaymentMethod = 'bank_transfer' | 'card' | 'cash' | 'cheque' | 'other'
export type PaymentStatus = 'recorded' | 'confirmed' | 'void'

export interface TripPayment {
  id: string
  /** Owning client for inbound receipts; denormalized for account-level queries. */
  clientId?: string
  /** Anchor trip when recorded from a trip workspace; optional for cross-trip client receipts. */
  tripId?: string
  /** @deprecated Use payment allocations instead. Kept for legacy reads. */
  invoiceId?: string
  direction: PaymentDirection
  method: PaymentMethod
  status: PaymentStatus
  amount: number
  currency: string
  reference?: string
  counterpartyName?: string
  notes?: string
  paidAt: string
  createdAt: string
  updatedAt: string
}

export const PAYMENT_METHODS: PaymentMethod[] = ['bank_transfer', 'card', 'cash', 'cheque', 'other']

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  bank_transfer: 'Bank transfer',
  card: 'Card',
  cash: 'Cash',
  cheque: 'Cheque',
  other: 'Other',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  recorded: 'Recorded',
  confirmed: 'Confirmed',
  void: 'Void',
}

export function isActivePayment(payment: Pick<TripPayment, 'status'>): boolean {
  return payment.status !== 'void'
}

export function sumActivePayments(
  payments: Pick<TripPayment, 'direction' | 'amount' | 'status'>[],
  direction: PaymentDirection,
): number {
  return payments
    .filter((payment) => payment.direction === direction && isActivePayment(payment))
    .reduce((sum, payment) => sum + payment.amount, 0)
}
