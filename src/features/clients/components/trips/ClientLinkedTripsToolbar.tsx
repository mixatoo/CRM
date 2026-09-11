import type { ReactNode } from 'react'
import { ClientsPageTitle } from '@/features/clients/components/list/ClientsPageTitle'
import {
  clientsToolbarActionsSlotClassName,
  clientsToolbarRowClassName,
  clientsToolbarTitleSlotClassName,
} from '@/features/clients/components/list/clients-toolbar-chrome'
import { cn } from '@/shared/utils/cn'

interface ClientLinkedTripsToolbarProps {
  total?: number
  isFetching?: boolean
  columnPicker?: ReactNode
  className?: string
}

export function ClientLinkedTripsToolbar({
  total,
  isFetching,
  columnPicker,
  className,
}: ClientLinkedTripsToolbarProps) {
  return (
    <div className={cn(clientsToolbarRowClassName, className)}>
      <div className={clientsToolbarTitleSlotClassName}>
        <ClientsPageTitle
          title="Linked trips"
          matchCount={total}
          isFetching={isFetching}
          countSingular="trip"
          countPlural="trips"
          headingLevel="h2"
        />
      </div>

      {columnPicker ? <div className={clientsToolbarActionsSlotClassName}>{columnPicker}</div> : null}
    </div>
  )
}
