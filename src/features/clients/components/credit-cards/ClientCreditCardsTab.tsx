import { ClientCreditCardsSection } from '@/features/clients/components/credit-cards/ClientCreditCardsSection'

interface ClientCreditCardsTabProps {
  clientId: string
  disabled?: boolean
  layout?: 'profile' | 'section'
}

export function ClientCreditCardsTab({
  clientId,
  disabled,
  layout = 'profile',
}: ClientCreditCardsTabProps) {
  return (
    <ClientCreditCardsSection
      clientId={clientId}
      disabled={disabled}
      variant={layout === 'section' ? 'panel' : 'profile'}
    />
  )
}
