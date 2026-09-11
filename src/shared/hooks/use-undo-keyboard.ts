import { useEffect } from 'react'

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true

  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true

  return Boolean(target.closest('[contenteditable="true"]'))
}

export function useUndoKeyboard({
  enabled,
  canUndo,
  onUndo,
}: {
  enabled: boolean
  canUndo: boolean
  onUndo: () => void
}) {
  useEffect(() => {
    if (!enabled) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (!canUndo) return
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'z' || event.shiftKey) return
      if (isEditableTarget(event.target)) return

      event.preventDefault()
      onUndo()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [canUndo, enabled, onUndo])
}
