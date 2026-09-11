import type { ReactNode } from 'react'
import { ClientsPageTitle } from '@/features/clients/components/list/ClientsPageTitle'
import {
  clientsToolbarActionsSlotClassName,
  clientsToolbarRowClassName,
  clientsToolbarTitleSlotClassName,
} from '@/features/clients/components/list/clients-toolbar-chrome'
import { cn } from '@/shared/utils/cn'

interface ClientLinkedServicesToolbarProps {
  total?: number
  isFetching?: boolean
  columnPicker?: ReactNode
  className?: string
}

export function ClientLinkedServicesToolbar({
  total,
  isFetching,
  columnPicker,
  className,
}: ClientLinkedServicesToolbarProps) {
  return (
    <div className={cn(clientsToolbarRowClassName, className)}>
      <div className={clientsToolbarTitleSlotClassName}>
        <ClientsPageTitle
          title="Trip services"
          matchCount={total}
          isFetching={isFetching}
          countSingular="service"
          countPlural="services"
          headingLevel="h2"
        />
      </div>

      {columnPicker ? <div className={clientsToolbarActionsSlotClassName}>{columnPicker}</div> : null}
    </div>
  )
}
