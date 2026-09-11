import { db } from '@/infrastructure/database/db'
import type { Supplier, SupplierCategory, SupplierStatus } from '@/domain/entities/supplier'
import { generateId } from '@/shared/utils/cn'

export const SUPPLIERS_DIRECTORY_VERSION = 2

export const SEED_SUPPLIERS: Array<{
  displayName: string
  category: SupplierCategory
  status?: SupplierStatus
  contactName?: string
  email?: string
  phone?: string
  country?: string
  city?: string
  website?: string
}> = [
  // Airlines (5)
  { displayName: 'EgyptAir', category: 'airline', email: 'groups@egyptair.com', phone: '+20 2 2696 6000', country: 'Egypt', city: 'Cairo', website: 'https://www.egyptair.com' },
  { displayName: 'Nile Air', category: 'airline', email: 'charter@nileair.com', phone: '+20 2 2267 4444', country: 'Egypt', city: 'Cairo' },
  { displayName: 'Air Cairo', category: 'airline', email: 'sales@aircairo.com', country: 'Egypt', city: 'Cairo' },
  { displayName: 'Emirates', category: 'airline', email: 'groups@emirates.com', country: 'UAE', city: 'Dubai' },
  { displayName: 'Turkish Airlines', category: 'airline', email: 'groups@thy.com', country: 'Turkey', city: 'Istanbul' },

  // Hotels (12)
  { displayName: 'Four Seasons Nile Plaza', category: 'hotel', email: 'reservations.fsnp@fourseasons.com', phone: '+20 2 2791 7000', country: 'Egypt', city: 'Cairo' },
  { displayName: 'Marriott Mena House', category: 'hotel', email: 'reservations.menahouse@marriott.com', phone: '+20 2 3377 3222', country: 'Egypt', city: 'Giza' },
  { displayName: 'Hilton Luxor', category: 'hotel', email: 'luxor.reservations@hilton.com', country: 'Egypt', city: 'Luxor' },
  { displayName: 'Steigenberger Hurghada', category: 'hotel', email: 'reservations.hurghada@steigenberger.com', country: 'Egypt', city: 'Hurghada' },
  { displayName: 'Rixos Premium Seagate', category: 'hotel', email: 'reservations.sharm@rixos.com', country: 'Egypt', city: 'Sharm El Sheikh' },
  { displayName: 'Sofitel Legend Old Cataract', category: 'hotel', email: 'reservations.aswan@sofitel.com', country: 'Egypt', city: 'Aswan' },
  { displayName: 'Kempinski Nile Hotel', category: 'hotel', email: 'reservations.cairo@kempinski.com', country: 'Egypt', city: 'Cairo' },
  { displayName: 'JW Marriott Cairo', category: 'hotel', email: 'reservations.jwcairo@marriott.com', country: 'Egypt', city: 'Cairo' },
  { displayName: 'Hyatt Regency Sharm', category: 'hotel', email: 'sharm.reservations@hyatt.com', country: 'Egypt', city: 'Sharm El Sheikh' },
  { displayName: 'Baron Palace Sahl Hasheesh', category: 'hotel', country: 'Egypt', city: 'Hurghada' },
  { displayName: 'Al Moudira Hotel', category: 'hotel', email: 'reservations@almoudira.com', country: 'Egypt', city: 'Luxor' },
  { displayName: 'Movenpick Resort El Gouna', category: 'hotel', email: 'reservations.elgouna@moevenpick.com', country: 'Egypt', city: 'El Gouna' },

  // Cruises (4)
  { displayName: 'Oberoi Zahra', category: 'cruise', email: 'sales@oberoihotels.com', phone: '+20 2 2276 0000', country: 'Egypt', city: 'Luxor' },
  { displayName: 'Nour El Nil', category: 'cruise', email: 'bookings@nourelnil.com', country: 'Egypt', city: 'Aswan' },
  { displayName: 'Sanctuary Sun Boat IV', category: 'cruise', email: 'groups@sanctuaryretreats.com', country: 'Egypt', city: 'Luxor' },
  { displayName: 'Historia Nile Cruise', category: 'cruise', country: 'Egypt', city: 'Aswan' },

  // DMCs (7)
  { displayName: 'Desert Adventures Co.', category: 'dmc', email: 'ops@desertadventures.eg', phone: '+20 100 200 3344', country: 'Egypt', city: 'Cairo' },
  { displayName: 'Nile Heritage Tours', category: 'dmc', email: 'groups@nileheritage.eg', country: 'Egypt', city: 'Luxor' },
  { displayName: 'Memphis Tours', category: 'dmc', email: 'groups@memphistours.com', phone: '+20 2 3567 8800', country: 'Egypt', city: 'Giza' },
  { displayName: 'Emeco Travel', category: 'dmc', email: 'incoming@emecotravel.com', country: 'Egypt', city: 'Cairo' },
  { displayName: 'Abercrombie & Kent Egypt', category: 'dmc', email: 'egypt@abercrombiekent.com', country: 'Egypt', city: 'Cairo' },
  { displayName: 'Jasmine Tours', category: 'dmc', email: 'operations@jasminetours.eg', country: 'Egypt', city: 'Alexandria' },
  { displayName: 'Egypt Tailor Made', category: 'dmc', email: 'hello@egypttailormade.com', country: 'Egypt', city: 'Cairo', status: 'prospect' },

  // Activities (9)
  { displayName: 'Cairo Insider', category: 'activity', email: 'bookings@cairoinsider.com', country: 'Egypt', city: 'Cairo' },
  { displayName: 'Luxor Day Tours', category: 'activity', email: 'info@luxordaytours.com', country: 'Egypt', city: 'Luxor' },
  { displayName: 'Red Sea Divers', category: 'activity', email: 'dive@redseadivers.eg', phone: '+20 65 344 1122', country: 'Egypt', city: 'Hurghada' },
  { displayName: 'Egypt Excursions', category: 'activity', country: 'Egypt', city: 'Cairo', status: 'prospect' },
  { displayName: 'Sinai Safari Adventures', category: 'activity', email: 'safari@sinaisafari.eg', country: 'Egypt', city: 'Sharm El Sheikh' },
  { displayName: 'Hot Air Balloon Luxor', category: 'activity', email: 'fly@balloonluxor.com', country: 'Egypt', city: 'Luxor' },
  { displayName: 'Khan El Khalili Guides', category: 'activity', country: 'Egypt', city: 'Cairo' },
  { displayName: 'Pyramids Camel Experience', category: 'activity', country: 'Egypt', city: 'Giza' },
  { displayName: 'White Desert Camping Co.', category: 'activity', email: 'camp@whitedesert.eg', country: 'Egypt', city: 'Bahariya' },

  // Insurance (4)
  { displayName: 'Allianz Travel', category: 'insurance', email: 'b2b@allianz.com', country: 'Germany', city: 'Munich' },
  { displayName: 'AXA Egypt', category: 'insurance', email: 'travel@axa.eg', country: 'Egypt', city: 'Cairo' },
  { displayName: 'Travel Guard MENA', category: 'insurance', email: 'partners@travelguardmena.com', country: 'UAE', city: 'Dubai' },
  { displayName: 'Chubb Global', category: 'insurance', email: 'travel@chubb.com', country: 'Switzerland', city: 'Zurich' },

  // Transport (6)
  { displayName: 'Egyliere Transport', category: 'transport', email: 'fleet@egyliere.com', phone: '+20 2 2525 8800', country: 'Egypt', city: 'Cairo' },
  { displayName: 'Cairo Limousine Services', category: 'transport', email: 'dispatch@cairolimo.eg', country: 'Egypt', city: 'Cairo' },
  { displayName: 'Nile Valley Coaches', category: 'transport', email: 'groups@nilevalleycoaches.com', country: 'Egypt', city: 'Luxor' },
  { displayName: 'Hurghada Airport Transfers', category: 'transport', email: 'bookings@hurghadatransfers.eg', country: 'Egypt', city: 'Hurghada' },
  { displayName: 'Fleet Masters Egypt', category: 'transport', email: 'ops@fleetmasters.eg', country: 'Egypt', city: 'Cairo' },
  { displayName: 'Red Sea Shuttle', category: 'transport', country: 'Egypt', city: 'Sharm El Sheikh', status: 'inactive' },

  // Restaurants (5)
  { displayName: 'La Palmeraie', category: 'restaurant', email: 'reservations@lapalmeraie.eg', country: 'Egypt', city: 'Cairo' },
  { displayName: 'Abou El Sid', category: 'restaurant', country: 'Egypt', city: 'Cairo' },
  { displayName: 'Sequoia Cairo', category: 'restaurant', email: 'hello@sequoiacairo.com', country: 'Egypt', city: 'Cairo' },
  { displayName: 'Andrea Mariouteya', category: 'restaurant', country: 'Egypt', city: 'Giza' },
  { displayName: 'Felfela Restaurant', category: 'restaurant', country: 'Egypt', city: 'Cairo' },

  // Other (2)
  { displayName: 'Visa Facilitation Egypt', category: 'other', email: 'visas@vfe.eg', country: 'Egypt', city: 'Cairo' },
  { displayName: 'MICE Egypt Partners', category: 'other', email: 'events@miceegypt.com', country: 'Egypt', city: 'Cairo', status: 'prospect' },
]

