import type { PdfDocument } from '@/document-system/engine/pdf-document'
import {
  allocateColumnWidths,
  combinedTextWeight,
} from '@/document-system/layout/grid'
import { DOC_SPACE } from '@/document-system/tokens/spacing'
import { DOC_TYPE, lineHeightMm } from '@/document-system/tokens/typography'

export type DocBadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger'

const BADGE_FILL: Record<DocBadgeTone, Parameters<PdfDocument['setFillColor']>[0]> = {
  neutral: 'surfaceAlt',
  accent: 'accentSoft',
  success: 'successSoft',
  warning: 'warningSoft',
  danger: 'dangerSoft',
}

const BADGE_TEXT: Record<DocBadgeTone, Parameters<PdfDocument['setColor']>[0]> = {
  neutral: 'muted',
  accent: 'accentDeep',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
}

export function drawBadge(
  ctx: PdfDocument,
  text: string,
  x: number,
  y: number,
  tone: DocBadgeTone = 'neutral',
  align: 'left' | 'center' | 'right' = 'right',
): number {
  ctx.font('bold')
  ctx.doc.setFontSize(DOC_TYPE.badge)
  const paddingX = 3.5
  const paddingY = 1.8
  const width = ctx.doc.getTextWidth(text) + paddingX * 2
  const height = DOC_TYPE.badge * 0.4 + paddingY * 2
  const rectX =
    align === 'center' ? x - width / 2 : align === 'left' ? x : x - width
  const textX = align === 'center' ? x : align === 'left' ? x + paddingX : x - width / 2

  ctx.setFillColor(BADGE_FILL[tone])
  ctx.setDrawColor('borderLight')
  ctx.doc.setLineWidth(0.06)
  ctx.doc.roundedRect(rectX, y - height + 2, width, height, 2.5, 2.5, 'FD')
  ctx.setColor(BADGE_TEXT[tone])
  ctx.doc.text(text, textX, y + 0.3, { align: align === 'center' ? 'center' : 'left' })

  return height
}

function headerInvoiceNumber(documentNumber?: string): string {
  return documentNumber?.replace(/^No\.\s*/i, '').trim() ?? ''
}

export interface DocHeaderInput {
  companyLogoUrl?: string
  companyName: string
  companyTagline?: string
  documentTitle: string
  documentNumber?: string
  reference?: string
  statusLabel?: string
  statusTone?: DocBadgeTone
  meta?: Array<{ label: string; value: string }>
}

function drawCompanyLogoSlot(
  ctx: PdfDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  logoUrl?: string,
) {
  ctx.setFillColor('surface')
  ctx.setDrawColor('border')
  ctx.doc.setLineWidth(0.1)
  const dash = (ctx.doc as typeof ctx.doc & { setLineDashPattern?: (d: number[], o: number) => void })
    .setLineDashPattern
  dash?.([1.1, 1.1], 0)
  ctx.doc.roundedRect(x, y, width, height, 1.5, 1.5, 'FD')
  dash?.([], 0)

  if (logoUrl?.trim()) {
    try {
      const format = logoUrl.includes('image/jpeg') || logoUrl.includes('image/jpg') ? 'JPEG' : 'PNG'
      ctx.doc.addImage(logoUrl, format, x + 0.7, y + 0.7, width - 1.4, height - 1.4, undefined, 'FAST')
      return
    } catch {
      // Show placeholder when the image cannot be embedded.
    }
  }

  ctx.font('normal')
  ctx.doc.setFontSize(DOC_TYPE.caption)
  ctx.setColor('muted')
  ctx.doc.text('Logo', x + width / 2, y + height / 2 + 0.5, { align: 'center' })
}

