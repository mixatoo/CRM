import { ChevronDown, Plus } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { topBarMenuItemClass } from '@/app/layout/top-bar/top-bar-styles'
import { Button } from '@/design-system/components/Button'
import { CRM_LABELS } from '@/features/clients/config/crm-labels'

interface ClientsCreateMenuProps {
  onCreate: () => void
  onQuickAdd: () => void
  onImport?: () => void
}

export function ClientsCreateMenu({ onCreate, onQuickAdd, onImport }: ClientsCreateMenuProps) {
  return (
    <div className="inline-flex shrink-0 items-stretch">
      <Button
        variant="primary"
        size="sm"
        className="h-8 gap-1 rounded-r-none border-r border-white/20 px-2.5 text-xs shadow-none"
        onClick={onCreate}
      >
        <Plus className="h-3.5 w-3.5" />
        {CRM_LABELS.addAccount}
      </Button>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button
            variant="primary"
            size="sm"
            className="h-8 w-7 shrink-0 rounded-l-none px-0 text-xs shadow-none"
            aria-label="More ways to add an account"
          >
            <ChevronDown className="h-3.5 w-3.5 opacity-80" />
          </Button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="z-[500] w-44 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-lg"
            align="end"
            sideOffset={6}
          >
            <DropdownMenu.Item className={topBarMenuItemClass} onSelect={onQuickAdd}>
              {CRM_LABELS.quickAddAccount}
            </DropdownMenu.Item>
            <DropdownMenu.Item className={topBarMenuItemClass} onSelect={onImport} disabled={!onImport}>
              {CRM_LABELS.importAccounts}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  )
}
