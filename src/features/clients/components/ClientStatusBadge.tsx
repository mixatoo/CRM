import type { ClientStatus } from '@/domain/entities/client'
import { CLIENT_STATUS_LABELS } from '@/domain/entities/client'
import {
  CLIENT_STATUS_CHIP_SIZE,
  CLIENT_STATUS_VISUAL,
} from '@/features/clients/components/list/client-status-styles'
import { cn } from '@/shared/utils/cn'

interface ClientStatusBadgeProps {
  status: ClientStatus
  className?: string
}

export function ClientStatusBadge({ status, className }: ClientStatusBadgeProps) {
  const visual = CLIENT_STATUS_VISUAL[status]

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-[var(--radius-sm)] border px-2 text-center text-xs font-normal leading-none',
        CLIENT_STATUS_CHIP_SIZE,
        visual.shell,
        visual.text,
        className,
      )}
    >
      <span className="truncate">{CLIENT_STATUS_LABELS[status]}</span>
    </span>
  )
}
