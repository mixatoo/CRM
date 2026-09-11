import { describe, expect, it } from 'vitest'
import type { Traveler } from '@/domain/entities/traveler'
import { filterClientTravelers } from '@/features/travelers/utils/client-travelers-list'

function traveler(overrides: Partial<Traveler> & Pick<Traveler, 'id' | 'firstName' | 'lastName'>): Traveler {
  return {
    accountId: 'acc-1',
    reference: `TRV-${overrides.id.padStart(4, '0')}`,
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

const roster = [
  traveler({
    id: '1',
    firstName: 'Anna',
    lastName: 'Bergström',
    jobTitle: 'Program Manager',
    email: 'anna.bergstrom@nordicincentives.se',
    phone: '+46 70 882 1144',
  }),
  traveler({
    id: '2',
    firstName: 'Erik',
    lastName: 'Lindqvist',
    jobTitle: 'Head of Events',
    email: 'erik.lindqvist@nordicincentives.se',
    phone: '+46 70 441 2290',
  }),
]

describe('filterClientTravelers', () => {
  it('returns all travelers when query is empty', () => {
    expect(filterClientTravelers(roster, '  ')).toEqual(roster)
  })

  it('matches name, role, email, phone, and ID case-insensitively', () => {
    expect(filterClientTravelers(roster, 'berg').map((item) => item.id)).toEqual(['1'])
    expect(filterClientTravelers(roster, 'events').map((item) => item.id)).toEqual(['2'])
    expect(filterClientTravelers(roster, 'ERIK.LINDQVIST').map((item) => item.id)).toEqual(['2'])
    expect(filterClientTravelers(roster, '882').map((item) => item.id)).toEqual(['1'])
    expect(filterClientTravelers(roster, 'trv-0002').map((item) => item.id)).toEqual(['2'])
  })
})
