import { cn } from '@/shared/utils/cn'

/** Edge-to-edge workspace chrome — matches the accounts list flush layout. */
export const tripWorkspaceFlushSurfaceClassName = 'rounded-none border-0 shadow-none'

export const tripWorkspaceSectionsStackClassName =
  'flex h-full min-h-0 flex-1 flex-col gap-1.5 bg-[var(--color-bg)]'

export const tripWorkspaceSectionClassName = 'min-w-0 bg-[var(--color-surface)]'

export const tripWorkspaceShellClassName = cn(tripWorkspaceSectionsStackClassName)
