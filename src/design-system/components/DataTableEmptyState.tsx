import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { TABLE_CELL_X } from '@/design-system/components/table-styles'
import { cn } from '@/shared/utils/cn'

export type DataTableEmptyTone = 'default' | 'uppercase'

export interface DataTableEmptyStateProps {
  title: string
  description?: string
  icon?: LucideIcon
  className?: string
  tone?: DataTableEmptyTone
}

export function DataTableEmptyState({
  title,
  description,
  icon: Icon = Inbox,
  className,
  tone = 'default',
}: DataTableEmptyStateProps) {
  const textClass = tone === 'uppercase' ? 'uppercase tracking-wide' : undefined

  return (
    <div className={cn('mx-auto flex max-w-md flex-col items-center gap-3 px-4', className)}>
      <div
        className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]/50 shadow-sm"
        aria-hidden
      >
        <Icon className="h-5 w-5 text-[var(--color-muted)]" strokeWidth={1.75} />
      </div>
      <div className={cn('space-y-1 text-center', textClass)}>
        <p className="text-[13px] font-medium leading-snug text-[var(--color-foreground)]">{title}</p>
        {description ? <p className="text-xs leading-relaxed text-[var(--color-muted)]">{description}</p> : null}
      </div>
    </div>
  )
}

export interface DataTableEmptyRowProps extends DataTableEmptyStateProps {
  colSpan: number
  cellClassName?: string
}

export function DataTableEmptyRow({ colSpan, cellClassName, ...state }: DataTableEmptyRowProps) {
  return (
    <tr>
      <td colSpan={colSpan} className={cn(TABLE_CELL_X, 'py-14 text-center', cellClassName)}>
        <DataTableEmptyState {...state} />
      </td>
    </tr>
  )
}

export function DataTableEmptyPanel(props: DataTableEmptyStateProps) {
  return (
    <div className="flex min-h-[8.5rem] items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)]/80 bg-[var(--color-surface-muted)]/15 px-6 py-10">
      <DataTableEmptyState {...props} />
    </div>
  )
}
