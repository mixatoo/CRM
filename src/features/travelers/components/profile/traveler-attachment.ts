import type { TravelerAttachment } from '@/domain/entities/traveler'
import { generateId } from '@/shared/utils/cn'

const MAX_FILE_BYTES = 4 * 1024 * 1024
const ACCEPTED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
])

export async function readFileAsTravelerAttachment(file: File): Promise<TravelerAttachment> {
  if (!ACCEPTED_MIME.has(file.type)) {
    throw new Error('Only PDF or image files are supported')
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error('File must be 4 MB or smaller')
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })

  return {
    id: generateId('ATT'),
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    dataUrl,
    uploadedAt: new Date().toISOString(),
  }
}

export function formatAttachmentSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
