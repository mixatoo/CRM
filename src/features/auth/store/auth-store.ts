import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserRole } from '@/domain/entities'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  lastActivityAt: number | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  touchActivity: () => void
}

const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'admin@egyliere.com': { password: 'admin', user: { id: 'USR-001', name: 'Ibrahim Mahmoud', email: 'admin@egyliere.com', role: 'admin', initials: 'IM', isActive: true } },
  'ops@egyliere.com': { password: 'ops', user: { id: 'USR-002', name: 'Mohamed Kaoud', email: 'mohamed.kaoud@egyliere.com', role: 'operations', initials: 'MK', isActive: true } },
  'finance@egyliere.com': { password: 'finance', user: { id: 'USR-015', name: 'Tarek Samy', email: 'finance@egyliere.com', role: 'finance', initials: 'TS', isActive: true } },
  'sales@egyliere.com': { password: 'sales', user: { id: 'USR-003', name: 'Mostafa Hameed', email: 'mostafa.hameed@egyliere.com', role: 'sales', initials: 'MH', isActive: true } },
  'mgmt@egyliere.com': { password: 'mgmt', user: { id: 'USR-005', name: 'Safaa Saad', email: 'safaa.saad@egyliere.com', role: 'management', initials: 'SS', isActive: true } },
  'readonly@egyliere.com': { password: 'readonly', user: { id: 'USR-017', name: 'Read Only', email: 'readonly@egyliere.com', role: 'readonly', initials: 'RO', isActive: true } },
  'guest@egyliere.com': { password: 'guest', user: { id: 'USR-016', name: 'Guest User', email: 'guest@egyliere.com', role: 'guest', initials: 'GU', isActive: true } },
}

function syncUserFromDemoAccounts(user: User | null): User | null {
  if (!user?.email) return user
  return DEMO_USERS[user.email.toLowerCase()]?.user ?? user
}

export const DEMO_ACCOUNTS = Object.entries(DEMO_USERS).map(([email, { password, user }]) => ({
  email,
  password,
  role: user.role,
  name: user.name,
}))

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      lastActivityAt: null,
      login: async (email, password) => {
        const demo = DEMO_USERS[email.toLowerCase()]
        if (demo && demo.password === password) {
          set({ user: demo.user, isAuthenticated: true, lastActivityAt: Date.now() })
          return true
        }
        return false
      },
      logout: () => set({ user: null, isAuthenticated: false, lastActivityAt: null }),
      touchActivity: () => set({ lastActivityAt: Date.now() }),
    }),
    { name: 'egyliere-auth',
      merge: (persisted, current) => {
        const saved = persisted as Partial<AuthState>
        return {
          ...current,
          ...saved,
          user: syncUserFromDemoAccounts(saved.user ?? null),
        }
      },
    },
  ),
)

export function useCurrentRole(): UserRole {
  return useAuthStore((s) => s.user?.role ?? 'guest')
}
