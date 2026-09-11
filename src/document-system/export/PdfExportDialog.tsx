import { useEffect, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Download, FileText, Loader2 } from 'lucide-react'
import { CloseButton } from '@/design-system/components/CloseButton'
import { downloadPdfBlob } from '@/document-system/export/download'
import { Button } from '@/design-system/components/Button'
import { cn } from '@/shared/utils/cn'

interface PdfExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  filename: string
  generatePdf: () => Blob | Promise<Blob>
}

export function PdfExportDialog({
  open,
  onOpenChange,
  title,
  description,
  filename,
  generatePdf,
}: PdfExportDialogProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const blobRef = useRef<Blob | null>(null)
  const pdfUrlRef = useRef<string | null>(null)

  const revokeObjectUrl = () => {
    if (pdfUrlRef.current) {
      URL.revokeObjectURL(pdfUrlRef.current)
      pdfUrlRef.current = null
    }
    setPdfUrl(null)
  }

  useEffect(() => {
    if (!open) {
      revokeObjectUrl()
      blobRef.current = null
      setError(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    revokeObjectUrl()

    void Promise.resolve(generatePdf())
      .then((blob) => {
        if (cancelled) return
        blobRef.current = blob
        const url = URL.createObjectURL(blob)
        pdfUrlRef.current = url
        setPdfUrl(url)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message = err instanceof Error ? err.message : 'Could not generate the PDF.'
        setError(message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, generatePdf])

  useEffect(() => {
    return () => revokeObjectUrl()
  }, [])

  const handleDownload = async () => {
    const blob = blobRef.current
    if (!blob) return
    setDownloading(true)
    try {
      await downloadPdfBlob(blob, filename)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[700] bg-black/50 backdrop-blur-[1px]" />
        <Dialog.Content
          className={cn(
            'fixed inset-3 z-[701] flex flex-col overflow-hidden outline-none sm:inset-6 lg:inset-10',
            'rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl',
          )}
        >
          <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3 lg:px-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-[var(--color-accent)]" aria-hidden />
                <Dialog.Title className="text-sm font-semibold text-[var(--color-foreground)]">
                  {title}
                </Dialog.Title>
              </div>
              {description ? (
                <Dialog.Description className="mt-0.5 text-xs text-[var(--color-muted)]">
                  {description}
                </Dialog.Description>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="h-7 gap-1 px-2"
                disabled={loading || downloading || !pdfUrl}
                onClick={() => void handleDownload()}
              >
                {downloading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                {downloading ? 'Saving…' : 'Download PDF'}
              </Button>
              <Dialog.Close asChild>
                <CloseButton />
              </Dialog.Close>
            </div>
          </header>

          <div className="relative min-h-0 flex-1 bg-[var(--color-surface-muted)]/60 p-3 sm:p-4">
            {loading ? (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 text-sm text-[var(--color-muted)]">
                <Loader2 className="size-8 animate-spin text-[var(--color-accent)]" />
                <p>Building PDF…</p>
              </div>
            ) : null}

            {error ? (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-2 px-6 text-center">
                <p className="text-sm font-medium text-[var(--color-danger)]">Export failed</p>
                <p className="max-w-md text-xs text-[var(--color-muted)]">{error}</p>
              </div>
            ) : null}

            {!loading && !error && pdfUrl ? (
              <iframe
                title="PDF preview"
                src={pdfUrl}
                className="mx-auto h-full min-h-[480px] w-full max-w-4xl rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white shadow-sm"
              />
            ) : null}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
