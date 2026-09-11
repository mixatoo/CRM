import type { ClientServiceFee } from '@/domain/entities/client-service-fee'
import { ClientServiceFeesTable } from '@/features/clients/components/service-fees/ClientServiceFeesTable'

interface ClientServiceFeesListProps {
  fees: ClientServiceFee[]
  disabled?: boolean
  busy?: boolean
  isLoading?: boolean
  onEdit?: (fee: ClientServiceFee) => void
  onDelete?: (feeId: string) => void
}

export function ClientServiceFeesList({
  fees,
  disabled,
  busy,
  isLoading,
  onEdit,
  onDelete,
}: ClientServiceFeesListProps) {
  return (
    <ClientServiceFeesTable
      fees={fees}
      disabled={disabled}
      busy={busy}
      isLoading={isLoading}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  )
}
