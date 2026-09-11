import { describe, expect, it } from 'vitest'
import { normalizeClientFormInput } from '@/domain/entities/client'
import {
  getClientDashboardAccountFields,
  isClientFieldVisibleForType,
  stripClientFieldsForType,
} from '@/domain/entities/client-field-visibility'
import { EMPTY_CLIENT_FORM, clientToFormInput } from '@/features/clients/components/ClientProfileFields'
import type { Client } from '@/domain/entities/client'

describe('client field visibility', () => {
  it('classifies existing profile fields by client type', () => {
    expect(isClientFieldVisibleForType('firstName', 'individual')).toBe(true)
    expect(isClientFieldVisibleForType('firstName', 'corporate')).toBe(false)
    expect(isClientFieldVisibleForType('company', 'corporate')).toBe(true)
    expect(isClientFieldVisibleForType('company', 'individual')).toBe(false)
    expect(isClientFieldVisibleForType('industry', 'corporate')).toBe(true)
    expect(isClientFieldVisibleForType('industry', 'individual')).toBe(false)
    expect(isClientFieldVisibleForType('email', 'individual')).toBe(true)
    expect(isClientFieldVisibleForType('email', 'corporate')).toBe(true)
    expect(isClientFieldVisibleForType('commercialRegistration', 'corporate')).toBe(true)
    expect(isClientFieldVisibleForType('commercialRegistration', 'individual')).toBe(false)
    expect(isClientFieldVisibleForType('dateOfBirth', 'individual')).toBe(true)
    expect(isClientFieldVisibleForType('dateOfBirth', 'corporate')).toBe(false)
  })

  it('hides Industry on the individual dashboard account section', () => {
    expect(getClientDashboardAccountFields('individual')).toEqual([
      'accountManager',
      'source',
      'email',
      'phone',
      'location',
    ])
    expect(getClientDashboardAccountFields('corporate')).toContain('industry')
    expect(getClientDashboardAccountFields('individual')).not.toContain('industry')
  })

  it('strips corporate identity fields from individual form state', () => {
    const stripped = stripClientFieldsForType(
      {
        ...EMPTY_CLIENT_FORM,
        type: 'individual',
        company: 'Acme Holdings',
        industry: 'finance',
        commercialRegistration: { registrationNumber: 'CR-1' },
      },
      'individual',
    )

    expect(stripped.company).toBe('')
    expect(stripped.industry).toBeUndefined()
    expect(stripped.commercialRegistration).toBeUndefined()
  })

  it('strips individual identity fields from corporate form state', () => {
    const stripped = stripClientFieldsForType(
      {
        ...EMPTY_CLIENT_FORM,
        type: 'corporate',
        firstName: 'Nour',
        lastName: 'Hamed',
        dateOfBirth: '1990-01-01',
        gender: 'female',
        jobTitle: 'Travel Manager',
      },
      'corporate',
    )

    expect(stripped.firstName).toBe('')
    expect(stripped.lastName).toBe('')
    expect(stripped.dateOfBirth).toBeUndefined()
    expect(stripped.gender).toBeUndefined()
    expect(stripped.jobTitle).toBe('')
  })
})

describe('normalizeClientFormInput type isolation', () => {
  it('does not persist corporate fields when creating an individual client', () => {
    const normalized = normalizeClientFormInput({
      ...EMPTY_CLIENT_FORM,
      type: 'individual',
      firstName: 'Nour',
      lastName: 'Hamed',
      displayName: 'Nour Hamed',
      company: 'Leaked Corp',
      industry: 'finance',
      commercialRegistration: { registrationNumber: 'CR-99' },
      taxRegistration: { taxId: 'TIN-99' },
    })

    expect(normalized.company).toBe('')
    expect(normalized.industry).toBeUndefined()
    expect(normalized.commercialRegistration).toBeUndefined()
    expect(normalized.taxRegistration).toBeUndefined()
    expect(normalized.firstName).toBe('Nour')
    expect(normalized.lastName).toBe('Hamed')
  })

  it('does not persist individual fields when creating a corporate client', () => {
    const normalized = normalizeClientFormInput({
      ...EMPTY_CLIENT_FORM,
      type: 'corporate',
      company: 'Acme Holdings',
      displayName: 'Acme Holdings',
      firstName: 'Leaked',
      lastName: 'Name',
      dateOfBirth: '1985-05-05',
      gender: 'male',
      jobTitle: 'Travel Manager',
    })

    expect(normalized.company).toBe('Acme Holdings')
    expect(normalized.firstName).toBe('')
    expect(normalized.lastName).toBe('')
    expect(normalized.dateOfBirth).toBeUndefined()
    expect(normalized.gender).toBeUndefined()
    expect(normalized.jobTitle).toBe('')
  })
})

describe('clientToFormInput type isolation', () => {
  const now = '2026-07-07T00:00:00.000Z'

  it('loads only individual profile fields for an individual client record', () => {
    const form = clientToFormInput({
      id: '1',
      reference: 'CLT-0001',
      type: 'individual',
      status: 'active',
      displayName: 'Nour Hamed',
      firstName: 'Nour',
      lastName: 'Hamed',
      company: 'Leaked Corp',
      industry: 'finance',
      segment: 'Leisure traveler',
      createdAt: now,
      updatedAt: now,
    })

    expect(form.firstName).toBe('Nour')
    expect(form.company).toBe('')
    expect(form.industry).toBeUndefined()
  })

  it('loads only corporate profile fields for a corporate client record', () => {
    const form = clientToFormInput({
      id: '2',
      reference: 'CLT-0002',
      type: 'corporate',
      status: 'active',
      displayName: 'Acme Holdings',
      company: 'Acme Holdings',
      industry: 'finance',
      firstName: 'Leaked',
      lastName: 'Name',
      dateOfBirth: '1985-05-05',
      gender: 'male',
      createdAt: now,
      updatedAt: now,
    } satisfies Client)

    expect(form.company).toBe('Acme Holdings')
    expect(form.industry).toBe('finance')
    expect(form.firstName).toBe('')
    expect(form.lastName).toBe('')
    expect(form.dateOfBirth).toBeUndefined()
    expect(form.gender).toBeUndefined()
  })
})
