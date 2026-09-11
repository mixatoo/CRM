import { describe, expect, it } from 'vitest'
import type { Client } from '@/domain/entities/client'
import { buildProfileWizardStepSections } from '@/features/clients/utils/client-profile-wizard-display'

const now = '2026-07-07T00:00:00.000Z'

function baseClient(overrides: Partial<Client>): Client {
  return {
    id: 'client-1',
    reference: 'CLT-0001',
    displayName: 'Placeholder',
    type: 'individual',
    status: 'active',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

describe('buildProfileWizardStepSections', () => {
  it('shows membership fields in form order when enrolled', () => {
    const sections = buildProfileWizardStepSections(
      'membership',
      baseClient({
        membership: 'member',
        membershipNumber: 'MEM-1001',
        membershipEnrolledAt: '2026-01-01',
        membershipExpiresAt: '2027-01-01',
        membershipNotes: 'Renewal agreed.',
      }),
    )

    expect(sections[0].fields.map((field) => field.label)).toEqual([
      'Membership',
      'Member number',
      'Start date',
      'End date',
      'Duration',
      'Notes',
    ])
  })

  it('shows commercial and tax blocks in form order', () => {
    const sections = buildProfileWizardStepSections(
      'commercial',
      baseClient({
        type: 'corporate',
        commercialRegistration: { registrationNumber: 'CR-123456' },
        taxRegistration: { taxId: 'TIN-123' },
      }),
    )

    expect(sections).toHaveLength(2)
    expect(sections[0].fields[0]).toEqual({
      label: 'Commercial register',
      value: 'Available',
    })
    expect(sections[1].fields[0]).toEqual({
      label: 'Tax card',
      value: 'Available',
    })
  })
})
