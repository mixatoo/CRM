/** Prevent Radix Dialog from closing when interacting with a portaled popover or dropdown. */
export function preventDialogDismissOnNestedOverlay(event: Event) {
  const target = event.target
  if (!(target instanceof Element)) return

  if (
    target.closest('[data-radix-popover-content]') ||
    target.closest('[data-radix-dropdown-menu-content]')
  ) {
    event.preventDefault()
  }
}
