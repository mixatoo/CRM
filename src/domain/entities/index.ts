export type UserRole =
  | 'admin'
  | 'operations'
  | 'finance'
  | 'sales'
  | 'management'
  | 'readonly'
  | 'guest'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  initials: string
  isActive: boolean
  lastLoginAt?: string
}

export interface AppSettings {
  id: string
  companyName: string
  defaultCurrency: string
  sessionTimeoutMinutes?: number
  seededAt?: string
  tripServicesMockVersion?: number
  tripsMockVersion?: number
  clientsDirectoryVersion?: number
  suppliersDirectoryVersion?: number
  transfersDirectoryVersion?: number
  financeSeedVersion?: number
  remindersDirectoryVersion?: number
  activitySeedVersion?: number
  invoiceSeedVersion?: number
  tripStageRecentVersion?: number
  paymentTermsDirectoryVersion?: number
  labelsDirectoryVersion?: number
  clientOperationalSeedVersion?: number
  showcaseClientSeedVersion?: number
}

export * from './client'
export * from './supplier'
export * from './reminder'
export * from './trip'
export * from './trip-service'
export * from './trip-service-category-details'
export * from './trip-service-flight'
export * from './invoice'
export * from './payment-term'
export * from './label'
export * from './client-credit-card'
export * from './client-service-fee'
export * from './traveler'
export * from './transfer'
