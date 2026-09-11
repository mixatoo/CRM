import html2pdf from 'html2pdf.js'
import { INVOICE_PREVIEW_SHEET_WIDTH_MM } from '@/document-system/tokens/page'

const PX_PER_MM = 96 / 25.4
const A4_WIDTH_PX = Math.round(INVOICE_PREVIEW_SHEET_WIDTH_MM * PX_PER_MM)

function waitForImages(root: HTMLElement): Promise<void> {
  const images = [...root.querySelectorAll('img')]
  if (images.length === 0) return Promise.resolve()

  return Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve()
            return
          }
          img.addEventListener('load', () => resolve(), { once: true })
          img.addEventListener('error', () => resolve(), { once: true })
        }),
    ),
  ).then(() => undefined)
}

/**
 * Clone the live preview at fixed A4 width so PDF matches on-screen design
 * regardless of dialog/viewport width.
 */
async function mountCaptureClone(source: HTMLElement): Promise<{
  host: HTMLDivElement
  target: HTMLElement
}> {
  const host = document.createElement('div')
  host.setAttribute('aria-hidden', 'true')
  host.style.cssText = [
    'position:fixed',
    'left:-99999px',
    'top:0',
    `width:${A4_WIDTH_PX}px`,
    'background:#faf9f7',
    'pointer-events:none',
    'z-index:-1',
  ].join(';')

  const clone = source.cloneNode(true) as HTMLElement
  clone.classList.add('inv-doc--pdf-capture')
  clone.style.width = `${A4_WIDTH_PX}px`
  clone.style.maxWidth = `${A4_WIDTH_PX}px`

  host.appendChild(clone)
  document.body.appendChild(host)

  if (document.fonts?.ready) await document.fonts.ready
  await waitForImages(clone)
  // Allow layout to settle after width change
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))

  return { host, target: clone }
}

function removeCaptureHost(host: HTMLDivElement) {
  host.remove()
}

/**
 * Export the invoice HTML preview to PDF (WYSIWYG).
 * HTML/CSS is the single source of truth.
 */
export async function captureInvoicePreviewToPdfBlob(previewRoot: HTMLElement): Promise<Blob> {
  const sheet = previewRoot.querySelector<HTMLElement>('[data-invoice-pdf-sheet]')
  const source = (sheet?.closest('.inv-doc') ?? previewRoot) as HTMLElement

  const { host, target } = await mountCaptureClone(source)

  try {
    const worker = html2pdf()
      .set({
        margin: 0,
        filename: 'invoice.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#fefdfb',
          width: A4_WIDTH_PX,
          windowWidth: A4_WIDTH_PX,
          scrollX: 0,
          scrollY: 0,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: true,
        },
        pagebreak: {
          mode: ['css', 'legacy'],
          avoid: [
            'tr',
            '.inv-doc__bill-to',
            '.inv-doc__trip-bar',
            '.inv-doc__totals-panel',
            '.inv-doc__notes',
            '.inv-doc__foot',
          ],
        },
      })
      .from(target)

    const blob = await worker.outputPdf('blob')
    return blob as Blob
  } finally {
    removeCaptureHost(host)
  }
}
