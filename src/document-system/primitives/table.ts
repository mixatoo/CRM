import { autoTable } from 'jspdf-autotable'
import type { PdfDocument } from '@/document-system/engine/pdf-document'
import {
  allocateColumnWidths,
  invoiceTableColumnWidths,
} from '@/document-system/layout/grid'
import { DOC_RGB } from '@/document-system/tokens/colors'
import { DOC_PAGE } from '@/document-system/tokens/page'
import { DOC_SPACE } from '@/document-system/tokens/spacing'
import { DOC_TYPE, lineHeightMm } from '@/document-system/tokens/typography'

export interface DocTableColumn {
  header: string
  width?: number | 'auto'
  align?: 'left' | 'right' | 'center'
  /** Relative width when using auto distribution (default 1). */
  weight?: number
}

export interface DocTableRow {
  cells: string[]
}

function resolveColumnWidths(
  ctx: PdfDocument,
  columns: DocTableColumn[],
): number[] {
  const explicit = columns.every((c) => typeof c.width === 'number')
  if (explicit) {
    return columns.map((c) => c.width as number)
  }

  const invoiceLike =
    columns.length === 4 &&
    columns[0].header.toLowerCase().includes('desc') &&
    columns[1].header.toLowerCase().includes('qty')

  if (invoiceLike) {
    const w = invoiceTableColumnWidths(ctx.contentWidth)
    return [w.description, w.qty, w.unitPrice, w.amount]
  }

  const gap = 0
  const specs = columns.map((col, index) => ({
    id: `col-${index}`,
    weight: col.weight ?? (col.align === 'right' ? 0.6 : 1.4),
    min: typeof col.width === 'number' ? col.width : 12,
    max: ctx.contentWidth * 0.75,
  }))

  return allocateColumnWidths(ctx.contentWidth, specs, gap).map((c) => c.width)
}

