import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { ToastProvider } from '@/design-system/components/Toast'
import { db, isDatabaseSeeded } from '@/infrastructure/database/db'
import {
  ACTIVITY_SEED_VERSION,
  CLIENT_OPERATIONAL_SEED_VERSION,
  CLIENTS_DIRECTORY_VERSION,
  FINANCE_SEED_VERSION,
  INVOICE_SEED_VERSION,
  LABELS_DIRECTORY_VERSION,
  PAYMENT_TERMS_DIRECTORY_VERSION,
  REMINDERS_DIRECTORY_VERSION,
  SHOWCASE_CLIENT_SEED_VERSION,
  SUPPLIERS_DIRECTORY_VERSION,
  TRANSFERS_DIRECTORY_VERSION,
  TRIP_SERVICES_MOCK_VERSION,
  TRIPS_MOCK_VERSION,
  WARM_BOOTSTRAP_VERSION,
} from '@/infrastructure/database/bootstrap-versions'
import { useUiStore } from '@/shared/stores/ui-store'
import type { AppSettings } from '@/domain/entities'

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

function areSeedVersionsCurrent(settings: AppSettings | undefined): boolean {
  if (!settings) return false
  return (
    (settings.tripsMockVersion ?? 0) >= TRIPS_MOCK_VERSION &&
    (settings.tripServicesMockVersion ?? 0) >= TRIP_SERVICES_MOCK_VERSION &&
    (settings.clientsDirectoryVersion ?? 0) >= CLIENTS_DIRECTORY_VERSION &&
    (settings.clientOperationalSeedVersion ?? 0) >= CLIENT_OPERATIONAL_SEED_VERSION &&
    (settings.showcaseClientSeedVersion ?? 0) >= SHOWCASE_CLIENT_SEED_VERSION &&
    (settings.suppliersDirectoryVersion ?? 0) >= SUPPLIERS_DIRECTORY_VERSION &&
    (settings.transfersDirectoryVersion ?? 0) >= TRANSFERS_DIRECTORY_VERSION &&
    (settings.financeSeedVersion ?? 0) >= FINANCE_SEED_VERSION &&
    (settings.remindersDirectoryVersion ?? 0) >= REMINDERS_DIRECTORY_VERSION &&
    (settings.activitySeedVersion ?? 0) >= ACTIVITY_SEED_VERSION &&
    (settings.invoiceSeedVersion ?? 0) >= INVOICE_SEED_VERSION &&
    (settings.paymentTermsDirectoryVersion ?? 0) >= PAYMENT_TERMS_DIRECTORY_VERSION &&
    (settings.labelsDirectoryVersion ?? 0) >= LABELS_DIRECTORY_VERSION
  )
}

function isWarmBootstrapCurrent(settings: AppSettings | undefined): boolean {
  return (
    areSeedVersionsCurrent(settings) &&
    (settings?.warmBootstrapVersion ?? 0) >= WARM_BOOTSTRAP_VERSION
  )
}

async function markWarmBootstrapComplete() {
  const settings = await db.settings.get('SET-001')
  if (!settings) return
  if ((settings.warmBootstrapVersion ?? 0) >= WARM_BOOTSTRAP_VERSION) return
  await db.settings.update('SET-001', { warmBootstrapVersion: WARM_BOOTSTRAP_VERSION })
}

async function bootstrapDirectoryData() {
  const [
    { ensurePaymentTermsDirectory },
    { ensureLabelsDirectory },
    { ensureClientsDirectory },
    { ensureClientOperationalSeed },
    { ensureShowcaseClientSeed },
    { ensureTripServices },
    { ensureSuppliersDirectory },
    { ensureTransfersDirectory },
    { ensureFinanceSeed },
    { ensureRemindersDirectory },
    { ensureActivitySeed },
    { ensureInvoiceSeed },
  ] = await Promise.all([
    import('@/infrastructure/database/payment-term-seed'),
    import('@/infrastructure/database/label-seed'),
    import('@/infrastructure/database/client-seed'),
    import('@/infrastructure/database/client-operational-seed'),
    import('@/infrastructure/database/showcase-client-seed'),
    import('@/infrastructure/database/trip-service-seed'),
    import('@/infrastructure/database/supplier-seed'),
    import('@/infrastructure/database/transfer-seed'),
    import('@/infrastructure/database/finance-seed'),
    import('@/infrastructure/database/reminder-seed'),
    import('@/infrastructure/database/activity-seed'),
    import('@/infrastructure/database/invoice-seed'),
  ])

  await Promise.all([
    ensurePaymentTermsDirectory(),
    ensureLabelsDirectory(),
    ensureClientsDirectory(),
    ensureClientOperationalSeed(),
    ensureShowcaseClientSeed(),
    ensureTripServices(),
    ensureSuppliersDirectory(),
    ensureTransfersDirectory(),
    ensureFinanceSeed(),
    ensureRemindersDirectory(),
    ensureActivitySeed(),
    ensureInvoiceSeed(),
  ])
}

async function runWarmMigrations() {
  const {
    seedTripsIfEmpty,
    ensureDemoTrips,
    ensureTripsMockRefresh,
    ensureTripClientNames,
    ensureTripDemoAmounts,
    ensureTripFinancialFields,
    ensureAdminUserProfile,
    ensureKarimHassanRenamed,
    ensureAccountManagers,
  } = await import('@/infrastructure/database/seed')

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
  await markWarmBootstrapComplete()
}

async function initDatabaseOnce() {
  const seeded = await isDatabaseSeeded()
  if (!seeded) {
    const { seedDatabase } = await import('@/infrastructure/database/seed')
    await seedDatabase()
    await bootstrapDirectoryData()
    await markWarmBootstrapComplete()
    return
  }

  const settings = await db.settings.get('SET-001')
  if (isWarmBootstrapCurrent(settings)) {
    return
  }

  // Seed versions already current from prior boots — stamp warm flag and skip heavy work.
  if (areSeedVersionsCurrent(settings)) {
    await markWarmBootstrapComplete()
    return
  }

  await runWarmMigrations()
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
