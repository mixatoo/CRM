export const topBarShellClass =
  'relative sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md'

export const topBarRowClass = 'flex h-[var(--topbar-height)] min-w-0 items-center gap-2 px-2 sm:px-3 lg:px-4'

/** Middle zone — grows to fill space between brand and search/actions. */
export const topBarContextSlotClass =
  'hidden min-h-8 min-w-0 flex-1 items-stretch overflow-hidden md:flex'

export const topBarSearchSlotClass =
  'hidden min-w-0 shrink-0 md:block md:w-[min(28vw,16rem)] lg:w-[18rem] xl:w-[20rem]'

export const topBarRightClusterClass =
  'flex shrink-0 items-center gap-1.5 sm:gap-2'

export const topBarMenuItemClass =
  'flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-2 text-xs font-normal text-[var(--color-foreground)] outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-[var(--color-surface-muted)]'

export const topBarIconButtonClass =
  'relative h-8 w-8 shrink-0 rounded-[var(--radius-md)] text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-foreground)]'

export const topBarActionRailClass =
  'flex shrink-0 items-center gap-0.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-1 py-0.5 shadow-[var(--shadow-card)]'

export const topBarActionDividerClass = 'mx-0.5 hidden h-5 w-px shrink-0 bg-[var(--color-border)] sm:block'

/** Fixed-width close-all control at the end of the context slot. */
export const topBarContextActionsClass = 'flex w-8 shrink-0 items-center justify-center pr-0.5'
