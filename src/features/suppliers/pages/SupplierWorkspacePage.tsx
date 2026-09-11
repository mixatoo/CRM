import { Navigate, useParams } from 'react-router-dom'
import { WorkspaceShell } from '@/design-system/layout/WorkspaceShell'
import { WorkspaceContent } from '@/design-system/layout/WorkspaceContent'
import { WorkspaceZone } from '@/design-system/layout/WorkspaceZone'
import { CardSkeleton } from '@/design-system/components/Skeleton'
import { layout } from '@/design-system/tokens/layout'
import { cn } from '@/shared/utils/cn'
import { useSupplier } from '@/features/suppliers/hooks/use-suppliers'
import { isSupplierWorkspaceTab } from '@/features/suppliers/config/workspace-tabs'
import { SupplierWorkspaceNav } from '@/features/suppliers/components/workspace/SupplierWorkspaceNav'
import { SupplierInfoBar } from '@/features/suppliers/components/workspace/SupplierInfoBar'
import { SupplierTabContent } from '@/features/suppliers/components/workspace/SupplierTabContent'

export function SupplierWorkspacePage() {
  const { supplierId, tab } = useParams()
  const activeTab = isSupplierWorkspaceTab(tab) ? tab : 'overview'
  const { data: supplier, isLoading } = useSupplier(supplierId)

  if (!supplierId) return <Navigate to="/suppliers" replace />

  if (!isLoading && !supplier) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center p-4 text-center">
        <h2 className={layout.entityTitle}>Supplier not found</h2>
      </div>
    )
  }

  return (
    <WorkspaceShell layout="viewport">
      <WorkspaceZone label="Supplier navigation" className="shrink-0">
        <SupplierWorkspaceNav />
      </WorkspaceZone>

      {supplier ? (
        <div className={cn('flex min-h-0 flex-1 flex-col', layout.workspaceCards)}>
          <SupplierInfoBar supplier={supplier} />
          <WorkspaceContent className="min-h-0 flex-1">
            <SupplierTabContent tab={activeTab} supplier={supplier} />
          </WorkspaceContent>
        </div>
      ) : (
        <WorkspaceContent>
          <div className="space-y-3">
            <CardSkeleton />
            <CardSkeleton />
            <div className="grid gap-3 lg:grid-cols-2">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
        </WorkspaceContent>
      )}
    </WorkspaceShell>
  )
}
