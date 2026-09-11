import { flattenTickets } from '@/domain/flight/migration'
import { BASE_CURRENCY } from '@/domain/currency'
import type { FlightServiceDetails, FlightTicket, TicketTransaction } from '@/domain/flight/types'
import { TICKET_TRANSACTION_TYPE_LABELS, TICKET_STATUS_LABELS } from '@/domain/flight/types'

export type FlightReportType =
  | 'issued'
  | 'refund'
  | 'reissue'
  | 'void'
  | 'cancellation'
  | 'airline_sales'
  | 'supplier_payables'
  | 'client_receivables'
  | 'profit_airline'
  | 'profit_supplier'
  | 'profit_client'
  | 'profit_user'
  | 'outstanding'
  | 'financial_summary'

export interface FlightReportRow {
  id: string
  reportType: FlightReportType
  ticketId: string
  ticketNumber: string
  passengerName: string
  airline: string
  supplierName: string
  route: string
  pnr: string
  status: string
  currency: string
  amount: number
  profit: number
  date?: string
  reference?: string
  clientName?: string
  userName?: string
}

export interface FlightFinancialSummaryRow {
  label: string
  amount: number
  currency: string
}

function ticketTransactions(ticket: FlightTicket): TicketTransaction[] {
  return ticket.transactions.filter((t) => t.status === 'completed')
}

