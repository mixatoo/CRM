import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/app/layout/AppShell'
import {
  ActivityPage,
  CalendarPage,
  ClientWorkspacePage,
  ClientsPage,
  TravelersPage,
  TravelerProfilePage,
  DashboardPage,
  HomePage,
  InvoicesPage,
  ModuleRoadmapPage,
  PipelinePage,
  RemindersPage,
  ReportsPage,
  SearchPage,
  SettingsPage,
  PaymentTermsPage,
  LabelsPage,
  SupplierWorkspacePage,
  SuppliersPage,
  TransactionsPage,
  TripFlightOperationsPage,
  TripFlightServicePage,
  TripServicePage,
  TripWorkspacePage,
  TripsPage,
  UiTemplatesPage,
} from '@/app/lazy-pages'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { GuardedOutlet } from '@/features/auth/components/GuardedOutlet'
import { LoginPage } from '@/features/auth/pages/LoginPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        element: <GuardedOutlet />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'home', element: <HomePage /> },
          { path: 'trips', element: <TripsPage /> },
          { path: 'pipeline', element: <PipelinePage /> },
          { path: 'search', element: <SearchPage /> },
          { path: 'clients', element: <ClientsPage /> },
          { path: 'clients/:clientId', element: <Navigate to="profile" replace /> },
          { path: 'clients/:clientId/:tab', element: <ClientWorkspacePage /> },
          { path: 'travelers', element: <TravelersPage /> },
          { path: 'travelers/:travelerId', element: <TravelerProfilePage /> },
          { path: 'suppliers', element: <SuppliersPage /> },
          { path: 'suppliers/:supplierId', element: <Navigate to="overview" replace /> },
          { path: 'suppliers/:supplierId/:tab', element: <SupplierWorkspacePage /> },
          { path: 'transactions', element: <TransactionsPage /> },
          { path: 'invoices', element: <InvoicesPage /> },
          { path: 'reports', element: <ReportsPage /> },
          { path: 'reminders', element: <RemindersPage /> },
          { path: 'activity', element: <ActivityPage /> },
          { path: 'calendar', element: <CalendarPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'settings/payment-terms', element: <PaymentTermsPage /> },
          { path: 'settings/labels', element: <LabelsPage /> },
          { path: 'templates', element: <UiTemplatesPage /> },
          { path: 'modules/:moduleId', element: <ModuleRoadmapPage /> },
          { path: 'modules/transactions', element: <Navigate to="/transactions" replace /> },
          { path: 'modules/reports', element: <Navigate to="/reports" replace /> },
          { path: 'modules/reminders', element: <Navigate to="/reminders" replace /> },
          { path: 'trips/:tripId/services/:serviceId/flight', element: <TripFlightServicePage /> },
          { path: 'trips/:tripId/services/:serviceId/operations', element: <TripFlightOperationsPage /> },
          { path: 'trips/:tripId/services/:serviceId', element: <TripServicePage /> },
          { path: 'trips/:tripId', element: <Navigate to="dashboard" replace /> },
          { path: 'trips/:tripId/:tab', element: <TripWorkspacePage /> },
          { path: '*', element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
])
