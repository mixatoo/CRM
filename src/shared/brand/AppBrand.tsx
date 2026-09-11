import { AppLogoMark } from '@/shared/brand/AppLogoMark'
import { cn } from '@/shared/utils/cn'

type AppBrandTone = 'header' | 'sidebar' | 'login'

interface AppBrandProps {
  tone?: AppBrandTone
  showWordmark?: boolean
  /** Collapsed dock state — animates wordmark via clip-path wipe. */
  docked?: boolean
  tagline?: string
  className?: string
}

const MARK_SIZE = {
  header: 28,
  sidebar: 32,
  login: 40,
} as const

const MARK_SHELL = {
  header: 'rounded-[var(--radius-md)] shadow-none',
  sidebar: 'rounded-[var(--radius-md)] shadow-[0_2px_12px_rgba(37,99,235,0.35)]',
  login: 'rounded-[var(--radius-md)] shadow-[0_4px_14px_rgba(37,99,235,0.35)]',
} as const

const WORDMARK_CLASS = {
  header: 'text-sm text-[var(--color-foreground)]',
  sidebar: 'text-sm text-[var(--color-sidebar-text-strong)]',
  login: 'text-base text-[var(--color-auth-panel-text-strong)]',
} as const

const OPS_MUTED_CLASS = {
  header: 'text-[var(--color-muted)]',
  sidebar: 'text-[var(--color-sidebar-text)]',
  login: 'text-[var(--color-auth-panel-text)]',
} as const

const TAGLINE_CLASS = {
  header: 'text-[10px] uppercase tracking-[0.14em] text-[var(--color-muted)]',
  sidebar: 'text-[10px] uppercase tracking-[0.14em] text-[var(--color-sidebar-text)]',
  login: 'text-[11px] uppercase tracking-[0.12em] text-[var(--color-subtle)]',
} as const

export function AppBrand({
  tone = 'header',
  showWordmark = true,
  docked = false,
  tagline,
  className,
}: AppBrandProps) {
  return (
    <div className={cn('flex min-w-0 items-center', className)}>
      <div className={cn('flex shrink-0 items-center justify-center overflow-hidden', MARK_SHELL[tone])}>
        <AppLogoMark size={MARK_SIZE[tone]} />
      </div>
      {showWordmark ? (
        <div className="sidebar-detail-pane min-w-0 pl-2.5" aria-hidden={docked}>
          <div className={cn('truncate font-semibold tracking-tight whitespace-nowrap', WORDMARK_CLASS[tone])}>
            Egyliere<span className={cn('font-normal', OPS_MUTED_CLASS[tone])}>OPs</span>
          </div>
          {tagline ? (
            <div className={cn('truncate whitespace-nowrap', TAGLINE_CLASS[tone])}>{tagline}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
