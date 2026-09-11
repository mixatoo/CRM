import { useMemo, useState } from 'react'
import { CreditCard, Plus } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { Button } from '@/design-system/components/Button'
import { CrmPanel } from '@/design-system/layout/CrmPanel'
import { useClientCreditCards } from '@/features/clients/hooks/use-client-credit-cards'
import { useClientCreditCardMutations } from '@/features/clients/hooks/use-client-credit-card-mutations'
import { ClientCreditCardAddDialog } from '@/features/clients/components/credit-cards/ClientCreditCardAddDialog'
import { ClientCreditCardsList } from '@/features/clients/components/credit-cards/ClientCreditCardsList'

function CreditCardsPanelEmptyState({
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
        <CreditCard className="h-5 w-5" strokeWidth={1.5} aria-hidden />
      </span>
      <div className="max-w-xs space-y-1.5">
        <p className="text-sm font-medium text-[var(--color-foreground)]">No cards on file</p>
        <p className="text-xs leading-relaxed text-[var(--color-muted)]">
          Only the last four digits are stored. CVV is never saved after validation.
        </p>
      </div>
      {!disabled ? (
        <Button type="button" size="sm" variant="secondary" onClick={onAdd} disabled={isPending}>
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Add card
        </Button>
      ) : null}
    </div>
  )
}

function CreditCardsProfileEmptyState({
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
        <p className="text-xs text-[var(--color-muted)]">No cards on file</p>
        <p className="text-[11px] leading-snug text-[var(--color-subtle)]">
          Only the last four digits are stored. CVV is never saved after validation.
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

function CreditCardsPanelToolbar({
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
        {count} card{count === 1 ? '' : 's'} on file · masked storage only
      </p>
      {!disabled ? (
        <Button type="button" size="sm" variant="ghost" onClick={onAdd} disabled={busy}>
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Add card
        </Button>
      ) : null}
    </div>
  )
}

function CreditCardsProfileToolbar({
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
        {count} card{count === 1 ? '' : 's'} on file
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

export function ClientCreditCardsSection({
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

  const { data: cards = [], isLoading, isFetching } = useClientCreditCards(clientId)
  const { setActiveForCard, deleteCard, isPending } = useClientCreditCardMutations(clientId)
  const [open, setOpen] = useState(false)

  const defaultIsActive = useMemo(() => {
    if (cards.length === 0) return true
    return !cards.some((c) => c.isActive)
  }, [cards])

  if (!clientId) return null

  const busy = isPending || isFetching
  const hasCards = cards.length > 0
  const isProfile = variant === 'profile'

  const addDialog = (
    <ClientCreditCardAddDialog
      open={open}
      onOpenChange={setOpen}
      clientId={clientId}
      defaultIsActive={defaultIsActive}
    />
  )

  const list = (
    <ClientCreditCardsList
      cards={cards}
      disabled={disabled}
      busy={busy}
      isLoading={isLoading}
      onSetActive={setActiveForCard}
      onDelete={disabled ? undefined : deleteCard}
    />
  )

  const panelActions = hasCards ? (
    <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-muted)]">
      {cards.length} saved
    </span>
  ) : null

  const EmptyState = isProfile ? CreditCardsProfileEmptyState : CreditCardsPanelEmptyState
  const Toolbar = isProfile ? CreditCardsProfileToolbar : CreditCardsPanelToolbar

  const content =
    !isLoading && !hasCards ? (
      <EmptyState disabled={disabled} onAdd={() => setOpen(true)} isPending={busy} />
    ) : (
      <>
        {hasCards ? (
          <Toolbar count={cards.length} disabled={disabled} busy={busy} onAdd={() => setOpen(true)} />
        ) : null}
        {list}
      </>
    )

  if (isProfile) {
    return (
      <>
        <div className="min-w-0">{content}</div>
        {addDialog}
      </>
    )
  }

  return (
    <>
      <CrmPanel title="Credit cards" actions={panelActions}>
        {content}
      </CrmPanel>
      {addDialog}
    </>
  )
}
