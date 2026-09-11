import { useEffect, useRef, useState, type ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { AlertCircle, ClipboardPaste, FileUp, Loader2, Upload } from 'lucide-react'
import { CloseButton } from '@/design-system/components/CloseButton'
import type { FlightPassenger, FlightTripType } from '@/domain/entities/trip-service-flight'
import { Button } from '@/design-system/components/Button'
import {
  TICKET_FILE_ACCEPT,
  extractTextFromTicketFile,
  formatFileSize,
  isAcceptedTicketFile,
  type TicketExtractionProgress,
} from '@/features/trips/utils/extract-ticket-document'
import {
  SAMPLE_TICKET_TEXT,
  buildPassengerFromTicketText,
  canParseTicketText,
  parseTicketText,
  type ParsedTicketSegment,
} from '@/features/trips/utils/parse-ticket-text'
import { BASE_CURRENCY } from '@/domain/currency'
import { cn } from '@/shared/utils/cn'

interface FlightTicketImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tripType: FlightTripType
  defaultCurrency?: string
  onImport: (passenger: FlightPassenger) => void
}

type Tab = 'file' | 'paste'

export function FlightTicketImportDialog({
  open,
  onOpenChange,
  tripType,
  defaultCurrency = BASE_CURRENCY,
  onImport,
}: FlightTicketImportDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<Tab>('file')
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<TicketExtractionProgress | null>(null)

  useEffect(() => {
    if (!open) {
      setTab('file')
      setFile(null)
      setText('')
      setError(null)
      setLoading(false)
      setProgress(null)
      setDragOver(false)
    }
  }, [open])

  const activeText = tab === 'paste' ? text : text
  const parsed = activeText.trim() ? parseTicketText(activeText) : null
  const segments = parsed?.segments ?? []

  const processFile = async (next: File) => {
    if (!isAcceptedTicketFile(next)) {
      setError('Upload PDF, JPG, PNG, WEBP, or TXT.')
      return
    }

    setFile(next)
    setError(null)
    setLoading(true)
    setProgress(null)

    try {
      const { text: extracted } = await extractTextFromTicketFile(next, setProgress)
      setText(extracted)
      if (!canParseTicketText(extracted)) {
        setError('File was read but ticket fields are unclear — open extracted text below, fix it, then import.')
      } else if (parseTicketText(extracted).warnings.length > 0) {
        setError('Partial match — review the preview and edit extracted text if needed.')
      }
    } catch (cause) {
      setText('')
      setError(cause instanceof Error ? cause.message : 'Could not read this file.')
    } finally {
      setLoading(false)
      setProgress(null)
    }
  }

  const handleImport = () => {
    if (!activeText.trim()) {
      setError(tab === 'file' ? 'Upload a ticket file first.' : 'Paste ticket text first.')
      return
    }
    if (!canParseTicketText(activeText)) {
      setError('Could not find passenger, PNR, or flight details.')
      return
    }
    onImport(buildPassengerFromTicketText(activeText, tripType, defaultCurrency))
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[600] bg-black/45" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-[601] flex max-h-[min(42rem,calc(100dvh-1rem))] w-[min(36rem,calc(100vw-1rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
          <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] px-4 py-4 sm:px-5">
            <div>
              <Dialog.Title className="text-sm font-semibold text-[var(--color-foreground)]">
                Import ticket
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-[var(--color-muted)]">
                PDF &amp; images are read locally in your browser — no external API.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <CloseButton />
            </Dialog.Close>
          </div>

          <div className="flex gap-1 border-b border-[var(--color-border)] px-4 pt-2 sm:px-5">
            <TabButton active={tab === 'file'} onClick={() => setTab('file')}>
              Upload file
            </TabButton>
            <TabButton active={tab === 'paste'} onClick={() => setTab('paste')}>
              Paste text
            </TabButton>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
            {tab === 'file' ? (
              <div
                className={cn(
                  'rounded-[var(--radius-lg)] border border-dashed p-5 text-center transition-colors',
                  dragOver
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)]/30'
                    : 'border-[var(--color-border)] bg-[var(--color-surface-muted)]/20',
                )}
                onDragOver={(event) => {
                  event.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(event) => {
                  event.preventDefault()
                  setDragOver(false)
                  const dropped = event.dataTransfer.files?.[0]
                  if (dropped) void processFile(dropped)
                }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept={TICKET_FILE_ACCEPT}
                  className="hidden"
                  onChange={(event) => {
                    const picked = event.target.files?.[0]
                    if (picked) void processFile(picked)
                  }}
                />

                {file ? (
                  <div className="space-y-2">
                    <FileUp className="mx-auto h-8 w-8 text-[var(--color-accent)]" />
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-[var(--color-muted)]">{formatFileSize(file.size)}</p>
                    <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={() => fileRef.current?.click()}>
                      Choose another file
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="mx-auto h-8 w-8 text-[var(--color-muted)]" />
                    <p className="text-sm">Drop PDF or ticket image here</p>
                    <p className="text-xs text-[var(--color-muted)]">PDF, JPG, PNG, WEBP, TXT</p>
                    <Button type="button" variant="secondary" size="sm" className="mt-2 h-8" onClick={() => fileRef.current?.click()}>
                      Browse files
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-8 gap-1.5 text-xs font-normal"
                  onClick={() => {
                    setError(null)
                    setText(SAMPLE_TICKET_TEXT)
                  }}
                >
                  <ClipboardPaste className="h-3.5 w-3.5" />
                  Try sample
                </Button>
                <textarea
                  value={text}
                  onChange={(event) => {
                    setText(event.target.value)
                    setError(null)
                  }}
                  placeholder="Paste e-ticket text from email or GDS…"
                  className={cn(
                    'h-36 w-full resize-y rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]',
                    'px-3 py-2 font-mono text-xs leading-relaxed focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20',
                  )}
                />
              </div>
            )}

            {loading ? (
              <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-3 text-sm">
                <Loader2 className="h-4 w-4 animate-spin text-[var(--color-accent)]" />
                <span>{progress?.message ?? 'Processing file…'}</span>
                {typeof progress?.progress === 'number' ? (
                  <span className="ml-auto text-xs text-[var(--color-muted)]">
                    {Math.round(progress.progress * 100)}%
                  </span>
                ) : null}
              </div>
            ) : null}

            {error ? (
              <div className="flex gap-2 rounded-[var(--radius-md)] border border-[var(--color-danger)]/30 bg-[var(--color-danger-muted)] px-3 py-2 text-xs text-[var(--color-danger)]">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            ) : null}

            {parsed && activeText.trim() && !loading ? (
              <PreviewCard parsed={parsed} segmentCount={segments.length} segments={segments} />
            ) : null}

            {tab === 'file' && text.trim() && !loading ? (
              <details open={Boolean(parsed?.warnings.length)} className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]/10 px-3 py-2">
                <summary className="cursor-pointer text-xs font-medium text-[var(--color-muted)]">
                  Extracted text — edit if preview looks wrong
                </summary>
                <textarea
                  value={text}
                  onChange={(event) => {
                    setText(event.target.value)
                    setError(null)
                  }}
                  className="mt-2 h-28 w-full resize-y rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 font-mono text-[11px]"
                />
              </details>
            ) : null}
          </div>

          <div className="flex justify-end gap-2 border-t border-[var(--color-border)] px-4 py-4 sm:px-5">
            <Button type="button" variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={loading || !activeText.trim()}
              onClick={handleImport}
            >
              Add to table
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-t-[var(--radius-md)] px-3 py-2 text-xs font-medium transition-colors',
        active
          ? 'border border-b-0 border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)]'
          : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]',
      )}
    >
      {children}
    </button>
  )
}

