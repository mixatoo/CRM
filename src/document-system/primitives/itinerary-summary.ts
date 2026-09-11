import type { PdfDocument } from '@/document-system/engine/pdf-document'
import { allocateColumnWidths, textWeight } from '@/document-system/layout/grid'
import { DOC_SPACE } from '@/document-system/tokens/spacing'
import { DOC_TYPE, lineHeightMm } from '@/document-system/tokens/typography'

export interface ItineraryTripSummaryInput {
  travelDates: string
  destination: string
  client: string
  travelers: string
}

interface FactsItem {
  label: string
  value: string
  weight: number
  min: number
}

function measureFactsHeight(
  ctx: PdfDocument,
  items: FactsItem[],
  widths: number[],
  padX: number,
  padY: number,
): number {
  let maxH = padY * 2 + DOC_SPACE.sm + 2
  for (let i = 0; i < items.length; i++) {
    const innerW = widths[i] - padX * 2
    const labelH = lineHeightMm(DOC_TYPE.label)
    const valueLines = ctx.splitText(items[i].value, innerW, DOC_TYPE.body)
    const cellH = padY + DOC_SPACE.sm + labelH + 2 + valueLines.length * lineHeightMm(DOC_TYPE.body) + padY
    maxH = Math.max(maxH, cellH)
  }
  return maxH
}

/** Trip facts — single horizontal strip with dividers (boarding-pass style). */
export function renderItineraryTripSummary(ctx: PdfDocument, input: ItineraryTripSummaryInput) {
  const items: FactsItem[] = [
    {
      label: 'Travel dates',
      value: input.travelDates,
      weight: Math.max(1.2, textWeight(input.travelDates, 24)),
      min: 38,
    },
    {
      label: 'Destination',
      value: input.destination,
      weight: Math.max(0.75, textWeight(input.destination, 18)),
      min: 28,
    },
    {
      label: 'Client',
      value: input.client,
      weight: Math.max(0.9, textWeight(input.client, 20)),
      min: 32,
    },
    {
      label: 'Travelers',
      value: input.travelers,
      weight: Math.max(0.85, textWeight(input.travelers, 20)),
      min: 30,
    },
  ]

  const specs = items.map((item, index) => ({
    id: `fact-${index}`,
    weight: item.weight,
    min: item.min,
    max: ctx.contentWidth * 0.42,
  }))
  const cols = allocateColumnWidths(ctx.contentWidth, specs, 0)
  const widths = cols.map((c) => c.width)

  const padX = DOC_SPACE.sm + 1
  const padY = DOC_SPACE.sm
  const accentH = 0.9
  const blockH = measureFactsHeight(ctx, items, widths, padX, padY) + accentH

  ctx.ensureSpace(blockH + DOC_SPACE.sm)
  const startY = ctx.cursorY + DOC_SPACE.xxs
  const x0 = ctx.marginLeft

  ctx.setFillColor('accentSoft')
  ctx.setDrawColor('borderLight')
  ctx.doc.setLineWidth(0.06)
  ctx.doc.roundedRect(x0, startY, ctx.contentWidth, blockH, 2.5, 2.5, 'FD')

  ctx.setFillColor('accent')
  ctx.doc.roundedRect(x0, startY, ctx.contentWidth, accentH, 2.5, 0, 'F')

  let x = x0
  for (let i = 0; i < items.length; i++) {
    const w = widths[i]
    const textX = x + padX
    const innerW = w - padX * 2
    let textY = startY + accentH + padY + DOC_SPACE.sm

    if (i > 0) {
      ctx.setDrawColor('border')
      ctx.doc.setLineWidth(0.05)
      ctx.doc.line(x, startY + accentH + 3, x, startY + blockH - 3)
    }

    ctx.font('bold')
    ctx.doc.setFontSize(DOC_TYPE.label)
    ctx.setColor('accentDeep')
    ctx.doc.text(items[i].label.toUpperCase(), textX, textY)
    textY += lineHeightMm(DOC_TYPE.label) + 2

    ctx.font('normal')
    ctx.doc.setFontSize(DOC_TYPE.body)
    ctx.setColor('ink')
    const valueLines = ctx.splitText(items[i].value, innerW, DOC_TYPE.body)
    ctx.doc.text(valueLines, textX, textY)

    x += w
  }

  ctx.cursorY = startY + blockH + DOC_SPACE.xs
}
