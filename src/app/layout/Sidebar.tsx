import { memo, useEffect, useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  MapPin,
  UserRound,
  Users,
  Building2,
  CarFront,
  Calendar,
  CalendarDays,
  Activity,
  ArrowLeftRight,
  FileText,
  LayoutGrid,
  LayoutDashboard,
  Kanban,
  FileSpreadsheet,
  Search,
  Settings,
  ChevronDown,
  ChevronsLeft,
} from 'lucide-react'
import { AppBrand } from '@/shared/brand/AppBrand'
import { cn } from '@/shared/utils/cn'
import { useUiStore } from '@/shared/stores/ui-store'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { filterSidebarForRole, SIDEBAR_GROUPS, type NavItem } from './nav-config'
import { useSidebarAnimating } from './use-sidebar-collapse-transition'
import type { UserRole } from '@/domain/entities'

const ICON_SLOT = 'flex h-9 w-[var(--sidebar-icon-slot)] shrink-0 items-center justify-center'

const iconMap: Record<string, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  trips: MapPin,
  transfers: CarFront,
  pipeline: Kanban,
  search: Search,
  calendar: CalendarDays,
  templates: LayoutGrid,
  clients: Users,
  travelers: UserRound,
  suppliers: Building2,
  reminders: Calendar,
  activity: Activity,
  transactions: ArrowLeftRight,
  invoices: FileSpreadsheet,
  reports: FileText,
  settings: Settings,
}

function isItemActive(pathname: string, to: string, id: string, end?: boolean) {
  if (id === 'trips') return pathname.startsWith('/trips')
  if (id === 'transfers') return pathname.startsWith('/transfers')
  if (id === 'dashboard') return pathname === '/'
  if (end) return pathname === to
  return pathname === to || pathname.startsWith(`${to}/`)
}

interface SidebarProps {
  onNavigate?: () => void
  mobile?: boolean
}

const NavItemLink = memo(function NavItemLink({
  item,
  active,
  docked,
  onNavigate,
}: {
  item: NavItem
  active: boolean
  docked: boolean
  onNavigate?: () => void
}) {
  const Icon = iconMap[item.id] ?? LayoutDashboard

  return (
    <NavLink
      to={item.to}
      end={item.end}
      title={docked ? item.label : undefined}
      onClick={onNavigate}
      className={cn(
        'group relative flex h-9 items-center rounded-[var(--radius-md)] text-[13px]',
        'sidebar-motion transition-[background-color,color,box-shadow]',
        active
          ? docked
            ? 'text-[var(--color-sidebar-active)]'
            : 'bg-[var(--color-sidebar-active-bg)] font-medium text-[var(--color-sidebar-active)]'
          : 'font-normal text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-text-strong)]',
      )}
    >
      <span
        className={cn(
          'absolute bottom-1.5 left-0 top-1.5 w-0.5 rounded-full bg-[var(--color-sidebar-active-icon)] sidebar-motion transition-opacity',
          active && !docked ? 'opacity-100' : 'opacity-0',
        )}
      />
      <span
        className={cn(
          ICON_SLOT,
          docked && active && 'rounded-[var(--radius-md)] bg-[var(--color-sidebar-active-bg)]',
        )}
      >
        <Icon
          className={cn(
            'h-4 w-4 sidebar-motion transition-colors',
            active ? 'text-[var(--color-sidebar-active-icon)]' : 'text-[var(--color-sidebar-text)] group-hover:text-[var(--color-sidebar-text-strong)]',
          )}
        />
      </span>
      <span className="sidebar-detail-pane min-w-0 flex-1 truncate whitespace-nowrap" aria-hidden={docked}>
        {item.label}
      </span>
      <span
        className={cn(
          'absolute right-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[var(--color-sidebar-active-icon)] sidebar-motion transition-opacity',
          active && docked ? 'opacity-100' : 'opacity-0',
        )}
      />
    </NavLink>
  )
})