function formatSupplierReference(sequence: number): string {
  return `SUP-${String(sequence).padStart(4, '0')}`
}

function parseReferenceSequence(reference: string): number {
  const match = reference.match(/^SUP-(\d+)$/i)
  return match ? Number.parseInt(match[1], 10) : 0
}

function buildSupplier(
  seed: (typeof SEED_SUPPLIERS)[number],
  referenceSequence: number,
  ageIndex: number,
): Supplier {
  const now = new Date(Date.now() - ageIndex * 3_600_000).toISOString()
  return {
    id: generateId('SUP'),
    reference: formatSupplierReference(referenceSequence),
    displayName: seed.displayName,
    category: seed.category,
    status: seed.status ?? 'active',
    contactName: seed.contactName,
    email: seed.email,
    phone: seed.phone,
    country: seed.country,
    city: seed.city,
    website: seed.website,
    preferredCurrency: seed.country === 'Egypt' ? 'EGP' : 'USD',
    createdAt: now,
    updatedAt: now,
  }
}

async function maxReferenceSequence(): Promise<number> {
  const suppliers = await db.suppliers.toArray()
  return suppliers.reduce((max, supplier) => Math.max(max, parseReferenceSequence(supplier.reference)), 0)
}

async function syncSeedSuppliers(): Promise<Supplier[]> {
  const existing = await db.suppliers.toArray()
  const byName = new Map(existing.map((supplier) => [supplier.displayName.trim().toLowerCase(), supplier]))

  const missingSeeds = SEED_SUPPLIERS.filter((seed) => !byName.has(seed.displayName.trim().toLowerCase()))
  if (missingSeeds.length === 0) return existing

  let nextRef = await maxReferenceSequence()
  const toAdd = missingSeeds.map((seed, index) => {
    nextRef += 1
    return buildSupplier(seed, nextRef, existing.length + index)
  })

  await db.suppliers.bulkAdd(toAdd)
  return [...existing, ...toAdd]
}

