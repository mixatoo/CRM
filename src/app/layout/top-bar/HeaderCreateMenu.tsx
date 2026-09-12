import { Plus, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { topBarMenuItemClass } from '@/app/layout/top-bar/top-bar-styles'
import { Button } from '@/design-system/components/Button'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { CRM_LABELS } from '@/features/clients/config/crm-labels'

export function HeaderCreateMenu() {
  const navigate = useNavigate()

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="primary" size="sm" className="h-8 gap-1 px-2.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New</span>
          <ChevronDown className="h-3 w-3 opacity-70" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-[500] w-44 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-lg"
          align="end"
          sideOffset={6}
        >
          <DropdownMenu.Item className={topBarMenuItemClass} onSelect={() => navigate('/trips?create=1')}>
            New trip
          </DropdownMenu.Item>
          <DropdownMenu.Item className={topBarMenuItemClass} onSelect={() => navigate('/transfers?create=1')}>
            New transfer
          </DropdownMenu.Item>
          <DropdownMenu.Item className={topBarMenuItemClass} onSelect={() => navigate('/clients?quickAdd=1')}>
            {CRM_LABELS.quickAddAccount}
          </DropdownMenu.Item>
          <DropdownMenu.Item className={topBarMenuItemClass} onSelect={() => navigate('/clients?create=1')}>
            {CRM_LABELS.newAccount}
          </DropdownMenu.Item>
          <DropdownMenu.Item className={topBarMenuItemClass} onSelect={() => navigate('/suppliers?create=1')}>
            New supplier
          </DropdownMenu.Item>
          <DropdownMenu.Item className={topBarMenuItemClass} onSelect={() => navigate('/travelers?create=1')}>
            {CRM_LABELS.newTraveler}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
