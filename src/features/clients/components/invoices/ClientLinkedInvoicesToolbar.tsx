import type { ReactNode } from 'react'
import { ClientsPageTitle } from '@/features/clients/components/list/ClientsPageTitle'
import {
  clientsToolbarActionsSlotClassName,
  clientsToolbarRowClassName,
  clientsToolbarTitleSlotClassName,
} from '@/features/clients/components/list/clients-toolbar-chrome'
import { cn } from '@/shared/utils/cn'

interface ClientLinkedInvoicesToolbarProps {
  total?: number
  isFetching?: boolean
  columnPicker?: ReactNode
  className?: string
}

export function ClientLinkedInvoicesToolbar({
  total,
  isFetching,
  columnPicker,
  className,
}: ClientLinkedInvoicesToolbarProps) {
  return (
    <div className={cn(clientsToolbarRowClassName, className)}>
      <div className={clientsToolbarTitleSlotClassName}>
        <ClientsPageTitle
          title="Invoices"
          matchCount={total}
          isFetching={isFetching}
          countSingular="invoice"
          countPlural="invoices"
          headingLevel="h2"
        />
      </div>

      {columnPicker ? <div className={clientsToolbarActionsSlotClassName}>{columnPicker}</div> : null}
    </div>
  )
}
