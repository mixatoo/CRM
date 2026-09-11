import { HeaderCreateMenu } from '@/app/layout/top-bar/HeaderCreateMenu'
import { HeaderNotifications } from '@/app/layout/top-bar/HeaderNotifications'
import { HeaderUserMenu } from '@/app/layout/top-bar/HeaderUserMenu'
import { topBarActionRailClass, topBarActionDividerClass } from '@/app/layout/top-bar/top-bar-styles'
import { cn } from '@/shared/utils/cn'

interface HeaderActionsRailProps {
  darkMode: boolean
  onToggleTheme: () => void
  className?: string
}

export function HeaderActionsRail({ darkMode, onToggleTheme, className }: HeaderActionsRailProps) {
  return (
    <div className={cn(topBarActionRailClass, className)}>
      <HeaderCreateMenu />
      <span className={topBarActionDividerClass} aria-hidden />
      <HeaderNotifications />
      <span className={topBarActionDividerClass} aria-hidden />
      <HeaderUserMenu darkMode={darkMode} onToggleTheme={onToggleTheme} />
    </div>
  )
}
