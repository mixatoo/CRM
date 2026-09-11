import { useRef, useState } from 'react'
import { FileText, ImageIcon, Trash2, Upload } from 'lucide-react'
import type { TravelerAttachment } from '@/domain/entities/traveler'
import { ConfirmDialog } from '@/design-system/components/ConfirmDialog'
import { Button } from '@/design-system/components/Button'
import {
  formatAttachmentSize,
  readFileAsTravelerAttachment,
} from '@/features/travelers/components/profile/traveler-attachment'
import { useToast } from '@/design-system/components/Toast'
import { cn } from '@/shared/utils/cn'

interface TravelerFileUploadFieldProps {
  label: string
  value?: TravelerAttachment
  onChange: (value: TravelerAttachment | undefined) => void
  disabled?: boolean
  accept?: string
  className?: string
}

export function TravelerFileUploadField({
  label,
  value,
  onChange,
  disabled,
  accept = 'image/*,application/pdf',
  className,
}: TravelerFileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const isImage = value?.mimeType.startsWith('image/')

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    setBusy(true)
    try {
      const attachment = await readFileAsTravelerAttachment(file)
      onChange(attachment)
    } catch (error) {
      toast({
        intent: 'failed',
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Could not upload file',
      })
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-muted)]">{label}</p>

      {value ? (
        <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]/30 p-2.5">
          {isImage ? (
            <a href={value.dataUrl} target="_blank" rel="noreferrer" className="shrink-0">
              <img
                src={value.dataUrl}
                alt={value.fileName}
                className="h-14 w-14 rounded-[var(--radius-sm)] object-cover ring-1 ring-[var(--color-border)]"
              />
            </a>
          ) : (
            <a
              href={value.dataUrl}
              target="_blank"
              rel="noreferrer"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-surface)] ring-1 ring-[var(--color-border)]"
            >
              <FileText className="h-5 w-5 text-[var(--color-muted)]" />
            </a>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-[var(--color-foreground)]">{value.fileName}</p>
            <p className="mt-0.5 text-[11px] text-[var(--color-muted)]">
              {formatAttachmentSize(value.sizeBytes)}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                disabled={disabled || busy}
                onClick={() => inputRef.current?.click()}
              >
                Replace
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-[var(--color-danger)]"
                disabled={disabled || busy}
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)]',
            'bg-[var(--color-surface-muted)]/20 px-3 py-4 text-xs text-[var(--color-muted)] transition-colors',
            'hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-muted)]/40 hover:text-[var(--color-foreground)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          {busy ? (
            'Uploading…'
          ) : (
            <>
              <Upload className="h-3.5 w-3.5" />
              Upload PDF or image
              <ImageIcon className="h-3.5 w-3.5 opacity-60" />
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled || busy}
        onChange={(event) => void handleFiles(event.target.files)}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        variant="danger"
        entityType="Attachment"
        title="Remove attachment"
        description="This removes the uploaded file from the passenger profile."
        meta={value ? [{ label: 'File', value: value.fileName }] : []}
        confirmLabel="Remove file"
        onConfirm={() => {
          onChange(undefined)
          setConfirmOpen(false)
        }}
      />
    </div>
  )
}
