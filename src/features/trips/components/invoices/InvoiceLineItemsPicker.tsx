import { Check } from 'lucide-react'
import type { TripService } from '@/domain/entities/trip-service'
import { Button } from '@/design-system/components/Button'
import { AccountingAmount } from '@/design-system/components/AccountingAmount'
import { TripServiceStatusBadge } from '@/features/trips/components/services/TripServiceStatusBadge'
import { formatServiceCategory } from '@/domain/entities/trip-service'
import { tripServiceSelling } from '@/features/trips/components/services/trip-service-financial'
import { cn } from '@/shared/utils/cn'

interface InvoiceLineItemsPickerProps {
  services: TripService[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function InvoiceLineItemsPicker({ services, selectedIds, onChange }: InvoiceLineItemsPickerProps) {
  const allSelected = services.length > 0 && services.every((service) => selectedIds.includes(service.id))

  const toggleAll = () => {
    onChange(allSelected ? [] : services.map((service) => service.id))
  }

  const toggleOne = (serviceId: string) => {
    onChange(
      selectedIds.includes(serviceId)
        ? selectedIds.filter((id) => id !== serviceId)
        : [...selectedIds, serviceId],
    )
  }

  if (services.length === 0) {
    return (
      <p className="px-3 py-8 text-center text-sm text-[var(--color-muted)]">
        No billable services. Add or confirm trip services first.
      </p>
    )
  }

  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] px-3 py-2">
        <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-subtle)]">
          {selectedIds.length} of {services.length} selected
        </span>
        <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs font-normal" onClick={toggleAll}>
          {allSelected ? 'Clear all' : 'Select all'}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[28rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/50 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--color-subtle)]">
              <th className="w-10 px-3 py-2">
                <span className="sr-only">Select</span>
              </th>
              <th className="px-3 py-2">Service</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => {
              const selected = selectedIds.includes(service.id)
              return (
                <tr
                  key={service.id}
                  className={cn(
                    'cursor-pointer border-b border-[var(--color-border)]/70 transition-colors hover:bg-[var(--color-surface-elevated)]/60',
                    selected && 'bg-[var(--color-accent-muted)]/20',
                  )}
                  onClick={() => toggleOne(service.id)}
                >
                  <td className="px-3 py-2.5">
                    <span
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded-[var(--radius-sm)] border',
                        selected
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                          : 'border-[var(--color-border-strong)] bg-[var(--color-surface)]',
                      )}
                      aria-hidden
                    >
                      {selected ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : null}
                    </span>
                  </td>
                  <td className="max-w-[14rem] truncate px-3 py-2.5 font-medium">{service.name}</td>
                  <td className="px-3 py-2.5 text-xs text-[var(--color-muted)]">
                    {formatServiceCategory(service.category)}
                  </td>
                  <td className="px-3 py-2.5">
                    <TripServiceStatusBadge status={service.status} className="h-5 px-1.5 text-[10px]" />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <AccountingAmount amount={tripServiceSelling(service)} currency={service.currency} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
