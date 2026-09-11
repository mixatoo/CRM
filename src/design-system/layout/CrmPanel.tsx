import type { ReactNode } from 'react'
import { layout, responsiveGrid } from '@/design-system/tokens/layout'
import { FieldHeader } from '@/design-system/components/FieldLabel'
import { cn } from '@/shared/utils/cn'

export const crmPanelClassName =
  'flex min-h-0 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]'

export const crmPanelHeaderClassName =
  'flex shrink-0 items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/50 px-3 py-2'

export const crmPanelTitleClassName =
  'text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]'

export const crmFieldLabelClassName =
  'text-[11px] font-medium uppercase tracking-wide text-[var(--color-subtle)]'

export const crmFieldCellClassName = 'min-w-0 px-4 py-3.5'

const gridColsClass = {
  2: responsiveGrid.cols2,
  3: responsiveGrid.cols3,
  4: responsiveGrid.cols4,
  5: responsiveGrid.cols5,
} as const

export type CrmFieldTone = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'muted'

const VALUE_TONE: Record<CrmFieldTone, string> = {
  default: 'text-[var(--color-foreground)]',
  accent: 'text-[var(--color-accent)]',
  success: 'text-[var(--color-success)]',
  warning: 'text-[var(--color-warning)]',
  danger: 'text-[var(--color-danger)]',
  muted: 'text-[var(--color-muted)]',
}

export function CrmPanel({
  title,
  actions,
  children,
  className,
}: {
  title?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn(crmPanelClassName, className)}>
      {title || actions ? (
        <header className={cn(crmPanelHeaderClassName, !title && 'justify-end')}>
          {title ? <h4 className={crmPanelTitleClassName}>{title}</h4> : null}
          {actions}
        </header>
      ) : null}
      {children}
    </section>
  )
}

export function CrmFieldGrid({
  columns,
  children,
  className,
}: {
  columns: 2 | 3 | 4 | 5
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'grid min-w-0 flex-1 divide-y sm:divide-x sm:divide-y-0 divide-[var(--color-border)]',
        gridColsClass[columns],
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CrmInputCell({
  label,
  hint,
  required,
  optional,
  children,
  className,
}: {
  label: string
  hint?: string
  required?: boolean
  optional?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn(crmFieldCellClassName, 'flex flex-col justify-center gap-1.5', className)}>
      <FieldHeader
        label={label}
        hint={hint}
        required={required}
        optional={optional}
        labelClassName={cn(crmFieldLabelClassName, 'normal-case leading-none')}
      />
      {children}
    </div>
  )
}

export function CrmMetricCell({
  label,
  children,
  tone = 'default',
  sub,
}: {
  label: string
  children: ReactNode
  tone?: CrmFieldTone
  sub?: ReactNode
}) {
  return (
    <div className={cn(crmFieldCellClassName, 'flex flex-col justify-center gap-1.5')}>
      <span className={cn(crmFieldLabelClassName, 'leading-none')}>{label}</span>
      <div className={cn('min-w-0 text-sm font-normal tabular-nums tracking-tight', VALUE_TONE[tone])}>
        {children}
      </div>
      {sub ? <div className={cn(layout.caption, 'leading-snug')}>{sub}</div> : null}
    </div>
  )
}
