import type { Trip } from '@/domain/entities/trip'
import type { Invoice } from '@/domain/entities/invoice'
import { invoiceBalanceDue } from '@/domain/entities/invoice'
import type { TripPayment } from '@/domain/entities/trip-payment'
import { sumActivePayments } from '@/domain/entities/trip-payment'
import type { TripService } from '@/domain/entities/trip-service'
import { tripServiceSelling } from '@/features/trips/components/services/trip-service-financial'

export interface TripFinancialRollup {
  totalCost: number
  totalSelling: number
  totalCommission: number
  totalSupplierCost: number
  clientPaidAmount: number
  supplierBalanceDue: number
}

export function computeServiceFinancialRollup(services: TripService[]): Pick<
  TripFinancialRollup,
  'totalCost' | 'totalSelling' | 'totalCommission' | 'totalSupplierCost'
> {
  const billable = services.filter((service) => service.status !== 'canceled')
  const confirmed = billable.filter((service) => service.status === 'confirmed')

  const totalSupplierCost = confirmed.reduce((sum, service) => sum + service.cost, 0)
  const totalSelling = confirmed.reduce((sum, service) => sum + tripServiceSelling(service), 0)
  const totalCommission = Math.max(0, totalSelling - totalSupplierCost)

  return {
    totalCost: totalSelling,
    totalSelling,
    totalCommission,
    totalSupplierCost,
  }
}

export function computeClientPaidAmount(
  payments: TripPayment[],
  invoices: Invoice[],
): number {
  const fromPayments = sumActivePayments(payments, 'inbound')
  if (fromPayments > 0) return fromPayments

  return invoices
    .filter((invoice) => invoice.status !== 'void')
    .reduce((sum, invoice) => sum + (invoice.amountPaid ?? 0), 0)
}

export function computeSupplierBalanceDue(
  totalSupplierCost: number,
  payments: TripPayment[],
  fallback = 0,
): number {
  const paidOut = sumActivePayments(payments, 'outbound')
  if (totalSupplierCost <= 0) return fallback
  return Math.max(0, totalSupplierCost - paidOut)
}

export function buildTripFinancialPatch(
  trip: Trip,
  services: TripService[],
  invoices: Invoice[],
  payments: TripPayment[],
): Partial<Trip> {
  const rollup = computeServiceFinancialRollup(services)
  const hasConfirmedServices = services.some((service) => service.status === 'confirmed')

  const totalSupplierCost = hasConfirmedServices ? rollup.totalSupplierCost : trip.totalSupplierCost ?? trip.totalCost - trip.totalCommission
  const totalSelling = hasConfirmedServices ? rollup.totalSelling : trip.totalSelling ?? trip.totalCost
  const totalCost = hasConfirmedServices ? rollup.totalCost : trip.totalCost
  const totalCommission = hasConfirmedServices ? rollup.totalCommission : trip.totalCommission

  return {
    totalCost,
    totalSelling,
    totalCommission,
    totalSupplierCost,
    clientPaidAmount: computeClientPaidAmount(payments, invoices),
    supplierBalanceDue: computeSupplierBalanceDue(totalSupplierCost, payments, trip.supplierBalanceDue),
    updatedAt: new Date().toISOString(),
  }
}

export function openInvoiceReceivables(invoices: Invoice[]): number {
  return invoices
    .filter((invoice) => invoice.status !== 'void' && invoice.status !== 'paid')
    .reduce((sum, invoice) => sum + invoiceBalanceDue(invoice), 0)
}