export function renderDocumentHeader(ctx: PdfDocument, input: DocHeaderInput): number {
  const accentH = 1.1
  const padX = ctx.marginLeft
  const padY = DOC_SPACE.sm
  const logoW = 26
  const logoH = 11
  const headerY = accentH
  const rightX = ctx.pageWidth - ctx.marginRight

  const brandTextX = padX + logoW + DOC_SPACE.sm
  const brandTextW = Math.max(52, rightX - 100 - brandTextX - DOC_SPACE.sm)

  ctx.font('bold')
  ctx.doc.setFontSize(DOC_TYPE.brandName)
  const nameLines = ctx.splitText(input.companyName, brandTextW, DOC_TYPE.brandName)
  let brandContentH = nameLines.length * lineHeightMm(DOC_TYPE.brandName)

  let tagLines: string[] = []
  if (input.companyTagline?.trim()) {
    ctx.font('normal')
    ctx.doc.setFontSize(DOC_TYPE.caption)
    tagLines = ctx.splitText(input.companyTagline, brandTextW, DOC_TYPE.caption)
    brandContentH += DOC_SPACE.xxs + tagLines.length * lineHeightMm(DOC_TYPE.caption)
  }

  const invoiceNum = headerInvoiceNumber(input.documentNumber)
  const titleFont = DOC_TYPE.documentTitle
  const numberFont = DOC_TYPE.subheading
  const metaGap = DOC_SPACE.xs

  ctx.font('bold')
  ctx.doc.setFontSize(titleFont)
  const titleText = input.documentTitle.toUpperCase()
  const titleW = ctx.doc.getTextWidth(titleText)
  const titleH = lineHeightMm(titleFont)

  ctx.font('bold')
  ctx.doc.setFontSize(numberFont)
  const numLines = invoiceNum
    ? (ctx.splitText(invoiceNum, 72, numberFont) as string[])
    : []
  const numW = numLines.reduce(
    (max, line) => Math.max(max, ctx.doc.getTextWidth(line)),
    0,
  )
  const numH = numLines.length * lineHeightMm(numberFont)

  let statusW = 0
  let statusH = 0
  if (input.statusLabel?.trim()) {
    ctx.font('bold')
    ctx.doc.setFontSize(DOC_TYPE.badge)
    statusW = ctx.doc.getTextWidth(input.statusLabel) + 7
    statusH = 7
  }

  const metaW = numW + (statusW > 0 ? metaGap + statusW : 0)
  const metaH = Math.max(numH, statusH)
  const docBlockW = Math.max(titleW, metaW)
  const docBlockH = titleH + DOC_SPACE.xxs + metaH

  const leftBlockH = Math.max(logoH, brandContentH)
  const bandH = Math.max(leftBlockH, docBlockH) + padY * 2

  ctx.setFillColor('brand')
  ctx.doc.rect(0, 0, ctx.pageWidth, accentH, 'F')

  ctx.setFillColor('paper')
  ctx.doc.rect(0, headerY, ctx.pageWidth, bandH, 'F')
  ctx.setDrawColor('borderLight')
  ctx.doc.setLineWidth(0.08)
  ctx.doc.line(0, headerY + bandH, ctx.pageWidth, headerY + bandH)

  const logoY = headerY + (bandH - logoH) / 2
  drawCompanyLogoSlot(ctx, padX, logoY, logoW, logoH, input.companyLogoUrl)

  const brandTextY = headerY + (bandH - brandContentH) / 2 + 2.8
  ctx.font('bold')
  ctx.doc.setFontSize(DOC_TYPE.brandName)
  ctx.setColor('brand')
  ctx.doc.text(nameLines, brandTextX, brandTextY)

  if (tagLines.length > 0) {
    ctx.font('normal')
    ctx.doc.setFontSize(DOC_TYPE.caption)
    ctx.setColor('muted')
    ctx.doc.text(
      tagLines,
      brandTextX,
      brandTextY + nameLines.length * lineHeightMm(DOC_TYPE.brandName) + DOC_SPACE.xxs,
    )
  }

  const docBlockTop = headerY + (bandH - docBlockH) / 2
  const titleY = docBlockTop + titleH * 0.82
  ctx.font('bold')
  ctx.doc.setFontSize(titleFont)
  ctx.setColor('brand')
  ctx.doc.text(titleText, rightX, titleY, { align: 'right' })

  const titleLeft = rightX - titleW
  const metaLeft = titleLeft + Math.max(0, (titleW - metaW) / 2)
  const metaTop = docBlockTop + titleH + DOC_SPACE.xxs
  const metaCenterY = metaTop + metaH / 2

  if (numLines.length > 0) {
    ctx.font('bold')
    ctx.doc.setFontSize(numberFont)
    ctx.setColor('ink')
    const numY = metaCenterY - (numH - lineHeightMm(numberFont)) / 2 + lineHeightMm(numberFont) * 0.75
    ctx.doc.text(numLines, metaLeft, numY)
  }

  if (input.reference?.trim()) {
    ctx.font('normal')
    ctx.doc.setFontSize(DOC_TYPE.caption)
    ctx.setColor('muted')
    const refLines = ctx.splitText(input.reference, docBlockW, DOC_TYPE.caption)
    ctx.doc.text(refLines, rightX, docBlockTop + docBlockH + DOC_SPACE.xxs, { align: 'right' })
  }

  if (input.statusLabel?.trim()) {
    const statusX = metaLeft + numW + (numW > 0 ? metaGap : 0) + statusW
    drawBadge(
      ctx,
      input.statusLabel,
      statusX,
      metaCenterY + 1.5,
      input.statusTone ?? 'neutral',
      'right',
    )
  }

  ctx.cursorY = headerY + bandH + DOC_SPACE.sm

  if (input.meta && input.meta.length > 0) {
    renderMetaStrip(ctx, input.meta)
  }

  ctx.gap('xs')
  return ctx.cursorY
}

