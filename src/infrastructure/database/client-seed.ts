import { db } from '@/infrastructure/database/db'
import type { Client, ClientMembership, ClientStatus } from '@/domain/entities/client'
import {
  DEFAULT_CLIENT_MEMBERSHIP,
  inferClientNameParts,
  buildClientDisplayName,
  clientPrimaryLabel,
} from '@/domain/entities/client'
import { formatMembershipNumber } from '@/domain/membership/program'
import {
  DEFAULT_MEMBERSHIP_DURATION_MONTHS,
  addMonthsToMembershipDate,
  toMembershipStartDate,
} from '@/domain/membership/term'
import {
  SEED_CLIENTS,
  type ClientSeedRecord,
} from '@/infrastructure/database/mocks/clients.mock'
import { enrichClientFromSeed } from '@/infrastructure/database/complete-client-enrichment'
import { generateId } from '@/shared/utils/cn'
import { CLIENTS_DIRECTORY_VERSION } from '@/infrastructure/database/bootstrap-versions'

export { SEED_CLIENTS, SEED_CLIENT_COUNT } from '@/infrastructure/database/mocks/clients.mock'
export { CLIENTS_DIRECTORY_VERSION }

function formatClientReference(sequence: number): string {
  return `CLT-${String(sequence).padStart(4, '0')}`
}

function maxClientReferenceSequence(clients: Client[]): number {
  return clients.reduce((max, client) => {
    const match = client.reference.match(/^CLT-(\d+)$/)
    if (!match) return max
    return Math.max(max, Number.parseInt(match[1], 10))
  }, 0)
}

function buildClient(seed: ClientSeedRecord, referenceSequence: number): Client {
  const now = new Date(Date.now() - referenceSequence * 3_600_000).toISOString()
  const type = seed.type ?? 'individual'
  const nameParts =
    type === 'individual' ? inferClientNameParts(seed.displayName) : { firstName: '', middleName: '', lastName: '' }
  const membership = seed.membership ?? DEFAULT_CLIENT_MEMBERSHIP
  const billingAccount = seed.billingAccount ?? 'prepaid'
  const seedIndex = referenceSequence - 1

  const base: Omit<Client, 'id'> = {
    reference: formatClientReference(referenceSequence),
    displayName:
      type === 'individual'
        ? buildClientDisplayName(nameParts.firstName, nameParts.lastName) || seed.displayName
        : seed.company?.trim() || seed.displayName,
    firstName: type === 'individual' ? nameParts.firstName : undefined,
    middleName: type === 'individual' && nameParts.middleName ? nameParts.middleName : undefined,
    lastName: type === 'individual' ? nameParts.lastName : undefined,
    type,
    status: seed.status ?? 'active',
    email: seed.email,
    phone: seed.phone,
    company: seed.company,
    industry: seed.industry,
    country: seed.country,
    city: seed.city,
    preferredCurrency: seed.preferredCurrency ?? 'EGP',
    preferredLanguage: 'en',
    membership,
    membershipEnrolledAt: membership === 'member' ? now : undefined,
    membershipExpiresAt:
      membership === 'member'
        ? addMonthsToMembershipDate(toMembershipStartDate(now), DEFAULT_MEMBERSHIP_DURATION_MONTHS)
        : undefined,
    billingAccount,
    creditLimit: billingAccount === 'credit' ? seed.creditLimit : undefined,
    acquisitionSource: seed.acquisitionSource,
    segment: seed.segment,
    market: seed.market,
    customerTier: seed.customerTier,
    accountManagerId: seed.accountManagerId,
    paymentTermId: seed.paymentTermId,
    createdAt: now,
    updatedAt: now,
  }

  return {
    id: generateId('CLT'),
    ...base,
    ...enrichClientFromSeed(seed, seedIndex, base),
  }
}

async function linkTripsToClients(clients: Client[]): Promise<void> {
  const byEmail = new Map(
    clients
      .filter((client) => client.email?.trim())
      .map((client) => [client.email!.trim().toLowerCase(), client]),
  )
  const byName = new Map(
    clients.map((client) => [clientPrimaryLabel(client).trim().toLowerCase(), client]),
  )

  const trips = await db.trips.toArray()
  await Promise.all(
    trips.map((trip) => {
      if (trip.clientId) return Promise.resolve()
      const emailKey = trip.mainContactEmail?.trim().toLowerCase()
      const nameKey = trip.mainContactName?.trim().toLowerCase()
      const match =
        (emailKey && byEmail.get(emailKey)) ?? (nameKey && byName.get(nameKey)) ?? undefined
      if (!match) return Promise.resolve()
      return db.trips.update(trip.id, {
        clientId: match.id,
        mainContactName: clientPrimaryLabel(match),
        mainContactEmail: match.email,
        updatedAt: new Date().toISOString(),
      })
    }),
  )
}

async function migrateLegacyClientStatuses(): Promise<void> {
  const clients = await db.clients.toArray()
  await Promise.all(
    clients
      .filter((client) => (client.status as string) === 'prospect')
      .map((client) => db.clients.update(client.id, { status: 'inactive' satisfies ClientStatus })),
  )
}

async function migrateClientMembership(): Promise<void> {
  const clients = await db.clients.toArray()
  await Promise.all(
    clients
      .filter((client) => client.membership == null)
      .map((client) =>
        db.clients.update(client.id, { membership: DEFAULT_CLIENT_MEMBERSHIP satisfies ClientMembership }),
      ),
  )
}

