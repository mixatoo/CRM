function sanitizeFilename(value: string): string {
  return value.replace(/[^\w.-]+/g, '_')
}

export function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = sanitizeFilename(filename.replace(/\.pdf$/i, '') + '.pdf')
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export async function downloadPdfBlob(blob: Blob, filename: string): Promise<void> {
  triggerBrowserDownload(blob, filename)
}
