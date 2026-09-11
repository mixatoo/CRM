/**
 * Content-aware column width allocation for PDF layouts.
 * Distributes available width by weight with min/max guards.
 */

export interface LayoutColumnSpec {
  id: string
  /** Relative importance — higher gets more width when space is tight. */
  weight: number
  min: number
  max: number
}

export interface LayoutColumnResult {
  id: string
  width: number
}

export function allocateColumnWidths(
  totalWidth: number,
  columns: LayoutColumnSpec[],
  gap = 0,
): LayoutColumnResult[] {
  if (columns.length === 0) return []

  const gaps = gap * Math.max(0, columns.length - 1)
  let available = totalWidth - gaps

  const mins = columns.map((c) => c.min)
  const minSum = mins.reduce((a, b) => a + b, 0)

  if (minSum >= available) {
    const scale = available / minSum
    return columns.map((col, i) => ({ id: col.id, width: mins[i] * scale }))
  }

  const widths = [...mins]
  available -= minSum

  const weightSum = columns.reduce((sum, col) => sum + col.weight, 0) || 1
  const extra = columns.map((col) => (available * col.weight) / weightSum)

  for (let i = 0; i < columns.length; i++) {
    widths[i] += extra[i]
    widths[i] = Math.min(widths[i], columns[i].max)
  }

  let used = widths.reduce((a, b) => a + b, 0) + gaps
  let remainder = totalWidth - used

  if (remainder > 0.1) {
    const growable = columns
      .map((col, i) => ({ i, room: col.max - widths[i] }))
      .filter((g) => g.room > 0.1)
    if (growable.length > 0) {
      const growWeight = growable.reduce((s, g) => s + columns[g.i].weight, 0) || 1
      for (const g of growable) {
        const add = Math.min(g.room, (remainder * columns[g.i].weight) / growWeight)
        widths[g.i] += add
        remainder -= add
      }
    }
    if (remainder > 0.1) {
      const weightSum = columns.reduce((sum, col) => sum + col.weight, 0) || 1
      for (let i = 0; i < columns.length; i++) {
        widths[i] += (remainder * columns[i].weight) / weightSum
      }
    }
  }

  return columns.map((col, i) => ({ id: col.id, width: widths[i] }))
}

/** Estimate layout weight from text length (proxy for wrap lines). */
export function textWeight(text: string, charsPerLine = 28): number {
  const trimmed = text.trim()
  if (!trimmed) return 0.25
  return Math.max(1, Math.ceil(trimmed.length / charsPerLine))
}

export function combinedTextWeight(texts: string[], charsPerLine = 28): number {
  return texts.reduce((sum, t) => sum + textWeight(t, charsPerLine), 0)
}

export interface InvoiceTableWidths {
  description: number
  qty: number
  unitPrice: number
  amount: number
}

export interface InvoiceLineTableWidths extends InvoiceTableWidths {
  index: number
}

/** Invoice line table — description absorbs all remaining width. */
export function invoiceTableColumnWidths(contentWidth: number): InvoiceTableWidths {
  const qty = 9
  const unitPrice = 22
  const amount = 24
  const description = contentWidth - qty - unitPrice - amount
  return { description, qty, unitPrice, amount }
}

/** Invoice PDF line table with index column — always spans full content width. */
export function invoiceLineTableColumnWidths(contentWidth: number): InvoiceLineTableWidths {
  const index = 7
  const qty = 9
  const unitPrice = 22
  const amount = 24
  const description = contentWidth - index - qty - unitPrice - amount
  return { index, description, qty, unitPrice, amount }
}
