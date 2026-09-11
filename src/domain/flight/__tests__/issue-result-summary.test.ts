import { describe, expect, it } from 'vitest'
import {
  buildIssueResultSummary,
  computeClientReceivable,
  computeNetSupplierCost,
  computeTicketFinancials,
  normalizeTicketPricing,
} from '@/domain/flight/financial'

describe('computeTicketFinancials', () => {
  it('uses all-in selling price without adding mark-up again', () => {
    const pricing = normalizeTicketPricing({
      currency: 'AED',
      exchangeRate: 1,
      fare: 99_999.85,
      taxes: 0,
      airlineFees: 0,
      supplierFees: 0,
      agencyServiceFees: 0,
      commission: 10_000,
      clientDiscount: 10_000,
      sellingPrice: 100_000,
    })
    const financials = computeTicketFinancials(pricing, [])

    expect(pricing.supplierCost).toBe(99_999.85)
    expect(computeClientReceivable(pricing)).toBe(90_000)
    expect(computeNetSupplierCost(pricing)).toBe(89_999.85)
    expect(financials.clientReceivable).toBe(90_000)
    expect(financials.netProfit).toBe(0.15)
  })

  it('derives list price from cost plus mark-up on the mark-up path', () => {
    const pricing = normalizeTicketPricing({
      currency: 'AED',
      exchangeRate: 1,
      fare: 99_999.85,
      taxes: 0,
      airlineFees: 0,
      supplierFees: 0,
      agencyServiceFees: 100_000,
      commission: 10_000,
      clientDiscount: 10_000,
      sellingPrice: 199_999.85,
    })
    const financials = computeTicketFinancials(pricing, [])

    expect(financials.clientReceivable).toBe(189_999.85)
    expect(financials.netProfit).toBe(100_000)
  })
})

describe('buildIssueResultSummary', () => {
  it('reconciles all-in selling price with commission and discount', () => {
    const pricing = normalizeTicketPricing({
      currency: 'EGP',
      exchangeRate: 1,
      fare: 1000,
      taxes: 100,
      airlineFees: 0,
      supplierFees: 0,
      agencyServiceFees: 0,
      commission: 100,
      clientDiscount: 150,
      sellingPrice: 1500,
    })
    const financials = computeTicketFinancials(pricing, [])

    const summary = buildIssueResultSummary(pricing, financials)

    expect(summary.supplierCost).toBe(1100)
    expect(summary.clientReceivable).toBe(1350)
    expect(summary.ticketSpread).toBe(400)
    expect(summary.markup).toBe(0)
    expect(summary.netProfit).toBe(350)
    expect(summary.marginOnCollectionPercent).toBe(25.93)
    expect(summary.ticketSpread + summary.commission - summary.clientDiscount).toBe(summary.netProfit)
  })

  it('reconciles mark-up path where selling price equals cost plus mark-up', () => {
    const pricing = normalizeTicketPricing({
      currency: 'EGP',
      exchangeRate: 1,
      fare: 1000,
      taxes: 100,
      airlineFees: 0,
      supplierFees: 0,
      agencyServiceFees: 100,
      commission: 100,
      clientDiscount: 150,
      sellingPrice: 1200,
    })
    const financials = computeTicketFinancials(pricing, [])

    const summary = buildIssueResultSummary(pricing, financials)

    expect(summary.clientReceivable).toBe(1050)
    expect(summary.netProfit).toBe(50)
    expect(summary.markup + summary.commission - summary.clientDiscount).toBe(summary.netProfit)
  })
})
