import type { ReactNode } from 'react'
import {
  clientWorkspaceTabClassName,
  clientWorkspaceTabsRailClassName,
} from '@/features/clients/components/workspace/client-workspace-nav-ui'
import {
  dashboardSegmentButtonClassName,
  dashboardSegmentedRailClassName,
  dashboardTabBarClassName,
  dashboardTabButtonClassName,
} from '@/features/clients/components/dashboard/client-dashboard-modern-ui'
import { cn } from '@/shared/utils/cn'

interface SegmentedOption<T extends string> {
  value: T
  label: string
}

interface ClientDashboardSegmentedControlProps<T extends string> {
  value: T
  options: SegmentedOption<T>[]
  onChange: (value: T) => void
  ariaLabel: string
  className?: string
  variant?: 'default' | 'workspace'
}

export function ClientDashboardSegmentedControl<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  className,
  variant = 'default',
}: ClientDashboardSegmentedControlProps<T>) {
  const railClass = variant === 'workspace' ? clientWorkspaceTabsRailClassName : dashboardSegmentedRailClassName
  const buttonClass = variant === 'workspace' ? clientWorkspaceTabClassName : dashboardSegmentButtonClassName

  return (
    <div className={cn(railClass, className)} role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={buttonClass(value === option.value)}
          aria-pressed={value === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

interface ClientDashboardTabBarProps<T extends string> {
  value: T
  options: SegmentedOption<T>[]
  onChange: (value: T) => void
  ariaLabel: string
  aside?: ReactNode
  className?: string
}

export function ClientDashboardTabBar<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  aside,
  className,
}: ClientDashboardTabBarProps<T>) {
  return (
    <div className={cn('flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className={dashboardTabBarClassName} role="tablist" aria-label={ariaLabel}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={value === option.value}
            onClick={() => onChange(option.value)}
            className={dashboardTabButtonClassName(value === option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {aside ? <div className="flex shrink-0 items-center px-4 pb-2 sm:px-5 sm:pb-0">{aside}</div> : null}
    </div>
  )
}
