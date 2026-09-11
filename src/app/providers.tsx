import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { ToastProvider } from '@/design-system/components/Toast'
import { isDatabaseSeeded } from '@/infrastructure/database/db'
import { seedDatabase, seedTripsIfEmpty, ensureDemoTrips, ensureTripsMockRefresh, ensureTripClientNames, ensureTripDemoAmounts, ensureTripFinancialFields, ensureAdminUserProfile, ensureKarimHassanRenamed, ensureAccountManagers } from '@/infrastructure/database/seed'
import { ensureClientsDirectory } from '@/infrastructure/database/client-seed'
import { ensureClientOperationalSeed } from '@/infrastructure/database/client-operational-seed'
import { ensureShowcaseClientSeed } from '@/infrastructure/database/showcase-client-seed'
import { ensureSuppliersDirectory } from '@/infrastructure/database/supplier-seed'
import { ensureFinanceSeed } from '@/infrastructure/database/finance-seed'
import { ensureRemindersDirectory } from '@/infrastructure/database/reminder-seed'
import { ensureActivitySeed } from '@/infrastructure/database/activity-seed'
import { ensureInvoiceSeed } from '@/infrastructure/database/invoice-seed'
import { ensurePaymentTermsDirectory } from '@/infrastructure/database/payment-term-seed'
import { ensureLabelsDirectory } from '@/infrastructure/database/label-seed'
import { ensureTripServices } from '@/infrastructure/database/trip-service-seed'
import { useUiStore } from '@/shared/stores/ui-store'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const DatabaseReadyContext = createContext(false)

export function useDatabaseReady() {
  return useContext(DatabaseReadyContext)
}

async function bootstrapDirectoryData() {
  await Promise.all([
    ensurePaymentTermsDirectory(),
    ensureLabelsDirectory(),
    ensureClientsDirectory(),
    ensureClientOperationalSeed(),
    ensureShowcaseClientSeed(),
    ensureTripServices(),
    ensureSuppliersDirectory(),
    ensureFinanceSeed(),
    ensureRemindersDirectory(),
    ensureActivitySeed(),
    ensureInvoiceSeed(),
  ])
}

async function initDatabaseOnce() {
  const seeded = await isDatabaseSeeded()
  if (!seeded) {
    await seedDatabase()
    await bootstrapDirectoryData()
    return
  }

  await ensureTripsMockRefresh()
  await seedTripsIfEmpty()
  await Promise.all([
    ensureDemoTrips(),
    ensureTripClientNames(),
    ensureTripDemoAmounts(),
    ensureTripFinancialFields(),
    ensureAdminUserProfile(),
    ensureKarimHassanRenamed(),
    ensureAccountManagers(),
  ])
  await bootstrapDirectoryData()
}

let initDatabasePromise: Promise<void> | null = null

async function initDatabase() {
  if (!initDatabasePromise) {
    initDatabasePromise = initDatabaseOnce().catch((error) => {
      initDatabasePromise = null
      throw error
    })
  }
  return initDatabasePromise
}

export function AppProviders({ children }: { children: ReactNode }) {
  const darkMode = useUiStore((s) => s.darkMode)
  const [dbReady, setDbReady] = useState(false)

  useEffect(() => {
    let active = true
    void initDatabase().finally(() => {
      if (active) setDbReady(true)
    })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  return (
    <QueryClientProvider client={queryClient}>
      <DatabaseReadyContext.Provider value={dbReady}>
        <Tooltip.Provider delayDuration={200} skipDelayDuration={0}>
          <ToastProvider>{children}</ToastProvider>
        </Tooltip.Provider>
      </DatabaseReadyContext.Provider>
    </QueryClientProvider>
  )
}

export { queryClient }
