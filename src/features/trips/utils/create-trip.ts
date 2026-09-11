import { appContainer } from '@/app/container'
import type { ServiceCategoryCounts, Trip } from '@/domain/entities'
import { SERVICE_CATEGORIES } from '@/domain/entities'
import { clientPrimaryLabel, type Client } from '@/domain/entities/client'

export type TripFormInput = {
  name: string
  destination: string
  branch: string
  ownerName: string
  ownerId?: string
  clientId: string
  mainContactName: string
  mainContactEmail: string
  tripType: string
  startDate: string
  endDate: string
  adults: number
  minors: number
  currency: string
}

export const TRIP_TYPE_OPTIONS = ['Corporate', 'Leisure', 'Group', 'MICE'] as const

const EMPTY_BREAKDOWN: ServiceCategoryCounts[] = SERVICE_CATEGORIES.map((category) => ({
  category,
  proposal: 0,
  confirmed: 0,
  canceled: 0,
}))

export const EMPTY_TRIP_FORM: TripFormInput = {
  name: '',
  destination: '',
  branch: 'HQ',
  ownerName: '',
  clientId: '',
  mainContactName: '',
  mainContactEmail: '',
  tripType: 'Corporate',
  startDate: '',
  endDate: '',
  adults: 2,
  minors: 0,
  currency: 'EGP',
}

export async function nextTripReference(): Promise<string> {
  const all = await appContainer.uow.trips.findAll()
  const maxRef = all.reduce((max, item) => Math.max(max, Number.parseInt(item.reference, 10) || 0), 0)
  return String(maxRef + 1)
}

export function buildNewTrip(input: TripFormInput, reference: string): Omit<Trip, 'id'> {
  const now = new Date().toISOString()
  const today = now.slice(0, 10)

  return {
    reference,
    name: input.name.trim(),
    ownerName: input.ownerName.trim(),
    ownerId: input.ownerId,
    branch: input.branch.trim() || 'HQ',
    destination: input.destination.trim() || undefined,
    stage: 'draft',
    tripType: input.tripType.trim() || 'Corporate',
    currency: input.currency.trim() || 'EGP',
    totalCost: 0,
    totalCommission: 0,
    clientPaidAmount: 0,
    supplierBalanceDue: 0,
    adults: Math.max(0, input.adults),
    minors: Math.max(0, input.minors),
    bookingStartedAt: today,
    startDate: input.startDate || undefined,
    endDate: input.endDate || undefined,
    mainContactName: input.mainContactName.trim() || undefined,
    mainContactEmail: input.mainContactEmail.trim() || undefined,
    clientId: input.clientId.trim() || undefined,
    serviceBreakdown: EMPTY_BREAKDOWN,
    createdAt: now,
    updatedAt: now,
  }
}

export function tripFormDefaults(
  user?: { name: string; id: string } | null,
  client?: Client | null,
): TripFormInput {
  const preferredCurrency =
    client?.preferredCurrency?.trim() ||
    client?.paymentCurrencies?.[0]?.trim() ||
    EMPTY_TRIP_FORM.currency

  return {
    ...EMPTY_TRIP_FORM,
    ownerName: user?.name ?? '',
    ownerId: user?.id,
    clientId: client?.id ?? '',
    mainContactName: client ? clientPrimaryLabel(client) : '',
    mainContactEmail: client?.email?.trim() ?? '',
    currency: preferredCurrency,
  }
}
