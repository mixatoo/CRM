import type { ReactNode } from 'react'
import { crmPanelClassName } from '@/design-system/layout/CrmPanel'
import { Skeleton } from '@/design-system/components/Skeleton'
import { cn } from '@/shared/utils/cn'
import {
  dashboardFieldCellClassName,
  dashboardDivideYClassName,
  dashboardSectionHeaderClassName,
  dashboardSectionSeparatorClassName,
} from '@/features/clients/components/dashboard/client-dashboard-chrome'
import { DashboardFieldCell } from '@/features/clients/components/dashboard/DashboardFieldCell'
import { DashboardSectionTitle } from '@/features/clients/components/dashboard/DashboardSectionTitle'
import { resolveSectionIcon } from '@/features/clients/components/dashboard/client-dashboard-icons'
import { resolveSectionTheme } from '@/features/clients/components/dashboard/client-dashboard-themes'

import { profileSectionAnchorId } from '@/features/clients/utils/client-profile-display'

const DASH = '—'

export interface DashboardField {
  label: string
  value: ReactNode
  href?: string
  tone?: import('@/design-system/layout/CrmPanel').CrmFieldTone
  sub?: ReactNode
}

export interface DashboardFieldSection {
  title: string
  fields: DashboardField[]
  emptyMessage?: string
}

interface ClientDashboardInfoCardProps {
  sections: DashboardFieldSection[]
  isLoading?: boolean
  className?: string
  variant?: 'card' | 'flat'
}

export function ClientDashboardInfoCard({
  sections,
  isLoading,
  className,
  variant = 'card',
}: ClientDashboardInfoCardProps) {
  const rowCount = sections.reduce((sum, section) => sum + section.fields.length, 0)
  const flatEmptyMessage = sections.find((section) => section.emptyMessage)?.emptyMessage

  if (variant === 'flat') {
    const hasContent = sections.some((section) => section.fields.length > 0)

    return (
      <div className={className}>
        {isLoading ? (
          <CardSkeleton rows={rowCount || 4} />
        ) : hasContent ? (
          <div>
            {sections.flatMap((section, sectionIndex) => {
              const rows: ReactNode[] = []

              if (section.title) {
                rows.push(
                  <div
                    key={`${section.title}-header`}
                    className="flex min-h-10 items-center bg-[var(--color-surface-muted)]/25 px-4"
                  >
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
                      {section.title}
                    </h4>
                  </div>,
                )
              }

              section.fields.forEach((field) => {
                rows.push(
                  <DashboardFieldCell
                    key={`${section.title || `section-${sectionIndex}`}-${field.label}`}
                    label={field.label}
                    value={field.value ?? DASH}
                    variant="profile"
                    href={field.href}
                    tone={field.tone}
                    sub={field.sub}
                  />,
                )
              })

              return rows
            })}
          </div>
        ) : flatEmptyMessage ? (
          <div className="px-4 py-6 text-center text-xs leading-relaxed text-[var(--color-muted)]">
            {flatEmptyMessage}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <article className={cn(crmPanelClassName, 'h-full', className)}>
      {isLoading ? (
        <CardSkeleton rows={rowCount || 4} />
      ) : (
        <>
          {sections.map((section, index) => {
            const theme = resolveSectionTheme(section.title)

            return (
              <section
                key={section.title}
                id={profileSectionAnchorId(section.title)}
                aria-label={section.title}
                className={cn(index > 0 ? dashboardSectionSeparatorClassName() : undefined, 'scroll-mt-24')}
              >
                <header className={dashboardSectionHeaderClassName(section.title, theme)}>
                  <DashboardSectionTitle
                    as="h4"
                    title={section.title}
                    icon={resolveSectionIcon(section.title)}
                    theme={theme}
                  />
                </header>
                <div className={dashboardDivideYClassName}>
                  {section.fields.length > 0 ? (
                    section.fields.map((field) => (
                      <DashboardFieldCell
                        key={`${section.title}-${field.label}`}
                        label={field.label}
                        value={field.value ?? DASH}
                        variant="profile"
                        href={field.href}
                        tone={field.tone}
                        sub={field.sub}
                      />
                    ))
                  ) : section.emptyMessage ? (
                    <div className="px-4 py-6 text-center text-xs leading-relaxed text-[var(--color-muted)]">
                      {section.emptyMessage}
                    </div>
                  ) : null}
                </div>
              </section>
            )
          })}
        </>
      )}
    </article>
  )
}

function CardSkeleton({ rows }: { rows: number }) {
  return (
    <div className={dashboardDivideYClassName}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className={cn(dashboardFieldCellClassName, 'flex items-center justify-between gap-3')}>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  )
}
