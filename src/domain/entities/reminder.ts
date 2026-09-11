export type ReminderStatus = 'open' | 'done' | 'snoozed' | 'canceled'

export type ReminderPriority = 'low' | 'normal' | 'high'

export type ReminderCategory =
  | 'payment'
  | 'document'
  | 'supplier'
  | 'client'
  | 'operations'
  | 'other'

export interface Reminder {
  id: string
  reference: string
  title: string
  description?: string
  status: ReminderStatus
  priority: ReminderPriority
  category: ReminderCategory
  dueAt: string
  tripId?: string
  assigneeName?: string
  createdAt: string
  updatedAt: string
}

export const REMINDER_STATUSES: ReminderStatus[] = ['open', 'done', 'snoozed', 'canceled']

export const REMINDER_STATUS_LABELS: Record<ReminderStatus, string> = {
  open: 'Open',
  done: 'Done',
  snoozed: 'Snoozed',
  canceled: 'Canceled',
}

export const REMINDER_PRIORITIES: ReminderPriority[] = ['low', 'normal', 'high']

export const REMINDER_PRIORITY_LABELS: Record<ReminderPriority, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
}

export const REMINDER_CATEGORIES: ReminderCategory[] = [
  'payment',
  'document',
  'supplier',
  'client',
  'operations',
  'other',
]

export const REMINDER_CATEGORY_LABELS: Record<ReminderCategory, string> = {
  payment: 'Payment',
  document: 'Document',
  supplier: 'Supplier',
  client: 'Client',
  operations: 'Operations',
  other: 'Other',
}
