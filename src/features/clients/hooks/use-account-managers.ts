import { useQuery } from '@tanstack/react-query'
import { appContainer } from '@/app/container'
import type { User, UserRole } from '@/domain/entities'

const ACCOUNT_MANAGER_ROLES = new Set<UserRole>(['admin', 'sales', 'operations', 'management'])

const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  operations: 'Operations',
  finance: 'Finance',
  sales: 'Sales',
  management: 'Management',
  readonly: 'Read-only',
  guest: 'Guest',
}

function sortUsers(users: User[]): User[] {
  return [...users].sort((left, right) => left.name.localeCompare(right.name))
}

export function useAccountManagers() {
  return useQuery({
    queryKey: ['users', 'account-managers'],
    queryFn: async () => {
      const users = await appContainer.uow.users.findAll()
      return sortUsers(
        users.filter((user) => user.isActive && user.role !== 'guest' && ACCOUNT_MANAGER_ROLES.has(user.role)),
      )
    },
  })
}

export function useUser(userId?: string) {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => (userId ? appContainer.uow.users.findById(userId) : Promise.resolve(null)),
    enabled: Boolean(userId),
  })
}

export function formatUserRoleLabel(role: UserRole): string {
  return USER_ROLE_LABELS[role]
}

export function accountManagersToPicklistOptions(users: User[]) {
  return users.map((user) => ({
    value: user.id,
    label: user.name,
  }))
}