function renderMetaStrip(ctx: PdfDocument, meta: Array<{ label: string; value: string }>) {
  const items = meta.slice(0, 4)
  const cellW = ctx.pageWidth / items.length
  const padX = ctx.marginLeft
  const padY = DOC_SPACE.sm
  let metaH = padY * 2 + DOC_SPACE.sm

  for (let i = 0; i < items.length; i++) {
    const innerW = cellW - padX * 2
    const valueLines = ctx.splitText(items[i].value, innerW, DOC_TYPE.subheading)
    const cellH = DOC_SPACE.sm + 3.5 + valueLines.length * lineHeightMm(DOC_TYPE.subheading)
    metaH = Math.max(metaH, padY * 2 + cellH)
  }

  const metaY = ctx.cursorY
  ctx.setFillColor('surface')
  ctx.doc.rect(0, metaY, ctx.pageWidth, metaH, 'F')
  ctx.setDrawColor('borderLight')
  ctx.doc.setLineWidth(0.06)
  ctx.doc.line(0, metaY + metaH, ctx.pageWidth, metaY + metaH)

  for (let i = 1; i < items.length; i += 1) {
    const dividerX = cellW * i
    ctx.doc.line(dividerX, metaY, dividerX, metaY + metaH)
  }

  for (let i = 0; i < items.length; i++) {
    const cellX = cellW * i + padX
    const innerW = cellW - padX * 2

    ctx.font('bold')
    ctx.doc.setFontSize(DOC_TYPE.label)
    ctx.setColor('subtle')
    ctx.doc.text(items[i].label, cellX, metaY + padY + DOC_SPACE.sm)

    ctx.font('normal')
    ctx.doc.setFontSize(DOC_TYPE.subheading)
    ctx.setColor('ink')
    const valueLines = ctx.splitText(items[i].value, innerW, DOC_TYPE.subheading)
    ctx.doc.text(valueLines, cellX, metaY + padY + DOC_SPACE.sm + 3.5)
  }

  ctx.cursorY = metaY + metaH + DOC_SPACE.sm
}

export function renderCompactHeader(ctx: PdfDocument, title: string, reference?: string): number {
  const y = ctx.marginTop + DOC_SPACE.xxs
  ctx.font('bold')
  ctx.doc.setFontSize(DOC_TYPE.subheading)
  ctx.setColor('ink')
  ctx.doc.text(title, ctx.marginLeft, y)

  if (reference?.trim()) {
    ctx.font('normal')
    ctx.doc.setFontSize(DOC_TYPE.caption)
    ctx.setColor('subtle')
    const refLines = ctx.splitText(reference, ctx.contentWidth * 0.55, DOC_TYPE.caption)
    ctx.doc.text(refLines, ctx.pageWidth - ctx.marginRight, y, { align: 'right' })
  }

  ctx.cursorY = y + DOC_SPACE.md
  ctx.hairline()
  return ctx.cursorY
}

export interface DocSectionInput {
  title: string
  subtitle?: string
}

