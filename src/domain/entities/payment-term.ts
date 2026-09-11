export interface PaymentTerm {
  id: string
  name: string
  days: number
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type PaymentTermInput = Omit<PaymentTerm, 'id' | 'createdAt' | 'updatedAt'>

export const DEFAULT_PAYMENT_TERMS: ReadonlyArray<{
  id: string
  name: string
  days: number
  description?: string
}> = [
  { id: 'PTM-001', name: 'Due on Receipt', days: 0, description: 'Payment due when the invoice is issued' },
  { id: 'PTM-002', name: 'Net 7', days: 7 },
  { id: 'PTM-003', name: 'Net 14', days: 14 },
  { id: 'PTM-004', name: 'Net 21', days: 21 },
  { id: 'PTM-005', name: 'Net 30', days: 30 },
  { id: 'PTM-006', name: 'Net 60', days: 60 },
  { id: 'PTM-007', name: 'Net 90', days: 90 },
  { id: 'PTM-008', name: 'Net 120', days: 120 },
  { id: 'PTM-009', name: 'Net 150', days: 150 },
  { id: 'PTM-010', name: 'Net 180', days: 180 },
] as const

export function sortPaymentTerms(terms: PaymentTerm[]): PaymentTerm[] {
  return [...terms].sort((a, b) => a.days - b.days || a.name.localeCompare(b.name))
}

export function addDaysToIsoDate(isoDate: string, days: number): string {
  const date = new Date(isoDate.slice(0, 10))
  if (Number.isNaN(date.getTime())) return isoDate.slice(0, 10)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export function computeDueDateFromPaymentTerm(issuedAt: string, term: Pick<PaymentTerm, 'days'>): string {
  return addDaysToIsoDate(issuedAt, term.days)
}

export function normalizePaymentTermInput(input: PaymentTermInput): PaymentTermInput {
  return {
    name: input.name.trim(),
    days: Math.max(0, Math.round(input.days)),
    description: input.description?.trim() || undefined,
    isActive: input.isActive,
  }
}

export function validatePaymentTermInput(input: PaymentTermInput): string | null {
  if (!input.name.trim()) return 'Name is required.'
  if (!Number.isFinite(input.days) || input.days < 0) return 'Days must be zero or greater.'
  return null
}

export function paymentTermToFormInput(term: PaymentTerm): PaymentTermInput {
  return {
    name: term.name,
    days: term.days,
    description: term.description,
    isActive: term.isActive,
  }
}