export function buildFlightReport(details: FlightServiceDetails, reportType: FlightReportType, clientName?: string): FlightReportRow[] {
  const tickets = flattenTickets(details)

  switch (reportType) {
    case 'issued':
      return tickets
        .filter((t) => t.status === 'issued' || t.status === 'reissued' || t.status === 'exchanged')
        .map((t) => ({
          id: t.id,
          reportType,
          ticketId: t.id,
          ticketNumber: t.ticketNumber,
          passengerName: t.passengerName,
          airline: t.airline,
          supplierName: t.supplierName,
          route: t.route,
          pnr: t.pnr,
          status: TICKET_STATUS_LABELS[t.status],
          currency: t.pricing.currency,
          amount: t.pricing.sellingPrice,
          profit: t.pricing.profit,
          date: t.issueDate,
          clientName,
        }))

    case 'refund':
      return tickets.flatMap((t) =>
        ticketTransactions(t)
          .filter((txn) => txn.type === 'refund' || txn.type === 'partial_refund')
          .map((txn) => ({
            id: txn.id,
            reportType,
            ticketId: t.id,
            ticketNumber: t.ticketNumber,
            passengerName: t.passengerName,
            airline: t.airline,
            supplierName: t.supplierName,
            route: t.route,
            pnr: t.pnr,
            status: txn.refund?.status ?? '',
            currency: t.pricing.currency,
            amount: txn.refund?.netRefund ?? 0,
            profit: txn.refund?.profitLoss ?? 0,
            date: txn.refund?.refundProcessedDate ?? txn.refund?.refundRequestDate,
            reference: txn.id,
            userName: txn.createdByName,
            clientName,
          })),
      )

    case 'reissue':
      return tickets.flatMap((t) =>
        ticketTransactions(t)
          .filter((txn) => txn.type === 'reissue' || txn.type === 'partial_reissue')
          .map((txn) => ({
            id: txn.id,
            reportType,
            ticketId: t.id,
            ticketNumber: txn.reissue?.newTicketNumber ?? t.ticketNumber,
            passengerName: t.passengerName,
            airline: t.airline,
            supplierName: t.supplierName,
            route: t.route,
            pnr: t.pnr,
            status: txn.reissue?.status ?? '',
            currency: t.pricing.currency,
            amount: txn.reissue?.amountToCollect ?? 0,
            profit: txn.reissue?.profit ?? 0,
            date: txn.createdAt.slice(0, 10),
            reference: txn.reissue?.oldTicketNumber,
            userName: txn.createdByName,
            clientName,
          })),
      )

    case 'void':
      return tickets
        .filter((t) => t.status === 'void')
        .map((t) => {
          const voidTxn = ticketTransactions(t).find((txn) => txn.type === 'void')
          return {
            id: t.id,
            reportType,
            ticketId: t.id,
            ticketNumber: t.ticketNumber,
            passengerName: t.passengerName,
            airline: t.airline,
            supplierName: t.supplierName,
            route: t.route,
            pnr: t.pnr,
            status: voidTxn?.void?.status ?? TICKET_STATUS_LABELS[t.status],
            currency: t.pricing.currency,
            amount: t.pricing.sellingPrice,
            profit: voidTxn?.void?.profitLoss ?? 0,
            date: voidTxn?.createdAt.slice(0, 10),
            userName: voidTxn?.createdByName,
            clientName,
          }
        })

    case 'cancellation':
      return tickets
        .filter((t) => t.status === 'cancelled')
        .map((t) => {
          const cancelTxn = ticketTransactions(t).find((txn) => txn.type === 'cancellation')
          return {
            id: t.id,
            reportType,
            ticketId: t.id,
            ticketNumber: t.ticketNumber,
            passengerName: t.passengerName,
            airline: t.airline,
            supplierName: t.supplierName,
            route: t.route,
            pnr: t.pnr,
            status: TICKET_STATUS_LABELS[t.status],
            currency: t.pricing.currency,
            amount: cancelTxn?.cancellation?.netRefund ?? 0,
            profit: cancelTxn?.cancellation?.profitLoss ?? 0,
            date: cancelTxn?.createdAt.slice(0, 10),
            userName: cancelTxn?.createdByName,
            clientName,
          }
        })

    case 'airline_sales':
      return aggregateByKey(tickets, (t) => t.airline, reportType, clientName)

    case 'supplier_payables':
      return tickets
        .filter((t) => t.financials.supplierOutstanding > 0)
        .map((t) => ({
          id: t.id,
          reportType,
          ticketId: t.id,
          ticketNumber: t.ticketNumber,
          passengerName: t.passengerName,
          airline: t.airline,
          supplierName: t.supplierName,
          route: t.route,
          pnr: t.pnr,
          status: TICKET_STATUS_LABELS[t.status],
          currency: t.pricing.currency,
          amount: t.financials.supplierOutstanding,
          profit: 0,
          clientName,
        }))

    case 'client_receivables':
      return tickets
        .filter((t) => t.financials.amountOutstanding > 0)
        .map((t) => ({
          id: t.id,
          reportType,
          ticketId: t.id,
          ticketNumber: t.ticketNumber,
          passengerName: t.passengerName,
          airline: t.airline,
          supplierName: t.supplierName,
          route: t.route,
          pnr: t.pnr,
          status: t.financials.paymentStatus,
          currency: t.pricing.currency,
          amount: t.financials.amountOutstanding,
          profit: t.pricing.profit,
          clientName,
        }))

    case 'profit_airline':
      return aggregateByKey(tickets, (t) => t.airline, reportType, clientName, (rows) => rows.reduce((s, r) => s + r.profit, 0))

    case 'profit_supplier':
      return aggregateByKey(tickets, (t) => t.supplierName || 'Unknown', reportType, clientName, (rows) => rows.reduce((s, r) => s + r.profit, 0))

    case 'profit_client':
      return [
        {
          id: 'client-total',
          reportType,
          ticketId: '',
          ticketNumber: '',
          passengerName: '',
          airline: '',
          supplierName: '',
          route: '',
          pnr: '',
          status: '',
          currency: details.financialSummary?.currency ?? BASE_CURRENCY,
          amount: details.financialSummary?.sellingPrice ?? 0,
          profit: details.financialSummary?.netProfit ?? 0,
          clientName,
        },
      ]

    case 'profit_user':
      return tickets.flatMap((t) =>
        t.transactions.map((txn) => ({
          id: txn.id,
          reportType,
          ticketId: t.id,
          ticketNumber: t.ticketNumber,
          passengerName: t.passengerName,
          airline: t.airline,
          supplierName: t.supplierName,
          route: t.route,
          pnr: t.pnr,
          status: TICKET_TRANSACTION_TYPE_LABELS[txn.type],
          currency: t.pricing.currency,
          amount: txn.payment?.amount ?? txn.refund?.netRefund ?? txn.reissue?.amountToCollect ?? 0,
          profit: txn.refund?.profitLoss ?? txn.reissue?.profit ?? txn.void?.profitLoss ?? 0,
          date: txn.createdAt.slice(0, 10),
          userName: txn.createdByName,
          clientName,
        })),
      )

    case 'outstanding':
      return tickets
        .filter((t) => t.financials.amountOutstanding > 0 || t.financials.supplierOutstanding > 0)
        .map((t) => ({
          id: t.id,
          reportType,
          ticketId: t.id,
          ticketNumber: t.ticketNumber,
          passengerName: t.passengerName,
          airline: t.airline,
          supplierName: t.supplierName,
          route: t.route,
          pnr: t.pnr,
          status: `${t.financials.paymentStatus} / supplier ${t.financials.supplierOutstanding > 0 ? 'due' : 'ok'}`,
          currency: t.pricing.currency,
          amount: t.financials.amountOutstanding + t.financials.supplierOutstanding,
          profit: t.pricing.profit,
          clientName,
        }))

    case 'financial_summary':
      return []

    default:
      return []
  }
}

