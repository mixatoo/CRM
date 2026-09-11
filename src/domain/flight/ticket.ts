import {
  computeTicketFinancials,
  createTransactionId,
  derivePrimaryAirline,
  derivePrimaryCabin,
  deriveTicketRoute,
  normalizeTicketPricing,
  refreshTicketComputedFields,
  roundMoney,
} from '@/domain/flight/financial'
import {
  buildCancellationLedgerEntries,
  buildIssueLedgerEntries,
  buildPaymentLedgerEntries,
  buildRefundLedgerEntries,
  buildReissueLedgerEntries,
  buildVoidLedgerEntries,
} from '@/domain/flight/ledger'
import type {
  CancellationTransactionData,
  FlightPassenger,
  FlightSegment,
  FlightServiceDetails,
  FlightTicket,
  FlightTripType,
  IssueTransactionData,
  PaymentTransactionData,
  RefundTransactionData,
  ReissueTransactionData,
  TicketLedgerEntry,
  TicketPricing,
  TicketTransaction,
  VoidTransactionData,
} from '@/domain/flight/types'
import { FLIGHT_SCHEMA_VERSION, AGENCY_GDS_SUPPLIER_ID, AGENCY_GDS_SUPPLIER_NAME } from '@/domain/flight/types'
import { BASE_CURRENCY, normalizeExchangeRate } from '@/domain/currency'
import {
  validateCancellationData,
  validateIssueData,
  validatePaymentData,
  validateRefundData,
  validateReissueData,
  validateTicketOperation,
  validateVoidData,
  type TicketOperationContext,
} from '@/domain/flight/transitions'
import { err, ok, type Result } from '@/shared/result'

