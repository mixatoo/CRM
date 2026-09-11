import type { PdfDocument } from '@/document-system/engine/pdf-document'
import { DOC_RGB, hexToRgb } from '@/document-system/tokens/colors'
import { itineraryHeaderHeightMm } from '@/document-system/tokens/page'

/** Creative itinerary header palette. */
export const ITINERARY_HEADER_COLOR = '#152238'
export const ITINERARY_HEADER_COLOR_DEEP = '#0b2e36'

const HEADER_BASE_RGB = hexToRgb(ITINERARY_HEADER_COLOR)
const HEADER_DEEP_RGB = hexToRgb(ITINERARY_HEADER_COLOR_DEEP)
const HEADER_ACCENT_RGB = DOC_RGB.accent
const HEADER_MINT_RGB = hexToRgb('#5eead4')
const HEADER_GLOW_RGB = hexToRgb('#1a4f58')
const HEADER_GOLD_RGB = hexToRgb('#c9a227')

export function drawItineraryHeaderBackground(ctx: PdfDocument, bandTop = 0) {
  const bandH = itineraryHeaderHeightMm(ctx.pageHeight)
  const midY = bandTop + bandH * 0.55

  ctx.doc.setFillColor(...HEADER_DEEP_RGB)
  ctx.doc.rect(0, bandTop, ctx.pageWidth, bandH, 'F')

  ctx.doc.setFillColor(...HEADER_BASE_RGB)
  ctx.doc.rect(0, bandTop, ctx.pageWidth, bandH * 0.62, 'F')

  ctx.doc.setFillColor(...HEADER_ACCENT_RGB)
  ctx.doc.rect(0, bandTop, 3.2, bandH, 'F')

  ctx.doc.setFillColor(...HEADER_MINT_RGB)
  ctx.doc.rect(3.2, bandTop, 0.65, bandH, 'F')

  ctx.doc.setFillColor(...HEADER_GLOW_RGB)
  ctx.doc.circle(ctx.pageWidth - 16, midY - 4, 14, 'F')
  ctx.doc.setFillColor(...HEADER_DEEP_RGB)
  ctx.doc.circle(ctx.pageWidth - 16, midY - 4, 9, 'F')

  ctx.doc.setFillColor(...HEADER_GLOW_RGB)
  ctx.doc.circle(28, bandTop + bandH - 5, 10, 'F')

  ctx.doc.setFillColor(...HEADER_GOLD_RGB)
  ctx.doc.circle(ctx.pageWidth - 42, bandTop + 7, 2.2, 'F')
  ctx.doc.circle(18, bandTop + 8, 1.6, 'F')
  ctx.doc.circle(ctx.pageWidth - 8, bandTop + bandH - 6, 1.4, 'F')

  ctx.doc.setDrawColor(...HEADER_MINT_RGB)
  ctx.doc.setLineWidth(0.08)
  for (let i = 0; i < 9; i++) {
    const x = 14 + i * 7.5
    ctx.doc.circle(x, bandTop + bandH - 2.2, 0.55, 'S')
  }
}

export function drawItineraryHeaderTripPill(
  ctx: PdfDocument,
  centerX: number,
  topY: number,
  width: number,
  height: number,
) {
  ctx.doc.setFillColor(255, 255, 255)
  ctx.doc.setDrawColor(...HEADER_MINT_RGB)
  ctx.doc.setLineWidth(0.1)
  ctx.doc.roundedRect(centerX - width / 2, topY, width, height, 2.5, 2.5, 'FD')
}
