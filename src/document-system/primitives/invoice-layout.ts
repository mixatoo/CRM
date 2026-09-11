import { autoTable } from 'jspdf-autotable'
import type { PdfDocument } from '@/document-system/engine/pdf-document'
import { formatInvoiceLineProse } from '@/document-system/content/service-prose'
import { invoiceLineTableColumnWidths } from '@/document-system/layout/grid'
import type { DocTotalsRow } from '@/document-system/primitives/table'
import { DOC_RGB } from '@/document-system/tokens/colors'
import { DOC_SPACE } from '@/document-system/tokens/spacing'
import { DOC_TYPE, lineHeightMm } from '@/document-system/tokens/typography'
import {
  formatInvoiceAmountValue,
  type InvoiceDocumentData,
} from '@/features/trips/utils/invoice-document'

interface BillToRow {
  label: string
  value: string
  emphasize?: boolean
}

function billToRows(document: InvoiceDocumentData): BillToRow[] {
  return [
    { label: 'Client', value: document.clientName, emphasize: true },
    { label: 'Email', value: document.clientEmail ?? '' },
    { label: 'Trip ref', value: document.trip.reference },
    { label: 'Trip name', value: document.trip.name },
    { label: 'Destination', value: document.trip.destination ?? '' },
  ].filter((row) => row.value.trim())
}

function measureMultilineText(
  ctx: PdfDocument,
  text: string,
  maxWidth: number,
  fontSize: number,
  paragraphGap = DOC_SPACE.xs,
): number {
  const paragraphs = text.split(/\n\n+/).map((part) => part.trim()).filter(Boolean)
  if (paragraphs.length === 0) return 0

  return paragraphs.reduce((height, paragraph, index) => {
    const lines = ctx.splitText(paragraph, maxWidth, fontSize)
    const block = lines.length * lineHeightMm(fontSize)
    return height + block + (index < paragraphs.length - 1 ? paragraphGap : 0)
  }, 0)
}

function drawMultilineText(
  ctx: PdfDocument,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number,
  paragraphGap = DOC_SPACE.xs,
): number {
  const paragraphs = text.split(/\n\n+/).map((part) => part.trim()).filter(Boolean)
  let cursor = y

  for (let index = 0; index < paragraphs.length; index += 1) {
    const lines = ctx.splitText(paragraphs[index], maxWidth, fontSize)
    ctx.doc.text(lines, x, cursor)
    cursor += lines.length * lineHeightMm(fontSize)
    if (index < paragraphs.length - 1) cursor += paragraphGap
  }

  return cursor
}

function strokeBox(ctx: PdfDocument, x: number, y: number, width: number, height: number) {
  ctx.setDrawColor('borderLight')
  ctx.doc.setLineWidth(0.06)
  ctx.doc.roundedRect(x, y, width, height, 2, 2, 'S')
}

function billToLabelWidth(ctx: PdfDocument, rows: BillToRow[]): number {
  ctx.font('bold')
  ctx.doc.setFontSize(DOC_TYPE.caption)
  let maxW = 18
  for (const row of rows) {
    maxW = Math.max(maxW, ctx.doc.getTextWidth(row.label) + 5)
  }
  return Math.min(28, Math.max(22, maxW))
}

