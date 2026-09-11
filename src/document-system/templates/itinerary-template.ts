import type { Trip } from '@/domain/entities'
import { ITINERARY_UNSCHEDULED_DAY_KEY } from '@/domain/entities/trip-itinerary-note'
import type { ItineraryDay, ItineraryEntry, TripItinerary } from '@/domain/trip/build-itinerary'
import { PdfDocument } from '@/document-system/engine/pdf-document'
import {
  renderCompactHeader,
  renderSectionTitle,
} from '@/document-system/primitives/layout'
import { renderItineraryHeader } from '@/document-system/primitives/itinerary-header'
import { DOC_SPACE } from '@/document-system/tokens/spacing'
import { DOC_TYPE, lineHeightMm } from '@/document-system/tokens/typography'
import {
  DEFAULT_INVOICE_COMPANY,
  type InvoiceCompanyProfile,
} from '@/features/trips/utils/invoice-document'
export function itineraryDaysForExport(days: ItineraryDay[]): ItineraryDay[] {
  return days
    .filter((day) => day.entries.length > 0)
    .map((day) => ({
      ...day,
      label:
        day.dayKey === ITINERARY_UNSCHEDULED_DAY_KEY
          ? 'Additional services'
          : day.dayNumber
            ? `Day ${day.dayNumber} · ${day.label}`
            : day.label,
    }))
}

function formatEntryProse(entry: ItineraryEntry): string {
  const parts = [entry.title.trim()]
  if (entry.subtitle?.trim()) parts.push(entry.subtitle.trim())
  if (entry.detail?.trim()) parts.push(entry.detail.trim())
  return parts.join(' — ')
}

function timeColumnWidth(ctx: PdfDocument, entries: ItineraryEntry[]): number {
  ctx.font('normal')
  ctx.doc.setFontSize(DOC_TYPE.caption)
  let maxW = ctx.doc.getTextWidth('All day')
  for (const entry of entries) {
    const label = entry.timeLabel?.trim() || 'All day'
    maxW = Math.max(maxW, ctx.doc.getTextWidth(label))
  }
  return Math.min(20, Math.max(12, maxW + 3))
}

function renderItineraryEntry(
  ctx: PdfDocument,
  entry: ItineraryEntry,
  timeColW: number,
) {
  const x = ctx.marginLeft
  const cardX = x + timeColW + DOC_SPACE.xs
  const cardW = ctx.contentWidth - timeColW - DOC_SPACE.xs
  const innerW = cardW - DOC_SPACE.sm * 2
  const prose = formatEntryProse(entry)
  const bodyLines = ctx.splitText(prose, innerW, DOC_TYPE.body)
  const categoryH = entry.categoryLabel && entry.kind !== 'note' ? 4 : 0
  const blockH = DOC_SPACE.sm * 2 + categoryH + bodyLines.length * lineHeightMm(DOC_TYPE.body)
  ctx.ensureSpace(blockH + DOC_SPACE.xs)

  const topY = ctx.cursorY

  ctx.font('normal')
  ctx.doc.setFontSize(DOC_TYPE.caption)
  ctx.setColor('subtle')
  const timeText = entry.timeLabel?.trim() || 'All day'
  ctx.doc.text(timeText, x + timeColW - 1, topY + DOC_SPACE.sm, { align: 'right' })

  const fillKey = entry.kind === 'note' ? 'accentSoft' : 'surface'
  ctx.setFillColor(fillKey)
  ctx.setDrawColor('borderLight')
  ctx.doc.setLineWidth(0.06)
  ctx.doc.roundedRect(cardX, topY, cardW, blockH, 2, 2, 'FD')

  let textY = topY + DOC_SPACE.sm
  if (entry.categoryLabel && entry.kind !== 'note') {
    ctx.font('bold')
    ctx.doc.setFontSize(DOC_TYPE.label)
    ctx.setColor('accentDeep')
    ctx.doc.text(entry.categoryLabel, cardX + DOC_SPACE.sm, textY)
    textY += 4
  }

  ctx.font(entry.kind === 'note' ? 'bold' : 'normal')
  ctx.doc.setFontSize(DOC_TYPE.body)
  ctx.setColor('ink')
  ctx.doc.text(bodyLines, cardX + DOC_SPACE.sm, textY)

  ctx.cursorY = topY + blockH + DOC_SPACE.xs
}

