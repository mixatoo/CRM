import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { topBarIconButtonClass, topBarMenuItemClass } from '@/app/layout/top-bar/top-bar-styles'
import { Button } from '@/design-system/components/Button'
import { Skeleton } from '@/design-system/components/Skeleton'
import { useNotifications } from '@/features/notifications/hooks/use-notifications'
import { cn } from '@/shared/utils/cn'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

export function HeaderNotifications() {
  const { data: notifications = [], isLoading } = useNotifications()
  const unreadCount = notifications.filter((item) => item.unread).length

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="icon" className={topBarIconButtonClass} aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-accent)] px-1 text-[9px] font-semibold leading-none text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="z-[500] w-80 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-lg" align="end" sideOffset={6}>
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-3 py-2">
            <div>
              <p className="text-xs font-semibold">Notifications</p>
              <p className="text-[10px] text-[var(--color-muted)]">{unreadCount > 0 ? `${unreadCount} need attention` : 'All caught up'}</p>
            </div>
            <Link to="/reminders" className="text-[10px] font-medium text-[var(--color-accent)] hover:underline">View all</Link>
          </div>
          {isLoading ? (
            <div className="space-y-2 px-3 py-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
          ) : notifications.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-[var(--color-muted)]">No notifications right now.</p>
          ) : (
            notifications.map((item) => (
              <DropdownMenu.Item key={item.id} asChild>
                <Link to={item.href ?? '/'} className={cn(topBarMenuItemClass, 'flex-col items-start gap-0.5 px-3 py-2 no-underline', item.unread && 'bg-[var(--color-accent-muted)]/30')}>
                  <span className="text-xs font-medium">{item.title}</span>
                  <span className="text-[10px] text-[var(--color-muted)]">{item.meta}</span>
                </Link>
              </DropdownMenu.Item>
            ))
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
