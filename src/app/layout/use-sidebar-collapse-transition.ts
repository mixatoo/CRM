import { useCallback, useEffect, useRef, useState } from 'react'

const ANIMATION_MS = 300

/** Tracks sidebar width animation for easing + will-change. */
export function useSidebarAnimating(docked: boolean) {
  const [isAnimating, setIsAnimating] = useState(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const pulse = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    setIsAnimating(true)
    timersRef.current.push(
      setTimeout(() => {
        setIsAnimating(false)
      }, ANIMATION_MS),
    )
  }, [])

  const isFirstRender = useRef(true)

  useEffect(() => () => timersRef.current.forEach(clearTimeout), [])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    pulse()
  }, [docked, pulse])

  return { isAnimating, pulse, animationMs: ANIMATION_MS }
}
