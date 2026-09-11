import type {
  ClientAcquisitionSource,
  ClientBillingAccount,
  ClientCustomerTier,
  ClientIndustry,
  ClientMarket,
  ClientMembership,
  ClientStatus,
  ClientType,
} from '@/domain/entities/client'

export interface ClientSeedRecord {
  displayName: string
  email: string
  company?: string
  type?: ClientType
  status?: ClientStatus
  phone?: string
  country?: string
  city?: string
  industry?: ClientIndustry
  membership?: ClientMembership
  billingAccount?: ClientBillingAccount
  creditLimit?: number
  acquisitionSource?: ClientAcquisitionSource
  segment?: string
  market?: ClientMarket
  customerTier?: ClientCustomerTier
  preferredCurrency?: string
  accountManagerId?: string
  paymentTermId?: string
}

const mgr = (index: number) => `USR-${String((index % 14) + 1).padStart(3, '0')}`

/** Hand-crafted account templates — expanded to {@link SEED_CLIENT_TARGET_COUNT} for local dev. */
const BASE_SEED_CLIENTS: ClientSeedRecord[] = [
  { displayName: 'Acme Holdings', email: 'm.elsayed@acme.com', company: 'Acme Holdings', type: 'corporate', phone: '+20 100 111 2233', country: 'Egypt', city: 'Cairo', industry: 'corporate_services', billingAccount: 'credit', creditLimit: 250_000, acquisitionSource: 'referral', market: 'corporate', customerTier: 'gold', preferredCurrency: 'EGP', accountManagerId: mgr(0), paymentTermId: 'PTM-005' },
  { displayName: 'Global Co.', email: 's.mitchell@globalco.com', company: 'Global Co.', type: 'corporate', phone: '+1 212 555 0182', country: 'USA', city: 'New York', industry: 'finance', billingAccount: 'credit', creditLimit: 500_000, acquisitionSource: 'partner', market: 'mice', customerTier: 'platinum', preferredCurrency: 'USD', accountManagerId: mgr(1), paymentTermId: 'PTM-006' },
  { displayName: 'Nile Corp', email: 'h.abdelrahman@nilecorp.com', company: 'Nile Corp', type: 'corporate', phone: '+20 122 334 4556', country: 'Egypt', city: 'Alexandria', industry: 'travel_tourism', billingAccount: 'prepaid', acquisitionSource: 'website', market: 'groups', customerTier: 'silver', preferredCurrency: 'EGP', accountManagerId: mgr(2), paymentTermId: 'PTM-003' },
  { displayName: 'Travel Hub', email: 'emily.carter@travelhub.com', company: 'Travel Hub', type: 'corporate', status: 'inactive', country: 'UK', city: 'London', industry: 'travel_tourism', acquisitionSource: 'event', market: 'leisure', customerTier: 'bronze', preferredCurrency: 'GBP', accountManagerId: mgr(3), paymentTermId: 'PTM-005' },
  { displayName: 'Youssef Kamal', email: 'y.kamal@horizon.eg', type: 'individual', phone: '+20 101 998 7766', country: 'Egypt', city: 'Giza', membership: 'member', acquisitionSource: 'referral', segment: 'Luxury leisure', market: 'luxury', customerTier: 'gold', preferredCurrency: 'EGP', accountManagerId: mgr(4), paymentTermId: 'PTM-002' },
  { displayName: 'Sunrise Tours', email: 'layla.m@sunrise.com', company: 'Sunrise Tours', type: 'corporate', country: 'Egypt', city: 'Hurghada', industry: 'hospitality', billingAccount: 'prepaid', acquisitionSource: 'walk_in', market: 'fit', customerTier: 'silver', preferredCurrency: 'EGP', accountManagerId: mgr(5), paymentTermId: 'PTM-001' },
  { displayName: 'Venture IO', email: 'jporter@venture.io', company: 'Venture IO', type: 'corporate', country: 'USA', city: 'San Francisco', industry: 'technology', billingAccount: 'credit', creditLimit: 120_000, acquisitionSource: 'email_inquiry', market: 'corporate', customerTier: 'strategic', preferredCurrency: 'USD', accountManagerId: mgr(6), paymentTermId: 'PTM-005' },
  { displayName: 'Nour Hamed', email: 'nour.hamed@delta.eg', type: 'individual', phone: '+20 111 445 6677', country: 'Egypt', city: 'Cairo', acquisitionSource: 'social_media', segment: 'Family travel', market: 'leisure', preferredCurrency: 'EGP', accountManagerId: mgr(7) },
  { displayName: 'Emirates Leisure', email: 'f.zahra@emirates.ae', company: 'Emirates Leisure', type: 'corporate', country: 'UAE', city: 'Dubai', industry: 'hospitality', billingAccount: 'credit', creditLimit: 800_000, acquisitionSource: 'partner', market: 'luxury', customerTier: 'platinum', preferredCurrency: 'AED', accountManagerId: mgr(8), paymentTermId: 'PTM-007' },
  { displayName: 'Med Group International', email: 'd.cohen@medgroup.com', company: 'Med Group International', type: 'corporate', status: 'inactive', country: 'Israel', city: 'Tel Aviv', industry: 'healthcare', acquisitionSource: 'phone_inquiry', market: 'mice', customerTier: 'gold', preferredCurrency: 'USD', accountManagerId: mgr(9), paymentTermId: 'PTM-005' },
  { displayName: 'Cairo Elite Travel', email: 'info@cairoelite.eg', company: 'Cairo Elite Travel', type: 'corporate', phone: '+20 2 2777 4400', country: 'Egypt', city: 'Cairo', industry: 'travel_tourism', billingAccount: 'credit', creditLimit: 180_000, acquisitionSource: 'referral', market: 'luxury', customerTier: 'platinum', preferredCurrency: 'EGP', accountManagerId: mgr(10), paymentTermId: 'PTM-004' },
  { displayName: 'Omar Farouk', email: 'omar.farouk@gmail.com', type: 'individual', phone: '+20 100 554 3322', country: 'Egypt', city: 'Luxor', membership: 'member', acquisitionSource: 'ota', segment: 'Cultural tours', market: 'fit', preferredCurrency: 'EGP', accountManagerId: mgr(11) },
  { displayName: 'Red Sea Resorts', email: 'bookings@redsearesorts.com', company: 'Red Sea Resorts', type: 'corporate', phone: '+20 65 344 1100', country: 'Egypt', city: 'Sharm El Sheikh', industry: 'hospitality', billingAccount: 'prepaid', acquisitionSource: 'website', market: 'leisure', customerTier: 'gold', preferredCurrency: 'EGP', accountManagerId: mgr(12), paymentTermId: 'PTM-003' },
  { displayName: 'Sara Mendez', email: 'sara.mendez@outlook.es', type: 'individual', phone: '+34 612 445 889', country: 'Spain', city: 'Barcelona', acquisitionSource: 'social_media', segment: 'Honeymoon', market: 'leisure', preferredCurrency: 'EUR', accountManagerId: mgr(13) },
  { displayName: 'Gulf Business Travel', email: 'corporate@gbt.ae', company: 'Gulf Business Travel', type: 'corporate', phone: '+971 4 555 9012', country: 'UAE', city: 'Abu Dhabi', industry: 'corporate_services', billingAccount: 'credit', creditLimit: 650_000, acquisitionSource: 'partner', market: 'corporate', customerTier: 'strategic', preferredCurrency: 'AED', accountManagerId: mgr(0), paymentTermId: 'PTM-006' },
  { displayName: 'Hana Ibrahim', email: 'hana.ibrahim@yahoo.com', type: 'individual', phone: '+20 122 889 0011', country: 'Egypt', city: 'Mansoura', acquisitionSource: 'walk_in', segment: 'Umrah', market: 'fit', preferredCurrency: 'EGP', accountManagerId: mgr(1) },
  { displayName: 'Alpine Adventures GmbH', email: 'office@alpine-adventures.de', company: 'Alpine Adventures GmbH', type: 'corporate', phone: '+49 89 321 4455', country: 'Germany', city: 'Munich', industry: 'travel_tourism', billingAccount: 'prepaid', acquisitionSource: 'event', market: 'groups', customerTier: 'silver', preferredCurrency: 'EUR', accountManagerId: mgr(2), paymentTermId: 'PTM-005' },
  { displayName: 'James Whitfield', email: 'j.whitfield@britmail.co.uk', type: 'individual', phone: '+44 7700 900123', country: 'UK', city: 'Manchester', membership: 'member', acquisitionSource: 'referral', segment: 'Nile cruise', market: 'luxury', customerTier: 'gold', preferredCurrency: 'GBP', accountManagerId: mgr(3), paymentTermId: 'PTM-002' },
  { displayName: 'Riyadh MICE Partners', email: 'events@riyadhmice.sa', company: 'Riyadh MICE Partners', type: 'corporate', phone: '+966 11 445 6677', country: 'Saudi Arabia', city: 'Riyadh', industry: 'corporate_services', billingAccount: 'credit', creditLimit: 420_000, acquisitionSource: 'event', market: 'mice', customerTier: 'platinum', preferredCurrency: 'SAR', accountManagerId: mgr(4), paymentTermId: 'PTM-007' },
  { displayName: 'Fatma El Masry', email: 'fatma.elmasry@hotmail.com', type: 'individual', phone: '+20 101 223 4455', country: 'Egypt', city: 'Aswan', acquisitionSource: 'phone_inquiry', segment: 'Senior travel', market: 'leisure', preferredCurrency: 'EGP', accountManagerId: mgr(5) },
  { displayName: 'Paris Voyages', email: 'contact@parisvoyages.fr', company: 'Paris Voyages', type: 'corporate', country: 'France', city: 'Paris', industry: 'travel_tourism', billingAccount: 'prepaid', acquisitionSource: 'website', market: 'fit', customerTier: 'bronze', preferredCurrency: 'EUR', accountManagerId: mgr(6), paymentTermId: 'PTM-004' },
  { displayName: 'Karim Saleh', email: 'karim.saleh@outlook.com', type: 'individual', phone: '+20 111 778 9900', country: 'Egypt', city: 'Cairo', status: 'blocked', acquisitionSource: 'other', segment: 'Disputed account', market: 'leisure', preferredCurrency: 'EGP', accountManagerId: mgr(7) },
  { displayName: 'Mediterranean Cruises Ltd', email: 'charter@medcruises.gr', company: 'Mediterranean Cruises Ltd', type: 'corporate', phone: '+30 210 555 7788', country: 'Greece', city: 'Athens', industry: 'hospitality', billingAccount: 'credit', creditLimit: 300_000, acquisitionSource: 'partner', market: 'groups', customerTier: 'gold', preferredCurrency: 'EUR', accountManagerId: mgr(8), paymentTermId: 'PTM-006' },
  { displayName: 'Aisha Mohsen', email: 'aisha.m@live.com', type: 'individual', phone: '+971 50 334 5566', country: 'UAE', city: 'Dubai', membership: 'member', acquisitionSource: 'social_media', segment: 'Shopping breaks', market: 'luxury', preferredCurrency: 'AED', accountManagerId: mgr(9) },
  { displayName: 'Nordic Incentives', email: 'hello@nordicincentives.se', company: 'Nordic Incentives', type: 'corporate', country: 'Sweden', city: 'Stockholm', industry: 'corporate_services', billingAccount: 'prepaid', acquisitionSource: 'email_inquiry', market: 'mice', customerTier: 'silver', preferredCurrency: 'EUR', accountManagerId: mgr(10), paymentTermId: 'PTM-005' },
  { displayName: 'Tamer Nabil', email: 'tamer.nabil@egyptair.com.eg', type: 'individual', phone: '+20 122 110 9988', country: 'Egypt', city: 'Cairo', acquisitionSource: 'existing_customer', segment: 'Aviation staff', market: 'corporate', preferredCurrency: 'EGP', accountManagerId: mgr(11) },
  { displayName: 'Luxor Heritage DMC', email: 'ops@luxorheritage.com', company: 'Luxor Heritage DMC', type: 'corporate', phone: '+20 95 237 8800', country: 'Egypt', city: 'Luxor', industry: 'travel_tourism', billingAccount: 'credit', creditLimit: 95_000, acquisitionSource: 'referral', market: 'groups', customerTier: 'gold', preferredCurrency: 'EGP', accountManagerId: mgr(12), paymentTermId: 'PTM-003' },
  { displayName: 'Chloe Dubois', email: 'chloe.dubois@gmail.fr', type: 'individual', phone: '+33 6 12 34 56 78', country: 'France', city: 'Lyon', acquisitionSource: 'ota', segment: 'Art & culture', market: 'fit', preferredCurrency: 'EUR', accountManagerId: mgr(13) },
  { displayName: 'Qatar Executive Events', email: 'events@qexec.qa', company: 'Qatar Executive Events', type: 'corporate', phone: '+974 4444 5566', country: 'Qatar', city: 'Doha', industry: 'corporate_services', billingAccount: 'credit', creditLimit: 550_000, acquisitionSource: 'event', market: 'mice', customerTier: 'strategic', preferredCurrency: 'USD', accountManagerId: mgr(0), paymentTermId: 'PTM-007' },
  { displayName: 'Mariam Awad', email: 'mariam.awad@icloud.com', type: 'individual', phone: '+20 100 667 8899', country: 'Egypt', city: 'Port Said', membership: 'member', acquisitionSource: 'referral', segment: 'Red Sea diving', market: 'leisure', preferredCurrency: 'EGP', accountManagerId: mgr(1) },
  { displayName: 'Italian Luxury Escapes', email: 'info@luxescapes.it', company: 'Italian Luxury Escapes', type: 'corporate', country: 'Italy', city: 'Rome', industry: 'travel_tourism', billingAccount: 'prepaid', acquisitionSource: 'website', market: 'luxury', customerTier: 'platinum', preferredCurrency: 'EUR', accountManagerId: mgr(2), paymentTermId: 'PTM-005' },
  { displayName: 'David Chen', email: 'david.chen@techcorp.sg', type: 'individual', phone: '+65 9123 4567', country: 'Singapore', city: 'Singapore', acquisitionSource: 'partner', segment: 'Tech conference', market: 'corporate', customerTier: 'gold', preferredCurrency: 'USD', accountManagerId: mgr(3), paymentTermId: 'PTM-004' },
  { displayName: 'Alexandria Pharma Group', email: 'travel@alexpharma.eg', company: 'Alexandria Pharma Group', type: 'corporate', phone: '+20 3 555 2211', country: 'Egypt', city: 'Alexandria', industry: 'healthcare', billingAccount: 'credit', creditLimit: 210_000, acquisitionSource: 'phone_inquiry', market: 'corporate', customerTier: 'gold', preferredCurrency: 'EGP', accountManagerId: mgr(4), paymentTermId: 'PTM-006' },
  { displayName: 'Leila Mansour', email: 'leila.mansour@outlook.com', type: 'individual', phone: '+20 111 334 5566', country: 'Egypt', city: 'Cairo', status: 'inactive', acquisitionSource: 'email_inquiry', segment: 'Inactive lead', market: 'leisure', preferredCurrency: 'EGP', accountManagerId: mgr(5) },
  { displayName: 'Bosphorus Travel Co', email: 'reservations@bosphorustravel.tr', company: 'Bosphorus Travel Co', type: 'corporate', phone: '+90 212 555 6677', country: 'Turkey', city: 'Istanbul', industry: 'travel_tourism', billingAccount: 'prepaid', acquisitionSource: 'referral', market: 'groups', customerTier: 'silver', preferredCurrency: 'USD', accountManagerId: mgr(6), paymentTermId: 'PTM-003' },
  { displayName: 'Hassan Ragab', email: 'hassan.ragab@gmail.com', type: 'individual', phone: '+20 101 445 7788', country: 'Egypt', city: 'Minya', acquisitionSource: 'walk_in', segment: 'Religious travel', market: 'fit', preferredCurrency: 'EGP', accountManagerId: mgr(7) },
  { displayName: 'Canadian Incentive Group', email: 'groups@cig.ca', company: 'Canadian Incentive Group', type: 'corporate', country: 'Canada', city: 'Toronto', industry: 'corporate_services', billingAccount: 'credit', creditLimit: 175_000, acquisitionSource: 'event', market: 'mice', customerTier: 'gold', preferredCurrency: 'USD', accountManagerId: mgr(8), paymentTermId: 'PTM-006' },
  { displayName: 'Nadia Khaled', email: 'nadia.khaled@yahoo.com', type: 'individual', phone: '+20 122 556 7788', country: 'Egypt', city: 'Cairo', membership: 'member', acquisitionSource: 'social_media', segment: 'Wellness retreats', market: 'luxury', preferredCurrency: 'EGP', accountManagerId: mgr(9) },
  { displayName: 'Sahara Expeditions', email: 'book@saharaexpeditions.ma', company: 'Sahara Expeditions', type: 'corporate', phone: '+212 522 445 667', country: 'Morocco', city: 'Marrakech', industry: 'travel_tourism', billingAccount: 'prepaid', acquisitionSource: 'website', market: 'fit', customerTier: 'bronze', preferredCurrency: 'EUR', accountManagerId: mgr(10), paymentTermId: 'PTM-002' },
  { displayName: 'Peter Johansson', email: 'p.johansson@nordicmail.se', type: 'individual', phone: '+46 70 123 4567', country: 'Sweden', city: 'Gothenburg', acquisitionSource: 'ota', segment: 'Archaeology tours', market: 'fit', preferredCurrency: 'EUR', accountManagerId: mgr(11) },
  { displayName: 'Petro Gulf Services', email: 'mobility@petrogulf.ae', company: 'Petro Gulf Services', type: 'corporate', phone: '+971 2 666 7788', country: 'UAE', city: 'Abu Dhabi', industry: 'manufacturing', billingAccount: 'credit', creditLimit: 900_000, acquisitionSource: 'partner', market: 'corporate', customerTier: 'strategic', preferredCurrency: 'AED', accountManagerId: mgr(12), paymentTermId: 'PTM-008' },
  { displayName: 'Rana Sherif', email: 'rana.sherif@hotmail.com', type: 'individual', phone: '+20 100 889 1122', country: 'Egypt', city: 'Ismailia', acquisitionSource: 'referral', segment: 'Weekend getaways', market: 'leisure', preferredCurrency: 'EGP', accountManagerId: mgr(13) },
  { displayName: 'London School Abroad', email: 'travel@lsabroad.co.uk', company: 'London School Abroad', type: 'corporate', country: 'UK', city: 'London', industry: 'education', billingAccount: 'prepaid', acquisitionSource: 'email_inquiry', market: 'groups', customerTier: 'silver', preferredCurrency: 'GBP', accountManagerId: mgr(0), paymentTermId: 'PTM-005' },
  { displayName: 'Amr Diab', email: 'amr.diab@proton.me', type: 'individual', phone: '+20 111 990 2233', country: 'Egypt', city: 'Suez', status: 'blocked', acquisitionSource: 'other', segment: 'Payment hold', market: 'leisure', preferredCurrency: 'EGP', accountManagerId: mgr(1) },
  { displayName: 'Kuwait Family Tours', email: 'info@kwtfamilytours.com', company: 'Kuwait Family Tours', type: 'corporate', phone: '+965 2222 3344', country: 'Kuwait', city: 'Kuwait City', industry: 'travel_tourism', billingAccount: 'prepaid', acquisitionSource: 'walk_in', market: 'leisure', customerTier: 'bronze', preferredCurrency: 'USD', accountManagerId: mgr(2), paymentTermId: 'PTM-001' },
  { displayName: 'Elena Popescu', email: 'elena.popescu@gmail.ro', type: 'individual', phone: '+40 722 334 556', country: 'Romania', city: 'Bucharest', acquisitionSource: 'social_media', segment: 'Danube cruise', market: 'fit', preferredCurrency: 'EUR', accountManagerId: mgr(3) },
  { displayName: 'Cairo University Travel Office', email: 'mobility@cu.edu.eg', company: 'Cairo University Travel Office', type: 'corporate', phone: '+20 2 3567 8901', country: 'Egypt', city: 'Giza', industry: 'education', billingAccount: 'credit', creditLimit: 140_000, acquisitionSource: 'partner', market: 'corporate', customerTier: 'gold', preferredCurrency: 'EGP', accountManagerId: mgr(4), paymentTermId: 'PTM-006' },
  { displayName: 'Sophie Laurent', email: 'sophie.laurent@orange.fr', type: 'individual', phone: '+33 6 98 76 54 32', country: 'France', city: 'Nice', membership: 'member', acquisitionSource: 'referral', segment: 'Riviera & Nile', market: 'luxury', customerTier: 'platinum', preferredCurrency: 'EUR', accountManagerId: mgr(5) },
  { displayName: 'Bahrain Corporate Travel', email: 'desk@bct.bh', company: 'Bahrain Corporate Travel', type: 'corporate', country: 'Bahrain', city: 'Manama', industry: 'corporate_services', billingAccount: 'credit', creditLimit: 230_000, acquisitionSource: 'partner', market: 'corporate', customerTier: 'gold', preferredCurrency: 'USD', accountManagerId: mgr(6), paymentTermId: 'PTM-005' },
  { displayName: 'Mohamed Ali Hassan', email: 'mohamed.ali.hassan@outlook.com', type: 'individual', phone: '+20 101 112 3344', country: 'Egypt', city: 'Fayoum', acquisitionSource: 'phone_inquiry', segment: 'Desert safari', market: 'fit', preferredCurrency: 'EGP', accountManagerId: mgr(7) },
]