function aggregateByKey(
  tickets: ReturnType<typeof flattenTickets>,
  keyFn: (t: ReturnType<typeof flattenTickets>[number]) => string,
  reportType: FlightReportType,
  clientName?: string,
  profitFn?: (rows: FlightReportRow[]) => number,
): FlightReportRow[] {
  const groups = new Map<string, ReturnType<typeof flattenTickets>>()
  for (const ticket of tickets) {
    const key = keyFn(ticket) || 'Unknown'
    const group = groups.get(key) ?? []
    group.push(ticket)
    groups.set(key, group)
  }

  return [...groups.entries()].map(([key, group]) => ({
    id: `${reportType}-${key}`,
    reportType,
    ticketId: '',
    ticketNumber: `${group.length} tickets`,
    passengerName: '',
    airline: reportType === 'airline_sales' || reportType === 'profit_airline' ? key : group[0].airline,
    supplierName: reportType === 'profit_supplier' ? key : group[0].supplierName,
    route: '',
    pnr: '',
    status: '',
    currency: group[0].pricing.currency,
    amount: group.reduce((s, t) => s + t.pricing.sellingPrice, 0),
    profit: profitFn ? profitFn([]) : group.reduce((s, t) => s + t.pricing.profit, 0),
    clientName,
  }))
}

export function buildFinancialSummary(details: FlightServiceDetails): FlightFinancialSummaryRow[] {
  const s = details.financialSummary
  if (!s) return []
  const currency = s.currency
  return [
    { label: 'Supplier Cost', amount: s.supplierCost, currency },
    { label: 'Selling Price', amount: s.sellingPrice, currency },
    { label: 'Gross Profit', amount: s.grossProfit, currency },
    { label: 'Net Profit', amount: s.netProfit, currency },
    { label: 'Client Receivable', amount: s.clientReceivable, currency },
    { label: 'Amount Collected', amount: s.amountCollected, currency },
    { label: 'Amount Outstanding', amount: s.amountOutstanding, currency },
    { label: 'Supplier Payable', amount: s.supplierPayable, currency },
    { label: 'Paid to Supplier', amount: s.amountPaidToSupplier, currency },
    { label: 'Supplier Outstanding', amount: s.supplierOutstanding, currency },
  ]
}

export const FLIGHT_REPORT_OPTIONS: { value: FlightReportType; label: string }[] = [
  { value: 'issued', label: 'Issued Tickets' },
  { value: 'refund', label: 'Refund Report' },
  { value: 'reissue', label: 'Reissue Report' },
  { value: 'void', label: 'Void Report' },
  { value: 'cancellation', label: 'Cancellation Report' },
  { value: 'airline_sales', label: 'Airline Sales' },
  { value: 'supplier_payables', label: 'Supplier Payables' },
  { value: 'client_receivables', label: 'Client Receivables' },
  { value: 'profit_airline', label: 'Profit by Airline' },
  { value: 'profit_supplier', label: 'Profit by Supplier' },
  { value: 'profit_client', label: 'Profit by Client' },
  { value: 'profit_user', label: 'Profit by User' },
  { value: 'outstanding', label: 'Outstanding Payments' },
  { value: 'financial_summary', label: 'Financial Summary' },
]
