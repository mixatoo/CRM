import { describe, expect, it } from 'vitest'
import {
  allocateColumnWidths,
  invoiceTableColumnWidths,
  textWeight,
} from '@/document-system/layout/grid'
import { docContentWidth } from '@/document-system/tokens/page'

describe('layout grid', () => {
  it('allocates width by weight with min constraints', () => {
    const total = 180
    const cols = allocateColumnWidths(total, [
      { id: 'a', weight: 2, min: 40, max: 120 },
      { id: 'b', weight: 1, min: 20, max: 60 },
    ], 4)

    const sum = cols.reduce((s, c) => s + c.width, 0) + 4
    expect(sum).toBeCloseTo(total, 0)
    expect(cols[0].width).toBeGreaterThan(cols[1].width)
  })

  it('gives description column most invoice table width', () => {
    const w = invoiceTableColumnWidths(docContentWidth())
    const sum = w.description + w.qty + w.unitPrice + w.amount
    expect(sum).toBeCloseTo(docContentWidth(), 0)
    expect(w.description).toBeGreaterThan(w.qty * 3)
    expect(w.description).toBeGreaterThan(w.amount * 2)
  })

  it('weights long text higher than short text', () => {
    const short = textWeight('USD')
    const long = textWeight(
      'Grand Mediterranean & Nile Heritage Explorer — Multi-Country Cultural Immersion Program',
    )
    expect(long).toBeGreaterThan(short)
  })
})
