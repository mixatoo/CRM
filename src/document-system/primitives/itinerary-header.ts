import type { PdfDocument } from '@/document-system/engine/pdf-document'
import {
  drawItineraryHeaderBackground,
  drawItineraryHeaderTripPill,
} from '@/document-system/primitives/itinerary-header-band'
import { DOC_RGB } from '@/document-system/tokens/colors'
import { DOC_SPACE } from '@/document-system/tokens/spacing'
import { itineraryHeaderHeightMm } from '@/document-system/tokens/page'
import { lineHeightMm } from '@/document-system/tokens/typography'

export interface ItineraryHeaderInput {
  tripName: string
}

/** Content box inside the hero band. */
export interface ItineraryHeaderContentArea {
  x: number
  y: number
  width: number
  height: number
}

const HEADER_KICKER_SIZE = 8
const HEADER_TITLE_SIZE = 22
const HEADER_TRIP_NAME_SIZE = 9.5
const TITLE_STACK_GAP = 1.2
const PILL_PAD_X = 5
const PILL_PAD_Y = 2.2

function setHeaderTextRgb(ctx: PdfDocument, rgb: [number, number, number]) {
  ctx.doc.setTextColor(...rgb)
}

export function getItineraryHeaderContentArea(ctx: PdfDocument): ItineraryHeaderContentArea {
  const bandH = itineraryHeaderHeightMm(ctx.pageHeight)
  const padX = ctx.marginLeft + DOC_SPACE.sm + 2
  const padY = DOC_SPACE.xs
  return {
    x: padX,
    y: padY,
    width: ctx.contentWidth - DOC_SPACE.sm * 2 - 2,
    height: bandH - padY * 2,
  }
}

/** Creative header — stacked title, glow shapes, trip pill. */
export function renderItineraryHeader(ctx: PdfDocument, input: ItineraryHeaderInput): number {
  const bandH = itineraryHeaderHeightMm(ctx.pageHeight)
  const bandTop = 0
  const area = getItineraryHeaderContentArea(ctx)

  ctx.cursorY = bandTop
  drawItineraryHeaderBackground(ctx, bandTop)

  const centerX = area.x + area.width / 2
  const kickerLineH = lineHeightMm(HEADER_KICKER_SIZE)
  const titleLineH = lineHeightMm(HEADER_TITLE_SIZE)
  const subtitleLineH = lineHeightMm(HEADER_TRIP_NAME_SIZE)

  ctx.font('bold')
  ctx.doc.setFontSize(HEADER_TRIP_NAME_SIZE)
  const tripName = input.tripName.trim() || '—'
  const tripNameLines = ctx.splitText(tripName, area.width * 0.72, HEADER_TRIP_NAME_SIZE)
  const pillTextW = Math.max(...tripNameLines.map((line) => ctx.doc.getTextWidth(line)))
  const pillW = Math.min(area.width * 0.82, pillTextW + PILL_PAD_X * 2)
  const pillH = tripNameLines.length * subtitleLineH + PILL_PAD_Y * 2

  const blockH = kickerLineH + TITLE_STACK_GAP + titleLineH + 3.5 + pillH
  const kickerY = area.y + (area.height - blockH) / 2 + kickerLineH * 0.75

  ctx.font('bold')
  ctx.doc.setFontSize(HEADER_KICKER_SIZE)
  setHeaderTextRgb(ctx, DOC_RGB.accentSoft)
  ctx.doc.text('TRAVEL', centerX, kickerY, { align: 'center' })

  const titleY = kickerY + kickerLineH + TITLE_STACK_GAP
  ctx.doc.setFontSize(HEADER_TITLE_SIZE)
  setHeaderTextRgb(ctx, DOC_RGB.white)
  ctx.doc.text('ITINERARY', centerX, titleY + titleLineH * 0.72, { align: 'center' })

  const pillTopY = titleY + titleLineH + 3
  drawItineraryHeaderTripPill(ctx, centerX, pillTopY, pillW, pillH)

  ctx.font('bold')
  ctx.doc.setFontSize(HEADER_TRIP_NAME_SIZE)
  setHeaderTextRgb(ctx, hexToInk())
  let textY = pillTopY + PILL_PAD_Y + subtitleLineH * 0.78
  for (const line of tripNameLines) {
    ctx.doc.text(line, centerX, textY, { align: 'center' })
    textY += subtitleLineH
  }

  ctx.cursorY = bandTop + bandH + DOC_SPACE.xs
  return ctx.cursorY
}

function hexToInk(): [number, number, number] {
  return [21, 34, 56]
}
