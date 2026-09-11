import type { Invoice } from '@/domain/entities/invoice'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { InvoiceDetailDialog } from '@/features/trips/components/invoices/InvoiceDetailDialog'
import { useInvoiceMutations } from '@/features/trips/hooks/use-invoice-mutations'
import { useTrip } from '@/features/trips/hooks/use-trips'
import { useTripServices } from '@/features/trips/hooks/use-trip-services'

interface ClientInvoiceDetailHostProps {
  invoice: Invoice | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}

export function ClientInvoiceDetailHost({
  invoice,
  open,
  onOpenChange,
  onDeleted,
}: ClientInvoiceDetailHostProps) {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const tripId = invoice?.tripId
  const { data: trip } = useTrip(tripId)
  const { data: services = [] } = useTripServices(tripId ?? '')
  const { updateInvoiceStatus, deleteInvoice, isUpdatePending, isDeletePending } = useInvoiceMutations(tripId ?? '')

  if (!invoice || !trip) return null

  return (
    <InvoiceDetailDialog
      open={open}
      onOpenChange={onOpenChange}
      trip={trip}
      invoice={invoice}
      services={services}
      role={role}
      isUpdating={isUpdatePending}
      isDeleting={isDeletePending}
      onStatusChange={(status) => updateInvoiceStatus({ invoiceId: invoice.id, status })}
      onDelete={() =>
        deleteInvoice(invoice.id, {
          onSuccess: () => {
            onOpenChange(false)
            onDeleted?.()
          },
        })
      }
    />
  )
}
