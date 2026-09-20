/** Toolbar row — title chip anchors to the same corner on list + workspace pages. */
export const clientsToolbarRowClassName =
  'flex flex-col gap-2 border-b border-[var(--color-border)] px-2 py-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 sm:px-4 sm:py-2.5'

/** Title chip slot — identical on list filters bar + workspace nav (no flex growth). */
export const clientsToolbarTitleSlotClassName = 'flex min-w-0 shrink-0 items-center gap-2'

/** Matches {@link ClientsPageTitle} and toolbar control height (h-8). */
export const clientsToolbarChipHeightClassName = 'h-8'

/** Workspace meta — fills remaining toolbar width beside the anchored title chip. */
export const clientsToolbarWorkspaceMetaSlotClassName = 'flex min-w-0 flex-1 items-center'

/** Workspace meta grid — identity · labels · badges. Compact 2-col on phone, 3-col from sm. */
export const clientWorkspaceToolbarMetaGridClassName =
  'grid min-w-0 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1.5 sm:h-8 sm:grid-cols-[minmax(0,30fr)_minmax(0,25fr)_minmax(0,25fr)] sm:gap-0 sm:divide-x sm:divide-y-0 divide-[var(--color-border)]'

export const clientWorkspaceToolbarCellClassName =
  'flex min-h-0 min-w-0 items-center overflow-hidden sm:h-8 sm:px-2'

/** Labels column — keep manage button border visible (no overflow clip). Hidden on phone. */
export const clientWorkspaceToolbarLabelsCellClassName =
  'hidden min-w-0 items-center sm:flex sm:h-8 sm:px-2'

export const clientWorkspaceToolbarIdentityCellClassName =
  'min-w-0 flex-col justify-center gap-px py-0'

export const clientWorkspaceToolbarBadgesCellClassName =
  'grid min-w-0 grid-cols-3 items-center gap-1'

export const clientsToolbarActionsSlotClassName =
  'flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1.5 sm:ml-auto sm:gap-2'
