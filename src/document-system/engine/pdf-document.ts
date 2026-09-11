import { jsPDF } from 'jspdf'
import { PDF_FONT_FAMILY, registerPdfFonts } from '@/assets/fonts/baloo-bhaijaan-2-fonts'
import { DOC_RGB } from '@/document-system/tokens/colors'
import { DOC_PAGE, docContentWidth } from '@/document-system/tokens/page'
import { DOC_SPACE } from '@/document-system/tokens/spacing'
import { DOC_TYPE, lineHeightMm } from '@/document-system/tokens/typography'

export type PdfFontStyle = 'normal' | 'bold'

export interface PdfFooterMeta {
  left?: string
  center?: string
  right?: string
  generatedBy?: string
}

export class PdfDocument {
  readonly doc: jsPDF
  readonly fontFamily: string
  readonly pageWidth: number
  readonly pageHeight: number
  readonly contentWidth: number
  readonly marginLeft = DOC_PAGE.marginLeft
  readonly marginRight = DOC_PAGE.marginRight
  readonly marginTop = DOC_PAGE.marginTop
  readonly marginBottom = DOC_PAGE.marginBottom

  cursorY: number = DOC_PAGE.marginTop
  pageNumber = 1
  footerMeta: PdfFooterMeta = {}
  /** When true, skip the running page footer. */
  disableRunningFooter = false
  private compactHeader?: (ctx: PdfDocument) => number
  private runningFooterRenderer?: (ctx: PdfDocument) => void
  runningFooterHeight = 0

  constructor() {
    this.doc = new jsPDF({ unit: 'mm', format: DOC_PAGE.format, compress: true })
    this.fontFamily = this.resolveFont()
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.contentWidth = docContentWidth(this.pageWidth)
    this.paintPageBackground()
    this.drawTopAccent()
  }

  private resolveFont(): string {
    try {
      registerPdfFonts(this.doc)
      return PDF_FONT_FAMILY
    } catch {
      return 'helvetica'
    }
  }

  setFooterMeta(meta: PdfFooterMeta) {
    this.footerMeta = meta
  }

  setCompactHeader(renderer: (ctx: PdfDocument) => number) {
    this.compactHeader = renderer
  }

  setRunningFooter(renderer: (ctx: PdfDocument) => void, heightMm: number) {
    this.runningFooterRenderer = renderer
    this.runningFooterHeight = heightMm
  }

  private effectiveFooterHeight() {
    if (this.runningFooterRenderer) return this.runningFooterHeight
    if (this.disableRunningFooter) return 0
    return DOC_PAGE.footerHeight
  }

  private paintPageBackground() {
    this.doc.setFillColor(...DOC_RGB.paper)
    this.doc.rect(0, 0, this.pageWidth, this.pageHeight, 'F')
  }

  /** Thin accent line — subtle brand touch without heavy bar */
  private drawTopAccent() {
    this.doc.setFillColor(...DOC_RGB.accent)
    this.doc.rect(0, 0, this.pageWidth, DOC_PAGE.accentBarHeight, 'F')
  }

  font(style: PdfFontStyle = 'normal') {
    this.doc.setFont(this.fontFamily, style)
  }

  setColor(key: keyof typeof DOC_RGB) {
    this.doc.setTextColor(...DOC_RGB[key])
  }

  setDrawColor(key: keyof typeof DOC_RGB) {
    this.doc.setDrawColor(...DOC_RGB[key])
  }

  setFillColor(key: keyof typeof DOC_RGB) {
    this.doc.setFillColor(...DOC_RGB[key])
  }

  bottomLimit() {
    return this.pageHeight - this.marginBottom - this.effectiveFooterHeight()
  }

  remainingSpace() {
    return Math.max(0, this.bottomLimit() - this.cursorY)
  }

  /** Keep pageNumber aligned with jsPDF after jspdf-autotable page breaks. */
  syncDocPage() {
    const internal = this.doc.internal as typeof this.doc.internal & {
      getCurrentPageInfo?: () => { pageNumber: number }
    }
    const info = internal.getCurrentPageInfo?.()
    if (info) this.pageNumber = info.pageNumber
  }

  /** Bottom margin passed to jspdf-autotable page breaks. */
  tableBottomMargin() {
    return this.effectiveFooterHeight() + DOC_SPACE.sm
  }

  ensureSpace(heightMm: number) {
    if (this.cursorY + heightMm <= this.bottomLimit()) return
    this.newPage()
  }