export function renderTable(
  ctx: PdfDocument,
  columns: DocTableColumn[],
  rows: DocTableRow[],
  options?: { emptyMessage?: string },
) {
  if (rows.length === 0) {
    ctx.textBlock({
      text: options?.emptyMessage ?? 'No items.',
      fontSize: DOC_TYPE.body,
      color: 'muted',
    })
    return
  }

  const widths = resolveColumnWidths(ctx, columns)
  const head = [columns.map((col) => col.header)]
  const body = rows.map((row) => row.cells)

  const columnStyles: Record<
    number,
    { halign: 'left' | 'right' | 'center'; cellWidth: number; overflow: 'linebreak' }
  > = {}

  columns.forEach((col, index) => {
    columnStyles[index] = {
      halign: col.align ?? (index === 0 ? 'left' : 'right'),
      cellWidth: widths[index],
      overflow: 'linebreak',
    }
  })

  autoTable(ctx.doc, {
    startY: ctx.cursorY,
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
      fillColor: DOC_RGB.canvas,
      textColor: DOC_RGB.muted,
      fontStyle: 'bold',
      fontSize: DOC_TYPE.tableHead,
      cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
      overflow: 'linebreak',
    },
    alternateRowStyles: {
      fillColor: DOC_RGB.surface,
    },
    bodyStyles: {
      fillColor: DOC_RGB.paper,
      overflow: 'linebreak',
    },
    columnStyles,
    theme: 'plain',
    rowPageBreak: 'avoid',
    margin: {
      left: ctx.marginLeft,
      right: ctx.marginRight,
      bottom: DOC_PAGE.footerHeight + DOC_SPACE.sm,
    },
    didParseCell: (data) => {
      if (data.section === 'head') {
        data.cell.styles.lineWidth = { bottom: 0.1, top: 0, left: 0, right: 0 }
        data.cell.styles.lineColor = DOC_RGB.border
        data.cell.styles.overflow = 'linebreak'
      }
      if (data.section === 'body' && data.column.index === 0) {
        data.cell.styles.textColor = DOC_RGB.ink
        data.cell.styles.overflow = 'linebreak'
      }
      const lastCol = columns.length - 1
      if (data.section === 'body' && data.column.index === lastCol) {
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.textColor = DOC_RGB.ink
      }
      if (data.section === 'body') {
        data.cell.styles.minCellHeight = 6
      }
    },
  })

  const finalY = (ctx.doc as typeof ctx.doc & { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY
  ctx.cursorY = (finalY ?? ctx.cursorY) + DOC_SPACE.md
}

export interface DocTotalsRow {
  label: string
  value: string
  tone?: 'default' | 'success' | 'grand'
}

function measureTotalsHeight(rows: DocTotalsRow[]): number {
  return rows.reduce((h, row) => h + (row.tone === 'grand' ? 12 : 7), 0) + DOC_SPACE.sm
}

export function renderTotalsPanel(ctx: PdfDocument, rows: DocTotalsRow[], panelWidth?: number) {
  const panelW = panelWidth ?? Math.min(84, Math.max(66, ctx.contentWidth * 0.3))
  const panelX = ctx.pageWidth - ctx.marginRight - panelW
  const estimatedHeight = measureTotalsHeight(rows)
  ctx.ensureSpace(estimatedHeight)

  const panelTop = ctx.cursorY
  const panelH = measureTotalsHeight(rows)

  ctx.setFillColor('canvas')
  ctx.setDrawColor('borderLight')
  ctx.doc.setLineWidth(0.06)
  ctx.doc.roundedRect(panelX, panelTop, panelW, panelH, 2, 2, 'FD')

  let y = panelTop + DOC_SPACE.xs
  for (const row of rows) {
    if (row.tone === 'grand') {
      ctx.setFillColor('accentSoft')
      ctx.setDrawColor('accent')
      ctx.doc.setLineWidth(0.08)
      ctx.doc.roundedRect(panelX + 2, y, panelW - 4, 10.5, 1.5, 1.5, 'FD')
      ctx.font('bold')
      ctx.doc.setFontSize(DOC_TYPE.totalLabel)
      ctx.setColor('accentDeep')
      ctx.doc.text(row.label, panelX + DOC_SPACE.sm, y + 6.5)
      ctx.doc.setFontSize(DOC_TYPE.grandTotal)
      ctx.setColor('ink')
      const valueLines = ctx.splitText(row.value, panelW * 0.48, DOC_TYPE.grandTotal)
      ctx.doc.text(valueLines, panelX + panelW - DOC_SPACE.sm, y + 6.5, { align: 'right' })
      y += 12
      continue
    }

    ctx.font('normal')
    ctx.doc.setFontSize(DOC_TYPE.totalLabel)
    ctx.setColor('muted')
    ctx.doc.text(row.label, panelX + DOC_SPACE.sm, y + 4)
    ctx.font('bold')
    ctx.setColor(row.tone === 'success' ? 'success' : 'inkSoft')
    const valLines = ctx.splitText(row.value, panelW * 0.5, DOC_TYPE.totalAmount)
    ctx.doc.text(valLines, panelX + panelW - DOC_SPACE.sm, y + 4, { align: 'right' })
    y += 7
  }

  return panelTop + panelH
}

export function renderNotesSection(
  ctx: PdfDocument,
  title: string,
  body: string,
  options?: { width?: number; startY?: number },
) {
  const totalsReserve = Math.min(84, Math.max(66, ctx.contentWidth * 0.3))
  const gap = DOC_SPACE.md
  const notesW = options?.width ?? ctx.contentWidth - totalsReserve - gap
  const startY = options?.startY ?? ctx.cursorY

  ctx.font('normal')
  ctx.doc.setFontSize(DOC_TYPE.body)
  const lines = ctx.splitText(body, notesW - DOC_SPACE.md * 2, DOC_TYPE.body)
  const boxH =
    DOC_SPACE.md * 2 + DOC_SPACE.sm + lines.length * lineHeightMm(DOC_TYPE.body) + DOC_SPACE.xs

  ctx.ensureSpace(boxH)

  ctx.setFillColor('surface')
  ctx.setDrawColor('borderLight')
  ctx.doc.setLineWidth(0.06)
  ctx.doc.roundedRect(ctx.marginLeft, startY, notesW, boxH, 2, 2, 'FD')

  ctx.font('bold')
  ctx.doc.setFontSize(DOC_TYPE.sectionTitle)
  ctx.setColor('ink')
  ctx.doc.text(title, ctx.marginLeft + DOC_SPACE.sm, startY + DOC_SPACE.md)

  ctx.font('normal')
  ctx.doc.setFontSize(DOC_TYPE.body)
  ctx.setColor('inkSoft')
  ctx.doc.text(lines, ctx.marginLeft + DOC_SPACE.sm, startY + DOC_SPACE.md + DOC_SPACE.sm + 1)

  const notesEnd = startY + boxH
  if (!options?.startY) {
    ctx.cursorY = notesEnd
  }
  return notesEnd
}

/** Notes (left) + totals (right) on one row — uses full content width. */
export function renderBottomSplit(
  ctx: PdfDocument,
  notes: { title: string; body: string },
  totalRows: DocTotalsRow[],
) {
  const gap = DOC_SPACE.md
  const totalsW = Math.min(84, Math.max(66, ctx.contentWidth * 0.3))
  const notesW = ctx.contentWidth - totalsW - gap
  const startY = ctx.cursorY

  const notesLines = ctx.splitText(notes.body, notesW - DOC_SPACE.md * 2, DOC_TYPE.body)
  const notesH =
    DOC_SPACE.md * 2 + DOC_SPACE.sm + notesLines.length * lineHeightMm(DOC_TYPE.body) + DOC_SPACE.xs
  const totalsH = measureTotalsHeight(totalRows)
  const blockH = Math.max(notesH, totalsH)

  ctx.ensureSpace(blockH + DOC_SPACE.sm)

  const notesEnd = renderNotesSection(ctx, notes.title, notes.body, { width: notesW, startY })
  ctx.cursorY = startY
  const totalsEnd = renderTotalsPanel(ctx, totalRows, totalsW)
  ctx.cursorY = Math.max(notesEnd, totalsEnd) + DOC_SPACE.md
}
