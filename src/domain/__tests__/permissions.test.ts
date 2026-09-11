import { describe, it, expect } from 'vitest'
import { canPerform } from '@/domain/policies/permissions'
import { getRoutePermission } from '@/domain/policies/route-permissions'

describe('permissions skeleton', () => {
  it('allows admin to read settings', () => {
    expect(canPerform('admin', 'settings', 'read')).toBe(true)
  })

  it('maps trips route to order read', () => {
    expect(getRoutePermission('/trips')).toEqual({ resource: 'order', action: 'read' })
  })
})
