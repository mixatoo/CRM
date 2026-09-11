import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import { ClientDashboardBrowseFooter } from '@/features/clients/components/dashboard/ClientDashboardBrowseFooter'
import { ClientDashboardSectionList } from '@/features/clients/components/dashboard/ClientDashboardSectionList'
import {
  DASHBOARD_SECTIONS,
  getDashboardSection,
  type DashboardSectionId,
} from '@/features/clients/components/dashboard/dashboard-sections'
import {
  clientProfileBrowseGridClassName,
  clientProfileContentFadeClassName,
  clientProfileDetailBodyClassName,
  clientProfileDetailColumnClassName,
  clientProfileDetailDescClassName,
  clientProfileDetailHeaderClassName,
  clientProfileDetailScrollClassName,
  clientProfileDetailTitleClassName,
  clientProfileListColumnClassName,
} from '@/features/clients/components/profile/client-profile-browse-ui'
import { cn } from '@/shared/utils/cn'

interface ClientDashboardBrowseViewProps {
  section: DashboardSectionId
  onSectionChange: (section: DashboardSectionId) => void
  headerAside?: ReactNode
  children: ReactNode
  className?: string
}

function sectionIndex(section: DashboardSectionId) {
  return DASHBOARD_SECTIONS.findIndex((item) => item.id === section)
}

export function ClientDashboardBrowseView({
  section,
  onSectionChange,
  headerAside,
  children,
  className,
}: ClientDashboardBrowseViewProps) {
  const detailScrollRef = useRef<HTMLDivElement>(null)
  const current = getDashboardSection(section)
  const index = sectionIndex(section)
  const isFirst = index <= 0
  const isLast = index >= DASHBOARD_SECTIONS.length - 1

  useEffect(() => {
    detailScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [section])

  const goBack = useCallback(() => {
    const prev = DASHBOARD_SECTIONS[index - 1]
    if (prev) onSectionChange(prev.id)
  }, [index, onSectionChange])

  const goNext = useCallback(() => {
    const next = DASHBOARD_SECTIONS[index + 1]
    if (next) onSectionChange(next.id)
  }, [index, onSectionChange])

  return (
    <div className={cn('flex h-full min-h-0 flex-1 flex-col overflow-hidden', className)}>
      <div
        className={cn(
          'grid h-full min-h-0 flex-1 grid-rows-[minmax(0,1fr)] overflow-hidden md:items-stretch',
          clientProfileBrowseGridClassName,
        )}
      >
        <aside className={clientProfileListColumnClassName}>
          <ClientDashboardSectionList section={section} onSectionChange={onSectionChange} className="h-full min-h-0" />
        </aside>

        <div className={clientProfileDetailColumnClassName}>
          <header className={clientProfileDetailHeaderClassName}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className={clientProfileDetailTitleClassName}>{current.label}</h2>
                <p className={clientProfileDetailDescClassName}>{current.description}</p>
              </div>
              {headerAside ? <div className="shrink-0">{headerAside}</div> : null}
            </div>
          </header>

          <div className={clientProfileDetailBodyClassName}>
            <div ref={detailScrollRef} className={cn(clientProfileDetailScrollClassName, '-mx-2 px-0 py-0 sm:-mx-4')}>
              <div key={section} className={clientProfileContentFadeClassName}>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ClientDashboardBrowseFooter
        isFirstStep={isFirst}
        isLastStep={isLast}
        onBack={goBack}
        onNext={goNext}
        sectionLabel={current.label}
        stepIndex={index}
        stepCount={DASHBOARD_SECTIONS.length}
      />
    </div>
  )
}
