import { db } from '@/infrastructure/database/db'
import {
  DEFAULT_PAYMENT_TERMS,
  type PaymentTerm,
} from '@/domain/entities/payment-term'
import { PAYMENT_TERMS_DIRECTORY_VERSION } from '@/infrastructure/database/bootstrap-versions'

export { PAYMENT_TERMS_DIRECTORY_VERSION }

const LEGACY_PAYMENT_TERM_LABEL_TO_DAYS: Record<string, number> = {
  'due on receipt': 0,
  'prepaid in full': 0,
  '7 days': 7,
  'net 7': 7,
  '14 days': 14,
  'net 14': 14,
  'net 15': 15,
  '21 days': 21,
  'net 21': 21,
  'net 30': 30,
  '1 month': 30,
  'net 45': 45,
  'net 60': 60,
  '2 months': 60,
  'net 90': 90,
  '3 months': 90,
  'net 120': 120,
  '4 months': 120,
  'net 150': 150,
  '5 months': 150,
  'net 180': 180,
  '6 months': 180,
  'end of month': 30,
}

function buildDefaultPaymentTerm(
  seed: (typeof DEFAULT_PAYMENT_TERMS)[number],
  timestamp: string,
): PaymentTerm {
  return {
    id: seed.id,
    name: seed.name,
    days: seed.days,
    description: seed.description,
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

async function seedDefaultPaymentTerms(): Promise<void> {
  const timestamp = new Date().toISOString()
  const terms = DEFAULT_PAYMENT_TERMS.map((seed) => buildDefaultPaymentTerm(seed, timestamp))
  await db.paymentTerms.bulkPut(terms)
}

async function syncMissingDefaultPaymentTerms(): Promise<void> {
  const timestamp = new Date().toISOString()
  const existing = await db.paymentTerms.toArray()
  const existingIds = new Set(existing.map((term) => term.id))
  const missing = DEFAULT_PAYMENT_TERMS.filter((seed) => !existingIds.has(seed.id)).map((seed) =>
    buildDefaultPaymentTerm(seed, timestamp),
  )
  if (missing.length > 0) {
    await db.paymentTerms.bulkPut(missing)
  }
}

async function migrateClientPaymentTerms(): Promise<void> {
  const terms = await db.paymentTerms.toArray()
  const byDays = new Map<number, string>()
  for (const term of terms) {
    if (!byDays.has(term.days)) {
      byDays.set(term.days, term.id)
    }
  }

  const clients = await db.clients.toArray()
  await Promise.all(
    clients.map((client) => {
      if (client.paymentTermId) {
        if (client.paymentTerms) {
          return db.clients.update(client.id, { paymentTerms: undefined })
        }
        return Promise.resolve()
      }

      const legacy = client.paymentTerms?.trim()
      if (!legacy) return Promise.resolve()

      const mappedDays = LEGACY_PAYMENT_TERM_LABEL_TO_DAYS[legacy.toLowerCase()]
      const paymentTermId = mappedDays !== undefined ? byDays.get(mappedDays) : undefined

      return db.clients.update(client.id, {
        paymentTermId,
        paymentTerms: undefined,
      })
    }),
  )
}

export async function ensurePaymentTermsDirectory(): Promise<void> {
  const settings = await db.settings.get('SET-001')
  const version = settings?.paymentTermsDirectoryVersion ?? 0
  const count = await db.paymentTerms.count()

  if (count === 0) {
    await seedDefaultPaymentTerms()
  } else {
    await syncMissingDefaultPaymentTerms()
  }

  if (version < PAYMENT_TERMS_DIRECTORY_VERSION) {
    await migrateClientPaymentTerms()
  }

  if (settings && (settings.paymentTermsDirectoryVersion ?? 0) < PAYMENT_TERMS_DIRECTORY_VERSION) {
    await db.settings.update('SET-001', { paymentTermsDirectoryVersion: PAYMENT_TERMS_DIRECTORY_VERSION })
  }
}

export async function countClientsUsingPaymentTerm(paymentTermId: string): Promise<number> {
  return db.clients.filter((client) => client.paymentTermId === paymentTermId).count()
}
