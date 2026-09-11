import type { ServiceCategory } from '@/domain/entities/trip'
import { SERVICE_CATEGORY_LABELS } from '@/domain/entities/trip'

export type ClientServiceFeeType = 'percentage' | 'fixed'

export interface ClientServiceFee {
  id: string
  /** FK to the account (`Client.id`). */
  clientId: string
  /** Display name for the service (e.g. Flight, Hotel booking). */
  serviceName: string
  /** Optional link to a standard trip service category. */
  category?: ServiceCategory
  feeType: ClientServiceFeeType
  /** Percentage (0–100) when `feeType === 'percentage'`, or fixed amount when `feeType === 'fixed'`. */
  feeValue: number
  /** Required when `feeType === 'fixed'`. */
  currency?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface ClientServiceFeeInput {
  clientId: string
  serviceName: string
  category?: ServiceCategory
  feeType: ClientServiceFeeType
  feeValue: number
  currency?: string
  notes?: string
}

export const CLIENT_SERVICE_FEE_TYPES: ClientServiceFeeType[] = ['percentage', 'fixed']

export const CLIENT_SERVICE_FEE_TYPE_LABELS: Record<ClientServiceFeeType, string> = {
  percentage: 'Percentage',
  fixed: 'Fixed amount',
}

export function normalizeClientServiceFeeInput(
  input: ClientServiceFeeInput,
): Omit<ClientServiceFee, 'id' | 'createdAt' | 'updatedAt'> {
  const serviceName = input.serviceName?.trim()
  if (!serviceName) {
    throw new Error('Service name is required.')
  }

  const feeValue = Number(input.feeValue)
  if (!Number.isFinite(feeValue) || feeValue < 0) {
    throw new Error('Fee value must be zero or greater.')
  }

  if (input.feeType === 'percentage' && feeValue > 100) {
    throw new Error('Percentage cannot exceed 100%.')
  }

  if (input.feeType === 'fixed' && feeValue <= 0) {
    throw new Error('Fixed amount must be greater than zero.')
  }

  const currency =
    input.feeType === 'fixed' ? (input.currency?.trim().toUpperCase() || 'EGP') : undefined

  return {
    clientId: input.clientId,
    serviceName,
    category: input.category,
    feeType: input.feeType,
    feeValue,
    currency,
    notes: input.notes?.trim() || undefined,
  }
}

export function formatClientServiceFeeValue(fee: Pick<ClientServiceFee, 'feeType' | 'feeValue' | 'currency'>): string {
  if (fee.feeType === 'percentage') {
    const value = Number.isInteger(fee.feeValue) ? fee.feeValue : fee.feeValue.toFixed(2)
    return `${value}%`
  }

  const currency = fee.currency?.trim() || 'EGP'
  const value = Number.isInteger(fee.feeValue)
    ? fee.feeValue.toLocaleString()
    : fee.feeValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${value} ${currency}`
}

export function formatClientServiceFeeLabel(fee: ClientServiceFee): string {
  const categoryLabel = fee.category ? SERVICE_CATEGORY_LABELS[fee.category] : undefined
  const name = fee.serviceName.trim()
  if (categoryLabel && categoryLabel !== name) {
    return `${name} (${categoryLabel})`
  }
  return name
}