async function migrateMembershipRecords(): Promise<void> {
  const clients = await db.clients.toArray()
  let sequence = clients.reduce((max, client) => {
    const match = client.membershipNumber?.match(/^MEM-(\d+)$/)
    if (!match) return max
    return Math.max(max, Number.parseInt(match[1], 10))
  }, 0)

  await Promise.all(
    clients
      .filter((client) => client.membership === 'member' && !client.membershipNumber)
      .map(async (client) => {
        sequence += 1
        await db.clients.update(client.id, {
          membershipNumber: formatMembershipNumber(sequence),
          membershipEnrolledAt: client.membershipEnrolledAt ?? client.updatedAt,
        })
      }),
  )
}

async function migrateMembershipExpiryDates(): Promise<void> {
  const clients = await db.clients.toArray()
  await Promise.all(
    clients
      .filter((client) => client.membership === 'member' && !client.membershipExpiresAt)
      .map((client) => {
        const start = toMembershipStartDate(client.membershipEnrolledAt ?? client.updatedAt)
        return db.clients.update(client.id, {
          membershipExpiresAt: addMonthsToMembershipDate(start, DEFAULT_MEMBERSHIP_DURATION_MONTHS),
        })
      }),
  )
}

async function migrateClientNameParts(): Promise<void> {
  const clients = await db.clients.toArray()
  await Promise.all(
    clients
      .filter((client) => client.type === 'individual')
      .map((client) => {
        if (client.firstName?.trim() && client.lastName?.trim()) {
          const displayName = buildClientDisplayName(client.firstName, client.lastName)
          if (displayName === client.displayName) return Promise.resolve()
          return db.clients.update(client.id, { displayName })
        }
        const parts = inferClientNameParts(client.displayName)
        return db.clients.update(client.id, {
          firstName: parts.firstName,
          middleName: parts.middleName || undefined,
          lastName: parts.lastName,
          displayName: buildClientDisplayName(parts.firstName, parts.lastName) || client.displayName,
        })
      }),
  )
}

async function migrateCorporateAccountNames(): Promise<void> {
  const clients = await db.clients.toArray()
  await Promise.all(
    clients
      .filter((client) => client.type === 'corporate' && client.company?.trim())
      .map((client) => {
        const accountName = client.company!.trim()
        if (client.displayName === accountName) return Promise.resolve()
        return db.clients.update(client.id, { displayName: accountName })
      }),
  )
}

async function migrateCompleteClientProfiles(): Promise<void> {
  const clients = await db.clients.toArray()
  const seedByEmail = new Map(
    SEED_CLIENTS.map((seed, index) => [seed.email.trim().toLowerCase(), { seed, index }]),
  )

  await Promise.all(
    clients.map((client) => {
      const match = client.email ? seedByEmail.get(client.email.trim().toLowerCase()) : undefined
      if (!match) return Promise.resolve()

      const enriched = enrichClientFromSeed(match.seed, match.index, client)
      return db.clients.update(client.id, {
        ...enriched,
        updatedAt: new Date().toISOString(),
      })
    }),
  )
}

async function seedMissingClients(): Promise<void> {
  const existing = await db.clients.toArray()
  const existingEmails = new Set(
    existing.map((client) => client.email?.trim().toLowerCase()).filter(Boolean) as string[],
  )
  let sequence = maxClientReferenceSequence(existing)
  const toAdd: Client[] = []

  for (const seed of SEED_CLIENTS) {
    const email = seed.email.trim().toLowerCase()
    if (existingEmails.has(email)) continue
    sequence += 1
    toAdd.push(buildClient(seed, sequence))
    existingEmails.add(email)
  }

  if (toAdd.length > 0) {
    await db.clients.bulkAdd(toAdd)
  }
}

export async function ensureClientsDirectory(): Promise<void> {
  const settings = await db.settings.get('SET-001')
  const version = settings?.clientsDirectoryVersion ?? 0
  const count = await db.clients.count()

  if (count > 0 && version < 2) {
    await migrateLegacyClientStatuses()
  }

  if (count > 0 && version < 3) {
    await migrateClientMembership()
  }

  if (count > 0 && version < 4) {
    await migrateMembershipRecords()
  }

  if (count > 0 && version < 5) {
    await migrateMembershipExpiryDates()
  }

  if (count > 0 && version < 7) {
    await migrateClientNameParts()
    await migrateCorporateAccountNames()
  }

  if (count === 0) {
    const clients = SEED_CLIENTS.map((seed, index) => buildClient(seed, index + 1))
    await db.clients.bulkAdd(clients)
    await linkTripsToClients(clients)
  } else if (version < CLIENTS_DIRECTORY_VERSION) {
    await seedMissingClients()
    await migrateCompleteClientProfiles()
    await migrateMembershipRecords()
    await linkTripsToClients(await db.clients.toArray())
  } else {
    const unlinkedTripCount = await db.trips.filter((trip) => !trip.clientId).count()
    if (unlinkedTripCount > 0) {
      await linkTripsToClients(await db.clients.toArray())
    }
  }

  if (settings) {
    await db.settings.update('SET-001', { clientsDirectoryVersion: CLIENTS_DIRECTORY_VERSION })
  }
}

export async function nextMembershipNumber(): Promise<string> {
  const clients = await db.clients.toArray()
  const max = clients.reduce((acc, client) => {
    const match = client.membershipNumber?.match(/^MEM-(\d+)$/)
    if (!match) return acc
    return Math.max(acc, Number.parseInt(match[1], 10))
  }, 0)
  return formatMembershipNumber(max + 1)
}

export async function nextClientReference(): Promise<string> {
  const clients = await db.clients.toArray()
  return formatClientReference(maxClientReferenceSequence(clients) + 1)
}
