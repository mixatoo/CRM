/** Enterprise flight domain — aligned with BSP/GDS/TMC ticketing models. */

export const FLIGHT_TRIP_TYPES = ['one_way', 'round_trip', 'multi_city'] as const
export type FlightTripType = (typeof FLIGHT_TRIP_TYPES)[number]

export const FLIGHT_TRIP_TYPE_LABELS: Record<FlightTripType, string> = {
  one_way: 'One Way',
  round_trip: 'Round Trip',
  multi_city: 'Multi-City',
}

export const PASSENGER_TYPES = ['adult', 'child', 'infant'] as const
export type PassengerType = (typeof PASSENGER_TYPES)[number]

export const PASSENGER_TYPE_LABELS: Record<PassengerType, string> = {
  adult: 'Adult',
  child: 'Child',
  infant: 'Infant',
}

export const PASSENGER_TITLES = ['', 'Mr', 'Mrs', 'Ms', 'Miss', 'Dr', 'Mstr'] as const
export type PassengerTitle = (typeof PASSENGER_TITLES)[number]

export interface FlightFieldOption {
  value: string
  label: string
}

export const PASSENGER_TITLE_OPTIONS: FlightFieldOption[] = PASSENGER_TITLES.map((title) => ({
  value: title,
  label: title || '—',
}))

export const PASSENGER_TYPE_OPTIONS: FlightFieldOption[] = PASSENGER_TYPES.map((type) => ({
  value: type,
  label: PASSENGER_TYPE_LABELS[type],
}))

export const CABIN_CLASS_OPTIONS: FlightFieldOption[] = [
  { value: '', label: '—' },
  { value: 'Economy', label: 'Economy' },
  { value: 'Premium Economy', label: 'P Economy' },
  { value: 'Business', label: 'Business' },
  { value: 'First', label: 'First' },
]

export const FLIGHT_AIRLINE_OPTIONS: FlightFieldOption[] = [
  { value: '', label: '—' },
  { value: 'EgyptAir', label: 'EgyptAir' },
  { value: 'Emirates', label: 'Emirates' },
  { value: 'Turkish Airlines', label: 'Turkish Airlines' },
  { value: 'Nile Air', label: 'Nile Air' },
  { value: 'Qatar Airways', label: 'Qatar Airways' },
  { value: 'Saudia', label: 'Saudia' },
  { value: 'Etihad Airways', label: 'Etihad Airways' },
  { value: 'Lufthansa', label: 'Lufthansa' },
]

export const TICKET_FULFILLMENT_SOURCES = ['gds', 'external_supplier'] as const
export type TicketFulfillmentSource = (typeof TICKET_FULFILLMENT_SOURCES)[number]

export const TICKET_FULFILLMENT_LABELS: Record<TicketFulfillmentSource, string> = {
  gds: 'Agency GDS',
  external_supplier: 'External supplier',
}

export const AGENCY_GDS_SUPPLIER_ID = 'agency-gds'
export const AGENCY_GDS_SUPPLIER_NAME = 'Agency GDS'

export const FLIGHT_EXTERNAL_SUPPLIER_OPTIONS: FlightFieldOption[] = [
  { value: '', label: 'Select supplier…' },
  { value: 'egyptair-trade', label: 'EgyptAir — Trade desk' },
  { value: 'emirates-trade', label: 'Emirates — Trade desk' },
  { value: 'turkish-trade', label: 'Turkish Airlines — Trade desk' },
  { value: 'nile-air-trade', label: 'Nile Air — Trade desk' },
  { value: 'amadeus-consolidator', label: 'Amadeus consolidator' },
  { value: 'sabre-bsp', label: 'Sabre BSP agent' },
  { value: 'galileo-consolidator', label: 'Galileo consolidator' },
]

export const FLIGHT_SEGMENT_STATUS_OPTIONS: FlightFieldOption[] = [
  { value: '', label: '—' },
  { value: 'HK', label: 'HK — Confirmed' },
  { value: 'HL', label: 'HL — Waitlist' },
  { value: 'TK', label: 'TK — Changed' },
  { value: 'UN', label: 'UN — Cancelled' },
  { value: 'FO', label: 'FO — Flown' },
  { value: 'NS', label: 'NS — No show' },
]

