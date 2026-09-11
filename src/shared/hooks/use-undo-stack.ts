import { useCallback, useRef, useState } from 'react'

const DEFAULT_MAX_DEPTH = 50

export function useUndoStack<T>(maxDepth = DEFAULT_MAX_DEPTH) {
  const stackRef = useRef<T[]>([])
  const [canUndo, setCanUndo] = useState(false)

  const push = useCallback(
    (value: T) => {
      stackRef.current.push(value)
      if (stackRef.current.length > maxDepth) {
        stackRef.current.shift()
      }
      setCanUndo(stackRef.current.length > 0)
    },
    [maxDepth],
  )

  const undo = useCallback((): T | null => {
    const value = stackRef.current.pop() ?? null
    setCanUndo(stackRef.current.length > 0)
    return value
  }, [])

  const clear = useCallback(() => {
    stackRef.current = []
    setCanUndo(false)
  }, [])

  return { push, undo, canUndo, clear }
}
