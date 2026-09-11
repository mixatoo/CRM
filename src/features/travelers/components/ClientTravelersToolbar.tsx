import { useState, type ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { SearchField } from '@/design-system/components/SearchField'
import { Button } from '@/design-system/components/Button'
import { ClientsPageTitle } from '@/features/clients/components/list/ClientsPageTitle'
import {
  clientsToolbarActionsSlotClassName,
  clientsToolbarRowClassName,
  clientsToolbarTitleSlotClassName,
} from '@/features/clients/components/list/clients-toolbar-chrome'
import { CRM_LABELS } from '@/features/clients/config/crm-labels'
import { cn } from '@/shared/utils/cn'

interface ClientTravelersToolbarProps {
  total?: number
  isFetching?: boolean
  search: string
  onSearchChange: (value: string) => void
  canCreate?: boolean
  onCreate?: () => void
  columnPicker?: ReactNode
  className?: string
}

export function ClientTravelersToolbar({
  total,
  isFetching,
  search,
  onSearchChange,
  canCreate,
  onCreate,
  columnPicker,
  className,
}: ClientTravelersToolbarProps) {
  const [searchOpen, setSearchOpen] = useState(() => search.trim().length > 0)

  return (
    <div className={cn(clientsToolbarRowClassName, className)}>
      <div className={clientsToolbarTitleSlotClassName}>
        <ClientsPageTitle
          title={CRM_LABELS.travelers}
          matchCount={total}
          isFetching={isFetching}
          countSingular={CRM_LABELS.traveler.toLowerCase()}
          countPlural={CRM_LABELS.travelers.toLowerCase()}
          headingLevel="h2"
        />
      </div>

      <div className={clientsToolbarActionsSlotClassName}>
        <SearchField
          value={search}
          onValueChange={onSearchChange}
          open={searchOpen}
          onOpenChange={setSearchOpen}
          placeholder="ID, name, role, email, or phone"
          aria-label="Search travelers by ID, name, role, email, or phone"
          density="toolbar"
        />
        {columnPicker}
        {canCreate && onCreate ? (
          <Button variant="primary" size="sm" className="h-8 shrink-0 gap-1.5" onClick={onCreate}>
            <Plus className="h-3.5 w-3.5" />
            {CRM_LABELS.addTraveler}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
