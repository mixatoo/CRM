import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { SessionTimeout } from '@/features/auth/components/SessionTimeout'
import { useTripTabsSync } from '@/features/trips/hooks/use-trip-tabs-sync'
import { useClientTabsSync } from '@/features/clients/hooks/use-client-tabs-sync'
import { useSupplierTabsSync } from '@/features/suppliers/hooks/use-supplier-tabs-sync'
import { useUiStore } from '@/shared/stores/ui-store'
import { useEffect } from 'react'
import { cn } from '@/shared/utils/cn'

export function AppShell() {
  const mobileSidebarOpen = useUiStore((s) => s.mobileSidebarOpen)
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen)
  useTripTabsSync()
  useClientTabsSync()
  useSupplierTabsSync()

  useEffect(() => {
    if (!mobileSidebarOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileSidebarOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileSidebarOpen, setMobileSidebarOpen])

  return (
    <div className="flex h-full overflow-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[var(--radius-md)] focus:bg-[var(--color-accent)] focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>

      {mobileSidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Close navigation menu"
          onClick={() => setMobileSidebarOpen(false)}
        />
      ) : null}

      <div className="hidden shrink-0 lg:flex">
        <Sidebar />
      </div>

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 lg:hidden',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'transition-transform duration-200',
        )}
      >
        <Sidebar mobile onNavigate={() => setMobileSidebarOpen(false)} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar />
        <main id="main-content" className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--color-bg)]">
          <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col">
            <Outlet />
          </div>
        </main>
      </div>
      <SessionTimeout />
    </div>
  )
}
