import type { MouseEvent } from 'react'
import { ClientReferenceBadge } from '@/features/clients/components/ClientReferenceBadge'
import { useCopyToClipboard } from '@/shared/hooks/use-copy-to-clipboard'
import { cn } from '@/shared/utils/cn'

type ClientReferenceCopyProps = {
  reference: string
  variant?: 'chip' | 'inline'
  className?: string
}

export function ClientReferenceCopy({
  reference,
  variant = 'chip',
  className,
}: ClientReferenceCopyProps) {
  const { copy, copied } = useCopyToClipboard()

  const handleCopy = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    void copy(reference)
  }

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={handleCopy}
        title={copied ? 'Reference copied' : 'Click to copy reference'}
        aria-label={copied ? `Reference ${reference} copied` : `Copy reference ${reference}`}
        className={cn(
          'max-w-full cursor-copy truncate text-left font-mono tabular-nums transition-colors',
          !copied && 'text-[var(--color-accent)] hover:text-[var(--color-accent)]/80',
          className,
          copied && '!text-[var(--color-success)]',
        )}
      >
        {reference}
        {copied ? <span className="sr-only">Copied</span> : null}
      </button>
    )
  }

  return (
    <ClientReferenceBadge
      reference={reference}
      copied={copied}
      onCopy={handleCopy}
      className={className}
    />
  )
}
