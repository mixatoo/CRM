import type { ClientType } from '@/domain/entities/client'
import { CLIENT_TYPE_LABELS } from '@/domain/entities/client'
import {
  CLIENT_TYPE_CHIP_SIZE,
  CLIENT_TYPE_VISUAL,
} from '@/features/clients/components/list/client-type-styles'
import { cn } from '@/shared/utils/cn'

interface ClientTypeBadgeProps {
  type: ClientType
  className?: string
}

export function ClientTypeBadge({ type, className }: ClientTypeBadgeProps) {
  const visual = CLIENT_TYPE_VISUAL[type]

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-[var(--radius-sm)] border px-2 text-center text-xs font-normal leading-none',
        CLIENT_TYPE_CHIP_SIZE,
        visual.shell,
        visual.text,
        className,
      )}
    >
      <span className="truncate">{CLIENT_TYPE_LABELS[type]}</span>
    </span>
  )
}