function renderItineraryDay(ctx: PdfDocument, day: ItineraryDay) {
  const timeColW = timeColumnWidth(ctx, day.entries)
  const labelAreaW =
    ctx.contentWidth - (day.dayNumber ? 16 : 0) - DOC_SPACE.md - 24

  ctx.ensureSpace(DOC_SPACE.lg)
  const headY = ctx.cursorY

  if (day.dayNumber) {
    ctx.setFillColor('accentSoft')
    ctx.setDrawColor('borderLight')
    ctx.doc.setLineWidth(0.06)
    const badgeW = 13
    ctx.doc.roundedRect(ctx.marginLeft, headY - 2.5, badgeW, 7.5, 1.5, 1.5, 'FD')
    ctx.font('bold')
    ctx.doc.setFontSize(DOC_TYPE.caption)
    ctx.setColor('accentDeep')
    ctx.doc.text(`D${day.dayNumber}`, ctx.marginLeft + badgeW / 2, headY + 2.2, { align: 'center' })
  }

  const labelX = day.dayNumber ? ctx.marginLeft + 16 : ctx.marginLeft
  ctx.font('bold')
  ctx.doc.setFontSize(DOC_TYPE.subheading)
  ctx.setColor('ink')
  const labelLines = ctx.splitText(day.label, labelAreaW, DOC_TYPE.subheading)
  ctx.doc.text(labelLines, labelX, headY + 2)

  ctx.font('normal')
  ctx.doc.setFontSize(DOC_TYPE.caption)
  ctx.setColor('muted')
  ctx.doc.text(
    `${day.entries.length} item${day.entries.length === 1 ? '' : 's'}`,
    ctx.pageWidth - ctx.marginRight,
    headY + 2,
    { align: 'right' },
  )

  ctx.cursorY = headY + Math.max(DOC_SPACE.md, labelLines.length * lineHeightMm(DOC_TYPE.subheading)) + DOC_SPACE.xs
  ctx.hairline()

  for (const entry of day.entries) {
    renderItineraryEntry(ctx, entry, timeColW)
  }

  ctx.gap('sm')
}

export interface ItineraryDocumentInput {
  trip: Trip
  itinerary: TripItinerary
  company?: InvoiceCompanyProfile
}

export function renderItineraryDocument(input: ItineraryDocumentInput): PdfDocument {
  const company = input.company ?? DEFAULT_INVOICE_COMPANY
  const { trip } = input
  const days = itineraryDaysForExport(input.itinerary.days)

  const ctx = new PdfDocument()
  ctx.setFooterMeta({
    left: company.website,
    right: company.phone,
    generatedBy: `Prepared by ${company.name}`,
  })

  ctx.setCompactHeader((compact) =>
    renderCompactHeader(compact, 'Travel Itinerary', trip.reference),
  )

  ctx.cursorY = 0
  renderItineraryHeader(ctx, {
    tripName: trip.name,
  })

  renderSectionTitle(ctx, {
    title: 'Schedule',
    subtitle: `${days.length} scheduled day${days.length === 1 ? '' : 's'}`,
  })

  if (days.length === 0) {
    ctx.textBlock({
      text: 'No scheduled items yet. Add dated services to build the itinerary.',
      color: 'muted',
    })
  } else {
    for (const day of days) {
      renderItineraryDay(ctx, day)
    }
  }

  return ctx
}

export function buildItineraryPdf(input: ItineraryDocumentInput) {
  return renderItineraryDocument(input).finish()
}

export function buildItineraryPdfBlob(input: ItineraryDocumentInput): Blob {
  return buildItineraryPdf(input).output('blob')
}
