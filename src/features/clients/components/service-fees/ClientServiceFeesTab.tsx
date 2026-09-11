import { ClientServiceFeesSection } from '@/features/clients/components/service-fees/ClientServiceFeesSection'

interface ClientServiceFeesTabProps {
  clientId: string
  disabled?: boolean
  layout?: 'profile' | 'section'
}

export function ClientServiceFeesTab({
  clientId,
  disabled,
  layout = 'profile',
}: ClientServiceFeesTabProps) {
  return (
    <ClientServiceFeesSection
      clientId={clientId}
      disabled={disabled}
      variant={layout === 'section' ? 'panel' : 'profile'}
    />
  )
}
