import { lazy, type ComponentType } from 'react'

function lazyPage<T extends ComponentType<unknown>>(
  loader: () => Promise<Record<string, unknown>>,
  exportName: string,
) {
  return lazy(() => loader().then((module) => ({ default: module[exportName] as T })))
}

export const DashboardPage = lazyPage(
  () => import('@/features/dashboard/pages/DashboardPage'),
  'DashboardPage',
)

export const HomePage = lazyPage(() => import('@/features/home/pages/HomePage'), 'HomePage')

export const ModuleRoadmapPage = lazyPage(
  () => import('@/features/home/pages/ModuleRoadmapPage'),
  'ModuleRoadmapPage',
)

export const TripsPage = lazyPage(() => import('@/features/trips/pages/TripsPage'), 'TripsPage')

export const ClientsPage = lazyPage(() => import('@/features/clients/pages/ClientsPage'), 'ClientsPage')

export const SuppliersPage = lazyPage(
  () => import('@/features/suppliers/pages/SuppliersPage'),
  'SuppliersPage',
)

export const TransactionsPage = lazyPage(
  () => import('@/features/transactions/pages/TransactionsPage'),
  'TransactionsPage',
)

export const ReportsPage = lazyPage(() => import('@/features/reports/pages/ReportsPage'), 'ReportsPage')

export const RemindersPage = lazyPage(
  () => import('@/features/reminders/pages/RemindersPage'),
  'RemindersPage',
)

export const ActivityPage = lazyPage(() => import('@/features/activity/pages/ActivityPage'), 'ActivityPage')

export const CalendarPage = lazyPage(() => import('@/features/calendar/pages/CalendarPage'), 'CalendarPage')

export const PipelinePage = lazyPage(() => import('@/features/pipeline/pages/PipelinePage'), 'PipelinePage')

export const InvoicesPage = lazyPage(() => import('@/features/invoices/pages/InvoicesPage'), 'InvoicesPage')

export const SearchPage = lazyPage(() => import('@/features/search/pages/SearchPage'), 'SearchPage')

export const SettingsPage = lazyPage(() => import('@/features/settings/pages/SettingsPage'), 'SettingsPage')

export const PaymentTermsPage = lazyPage(
  () => import('@/features/payment-terms/pages/PaymentTermsPage'),
  'PaymentTermsPage',
)

export const LabelsPage = lazyPage(
  () => import('@/features/labels/pages/LabelsPage'),
  'LabelsPage',
)

export const UiTemplatesPage = lazyPage(
  () => import('@/features/ui-templates/pages/UiTemplatesPage'),
  'UiTemplatesPage',
)

export const TravelersPage = lazyPage(
  () => import('@/features/travelers/pages/TravelersPage'),
  'TravelersPage',
)

export const TravelerWorkspacePage = lazyPage(
  () => import('@/features/travelers/pages/TravelerWorkspacePage'),
  'TravelerWorkspacePage',
)

/** @deprecated Prefer TravelerWorkspacePage */
export const TravelerProfilePage = TravelerWorkspacePage

export const ClientWorkspacePage = lazyPage(
  () => import('@/features/clients/pages/ClientWorkspacePage'),
  'ClientWorkspacePage',
)

export const SupplierWorkspacePage = lazyPage(
  () => import('@/features/suppliers/pages/SupplierWorkspacePage'),
  'SupplierWorkspacePage',
)

export const TransfersPage = lazyPage(
  () => import('@/features/transfers/pages/TransfersPage'),
  'TransfersPage',
)

export const TransferWorkspacePage = lazyPage(
  () => import('@/features/transfers/pages/TransferWorkspacePage'),
  'TransferWorkspacePage',
)

export const TripWorkspacePage = lazyPage(
  () => import('@/features/trips/pages/TripWorkspacePage'),
  'TripWorkspacePage',
)

export const TripServicePage = lazyPage(
  () => import('@/features/trips/pages/TripServicePage'),
  'TripServicePage',
)

export const TripFlightServicePage = lazyPage(
  () => import('@/features/trips/pages/TripFlightServicePage'),
  'TripFlightServicePage',
)

export const TripFlightOperationsPage = lazyPage(
  () => import('@/features/trips/pages/TripFlightOperationsPage'),
  'TripFlightOperationsPage',
)