async function linkTripServicesToSuppliers(suppliers: Supplier[]): Promise<void> {
  const unlinkedCount = await db.tripServices
    .filter((service) => !service.supplierId && Boolean(service.supplierName?.trim()))
    .count()
  if (unlinkedCount === 0) return

  const byName = new Map(suppliers.map((supplier) => [supplier.displayName.trim().toLowerCase(), supplier]))

  const services = await db.tripServices
    .filter((service) => !service.supplierId && Boolean(service.supplierName?.trim()))
    .toArray()
  await Promise.all(
    services.map((service) => {
      if (service.supplierId) return Promise.resolve()
      const nameKey = service.supplierName?.trim().toLowerCase()
      const match = nameKey ? byName.get(nameKey) : undefined
      if (!match) return Promise.resolve()
      return db.tripServices.update(service.id, {
        supplierId: match.id,
        updatedAt: new Date().toISOString(),
      })
    }),
  )
}

export async function ensureSuppliersDirectory(): Promise<void> {
  const settings = await db.settings.get('SET-001')
  const version = settings?.suppliersDirectoryVersion ?? 0
  const count = await db.suppliers.count()

  if (count === 0) {
    const suppliers = SEED_SUPPLIERS.map((seed, index) => buildSupplier(seed, index + 1, index))
    await db.suppliers.bulkAdd(suppliers)
    await linkTripServicesToSuppliers(suppliers)
  } else if (version < SUPPLIERS_DIRECTORY_VERSION || count < SEED_SUPPLIERS.length) {
    const suppliers = await syncSeedSuppliers()
    await linkTripServicesToSuppliers(suppliers)
  } else {
    const unlinkedCount = await db.tripServices
      .filter((service) => !service.supplierId && Boolean(service.supplierName?.trim()))
      .count()
    if (unlinkedCount > 0) {
      await linkTripServicesToSuppliers(await db.suppliers.toArray())
    }
  }

  if (settings && (version < SUPPLIERS_DIRECTORY_VERSION || count < SEED_SUPPLIERS.length)) {
    await db.settings.update('SET-001', { suppliersDirectoryVersion: SUPPLIERS_DIRECTORY_VERSION })
  }
}

export async function nextSupplierReference(): Promise<string> {
  const next = (await maxReferenceSequence()) + 1
  return formatSupplierReference(next)
}