export const SEED_CLIENT_TARGET_COUNT = 179

const CORPORATE_SUFFIXES = ['Group', 'International', 'Partners', 'Holdings', 'Services', 'Travel', 'DMC', 'Events']
const INDIVIDUAL_FIRST_NAMES = [
  'Ahmed',
  'Fatima',
  'Omar',
  'Layla',
  'Hassan',
  'Nadia',
  'Karim',
  'Sara',
  'Youssef',
  'Mariam',
  'James',
  'Emily',
  'Luca',
  'Elena',
  'David',
  'Sophie',
]
const INDIVIDUAL_LAST_NAMES = [
  'Hassan',
  'Ibrahim',
  'Kamal',
  'Nabil',
  'Farouk',
  'Mansour',
  'Whitfield',
  'Chen',
  'Popescu',
  'Laurent',
  'Mitchell',
  'Dubois',
  'Johansson',
  'Mendez',
  'Ragab',
  'Awad',
]

function uniqueSeedEmail(templateEmail: string, sequence: number): string {
  const [local, domain] = templateEmail.split('@')
  const base = local.replace(/\+.*$/, '')
  return `${base}.acct${String(sequence).padStart(3, '0')}@${domain}`
}

function expandSeedClient(template: ClientSeedRecord, index: number): ClientSeedRecord {
  if (index < BASE_SEED_CLIENTS.length) return BASE_SEED_CLIENTS[index]

  const sequence = index + 1
  const type = template.type ?? (template.company ? 'corporate' : 'individual')
  const email = uniqueSeedEmail(template.email, sequence)

  if (type === 'corporate') {
    const baseCompany = template.company?.trim() || template.displayName
    const suffix = CORPORATE_SUFFIXES[index % CORPORATE_SUFFIXES.length]
    const company = `${baseCompany} ${suffix} ${sequence}`
    return {
      ...template,
      displayName: company,
      company,
      email,
      accountManagerId: mgr(index),
      creditLimit:
        template.billingAccount === 'credit'
          ? Math.round((template.creditLimit ?? 100_000) * (0.85 + (index % 7) * 0.05))
          : template.creditLimit,
    }
  }

  const firstName = INDIVIDUAL_FIRST_NAMES[index % INDIVIDUAL_FIRST_NAMES.length]
  const lastName = INDIVIDUAL_LAST_NAMES[(index + 3) % INDIVIDUAL_LAST_NAMES.length]
  const displayName = `${firstName} ${lastName}`
  return {
    ...template,
    displayName,
    email,
    company: undefined,
    accountManagerId: mgr(index),
    membership: index % 4 === 0 ? 'member' : template.membership,
    status: index % 23 === 0 ? 'inactive' : index % 37 === 0 ? 'blocked' : template.status,
  }
}

/** 175 diverse directory accounts for local dev and demos. */
export const SEED_CLIENTS: ClientSeedRecord[] = Array.from({ length: SEED_CLIENT_TARGET_COUNT }, (_, index) =>
  expandSeedClient(BASE_SEED_CLIENTS[index % BASE_SEED_CLIENTS.length], index),
)

export const SEED_CLIENT_COUNT = SEED_CLIENTS.length
