import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useUndoStack } from '@/shared/hooks/use-undo-stack'

describe('useUndoStack', () => {
  it('pushes and undoes snapshots in reverse order', () => {
    const { result } = renderHook(() => useUndoStack<string>())

    act(() => {
      result.current.push('first')
      result.current.push('second')
    })

    expect(result.current.canUndo).toBe(true)

    let restored: string | null = null
    act(() => {
      restored = result.current.undo()
    })

    expect(restored).toBe('second')
    expect(result.current.canUndo).toBe(true)

    act(() => {
      restored = result.current.undo()
    })

    expect(restored).toBe('first')
    expect(result.current.canUndo).toBe(false)
  })

  it('clears the stack', () => {
    const { result } = renderHook(() => useUndoStack<number>())

    act(() => {
      result.current.push(1)
      result.current.clear()
    })

    expect(result.current.canUndo).toBe(false)
    expect(result.current.undo()).toBeNull()
  })
})
