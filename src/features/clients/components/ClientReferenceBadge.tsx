import type { MouseEvent } from 'react'
import {
  CLIENT_REFERENCE_CHIP_SIZE,
  CLIENT_REFERENCE_VISUAL,
} from '@/features/clients/components/list/client-reference-styles'
import { cn } from '@/shared/utils/cn'

interface ClientReferenceBadgeProps {
  reference: string
  copied?: boolean
  onCopy?: (event: MouseEvent<HTMLButtonElement>) => void
  className?: string
}

export function ClientReferenceBadge({
  reference,
  copied = false,
  onCopy,
  className,
}: ClientReferenceBadgeProps) {
  const visual = copied ? CLIENT_REFERENCE_VISUAL.copied : CLIENT_REFERENCE_VISUAL.default

  if (onCopy) {
    return (
      <button
        type="button"
        onClick={onCopy}
        title={copied ? 'Reference copied' : 'Click to copy reference'}
        aria-label={copied ? `Reference ${reference} copied` : `Copy reference ${reference}`}
        className={cn(
          'inline-flex cursor-copy items-center justify-center rounded-[var(--radius-sm)] border px-2 text-center text-xs font-normal leading-none transition-[border-color,background-color,color]',
          CLIENT_REFERENCE_CHIP_SIZE,
          visual.shell,
          visual.text,
          className,
        )}
      >
        <span className="truncate font-mono tabular-nums">{reference}</span>
        {copied ? <span className="sr-only">Copied</span> : null}
      </button>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-[var(--radius-sm)] border px-2 text-center text-xs font-normal leading-none',
        CLIENT_REFERENCE_CHIP_SIZE,
        visual.shell,
        visual.text,
        className,
      )}
    >
      <span className="truncate font-mono tabular-nums">{reference}</span>
    </span>
  )
}
