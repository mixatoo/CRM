import type { ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/design-system/components/Button'
import { ClientsPageTitle } from '@/features/clients/components/list/ClientsPageTitle'
import {
  clientsToolbarActionsSlotClassName,
  clientsToolbarRowClassName,
  clientsToolbarTitleSlotClassName,
} from '@/features/clients/components/list/clients-toolbar-chrome'
import { cn } from '@/shared/utils/cn'

interface ClientLinkedPaymentsToolbarProps {
  total?: number
  isFetching?: boolean
  columnPicker?: ReactNode
  onRecordCollection?: () => void
  canCreate?: boolean
  className?: string
}

export function ClientLinkedPaymentsToolbar({
  total,
  isFetching,
  columnPicker,
  onRecordCollection,
  canCreate = false,
  className,
}: ClientLinkedPaymentsToolbarProps) {
  return (
    <div className={cn(clientsToolbarRowClassName, className)}>
      <div className={clientsToolbarTitleSlotClassName}>
        <ClientsPageTitle
          title="Collections"
          matchCount={total}
          isFetching={isFetching}
          countSingular="collection"
          countPlural="collections"
          headingLevel="h2"
        />
      </div>

      <div className={clientsToolbarActionsSlotClassName}>
        {canCreate && onRecordCollection ? (
          <Button type="button" size="sm" className="h-8 gap-1 px-2.5" onClick={onRecordCollection}>
            <Plus className="h-3.5 w-3.5" />
            Record collection
          </Button>
        ) : null}
        {columnPicker}
      </div>
    </div>
  )
}
