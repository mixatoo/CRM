import type { ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { Page } from '@/design-system/layout/Page'
import { WorkspaceContent } from '@/design-system/layout/WorkspaceContent'
import { WorkspaceZone } from '@/design-system/layout/WorkspaceZone'
import { CardSkeleton } from '@/design-system/components/Skeleton'
import { layout } from '@/design-system/tokens/layout'
import {
  tripWorkspaceSectionClassName,
  tripWorkspaceShellClassName,
} from '@/features/trips/components/workspace/trip-workspace-chrome'
import { TripWorkspaceNav } from '@/features/trips/components/workspace/TripWorkspaceNav'
import { cn } from '@/shared/utils/cn'

interface TripWorkspaceLayoutProps {
  children: ReactNode
  progressSlot?: ReactNode
  scroll?: boolean
  className?: string
  contentClassName?: string
  loading?: boolean
  notFound?: ReactNode
}

export function TripWorkspaceLayout({
  children,
  progressSlot,
  scroll = true,
  className,
  contentClassName,
  loading,
  notFound,
}: TripWorkspaceLayoutProps) {
  const { tripId } = useParams()

  if (!tripId) return null

  return (
    <Page layout="viewportFlush" className={cn('h-full min-h-0 flex-1', className)}>
      <div className={tripWorkspaceShellClassName}>
        <section className={cn(tripWorkspaceSectionClassName, 'shrink-0')}>
          <WorkspaceZone label="Trip navigation" className="gap-0">
            <TripWorkspaceNav progressSlot={progressSlot} />
          </WorkspaceZone>
        </section>

        <section className={cn(tripWorkspaceSectionClassName, 'flex min-h-0 flex-1 flex-col')}>
          {notFound ? (
            <WorkspaceContent className="h-full min-h-0 flex-1">{notFound}</WorkspaceContent>
          ) : loading ? (
            <WorkspaceContent className="h-full min-h-0 flex-1">
              <div className="space-y-3 p-4">
                <CardSkeleton />
                <CardSkeleton />
                <div className="grid gap-3 lg:grid-cols-2">
                  <CardSkeleton />
                  <CardSkeleton />
                </div>
              </div>
            </WorkspaceContent>
          ) : (
            <WorkspaceContent scroll={scroll} className={cn('h-full min-h-0 flex-1', contentClassName)}>
              {children}
            </WorkspaceContent>
          )}
        </section>
      </div>
    </Page>
  )
}

export function tripWorkspaceNotFound(title: string, description?: string, action?: ReactNode) {
  return (
    <div
      className={cn(
        'flex h-full min-h-[12rem] flex-col items-center justify-center p-4 text-center',
        layout.pageContent,
      )}
    >
      <h2 className={layout.entityTitle}>{title}</h2>
      {description ? <p className={cn('mt-1', layout.caption)}>{description}</p> : null}
      {action}
    </div>
  )
}
