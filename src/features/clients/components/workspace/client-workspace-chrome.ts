import { cn } from '@/shared/utils/cn'

/** Edge-to-edge workspace chrome — matches the accounts list flush layout. */
export const clientWorkspaceFlushSurfaceClassName = 'rounded-none border-0 shadow-none'

/** Visible bands between stacked workspace blocks (page bg shows through). */
export const clientWorkspaceSectionsStackClassName =
  'flex h-full min-h-0 flex-1 flex-col gap-1.5 bg-[var(--color-bg)]'

export const clientWorkspaceSectionClassName = 'min-w-0 bg-[var(--color-surface)]'

export const clientWorkspaceShellClassName = cn(clientWorkspaceSectionsStackClassName)