function AccordionGroup({
  group,
  open,
  docked,
  pathname,
  showDockDivider,
  onToggle,
  onNavigate,
}: {
  group: { id: string; label: string; items: NavItem[] }
  open: boolean
  docked: boolean
  pathname: string
  showDockDivider: boolean
  onToggle: () => void
  onNavigate?: () => void
}) {
  const hasActive = group.items.some((item) => isItemActive(pathname, item.to, item.id, item.end))
  const itemsVisible = docked || open

  return (
    <section>
      <button
        type="button"
        onClick={onToggle}
        disabled={docked}
        tabIndex={docked ? -1 : 0}
        className={cn(
          'flex h-8 w-full items-center overflow-hidden rounded-[var(--radius-md)] text-left',
          docked && 'hidden',
          hasActive ? 'text-[var(--color-sidebar-text-strong)]' : 'text-[var(--color-sidebar-group)]',
          'hover:bg-[var(--color-sidebar-hover)]',
        )}
        aria-expanded={open}
        aria-hidden={docked}
      >
        <span className="sidebar-detail-pane min-w-0 flex-1 truncate px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em]">
          {group.label}
        </span>
        <ChevronDown
          className={cn(
            'mr-2 h-3.5 w-3.5 shrink-0 sidebar-motion transition-transform',
            open ? 'rotate-0' : '-rotate-90',
          )}
        />
      </button>

      {docked && showDockDivider ? (
        <div className="my-2 h-px bg-[var(--color-sidebar-border)]" role="presentation" />
      ) : null}

      <div
        className={cn(
          'grid sidebar-motion transition-[grid-template-rows]',
          itemsVisible ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <ul className="list-none space-y-0.5 overflow-hidden">
          {group.items.map((item) => (
            <li key={item.id}>
              <NavItemLink
                item={item}
                docked={docked}
                active={isItemActive(pathname, item.to, item.id, item.end)}
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function UserCard({ user }: { user: NonNullable<ReturnType<typeof useAuthStore.getState>['user']> }) {
  return (
    <div className="flex h-10 items-center rounded-[var(--radius-md)] border border-[var(--color-sidebar-border)] bg-[var(--color-auth-panel-surface)]">
      <span className={ICON_SLOT}>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent)] text-[11px] font-semibold text-white">
          {user.initials}
        </span>
      </span>
      <div className="sidebar-detail-pane min-w-0 flex-1 pr-2.5">
        <div className="truncate text-xs font-medium text-[var(--color-sidebar-text-strong)]">{user.name}</div>
        <div className="truncate text-[10px] capitalize text-[var(--color-sidebar-text)]">{user.role}</div>
      </div>
    </div>
  )
}

export function Sidebar({ onNavigate, mobile = false }: SidebarProps) {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed)
  const sidebarGroupsOpen = useUiStore((s) => s.sidebarGroupsOpen)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const toggleSidebarGroup = useUiStore((s) => s.toggleSidebarGroup)
  const setSidebarGroupOpen = useUiStore((s) => s.setSidebarGroupOpen)
  const user = useAuthStore((s) => s.user)
  const role = useAuthStore((s) => s.user?.role ?? 'guest') as UserRole
  const location = useLocation()

  const docked = !mobile && sidebarCollapsed
  const { isAnimating } = useSidebarAnimating(docked)

  const items = filterSidebarForRole(role)
  const groupedItems = useMemo(
    () =>
      SIDEBAR_GROUPS.map((group) => ({
        ...group,
        items: items.filter((item) => item.group === group.id),
      })).filter((group) => group.items.length > 0),
    [items],
  )

  useEffect(() => {
    if (docked) return
    for (const group of groupedItems) {
      const hasActive = group.items.some((item) =>
        isItemActive(location.pathname, item.to, item.id, item.end),
      )
      if (hasActive && !sidebarGroupsOpen[group.id]) {
        setSidebarGroupOpen(group.id, true)
      }
    }
  }, [location.pathname, groupedItems, docked, sidebarGroupsOpen, setSidebarGroupOpen])

  return (
    <aside
      data-docked={docked ? 'true' : 'false'}
      data-animating={isAnimating ? 'true' : 'false'}
      className={cn(
        'flex h-full flex-col overflow-hidden bg-[var(--color-sidebar)] sidebar-motion transition-[width]',
        docked ? 'w-[var(--sidebar-collapsed-width)]' : 'w-[var(--sidebar-width)]',
        mobile
          ? 'w-[min(var(--sidebar-width),min(20rem,calc(100vw-2.5rem)))] shadow-2xl'
          : 'border-r border-[var(--color-sidebar-border)]',
      )}
    >
      <div className="flex h-[3.75rem] shrink-0 items-center border-b border-[var(--color-sidebar-border)] bg-[var(--color-sidebar-elevated)] px-2">
        <AppBrand tone="sidebar" docked={docked} tagline="Travel CRM" />
      </div>

      <nav className="flex-1 overflow-x-hidden overflow-y-auto px-1.5 py-3" aria-label="Main navigation">
        <div className="space-y-1">
          {groupedItems.map((group, groupIndex) => (
            <AccordionGroup
              key={group.id}
              group={group}
              open={sidebarGroupsOpen[group.id] ?? true}
              docked={docked}
              pathname={location.pathname}
              showDockDivider={groupIndex > 0}
              onToggle={() => toggleSidebarGroup(group.id)}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </nav>

      <div className="shrink-0 border-t border-[var(--color-sidebar-border)] bg-[var(--color-sidebar-elevated)] p-2">
        {user ? <UserCard user={user} /> : null}

        {!mobile ? (
          <button
            type="button"
            onClick={toggleSidebar}
            className={cn(
              'mt-2 flex h-9 w-full items-center rounded-[var(--radius-md)] text-[var(--color-sidebar-text)]',
              'sidebar-motion transition-[background-color,color]',
              'hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-text-strong)]',
            )}
            aria-label={docked ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className={ICON_SLOT}>
              <ChevronsLeft
                className={cn(
                  'h-4 w-4 sidebar-motion transition-transform',
                  docked && 'rotate-180',
                )}
              />
            </span>
            <span className="sidebar-detail-pane truncate text-xs font-medium" aria-hidden={docked}>
              Collapse
            </span>
          </button>
        ) : null}
      </div>
    </aside>
  )
}
