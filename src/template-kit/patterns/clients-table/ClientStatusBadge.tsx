import type { ClientStatus } from '../stubs/domain-client'
import { CLIENT_STATUS_CHIP_SIZE, CLIENT_STATUS_LABELS, CLIENT_STATUS_VISUAL } from './client-status-styles'
import { cn } from '../../primitives/utils/cn'

export function ClientStatusBadge({ status, className }: { status: ClientStatus; className?: string }) {
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
