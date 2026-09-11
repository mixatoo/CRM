import * as pdfjs from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { preprocessTicketText } from '@/features/trips/utils/parse-ticket-text'

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker

export type TicketDocumentKind = 'text' | 'pdf' | 'image'

export interface TicketExtractionProgress {
  stage: 'reading' | 'ai'
  message: string
  progress?: number
}

export const TICKET_FILE_ACCEPT = '.txt,.pdf,.jpg,.jpeg,.png,.webp'

export function detectTicketDocumentKind(file: File): TicketDocumentKind | null {
  const name = file.name.toLowerCase()
  if (file.type === 'text/plain' || name.endsWith('.txt')) return 'text'
  if (file.type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf'
  if (file.type.startsWith('image/') || /\.(jpe?g|png|webp)$/.test(name)) return 'image'
  return null
}

export function isAcceptedTicketFile(file: File): boolean {
  return detectTicketDocumentKind(file) !== null
}

export function isImageTicketFile(file: File): boolean {
  return detectTicketDocumentKind(file) === 'image'
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}

async function readTextFile(file: File): Promise<string> {
  return file.text()
}

export async function extractPdfText(
  file: File,
  onProgress?: (progress: TicketExtractionProgress) => void,
): Promise<string> {
  onProgress?.({ stage: 'reading', message: 'Reading PDF…' })
  const data = new Uint8Array(await file.arrayBuffer())
  const pdf = await pdfjs.getDocument({ data }).promise
  const parts: string[] = []

  for (let page = 1; page <= pdf.numPages; page += 1) {
    onProgress?.({
      stage: 'reading',
      message: `Reading PDF page ${page} of ${pdf.numPages}…`,
      progress: page / pdf.numPages,
    })
    const pageDoc = await pdf.getPage(page)
    const content = await pageDoc.getTextContent()
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
    parts.push(pageText)
  }

  return parts.join('\n').trim()
}

export async function renderPdfPagesAsDataUrls(file: File, maxPages = 2): Promise<string[]> {
  const data = new Uint8Array(await file.arrayBuffer())
  const pdf = await pdfjs.getDocument({ data }).promise
  const urls: string[] = []
  const pageCount = Math.min(pdf.numPages, maxPages)

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const viewport = page.getViewport({ scale: 2 })
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Could not prepare PDF for vision')

    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({ canvas, canvasContext: context, viewport }).promise
    urls.push(canvas.toDataURL('image/png'))
  }

  return urls
}

export async function extractTextFromTicketFile(
  file: File,
  onProgress?: (progress: TicketExtractionProgress) => void,
): Promise<{ text: string; kind: TicketDocumentKind }> {
  const kind = detectTicketDocumentKind(file)
  if (!kind) throw new Error('Unsupported file. Upload PDF, image, or TXT.')

  if (kind === 'text') {
    onProgress?.({ stage: 'reading', message: 'Reading text file…' })
    return { text: preprocessTicketText(await readTextFile(file)), kind }
  }

  if (kind === 'image') {
    return { text: '', kind }
  }

  const pdfText = preprocessTicketText(await extractPdfText(file, onProgress))
  if (!pdfText.trim()) {
    throw new Error(
      'No selectable text found in this PDF. Use OpenAI import or paste the ticket text manually.',
    )
  }

  return { text: pdfText, kind }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
