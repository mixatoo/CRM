import { useEffect, useRef } from 'react'
import { ChevronRight } from 'lucide-react'
import type { DashboardSectionId } from '@/features/clients/components/dashboard/dashboard-sections'
import { DASHBOARD_SECTIONS } from '@/features/clients/components/dashboard/dashboard-sections'
import {
  clientProfileListHeaderClassName,
  clientProfileListItemClassName,
  clientProfileListItemIconClassName,
  clientProfileListItemLabelClassName,
  clientProfileListNavClassName,
} from '@/features/clients/components/profile/client-profile-browse-ui'
import { cn } from '@/shared/utils/cn'

interface ClientDashboardSectionListProps {
  section: DashboardSectionId
  onSectionChange: (section: DashboardSectionId) => void
  className?: string
}

export function ClientDashboardSectionList({
  section,
  onSectionChange,
  className,
}: ClientDashboardSectionListProps) {
  const itemRefs = useRef<Partial<Record<DashboardSectionId, HTMLButtonElement | null>>>({})

  useEffect(() => {
    itemRefs.current[section]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [section])

  return (
    <div className={cn('flex min-h-0 flex-col', className)}>
      <p className={clientProfileListHeaderClassName}>Sections</p>
      <nav aria-label="Dashboard sections" className={clientProfileListNavClassName}>
        {DASHBOARD_SECTIONS.map((item) => {
          const isActive = item.id === section
          const Icon = item.icon

          return (
            <button
              key={item.id}
              ref={(node) => {
                itemRefs.current[item.id] = node
              }}
              type="button"
              aria-current={isActive ? 'step' : undefined}
              onClick={() => onSectionChange(item.id)}
              className={clientProfileListItemClassName(isActive)}
            >
              <span className={clientProfileListItemIconClassName(isActive, false)}>
                <Icon className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span className={clientProfileListItemLabelClassName(isActive)}>{item.label}</span>
              <ChevronRight
                className={cn(
                  'hidden h-3.5 w-3.5 shrink-0 text-[var(--color-subtle)] transition-opacity md:block',
                  isActive ? 'text-[var(--color-accent)] opacity-100' : 'opacity-0 group-hover:opacity-60',
                )}
                aria-hidden
              />
            </button>
          )
        })}
      </nav>
    </div>
  )
}
