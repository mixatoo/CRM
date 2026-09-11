import type { Trip } from '../stubs/domain-entities'
import { SERVICE_CATEGORIES } from '../stubs/domain-entities'
import type { FacetListOption } from './lists/types'
import type { TemplateListRow } from './tables/types'

export const MOCK_DEMO_TRIP: Trip = {
  id: 'TRP-504567',
  reference: '504567',
  name: 'Advanced Webinar Series — Cairo',
  ownerName: 'Ibrahim Mahmoud',
  ownerId: 'USR-001',
  branch: 'HQ',
  destination: 'Cairo & Giza',
  stage: 'confirmed',
  tripType: 'Corporate',
  currency: 'EGP',
  totalCost: 18_450,
  totalCommission: 1_845,
  clientPaidAmount: 10_000,
  supplierBalanceDue: 5_000,
  adults: 12,
  minors: 0,
  bookingStartedAt: '2026-01-15',
  startDate: '2026-03-20',
  endDate: '2026-03-25',
  mainContactName: 'Mohamed El-Sayed',
  mainContactEmail: 'm.elsayed@acme.com',
  agentName: 'Ibrahim Mahmoud',
  agentEmail: 'admin@egyliere.com',
  serviceBreakdown: SERVICE_CATEGORIES.map((category) => ({
    category,
    proposal: category === 'lodging' ? 1 : 0,
    confirmed: category === 'flight' ? 1 : 0,
    canceled: 0,
  })),
  createdAt: '2026-01-15T00:00:00.000Z',
  updatedAt: '2026-01-15T00:00:00.000Z',
}

export const MOCK_FACET_OWNERS: FacetListOption[] = [
  { value: 'Ibrahim Mahmoud', count: 130, activeCount: 108 },
  { value: 'Nadia El-Sayed', count: 64, activeCount: 52 },
  { value: 'Omar Farouk', count: 62, activeCount: 51 },
  { value: 'Rania Mostafa', count: 65, activeCount: 53 },
  { value: 'Tarek Samy', count: 60, activeCount: 50 },
]

export const MOCK_FACET_DESTINATIONS: FacetListOption[] = [
  { value: 'Cairo & Giza', count: 48 },
  { value: 'Luxor & Aswan', count: 42 },
  { value: 'Red Sea', count: 38 },
  { value: 'Alexandria', count: 31 },
  { value: 'Siwa Oasis', count: 22 },
  { value: 'Sharm El Sheikh', count: 19 },
]

export const MOCK_TABLE_ROWS: TemplateListRow[] = [
  { id: '1', reference: '1042', date: '2026-03-12', client: 'Mohamed El-Sayed', persons: 4, destination: 'Luxor & Aswan', cost: 6757, currency: 'USD', stage: 'confirmed', owner: 'Ibrahim Mahmoud' },
  { id: '2', reference: '1041', date: '2026-03-10', client: 'Sarah Mitchell', persons: 2, destination: 'Cairo & Giza', cost: 4200, currency: 'USD', stage: 'proposal', owner: 'Ibrahim Mahmoud' },
  { id: '3', reference: '1040', date: '2026-03-08', client: 'Hassan Abdel Rahman', persons: 6, destination: 'Red Sea', cost: 122323, currency: 'USD', stage: 'upcoming', owner: 'Nadia El-Sayed' },
  { id: '4', reference: '1039', date: '2026-03-05', client: 'Emily Carter', persons: 3, destination: 'Alexandria', cost: 8900, currency: 'EUR', stage: 'confirmed', owner: 'Omar Farouk' },
  { id: '5', reference: '1038', date: '2026-03-02', client: 'Youssef Kamal', persons: 5, destination: 'Siwa Oasis', cost: 15400, currency: 'USD', stage: 'closed', owner: 'Rania Mostafa' },
  { id: '6', reference: '1037', date: '2026-02-28', client: 'Layla Mansour', persons: 2, destination: 'Sharm El Sheikh', cost: 9800, currency: 'USD', stage: 'proposal', owner: 'Tarek Samy' },
  { id: '7', reference: '1036', date: '2026-02-25', client: 'James Porter', persons: 8, destination: 'Cairo & Giza', cost: 22100, currency: 'USD', stage: 'confirmed', owner: 'Ibrahim Mahmoud' },
  { id: '8', reference: '1035', date: '2026-02-22', client: 'Nour Hamed', persons: 1, destination: 'Luxor & Aswan', cost: 3100, currency: 'EGP', stage: 'lost', owner: 'Ibrahim Mahmoud' },
  { id: '9', reference: '1034', date: '2026-02-18', client: 'Fatima Al-Zahra', persons: 4, destination: 'Red Sea', cost: 18750, currency: 'USD', stage: 'active', owner: 'Nadia El-Sayed' },
  { id: '10', reference: '1033', date: '2026-02-15', client: 'David Cohen', persons: 3, destination: 'Alexandria', cost: 7600, currency: 'USD', stage: 'proposal', owner: 'Omar Farouk' },
  { id: '11', reference: '1032', date: '2026-02-12', client: 'Amira Soliman', persons: 2, destination: 'Cairo & Giza', cost: 5400, currency: 'USD', stage: 'confirmed', owner: 'Rania Mostafa' },
  { id: '12', reference: '1031', date: '2026-02-08', client: 'Peter Novak', persons: 7, destination: 'Siwa Oasis', cost: 28900, currency: 'EUR', stage: 'closed', owner: 'Tarek Samy' },
]