export function createFlightSegmentId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `seg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function createFlightTicketId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `tkt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function createFlightPassengerId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `psg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function createEmptyFlightSegment(overrides: Partial<FlightSegment> = {}): FlightSegment {
  return normalizeFlightSegment({
    id: createFlightSegmentId(),
    ...overrides,
  })
}

export function normalizeFlightSegment(segment: Partial<FlightSegment> & { id: string }): FlightSegment {
  return {
    id: segment.id,
    airline: segment.airline ?? '',
    flightNumber: segment.flightNumber ?? '',
    departureAirport: segment.departureAirport ?? '',
    arrivalAirport: segment.arrivalAirport ?? '',
    departureDate: segment.departureDate ?? '',
    departureTime: segment.departureTime ?? '',
    arrivalDate: segment.arrivalDate ?? '',
    arrivalTime: segment.arrivalTime ?? '',
    cabinClass: segment.cabinClass,
    segmentStatus: segment.segmentStatus,
  }
}

export function cloneFlightSegments(segments: FlightSegment[]): FlightSegment[] {
  return segments.map((segment) =>
    createEmptyFlightSegment({
      airline: segment.airline,
      flightNumber: segment.flightNumber,
      departureAirport: segment.departureAirport,
      arrivalAirport: segment.arrivalAirport,
      departureDate: segment.departureDate,
      departureTime: segment.departureTime,
      arrivalDate: segment.arrivalDate,
      arrivalTime: segment.arrivalTime,
      cabinClass: segment.cabinClass,
      segmentStatus: segment.segmentStatus,
    }),
  )
}

export function defaultTicketPricing(currency = BASE_CURRENCY): TicketPricing {
  return normalizeTicketPricing({ currency, exchangeRate: 1, fare: 0, taxes: 0, airlineFees: 0, supplierFees: 0, agencyServiceFees: 0, commission: 0, clientDiscount: 0, sellingPrice: 0 })
}

export function createEmptyFlightTicket(
  passengerId: string,
  tripType: FlightTripType = 'one_way',
  overrides: Partial<Omit<FlightTicket, 'id' | 'passengerId' | 'segments' | 'pricing' | 'financials'>> & {
    segments?: FlightSegment[]
    pricing?: Partial<TicketPricing>
    transactions?: FlightTicket['transactions']
    ledger?: FlightTicket['ledger']
  } = {},
  defaultCurrency = BASE_CURRENCY,
): FlightTicket {
  const segments = normalizeSegmentsForTripType(
    tripType,
    overrides.segments?.length ? overrides.segments : [],
  )
  const pricing = normalizeTicketPricing({ ...defaultTicketPricing(defaultCurrency), ...overrides.pricing })
  const { segments: _s, pricing: _p, ...rest } = overrides

  const base: FlightTicket = {
    id: createFlightTicketId(),
    passengerId,
    pnr: rest.pnr ?? '',
    ticketNumber: rest.ticketNumber ?? '',
    airline: rest.airline ?? derivePrimaryAirline(segments),
    supplierId: rest.supplierId,
    supplierName: rest.supplierName ?? '',
    route: rest.route ?? deriveTicketRoute(segments),
    cabinClass: rest.cabinClass ?? derivePrimaryCabin(segments),
    issueDate: rest.issueDate,
    status: rest.status ?? 'draft',
    pricing,
    financials: computeTicketFinancials(pricing, []),
    segments,
    transactions: rest.transactions ?? [],
    ledger: rest.ledger ?? [],
    fareClass: rest.fareClass,
    baggageAllowance: rest.baggageAllowance,
    seats: rest.seats,
    clientId: rest.clientId,
  }

  return refreshTicketComputedFields(base)
}

export function normalizeFlightTicket(ticket: Partial<FlightTicket> & { id: string }, passengerId: string, defaultCurrency = BASE_CURRENCY): FlightTicket {
  const segments = (ticket.segments ?? []).map((s) => normalizeFlightSegment({ ...s, id: s.id ?? createFlightSegmentId() }))
  const pricing = normalizeTicketPricing({ ...defaultTicketPricing(defaultCurrency), ...ticket.pricing })
  const ledger = ticket.ledger ?? []
  const financials = computeTicketFinancials(pricing, ledger)

  return refreshTicketComputedFields({
    id: ticket.id,
    passengerId: ticket.passengerId ?? passengerId,
    pnr: ticket.pnr ?? '',
    ticketNumber: ticket.ticketNumber ?? '',
    airline: ticket.airline ?? '',
    supplierId: ticket.supplierId,
    supplierName: ticket.supplierName ?? '',
    route: ticket.route ?? '',
    cabinClass: ticket.cabinClass ?? '',
    issueDate: ticket.issueDate,
    status: ticket.status ?? 'draft',
    pricing,
    financials,
    segments,
    transactions: ticket.transactions ?? [],
    ledger,
    fareClass: ticket.fareClass,
    baggageAllowance: ticket.baggageAllowance,
    seats: ticket.seats,
    clientId: ticket.clientId,
  })
}

export function createEmptyFlightPassenger(
  tripType: FlightTripType = 'one_way',
  overrides: Partial<Omit<FlightPassenger, 'tickets'>> & { tickets?: FlightTicket[] } = {},
  defaultCurrency = BASE_CURRENCY,
): FlightPassenger {
  const id = overrides.id ?? createFlightPassengerId()
  const tickets =
    overrides.tickets && overrides.tickets.length > 0
      ? overrides.tickets.map((t) => normalizeFlightTicket(t, id, defaultCurrency))
      : [createEmptyFlightTicket(id, tripType, {}, defaultCurrency)]

  return {
    id,
    passengerTitle: overrides.passengerTitle ?? '',
    passengerName: overrides.passengerName ?? '',
    passengerType: overrides.passengerType ?? 'adult',
    dateOfBirth: overrides.dateOfBirth,
    tickets,
  }
}

export function normalizeFlightPassenger(
  passenger: Partial<FlightPassenger> & { id: string },
  tripType: FlightTripType = 'one_way',
  defaultCurrency = BASE_CURRENCY,
): FlightPassenger {
  const tickets =
    passenger.tickets && passenger.tickets.length > 0
      ? passenger.tickets.map((t) =>
          normalizeFlightTicket({ ...t, id: t.id ?? createFlightTicketId() }, passenger.id, defaultCurrency),
        )
      : [createEmptyFlightTicket(passenger.id, tripType, {}, defaultCurrency)]

  return {
    id: passenger.id,
    passengerTitle: passenger.passengerTitle ?? '',
    passengerName: passenger.passengerName ?? '',
    passengerType: passenger.passengerType ?? 'adult',
    dateOfBirth: passenger.dateOfBirth,
    tickets,
  }
}

export function requiredSegmentCount(tripType: FlightTripType): number | null {
  if (tripType === 'round_trip') return 2
  if (tripType === 'one_way') return 1
  return null
}

export function normalizeSegmentsForTripType(tripType: FlightTripType, segments: FlightSegment[]): FlightSegment[] {
  const nonEmpty = segments.length > 0 ? segments : [createEmptyFlightSegment()]

  if (tripType === 'multi_city' || tripType === 'one_way') {
    return nonEmpty.map((segment) => normalizeFlightSegment(segment))
  }

  const outbound = normalizeFlightSegment(nonEmpty[0])
  const inbound = normalizeFlightSegment(nonEmpty[1] ?? createEmptyFlightSegment())
  return [outbound, inbound]
}

export function normalizePassengersForTripType(tripType: FlightTripType, passengers: FlightPassenger[]): FlightPassenger[] {
  return passengers.map((passenger) => ({
    ...passenger,
    tickets: passenger.tickets.map((ticket) => ({
      ...ticket,
      segments: normalizeSegmentsForTripType(tripType, ticket.segments),
    })),
  }))
}

export function flightSegmentLabel(tripType: FlightTripType, index: number): string {
  if (tripType === 'round_trip') return index === 0 ? 'Outbound flight' : 'Return flight'
  if (index === 0) return 'Segment 1'
  return `Segment ${index + 1}`
}

export function flightSegmentShortLabel(tripType: FlightTripType, index: number, totalSegments = 1): string {
  if (tripType === 'round_trip') return index === 0 ? 'OUT' : 'RET'
  if (tripType === 'one_way' && totalSegments === 1) return '—'
  return String(index + 1)
}

export function segmentDepartureTimestamp(segment: Pick<FlightSegment, 'departureDate' | 'departureTime'>): number | null {
  if (!segment.departureDate) return null
  const time = segment.departureTime.trim() || '00:00'
  const parsed = new Date(`${segment.departureDate}T${time}`)
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime()
}

/** Generate one draft ticket per passenger (bulk action). */
export function generateTicketsForAllPassengers(
  passengers: FlightPassenger[],
  tripType: FlightTripType,
  templateTicket?: Partial<FlightTicket>,
  defaultCurrency = BASE_CURRENCY,
): FlightPassenger[] {
  return passengers.map((passenger) => {
    if (passenger.tickets.length > 0 && passenger.tickets.some((t) => t.status !== 'draft' || t.segments.some((s) => s.flightNumber))) {
      return passenger
    }
    const templateSegments = templateTicket?.segments ?? passenger.tickets[0]?.segments ?? []
    return {
      ...passenger,
      tickets: [
        createEmptyFlightTicket(
          passenger.id,
          tripType,
          {
            ...templateTicket,
            segments: cloneFlightSegments(templateSegments.length ? templateSegments : normalizeSegmentsForTripType(tripType, [])),
            pnr: templateTicket?.pnr ?? passenger.tickets[0]?.pnr ?? '',
          },
          defaultCurrency,
        ),
      ],
    }
  })
}

export function defaultFlightServiceDetails(tripType: FlightTripType = 'one_way', defaultCurrency = BASE_CURRENCY): FlightServiceDetails {
  return {
    tripType,
    bookingPnr: '',
    passengers: [createEmptyFlightPassenger(tripType, {}, defaultCurrency)],
    schemaVersion: FLIGHT_SCHEMA_VERSION,
  }
}

export function deriveFlightServiceSummary(details: FlightServiceDetails): {
  name: string
  supplierName: string
  startDate?: string
  endDate?: string
} {
  const allTickets = details.passengers.flatMap((p) => p.tickets)
  const firstTicket = allTickets[0]
  const segments = firstTicket?.segments ?? []
  const first = segments[0]
  if (!first) {
    return { name: 'Flight service', supplierName: '' }
  }

  const last = segments[segments.length - 1]
  const route = firstTicket?.route || deriveTicketRoute(segments)
  const passengerCount = details.passengers.length
  const ticketCount = allTickets.length
  const flightRef = first.flightNumber.trim() ? ` — ${first.flightNumber.trim()}` : ''
  const passengers =
    passengerCount > 1
      ? ` (${passengerCount} pax, ${ticketCount} tkt)`
      : details.passengers[0]?.passengerName.trim()
        ? ` — ${details.passengers[0].passengerName.trim()}`
        : ''

  const tripLabel = details.tripType === 'multi_city' ? 'Multi-city' : details.tripType === 'round_trip' ? 'Round trip' : 'One way'

  return {
    name: `${route}${flightRef}${passengers} · ${tripLabel}`,
    supplierName: firstTicket?.supplierName?.trim() || firstTicket?.airline?.trim() || first.airline.trim(),
    startDate: first.departureDate || undefined,
    endDate: last.arrivalDate || last.departureDate || undefined,
  }
}

export function findTicketInService(
  details: FlightServiceDetails,
  ticketId: string,
): { passenger: FlightPassenger; ticket: FlightTicket; passengerIndex: number; ticketIndex: number } | null {
  for (let pi = 0; pi < details.passengers.length; pi++) {
    const passenger = details.passengers[pi]
    for (let ti = 0; ti < passenger.tickets.length; ti++) {
      if (passenger.tickets[ti].id === ticketId) {
        return { passenger, ticket: passenger.tickets[ti], passengerIndex: pi, ticketIndex: ti }
      }
    }
  }
  return null
}

export function updateTicketInService(
  details: FlightServiceDetails,
  ticketId: string,
  updater: (ticket: FlightTicket) => FlightTicket,
): FlightServiceDetails {
  return {
    ...details,
    passengers: details.passengers.map((passenger) => ({
      ...passenger,
      tickets: passenger.tickets.map((ticket) =>
        ticket.id === ticketId ? refreshTicketComputedFields(updater(ticket)) : ticket,
      ),
    })),
  }
}

export function appendTransactionToTicket(
  ticket: FlightTicket,
  transaction: TicketTransaction,
  ledgerEntries: TicketLedgerEntry[],
): FlightTicket {
  const ledger = [...ticket.ledger, ...ledgerEntries]
  const financials = computeTicketFinancials(ticket.pricing, ledger)
  return refreshTicketComputedFields({
    ...ticket,
    transactions: [...ticket.transactions, transaction],
    ledger,
    financials,
  })
}

export function computeRefundPreview(
  ticket: FlightTicket,
  input: Pick<RefundTransactionData, 'refundAmount' | 'airlinePenalty' | 'supplierFees' | 'agencyFees'>,
): Pick<RefundTransactionData, 'netRefund' | 'profitLoss'> {
  const netRefund = roundMoney(Math.max(0, input.refundAmount - input.airlinePenalty - input.supplierFees - input.agencyFees))
  const profitLoss = roundMoney(netRefund - ticket.pricing.profit)
  return { netRefund, profitLoss }
}

export function computeReissuePreview(
  _ticket: FlightTicket,
  input: Pick<ReissueTransactionData, 'fareDifference' | 'taxDifference' | 'reissuePenalty' | 'supplierFees' | 'agencyFees'>,
): Pick<ReissueTransactionData, 'amountToCollect' | 'amountToPay' | 'profit'> {
  const airlineDelta =
    input.fareDifference + input.taxDifference + input.reissuePenalty + input.supplierFees
  const amountToCollect = roundMoney(Math.max(0, airlineDelta + input.agencyFees))
  const amountToPay = roundMoney(Math.max(0, -airlineDelta))
  const profit = roundMoney(input.agencyFees + Math.min(0, airlineDelta))
  return { amountToCollect, amountToPay, profit }
}

export function computeVoidPreview(
  ticket: FlightTicket,
  input: Pick<VoidTransactionData, 'voidFee' | 'supplierFee' | 'agencyFee'>,
): Pick<VoidTransactionData, 'profitLoss'> {
  const profitLoss = roundMoney(ticket.pricing.profit - input.voidFee - input.supplierFee - input.agencyFee)
  return { profitLoss }
}

export function computeCancellationPreview(
  ticket: FlightTicket,
  input: Pick<CancellationTransactionData, 'isRefundable' | 'cancellationPenalty' | 'supplierFees' | 'agencyFees'>,
): Pick<CancellationTransactionData, 'netRefund' | 'profitLoss'> {
  const base = input.isRefundable ? ticket.pricing.sellingPrice : 0
  const netRefund = roundMoney(Math.max(0, base - input.cancellationPenalty - input.supplierFees - input.agencyFees))
  const profitLoss = roundMoney(netRefund - ticket.pricing.profit)
  return { netRefund, profitLoss }
}

export interface OperationContext extends TicketOperationContext {
  userId?: string
  userName?: string
}

function requireTicketInService(
  details: FlightServiceDetails,
  ticketId: string,
): Result<{ ticket: FlightTicket; passenger: FlightPassenger; passengerIndex: number; ticketIndex: number }> {
  const found = findTicketInService(details, ticketId)
  if (!found) {
    return err({ code: 'NOT_FOUND', message: 'Ticket not found.', entity: 'ticket' })
  }
  return ok(found)
}

export function computeIssuePreview(
  _ticket: FlightTicket,
  input: Pick<
    IssueTransactionData,
    'currency' | 'exchangeRate' | 'fare' | 'taxes' | 'airlineFees' | 'supplierFees' | 'agencyServiceFees' | 'commission' | 'clientDiscount' | 'sellingPrice'
  >,
) {
  const currency = input.currency.trim().toUpperCase()
  const exchangeRate = normalizeExchangeRate(currency, input.exchangeRate)
  const pricing = normalizeTicketPricing({
    fare: input.fare,
    taxes: input.taxes,
    airlineFees: input.airlineFees,
    supplierFees: input.supplierFees,
    agencyServiceFees: input.agencyServiceFees,
    commission: input.commission,
    clientDiscount: input.clientDiscount,
    sellingPrice: input.sellingPrice,
    currency,
    exchangeRate,
  })
  const financials = computeTicketFinancials(pricing, [])
  return { pricing, financials }
}

export function applyIssueTicket(
  details: FlightServiceDetails,
  ticketId: string,
  data: IssueTransactionData,
  ctx: OperationContext = {},
): Result<FlightServiceDetails> {
  const foundResult = requireTicketInService(details, ticketId)
  if (!foundResult.ok) return foundResult

  const opCheck = validateTicketOperation(foundResult.value.ticket, 'issue', ctx)
  if (!opCheck.ok) return opCheck

  const dataCheck = validateIssueData(data)
  if (!dataCheck.ok) return dataCheck

  return ok(applyIssueTicketImpl(details, ticketId, data, ctx))
}

function applyIssueTicketImpl(
  details: FlightServiceDetails,
  ticketId: string,
  data: IssueTransactionData,
  ctx: OperationContext = {},
): FlightServiceDetails {
  const found = findTicketInService(details, ticketId)
  if (!found) return details

  return updateTicketInService(details, ticketId, (ticket) => {
    const currency = data.currency.trim().toUpperCase()
    const exchangeRate = normalizeExchangeRate(currency, data.exchangeRate)
    const issueData: IssueTransactionData = { ...data, currency, exchangeRate }

    const pricing = normalizeTicketPricing({
      fare: data.fare,
      taxes: data.taxes,
      airlineFees: data.airlineFees,
      supplierFees: data.supplierFees,
      agencyServiceFees: data.agencyServiceFees,
      commission: data.commission,
      clientDiscount: data.clientDiscount,
      sellingPrice: data.sellingPrice,
      currency,
      exchangeRate,
    })

    const ticketWithPricing = refreshTicketComputedFields({
      ...ticket,
      pricing,
      ticketNumber: data.ticketNumber,
      issueDate: data.issueDate,
      ...(data.fulfillmentSource === 'gds'
        ? {
            supplierId: AGENCY_GDS_SUPPLIER_ID,
            supplierName: AGENCY_GDS_SUPPLIER_NAME,
          }
        : {
            supplierId: data.supplierId?.trim() || undefined,
            supplierName: data.supplierName?.trim() ?? '',
          }),
    })

    const transaction: TicketTransaction = {
      id: createTransactionId(),
      type: 'issue',
      ticketId,
      createdAt: new Date().toISOString(),
      createdBy: ctx.userId,
      createdByName: ctx.userName,
      status: 'completed',
      issue: issueData,
      notes: data.notes,
    }

    const updated = appendTransactionToTicket(
      ticketWithPricing,
      transaction,
      buildIssueLedgerEntries(transaction, ticketWithPricing, ctx.userId, ctx.userName),
    )
    return {
      ...updated,
      status: 'issued',
    }
  })
}

export function applyRefundTicket(
  details: FlightServiceDetails,
  ticketId: string,
  data: RefundTransactionData,
  partial = false,
  ctx: OperationContext = {},
): Result<FlightServiceDetails> {
  const foundResult = requireTicketInService(details, ticketId)
  if (!foundResult.ok) return foundResult

  const operation = partial ? 'partial_refund' : 'refund'
  const opCheck = validateTicketOperation(foundResult.value.ticket, operation, ctx)
  if (!opCheck.ok) return opCheck

  const dataCheck = validateRefundData(foundResult.value.ticket, data, partial)
  if (!dataCheck.ok) return dataCheck

  return ok(applyRefundTicketImpl(details, ticketId, data, partial, ctx))
}

function applyRefundTicketImpl(
  details: FlightServiceDetails,
  ticketId: string,
  data: RefundTransactionData,
  partial = false,
  ctx: OperationContext = {},
): FlightServiceDetails {
  const transaction: TicketTransaction = {
    id: createTransactionId(),
    type: partial ? 'partial_refund' : 'refund',
    ticketId,
    createdAt: new Date().toISOString(),
    createdBy: ctx.userId,
    createdByName: ctx.userName,
    status: 'completed',
    refund: data,
  }

  return updateTicketInService(details, ticketId, (ticket) => {
    const updated = appendTransactionToTicket(
      ticket,
      transaction,
      buildRefundLedgerEntries(transaction, ticket, ctx.userId, ctx.userName),
    )
    return {
      ...updated,
      status: partial ? 'partially_refunded' : 'refunded',
    }
  })
}

export function applyReissueTicket(
  details: FlightServiceDetails,
  ticketId: string,
  data: ReissueTransactionData,
  partial = false,
  ctx: OperationContext = {},
): Result<FlightServiceDetails> {
  const foundResult = requireTicketInService(details, ticketId)
  if (!foundResult.ok) return foundResult

  const opCheck = validateTicketOperation(foundResult.value.ticket, 'reissue', ctx)
  if (!opCheck.ok) return opCheck

  const dataCheck = validateReissueData(foundResult.value.ticket, data)
  if (!dataCheck.ok) return dataCheck

  return ok(applyReissueTicketImpl(details, ticketId, data, partial, ctx))
}

function applyReissueTicketImpl(
  details: FlightServiceDetails,
  ticketId: string,
  data: ReissueTransactionData,
  partial = false,
  ctx: OperationContext = {},
): FlightServiceDetails {
  const transaction: TicketTransaction = {
    id: createTransactionId(),
    type: partial ? 'partial_reissue' : 'reissue',
    ticketId,
    createdAt: new Date().toISOString(),
    createdBy: ctx.userId,
    createdByName: ctx.userName,
    status: 'completed',
    reissue: data,
  }

  return updateTicketInService(details, ticketId, (ticket) => {
    const updated = appendTransactionToTicket(
      ticket,
      transaction,
      buildReissueLedgerEntries(transaction, ticket, ctx.userId, ctx.userName),
    )
    return {
      ...updated,
      ticketNumber: data.newTicketNumber,
      status: 'reissued',
    }
  })
}

export function applyVoidTicket(
  details: FlightServiceDetails,
  ticketId: string,
  data: VoidTransactionData,
  ctx: OperationContext = {},
): Result<FlightServiceDetails> {
  const foundResult = requireTicketInService(details, ticketId)
  if (!foundResult.ok) return foundResult

  const opCheck = validateTicketOperation(foundResult.value.ticket, 'void', ctx)
  if (!opCheck.ok) return opCheck

  const dataCheck = validateVoidData(foundResult.value.ticket, data)
  if (!dataCheck.ok) return dataCheck

  return ok(applyVoidTicketImpl(details, ticketId, data, ctx))
}

function applyVoidTicketImpl(
  details: FlightServiceDetails,
  ticketId: string,
  data: VoidTransactionData,
  ctx: OperationContext = {},
): FlightServiceDetails {
  const transaction: TicketTransaction = {
    id: createTransactionId(),
    type: 'void',
    ticketId,
    createdAt: new Date().toISOString(),
    createdBy: ctx.userId,
    createdByName: ctx.userName,
    status: 'completed',
    void: data,
  }

  return updateTicketInService(details, ticketId, (ticket) => {
    const updated = appendTransactionToTicket(
      ticket,
      transaction,
      buildVoidLedgerEntries(transaction, ticket, ctx.userId, ctx.userName),
    )
    return { ...updated, status: 'void' }
  })
}

export function applyCancelTicket(
  details: FlightServiceDetails,
  ticketId: string,
  data: CancellationTransactionData,
  ctx: OperationContext = {},
): Result<FlightServiceDetails> {
  const foundResult = requireTicketInService(details, ticketId)
  if (!foundResult.ok) return foundResult

  const opCheck = validateTicketOperation(foundResult.value.ticket, 'cancel', ctx)
  if (!opCheck.ok) return opCheck

  const dataCheck = validateCancellationData(data)
  if (!dataCheck.ok) return dataCheck

  return ok(applyCancelTicketImpl(details, ticketId, data, ctx))
}

function applyCancelTicketImpl(
  details: FlightServiceDetails,
  ticketId: string,
  data: CancellationTransactionData,
  ctx: OperationContext = {},
): FlightServiceDetails {
  const transaction: TicketTransaction = {
    id: createTransactionId(),
    type: 'cancellation',
    ticketId,
    createdAt: new Date().toISOString(),
    createdBy: ctx.userId,
    createdByName: ctx.userName,
    status: 'completed',
    cancellation: data,
  }

  return updateTicketInService(details, ticketId, (ticket) => {
    const updated = appendTransactionToTicket(
      ticket,
      transaction,
      buildCancellationLedgerEntries(transaction, ticket, ctx.userId, ctx.userName),
    )
    return { ...updated, status: 'cancelled' }
  })
}

export function applyClientPayment(
  details: FlightServiceDetails,
  ticketId: string,
  data: PaymentTransactionData,
  ctx: OperationContext = {},
): Result<FlightServiceDetails> {
  const foundResult = requireTicketInService(details, ticketId)
  if (!foundResult.ok) return foundResult

  const opCheck = validateTicketOperation(foundResult.value.ticket, 'client_payment', ctx)
  if (!opCheck.ok) return opCheck

  const dataCheck = validatePaymentData(foundResult.value.ticket, 'client', data)
  if (!dataCheck.ok) return dataCheck

  return ok(applyClientPaymentImpl(details, ticketId, data, ctx))
}

function applyClientPaymentImpl(
  details: FlightServiceDetails,
  ticketId: string,
  data: PaymentTransactionData,
  ctx: OperationContext = {},
): FlightServiceDetails {
  const transaction: TicketTransaction = {
    id: createTransactionId(),
    type: 'client_payment',
    ticketId,
    createdAt: new Date().toISOString(),
    createdBy: ctx.userId,
    createdByName: ctx.userName,
    status: 'completed',
    payment: data,
  }

  return updateTicketInService(details, ticketId, (ticket) =>
    appendTransactionToTicket(
      ticket,
      transaction,
      buildPaymentLedgerEntries(transaction, 'client_payment', ctx.userId, ctx.userName),
    ),
  )
}

export function applySupplierPayment(
  details: FlightServiceDetails,
  ticketId: string,
  data: PaymentTransactionData,
  ctx: OperationContext = {},
): Result<FlightServiceDetails> {
  const foundResult = requireTicketInService(details, ticketId)
  if (!foundResult.ok) return foundResult

  const opCheck = validateTicketOperation(foundResult.value.ticket, 'supplier_payment', ctx)
  if (!opCheck.ok) return opCheck

  const dataCheck = validatePaymentData(foundResult.value.ticket, 'supplier', data)
  if (!dataCheck.ok) return dataCheck

  return ok(applySupplierPaymentImpl(details, ticketId, data, ctx))
}

function applySupplierPaymentImpl(
  details: FlightServiceDetails,
  ticketId: string,
  data: PaymentTransactionData,
  ctx: OperationContext = {},
): FlightServiceDetails {
  const transaction: TicketTransaction = {
    id: createTransactionId(),
    type: 'supplier_payment',
    ticketId,
    createdAt: new Date().toISOString(),
    createdBy: ctx.userId,
    createdByName: ctx.userName,
    status: 'completed',
    payment: data,
  }

  return updateTicketInService(details, ticketId, (ticket) =>
    appendTransactionToTicket(
      ticket,
      transaction,
      buildPaymentLedgerEntries(transaction, 'supplier_payment', ctx.userId, ctx.userName),
    ),
  )
}
