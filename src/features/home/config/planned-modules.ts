import type { LucideIcon } from 'lucide-react'
import {
  Users,
  Building2,
  Calendar,
  ArrowLeftRight,
  FileText,
} from 'lucide-react'
import type { Resource } from '@/domain/policies/permissions'

export interface PlannedModuleConfig {
  id: string
  title: string
  description: string
  icon: LucideIcon
  resource: Resource
  highlights: string[]
  relatedLinks: Array<{ label: string; to: string }>
}

export const PLANNED_MODULES: Record<string, PlannedModuleConfig> = {
  clients: {
    id: 'clients',
    title: 'Clients',
    description:
      'Global client directory with contacts, billing profiles, travel preferences, and trip history across your organization.',
    icon: Users,
    resource: 'passenger',
    highlights: [
      'Unified contact records linked to trips and invoices',
      'Billing and communication preferences per account',
      'Search, filters, and export for sales and finance teams',
    ],
    relatedLinks: [
      { label: 'Trip clients tab', to: '/trips' },
      { label: 'UI templates', to: '/templates' },
    ],
  },
  suppliers: {
    id: 'suppliers',
    title: 'Suppliers',
    description:
      'Supplier and partner directory for hotels, DMCs, airlines, and activity operators with contracts and payment terms.',
    icon: Building2,
    resource: 'directory',
    highlights: [
      'Supplier profiles with default currencies and contacts',
      'Service linkage from trip lines',
      'Payables visibility alongside trip finance',
    ],
    relatedLinks: [
      { label: 'Trip services', to: '/trips' },
      { label: 'Transactions (planned)', to: '/transactions' },
    ],
  },
  reminders: {
    id: 'reminders',
    title: 'Reminders',
    description:
      'Operational reminders for follow-ups, document deadlines, payment due dates, and supplier confirmations.',
    icon: Calendar,
    resource: 'settings',
    highlights: [
      'Trip-level and global reminder queues',
      'Due date alerts tied to invoices and services',
      'Assignable tasks for operations staff',
    ],
    relatedLinks: [
      { label: 'Trip tasks', to: '/trips' },
      { label: 'Home', to: '/' },
    ],
  },
  transactions: {
    id: 'transactions',
    title: 'Transactions',
    description:
      'Ledger of client receipts, supplier payments, and reconciliations across all trips.',
    icon: ArrowLeftRight,
    resource: 'payment',
    highlights: [
      'Cross-trip payment register',
      'Allocation to invoices and supplier lines',
      'Export for accounting systems',
    ],
    relatedLinks: [
      { label: 'Trip payments', to: '/trips' },
      { label: 'Trip revenue', to: '/trips' },
    ],
  },
  reports: {
    id: 'reports',
    title: 'Reports',
    description:
      'Operational and financial reports: margin analysis, pipeline, collections, supplier exposure, and team performance.',
    icon: FileText,
    resource: 'report',
    highlights: [
      'Trip margin and revenue dashboards',
      'Aging receivables and payables',
      'Exportable summaries for management review',
    ],
    relatedLinks: [
      { label: 'Trip revenue tab', to: '/trips' },
      { label: 'UI templates', to: '/templates' },
    ],
  },
}
