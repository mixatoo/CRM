import { Menu } from 'lucide-react'
import { Link } from 'react-router-dom'
import { topBarIconButtonClass } from '@/app/layout/top-bar/top-bar-styles'
import { Button } from '@/design-system/components/Button'
import { AppBrand } from '@/shared/brand/AppBrand'
import { cn } from '@/shared/utils/cn'

interface HeaderBrandProps {
  onOpenMobileNav: () => void
}

export function HeaderBrand({ onOpenMobileNav }: HeaderBrandProps) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <Button
        variant="ghost"
        size="icon"
        className={cn(topBarIconButtonClass, 'h-10 w-10 touch-manipulation lg:hidden')}
        onClick={onOpenMobileNav}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Link
        to="/"
        className="hidden rounded-[var(--radius-md)] py-1 pr-1 transition-colors hover:bg-[var(--color-surface-muted)]/80 sm:block"
      >
        <AppBrand tone="header" />
      </Link>
      <Link
        to="/"
        className="rounded-[var(--radius-md)] p-1 transition-colors hover:bg-[var(--color-surface-muted)]/80 sm:hidden"
        aria-label="Egyliere OPs home"
      >
        <AppBrand tone="header" showWordmark={false} />
      </Link>
    </div>
  )
}