export function renderSectionTitle(ctx: PdfDocument, input: DocSectionInput) {
  ctx.ensureSpace(DOC_SPACE.lg)
  ctx.font('bold')
  ctx.doc.setFontSize(DOC_TYPE.sectionTitle)
  ctx.setColor('ink')
  ctx.doc.text(input.title, ctx.marginLeft, ctx.cursorY)
  ctx.cursorY += DOC_SPACE.xs + 1

  if (input.subtitle?.trim()) {
    ctx.font('normal')
    ctx.doc.setFontSize(DOC_TYPE.caption)
    ctx.setColor('muted')
    ctx.doc.text(input.subtitle, ctx.pageWidth - ctx.marginRight, ctx.cursorY - DOC_SPACE.xs - 1, {
      align: 'right',
    })
    ctx.cursorY += DOC_SPACE.xs
  }
}

export interface DocInfoCard {
  title: string
  name: string
  lines: string[]
}

function measureInfoCard(ctx: PdfDocument, card: DocInfoCard, width: number): number {
  const pad = DOC_SPACE.sm
  const innerW = width - pad * 2
  const nameLines = ctx.splitText(card.name, innerW, DOC_TYPE.bodyLarge)
  let h = pad + DOC_SPACE.sm + 3 + nameLines.length * lineHeightMm(DOC_TYPE.bodyLarge) + DOC_SPACE.xxs

  for (const line of card.lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const lines = ctx.splitText(trimmed, innerW, DOC_TYPE.body)
    h += lines.length * lineHeightMm(DOC_TYPE.body)
  }

  return h + pad
}

export function renderInfoCards(ctx: PdfDocument, cards: DocInfoCard[]) {
  const items = cards.slice(0, 3)
  if (items.length === 0) return

  const gap = DOC_SPACE.sm
  const specs = items.map((card, index) => {
    const texts = [card.title, card.name, ...card.lines]
    const weight = combinedTextWeight(texts, 26)
    const isClient = card.title.toLowerCase().includes('to')
    return {
      id: `card-${index}`,
      weight: isClient ? weight * 1.2 : weight,
      min: 44,
      max: ctx.contentWidth * (items.length === 2 ? 0.62 : 0.45),
    }
  })

  const cols = allocateColumnWidths(ctx.contentWidth, specs, gap)
  const startY = ctx.cursorY
  const heights = items.map((card, i) => measureInfoCard(ctx, card, cols[i].width))
  const rowH = Math.max(...heights)

  ctx.ensureSpace(rowH + DOC_SPACE.sm)

  let x = ctx.marginLeft
  for (let i = 0; i < items.length; i++) {
    const card = items[i]
    const cardW = cols[i].width
    const pad = DOC_SPACE.sm
    const innerW = cardW - pad * 2

    ctx.setFillColor('surface')
    ctx.setDrawColor('borderLight')
    ctx.doc.setLineWidth(0.06)
    ctx.doc.roundedRect(x, startY, cardW, rowH, 2, 2, 'FD')

    let y = startY + pad
    ctx.font('bold')
    ctx.doc.setFontSize(DOC_TYPE.label)
    ctx.setColor('accentDeep')
    ctx.doc.text(card.title, x + pad, y)
    y += DOC_SPACE.sm + 2

    ctx.font('bold')
    ctx.doc.setFontSize(DOC_TYPE.bodyLarge)
    ctx.setColor('ink')
    const nameLines = ctx.splitText(card.name, innerW, DOC_TYPE.bodyLarge)
    ctx.doc.text(nameLines, x + pad, y)
    y += nameLines.length * lineHeightMm(DOC_TYPE.bodyLarge) + DOC_SPACE.xxs

    ctx.font('normal')
    ctx.doc.setFontSize(DOC_TYPE.body)
    ctx.setColor('inkSoft')
    for (const line of card.lines) {
      const trimmed = line.trim()
      if (!trimmed) continue
      const lines = ctx.splitText(trimmed, innerW, DOC_TYPE.body)
      ctx.doc.text(lines, x + pad, y)
      y += lines.length * lineHeightMm(DOC_TYPE.body)
    }

    x += cardW + gap
  }

  ctx.cursorY = startY + rowH + DOC_SPACE.md
}
