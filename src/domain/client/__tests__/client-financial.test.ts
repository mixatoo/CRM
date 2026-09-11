import { describe, expect, it } from 'vitest'
import {
  assertClientCreditAvailable,
  assertClientWithinCreditLimit,
  ClientCreditExceededError,
  resolveClientFinancialSummary,
  validateCreditAccountSetup,
} from '@/domain/client/client-financial'

describe('client-financial', () => {
  const creditClient = {
    status: 'active' as const,
    billingAccount: 'credit' as const,
    creditLimit: 100_000,
    preferredCurrency: 'EGP',
    paymentCurrencies: ['EGP'],
  }

  it('aggregates trip balances in the reporting currency using selling price', () => {
    const summary = resolveClientFinancialSummary(creditClient, [
      {
        totalCost: 80_000,
        totalSelling: 90_000,
        clientPaidAmount: 20_000,
        stage: 'confirmed',
        currency: 'EGP',
      },
    ])

    expect(summary.totalSales).toBe(90_000)
    expect(summary.totalPaid).toBe(20_000)
    expect(summary.outstandingBalance).toBe(70_000)
    expect(summary.availableCredit).toBe(30_000)
    expect(summary.reportingCurrency).toBe('EGP')
  })

  it('excludes lost trips from the account balance', () => {
    const summary = resolveClientFinancialSummary(creditClient, [
      {
        totalCost: 50_000,
        totalSelling: 50_000,
        clientPaidAmount: 0,
        stage: 'lost',
        currency: 'EGP',
      },
      {
        totalCost: 10_000,
        totalSelling: 10_000,
        clientPaidAmount: 5_000,
        stage: 'active',
        currency: 'EGP',
      },
    ])

    expect(summary.outstandingBalance).toBe(5_000)
  })

  it('requires a credit limit for credit accounts', () => {
    expect(() =>
      validateCreditAccountSetup({
        billingAccount: 'credit',
        creditLimit: 0,
      }),
    ).toThrow(/credit limit/)
  })

  it('blocks charges that exceed available credit', () => {
    expect(() =>
      assertClientCreditAvailable(
        creditClient,
        [
          {
            totalCost: 95_000,
            totalSelling: 95_000,
            clientPaidAmount: 10_000,
            stage: 'confirmed',
            currency: 'EGP',
          },
        ],
        20_000,
        'EGP',
      ),
    ).toThrow(ClientCreditExceededError)
  })

  it('rejects accounts already above the credit limit', () => {
    expect(() =>
      assertClientWithinCreditLimit(creditClient, [
        {
          totalCost: 120_000,
          totalSelling: 120_000,
          clientPaidAmount: 0,
          stage: 'confirmed',
          currency: 'EGP',
        },
      ]),
    ).toThrow(ClientCreditExceededError)
  })
})
