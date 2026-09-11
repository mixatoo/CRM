import { describe, expect, it } from 'vitest'
import { computeReissuePreview } from '@/domain/flight/ticket'
import type { FlightTicket } from '@/domain/flight/types'

const ticket = { pricing: { currency: 'EGP' } } as FlightTicket

describe('computeReissuePreview', () => {
  it('collects airline delta plus agency fees from the client', () => {
    const preview = computeReissuePreview(ticket, {
      fareDifference: 80,
      taxDifference: 20,
      reissuePenalty: 50,
      supplierFees: 10,
      agencyFees: 30,
    })

    expect(preview.amountToCollect).toBe(190)
    expect(preview.amountToPay).toBe(0)
    expect(preview.profit).toBe(30)
  })

  it('pays the client when the airline delta is negative', () => {
    const preview = computeReissuePreview(ticket, {
      fareDifference: -100,
      taxDifference: 0,
      reissuePenalty: 0,
      supplierFees: 0,
      agencyFees: 30,
    })

    expect(preview.amountToCollect).toBe(0)
    expect(preview.amountToPay).toBe(100)
    expect(preview.profit).toBe(-70)
  })

  it('still collects agency fees when the airline delta is negative but smaller than the fee', () => {
    const preview = computeReissuePreview(ticket, {
      fareDifference: -20,
      taxDifference: 0,
      reissuePenalty: 0,
      supplierFees: 0,
      agencyFees: 50,
    })

    expect(preview.amountToCollect).toBe(30)
    expect(preview.amountToPay).toBe(20)
    expect(preview.profit).toBe(30)
  })
})
