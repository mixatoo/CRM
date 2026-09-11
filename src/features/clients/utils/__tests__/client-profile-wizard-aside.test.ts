import { describe, expect, it } from 'vitest'
import type { ClientFormInput } from '@/features/clients/hooks/use-client-mutations'
import { EMPTY_CLIENT_FORM } from '@/features/clients/components/ClientProfileFields'
import {
  resolveWizardDisplayName,
  resolveWizardNameInitials,
  resolveWizardStepGuide,
} from '@/features/clients/utils/client-profile-wizard-aside'

function form(overrides: Partial<ClientFormInput> = {}): ClientFormInput {
  return { ...EMPTY_CLIENT_FORM, ...overrides }
}

describe('client-profile-wizard-aside', () => {
  it('builds display name from first and last name', () => {
    expect(
      resolveWizardDisplayName(
        form({
          firstName: 'Ibrahim',
          lastName: 'Mohamed',
        }),
      ),
    ).toBe('Ibrahim Mohamed')
  })

  it('derives initials from display name', () => {
    expect(resolveWizardNameInitials('Ibrahim Mohamed')).toBe('IM')
  })

  it('explains the active step instead of repeating field values', () => {
    const guide = resolveWizardStepGuide(
      form({
        firstName: 'Ibrahim',
        lastName: 'Mohamed',
        gender: 'male',
        acquisitionSource: 'phone_inquiry',
        dateOfBirth: '1989-02-15',
      }),
      'basics',
    )

    expect(guide.title).toBe('Account identity')
    expect(guide.summary).toContain('display name')
    expect(guide.points.some((point) => point.includes('contact'))).toBe(true)
    expect(guide.points.some((point) => point.includes('37'))).toBe(false)
    expect(guide.points.some((point) => point.includes('Male'))).toBe(false)
  })

  it('adapts contact guide when email is missing', () => {
    const guide = resolveWizardStepGuide(form({ phone: '+20 100 000 0000' }), 'contact')

    expect(guide.summary).toContain('confirmations')
    expect(guide.points.some((point) => point.includes('Email'))).toBe(true)
  })
})
