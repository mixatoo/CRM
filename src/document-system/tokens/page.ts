import { DOC_SPACE } from '@/document-system/tokens/spacing'

/** A4 page geometry — tight margins for maximum content area. */
export const DOC_PAGE = {
  format: 'a4' as const,
  widthMm: 210,
  heightMm: 297,
  marginTop: 8,
  marginRight: 7,
  marginBottom: 11,
  marginLeft: 7,
  footerHeight: DOC_SPACE.lg + DOC_SPACE.xs,
  accentBarHeight: 0.45,
} as const

/** HTML preview sheet width — keep in sync with invoice-document.css `--inv-sheet-width`. */
export const INVOICE_PREVIEW_SHEET_WIDTH_MM = DOC_PAGE.widthMm

export function docContentWidth(pageWidth: number = DOC_PAGE.widthMm) {
  return pageWidth - DOC_PAGE.marginLeft - DOC_PAGE.marginRight
}

/** Usable vertical band per page (excluding margins + footer). */
export function docContentHeight(pageHeight: number = DOC_PAGE.heightMm) {
  return pageHeight - DOC_PAGE.marginTop - DOC_PAGE.marginBottom - DOC_PAGE.footerHeight
}

/** Itinerary hero header — 10% of page height. */
export const ITINERARY_HEADER_HEIGHT_RATIO = 0.1

export function itineraryHeaderHeightMm(pageHeight: number = DOC_PAGE.heightMm) {
  return pageHeight * ITINERARY_HEADER_HEIGHT_RATIO
}
