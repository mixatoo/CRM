import { ChevronDown, HelpCircle, LogOut, Moon, Settings, Sun, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { topBarMenuItemClass } from '@/app/layout/top-bar/top-bar-styles'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { cn } from '@/shared/utils/cn'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

interface HeaderUserMenuProps {
  darkMode: boolean
  onToggleTheme: () => void
}

export function HeaderUserMenu({ darkMode, onToggleTheme }: HeaderUserMenuProps) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="User menu"
          className={cn(
            'flex h-8 max-w-[10rem] items-center gap-2 rounded-[var(--radius-md)] px-1.5 transition-colors',
            'hover:bg-[var(--color-surface-muted)]',
          )}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-[10px] font-semibold text-white">
            {user?.initials ?? '?'}
          </span>
          <span className="hidden min-w-0 truncate text-left leading-tight lg:block">
            <span className="block truncate text-xs font-medium text-[var(--color-foreground)]">{user?.name}</span>
          </span>
          <ChevronDown className="hidden h-3 w-3 shrink-0 text-[var(--color-subtle)] lg:block" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-[500] min-w-[220px] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-lg"
          align="end"
          sideOffset={6}
        >
          <div className="border-b border-[var(--color-border)] px-3 py-2.5">
            <div className="text-sm font-medium">{user?.name}</div>
            <div className="text-[10px] capitalize text-[var(--color-muted)]">{user?.role}</div>
            <div className="mt-0.5 truncate text-[10px] text-[var(--color-subtle)]">{user?.email}</div>
          </div>
          <DropdownMenu.Item className={topBarMenuItemClass} disabled>
            <User className="h-3.5 w-3.5 text-[var(--color-muted)]" />
            My profile
          </DropdownMenu.Item>
          <DropdownMenu.Item className={topBarMenuItemClass} disabled>
            <Settings className="h-3.5 w-3.5 text-[var(--color-muted)]" />
            Account settings
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-[var(--color-border)]" />
          <DropdownMenu.Item className={topBarMenuItemClass}>
            <HelpCircle className="h-3.5 w-3.5 text-[var(--color-muted)]" />
            Help center
          </DropdownMenu.Item>
          <DropdownMenu.Item className={topBarMenuItemClass} disabled>
            <Settings className="h-3.5 w-3.5 text-[var(--color-muted)]" />
            App settings
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className={topBarMenuItemClass}
            onSelect={(event) => {
              event.preventDefault()
              onToggleTheme()
            }}
          >
            {darkMode ? (
              <Sun className="h-3.5 w-3.5 text-[var(--color-muted)]" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-[var(--color-muted)]" />
            )}
            {darkMode ? 'Light mode' : 'Dark mode'}
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-[var(--color-border)]" />
          <DropdownMenu.Item
            className={cn(
              topBarMenuItemClass,
              'text-[var(--color-danger)] data-[highlighted]:bg-[var(--color-danger-muted)]',
            )}
            onSelect={() => {
              logout()
              navigate('/login')
            }}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
