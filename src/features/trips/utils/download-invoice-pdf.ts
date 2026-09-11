import { captureInvoicePreviewToPdfBlob } from '@/document-system/export/invoice-html-pdf'
import { downloadPdfBlob } from '@/document-system/export/download'
import {
  buildInvoicePdf,
  buildInvoicePdfBlob,
} from '@/document-system/templates/invoice-template'
import type { InvoiceDocumentData } from '@/features/trips/utils/invoice-document'

export { buildInvoicePdf, buildInvoicePdfBlob }

/**
 * Build invoice PDF from the live HTML preview — WYSIWYG match with the web UI.
 * Falls back to programmatic jsPDF only when preview is unavailable (tests/scripts).
 */
export async function buildInvoicePdfBlobFromPreview(
  previewRoot: HTMLElement | null,
  document?: InvoiceDocumentData,
): Promise<Blob> {
  if (previewRoot) {
    try {
      return await captureInvoicePreviewToPdfBlob(previewRoot)
    } catch (error) {
      if (!document) throw error
    }
  }

  if (!document) {
    throw new Error('Invoice preview is not ready. Open the invoice before exporting.')
  }

  return buildInvoicePdfBlob(document)
}

export async function downloadInvoicePdf(
  invoiceDoc: InvoiceDocumentData,
  previewRoot?: HTMLElement | null,
): Promise<void> {
  const blob = await buildInvoicePdfBlobFromPreview(previewRoot ?? null, invoiceDoc)
  await downloadPdfBlob(blob, `${invoiceDoc.invoiceNumber}.pdf`)
}
