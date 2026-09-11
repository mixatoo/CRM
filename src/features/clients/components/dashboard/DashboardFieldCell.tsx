import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { CrmFieldTone } from '@/design-system/layout/CrmPanel'
import { layout } from '@/design-system/tokens/layout'
import { cn } from '@/shared/utils/cn'
import {
  dashboardFieldCellClassName,
  dashboardFieldLabelClassName,
  dashboardFieldValueClassName,
} from '@/features/clients/components/dashboard/client-dashboard-chrome'
import { profileCrmFieldControlClassName } from '@/features/clients/components/profile/ProfileCrmFieldRow'

const VALUE_TONE: Record<CrmFieldTone, string> = {
  default: '',
  accent: '!text-[var(--color-accent)]',
  success: '!text-[var(--color-success)]',
  warning: '!text-[var(--color-warning)]',
  danger: '!text-[var(--color-danger)]',
  muted: '!text-[var(--color-muted)]',
}

interface DashboardFieldCellProps {
  label: string
  value: ReactNode
  tone?: CrmFieldTone
  sub?: ReactNode
  href?: string
  variant?: 'inline' | 'stack' | 'profile'
  className?: string
}

export function DashboardFieldCell({
  label,
  value,
  tone = 'default',
  sub,
  href,
  variant = 'inline',
  className: extraClassName,
}: DashboardFieldCellProps) {
  const valueClassName = cn(
    'min-w-0 leading-snug',
    dashboardFieldValueClassName,
    VALUE_TONE[tone],
    variant !== 'stack' && 'text-right',
    variant === 'inline' && 'tabular-nums tracking-tight',
  )

  const content =
    variant === 'stack' ? (
      <>
        <span className={dashboardFieldLabelClassName}>{label}</span>
        <div className={cn(valueClassName, 'text-sm font-semibold tabular-nums tracking-tight')}>{value}</div>
        {sub ? <div className={cn(layout.caption, 'leading-snug text-[var(--color-muted)]')}>{sub}</div> : null}
      </>
    ) : variant === 'profile' ? (
      <>
        <span className={cn(dashboardFieldLabelClassName, 'min-w-0 pr-4')}>{label}</span>
        <div className={cn('min-w-0 text-right', profileCrmFieldControlClassName)}>
          <div className={valueClassName}>{value}</div>
          {sub ? (
            <div className={cn(layout.caption, 'mt-0.5 leading-snug text-[var(--color-muted)]')}>{sub}</div>
          ) : null}
        </div>
      </>
    ) : (
      <>
        <div className="flex min-w-0 items-center justify-between gap-3">
          <span className={cn(dashboardFieldLabelClassName, 'shrink-0')}>{label}</span>
          <div className={valueClassName}>{value}</div>
        </div>
        {sub ? <div className={cn(layout.caption, 'text-right leading-snug')}>{sub}</div> : null}
      </>
    )

  const className = cn(
    variant === 'profile'
      ? 'flex min-h-10 w-full min-w-0 items-center justify-between gap-x-8 px-4 py-2'
      : dashboardFieldCellClassName,
    variant === 'stack' ? 'flex flex-col justify-center gap-0.5' : variant === 'inline' ? 'flex flex-col justify-center gap-1' : null,
    href && 'transition-colors hover:bg-[var(--color-surface-muted)]/60',
    extraClassName,
  )

  if (href) {
    return (
      <Link to={href} className={className}>
        {content}
      </Link>
    )
  }

  return <div className={className}>{content}</div>
}