export const TICKET_STATUSES = [
  'draft',
  'requested',
  'issued',
  'void',
  'refunded',
  'partially_refunded',
  'reissued',
  'exchanged',
  'cancelled',
] as const
export type TicketStatus = (typeof TICKET_STATUSES)[number]

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  draft: 'Draft',
  requested: 'Requested',
  issued: 'Issued',
  void: 'Void',
  refunded: 'Refunded',
  partially_refunded: 'Partial Refund',
  reissued: 'Reissued',
  exchanged: 'Exchanged',
  cancelled: 'Cancelled',
}

export const PAYMENT_STATUSES = ['unpaid', 'partial', 'paid', 'overpaid'] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: 'Unpaid',
  partial: 'Partial',
  paid: 'Paid',
  overpaid: 'Overpaid',
}

export const TICKET_TRANSACTION_TYPES = [
  'issue',
  'refund',
  'partial_refund',
  'reissue',
  'partial_reissue',
  'void',
  'cancellation',
  'exchange',
  'client_payment',
  'supplier_payment',
  'refund_payment',
  'manual_adjustment',
  'credit_note',
  'debit_note',
] as const
export type TicketTransactionType = (typeof TICKET_TRANSACTION_TYPES)[number]

export const TICKET_TRANSACTION_TYPE_LABELS: Record<TicketTransactionType, string> = {
  issue: 'Issue',
  refund: 'Refund',
  partial_refund: 'Partial Refund',
  reissue: 'Reissue',
  partial_reissue: 'Partial Reissue',
  void: 'Void',
  cancellation: 'Cancellation',
  exchange: 'Exchange',
  client_payment: 'Client Payment',
  supplier_payment: 'Supplier Payment',
  refund_payment: 'Refund Payment',
  manual_adjustment: 'Adjustment',
  credit_note: 'Credit Note',
  debit_note: 'Debit Note',
}

export const TRANSACTION_STATUSES = ['pending', 'completed', 'cancelled'] as const
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number]

export const REFUND_STATUSES = ['requested', 'approved', 'processed', 'rejected'] as const
export type RefundStatus = (typeof REFUND_STATUSES)[number]

export const REISSUE_STATUSES = ['requested', 'quoted', 'completed', 'cancelled'] as const
export type ReissueStatus = (typeof REISSUE_STATUSES)[number]

export const VOID_STATUSES = ['requested', 'completed', 'rejected'] as const
export type VoidStatus = (typeof VOID_STATUSES)[number]

/** Monetary breakdown stored on each ticket (per-ticket pricing). */
export interface TicketPricing {
  fare: number
  taxes: number
  airlineFees: number
  supplierFees: number
  agencyServiceFees: number
  /** Airline/supplier commission received (reduces net cost). */
  commission: number
  /** Amount discounted from the client selling price. */
  clientDiscount: number
  /** fare + taxes + airlineFees + supplierFees */
  supplierCost: number
  sellingPrice: number
  /** sellingPrice - supplierCost */
  profit: number
  currency: string
  exchangeRate: number
}

/** Running financial position for a ticket. */
export interface TicketFinancialSnapshot {
  supplierCost: number
  sellingPrice: number
  grossProfit: number
  netProfit: number
  clientReceivable: number
  supplierPayable: number
  amountCollected: number
  amountOutstanding: number
  amountPaidToSupplier: number
  supplierOutstanding: number
  currency: string
  exchangeRate: number
  paymentStatus: PaymentStatus
}

/** Append-only ledger entry (double-entry style). */
export interface TicketLedgerEntry {
  id: string
  date: string
  transactionType: TicketTransactionType
  transactionId: string
  description: string
  debit: number
  credit: number
  currency: string
  exchangeRate: number
  userId?: string
  userName?: string
  referenceNumber?: string
}

