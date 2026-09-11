import { convertBetweenCurrencies, roundCurrency } from '@/domain/currency'
import {
  CLIENT_FINANCIAL_EXCLUDED_STAGES,
  resolveClientFinancialSummary,
} from '@/domain/client/client-financial'
import type { Client } from '@/domain/entities/client'
import type { Invoice } from '@/domain/entities/invoice'
import type { Trip } from '@/domain/entities/trip'
import { isTripTerminalStage, tripNetProfit, tripTotalSelling } from '@/domain/entities/trip'
import type { TripService } from '@/domain/entities/trip-service'

export interface ClientActivityPeriodPoint {
  key: string
  label: string
  tripCount: number
  revenue: number
}

export interface ClientDashboardAnalytics {
  openTrips: number
  closedTrips: number
  lostTrips: number
  totalTrips: number
  winRatePercent: number | null

  closedInvoices: number
  openInvoices: number

  totalRevenue: number
  totalCollected: number
  outstandingBalance: number
  netProfit: number
  profitMarginPercent: number | null
  collectionRatePercent: number | null

  confirmedBookings: number
  cancelledBookings: number

  reportingCurrency: string

  activityByMonth: ClientActivityPeriodPoint[]
  activityByYear: ClientActivityPeriodPoint[]
}

function tripActivityDate(trip: Trip): Date {
  return new Date(trip.bookingStartedAt || trip.createdAt)
}

function isBillableTrip(stage: Trip['stage']): boolean {
  return !CLIENT_FINANCIAL_EXCLUDED_STAGES.includes(stage)
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
}

export function buildClientActivitySeries(
  trips: Trip[],
  mode: 'month' | 'year',
  reportingCurrency: string,
): ClientActivityPeriodPoint[] {
  const buckets = new Map<string, { tripCount: number; revenue: number; label: string }>()

  for (const trip of trips) {
    const date = tripActivityDate(trip)
    if (Number.isNaN(date.getTime())) continue

    const key = mode === 'month' ? monthKey(date) : String(date.getFullYear())
    const label = mode === 'month' ? monthLabel(date) : key

    const bucket = buckets.get(key) ?? { tripCount: 0, revenue: 0, label }
    bucket.tripCount += 1

    if (isBillableTrip(trip.stage)) {
      const tripCurrency = trip.currency?.trim().toUpperCase() || reportingCurrency
      bucket.revenue += convertBetweenCurrencies(tripTotalSelling(trip), tripCurrency, reportingCurrency)
    }

    buckets.set(key, bucket)
  }

  if (mode === 'month') {
    const points: ClientActivityPeriodPoint[] = []
    const now = new Date()

    for (let offset = 11; offset >= 0; offset -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - offset, 1)
      const key = monthKey(date)
      const bucket = buckets.get(key)

      points.push({
        key,
        label: monthLabel(date),
        tripCount: bucket?.tripCount ?? 0,
        revenue: roundCurrency(bucket?.revenue ?? 0),
      })
    }

    return points
  }

  return [...buckets.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, bucket]) => ({
      key,
      label: bucket.label,
      tripCount: bucket.tripCount,
      revenue: roundCurrency(bucket.revenue),
    }))
}

export function resolveClientDashboardAnalytics(
  client: Client,
  trips: Trip[],
  invoices: Invoice[],
  services: TripService[],
): ClientDashboardAnalytics {
  const financial = resolveClientFinancialSummary(client, trips)
  const reportingCurrency = financial.reportingCurrency

  const closedTrips = trips.filter((trip) => trip.stage === 'closed').length
  const lostTrips = trips.filter((trip) => trip.stage === 'lost').length
  const openTrips = trips.filter((trip) => !isTripTerminalStage(trip.stage)).length
  const decidedTrips = closedTrips + lostTrips
  const winRatePercent =
    decidedTrips > 0 ? roundCurrency((closedTrips / decidedTrips) * 100) : null

  const closedInvoices = invoices.filter((invoice) => invoice.status === 'paid').length
  const openInvoices = invoices.filter(
    (invoice) => invoice.status !== 'void' && invoice.status !== 'paid',
  ).length

  let netProfit = 0
  let billableRevenue = 0

  for (const trip of trips) {
    if (!isBillableTrip(trip.stage)) continue

    const tripCurrency = trip.currency?.trim().toUpperCase() || reportingCurrency
    netProfit += convertBetweenCurrencies(tripNetProfit(trip), tripCurrency, reportingCurrency)
    billableRevenue += convertBetweenCurrencies(tripTotalSelling(trip), tripCurrency, reportingCurrency)
  }

  netProfit = roundCurrency(netProfit)
  billableRevenue = roundCurrency(billableRevenue)

  const profitMarginPercent =
    billableRevenue > 0 ? roundCurrency((netProfit / billableRevenue) * 100) : null
  const collectionRatePercent =
    financial.totalSales > 0
      ? roundCurrency((financial.totalPaid / financial.totalSales) * 100)
      : null

  const confirmedBookings = services.filter((service) => service.status === 'confirmed').length
  const cancelledBookings = services.filter((service) => service.status === 'canceled').length

  return {
    openTrips,
    closedTrips,
    lostTrips,
    totalTrips: trips.length,
    winRatePercent,
    closedInvoices,
    openInvoices,
    totalRevenue: financial.totalSales,
    totalCollected: financial.totalPaid,
    outstandingBalance: financial.outstandingBalance,
    netProfit,
    profitMarginPercent,
    collectionRatePercent,
    confirmedBookings,
    cancelledBookings,
    reportingCurrency,
    activityByMonth: buildClientActivitySeries(trips, 'month', reportingCurrency),
    activityByYear: buildClientActivitySeries(trips, 'year', reportingCurrency),
  }
}
