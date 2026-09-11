import { Outlet, useLocation } from 'react-router-dom'
import { getRoutePermission } from '@/domain/policies/route-permissions'
import { canPerform } from '@/domain/policies/permissions'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { layout } from '@/design-system/tokens/layout'
import type { UserRole } from '@/domain/entities'
import { cn } from '@/shared/utils/cn'

export function GuardedOutlet() {
  const location = useLocation()
  const role = useAuthStore((s) => s.user?.role ?? 'guest') as UserRole
  const perm = getRoutePermission(location.pathname)

  if (perm && !canPerform(role, perm.resource, perm.action)) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16', layout.pageContent)}>
        <h2 className={layout.entityTitle}>Access denied</h2>
        <p className={cn('mt-1', layout.caption)}>You don&apos;t have permission to view this page.</p>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
      <Outlet />
    </div>
  )
}