function PreviewCard({
  parsed,
  segmentCount,
  segments,
}: {
  parsed: ReturnType<typeof parseTicketText>
  segmentCount: number
  segments: ParsedTicketSegment[]
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]/20 p-3 text-sm">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">Preview</p>
      <dl className="grid gap-2 text-xs sm:grid-cols-2">
        <Field label="Passenger" value={parsed.passengerName} />
        <Field label="PNR" value={parsed.pnr} mono />
        <Field label="Ticket" value={parsed.ticketNumber} mono />
        <Field label="Segments" value={String(segmentCount)} />
      </dl>
      {segments.length > 0 ? (
        <ul className="mt-2 space-y-1 border-t border-[var(--color-border)] pt-2 text-xs">
          {segments.map((segment, index) => (
            <li key={`${segment.flightNumber}-${index}`} className="font-mono">
              {segment.departureAirport || '—'} → {segment.arrivalAirport || '—'}
              <span className="mx-1 text-[var(--color-muted)]">·</span>
              {segment.flightNumber || 'FLIGHT'}
              <span className="mx-1 text-[var(--color-muted)]">·</span>
              {segment.departureDate || 'DATE'}
            </li>
          ))}
        </ul>
      ) : null}
      {parsed.warnings.length > 0 ? (
        <ul className="mt-2 space-y-0.5 text-[11px] text-[var(--color-muted)]">
          {parsed.warnings.map((warning) => (
            <li key={warning}>• {warning}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">{label}</dt>
      <dd className={cn('mt-0.5 truncate', mono && 'font-mono')}>{value || '—'}</dd>
    </div>
  )
}
