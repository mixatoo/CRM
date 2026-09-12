import { Navigate, useParams } from 'react-router-dom'
import { WorkspaceShell } from '@/design-system/layout/WorkspaceShell'
import { WorkspaceContent } from '@/design-system/layout/WorkspaceContent'
import { WorkspaceZone } from '@/design-system/layout/WorkspaceZone'
import { CardSkeleton } from '@/design-system/components/Skeleton'
import { layout } from '@/design-system/tokens/layout'
import { cn } from '@/shared/utils/cn'
import { canMutate } from '@/domain/policies/permissions'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useTransfer } from '@/features/transfers/hooks/use-transfers'
import { useTransferMutations } from '@/features/transfers/hooks/use-transfer-mutations'
import { isTransferWorkspaceTab } from '@/features/transfers/config/workspace-tabs'
import { TransferWorkspaceNav } from '@/features/transfers/components/workspace/TransferWorkspaceNav'
import { TransferInfoBar } from '@/features/transfers/components/workspace/TransferInfoBar'
import { TransferTabContent } from '@/features/transfers/components/workspace/TransferTabContent'
import { TransferProgressBar } from '@/features/transfers/components/workspace/TransferProgressBar'

export function TransferWorkspacePage() {
  const { transferId, tab } = useParams()
  const activeTab = isTransferWorkspaceTab(tab) ? tab : 'route'
  const { data: transfer, isLoading } = useTransfer(transferId)
  const { updateTransfer } = useTransferMutations()
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const canEdit = canMutate(role, 'order', 'update')

  if (!transferId) return <Navigate to="/transfers" replace />

  if (!isLoading && !transfer) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center p-4 text-center">
        <h2 className={layout.entityTitle}>Transfer not found</h2>
      </div>
    )
  }

  const progressSlot = transfer ? (
    <TransferProgressBar
      stage={transfer.stage}
      lastPipelineStage={transfer.lastPipelineStage}
      disabled={!canEdit}
      onStageChange={(nextStage) =>
        updateTransfer.mutate({ id: transfer.id, patch: { stage: nextStage } })
      }
    />
  ) : undefined

  return (
    <WorkspaceShell layout="viewport">
      <WorkspaceZone label="Transfer navigation" className="shrink-0">
        <TransferWorkspaceNav progressSlot={progressSlot} />
      </WorkspaceZone>

      {transfer ? (
        <div className={cn('flex min-h-0 flex-1 flex-col', layout.workspaceCards)}>
          <TransferInfoBar transfer={transfer} />
          <WorkspaceContent className="min-h-0 flex-1">
            <TransferTabContent tab={activeTab} transfer={transfer} />
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
