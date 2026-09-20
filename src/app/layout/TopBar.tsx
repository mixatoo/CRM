import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HeaderBrand } from '@/app/layout/top-bar/HeaderBrand'
import { HeaderContextZone } from '@/app/layout/top-bar/HeaderContextZone'
import { HeaderActionsRail } from '@/app/layout/top-bar/HeaderActionsRail'
import { HeaderGlobalSearch } from '@/app/layout/top-bar/HeaderGlobalSearch'
import { topBarRightClusterClass, topBarRowClass, topBarShellClass } from '@/app/layout/top-bar/top-bar-styles'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import { useTripsSearchStore } from '@/shared/stores/trips-search-store'
import { useUiStore } from '@/shared/stores/ui-store'

export function TopBar() {
  const navigate = useNavigate()
  const { darkMode, toggleDarkMode, setMobileSidebarOpen } = useUiStore()
  const searchInput = useTripsSearchStore((state) => state.searchInput)
  const setSearchInput = useTripsSearchStore((state) => state.setSearchInput)
  const debouncedSearch = useDebouncedValue(searchInput, 300)
  const [searchOpen, setSearchOpen] = useState(() => searchInput.trim().length > 0)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!debouncedSearch.trim()) return
    navigate(`/search?q=${encodeURIComponent(debouncedSearch.trim())}`)
  }, [debouncedSearch, navigate])

  return (
    <header className={topBarShellClass}>
      <div className={topBarRowClass}>
        <HeaderBrand onOpenMobileNav={() => setMobileSidebarOpen(true)} />

        <HeaderContextZone className={searchOpen ? 'max-md:invisible max-md:pointer-events-none' : undefined} />

        <div className={topBarRightClusterClass}>
          <HeaderGlobalSearch
            value={searchInput}
            onValueChange={setSearchInput}
            open={searchOpen}
            onOpenChange={setSearchOpen}
            className={
              searchOpen
                ? 'absolute top-1/2 left-2 right-2 z-20 -translate-y-1/2 md:static md:inset-auto md:translate-y-0'
                : undefined
            }
          />

          <HeaderActionsRail
            darkMode={darkMode}
            onToggleTheme={toggleDarkMode}
            className={searchOpen ? 'max-md:invisible max-md:pointer-events-none' : undefined}
          />
        </div>
      </div>
    </header>
  )
}