  newPage() {
    this.doc.addPage()
    this.pageNumber += 1
    this.paintPageBackground()
    this.drawTopAccent()
    if (this.compactHeader) {
      this.cursorY = this.compactHeader(this)
    } else {
      this.cursorY = this.marginTop
    }
  }

  /** Compact header + top accent on continuation pages created by jspdf-autotable. */
  prepareAutoTableContinuationPage(pageNumber: number): number {
    this.pageNumber = pageNumber
    if (pageNumber <= 1) return this.marginTop

    this.paintPageBackground()
    this.drawTopAccent()
    return this.compactHeader ? this.compactHeader(this) : this.marginTop
  }

  autoTablePageHooks() {
    const ctx = this
    return {
      willDrawPage: (data: { pageNumber: number; settings: { margin: { top: number } } }) => {
        if (data.pageNumber > 1) {
          data.settings.margin.top = ctx.prepareAutoTableContinuationPage(data.pageNumber)
        }
      },
    }
  }

  stampRunningFooter() {
    if (this.runningFooterRenderer) {
      this.runningFooterRenderer(this)
      return
    }
    if (!this.disableRunningFooter) {
      this.drawFooter()
    }
  }

  drawFooter() {
    const footerTop = this.pageHeight - DOC_PAGE.footerHeight
    const y = footerTop + DOC_SPACE.sm

    this.setDrawColor('borderLight')
    this.doc.setLineWidth(0.1)
    this.doc.line(this.marginLeft, footerTop, this.pageWidth - this.marginRight, footerTop)

    this.font('normal')
    this.doc.setFontSize(DOC_TYPE.footer)
    this.setColor('subtle')

    const left = this.footerMeta.left ?? ''
    const center = this.footerMeta.center ?? `Page ${this.pageNumber}`
    const right = this.footerMeta.right ?? ''

    if (left) this.doc.text(left, this.marginLeft, y)
    if (center) this.doc.text(center, this.pageWidth / 2, y, { align: 'center' })
    if (right) this.doc.text(right, this.pageWidth - this.marginRight, y, { align: 'right' })

    if (this.footerMeta.generatedBy) {
      this.doc.setFontSize(DOC_TYPE.caption)
      this.setColor('subtle')
      this.doc.text(this.footerMeta.generatedBy, this.marginLeft, y + DOC_SPACE.xs + 2)
    }
  }

  finish() {
    const totalPages = this.doc.getNumberOfPages()
    for (let page = 1; page <= totalPages; page += 1) {
      this.doc.setPage(page)
      this.pageNumber = page
      this.stampRunningFooter()
    }
    return this.doc
  }

  splitText(text: string, maxWidth: number, fontSize: number = DOC_TYPE.body) {
    this.doc.setFontSize(fontSize)
    return this.doc.splitTextToSize(text, maxWidth) as string[]
  }

  measureTextHeight(text: string, maxWidth: number, fontSize: number, lineHeight?: number) {
    const lh = lineHeight ?? lineHeightMm(fontSize)
    const lines = this.splitText(text, maxWidth, fontSize)
    return lines.length * lh
  }

  textBlock(options: {
    text: string
    x?: number
    maxWidth?: number
    fontSize?: number
    style?: PdfFontStyle
    color?: keyof typeof DOC_RGB
    lineHeight?: number
  }) {
    const x = options.x ?? this.marginLeft
    const maxWidth = options.maxWidth ?? this.contentWidth
    const fontSize = options.fontSize ?? DOC_TYPE.body
    const lh = options.lineHeight ?? lineHeightMm(fontSize)

    this.ensureSpace(this.measureTextHeight(options.text, maxWidth, fontSize, lh))
    this.font(options.style ?? 'normal')
    this.doc.setFontSize(fontSize)
    this.setColor(options.color ?? 'inkSoft')

    const lines = this.splitText(options.text, maxWidth, fontSize)
    for (const line of lines) {
      this.doc.text(line, x, this.cursorY)
      this.cursorY += lh
    }
  }

  gap(size: keyof typeof DOC_SPACE = 'md') {
    this.cursorY += DOC_SPACE[size] as number
  }

  hairline(fullWidth = true) {
    this.ensureSpace(DOC_SPACE.xs)
    this.setDrawColor('borderLight')
    this.doc.setLineWidth(0.08)
    const x1 = fullWidth ? this.marginLeft : this.marginLeft
    const x2 = fullWidth ? this.pageWidth - this.marginRight : this.pageWidth - this.marginRight
    this.doc.line(x1, this.cursorY, x2, this.cursorY)
    this.cursorY += DOC_SPACE.sm
  }
}

export function formatDocMoney(amount: number, currency: string): string {
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${currency} ${formatted}`
}