export interface IssueTransactionData {
  issueDate: string
  ticketNumber: string
  notes?: string
  currency: string
  /** EGP per 1 unit of `currency` (1 when currency is EGP). */
  exchangeRate: number
  fulfillmentSource: TicketFulfillmentSource
  supplierId?: string
  supplierName?: string
  fare: number
  taxes: number
  airlineFees: number
  supplierFees: number
  agencyServiceFees: number
  commission: number
  clientDiscount: number
  sellingPrice: number
}

export interface RefundTransactionData {
  refundRequestDate: string
  refundProcessedDate?: string
  refundAmount: number
  airlinePenalty: number
  supplierFees: number
  agencyFees: number
  netRefund: number
  profitLoss: number
  status: RefundStatus
  notes?: string
}

export interface ReissueTransactionData {
  oldTicketNumber: string
  newTicketNumber: string
  fareDifference: number
  taxDifference: number
  reissuePenalty: number
  supplierFees: number
  agencyFees: number
  amountToCollect: number
  amountToPay: number
  profit: number
  status: ReissueStatus
  notes?: string
}

export interface VoidTransactionData {
  voidFee: number
  supplierFee: number
  agencyFee: number
  profitLoss: number
  status: VoidStatus
  notes?: string
}

export interface CancellationTransactionData {
  isRefundable: boolean
  cancellationPenalty: number
  supplierFees: number
  agencyFees: number
  netRefund: number
  profitLoss: number
  notes?: string
}

export interface PaymentTransactionData {
  amount: number
  currency: string
  exchangeRate: number
  referenceNumber?: string
  notes?: string
}

/** Immutable transaction record — never deleted; corrections use reversal + a new transaction. */
export interface TicketTransaction {
  id: string
  type: TicketTransactionType
  ticketId: string
  relatedTicketId?: string
  /** When this row reverses a prior completed transaction. */
  reversesTransactionId?: string
  createdAt: string
  createdBy?: string
  createdByName?: string
  status: TransactionStatus
  issue?: IssueTransactionData
  refund?: RefundTransactionData
  reissue?: ReissueTransactionData
  void?: VoidTransactionData
  cancellation?: CancellationTransactionData
  payment?: PaymentTransactionData
  notes?: string
}

/** Flight leg within a ticket. */
export interface FlightSegment {
  id: string
  airline: string
  flightNumber: string
  departureAirport: string
  arrivalAirport: string
  departureDate: string
  departureTime: string
  arrivalDate: string
  arrivalTime: string
  cabinClass?: string
  segmentStatus?: string
}

/**
 * First-class ticket entity — the commercial & accounting unit.
 * Each ticket belongs to one passenger and may have its own PNR, airline, supplier, and pricing.
 */
export interface FlightTicket {
  id: string
  passengerId: string
  pnr: string
  ticketNumber: string
  airline: string
  supplierId?: string
  supplierName: string
  route: string
  cabinClass: string
  issueDate?: string
  status: TicketStatus
  pricing: TicketPricing
  financials: TicketFinancialSnapshot
  segments: FlightSegment[]
  transactions: TicketTransaction[]
  ledger: TicketLedgerEntry[]
  /** Legacy fields kept for compatibility */
  fareClass?: string
  baggageAllowance?: string
  seats?: string
  clientId?: string
}

export interface FlightPassenger {
  id: string
  passengerTitle?: string
  passengerName: string
  passengerType: PassengerType
  dateOfBirth?: string
  tickets: FlightTicket[]
}

export interface FlightServiceFinancialSummary {
  supplierCost: number
  sellingPrice: number
  grossProfit: number
  netProfit: number
  clientReceivable: number
  supplierPayable: number
  amountCollected: number
  amountOutstanding: number
  amountPaidToSupplier: number
  supplierOutstanding: number
  currency: string
  exchangeRate: number
  paymentStatus: PaymentStatus
  ticketCount: number
  issuedCount: number
}

export interface FlightServiceDetails {
  tripType: FlightTripType
  bookingPnr?: string
  passengers: FlightPassenger[]
  financialSummary?: FlightServiceFinancialSummary
  /** Schema version for migrations */
  schemaVersion?: number
}

export const FLIGHT_SCHEMA_VERSION = 17
