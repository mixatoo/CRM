import type { ClientGender, ClientMembership, ClientStatus, ClientType } from './domain-client'

export type ClientFormInput = {
  displayName: string
  firstName: string
  middleName: string
  lastName: string
  type: ClientType
  status: ClientStatus
  email: string
  phone: string
  company: string
  industry?: string
  jobTitle: string
  country: string
  city: string
  address: string
  preferredCurrency: string
  paymentCurrencies: string[]
  preferredLanguage: string
  preferredPaymentMethods: string[]
  paymentTermId?: string
  billingAccount: 'prepaid' | 'credit'
  creditLimit?: number
  sla?: string
  slaAgreement?: unknown
  market?: string
  segment: string
  customerTier?: string
  acquisitionSource?: string
  acquisitionChannel?: string
  dateOfBirth?: string
  gender?: ClientGender
  accountManagerId?: string
  membership: ClientMembership
  membershipNotes: string
  preferredDestination: string
  nationalityFocus: string
  billingNotes: string
  commercialRegistration?: unknown
  taxRegistration?: unknown
  notes: string
  joinedAt?: string
}
