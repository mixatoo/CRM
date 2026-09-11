import { useState } from 'react'
import { Percent, Plus } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { Button } from '@/design-system/components/Button'
import { CrmPanel } from '@/design-system/layout/CrmPanel'
import type { ClientServiceFee } from '@/domain/entities/client-service-fee'
import { useClientServiceFees } from '@/features/clients/hooks/use-client-service-fees'
import { useClientServiceFeeMutations } from '@/features/clients/hooks/use-client-service-fee-mutations'
import { ClientServiceFeeDialog } from '@/features/clients/components/service-fees/ClientServiceFeeDialog'
import { ClientServiceFeesList } from '@/features/clients/components/service-fees/ClientServiceFeesList'

function ServiceFeesPanelEmptyState({
  disabled,
  onAdd,
  isPending,
}: {
  disabled?: boolean
  onAdd: () => void
  isPending?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-[var(--color-border)] text-[var(--color-muted)]">
        <Percent className="h-5 w-5" strokeWidth={1.5} aria-hidden />
      </span>
      <div className="max-w-xs space-y-1.5">
        <p className="text-sm font-medium text-[var(--color-foreground)]">No service fees configured</p>
        <p className="text-xs leading-relaxed text-[var(--color-muted)]">
          Add the services you provide and set a percentage or fixed fee for each one on this account.
        </p>
      </div>
      {!disabled ? (
        <Button type="button" size="sm" variant="secondary" onClick={onAdd} disabled={isPending}>
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Add service fee
        </Button>
      ) : null}
    </div>
  )
}

function ServiceFeesProfileEmptyState({
  disabled,
  onAdd,
  isPending,
}: {
  disabled?: boolean
  onAdd: () => void
  isPending?: boolean
}) {
  return (
    <div className="flex min-h-10 items-start justify-between gap-4 px-4 py-3">
      <div className="min-w-0 space-y-0.5">
        <p className="text-xs text-[var(--color-muted)]">No service fees configured</p>
        <p className="text-[11px] leading-snug text-[var(--color-subtle)]">
          Percentage or fixed fee per service on this account.
        </p>
      </div>
      {!disabled ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="shrink-0"
          onClick={onAdd}
          disabled={isPending}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Add
        </Button>
      ) : null}
    </div>
  )
}

function ServiceFeesPanelToolbar({
  count,
  disabled,
  busy,
  onAdd,
}: {
  count: number
  disabled?: boolean
  busy?: boolean
  onAdd: () => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/30 px-3 py-2">
      <p className="text-xs text-[var(--color-muted)]">
        {count} service{count === 1 ? '' : 's'} · percentage or fixed fee per service
      </p>
      {!disabled ? (
        <Button type="button" size="sm" variant="ghost" onClick={onAdd} disabled={busy}>
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Add service fee
        </Button>
      ) : null}
    </div>
  )
}

function ServiceFeesProfileToolbar({
  count,
  disabled,
  busy,
  onAdd,
}: {
  count: number
  disabled?: boolean
  busy?: boolean
  onAdd: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] px-4 py-2">
      <p className="text-[11px] text-[var(--color-muted)]">
        {count} service{count === 1 ? '' : 's'} configured
      </p>
      {!disabled ? (
        <Button type="button" size="sm" variant="ghost" onClick={onAdd} disabled={busy}>
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Add
        </Button>
      ) : null}
    </div>
  )
}

export function ClientServiceFeesSection({
  clientId: clientIdProp,
  disabled,
  variant = 'panel',
}: {
  clientId?: string
  disabled?: boolean
  variant?: 'panel' | 'profile'
}) {
  const params = useParams()
  const clientId = clientIdProp ?? (params.clientId as string | undefined)

  const { data: fees = [], isLoading, isFetching } = useClientServiceFees(clientId)
  const { deleteFee, isPending } = useClientServiceFeeMutations(clientId)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFee, setEditingFee] = useState<ClientServiceFee | null>(null)

  if (!clientId) return null

  const busy = isPending || isFetching
  const hasFees = fees.length > 0
  const isProfile = variant === 'profile'

  const openAdd = () => {
    setEditingFee(null)
    setDialogOpen(true)
  }

  const openEdit = (fee: ClientServiceFee) => {
    setEditingFee(fee)
    setDialogOpen(true)
  }

  const feeDialog = (
    <ClientServiceFeeDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      clientId={clientId}
      fee={editingFee}
    />
  )

  const list = (
    <ClientServiceFeesList
      fees={fees}
      disabled={disabled}
      busy={busy}
      isLoading={isLoading}
      onEdit={disabled ? undefined : openEdit}
      onDelete={disabled ? undefined : deleteFee}
    />
  )

  const panelActions = hasFees ? (
    <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-muted)]">
      {fees.length} configured
    </span>
  ) : null

  const EmptyState = isProfile ? ServiceFeesProfileEmptyState : ServiceFeesPanelEmptyState
  const Toolbar = isProfile ? ServiceFeesProfileToolbar : ServiceFeesPanelToolbar

  const content =
    !isLoading && !hasFees ? (
      <EmptyState disabled={disabled} onAdd={openAdd} isPending={busy} />
    ) : (
      <>
        {hasFees ? (
          <Toolbar count={fees.length} disabled={disabled} busy={busy} onAdd={openAdd} />
        ) : null}
        {list}
      </>
    )

  if (isProfile) {
    return (
      <>
        <div className="min-w-0">{content}</div>
        {feeDialog}
      </>
    )
  }

  return (
    <>
      <CrmPanel title="Service fees" actions={panelActions}>
        {content}
      </CrmPanel>
      {feeDialog}
    </>
  )
}
