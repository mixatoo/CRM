export type SupplierStatus = 'active' | 'inactive' | 'prospect'

export type SupplierCategory =
  | 'hotel'
  | 'dmc'
  | 'airline'
  | 'activity'
  | 'cruise'
  | 'restaurant'
  | 'insurance'
  | 'transport'
  | 'other'

export interface Supplier {
  id: string
  reference: string
  displayName: string
  category: SupplierCategory
  status: SupplierStatus
  contactName?: string
  email?: string
  phone?: string
  country?: string
  city?: string
  address?: string
  website?: string
  paymentTerms?: string
  preferredCurrency?: string
  billingNotes?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export const SUPPLIER_STATUSES: SupplierStatus[] = ['active', 'inactive', 'prospect']

export const SUPPLIER_STATUS_LABELS: Record<SupplierStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  prospect: 'Prospect',
}

export const SUPPLIER_CATEGORIES: SupplierCategory[] = [
  'hotel',
  'dmc',
  'airline',
  'activity',
  'cruise',
  'restaurant',
  'insurance',
  'transport',
  'other',
]

export const SUPPLIER_CATEGORY_LABELS: Record<SupplierCategory, string> = {
  hotel: 'Hotel',
  dmc: 'DMC',
  airline: 'Airline',
  activity: 'Activity',
  cruise: 'Cruise',
  restaurant: 'Restaurant',
  insurance: 'Insurance',
  transport: 'Transport',
  other: 'Other',
}

export function supplierPrimaryLabel(supplier: Pick<Supplier, 'displayName'>): string {
  return supplier.displayName.trim()
}
