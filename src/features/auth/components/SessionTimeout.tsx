import { useEffect, useCallback, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useQuery } from '@tanstack/react-query'
import { appContainer } from '@/app/container'

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll'] as const
const DEFAULT_TIMEOUT_MINUTES = 60

export function SessionTimeout() {
  const navigate = useNavigate()
  const location = useLocation()
  const locationRef = useRef(location)
  locationRef.current = location
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const logout = useAuthStore((s) => s.logout)
  const touchActivity = useAuthStore((s) => s.touchActivity)

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const all = await appContainer.uow.settings.findAll()
      return all[0] ?? null
    },
    enabled: isAuthenticated,
  })

  const timeoutMs = (settings?.sessionTimeoutMinutes ?? DEFAULT_TIMEOUT_MINUTES) * 60_000

  const checkTimeout = useCallback(() => {
    const last = useAuthStore.getState().lastActivityAt
    if (!last) return
    if (Date.now() - last >= timeoutMs) {
      logout()
      navigate('/login', {
        replace: true,
        state: { reason: 'session_timeout', from: locationRef.current },
      })
    }
  }, [timeoutMs, logout, navigate])

  useEffect(() => {
    if (!isAuthenticated) return

    touchActivity()

    const onActivity = () => touchActivity()
    for (const ev of ACTIVITY_EVENTS) {
      window.addEventListener(ev, onActivity, { passive: true })
    }

    const interval = window.setInterval(checkTimeout, 30_000)

    return () => {
      for (const ev of ACTIVITY_EVENTS) {
        window.removeEventListener(ev, onActivity)
      }
      window.clearInterval(interval)
    }
  }, [isAuthenticated, touchActivity, checkTimeout])

  return null
}
