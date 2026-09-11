import { useMemo } from 'react'
import type { ClientCreditCard } from '@/domain/entities/client-credit-card'
import { ClientCreditCardsTable } from '@/features/clients/components/credit-cards/ClientCreditCardsTable'

interface ClientCreditCardsListProps {
  cards: ClientCreditCard[]
  disabled?: boolean
  busy?: boolean
  isLoading?: boolean
  onSetActive: (cardId: string) => void
  onDelete?: (cardId: string) => void
}

export function ClientCreditCardsList({
  cards,
  disabled,
  busy,
  isLoading,
  onSetActive,
  onDelete,
}: ClientCreditCardsListProps) {
  const sortedCards = useMemo(
    () =>
      [...cards].sort((a, b) => {
        if (a.isActive !== b.isActive) return a.isActive ? -1 : 1
        return b.createdAt.localeCompare(a.createdAt)
      }),
    [cards],
  )

  return (
    <ClientCreditCardsTable
      cards={sortedCards}
      disabled={disabled}
      busy={busy}
      isLoading={isLoading}
      onSetActive={onSetActive}
      onDelete={onDelete}
    />
  )
}