export function renderBillToBlock(ctx: PdfDocument, document: InvoiceDocumentData) {
  const rows = billToRows(document)
  if (rows.length === 0) return

  const labelW = billToLabelWidth(ctx, rows)
  const tableW = ctx.contentWidth
  const body = rows.map((row) => [row.label, row.value])
  const estimatedH = 7 + rows.length * 8

  ctx.ensureSpace(estimatedH + DOC_SPACE.md)
  const top = ctx.cursorY

  autoTable(ctx.doc, {
    startY: top,
    head: [['Billed to', '']],
    body,
    tableWidth: tableW,
    theme: 'plain',
    styles: {
      font: ctx.fontFamily,
      fontSize: DOC_TYPE.body,
      cellPadding: { top: 3, right: 3.5, bottom: 3, left: 3.5 },
      textColor: DOC_RGB.inkSoft,
      lineColor: DOC_RGB.borderLight,
      lineWidth: 0.05,
      valign: 'top',
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: DOC_RGB.brand,
      textColor: DOC_RGB.white,
      fontStyle: 'bold',
      fontSize: DOC_TYPE.label,
      cellPadding: { top: 2.5, right: 3.5, bottom: 2.5, left: 3.5 },
    },
    columnStyles: {
      0: {
        cellWidth: labelW,
        fillColor: DOC_RGB.surface,
        textColor: DOC_RGB.muted,
        fontStyle: 'bold',
        fontSize: DOC_TYPE.caption,
      },
      1: {
        cellWidth: tableW - labelW,
        fillColor: DOC_RGB.paper,
      },
    },
    margin: { left: ctx.marginLeft, right: ctx.marginRight },
    didParseCell: (data) => {
      if (data.section !== 'body') return
      const row = rows[data.row.index]
      if (row?.emphasize) {
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.textColor = DOC_RGB.ink
        data.cell.styles.fontSize = DOC_TYPE.bodyLarge
      }
      if (data.row.index % 2 === 1) {
        data.cell.styles.fillColor = data.column.index === 0 ? DOC_RGB.surfaceAlt : DOC_RGB.canvas
      }
    },
  })

  const finalY = (ctx.doc as typeof ctx.doc & { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY
  if (finalY != null) {
    strokeBox(ctx, ctx.marginLeft, top, tableW, finalY - top)
  }
  ctx.syncDocPage()
  ctx.cursorY = (finalY ?? top + estimatedH) + DOC_SPACE.md
}

export function renderTripSummaryBar(ctx: PdfDocument, document: InvoiceDocumentData) {
  const travelersLabel = `${document.trip.totalTravelers} guest${document.trip.totalTravelers === 1 ? '' : 's'} (${document.trip.adults} adult${document.trip.adults === 1 ? '' : 's'}${document.trip.minors > 0 ? `, ${document.trip.minors} minor${document.trip.minors === 1 ? '' : 's'}` : ''})`

  const parts = [
    `Ref ${document.trip.reference}`,
    document.trip.travelDatesLabel,
    document.trip.destination,
    travelersLabel,
    document.trip.ownerName ? `Owner: ${document.trip.ownerName}` : '',
  ].filter(Boolean)

  const padX = DOC_SPACE.sm
  const innerW = ctx.contentWidth - padX * 2
  const summaryText = parts.join(' · ')
  const barH = ctx.measureTextHeight(summaryText, innerW, DOC_TYPE.body) + DOC_SPACE.sm * 2

  ctx.ensureSpace(barH + DOC_SPACE.md)
  const top = ctx.cursorY

  ctx.setFillColor('accentSoft')
  ctx.setDrawColor('accent')
  ctx.doc.setLineWidth(0.08)
  ctx.doc.roundedRect(ctx.marginLeft, top, ctx.contentWidth, barH, 2, 2, 'FD')

  ctx.font('bold')
  ctx.doc.setFontSize(DOC_TYPE.caption)
  ctx.setColor('accentDeep')
  const prefix = 'Trip · '
  const prefixW = ctx.doc.getTextWidth(prefix)

  ctx.font('normal')
  ctx.doc.setFontSize(DOC_TYPE.body)
  ctx.setColor('accentDeep')
  const lines = ctx.splitText(summaryText, innerW - prefixW, DOC_TYPE.body)
  const textY = top + DOC_SPACE.sm + 3.5
  ctx.font('bold')
  ctx.doc.setFontSize(DOC_TYPE.caption)
  ctx.doc.text(prefix, ctx.marginLeft + padX, textY)
  ctx.font('normal')
  ctx.doc.setFontSize(DOC_TYPE.body)
  ctx.doc.text(lines, ctx.marginLeft + padX + prefixW, textY)

  ctx.cursorY = top + barH + DOC_SPACE.md
}

function measureSummaryPanelWidth(ctx: PdfDocument, rows: DocTotalsRow[]): number {
  const pad = DOC_SPACE.sm * 2
  let maxInner = 44

  for (const row of rows) {
    ctx.font('normal')
    ctx.doc.setFontSize(row.tone === 'grand' ? DOC_TYPE.totalLabel : DOC_TYPE.totalLabel)
    const labelW = ctx.doc.getTextWidth(row.label)
    ctx.font('bold')
    ctx.doc.setFontSize(row.tone === 'grand' ? DOC_TYPE.grandTotal : DOC_TYPE.totalAmount)
    const valueW = ctx.doc.getTextWidth(row.value)
    maxInner = Math.max(maxInner, labelW + valueW + DOC_SPACE.md)
  }

  return Math.min(ctx.contentWidth * 0.42, Math.max(56, maxInner + pad))
}

export function renderInvoiceLineItems(ctx: PdfDocument, document: InvoiceDocumentData) {
  const widths = invoiceLineTableColumnWidths(ctx.contentWidth)
  const lineCount = document.lineItems.length
  const top = ctx.cursorY

  ctx.ensureSpace(DOC_SPACE.lg + 10)

  if (document.lineItems.length === 0) {
    ctx.setFillColor('canvas')
    ctx.doc.roundedRect(ctx.marginLeft, top, ctx.contentWidth, 8, 2, 2, 'F')
    ctx.font('bold')
    ctx.doc.setFontSize(DOC_TYPE.sectionTitle)
    ctx.setColor('brand')
    ctx.doc.text('Line items', ctx.marginLeft + DOC_SPACE.sm, top + 5.2)
    ctx.cursorY = top + 10
    ctx.textBlock({ text: 'No line items on this invoice.', fontSize: DOC_TYPE.body, color: 'muted' })
    ctx.gap('sm')
    return
  }

  const headerH = 7
  ctx.setFillColor('canvas')
  ctx.doc.roundedRect(ctx.marginLeft, top, ctx.contentWidth, headerH, 2, 2, 'F')
  ctx.font('bold')
  ctx.doc.setFontSize(DOC_TYPE.sectionTitle)
  ctx.setColor('brand')
  ctx.doc.text('Line items', ctx.marginLeft + DOC_SPACE.sm, top + 4.8)
  ctx.font('normal')
  ctx.doc.setFontSize(DOC_TYPE.caption)
  ctx.setColor('muted')
  ctx.doc.text(
    `${lineCount} ${lineCount === 1 ? 'item' : 'items'}`,
    ctx.pageWidth - ctx.marginRight - DOC_SPACE.sm,
    top + 4.8,
    { align: 'right' },
  )

  const head = [['#', 'Description', 'Qty', 'Unit price', 'Amount']]
  const body = document.lineItems.map((line, index) => [
    String(index + 1),
    formatInvoiceLineProse(line),
    String(line.quantity),
    formatInvoiceAmountValue(line.unitAmount),
    formatInvoiceAmountValue(line.amount),
  ])

  autoTable(ctx.doc, {
    startY: top + headerH,
    head,
    body,
    tableWidth: ctx.contentWidth,
    styles: {
      font: ctx.fontFamily,
      fontSize: DOC_TYPE.tableBody,
      cellPadding: { top: 3.5, right: 3, bottom: 3.5, left: 3 },
      textColor: DOC_RGB.inkSoft,
      lineColor: DOC_RGB.borderLight,
      lineWidth: 0.05,
      valign: 'top',
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: DOC_RGB.brand,
      textColor: DOC_RGB.white,
      fontStyle: 'bold',
      fontSize: DOC_TYPE.tableHead,
    },
    alternateRowStyles: { fillColor: DOC_RGB.canvas },
    bodyStyles: { fillColor: DOC_RGB.paper },
    columnStyles: {
      0: { cellWidth: widths.index, halign: 'center' },
      1: { cellWidth: widths.description, halign: 'left' },
      2: { cellWidth: widths.qty, halign: 'right' },
      3: { cellWidth: widths.unitPrice, halign: 'right' },
      4: { cellWidth: widths.amount, halign: 'right', fontStyle: 'bold', textColor: DOC_RGB.ink },
    },
    theme: 'plain',
    rowPageBreak: 'avoid',
    margin: {
      left: ctx.marginLeft,
      right: ctx.marginRight,
      bottom: ctx.tableBottomMargin(),
    },
    ...ctx.autoTablePageHooks(),
  })

  const finalY = (ctx.doc as typeof ctx.doc & { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY
  if (finalY != null) {
    strokeBox(ctx, ctx.marginLeft, top, ctx.contentWidth, finalY - top)
  }
  ctx.syncDocPage()
  ctx.cursorY = (finalY ?? ctx.cursorY) + DOC_SPACE.sm
}

function measureSummaryBlock(rows: DocTotalsRow[]): number {
  const bodyH = rows.reduce((h, row) => h + (row.tone === 'grand' ? 12 : 7), 0)
  return 7 + bodyH + DOC_SPACE.xs
}

function drawSummaryPanel(
  ctx: PdfDocument,
  rows: DocTotalsRow[],
  startY: number,
  panelW: number,
  panelX = ctx.pageWidth - ctx.marginRight - panelW,
) {
  const panelH = measureSummaryBlock(rows)

  ctx.setFillColor('brand')
  ctx.doc.roundedRect(panelX, startY, panelW, 7, 2, 2, 'F')
  ctx.font('bold')
  ctx.doc.setFontSize(DOC_TYPE.label)
  ctx.setColor('white')
  ctx.doc.text('Summary', panelX + DOC_SPACE.sm, startY + 4.8)

  ctx.setFillColor('paper')
  ctx.setDrawColor('borderLight')
  ctx.doc.setLineWidth(0.06)
  ctx.doc.roundedRect(panelX, startY + 7, panelW, panelH - 7, 2, 2, 'FD')

  let y = startY + 7 + DOC_SPACE.xs
  for (const row of rows) {
    if (row.tone === 'grand') {
      ctx.setFillColor('accentSoft')
      ctx.doc.roundedRect(panelX + 2, y, panelW - 4, 10.5, 1.5, 1.5, 'F')
      ctx.font('bold')
      ctx.doc.setFontSize(DOC_TYPE.totalLabel)
      ctx.setColor('accentDeep')
      ctx.doc.text(row.label, panelX + DOC_SPACE.sm, y + 6.5)
      ctx.doc.setFontSize(DOC_TYPE.grandTotal)
      ctx.setColor('ink')
      ctx.doc.text(row.value, panelX + panelW - DOC_SPACE.sm, y + 6.5, { align: 'right' })
      y += 12
      continue
    }

    ctx.font('normal')
    ctx.doc.setFontSize(DOC_TYPE.totalLabel)
    ctx.setColor('muted')
    ctx.doc.text(row.label, panelX + DOC_SPACE.sm, y + 4)
    ctx.font('bold')
    ctx.setColor(row.tone === 'success' ? 'success' : 'inkSoft')
    ctx.doc.text(row.value, panelX + panelW - DOC_SPACE.sm, y + 4, { align: 'right' })
    y += 7
  }

  strokeBox(ctx, panelX, startY, panelW, panelH)
  return startY + panelH
}

function measureNotesBoxHeight(ctx: PdfDocument, body: string, boxW: number): number {
  const innerW = boxW - DOC_SPACE.sm * 2
  return (
    DOC_SPACE.sm * 2 +
    DOC_SPACE.xs +
    measureMultilineText(ctx, body, innerW, DOC_TYPE.body) +
    DOC_SPACE.xs
  )
}

function drawNotesBox(
  ctx: PdfDocument,
  notes: { title: string; body: string },
  startY: number,
  boxW: number,
  boxH: number,
) {
  const innerW = boxW - DOC_SPACE.sm * 2

  ctx.setFillColor('canvas')
  ctx.setDrawColor('borderLight')
  ctx.doc.setLineWidth(0.06)
  ctx.doc.roundedRect(ctx.marginLeft, startY, boxW, boxH, 2, 2, 'FD')
  ctx.setFillColor('accent')
  ctx.doc.rect(ctx.marginLeft, startY, 1.2, boxH, 'F')

  ctx.font('bold')
  ctx.doc.setFontSize(DOC_TYPE.sectionTitle)
  ctx.setColor('brand')
  ctx.doc.text(notes.title, ctx.marginLeft + DOC_SPACE.sm, startY + DOC_SPACE.sm)

  ctx.font('normal')
  ctx.doc.setFontSize(DOC_TYPE.body)
  ctx.setColor('inkSoft')
  drawMultilineText(
    ctx,
    notes.body,
    ctx.marginLeft + DOC_SPACE.sm,
    startY + DOC_SPACE.sm + DOC_SPACE.xs + 1,
    innerW,
    DOC_TYPE.body,
  )
  strokeBox(ctx, ctx.marginLeft, startY, boxW, boxH)
}

export function renderInvoiceBottom(
  ctx: PdfDocument,
  notes: { title: string; body: string },
  rows: DocTotalsRow[],
) {
  const gap = DOC_SPACE.sm
  const hasNotes = notes.body.trim().length > 0
  const summaryH = measureSummaryBlock(rows)
  const panelW = hasNotes ? measureSummaryPanelWidth(ctx, rows) : ctx.contentWidth

  ctx.gap('sm')

  if (hasNotes) {
    const notesW = ctx.contentWidth - panelW - gap
    const notesH = measureNotesBoxHeight(ctx, notes.body, notesW)
    const rowH = Math.max(notesH, summaryH)

    if (ctx.remainingSpace() >= rowH + DOC_SPACE.xs) {
      ctx.ensureSpace(rowH + DOC_SPACE.xs)
      const startY = ctx.cursorY
      drawNotesBox(ctx, notes, startY, notesW, notesH)
      drawSummaryPanel(ctx, rows, startY, panelW, ctx.pageWidth - ctx.marginRight - panelW)
      ctx.cursorY = startY + rowH + DOC_SPACE.sm
      return
    }
  }

  // Summary directly under line items — small block, place before tall notes.
  ctx.ensureSpace(summaryH + DOC_SPACE.xs)
  const summaryY = ctx.cursorY
  const summaryX = hasNotes ? ctx.pageWidth - ctx.marginRight - panelW : ctx.marginLeft
  const summaryBottom = drawSummaryPanel(ctx, rows, summaryY, panelW, summaryX)
  ctx.cursorY = summaryBottom + DOC_SPACE.sm

  if (!hasNotes) return

  const fullNotesW = ctx.contentWidth
  const fullNotesH = measureNotesBoxHeight(ctx, notes.body, fullNotesW)

  ctx.ensureSpace(fullNotesH + DOC_SPACE.xs)
  const notesY = ctx.cursorY
  drawNotesBox(ctx, notes, notesY, fullNotesW, fullNotesH)
  ctx.cursorY = notesY + fullNotesH + DOC_SPACE.sm
}

export function renderTermsBlock(ctx: PdfDocument, title: string, body: string) {
  if (!body.trim()) return

  const innerW = ctx.contentWidth - DOC_SPACE.sm * 2
  const textH = measureMultilineText(ctx, body, innerW, DOC_TYPE.body)
  const boxH = DOC_SPACE.sm * 2 + DOC_SPACE.xs + textH

  ctx.gap('sm')
  ctx.ensureSpace(boxH + DOC_SPACE.xs)
  const top = ctx.cursorY

  ctx.setFillColor('paper')
  ctx.setDrawColor('borderLight')
  ctx.doc.setLineWidth(0.06)
  ctx.doc.roundedRect(ctx.marginLeft, top, ctx.contentWidth, boxH, 2, 2, 'FD')

  ctx.font('bold')
  ctx.doc.setFontSize(DOC_TYPE.label)
  ctx.setColor('muted')
  ctx.doc.text(title, ctx.marginLeft + DOC_SPACE.sm, top + DOC_SPACE.sm)

  ctx.font('normal')
  ctx.doc.setFontSize(DOC_TYPE.body)
  ctx.setColor('muted')
  drawMultilineText(
    ctx,
    body,
    ctx.marginLeft + DOC_SPACE.sm,
    top + DOC_SPACE.sm + DOC_SPACE.xs + 1,
    innerW,
    DOC_TYPE.body,
  )

  strokeBox(ctx, ctx.marginLeft, top, ctx.contentWidth, boxH)
  ctx.cursorY = top + boxH + DOC_SPACE.sm
}

function invoiceFooterContactWidth(ctx: PdfDocument): number {
  const thanks = 'Thank you for your business.'
  ctx.font('bold')
  ctx.doc.setFontSize(DOC_TYPE.body)
  const thanksW = ctx.doc.getTextWidth(thanks)
  return Math.max(40, ctx.contentWidth - thanksW - DOC_SPACE.sm)
}

export function measureInvoiceClosingBandHeight(
  ctx: PdfDocument,
  document: InvoiceDocumentData,
): number {
  const contactParts = [
    document.company.website,
    document.company.email,
    document.company.phone,
    document.company.taxRegistration ? `Tax ID: ${document.company.taxRegistration}` : '',
  ].filter(Boolean)

  const contactLine = contactParts.join(' | ')
  const padY = DOC_SPACE.sm
  const contactW = invoiceFooterContactWidth(ctx)

  ctx.font('bold')
  ctx.doc.setFontSize(DOC_TYPE.body)
  const thanksLineH = lineHeightMm(DOC_TYPE.body)

  ctx.font('normal')
  ctx.doc.setFontSize(DOC_TYPE.caption)
  const contactLines = ctx.splitText(contactLine, contactW, DOC_TYPE.caption)
  const contactBlockH = contactLines.length * lineHeightMm(DOC_TYPE.caption)

  return padY * 2 + Math.max(thanksLineH, contactBlockH)
}

export function drawInvoiceClosingBand(
  ctx: PdfDocument,
  document: InvoiceDocumentData,
  top: number,
) {
  const contactParts = [
    document.company.website,
    document.company.email,
    document.company.phone,
    document.company.taxRegistration ? `Tax ID: ${document.company.taxRegistration}` : '',
  ].filter(Boolean)

  const contactLine = contactParts.join(' | ')
  const padX = ctx.marginLeft
  const padY = DOC_SPACE.sm
  const contactW = invoiceFooterContactWidth(ctx)

  ctx.font('normal')
  ctx.doc.setFontSize(DOC_TYPE.caption)
  const contactLines = ctx.splitText(contactLine, contactW, DOC_TYPE.caption)
  const bandH = measureInvoiceClosingBandHeight(ctx, document)

  ctx.setFillColor('brand')
  ctx.doc.rect(0, top, ctx.pageWidth, bandH, 'F')

  ctx.font('bold')
  ctx.doc.setFontSize(DOC_TYPE.body)
  ctx.setColor('white')
  ctx.doc.text('Thank you for your business.', padX, top + padY + 3)

  ctx.font('normal')
  ctx.doc.setFontSize(DOC_TYPE.caption)
  ctx.setColor('white')
  ctx.doc.text(contactLines, ctx.pageWidth - ctx.marginRight, top + padY + 3, {
    align: 'right',
    maxWidth: contactW,
  })
}

export function renderInvoiceClosingBand(ctx: PdfDocument, document: InvoiceDocumentData) {
  const bandH = measureInvoiceClosingBandHeight(ctx, document)

  ctx.gap('md')
  ctx.ensureSpace(bandH)
  drawInvoiceClosingBand(ctx, document, ctx.cursorY)
  ctx.cursorY += bandH
}
