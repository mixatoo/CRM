import { describe, expect, it } from 'vitest'
import type { ClientFormInput } from '@/features/clients/hooks/use-client-mutations'
import { EMPTY_CLIENT_FORM } from '@/features/clients/components/ClientProfileFields'
import { buildProfileSectionFocus } from '@/features/clients/utils/client-profile-aside'

function form(overrides: Partial<ClientFormInput> = {}): ClientFormInput {
  return { ...EMPTY_CLIENT_FORM, ...overrides }
}

describe('client-profile-aside', () => {
  it('summarizes filled contact channels and location', () => {
    const focus = buildProfileSectionFocus(
      'contact',
      form({
        email: 'traveler@email.com',
        phone: '+20 101 112 3344',
        city: 'Alexandria',
        country: 'EG',
        address: '61 Travel District',
      }),
    )

    expect(focus.insights.some((item) => item.text.includes('Email and phone'))).toBe(true)
    expect(focus.insights.some((item) => item.text.includes('Alexandria'))).toBe(true)
    expect(focus.insights.every((item) => item.kind === 'gap')).toBe(false)
  })

  it('flags missing contact channels', () => {
    const focus = buildProfileSectionFocus('contact', form())

    expect(focus.insights[0]).toEqual({
      kind: 'gap',
      text: 'Add email or phone so trip confirmations can be sent automatically.',
    })
  })

  it('adapts financial notes to billing setup', () => {
    const focus = buildProfileSectionFocus(
      'financial',
      form({
        preferredCurrency: 'EGP',
        billingAccount: 'credit',
        creditLimit: 0,
      }),
      { paymentTermName: 'Net 30' },
    )

    expect(focus.insights.some((item) => item.text.includes('EGP'))).toBe(true)
    expect(focus.insights.some((item) => item.text.includes('Net 30'))).toBe(true)
    expect(focus.insights.some((item) => item.text.includes('approved limit'))).toBe(true)
  })

  it('highlights basics ownership and acquisition gaps', () => {
    const focus = buildProfileSectionFocus('basics', form(), { accountManagerName: 'Sara Ali' })

    expect(focus.insights.some((item) => item.kind === 'gap' && item.text.includes('acquisition'))).toBe(
      true,
    )
    expect(focus.insights.some((item) => item.text.includes('account manager'))).toBe(true)
  })
})
