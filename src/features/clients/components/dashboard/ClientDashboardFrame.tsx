import type { ReactNode } from 'react'
import { clientWorkspaceFlushSurfaceClassName } from '@/features/clients/components/workspace/client-workspace-chrome'
import { dashboardShellClassName } from '@/features/clients/components/dashboard/client-dashboard-modern-ui'
import { cn } from '@/shared/utils/cn'

interface ClientDashboardFrameProps {
  children: ReactNode
}

export function ClientDashboardFrame({ children }: ClientDashboardFrameProps) {
  return (
    <div className={cn('flex h-full min-h-0 flex-1 flex-col overflow-hidden', clientWorkspaceFlushSurfaceClassName, dashboardShellClassName)}>
      {children}
    </div>
  )
}
